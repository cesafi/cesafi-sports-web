# Team Standings Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admins record each team's season wins/losses at `/admin/standings`; the public `/standings` page ranks teams per category automatically.

**Architecture:** A new `team_standings` table (PK = `schools_teams.id`, non-negative checks, admin-only RLS writes) stores manual totals. `StandingsService` reads active teams with their records in one embedded Supabase query and ranks each category with a pure `rankStandings`; `saveRecord` does optimistic-concurrency inserts/updates keyed on `updated_at`. Server actions enforce `admin`, validate with Zod and return typed `StandingsResult` codes; React Query hooks drive an inline-editing admin table and the public page is a server component.

**Tech Stack:** Next.js 16 (App Router, server actions), TypeScript, Supabase JS, Drizzle schema files, Zod v4, TanStack Query v5, shadcn/ui, sonner, Jest 30 + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-22-team-standings-design.md`

## Global Constraints

- Manual totals only; nothing derived from `matches`. No draws, points, win %, streaks.
- One record per team: `team_standings.team_id` is the primary key referencing `schools_teams(id)` `ON UPDATE CASCADE ON DELETE CASCADE`.
- `wins`, `losses`: integers; DB `CHECK (>= 0)`; Zod whole numbers `0`–`999` (`STANDINGS_MAX_VALUE = 999`).
- Ranking: wins desc → losses asc; shared rank only when wins **and** losses equal; competition numbering (1, 1, 3); display order of full ties: school name A–Z, then team name A–Z. If every team in a category is 0-0: `rank: null`, shown as "–", note "No results recorded yet".
- Only active teams (`schools_teams.is_active = true`) of the season are listed; categories without active teams are omitted.
- Writes: `admin` role only (`AuthService.checkAuth(['admin'])`), plus RLS `user_has_role(ARRAY['admin'::text])`.
- Error codes: `VALIDATION | UNAUTHENTICATED | FORBIDDEN | CONFLICT | NOT_FOUND | SERVER`. Never return Postgres codes/details/hints to the client; do **not** use `BaseService.formatError` in this feature.
- Exact copy:
  - wins/losses error: `"Wins must be a whole number from 0 to 999."` / `"Losses must be a whole number from 0 to 999."`
  - `"You must be signed in to update standings."`, `"You do not have permission to update standings."`, `"Please fix the highlighted fields."`
  - conflict: `"Someone else updated this team's record. The latest numbers have been loaded."`
  - not found: `"This team no longer exists."`
  - service failures: `"Could not load standings."`, `"Could not save the record. Please try again."`
  - public failure: `"Standings are temporarily unavailable. Please try again later."`
- Season label everywhere: `Season {id}` (`seasons` has no `name`). Category label: `"<Sport> · " + formatCategoryName(division, levels)` e.g. `Basketball · Men's College`.
- No hard-coded host/port; links are relative. No new npm dependencies.
- Work on branch `dev`. Commit only the task's files with `git commit -m "…" -- <paths>` (never stage the user's untracked `.claude/` or `schedule-csv/`). Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Never apply the migration to the database without the user's explicit yes in chat** (Task 10).

## Review Focus

1. **Saving the same row twice quickly**: the second save must send the new `updatedAt`, not trigger a false conflict — test in Task 6 (cache patched on success).
2. **Empty or odd number input** (`""`, `"-1"`, `"2.5"`, `"1000"`): inline error and Save disabled; an empty field must never save as 0 — test in Task 7.
3. **Postgres timestamp format** (`2026-10-22T03:04:05.123456+00:00`) must pass `expectedUpdatedAt` validation — test in Task 2.
4. **Embedded `team_standings` shape** (object, one-element array, `null`, empty array) must all map correctly — test in Task 3.
5. **Stale or foreign URL params** (`?season=999`, `?category=7` for a category with no teams, `?season=abc`) must fall back to defaults, not an empty page — test in Task 8.

---

### Task 1: Baseline and table definition

