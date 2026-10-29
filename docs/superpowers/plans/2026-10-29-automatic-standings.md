# Automatic Standings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/standings` shows **#, Team, W, L, PTS, +/−** like cesafi.ph. Each team's line is its admin-edited starting record plus finished matches after a per-category cut-off date, so standings update when a match is marked Finished with scores.

**Architecture:** `team_standings` gains `point_diff`. A new `standings_cutoffs(season_id, sport_category_id, counted_through)` table holds the per-category cut-off. Pure functions in `src/lib/utils/standings-calc.ts` tally finished matches and rank teams. `StandingsService.getSeasonStandings` reads teams, finished matches and cut-offs in parallel and combines them. Admins edit the starting W/L/+/− and the cut-off in the existing `/admin/standings` tab. Match and score saves revalidate `/standings`.

**Tech Stack:** Next.js 16 (App Router, server actions), TypeScript, Supabase JS, Drizzle schema files, Zod v4, TanStack Query v5, shadcn/ui, sonner, date-fns-tz, Jest 30 + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-29-automatic-standings-design.md` (builds on `2026-10-22-team-standings-design.md`)

## Global Constraints

- **Total = starting record + finished matches after the category cut-off.** `points = 3 × wins` (`POINTS_PER_WIN = 3`); a loss is worth 0.
- **Ranking:** points desc → losses asc → pointDiff desc → school name A–Z → team name A–Z (`localeCompare`). `rank = index + 1` (no shared ranks). If no team in the category has `wins + losses > 0`: `hasResults = false` and every `rank = null`.
- **A match counts** only if all of these hold:
  - `status = 'finished'`;
  - the stage passes `isStandingsStage`;
  - it has exactly 2 participants;
  - both scores are non-null and they are not equal;
  - either it has no `scheduled_at`, the category has no cut-off, or `manilaDate(scheduled_at) > counted_through`.

  The winner gets +1 W and the loser +1 L. Each team's pointDiff changes by `own − opponent`.
- **Stage names that count:** lowercase the name and strip non-letters, then accept `eliminationround`, `elimination`, `groupstage` and `roundrobin`. Everything else is excluded.
- **Timezone** for the cut-off: `Asia/Manila`. Cut-off format: `YYYY-MM-DD`.
- `point_diff`: integer, DB `CHECK (point_diff BETWEEN -9999 AND 9999)`, default 0. Zod constant `STANDINGS_MAX_POINT_DIFF = 9999`.
- Writes to the starting record and the cut-off are admin-only: `AuthService.checkAuth(['admin'])` + RLS `user_has_role(ARRAY['admin'::text])`. Cut-off saves are last-write-wins.
- Never return Postgres codes, details or hints to the client, and do not use `BaseService.formatError`.
- **Exact copy:**
  - `"+/− must be a whole number from -9999 to 9999."` (`+/` followed by U+2212 `−`; the numbers use ASCII `-`)
  - `"Enter a valid date."`
  - `"This season or category no longer exists."`
  - `"Could not save the cut-off date. Please try again."`
  - Admin subtitle: `"Season {id} · starting records and match results by category"`
  - Cut-off label: `"Starting record covers games through"`
  - Cut-off help: `"Finished matches on or before this date are already in the starting record and are not added again. Leave empty to count every finished match."`
  - Toasts:
    - `"<team> starting record saved: <W>-<L>, <formatPointDiff(D)>"`
    - `"Cut-off saved"`
    - `"Cut-off cleared"`
  - From-matches cell: `"2-0 · +24"`, or `"—"` (U+2014) when the team has no counted games. Total cell: `"11-1 · 33 pts · +124"`.
  - `formatPointDiff`: `+100`, `−1` (U+2212 minus), `0`.
- Unchanged copy from the 2026-10-22 plan stays as it is (auth, conflict, `"Could not load standings."`, the public failure message).
- **Seed data:** the +/− values for the 40 Season 26 teams, as listed in spec §4. Cut-off `2026-10-29` for `(26,3)`, `(26,9)`, `(26,10)`, `(26,11)`.
- **No new npm dependencies.** Links stay relative. Work on `dev`. Commit only the task's files with `git commit -m "…" -- <paths>`, and never stage the untracked `.claude/` or `schedule-csv/`. End commit messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Type-check timing:** `npx jest` must pass after every task. `npx tsc --noEmit` may show errors only in files a later task changes (Tasks 3–7 change shared types), and must be clean after Task 8.
- **Never apply the migrations to the database without the user's explicit yes in chat** (Task 10).

## Review Focus

1. **A match marked Finished before anyone enters scores** (both still at the default 0-0) must not count as a game. Test in Task 2.
2. **A late-evening game on the cut-off date.** `2026-10-29T15:30:00Z` is 23:30 Manila on the 29th, so it is skipped. `2026-10-29T16:30:00Z` is the 30th in Manila, so it counts. Test in Task 2.
3. **Embedded shapes from PostgREST.** `sports_seasons_stages` arrives as an object or a one-element array, and `match_participants` may be `[]`. Both must be handled. Test in Task 4.
4. **A participant that is not an active team of the category** (inactive team or bad data) must be ignored, while the opponent's win or loss still counts. Test in Task 4.
5. **Odd +/− typing.** `"-12"` and `"+5"` are valid. `""`, `"1.5"` and `"10000"` show the +/− error and disable Save. Test in Task 8.

---

### Task 1: Baseline, migrations, schema

**Files:**
- Create: `supabase/migrations/20261029000000_add_automatic_standings.sql`
- Create: `supabase/migrations/20261029000100_seed_season_26_standings.sql`
- Create: `scripts/migrate-automatic-standings.mjs`
- Create: `src/db/schema/standings-cutoffs.ts`
- Modify: `src/db/schema/team-standings.ts`, `src/db/schema/index.ts`, `database.types.ts`

**Interfaces:**
- Produces:
  - column `team_standings.point_diff int`;
  - table `standings_cutoffs(season_id int, sport_category_id int, counted_through date, created_at, updated_at)` with PK `(season_id, sport_category_id)`;
  - Drizzle export `standingsCutoffs`, with types `StandingsCutoffs` and `NewStandingsCutoffs`.

- [ ] **Step 1: Record baseline checks** before any change. Run `npm test`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Save each output to the scratchpad as `auto-baseline-*.txt` and note the pass/fail and error counts.
- [ ] **Step 2: Write the schema migration** exactly as spec §4, made safe to re-run:
  - `DROP TRIGGER IF EXISTS trigger_standings_cutoffs_updated_at ON public.standings_cutoffs;` before `CREATE TRIGGER`;
  - `DROP POLICY IF EXISTS "<name>" ON public.standings_cutoffs;` before each `CREATE POLICY`;
  - `ADD COLUMN IF NOT EXISTS` already covers the column.
- [ ] **Step 3: Write the seed migration.**
  - Inside a `DO $$ … $$` block, run `UPDATE public.team_standings ts SET point_diff = v.point_diff FROM (VALUES …) v(sport_category_id, abbreviation, point_diff), public.schools_teams st, public.schools s`. Join `st.id = ts.team_id`, `s.id = st.school_id`, `st.season_id = 26`, `st.is_active`, `st.sport_category_id = v.sport_category_id` and `s.abbreviation = v.abbreviation`. The 40 value tuples come from spec §4.
  - Then `GET DIAGNOSTICS n = ROW_COUNT; IF n <> 40 THEN RAISE EXCEPTION 'Expected 40 team_standings rows, updated %', n; END IF;`.
  - Then insert the four cut-offs with `ON CONFLICT (season_id, sport_category_id) DO UPDATE SET counted_through = EXCLUDED.counted_through`.
- [ ] **Step 4: Write `scripts/migrate-automatic-standings.mjs`.** Mirror `scripts/migrate-team-standings.mjs` (`.env.local`, then `.env`). Run both files in one `sql.begin(async (tx) => { await tx.unsafe(schema); await tx.unsafe(seed); })`, so a failure rolls back both. Afterwards print per-category `count(*)` and `sum(point_diff)` for season 26, then every `standings_cutoffs` row. Exit non-zero on error. **Do not run it.**
- [ ] **Step 5: Update the code-side schema.**
  - `team-standings.ts`: add `point_diff: integer('point_diff').default(0).notNull()`.
  - `standings-cutoffs.ts`:
    - `integer` season and category columns;
    - `date('counted_through', { mode: 'string' }).notNull()`;
    - timestamps like `team-standings.ts`;
    - a composite `primaryKey({ columns: [t.season_id, t.sport_category_id] })` in the extra-config array.
  - Export the new file from `index.ts`.
  - `database.types.ts`: add `point_diff: number` to the `team_standings` Row, and as optional to Insert/Update. Add a `standings_cutoffs` entry (Row/Insert/Update) after `sports_seasons_stages`, with Relationships `standings_cutoffs_season_id_fkey → seasons.id` and `standings_cutoffs_sport_category_id_fkey → sports_categories.id`, both with `isOneToOne: false`.
- [ ] **Step 6: Verify.** `npx tsc --noEmit` shows no errors beyond the baseline.
- [ ] **Step 7: Commit** the six files: `feat(standings): add point_diff and standings cutoffs migrations`.

### Task 2: Pure standings calculations

**Files:**
- Create: `src/lib/utils/standings-calc.ts`, `src/lib/utils/standings-calc.test.ts`
- Modify: `src/lib/types/standings.ts` (add `StandingLine` only)

**Interfaces:**
- Produces, in `@/lib/types/standings`: `interface StandingLine { wins: number; losses: number; pointDiff: number }`.
- Produces, in `@/lib/utils/standings-calc`:
  - `POINTS_PER_WIN = 3`
  - `isStandingsStage(competitionStage: string): boolean`
  - `manilaDate(iso: string): string`, via `formatInTimeZone(iso, 'Asia/Manila', 'yyyy-MM-dd')`
  - `interface StandingsMatch { scheduledAt: string | null; participants: { teamId: string; score: number | null }[] }`
  - `tallyMatches(matches: StandingsMatch[], countedThrough: string | null): Map<string, StandingLine>`
  - `interface RankableStanding { wins: number; losses: number; pointDiff: number; points: number; teamName: string; school: { name: string } }`
  - `rankStandings<T extends RankableStanding>(rows: T[]): { teams: (T & { rank: number | null })[]; hasResults: boolean }`
  - `formatPointDiff(value: number): string`

- [ ] **Step 1: Write the failing tests** in `standings-calc.test.ts`:
  - `isStandingsStage`: true for `'Elimination Round'`, `'elimination_round'`, `'Group Stage'`, `'group_stage'`, `'Round Robin'`; false for `'Play-ins'`, `'Quarterfinals'`, `'Semifinals'`, `'Playoffs'`, `'Finals'`, `''`.
  - `manilaDate('2026-10-29T15:30:00Z') === '2026-10-29'` and `manilaDate('2026-10-29T16:30:00Z') === '2026-10-30'`.
  - `tallyMatches`, where `m(at, [a, sa], [b, sb])` builds a match:
    - A 78–65 B gives `A {1,0,+13}` and `B {0,1,−13}`.
    - Two matches add up per team.
    - With cut-off `'2026-10-29'`: `at = '2026-10-29T15:30:00Z'` is skipped (map has no A); `'2026-10-29T16:30:00Z'` counts.
    - `countedThrough = null` counts a 2026-10-17 match.
    - `scheduledAt: null` counts even with a cut-off.
    - Skipped (empty map): **0–0** (Review Focus 1), 70–70, a null score, one participant, three participants.
  - `rankStandings`:
    - With `row(school, w, l, d)` where `points = 3w`: the input `[row('CEC',3,4,-29), row('UV',3,4,37), row('SHS',6,0,71), row('UCM',7,3,150)]` orders as UCM, SHS, UV, CEC with ranks 1–4.
    - Equal W/L/+/− orders by school name, then team name, with distinct ranks 1 and 2.
    - All 0-0 gives `hasResults false` and ranks all `null`.
    - `[]` gives `{ teams: [], hasResults: false }`.
  - `formatPointDiff`: `100 → '+100'`, `-1 → '−1'` (U+2212), `0 → '0'`.
- [ ] **Step 2: Run** `npx jest src/lib/utils/standings-calc.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement** the interfaces above. `rankStandings` sorts a copy, then maps `rank: hasResults ? i + 1 : null`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `standings-calc.ts`, its test and `types/standings.ts`: `feat(standings): add match tally and points ranking`.

