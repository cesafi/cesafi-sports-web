# Bulk Match Import via CSV — Design

**Date:** 2026-10-12
**Status:** Approved in brainstorming, pending written-spec review
**Route:** `/admin/matches`

## 1. Goal

Let administrators create many matches at once by uploading a CSV, as an **addition** to the
existing one-at-a-time "Add Match" flow. Both paths must work independently. The manual flow
(`MatchModal`, `createMatchWithParticipants`, `MatchService.insert*`, `createMatchSchema`) is
reused, never modified.

Success = an admin selects a league stage, uploads the schedule CSV (e.g. the generated
`college_matches.csv`), and either every row is created in one transaction, or nothing is
created and every problem is listed per row.

## 2. Decisions (from brainstorming)

| Topic | Decision |
|---|---|
| CSV format | Existing schedule format: `Match ID, Match Participants, Match Details, Match Format, Scheduled Date, Start Time, Venue` |
| Target stage | The league stage currently selected on the page; one file per stage |
| Team resolution | School abbreviation, among the stage's active teams |
| Failure policy | All-or-nothing; validate every row first, insert in one DB transaction |
| Timezone | Date + time are Asia/Manila (UTC+8), stored as UTC |
| Duplicate definition | Same two teams (either order) + same scheduled date/time + same stage; repeated Match ID in file |
| Name / description | Auto-generated exactly as manual creation (`generateMatchName`, `generateMatchDescription`) |
| Match ID / Match Details | Required and validated; used for error reporting only; not stored |
| Write path | Drizzle transaction (`BaseService.getDrizzle()`), explicit admin check in the server action |
| Access | `admin` role only; button shown only when `userRole === 'admin'` |
| Live verification | User signs in as admin in the browser pane; import a small CSV into a user-chosen test stage; delete only the created matches afterwards |

## 3. Context (current codebase)

- Architecture: UI → hooks (React Query) → server actions → services → Supabase/Drizzle.
- Admin page renders `MatchesTable userRole="admin"`; adding a match requires a selected stage.
- Server actions currently have no auth checks (only route middleware). `AuthService.checkAuth(roles)` exists.
- No unique constraints on `matches`; duplicates must be detected in code.
- Schedule conflict rules live in `src/lib/utils/match-schedule-conflicts.ts` (same venue or shared
  team overlapping; 30-minute default length when `end_at` is null).
- Stage teams: `SchoolsTeamService.getTeamsForStage(stageId)` — active `schools_teams` for the
  stage's `sport_category_id` and `season_id`, joined with `school.abbreviation`.
- Supabase JS cannot run multi-statement transactions; Drizzle (`postgres-js`, `DATABASE_URL`) can.
  Drizzle bypasses RLS, so the action must enforce the admin role itself.
- No CSV library is installed.

## 4. Architecture

### New files

| Layer | File | Responsibility |
|---|---|---|
| Util | `src/lib/utils/csv.ts` | `parseCsv(text): string[][]` (RFC 4180: quoted fields, `""` escapes, CRLF/LF, BOM; throws on unterminated quote) and `toCsv(rows)` for the template |
| Validation | `src/lib/validations/match-import.ts` | Header constants, Zod row schema, action input schema, Manila→UTC conversion |
| Types | `src/lib/types/match-import.ts` | `MatchImportRowError`, `MatchImportResult`, `MatchImportResponse` |
| Service | `src/services/match-import.ts` | `MatchImportService.importFromCsv(stageId, csvText)` plus exported pure helpers for unit tests |
| Hook | `src/hooks/use-match-import.ts` | File state, client-side file checks, `useMutation` around the action, result/error state, query invalidation |
| UI | `src/components/shared/matches/match-import-modal.tsx` | Import modal |

### Additive edits

- `src/actions/match-import.ts` (new file) — `importMatchesFromCsv(stageId: unknown, csvText: unknown)`.
  Kept out of `src/actions/matches.ts` because that file is `// @ts-nocheck`.
- `src/components/shared/matches/matches-table.tsx` — admin-only button + modal.
- `src/components/shared/matches/index.ts` — export the modal.
- `src/components/table/data-table.tsx`, `src/components/table/table-search-filters.tsx`,
  `src/lib/types/table.ts` — optional `secondaryButtons?: { label; onClick; icon? }[]`,
  rendered as outline buttons left of `addButton`. Tables that don't pass it are unchanged.

### Data flow

1. Modal → hook reads `File` as text → `importMatchesFromCsv(selectedStageId, text)`.
2. Action: `AuthService.checkAuth(['admin'])`; if not authorized → `{ success: false, error }`
   without calling the service. Validate input with Zod (positive integer stage ID, string ≤ 1 MB).
3. Service validation phase (no writes):
   1. Parse CSV; check headers; check field counts.
   2. Zod-validate each row.
   3. Load stage (with sport category, sport name) — error if missing or lacking category/season.
   4. Load stage teams; resolve each abbreviation to exactly one team.
   5. Convert date + time (Asia/Manila) to UTC ISO; build `MatchInsert` with generated name and
      description, `status: 'upcoming'`, `start_at`/`end_at` null; run it through `createMatchSchema`.
   6. Duplicate checks (in-file and against DB in this stage).
   7. Schedule-conflict checks (against DB across all stages, and between file rows).
4. Any errors → return all row errors; insert nothing.
5. Write phase: one `db.transaction` inserting all `matches` rows (returning ids) and their
   `match_participants` (2 per match). Any throw rolls back everything.