**Files:**
- Create: `supabase/migrations/20261022000000_add_team_standings.sql`
- Create: `scripts/migrate-team-standings.mjs`
- Create: `src/db/schema/team-standings.ts`
- Modify: `src/db/schema/index.ts` (add export)
- Modify: `database.types.ts` (add `team_standings` under `Tables`, alphabetical position after `sports_seasons_stages`)

**Interfaces:**
- Produces: table `public.team_standings(team_id uuid PK, wins int, losses int, created_at timestamptz, updated_at timestamptz)`; Drizzle export `teamStandings`, types `TeamStandings`, `NewTeamStandings`.

- [ ] **Step 1: Record baseline checks** (before any change). Run each and save output to the scratchpad as `baseline-*.txt`: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Note pass/fail and error counts; later tasks compare against these.

- [ ] **Step 2: Write the migration** exactly as spec §4, with these additions for re-runnability: `DROP TRIGGER IF EXISTS trigger_team_standings_updated_at ON public.team_standings;` before `CREATE TRIGGER`, and `DROP POLICY IF EXISTS "<name>" ON public.team_standings;` before each `CREATE POLICY`. End with `NOTIFY pgrst, 'reload schema';`.

- [ ] **Step 3: Write `scripts/migrate-team-standings.mjs`**, mirroring `scripts/migrate.mjs`: `config({ path: '.env.local' }); config();` (falls back to `.env`), read the SQL file, `await sql.unsafe(text)`, then print `await sql\`SELECT to_regclass('public.team_standings') AS t\`` and exit non-zero on error. Do **not** run it.

- [ ] **Step 4: Drizzle schema + types entry.** `src/db/schema/team-standings.ts` defines `teamStandings = pgTable('team_standings', { team_id: uuid PK, wins: integer notNull default 0, losses: integer notNull default 0, created_at/updated_at timestamptz mode 'string' defaultNow notNull })` following `schools-teams.ts` style; export from `index.ts`. Add the matching `Row/Insert/Update/Relationships` block to `database.types.ts` (relationship `team_standings_team_id_fkey` → `schools_teams.id`, `isOneToOne: true`).

- [ ] **Step 5: Verify** `npx tsc --noEmit` shows no errors beyond the baseline.

- [ ] **Step 6: Commit** — `feat(standings): add team_standings table migration and schema`.

---

### Task 2: Types and validation

**Files:**
- Rewrite: `src/lib/types/standings.ts`
- Rewrite: `src/lib/validations/standings.ts`
- Test: `src/lib/validations/standings.test.ts`

**Interfaces:**
- Produces (types): `RankedTeamStanding`, `CategoryStandings`, `SeasonStandings`, `StandingsErrorCode`, `StandingsFieldErrors`, `StandingsResult<T>` exactly as spec §5.1, plus
  `SavedTeamStanding = { teamId: string; wins: number; losses: number; updatedAt: string }` and
  `StandingsSortKey = 'rank' | 'school' | 'wins' | 'losses'`.
- Produces (validation): `STANDINGS_MAX_VALUE`, `winsSchema`, `lossesSchema` (exported; built by the spec §5.2 `winLossValue` helper), `updateTeamStandingSchema` (`z.strictObject`), `standingsSeasonIdSchema`, `standingsSearchParamsSchema`, `UpdateTeamStandingInput`.

- [ ] **Step 1: Write failing tests** in `standings.test.ts`:

```ts
const valid = { teamId: '3f1c2b7e-4a5d-4e6f-9a1b-2c3d4e5f6a7b', wins: 5, losses: 2, expectedUpdatedAt: null };

it('accepts a first save and a save with a Postgres timestamp', () => {
  expect(updateTeamStandingSchema.safeParse(valid).success).toBe(true);
  expect(updateTeamStandingSchema.safeParse({ ...valid, expectedUpdatedAt: '2026-10-22T03:04:05.123456+00:00' }).success).toBe(true);
  expect(updateTeamStandingSchema.safeParse({ ...valid, wins: 0, losses: 999 }).success).toBe(true);
});

it.each([
  ['negative wins', { wins: -1 }, 'wins', 'Wins must be a whole number from 0 to 999.'],
  ['decimal losses', { losses: 2.5 }, 'losses', 'Losses must be a whole number from 0 to 999.'],
  ['wins over 999', { wins: 1000 }, 'wins', 'Wins must be a whole number from 0 to 999.'],
  ['string wins', { wins: '5' }, 'wins', 'Wins must be a whole number from 0 to 999.'],
  ['bad team id', { teamId: 'abc' }, 'teamId', 'Invalid team.']
])('rejects %s', (_l, patch, field, message) => {
  const r = updateTeamStandingSchema.safeParse({ ...valid, ...patch });
  expect(r.success).toBe(false);
  expect(z.flattenError(r.error!).fieldErrors[field]).toEqual([message]);
});

it('rejects a malformed timestamp, missing fields and extra fields', () => {
  expect(updateTeamStandingSchema.safeParse({ ...valid, expectedUpdatedAt: 'yesterday' }).success).toBe(false);
  const { losses: _omit, ...missing } = valid;
  expect(updateTeamStandingSchema.safeParse(missing).success).toBe(false);
  expect(updateTeamStandingSchema.safeParse({ ...valid, rank: 1 }).success).toBe(false);
});

it('season id must be a positive integer', () => {
  expect(standingsSeasonIdSchema.safeParse(26).success).toBe(true);
  [0, -1, 1.5, '26'].forEach((v) => expect(standingsSeasonIdSchema.safeParse(v).success).toBe(false));
});

it('search params fall back to undefined on junk', () => {
  expect(standingsSearchParamsSchema.parse({ season: '26', category: '3' })).toEqual({ season: 26, category: 3 });
  expect(standingsSearchParamsSchema.parse({ season: 'abc', category: '-2' })).toEqual({ season: undefined, category: undefined });
  expect(standingsSearchParamsSchema.parse({})).toEqual({ season: undefined, category: undefined });
});
```

- [ ] **Step 2: Run** `npx jest src/lib/validations/standings.test.ts` — expect FAIL (exports missing).
- [ ] **Step 3: Implement** both files per spec §5.1–5.2 and the Interfaces above. `teamId: z.uuid({ error: 'Invalid team.' })`; `expectedUpdatedAt: z.iso.datetime({ offset: true }).nullable()`. Old type/schema exports are removed (their only consumers are rewritten or deleted in Tasks 3–8; `tsc` errors in those files are expected until then).
- [ ] **Step 4: Run** the test file — expect PASS.
- [ ] **Step 5: Commit** — `feat(standings): add standings types and zod schemas`.

---

### Task 3: Ranking and season read

**Files:**
- Rewrite: `src/services/standings.ts` (remove all old methods and `// @ts-nocheck`)
- Test: `src/services/standings.test.ts`

**Interfaces:**
- Consumes: Task 2 types.
- Produces:
  - `export function rankStandings<T extends { wins: number; losses: number; teamName: string; school: { name: string } }>(rows: T[]): { teams: (T & { rank: number | null })[]; hasResults: boolean }`
  - `StandingsService.getSeasonStandings(seasonId: number): Promise<StandingsResult<SeasonStandings>>`

- [ ] **Step 1: Write failing tests.** Mock `./base` like `src/services/matches.test.ts`, with a fake `getClient()` whose `from(table)` builder supports `select`, `eq` (filters on row fields), `insert`, `update`, `single`, `maybeSingle`, thenable resolution, and a per-test override to return `{ data: null, error: { code, message } }`. Fixture helper `team(id, school, category, record?, extra?)` builds `schools_teams` rows with embedded `school`, `sports_categories: { id, division, levels, sports: { name } }` and `team_standings`.