### Task 3: Types and validation

**Files:**
- Modify: `src/lib/types/standings.ts`, `src/lib/validations/standings.ts`
- Test: `src/lib/validations/standings.test.ts`

**Interfaces:**
- Produces: the types exactly as spec §5.1:
  - `RankedTeamStanding` gains `starting`, `fromMatches`, `pointDiff` and `points`; `wins` and `losses` become totals.
  - `CategoryStandings` gains `countedThrough: string | null`.
  - `SavedTeamStanding` gains `pointDiff`.
  - New `SavedStandingsCutoff { seasonId; sportCategoryId; countedThrough: string | null }`.
  - `StandingsFieldErrors` keys gain `'pointDiff' | 'countedThrough'`.
- Produces, in validations:
  - `STANDINGS_MAX_POINT_DIFF = 9999` and `pointDiffSchema`;
  - `updateTeamStandingSchema` gains `pointDiff`;
  - `updateStandingsCutoffSchema = z.strictObject({ seasonId: z.number().int().positive(), sportCategoryId: z.number().int().positive(), countedThrough: z.iso.date({ error: 'Enter a valid date.' }).nullable() })`;
  - `type UpdateStandingsCutoffInput`.

- [ ] **Step 1: Write the failing tests:**
  - `pointDiff` accepts `-9999`, `0` and `9999`. It rejects `-10000`, `10000`, `1.5`, `'5'` and a missing value, each with the exact +/− message.
  - The existing valid `updateTeamStandingSchema` fixtures gain `pointDiff: 0` and still pass.
  - The cut-off schema accepts `{ seasonId: 26, sportCategoryId: 3, countedThrough: '2026-10-29' }` and `countedThrough: null`. It rejects `'2026-13-01'`, `'29/10/2026'` and `''` (message `"Enter a valid date."`), an extra field, and `seasonId: 0`.
