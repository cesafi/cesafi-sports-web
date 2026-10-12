# Bulk Match Import via CSV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-only "Import Bulk Matches" CSV import to `/admin/matches` that creates all rows in one transaction or none, alongside the unchanged manual "Add Match" flow.

**Architecture:** Pure CSV parser and Zod row validation feed a `MatchImportService` that resolves teams for the selected stage, checks duplicates and schedule conflicts, then inserts matches and participants in one Drizzle transaction. A type-checked server action enforces the `admin` role. A React Query hook and a `ModalLayout` modal drive the UI, launched from a new optional secondary toolbar button on `DataTable`.

**Tech Stack:** Next.js 16 server actions, TypeScript, Zod v4, Supabase JS (reads), Drizzle ORM + postgres-js (transactional writes), TanStack Query v5, shadcn/ui, Jest 30 + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-12-bulk-match-import-design.md`

## Global Constraints

- Do not modify `MatchModal`, `createMatch`/`createMatchWithParticipants`, `MatchService`, `createMatchSchema`, or `src/lib/utils/match-schedule-conflicts.ts`; reuse them.
- CSV columns, exact names: `Match ID`, `Match Participants`, `Match Details`, `Match Format`, `Scheduled Date`, `Start Time`, `Venue`.
- Limits: file ≤ 1 MB (`1024 * 1024`), 1–500 data rows.
- Formats: `BO1|BO3|BO5|BO7` (case-insensitive) → `best_of`; `YYYY-MM-DD`; `h:mm AM|PM` (hour 1–12); all times are Asia/Manila (UTC+8, no DST), stored as UTC ISO.
- Teams: exact, case-sensitive match on `schools.abbreviation` among `SchoolsTeamService.getTeamsForStage(stageId)`; exactly one team per abbreviation.
- Duplicate = same unordered team pair + same UTC `scheduled_at` (+ same stage for DB); repeated `Match ID` in file.
- Name/description from `generateMatchName` / `generateMatchDescription`; `status: 'upcoming'`; `start_at`/`end_at` null. Match ID and Match Details are not stored.
- Only `admin` may import; the button renders only for `userRole === 'admin'`.
- Row numbers are spreadsheet lines: header = row 1.
- No new npm dependencies.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage only the files of the task; `src/components/about-us/about-us-faq.tsx` is the user's staged change and must not be committed — always commit with `git commit -m "…" -- <paths>`.

## Review Focus

1. **Excel-saved CSVs** (UTF-8 BOM, CRLF, trailing rows like `,,,,,,`): must import as if clean, with all-empty rows ignored — test in Task 3.
2. **Excel-reformatted dates/times** (`10/17/2026`, `15:30`): must be rejected with a message that shows the expected format and an example — test in Task 2.
3. **Morning Manila times crossing the UTC date** (`7:30 AM` → previous day `23:30Z`) and `12:xx AM/PM`: must convert exactly — test in Task 2.
4. **Abbreviation not in the stage** (e.g. `SHS-ADC` stored differently): error must list the stage's valid abbreviations — test in Task 4.
5. **Re-uploading a file that already imported**: every row must be rejected as a DB duplicate and nothing inserted — test in Task 4.

---

### Task 1: CSV parser utility

**Files:**
- Create: `src/lib/utils/csv.ts`
- Test: `src/lib/utils/csv.test.ts`

**Interfaces:**
- Produces: `parseCsv(text: string): string[][]` (throws `Error('Unterminated quoted field starting on line N')`), `toCsv(rows: string[][]): string` (CRLF line endings, quotes a field only if it contains `,`, `"`, CR or LF; `"` doubled).

- [ ] **Step 1: Record baseline.** Run `npx jest 2>&1 | tail -5` and note the pass/fail counts so pre-existing failures are not attributed to this work.

- [ ] **Step 2: Write failing tests** in `csv.test.ts`:

```ts
expect(parseCsv('a,b\r\n1,2\r\n')).toEqual([['a', 'b'], ['1', '2']]);
expect(parseCsv('a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
expect(parseCsv('﻿a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
expect(parseCsv('x\n"Cebu, Coliseum","say ""hi"""')).toEqual([['x'], ['Cebu, Coliseum', 'say "hi"']]);
expect(parseCsv('x\n"line1\nline2"')).toEqual([['x'], ['line1\nline2']]);
expect(parseCsv('a,,c')).toEqual([['a', '', 'c']]);
expect(() => parseCsv('a\n"open')).toThrow('Unterminated quoted field starting on line 2');
expect(toCsv([['a', 'b,c'], ['say "hi"', '']])).toBe('a,"b,c"\r\n"say ""hi""",\r\n');
expect(parseCsv(toCsv([['A vs. B', '3:30 PM']]))).toEqual([['A vs. B', '3:30 PM']]);
```

Also: `parseCsv('')` → `[]`; a final line break does not produce an extra row.

- [ ] **Step 3: Run** `npx jest src/lib/utils/csv.test.ts` — Expected: FAIL (module not found).

- [ ] **Step 4: Implement** `parseCsv` as a single-pass character state machine (in-quotes flag, `""` → `"`, `\r\n`/`\n` end a record outside quotes, strip one leading BOM, track line number of an opening quote) and `toCsv`.

- [ ] **Step 5: Run** `npx jest src/lib/utils/csv.test.ts` — Expected: PASS.

- [ ] **Step 6: Commit** `git commit -m "feat(matches): add CSV parse/serialize utility" -- src/lib/utils/csv.ts src/lib/utils/csv.test.ts` (after `git add` of both).

---

### Task 2: Import types and row validation

**Files:**
- Create: `src/lib/types/match-import.ts`, `src/lib/validations/match-import.ts`
- Test: `src/lib/validations/match-import.test.ts`

**Interfaces:**
- Consumes: `toCsv` (Task 1).
- Produces (types file):

```ts
export const MATCH_IMPORT_COLUMNS = ['Match ID', 'Match Participants', 'Match Details', 'Match Format', 'Scheduled Date', 'Start Time', 'Venue'] as const;
export type MatchImportColumn = (typeof MATCH_IMPORT_COLUMNS)[number];
export interface MatchImportRowError { row: number; matchId?: string; field?: MatchImportColumn; message: string }
export interface ParsedMatchImportRow { row: number; matchId: string; teamA: string; teamB: string; bestOf: 1 | 3 | 5 | 7; scheduledAt: string /* UTC ISO */; venue: string }
export interface MatchImportSummary { created: number; matches: { id: number; name: string; scheduled_at: string }[] }
export type MatchImportResponse =
  | { success: true; data: MatchImportSummary }
  | { success: false; error: string; rowErrors?: MatchImportRowError[] };
```

- Produces (validations file): `MATCH_IMPORT_MAX_BYTES = 1024 * 1024`, `MATCH_IMPORT_MAX_ROWS = 500`, `manilaToUtcIso(date: string, time: string): string`, `matchImportRowSchema` (Zod object keyed by the 7 column names, string values; output `Omit<ParsedMatchImportRow, 'row'>`), `importMatchesInputSchema` (`{ stageId: z.number().int().positive(), csvText: z.string().min(1).max(MATCH_IMPORT_MAX_BYTES) }`), `validateImportFile(file: { name: string; size: number }): string | null`, `buildMatchImportTemplate(): string`.

- [ ] **Step 1: Write failing tests:**

```ts
expect(manilaToUtcIso('2026-10-17', '3:30 PM')).toBe('2026-10-17T07:30:00.000Z');
expect(manilaToUtcIso('2026-10-17', '12:30 PM')).toBe('2026-10-17T04:30:00.000Z');
expect(manilaToUtcIso('2026-10-17', '12:15 AM')).toBe('2026-10-16T16:15:00.000Z');
expect(manilaToUtcIso('2026-10-17', '7:30 AM')).toBe('2026-10-16T23:30:00.000Z');

const valid = { 'Match ID': 'CBL26-COL-001', 'Match Participants': 'UCLM vs. UPC', 'Match Details': 'College - Elimination', 'Match Format': 'bo1', 'Scheduled Date': '2026-10-17', 'Start Time': '3:30 PM', 'Venue': ' Cebu Coliseum ' };
expect(matchImportRowSchema.parse(valid)).toEqual({ matchId: 'CBL26-COL-001', teamA: 'UCLM', teamB: 'UPC', bestOf: 1, scheduledAt: '2026-10-17T07:30:00.000Z', venue: 'Cebu Coliseum' });
expect(matchImportRowSchema.parse({ ...valid, 'Match Participants': 'UCLM vs UPC' }).teamB).toBe('UPC');
```

Rejections — one `it` each, asserting `safeParse(...).success === false` and that the issue path is the named column and the message contains the quoted text:
- `Match Participants`: `'UCLM'`, `'UCLM vs. UCLM'` → `"must be two different teams"`; `'A vs. B vs. C'` → `"exactly two teams"`.
- `Match Format`: `'BO2'`, `'Best of 1'` → `"BO1, BO3, BO5 or BO7"`.
- `Scheduled Date`: `'10/17/2026'` → `"YYYY-MM-DD (e.g. 2026-10-17)"`; `'2026-02-30'` → `"not a real date"`.
- `Start Time`: `'15:30'`, `'13:00 PM'`, `'3:5 PM'` → `"h:mm AM/PM (e.g. 3:30 PM)"`.
- `Match ID`, `Match Details`, `Venue` empty/whitespace → `"is required"`; `Match ID` > 100 chars; `Venue` > 255 chars.
- `validateImportFile({ name: 'a.xlsx', size: 10 })` → `'Please choose a .csv file.'`; `{ name: 'a.CSV', size: MATCH_IMPORT_MAX_BYTES + 1 }` → `'File is larger than 1 MB.'`; `{ name: 'a.csv', size: 10 }` → `null`.
- `parseCsv(buildMatchImportTemplate())[0]` equals `[...MATCH_IMPORT_COLUMNS]` and has exactly 2 data rows that each pass `matchImportRowSchema`.

- [ ] **Step 2: Run** `npx jest src/lib/validations/match-import.test.ts` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement** both files. `manilaToUtcIso`: convert 12-hour to 24-hour (`12 AM` → 0, `12 PM` → 12) and return `new Date(Date.UTC(y, m - 1, d, h - 8, min)).toISOString()`. Real-date check: build `Date.UTC(y, m-1, d)` and compare back the UTC year/month/day. Trim every cell before validating. Template rows: `CBL26-COL-001, UCLM vs. UPC, College - Elimination Round, BO1, 2026-10-17, 3:30 PM, Cebu Coliseum` and `CBL26-COL-002, BC vs. UC, College - Elimination Round, BO1, 2026-10-17, 5:00 PM, Cebu Coliseum`.

- [ ] **Step 4: Run** `npx jest src/lib/validations/match-import.test.ts` — Expected: PASS.

- [ ] **Step 5: Commit** types, validations and test with `-- <paths>`: `"feat(matches): add CSV import row validation and types"`.

---

### Task 3: Parse phase and in-file checks (pure)

**Files:**
- Create: `src/services/match-import.ts` (pure exported functions only in this task)
- Test: `src/services/match-import.test.ts`

**Interfaces:**
- Consumes: `parseCsv` (Task 1); `MATCH_IMPORT_COLUMNS`, `MATCH_IMPORT_MAX_ROWS`, `matchImportRowSchema`, types (Task 2); `findMatchScheduleConflicts`, `formatMatchScheduleConflicts` (existing).
- Produces:
  - `parseMatchImportCsv(csvText: string): { rows: ParsedMatchImportRow[]; errors: MatchImportRowError[] }`
  - `findInFileDuplicates(rows: ParsedMatchImportRow[]): MatchImportRowError[]` — compares `teamA`/`teamB` as an unordered pair
  - `findInFileConflicts(rows: (ParsedMatchImportRow & { teamIds: string[] })[]): MatchImportRowError[]`

- [ ] **Step 1: Write failing tests** (build CSVs with `toCsv`):
- Valid 2-row CSV → `rows.length === 2`, `errors` empty, `rows[0].row === 2`.
- Review Focus 1: same CSV with `'﻿'` prefix, CRLF, and an extra `',,,,,,'` line and a blank line → identical result to the clean CSV.
- Header missing `Venue` → error `{ row: 1, field: 'Venue', message: 'Missing column "Venue"' }`; extra header `Notes` → `{ row: 1, message: 'Unknown column "Notes"' }`; headers in shuffled order still parse.
- Row with 6 fields → `{ row: 3, message: 'Expected 7 values but found 6' }`.
- Zod failure maps to `{ row, matchId, field, message }` (e.g. bad date on row 3 → `field: 'Scheduled Date'`, `matchId` from that row).
- Header only → `errors` contains `'The file has no match rows.'` at row 1; 501 data rows → `'Too many rows: 501 (maximum 500).'`.
- Unterminated quote → single error whose message contains `Unterminated quoted field`.
- `findInFileDuplicates`: same `matchId` on rows 2 and 5 → error on row 5 `field: 'Match ID'`, message `'Duplicate Match ID (first used on row 2)'`; `UCLM vs UPC` and `UPC vs UCLM` at the same `scheduledAt` → error on the later row `field: 'Match Participants'`, message `'Duplicate of row 2'`; same pair, different time → no error.
- `findInFileConflicts`: two rows, same venue, `scheduledAt` 10 minutes apart → error on the later row whose message contains `'same venue'` and `'row 2'`; same venue 90 minutes apart → none; shared team id, different venue, overlapping → message contains `'same team'`.

- [ ] **Step 2: Run** `npx jest src/services/match-import.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement** the three functions. Header cells are trimmed; a data row is skipped when every cell trims to `''`. Errors are collected (do not stop at the first). For conflicts, map each earlier row to a `ScheduledMatchSlot` (`id: row`, `name: \`row ${row}\``, `end_at: null`, `team_ids: teamIds`) and call `findMatchScheduleConflicts` for each row against the rows before it, message `"Schedule conflict with " + <formatted name and reason>`.

- [ ] **Step 4: Run** the test file — Expected: PASS.

- [ ] **Step 5: Commit** `"feat(matches): parse and pre-check match import CSV"` with `-- <paths>`.

---

### Task 4: `MatchImportService.importFromCsv` (DB resolution + transaction)

**Files:**
- Modify: `src/services/match-import.ts`
- Test: `src/services/match-import.test.ts` (new `describe` block)

**Interfaces:**
- Consumes: Task 3 functions; `SchoolsTeamService.getTeamsForStage(stageId)` (rows have `id`, `name`, `school: { name, abbreviation }`); `generateMatchName`, `generateMatchDescription` (`src/lib/utils/match-naming.ts`); `createMatchSchema`; `findMatchScheduleConflicts`, `formatMatchScheduleConflicts`; `matches`, `matchParticipants` from `@/db/schema`; `BaseService.getClient()`, `getDrizzle()`, `formatError()`.
- Produces: `class MatchImportService extends BaseService { static importFromCsv(stageId: number, csvText: string): Promise<MatchImportResponse> }`.

Exact pipeline. Errors accumulate across phases; a row that fails a phase is dropped from later phases, the remaining rows keep going, and at the end any errors → `{ success: false, error: 'Validation failed', rowErrors }` sorted by row (spec: every error at once). Header/parse failures from `parseMatchImportCsv` that leave no rows, and stage/team-loading failures, return immediately.
1. `parseMatchImportCsv` + `findInFileDuplicates`.
2. Stage: `from('sports_seasons_stages').select('id, competition_stage, sport_category_id, season_id, sports_categories!sport_category_id(division, levels, sports(name))').eq('id', stageId).single()` → missing: `{ success: false, error: 'Selected league stage was not found.' }`.
3. Teams via `getTeamsForStage`; if it returns `success: false` (e.g. stage lacks category/season) → `{ success: false, error: <its error> }`. Per row, each abbreviation → unknown: `'Team "X" is not in this stage. Valid teams: A, B, C'` (sorted, comma-separated); >1 active team: `'Team "X" is ambiguous: N active teams in this stage'`. `field: 'Match Participants'`.
4. Build `MatchInsert` `{ name, description, venue, best_of, stage_id, status: 'upcoming', scheduled_at, start_at: null, end_at: null }`, run `createMatchSchema.safeParse`; failures → row errors (field `'Venue'` for venue issues, otherwise no field).
5. `findInFileConflicts`.
6. DB duplicates: `from('matches').select('id, name, scheduled_at, match_participants(team_id)').eq('stage_id', stageId).in('scheduled_at', uniqueTimes)` — same team-id set → `'Already exists: "<name>" (Match #<id>)'`, field `'Match Participants'`. Compare instants with `new Date(a).getTime()`.
7. DB conflicts: `from('matches').select('id, name, venue, scheduled_at, end_at, match_participants(team_id)').not('scheduled_at', 'is', null).gte('scheduled_at', minTime − 24h).lt('scheduled_at', maxTime + 30min)`, then `findMatchScheduleConflicts` per row → `formatMatchScheduleConflicts(...)` as the message.
8. `getDrizzle().transaction(async (tx) => …)`: for each row in order, `tx.insert(matches).values(insert).returning({ id: matches.id, name: matches.name, scheduled_at: matches.scheduled_at })`, then `tx.insert(matchParticipants).values([{ match_id, team_id: teamAId }, { match_id, team_id: teamBId }])`. (Per-row inserts guarantee the id ↔ participants mapping; ≤ 500 rows.)
9. Success → `{ success: true, data: { created, matches } }`; any thrown error → `this.formatError(err, 'Failed to import matches.')` (transaction rolled back).

- [ ] **Step 1: Write failing tests.** Mock `./base` as in `src/services/matches.test.ts` (in-memory `tables` + chainable `from` supporting `select/eq/in/not/gte/lt/order/single/then`, nested objects stored directly on rows). `getDrizzle()` returns `{ transaction }` where `transaction(fn)` gives `fn` a `tx` whose `insert(table).values(v)` buffers rows (`.returning()` resolves with assigned ids) and copies the buffer into `tables` only if `fn` resolves. Seed stage `10` (Basketball, men, college, `group_stage`) and teams `UCLM`, `UPC`, `BC`, `UC`. Tests:
- Valid 2-row CSV → `success: true`, `data.created === 2`; `tables.matches` gained 2 rows with `stage_id: 10`, `status: 'upcoming'`, `best_of: 1`, `scheduled_at: '2026-10-17T07:30:00.000Z'`, `name` equal to `generateMatchName` output; `tables.match_participants` gained 4 rows; transaction called once.
- Review Focus 4: `SHS-ADC vs. UC` → row error message `'Team "SHS-ADC" is not in this stage. Valid teams: BC, UC, UCLM, UPC'`.
- Two active teams with abbreviation `UC` → `'ambiguous'`.
- Unknown stage id → `error: 'Selected league stage was not found.'`.
- Review Focus 5: run the same valid import twice → second returns `success: false`, every row error starts with `'Already exists'`, and table counts are unchanged.
- Existing match at same venue overlapping row's time (other stage) → row error contains `'same venue'`; nothing inserted.
- Errors from different phases are all reported: bad date on row 2 + unknown team on row 3 → `rowErrors` has both, ordered `[2, 3]`; nothing inserted.
- `getTeamsForStage` failure (stage row with `sport_category_id: null`) → `success: false` with that error.
- `tx.insert` throws on the second match → `success: false`, `error` contains `'Failed to import matches.'`, `tables.matches` and `tables.match_participants` unchanged.

- [ ] **Step 2: Run** `npx jest src/services/match-import.test.ts` — Expected: new tests FAIL.

- [ ] **Step 3: Implement** `MatchImportService.importFromCsv` per the pipeline above.

- [ ] **Step 4: Run** `npx jest src/services` — Expected: PASS, including unchanged `matches.test.ts`.

- [ ] **Step 5: Commit** `"feat(matches): import validated CSV matches in one transaction"` with `-- <paths>`.

---

### Task 5: Admin-only server action

**Files:**
- Create: `src/actions/match-import.ts`
- Test: `src/actions/match-import.test.ts`

**Interfaces:**
- Consumes: `AuthService.checkAuth(['admin'])` → `AuthCheckResult`; `importMatchesInputSchema`; `MatchImportService.importFromCsv`; `RevalidationHelper.revalidateMatches()`.
- Produces: `'use server'` `importMatchesFromCsv(stageId: unknown, csvText: unknown): Promise<MatchImportResponse>`.

- [ ] **Step 1: Write failing tests** with `jest.mock('@/services/auth')`, `jest.mock('@/services/match-import')`, `jest.mock('@/lib/utils/revalidation')`:
- `checkAuth` → `{ authenticated: false, authorized: false }` → `{ success: false, error: 'You must be signed in to import matches.' }`; service not called.
- `{ authenticated: true, authorized: false, userRole: 'league_operator' }` → `{ success: false, error: 'You do not have permission to import matches.' }`; service not called.
- Admin with `stageId: 0`, `stageId: '5'`, `csvText: ''`, or `csvText` of `MATCH_IMPORT_MAX_BYTES + 1` chars → `success: false`, `error: 'Invalid import request.'`; service not called.
- Admin + valid input → returns service result unchanged; `checkAuth` called with `['admin']`; `revalidateMatches` called once on success and not called when the service returns `success: false`.

- [ ] **Step 2: Run** `npx jest src/actions/match-import.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement** the action (auth first, then input parse, then service, then revalidate on success). No `@ts-nocheck`.

- [ ] **Step 4: Run** the test file — Expected: PASS.

- [ ] **Step 5: Commit** `"feat(matches): add admin-only CSV import server action"` with `-- <paths>`.

---

### Task 6: Optional secondary toolbar buttons on `DataTable`

**Files:**
- Modify: `src/lib/types/table.ts` (add to both `TableProps` and `SearchAndFiltersProps`), `src/components/table/data-table.tsx` (destructure + pass through), `src/components/table/table-search-filters.tsx` (render)
- Test: `src/components/table/table-search-filters.test.tsx`

**Interfaces:**
- Produces: `secondaryButtons?: { label: string; onClick: () => void; icon?: ReactNode }[]` — rendered in a `flex items-center gap-2` group with `addButton`, each as `<Button variant="outline">`, to the left of `addButton`.

- [ ] **Step 1: Write failing tests** (Testing Library): with `addButton` only → exactly one button named `Add Match` besides search controls (unchanged); with `secondaryButtons=[{ label: 'Import Bulk Matches', onClick }]` → both buttons render, Import appears before Add Match in DOM order, clicking it calls `onClick` once.

- [ ] **Step 2: Run** `npx jest src/components/table` — Expected: FAIL.

- [ ] **Step 3: Implement** the prop (optional; no change when absent).

- [ ] **Step 4: Run** `npx jest src/components/table` and `npx tsc --noEmit -p . 2>&1 | grep -E "table(-search-filters)?\.tsx|types/table\.ts"` — Expected: PASS and no type errors in these files.

- [ ] **Step 5: Commit** `"feat(table): support optional secondary toolbar buttons"` with `-- <paths>`.

---

### Task 7: Hook, modal and matches-table integration

**Files:**
- Create: `src/hooks/use-match-import.ts`, `src/components/shared/matches/match-import-modal.tsx`
- Modify: `src/components/shared/matches/matches-table.tsx`, `src/components/shared/matches/index.ts`

**Interfaces:**
- Consumes: `importMatchesFromCsv` (Task 5); `validateImportFile`, `buildMatchImportTemplate`, `MATCH_IMPORT_COLUMNS` (Task 2); `matchKeys` from `use-matches.ts`; `useAllSportsSeasonsStages` for the stage label; `secondaryButtons` (Task 6).
- Produces:
  - `useMatchImport(stageId: number | null): { file: File | null; fileError: string | null; selectFile(file: File | null): void; runImport(): void; isImporting: boolean; result: MatchImportResponse | null; reset(): void }` — `runImport` reads `await file.text()` and calls the action via `useMutation`; on `success` invalidates exactly the keys `useCreateMatch` invalidates (`matchKeys.all`, `['matches','schedule']`, `['matches','scheduleByDate']`, `['dashboard']`, `['overview']`, `['recent']`, `['upcoming']`, `matchKeys.byStage(stageId)`) and calls `toast.success(\`Imported ${n} matches\`)`. Selecting a new file clears `result`.
  - `MatchImportModal({ open, onOpenChange, stageId }: { open: boolean; onOpenChange(open: boolean): void; stageId: number | null })`.

- [ ] **Step 1: Implement the hook.**

- [ ] **Step 2: Implement the modal** using `ModalLayout`, `Card`, `Button`, `Input type="file" accept=".csv"`, `Alert`/`AlertTitle`/`AlertDescription`, `Badge`, `ScrollArea`, lucide `Upload`/`Download`/`Loader2`, exactly as spec §6:
  - Target stage card: `<Sport> · <Division> <Level> · <Competition Stage>` (title-cased, `_` → space).
  - Format card lists the 7 columns with rules and the note "Times are Philippine time (UTC+8)"; **Download template** builds a `Blob` from `buildMatchImportTemplate()` and downloads `match-import-template.csv`.
  - Footer: Cancel / Import (disabled without a file or while importing; `Loader2` spin + `Importing…`); after success the footer shows only **Done**. While importing, `onOpenChange(false)` is ignored.
  - Failure with `rowErrors`: destructive alert `No matches were imported. Fix ${n} error(s) and try again.` + table Row · Match ID · Column · Problem in `ScrollArea` (max height `h-64`). Failure without `rowErrors`: destructive alert with `error`.
  - Success: alert `Imported ${created} matches into ${stageLabel}.`
  - Closing then reopening calls `reset()`.

- [ ] **Step 3: Wire into `matches-table.tsx`:** state `isImportOpen`; pass `secondaryButtons` only when `userRole === 'admin'` — `{ label: 'Import Bulk Matches', icon: <Upload className="h-4 w-4" />, onClick }` where `onClick` shows `toast.error('Please select a league stage first before importing matches.')` if no stage, else opens the modal; render `<MatchImportModal open={isImportOpen} onOpenChange={setIsImportOpen} stageId={selectedStageId} />` only for admins. Leave `addButton` and `MatchModal` untouched. Export the modal from `index.ts`.

- [ ] **Step 4: Verify** `npx tsc --noEmit 2>&1 | grep -E "match-import|matches-table|use-match-import"` — Expected: no output. Then `npx jest` — Expected: baseline count + new tests, no new failures.

- [ ] **Step 5: Commit** `"feat(matches): add Import Bulk Matches modal for admins"` with `-- <paths>`.

---

### Task 8: Project checks and live verification

**Files:** none planned (fix-ups only, committed separately).

- [ ] **Step 1:** `npx jest` — Expected: all new tests pass; failures, if any, match the Task 1 baseline.
- [ ] **Step 2:** `npx tsc --noEmit` — Expected: no errors in files touched by this plan (list any pre-existing errors elsewhere).
- [ ] **Step 3:** `npm run lint` — Expected: no new problems in touched files. (If `next lint` is unavailable in Next 16, run `npx eslint <touched files>` and report that.)
- [ ] **Step 4:** `npm run build` — Expected: build succeeds; if it fails only for pre-existing reasons, report them.
- [ ] **Step 5: Live check (needs the user).** Start the dev server via `preview_start`; ask the user to sign in as admin in the browser pane and name a test stage. Then on `/admin/matches`:
  1. Both **Import Bulk Matches** and **Add Match** visible; Import with no stage → toast.
  2. Download template opens a valid CSV.
  3. Upload a CSV with one bad date and one unknown team → error table, matches table unchanged.
  4. Upload a valid 2-row CSV (team abbreviations from that stage, a future date, a unique venue) → success alert, 2 new rows visible in the table.
  5. Re-upload the same file → every row "Already exists".
  6. Add one match via **Add Match** → created as before.
  7. Delete exactly the 3 matches created in steps 4 and 6 (via the table's delete action), confirm the table is back to its starting count.
  8. Screenshot the success state for the report.
- [ ] **Step 6: Commit** any fix-ups with `-- <paths>`, then report files changed, commands run with results, and live-check results.