```ts
describe('rankStandings', () => {
  it('orders by wins then fewer losses with competition ranks', () => {
    const r = rankStandings([row('A', 5, 3), row('B', 5, 0), row('C', 7, 1), row('D', 5, 0)]);
    expect(r.teams.map((t) => [t.school.name, t.rank])).toEqual([['C', 1], ['B', 2], ['D', 2], ['A', 4]]);
    expect(r.hasResults).toBe(true);
  });
  it('orders full ties by school then team name', () => {
    const r = rankStandings([row('Zeta', 1, 1, 'Team'), row('Alpha', 1, 1, 'Team B'), row('Alpha', 1, 1, 'Team A')]);
    expect(r.teams.map((t) => t.teamName)).toEqual(['Team A', 'Team B', 'Team']);
    expect(r.teams.every((t) => t.rank === 1)).toBe(true);
  });
  it('returns null ranks when nobody has played', () => {
    const r = rankStandings([row('B', 0, 0), row('A', 0, 0)]);
    expect(r).toEqual({ hasResults: false, teams: [expect.objectContaining({ rank: null }), expect.objectContaining({ rank: null })] });
    expect(r.teams[0].school.name).toBe('A');
  });
  it('handles empty input', () => expect(rankStandings([])).toEqual({ teams: [], hasResults: false }));
});

describe('getSeasonStandings', () => {
  it('maps missing records to 0-0 and keeps only active teams of the season');      // updatedAt null, inactive + other-season rows absent
  it('maps team_standings given as object, one-element array, empty array or null'); // Review Focus 4
  it('groups by category, ranks each independently, orders by sport name then category id');
  it('labels categories "Basketball · Men\'s College" and maps empty logo_url to null');
  it('returns SERVER "Could not load standings." without DB details on error');      // error.message must not appear
});
```

- [ ] **Step 2: Run** `npx jest src/services/standings.test.ts` — expect FAIL.
- [ ] **Step 3: Implement.** `rankStandings`: sort with `(b.wins - a.wins) || (a.losses - b.losses) || a.school.name.localeCompare(b.school.name) || a.teamName.localeCompare(b.teamName)`; rank = 1 + count of rows with more wins, or equal wins and fewer losses; `hasResults = rows.some(r => r.wins + r.losses > 0)`; when false all ranks `null`.
  `getSeasonStandings`: one query on `schools_teams` with select
  `id, name, school:schools!inner(id, name, abbreviation, logo_url), sports_categories!sport_category_id!inner(id, division, levels, sports!inner(name)), team_standings(wins, losses, updated_at)`
  filtered `.eq('season_id', seasonId).eq('is_active', true)`. Normalize the embed with `Array.isArray(x) ? x[0] ?? null : x ?? null`. `logoUrl: logo_url || null`. On error: `console.error` the raw error, return the SERVER result. Category label uses `formatCategoryName` from `@/lib/utils/sports`.
- [ ] **Step 4: Run** the test file — expect PASS.
- [ ] **Step 5: Commit** — `feat(standings): rank teams and read season standings`.

---

### Task 4: Saving a record

**Files:**
- Modify: `src/services/standings.ts`
- Test: `src/services/standings.test.ts`

**Interfaces:**
- Produces: `StandingsService.saveRecord(input: UpdateTeamStandingInput): Promise<StandingsResult<SavedTeamStanding>>`

- [ ] **Step 1: Write failing tests** (`describe('saveRecord')`):

```ts
it('inserts when there is no record yet');                         // insert payload { team_id, wins, losses }; returns { teamId, wins, losses, updatedAt }
it('updates when updated_at matches');                             // update filtered by team_id AND updated_at
it('reports CONFLICT when the record changed (0 rows, record exists)');
it('reports NOT_FOUND when the update hits nothing and no record exists');
it.each([['23505', 'CONFLICT'], ['23503', 'NOT_FOUND'], ['23514', 'VALIDATION']])('maps insert error %s to %s');
it('reports SERVER "Could not save the record. Please try again." for other errors, without details');
```
Each result's `error` must equal the exact Global Constraints copy for its code (`VALIDATION` here uses `"Please fix the highlighted fields."`).