- [ ] **Step 2: Run** `npx jest src/lib/validations/standings.test.ts`. Expected: the new cases FAIL.
- [ ] **Step 3: Implement** the types and schemas. `pointDiffSchema` uses the same `number/int/min/max` chain as `winLossValue`, with the +/− message.
- [ ] **Step 4: Run** it again. Expected: PASS.
- [ ] **Step 5: Commit** the three files: `feat(standings): add point difference and cut-off types and schemas`.

### Task 4: Service — combine starting records with match results

**Files:**
- Modify: `src/services/standings.ts`, `src/services/standings.test.ts`

**Interfaces:**
- Consumes: Task 2 (`tallyMatches`, `isStandingsStage`, `rankStandings`, `POINTS_PER_WIN`) and Task 3 types.
- Produces:
  - `StandingsService.getSeasonStandings(seasonId)`, now with the new row shape;
  - `StandingsService.saveRecord(input)`, which writes `point_diff` and returns `pointDiff`;
  - `StandingsService.saveCutoff(input: UpdateStandingsCutoffInput): Promise<StandingsResult<SavedStandingsCutoff>>`.

  The old `rankStandings` and its tests are removed from the service files. Nothing else imports it, so there is no re-export.

- [ ] **Step 1: Extend the test mock:**
  - `eq` with a dotted column (`'sports_seasons_stages.season_id'`) filters parent rows by the nested value. An embed may be an object or an array; use the first element.
  - Add `upsert(data, { onConflict })`, which replaces the row matching the conflict columns or pushes a new one, and `delete()`, which removes the matching rows.
  - Injected failures keep the `${table}.${op}` keys (`matches.select`, `standings_cutoffs.upsert`, …).