6. Action revalidates via `RevalidationHelper.revalidateMatches()` on success.
7. Hook invalidates match queries; modal shows success summary.

## 5. CSV contract

### File

- `.csv`, ≤ 1 MB, 1–500 data rows. Fully blank lines are ignored.
- Header row must contain exactly these columns (any order, exact names after trimming):
  `Match ID`, `Match Participants`, `Match Details`, `Match Format`, `Scheduled Date`, `Start Time`, `Venue`.
  Missing or unknown columns → file-level error.
- A data row whose field count differs from the header → row error.

### Row rules

Row numbers are spreadsheet line numbers (header = row 1). Every error carries
`{ row, matchId?, field?, message }`.

| Column | Rule |
|---|---|
| Match ID | Required, trimmed, ≤ 100 chars, unique within the file |
| Match Participants | `/^(.+?)\s+vs\.?\s+(.+)$/i`; exactly two non-empty abbreviations; must differ |
| Match Details | Required, non-empty (not stored) |
| Match Format | `BO1`/`BO3`/`BO5`/`BO7`, case-insensitive → `best_of` 1/3/5/7 |
| Scheduled Date | `YYYY-MM-DD`, must be a real calendar date |
| Start Time | `h:mm AM` / `h:mm PM`, hour 1–12, minutes 00–59; no other formats |
| Venue | Required, trimmed, ≤ 255 chars, stored as written |

Values are trimmed of surrounding whitespace; nothing else is altered or inferred.

### Stage rules

- Each abbreviation must match **exactly one** active team for the stage (exact, case-sensitive
  comparison with `schools.abbreviation`). Unknown → error listing valid abbreviations.
  More than one active team for that school in the stage → "ambiguous" error.
- Past dates are allowed (consistent with the manual form).

### Duplicates and conflicts

- In-file duplicate: same unordered team pair + same UTC `scheduled_at` → error on the later
  row: "Duplicate of row N".
- DB duplicate: existing match in the selected stage with the same `scheduled_at` and the same
  team pair → error naming the existing match.
- Conflicts: `findMatchScheduleConflicts` against DB matches in the file's time window (with
  the same 24h lookback as `MatchService`), and between file rows; message uses
  `formatMatchScheduleConflicts` semantics.

### Known limitation

A conflicting match created by someone else between the validation phase and the transaction
is not detected. Manual creation has the same window.

## 6. UI

### Toolbar

`[ ⬆ Import Bulk Matches ] [ + Add Match ]` — import button is outline style, admin only. With
no stage selected it shows the same toast as Add Match.

### Modal (`ModalLayout`, existing Card/Button/Input/Alert/Badge/ScrollArea)

1. **Target stage** card (sport · division level · competition stage).
2. **CSV format** card: the 7 columns with one-line rules, timezone note, and a
   **Download template** button producing `match-import-template.csv` (header + 2 example rows).
3. **File input** (`accept=".csv"`): shows name and size; client-side rejection of non-`.csv`
   and > 1 MB files (server re-checks).
4. **Footer**: Cancel / Import. Import disabled until a file is selected; spinner + "Importing…"
   while running; modal cannot be closed mid-import.

### Result states

- **Validation failed:** destructive alert "No matches were imported. Fix N errors and try
  again." + scrollable table (Row · Match ID · Column · Problem). File stays selected.
- **Server/auth error:** destructive alert with message.
- **Success:** success alert "Imported N matches into <stage>", success toast, table refreshes,
  footer becomes **Done**.

Re-opening the modal resets its state.

## 7. Error handling

- Action and service always return `ServiceResponse`-shaped results; never throw to the client.
- Validation failures: `{ success: false, error: 'Validation failed', rowErrors: MatchImportRowError[] }`.
- DB errors during the transaction: caught, formatted via `BaseService.formatError`, transaction
  rolled back, `{ success: false, error }`.
- Unauthorized: `{ success: false, error: 'You do not have permission to import matches.' }`.

## 8. Testing

### Jest (DB mocked, following `src/services/matches.test.ts`)

- `src/lib/utils/csv.test.ts` — quoting, escapes, CRLF/LF, BOM, blank lines, unterminated quote.
- `src/lib/validations/match-import.test.ts` — each column rule, header checks, Manila→UTC
  (`3:30 PM` → `07:30Z`, `12:30 PM`, `12:xx AM`).
- `src/services/match-import.test.ts` — valid import (N matches, 2N participants, one
  transaction, generated name/description); unknown/ambiguous/same team; in-file and DB
  duplicates; DB and in-file conflicts; too many rows; malformed CSV; DB error mid-transaction.
- `src/actions/match-import.test.ts` — tests `importMatchesFromCsv` from `src/actions/match-import.ts`:
  unauthenticated and non-admin rejected without calling the service; invalid input rejected.

### Regression

- Existing `matches.test.ts` and `match-schedule-conflicts.test.ts` pass unchanged.
- Manual-flow files are not modified.

### Project checks

`npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Fix issues introduced by this
change; report pre-existing ones.

### Live check (browser pane)

User signs in as admin. Import a 2–3 row CSV into a user-chosen test stage; confirm rows in the
table; exercise an invalid file and a re-upload (duplicates); confirm Add Match still creates a
match; delete only the matches created during the check.

## 9. Out of scope

- Updating existing matches from CSV, storing external Match IDs, multi-stage files.
- League-operator access to bulk import.
- Importing scores, games, `start_at`/`end_at`, or statuses other than `upcoming`.