- [ ] **Step 2: Run** — expect FAIL.
- [ ] **Step 3: Implement** per spec §5.3. Insert: `.insert({ team_id, wins, losses }).select('team_id, wins, losses, updated_at').single()`. Update: `.update({ wins, losses }).eq('team_id', teamId).eq('updated_at', expectedUpdatedAt).select('team_id, wins, losses, updated_at')`; 0 rows → `.select('team_id').eq('team_id', teamId).maybeSingle()` decides CONFLICT vs NOT_FOUND. Pass `expectedUpdatedAt` through as the exact string received (never via `Date`).
- [ ] **Step 4: Run** — expect PASS.
- [ ] **Step 5: Commit** — `feat(standings): save records with optimistic concurrency`.

---

### Task 5: Server actions and revalidation

**Files:**
- Rewrite: `src/actions/standings.ts`
- Modify: `src/lib/utils/revalidation.ts` (add `static revalidateStandings()` → `revalidatePath('/admin/standings'); revalidatePath('/standings');`)
- Test: `src/actions/standings.test.ts`

**Interfaces:**
- Consumes: `StandingsService.getSeasonStandings`, `StandingsService.saveRecord`, Task 2 schemas.
- Produces: `getStandings(seasonId: unknown): Promise<StandingsResult<SeasonStandings>>`, `updateTeamStanding(input: unknown): Promise<StandingsResult<SavedTeamStanding>>`, `RevalidationHelper.revalidateStandings(): void`.

- [ ] **Step 1: Write failing tests**, mocking `@/services/auth`, `@/services/standings`, `@/lib/utils/revalidation` as in `src/actions/match-import.test.ts`:

```ts
it('rejects signed-out users without saving');    // { success:false, code:'UNAUTHENTICATED', error:'You must be signed in to update standings.' }
it('rejects league operators without saving');    // code 'FORBIDDEN', 'You do not have permission to update standings.'
it('asks for the admin role');                    // checkAuth called with ['admin']
it('rejects invalid input with field errors');    // wins:-1 → code 'VALIDATION', error 'Please fix the highlighted fields.', fieldErrors.wins = ['Wins must be a whole number from 0 to 999.']; saveRecord not called
it('returns the saved record and revalidates once on success');
it('does not revalidate when saving fails');      // service returns CONFLICT → returned as-is
it('getStandings rejects a bad season id without calling the service'); // '26' → code 'VALIDATION'
it('getStandings returns the service result');
```

- [ ] **Step 2: Run** — expect FAIL.
- [ ] **Step 3: Implement** (`'use server'`) per spec §5.4: auth → `safeParse` → service → revalidate on success. `fieldErrors` from `z.flattenError(parsed.error).fieldErrors`. `getStandings` on invalid id returns `{ success:false, code:'VALIDATION', error:'Invalid season.' }`.
- [ ] **Step 4: Run** — expect PASS.
- [ ] **Step 5: Commit** — `feat(standings): add standings server actions`.

---

### Task 6: Hooks

**Files:**
- Rewrite: `src/hooks/use-standings.ts` (`'use client'`, no `@ts-nocheck`)
- Test: `src/hooks/use-standings.test.tsx`

**Interfaces:**
- Consumes: Task 5 actions.
- Produces:
  - `standingsKeys = { all: ['standings'] as const, season: (id: number) => ['standings', 'season', id] as const }`
  - `useSeasonStandings(seasonId?: number): UseQueryResult<SeasonStandings, Error>` (`enabled: !!seasonId`; throws `new Error(result.error)` on failure)
  - `useUpdateTeamStanding(seasonId: number)`: `useMutation<StandingsResult<SavedTeamStanding>, Error, { input: UpdateTeamStandingInput; teamName: string }>`; resolves with the action result (does not throw on business failures)
  - `useStandingsTable(seasonId?: number): { categories: CategoryStandings[]; selectedCategoryId: number | null; setSelectedCategoryId(id: number): void; search: string; setSearch(v: string): void; sortKey: StandingsSortKey; setSortKey(k: StandingsSortKey): void; rows: RankedTeamStanding[]; isLoading: boolean; error: Error | null; refetch(): void }`