- [ ] **Step 2: Write the failing tests.** Use the helpers `match(id, catId, stage, at, [[teamId, score], …], status = 'finished')` (a `matches` row with `status`, `scheduled_at`, the embedded `sports_seasons_stages { season_id: 26, sport_category_id, competition_stage }` and `match_participants`) and `cutoff(catId, date)`. Cases:
  - Totals = starting + matches. Team A starts at `9-1, +100`, then a finished match after the cut-off, A 80–70 B, gives A `starting {9,1,100}`, `fromMatches {1,0,10}`, total `10-1`, `pointDiff 110`, `points 30`.
  - A finished match dated on or before the cut-off leaves `fromMatches` at zeros.
  - Ignored: an `upcoming` match, a `'Playoffs'` stage, and a match from another category or another season.
  - The stage embed works as an object and as a one-element array (Review Focus 3).
  - An unknown participant team: B is not an active team of the category, and A still gets the win (Review Focus 4).
  - `countedThrough` is returned per category, or `null` when there is no cut-off row.
  - A `matches.select` failure returns `SERVER` `"Could not load standings."`.
  - `saveRecord` sends `point_diff` on insert and update, and returns `pointDiff`.
  - `saveCutoff` with a date upserts and returns `{ seasonId, sportCategoryId, countedThrough }`. With `null` it deletes the row and returns `countedThrough: null`.
  - `saveCutoff` maps an injected `23503` to `NOT_FOUND` `"This season or category no longer exists."`. Any other error returns `SERVER` `"Could not save the cut-off date. Please try again."`.