- [ ] **Step 1: Write failing tests** with `renderHook` + `QueryClientProvider` (retry off), mocking `@/actions/standings` and `sonner`:

```ts
it('useStandingsTable selects the first category and switches categories');
it('filters by school name, abbreviation or team name, case-insensitively');
it('sorts: rank asc (default), school A–Z, wins desc, losses desc');   // ties within a key keep rank order
it('resets the selection when the selected category disappears');
it('on success patches the cached row with the new wins/losses/updatedAt, toasts "<team> updated to 5-2", and invalidates the season'); // Review Focus 1
it('on CONFLICT or NOT_FOUND toasts the error message and invalidates the season');
it('on VALIDATION shows no toast and resolves with fieldErrors');
```

- [ ] **Step 2: Run** `npx jest src/hooks/use-standings.test.tsx` — expect FAIL.
- [ ] **Step 3: Implement.** In `onSuccess`, when `result.success`: `queryClient.setQueryData(standingsKeys.season(seasonId), patch)` replacing that team's `wins`, `losses`, `updatedAt`, then `invalidateQueries` (ranks refresh on refetch). Sorting/filtering live in `useMemo` inside `useStandingsTable`; ranks are never recomputed client-side.
- [ ] **Step 4: Run** — expect PASS.
- [ ] **Step 5: Commit** — `feat(standings): add standings react-query hooks`.

---

### Task 7: Admin standings tab

**Files:**
- Create: `src/components/admin/standings/standings-row.tsx`, `standings-manager.tsx`, `index.ts`
- Create: `src/app/(protected)/admin/standings/page.tsx`
- Modify: `src/components/dashboard/dashboard-sidebar.tsx` (admin Seasonal items: add `{ href: '/admin/standings', label: 'Standings', icon: ListOrdered }` after School Teams)
- Modify: `src/lib/routes.ts` (`'/admin/standings'` in `PROTECTED_ROUTES`; `/^\/admin\/standings$/` in `ROUTE_PATTERNS.protected`)
- Test: `src/components/admin/standings/standings-row.test.tsx`

**Interfaces:**
- Consumes: `useStandingsTable`, `useUpdateTeamStanding`, `winsSchema`, `lossesSchema`, `getSchoolLogoUrl`.
- Produces: `StandingsRow({ team: RankedTeamStanding; onSave(values: { wins: number; losses: number }): Promise<StandingsResult<SavedTeamStanding>> })` (renders a `TableRow`); `StandingsManager({ seasonId: number })`.

- [ ] **Step 1: Write failing row tests** (render inside `<table><tbody>`):

```ts
it('shows Save and Reset only after a value changes; Reset restores saved values');
it.each(['', '-1', '2.5', '1000'])('wins "%s" shows the error and disables Save', async (value) => {
  // type value into "Wins for <team>"; expect text 'Wins must be a whole number from 0 to 999.';
  // Save button disabled; clicking it never calls onSave.  (Review Focus 2)
});
it('calls onSave with numbers and disables Save while saving');      // double click → onSave called once
it('shows server fieldErrors under the matching input');
it('shows "–" when rank is null');
it('resets its draft when the team prop changes (e.g. after a conflict reload)');
```
Inputs are found by `getByLabelText('Wins for <team name>')` / `'Losses for <team name>'`.

- [ ] **Step 2: Run** — expect FAIL.
- [ ] **Step 3: Implement `StandingsRow`.** Draft values are strings; validity via `winsSchema.safeParse(draft === '' ? NaN : Number(draft))` so an empty field is invalid. Columns per spec §6.1 (Rank, Team with logo/team/school, Wins, Losses, Actions). `useEffect` on `[team.updatedAt, team.wins, team.losses]` resets the draft and clears errors.
- [ ] **Step 4: Run** — expect PASS.
- [ ] **Step 5: Implement `StandingsManager`, page, sidebar, routes** per spec §6.1: tabs labelled `category.name` + team count, search `Input` ("Search school or team"), sort `Select` (Rank / School A–Z / Most wins / Most losses), skeleton rows while loading, error panel with Retry, empty state "No active teams in Season {id}. Add teams under School Teams." linking `/admin/school-teams`, no-match state "No teams match '{query}'". `onSave` calls `mutateAsync({ input: { teamId, wins, losses, expectedUpdatedAt: team.updatedAt }, teamName })`. The page (`'use client'`) shows the "No Season Selected" block from `admin/school-teams/page.tsx` when `useSeason().currentSeason` is null.
- [ ] **Step 6: Verify** `npx jest src/components/admin/standings` passes and `npx tsc --noEmit` shows no new errors in these files.
- [ ] **Step 7: Commit** — `feat(standings): add admin standings management tab`.

---

### Task 8: Public standings page and removals

**Files:**
- Create: `src/lib/utils/standings-selection.ts` + test `src/lib/utils/standings-selection.test.ts`
- Create: `src/components/standings/standings-view.tsx`, `standings-table.tsx`, `standings-filters.tsx` + test `src/components/standings/standings-table.test.tsx`
- Create: `src/app/(public)/standings/page.tsx`, `src/app/(public)/standings/loading.tsx`
- Delete (`git rm`): `src/app/(public)/standings/[[...slug]]/page.tsx`, `src/components/standings/{bracket-visualization,playins-list,group-stage-table,season-sidebar,standings-navbar,standings-content}.tsx`
- Modify: `src/lib/routes.ts` (remove `'/standings/[[...slug]]'`; public pattern `/^\/standings$/`)
- Modify: `src/components/players/players-grid.tsx` (use `getAllSeasons` from `@/actions/seasons`; label `Season ${s.id}`; newest `start_at` first)

**Interfaces:**
- Consumes: `getStandings` (Task 5), `getAllSeasons`, `CategoryStandings`.
- Produces:
  - `pickDefaultSeasonId(seasons: { id: number; start_at: string; end_at: string }[], now: Date): number | null` — season whose range contains `now`, else greatest `start_at`, else `null`
  - `resolveSeasonId(seasons, requested: number | undefined, now: Date): number | null` — `requested` if it is in `seasons`, else default
  - `resolveCategoryId(categories: CategoryStandings[], requested: number | undefined): number | null` — `requested` if present, else `null` (= All)
  - `StandingsTable({ category: CategoryStandings })`, `StandingsFilters({ seasonIds: number[]; seasonId: number; categories: { id: number; name: string }[]; categoryId: number | null })`, `StandingsView({ seasonIds: number[]; seasonId: number | null; standings: SeasonStandings | null; categoryId: number | null; loadFailed: boolean })` — all server-renderable (no `'use client'`).

- [ ] **Step 1: Write failing tests.**

```ts
// standings-selection.test.ts — Review Focus 5
it('defaults to the season containing today, else the latest start');
it('ignores an unknown requested season');           // 999 → default
it('returns null when there are no seasons');
it('keeps a known category and falls back to All for an unknown one'); // 7 not in list → null

// standings-table.test.tsx
it('renders a captioned table with Rank, Team, W, L column headers');  // <caption> = category.name, th scope="col"
it('shows "No results recorded yet" and "–" ranks labelled "Not ranked yet" when hasResults is false');
it('uses the CESAFI logo when a school has no logo');                   // src contains cesafi-logo.webp, alt = school name
```