- [ ] **Step 3: Run** `npx jest src/services/standings.test.ts`. Expected: the new cases FAIL.
- [ ] **Step 4: Implement:**
  - Add `point_diff` to the `team_standings` embed and to `SAVED_COLUMNS`.
  - Add `FINISHED_MATCHES_SELECT` and the cut-offs query (spec §5.4), run with `Promise.all`; any error is thrown into the existing catch.
  - Group matches by `sport_category_id` after the `isStandingsStage` filter. Map them to `StandingsMatch`, with `score` taken from `match_score`.
  - Per category, call `tallyMatches(matches, countedThrough)`, build each row, then rank.
  - For `saveCutoff`: `delete().eq('season_id').eq('sport_category_id')` when the date is null; otherwise `upsert({...}, { onConflict: 'season_id,sport_category_id' })`.
- [ ] **Step 5: Run** it again. Expected: PASS.
- [ ] **Step 6: Commit** both files: `feat(standings): add match results to season standings`.

### Task 5: Actions and revalidation

**Files:**
- Modify: `src/actions/standings.ts`, `src/actions/standings.test.ts`, `src/lib/utils/revalidation.ts`
- Create: `src/lib/utils/revalidation.test.ts`

**Interfaces:**
- Consumes: `StandingsService.saveCutoff` and `updateStandingsCutoffSchema`.
- Produces: `updateStandingsCutoff(input: unknown): Promise<StandingsResult<SavedStandingsCutoff>>`.

- [ ] **Step 1: Write the failing tests:**
  - `updateStandingsCutoff` follows the `updateTeamStanding` cases:
    - signed out → `UNAUTHENTICATED`, and the service is not called;
    - league operator → `FORBIDDEN`;
    - `checkAuth` is called with `['admin']`;
    - `countedThrough: 'nope'` → `VALIDATION` with `fieldErrors.countedThrough`, and no service call;
    - success → `revalidateStandings` is called once;
    - service failure → no revalidation.
  - `updateTeamStanding` passes `pointDiff` through to `saveRecord`.
  - In `revalidation.test.ts`, mock `next/cache`. Then `RevalidationHelper.revalidateMatches()` and `revalidateMatchParticipants()` each call `revalidatePath('/standings')` and `revalidatePath('/admin/standings')`.