- [ ] **Step 2: Run** both test files — expect FAIL.
- [ ] **Step 3: Implement the helpers and components** per spec §6.2. Keep the existing hero markup from `standings-content.tsx` (heading "League Standings", subtitle, gradient + grid pattern) in `StandingsView`; category sections use the old group-table header style (primary bar, `moderniz` title, "N Teams" badge) and card table with colored top-3 ranks. Logo: `team.school.logoUrl ?? '/img/cesafi-logo.webp'` (do not import `use-school-logos`, it pulls client hooks). Filters are `<Link>`s: `/standings?season={id}` and `/standings?season={id}&category={id}`, active chip `aria-current="page"`; season chips only when `seasonIds.length > 1`. Empty states and failure copy per spec §6.2.
- [ ] **Step 4: Implement the page.** `searchParams: Promise<Record<string, string | string[] | undefined>>` → `standingsSearchParamsSchema.parse` → `getAllSeasons()` → `resolveSeasonId(..., new Date())` → `getStandings(seasonId)` when a season exists → `resolveCategoryId` → `<StandingsView …>`. Keep the page `metadata` if `[[...slug]]/page.tsx` or `src/app/metadata.ts` defines one for standings; drop `export const revalidate`. `loading.tsx` renders the existing `StandingsLoading`.
- [ ] **Step 5: Remove old files, update routes and players-grid.** Then `grep -rn "standings-content\|use-standings'\|getAvailableSeasons\|esport_category_id" src` must only show the new hook import paths.
- [ ] **Step 6: Run** `npx jest src/lib/utils/standings-selection.test.ts src/components/standings` — expect PASS; `npx tsc --noEmit` — no errors beyond baseline.
- [ ] **Step 7: Commit** — `feat(standings): rebuild public standings page on manual records` (include deletions and players-grid fix).

---

### Task 9: Documentation

**Files:**
- Modify: `docs/PUBLIC_MODULES_GUIDE.md` §4 League Standings (route `/standings`, `?season=&category=`, per-category ranked tables, ranking rule, "–" when no results)
- Modify: `docs/ADMIN_USER_GUIDE.md` (new "Standings" section: where it is, editing W/L inline, validation limits, conflict message, admin-only)
- Modify: `docs/INDEX.md` (add "Record team wins and losses" → `ADMIN_USER_GUIDE.md` Standings section to the Quick Navigation table)

- [ ] **Step 1: Update the docs** with the behaviour above, using the Global Constraints copy for limits and ranking.
- [ ] **Step 2: Commit** — `docs(standings): document standings management and public page`.

---

### Task 10: Apply migration, verify, report

- [ ] **Step 1: Ask the user in chat** to approve running `node --env-file=.env scripts/migrate-team-standings.mjs` against the Supabase database (additive: creates `team_standings`, trigger, RLS policies). Do not proceed without an explicit yes.
- [ ] **Step 2: Apply and confirm** the script prints `team_standings`; read-only query `pg_policies` for the table shows the four policies.
- [ ] **Step 3: RLS check.** Anonymous REST insert using `NEXT_PUBLIC_SUPABASE_URL` + anon key: `POST /rest/v1/team_standings` with `{ "team_id": "<random uuid>", "wins": 1, "losses": 0 }` → expect 401/403 (RLS violation), never 201.
- [ ] **Step 4: Project checks.** Run `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`; compare with the Task 1 baseline; fix anything new.
- [ ] **Step 5: Live check — public.** `preview_start next-dev`; `/standings` shows each category with "No results recorded yet"; `?season=abc&category=999` falls back; 375 px viewport readable without horizontal page scroll; keyboard tab order through chips. `/players` season filter lists `Season 26`.
- [ ] **Step 6: Live check — admin.** Ask the user to sign in as admin in the browser pane (never enter credentials). Edit one team (note original values), see inline error for `-1`, save `3-1`, see toast and rank, confirm `/standings` shows it; then restore the original values (0-0 if it had no record).
- [ ] **Step 7: Report** files changed, DB change, behaviour, exact check results vs baseline, and remaining issues.