- [ ] **Step 2: Run** `npx jest src/actions/standings.test.ts src/lib/utils/revalidation.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the action (same order as `updateTeamStanding`), and add `this.revalidateStandings()` to both helpers.
- [ ] **Step 4: Run** them again. Expected: PASS.
- [ ] **Step 5: Commit** the four files: `feat(standings): add cut-off action and refresh standings on match changes`.

### Task 6: Hooks

**Files:**
- Modify: `src/hooks/use-standings.ts`, `src/hooks/use-standings.test.tsx`

**Interfaces:**
- Consumes: `updateStandingsCutoff` and `formatPointDiff`.
- Produces:
  - `useUpdateTeamStanding(seasonId)`, with the same signature; `input` now includes `pointDiff`;
  - `useUpdateStandingsCutoff(seasonId): UseMutationResult<StandingsResult<SavedStandingsCutoff>, Error, UpdateStandingsCutoffInput>`, which always resolves with a result, like `useUpdateTeamStanding`.

- [ ] **Step 1: Write the failing tests.** Update the fixtures to the new `RankedTeamStanding` shape, then cover:
  - A successful save patches the cached team's `starting` to `{6,1,12}` and its `updatedAt`, and toasts `"Webmasters starting record saved: 6-1, +12"`.
  - A successful cut-off save invalidates `standingsKeys.season(26)` and toasts `"Cut-off saved"`; with `countedThrough: null` it toasts `"Cut-off cleared"`.
  - A cut-off `VALIDATION` failure shows no toast; a `SERVER` failure toasts the error.
  - A thrown action resolves to `SERVER` `"Could not save the cut-off date. Please try again."`.
- [ ] **Step 2: Run** `npx jest src/hooks/use-standings.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** the patch, the toast and the new mutation. Mock `updateStandingsCutoff` in the test's `jest.mock('@/actions/standings')`.
- [ ] **Step 4: Run** it again. Expected: PASS.
- [ ] **Step 5: Commit** both files: `feat(standings): add cut-off mutation and starting-record toast`.

### Task 7: Public table — W · L · PTS · +/−

**Files:**
- Modify: `src/components/standings/standings-table.tsx`, `src/components/standings/standings-table.test.tsx`
- Modify, if their fixtures stop type-checking: `src/lib/utils/standings-selection.test.ts`

**Interfaces:**
- Consumes: `formatPointDiff` and `RankedTeamStanding.points` / `.pointDiff`.

- [ ] **Step 1: Write the failing tests.** Update the fixture helper to the new shape, then cover:
  - Column headers by accessible name: `['Rank', 'Team', 'Wins', 'Losses', 'Points', 'Point difference']`. The visible text is `#`, `Team`, `W`, `L`, `PTS`, `+/−`, with the visible part `aria-hidden` and an `sr-only` full name.
  - The BC row `9-1, points 27, pointDiff 100, rank 1` renders cells ending in `'9', '1', '27', '+100'`.
  - A `-1` diff renders `'−1'`, and `0` renders `'0'`.
  - The existing rank, empty-state and logo tests still pass.
- [ ] **Step 2: Run** `npx jest src/components/standings`. Expected: FAIL.
- [ ] **Step 3: Implement** the PTS and +/− columns. Use `tabular-nums`, with PTS bold and +/− muted. At phone width:
  - the rank column is `w-10`;
  - each numeric column is `w-10`, growing to `sm:w-16`;
  - the logo is `h-7 w-7`, growing to `sm:h-10 sm:w-10`.
- [ ] **Step 4: Run** it again. Expected: PASS.
- [ ] **Step 5: Commit**: `feat(standings): show points and point difference on public table`.

### Task 8: Admin — starting record inputs and the cut-off bar

**Files:**
- Modify: `src/components/admin/standings/standings-row.tsx`, `standings-row.test.tsx`, `standings-manager.tsx`, `index.ts`
- Create: `src/components/admin/standings/standings-cutoff-bar.tsx`, `standings-cutoff-bar.test.tsx`

**Interfaces:**
- Consumes: `pointDiffSchema`, `STANDINGS_MAX_POINT_DIFF`, `formatPointDiff`, `useUpdateStandingsCutoff`.
- Produces:
  - `StandingsRow` with `onSave: (values: { wins: number; losses: number; pointDiff: number }) => Promise<StandingsResult<SavedTeamStanding>>`. Its drafts edit `team.starting`.
  - `StandingsCutoffBar({ countedThrough: string | null; onSave: (countedThrough: string | null) => Promise<StandingsResult<SavedStandingsCutoff>> })`.

- [ ] **Step 1: Write the failing row tests.** Update `TEAM` to the new shape (`starting {5,1,12}`, `fromMatches {2,0,24}`, totals `7-1`, `points 21`, `pointDiff 36`). Then:
  - The inputs are labelled `"Starting wins for Webmasters"`, `"Starting losses for Webmasters"` and `"Starting point difference for Webmasters"`, and show 5, 1 and 12.
  - The cells show `"2-0 · +24"` and `"7-1 · 21 pts · +36"`; with `fromMatches` all zero they show `"—"`.
  - **Review Focus 5:** for +/−, `"-12"` and `"+5"` are valid. `""`, `"1.5"` and `"10000"` show the +/− message and disable Save.
  - Save calls `onSave({ wins: 5, losses: 1, pointDiff: -12 })`.
  - The existing dirty, reset, server-field-error and resync tests still pass, adapted to the new labels.
- [ ] **Step 2: Write the failing cut-off bar tests:**
  - The label `"Starting record covers games through"` is tied to a date input showing `2026-10-29`, and the help text is present.
  - Save is disabled while the draft equals the saved value or is empty. Changing the value to `2026-11-15` and clicking Save calls `onSave('2026-11-15')`.
  - Clear calls `onSave(null)`, and is disabled when `countedThrough` is `null`.
  - A result with `fieldErrors.countedThrough` shows the message.
  - The draft resyncs when the `countedThrough` prop changes.
- [ ] **Step 3: Run** `npx jest src/components/admin/standings`. Expected: FAIL.
- [ ] **Step 4: Implement:**
  - In the row, add the `pointDiff` field (input `min`/`max` ±9999). Use `savedKey` from `team.starting.*` and `updatedAt`, and add the two read-only cells.
  - The bar is a `flex-wrap` row inside a bordered box, with the help text in `text-muted-foreground text-xs`.
  - In the manager:
    - set the subtitle;
    - render the bar inside the tab using the selected category's `countedThrough` and `useUpdateStandingsCutoff`;
    - use the headers Rank, Team, Start W, Start L, Start +/−, From matches, Total, then actions;
    - change the empty-search `colSpan` to 8;
    - pass `pointDiff` in the `onSave` input.
  - Export the bar from `index.ts`.
- [ ] **Step 5: Run** it again, then run `npx tsc --noEmit`. Expected: PASS, and no type errors beyond the baseline.
- [ ] **Step 6: Commit** the six files: `feat(standings): edit starting +/- and cut-off in admin standings`.

### Task 9: Docs

**Files:**
- Modify: `docs/PUBLIC_MODULES_GUIDE.md` (§4 Standings), `docs/ADMIN_USER_GUIDE.md` (Standings section)

- [ ] **Step 1:** Public guide: the columns, PTS = 3 × W, the ranking order, and that the page updates when matches are marked Finished with scores.
- [ ] **Step 2:** Admin guide:
  - the starting record (W/L/+/−);
  - the cut-off date and when to move it (after re-copying totals from another source);
  - which matches count (Finished, round-robin stage, both scores, not tied);
  - that entering scores for a match on or before the cut-off does not change standings.
- [ ] **Step 3: Commit** both files: `docs(standings): document automatic standings`.

### Task 10: Apply, verify, report

- [ ] **Step 1: Ask the user in chat** before running `node scripts/migrate-automatic-standings.mjs`. Run it only after an explicit yes. Expected output:
  - categories 3, 9, 10 and 11 have 9, 13, 7 and 11 rows;
  - every category's `sum(point_diff)` is **0** (in a closed league, point differences cancel out, so this checks the seed values were copied correctly);
  - there are 4 cut-off rows dated 2026-10-29.
- [ ] **Step 2: Run project checks**: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Compare them with the baseline and report new failures separately from those that already existed.
- [ ] **Step 3: Live check against cesafi.ph.** Start the dev server with `preview_start`. For each of the four categories, compare `/standings` with cesafi.ph's `/standings/basketball/{collegiate,high-school,u12,u15}` on W, L, PTS, +/− and order. The only allowed difference is U12 BC/SHS. Then resize to 375 px and check `document.documentElement.scrollWidth <= 375`.
- [ ] **Step 4: Check the automatic update.** **Ask the user first.** Pick a College match on or after 2026-10-31. Use a script to set it to `finished` with scores 80/70, then reload `/standings`: the winner gains 1 W, 3 PTS and +10, and the loser gains 1 L and −10. Restore the match to `upcoming`, with both scores 0, and confirm the table returns to its earlier values.
- [ ] **Step 5: Check RLS.** Send an anonymous REST `POST /rest/v1/standings_cutoffs` with the anon key from `.env`. Expected: 401/403 or an RLS error.
- [ ] **Step 6: Report** the results as run, with a screenshot of the College table.
