# Team Standings Management — Design

**Date:** 2026-10-22
**Status:** Approved in brainstorming, pending written-spec review
**Routes:** `/admin/standings` (new), `/standings` (rebuilt)

## 1. Goal

Let administrators record each team's season win/loss totals, and show a public `/standings`
page that ranks teams within their category automatically.

Success = an admin opens **Standings** in the admin sidebar, picks a category, types a team's wins
and losses, saves, and the public `/standings` page immediately shows the new numbers with
ranks recalculated. Non-admins cannot change anything, invalid numbers are rejected with clear
messages, and two admins editing the same team cannot silently overwrite each other.

## 2. Decisions (from brainstorming)

| Topic | Decision |
|---|---|
| Source of truth | **Manual totals** typed by admins. Nothing is derived from `matches`. |
| Old standings code | **Replace and remove** the ported esports standings (match-derived service, bracket / play-ins / group-stage components, missing RPC). Git history keeps them. |
| Record scope | **One record per team** (`schools_teams` row). A team already belongs to exactly one season and one category, so ranking is per category within a season. No per-stage records. |
| Ranking | Wins descending, then losses ascending. Teams share a rank only when wins **and** losses are equal. Competition numbering (1, 1, 3). |
| Display order of full ties | School name A–Z, then team name A–Z. Display only; never changes rank. |
| No results yet | If every team in a category is 0-0, rank shows "–" and the category shows "No results recorded yet". |
| Draws | Not supported. A record is wins and losses only. |
| Value bounds | Whole numbers 0–999 (999 is a sanity cap against typos). DB enforces `>= 0`. |
| Permissions | **Admin only.** League operators, writers and anonymous users cannot write. |
| Team list | Every **active** team in the season appears automatically, 0-0 until saved. First save creates the record; later saves update it. Inactive teams are hidden but keep their record. Deleting a team deletes its record. |
| Concurrency | Optimistic: a save carries the `updated_at` the admin loaded; a stale save is rejected as a conflict. |
| Approach | New `team_standings` table + ranking in a pure TypeScript function in the service layer. |
| Branch | Work directly on `dev`. |

## 3. Context (current codebase)

- Architecture: UI → hooks (React Query) → server actions (`'use server'`, Zod, `AuthService.checkAuth`)
  → services (`BaseService`, `ServiceResponse<T>`) → Supabase / Drizzle. Most services use the
  Supabase client (`getClient()`), which applies RLS with the caller's session; only the CSV
  import uses Drizzle.
- Admin layout gates on `userRole === 'admin'`; middleware uses `ROLE_ROUTES`; actions must still
  check roles themselves (match import precedent).
- `schools_teams` (uuid `id`, `school_id`, `sport_category_id`, `season_id`, `name`, `is_active`)
  is the team entity. Season 26 has 40 active teams in 4 basketball categories. No duplicate
  school+category+season rows exist, but nothing prevents them.
- `seasons` has no `name` column; the UI labels seasons `Season {id}`.
- `formatCategoryName(division, levels)` in `src/lib/utils/sports.ts`; `getSchoolLogoUrl(logoUrl)`
  in `src/hooks/use-school-logos.ts`; Supabase and Cloudinary hosts are allowed in `next.config.ts`.
- The current `/standings` page is broken against the live DB: it queries `seasons.name`,
  `sports_seasons_stages.stage_type`, `sports_categories.esport_id` and an RPC
  `get_group_stage_standings`, none of which exist (hidden by `@ts-nocheck`). It renders
  "No Data Available".
- `src/components/players/players-grid.tsx` imports `getAvailableSeasons` from
  `@/actions/standings` and is broken for the same reason (`seasons.name`).
- Migrations are not tracked in the DB: SQL lives in `supabase/migrations/` and is applied by hand;
  Drizzle schema files are maintained by hand.
- `BaseService.formatError` puts Postgres codes, details and hints into the error string. This
  feature must not return those to the browser.

## 4. Data model

### Migration `supabase/migrations/20261022000000_add_team_standings.sql`

```sql
CREATE TABLE IF NOT EXISTS public.team_standings (
  team_id    UUID PRIMARY KEY
             REFERENCES public.schools_teams(id) ON UPDATE CASCADE ON DELETE CASCADE,
  wins       INTEGER NOT NULL DEFAULT 0 CONSTRAINT team_standings_wins_non_negative CHECK (wins >= 0),
  losses     INTEGER NOT NULL DEFAULT 0 CONSTRAINT team_standings_losses_non_negative CHECK (losses >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.update_team_standings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_team_standings_updated_at
  BEFORE UPDATE ON public.team_standings
  FOR EACH ROW EXECUTE FUNCTION public.update_team_standings_updated_at();

ALTER TABLE public.team_standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view team standings"
  ON public.team_standings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert team standings"
  ON public.team_standings FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['admin'::text]));

CREATE POLICY "Admins can update team standings"
  ON public.team_standings FOR UPDATE TO authenticated
  USING (public.user_has_role(ARRAY['admin'::text]))
  WITH CHECK (public.user_has_role(ARRAY['admin'::text]));

CREATE POLICY "Admins can delete team standings"
  ON public.team_standings FOR DELETE TO authenticated
  USING (public.user_has_role(ARRAY['admin'::text]));

NOTIFY pgrst, 'reload schema';
```

- `team_id` as primary key guarantees at most one record per team (no duplicate standings).
- Additive only; no existing table or row is changed.
- Applied with a small script mirroring `scripts/migrate.mjs`, **only after the user confirms**.

### Code-side schema

- `src/db/schema/team-standings.ts` (Drizzle table definition) + export from `src/db/schema/index.ts`.
- `database.types.ts`: add the `team_standings` Row / Insert / Update / Relationships entry by
  hand to match the migration (regeneration needs the Supabase CLI + Docker).

## 5. Architecture

### Files

| Layer | File | Change |
|---|---|---|
| Types | `src/lib/types/standings.ts` | **Rewrite.** View-model and result types (§5.1). |
| Validation | `src/lib/validations/standings.ts` | **Rewrite.** Zod schemas (§5.2). |
| Service | `src/services/standings.ts` | **Rewrite.** `StandingsService` + pure `rankStandings` (§5.3). |
| Actions | `src/actions/standings.ts` | **Rewrite.** `getStandings`, `updateTeamStanding` (§5.4). |
| Hooks | `src/hooks/use-standings.ts` | **Rewrite.** Query keys, query, mutation, table view-model (§5.5). |
| Revalidation | `src/lib/utils/revalidation.ts` | Add `revalidateStandings()`. |
| Admin page | `src/app/(protected)/admin/standings/page.tsx` | **New.** |
| Admin UI | `src/components/admin/standings/` (`index.ts`, `standings-manager.tsx`, `standings-row.tsx`) | **New.** |
| Public page | `src/app/(public)/standings/page.tsx`, `loading.tsx` | **New**, replacing `standings/[[...slug]]/page.tsx`. |
| Public UI | `src/components/standings/` (`standings-view.tsx`, `standings-table.tsx`, `standings-filters.tsx`, `standings-loading.tsx` kept) | New files; old ones deleted (§7). |
| Sidebar | `src/components/dashboard/dashboard-sidebar.tsx` | Add `{ href: '/admin/standings', label: 'Standings' }` to the admin Seasonal section. |
| Routes | `src/lib/routes.ts` | Add `/admin/standings` + pattern; remove `/standings/[[...slug]]`; public pattern becomes `/^\/standings$/`. |
| Players | `src/components/players/players-grid.tsx` | Use `getAllSeasons` from `@/actions/seasons`. |
| Docs | `docs/PUBLIC_MODULES_GUIDE.md` §4, `docs/ADMIN_USER_GUIDE.md` | Describe the new behaviour. |

### 5.1 Types

```ts
export interface RankedTeamStanding {
  teamId: string;
  teamName: string;
  school: { id: string; name: string; abbreviation: string; logoUrl: string | null };
  wins: number;
  losses: number;
  rank: number | null;        // null when the category has no results yet
  updatedAt: string | null;   // null = no record saved yet (shown as 0-0)
}

export interface CategoryStandings {
  category: { id: number; sportName: string; division: string; levels: string; name: string };
  hasResults: boolean;        // false when every team is 0-0
  teams: RankedTeamStanding[];
}

export interface SeasonStandings {
  seasonId: number;
  categories: CategoryStandings[];
}

export type StandingsErrorCode =
  | 'VALIDATION' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'CONFLICT' | 'NOT_FOUND' | 'SERVER';

export type StandingsFieldErrors = Partial<Record<'teamId' | 'wins' | 'losses', string[]>>;

export type StandingsResult<T> =
  | { success: true; data: T }
  | { success: false; code: StandingsErrorCode; error: string; fieldErrors?: StandingsFieldErrors };
```

`category.name` is `"<Sport> · <formatCategoryName(division, levels)>"`, e.g. `Basketball · Men's College`.

### 5.2 Validation

```ts
export const STANDINGS_MAX_VALUE = 999;

const winLossValue = (label: 'Wins' | 'Losses') => {
  const message = `${label} must be a whole number from 0 to ${STANDINGS_MAX_VALUE}.`;
  return z
    .number({ error: message })
    .int({ error: message })
    .min(0, { error: message })
    .max(STANDINGS_MAX_VALUE, { error: message });
};

export const updateTeamStandingSchema = z.strictObject({
  teamId: z.uuid({ error: 'Invalid team.' }),
  wins: winLossValue('Wins'),
  losses: winLossValue('Losses'),
  expectedUpdatedAt: z.iso.datetime({ offset: true }).nullable()
});

export const standingsSeasonIdSchema = z.number().int().positive();

// Public page search params: bad values fall back to defaults instead of erroring.
export const standingsSearchParamsSchema = z.object({
  season: z.coerce.number().int().positive().optional().catch(undefined),
  category: z.coerce.number().int().positive().optional().catch(undefined)
});

export type UpdateTeamStandingInput = z.infer<typeof updateTeamStandingSchema>;
```

The admin row reuses `updateTeamStandingSchema.shape.wins` / `.losses` for its inline checks so
client and server messages are identical.

### 5.3 Service

`src/services/standings.ts` exports:

**`rankStandings(rows)`** — pure, no I/O.

- Input: rows with `wins`, `losses`, `school.name`, `teamName`.
- Sort: wins desc → losses asc → school name A–Z → team name A–Z (`localeCompare`).
- Rank: `1 + count(rows strictly better)`, where better = more wins, or equal wins and fewer losses.
- `hasResults = rows.some(r => r.wins + r.losses > 0)`. When false, every `rank` is `null`.
- Returns `{ teams, hasResults }`. Empty input → `{ teams: [], hasResults: false }`.

**`StandingsService.getSeasonStandings(seasonId): Promise<StandingsResult<SeasonStandings>>`**

- One Supabase query on `schools_teams`, filtered `season_id = seasonId` and `is_active = true`,
  embedding `school:schools!inner(id, name, abbreviation, logo_url)`,
  `sports_categories!sport_category_id!inner(id, division, levels, sports!inner(name))` and
  `team_standings(wins, losses, updated_at)`.
- Missing `team_standings` → `wins: 0, losses: 0, updatedAt: null`.
- Group by category; rank each group with `rankStandings`; order categories by sport name, then
  category id. Categories without active teams are not returned.
- On DB error: log server-side, return `{ code: 'SERVER', error: 'Could not load standings.' }`.

**`StandingsService.saveRecord(input: UpdateTeamStandingInput): Promise<StandingsResult<SavedTeamStanding>>`**

`SavedTeamStanding = { teamId: string; wins: number; losses: number; updatedAt: string }`
(declared in `src/lib/types/standings.ts`).

- `expectedUpdatedAt === null` → `insert({ team_id, wins, losses }).select().single()`.
  - `23505` (unique) → `CONFLICT`
  - `23503` (FK) → `NOT_FOUND` ("This team no longer exists.")
  - `23514` (check) → `VALIDATION`
- Otherwise → `update({ wins, losses }).eq('team_id', teamId).eq('updated_at', expectedUpdatedAt).select()`.
  - 1 row → success with the new `updated_at`.
  - 0 rows → look up the record by `team_id`: it exists → `CONFLICT`; it does not → `NOT_FOUND`.
- Conflict message: "Someone else updated this team's record. The latest numbers have been loaded."
- Any other error → logged server-side, `SERVER` with "Could not save the record. Please try again."
- Never returns Postgres codes, details or hints.

### 5.4 Server actions

```ts
export async function getStandings(seasonId: unknown): Promise<StandingsResult<SeasonStandings>>
```
Public, read-only. Validates `seasonId` with `standingsSeasonIdSchema` (`VALIDATION` on failure),
then calls the service.

```ts
export async function updateTeamStanding(input: unknown): Promise<StandingsResult<{ teamId; wins; losses; updatedAt }>>
```
1. `AuthService.checkAuth(['admin'])`
   - not authenticated → `UNAUTHENTICATED`, "You must be signed in to update standings."
   - not authorized → `FORBIDDEN`, "You do not have permission to update standings."
2. `updateTeamStandingSchema.safeParse(input)` → on failure `VALIDATION`, "Please fix the
   highlighted fields.", `fieldErrors` from `z.flattenError(...).fieldErrors`.
3. `StandingsService.saveRecord(data)`.
4. On success only: `RevalidationHelper.revalidateStandings()`, which does
   `revalidatePath('/admin/standings')` and `revalidatePath('/standings')`.

The service is never called when steps 1 or 2 fail.

### 5.5 Hooks (`src/hooks/use-standings.ts`)

- `standingsKeys = { all: ['standings'], season: (id) => ['standings', 'season', id] }`.
- `useSeasonStandings(seasonId?: number)`: `useQuery` around `getStandings`; throws `error` on
  failure so React Query exposes it; `enabled: !!seasonId`.
- `useUpdateTeamStanding(seasonId)`: `useMutation` around `updateTeamStanding`.
  - success → invalidate `standingsKeys.season(seasonId)`; toast
    `"<team name> updated to <W>-<L>"`.
  - `CONFLICT` / `NOT_FOUND` → toast error with the message; invalidate the season query.
  - `VALIDATION` → no toast; the row shows `fieldErrors`.
  - other failures → toast error with the safe message.
- `useStandingsTable(seasonId?: number)`: composes `useSeasonStandings` with UI state —
  selected category id (defaults to the first category; resets if it disappears), search text
  (matches school name, abbreviation or team name, case-insensitive), sort key
  (`rank` default | `school` | `wins` | `losses`) and direction. Returns the categories (for tabs),
  the visible rows, and `isLoading` / `error` / `refetch`. Sorting the visible rows is
  presentation only; ranks always come from the service.

## 6. UI

### 6.1 Admin — `/admin/standings`

- Page wraps `StandingsManager`, using `useSeason().currentSeason`. No season →
  "No Season Selected" message (same as School Teams).
- Header: title "Standings", subtitle "Season {id} · wins and losses by category".
- Category tabs (shadcn `Tabs`), one per category returned, labelled with `category.name` and team count.
- Toolbar: search input ("Search school or team") and sort `Select`
  (Rank, School A–Z, Most wins, Most losses).
- Table (shadcn `Table` inside a `Card`) columns: **Rank**, **Team** (logo, team name, school
  name), **Wins**, **Losses**, **Actions**.
  - Wins / Losses are `<Input type="number" inputMode="numeric" min=0 max=999 step=1>` with
    `aria-label="Wins for <team name>"`.
  - Row keeps local draft values. **Save** and **Reset** appear when the draft differs from the
    saved values. Save is disabled while a draft is invalid or the row is saving
    (spinner on the button).
  - Inline errors under each input use the shared Zod field schemas; server `fieldErrors`
    render in the same place.
  - Rank shows "–" when `rank === null`.
- States: loading skeleton rows; error panel with **Retry**; no categories → "No active teams in
  Season {id}. Add teams under School Teams." with a link to `/admin/school-teams`; search with no
  matches → "No teams match '<query>'".
- `DataTable` is not used: it is built around server pagination and modal editing, while this
  page edits ~10 rows in place.

### 6.2 Public — `/standings`

- `src/app/(public)/standings/page.tsx` is a server component.
  1. Parse `searchParams` with `standingsSearchParamsSchema`.
  2. Load seasons via `getAllSeasons()`. Default season: the one whose `start_at`–`end_at`
     contains today, else the most recent `start_at`. An unknown `?season=` uses the default.
  3. Call `getStandings(seasonId)`.
  4. Render `StandingsView` with the season list, the selected season, the categories and the
     selected category (unknown `?category=` → All).
- Keeps the existing hero ("League Standings" heading, subtitle, gradient background).
- `StandingsFilters`: category chips ("All" + each category) as `<Link>`s that set `?category=`,
  with `aria-current="page"` on the active chip. When more than one season exists, a second row
  of chips ("Season {id}") sets `?season=` the same way (links only, no client JS needed).
- `StandingsTable` per category, styled like the old group-stage table (card, colored top-3
  rank, school logo), columns **Rank**, **Team** (logo, team name; school name hidden below `sm`),
  **W**, **L**. Semantic `<table>` with `<caption>` = category name, `<th scope="col">`; logos have
  `alt` = school name. "–" ranks have `aria-label="Not ranked yet"`.
- Section header per category: primary bar + category name + "N Teams" badge (existing style).
- States:
  - no seasons, or no categories in the season → "No standings yet" empty state
  - `hasResults === false` → note "No results recorded yet" above that category's table
  - `getStandings` failure → "Standings are temporarily unavailable. Please try again later."
  - `loading.tsx` → existing `StandingsLoading` skeleton
- Freshness: admin saves call `revalidatePath('/standings')`; the page reads `searchParams`, so it
  renders on demand. The old `export const revalidate = 900` is dropped.
- No hard-coded host or port anywhere; links are relative.

## 7. Removals

- Delete `src/app/(public)/standings/[[...slug]]/page.tsx`.
- Delete `src/components/standings/{bracket-visualization,playins-list,group-stage-table,season-sidebar,standings-navbar,standings-content}.tsx`.
- The old service methods, actions, hooks, types and validations disappear with the rewrites in §5.
- `src/lib/slug-utils.ts` is left untouched (its helpers become unused by standings but are not
  part of this change).

## 8. Error handling summary

| Situation | Code | User sees |
|---|---|---|
| Signed out | `UNAUTHENTICATED` | Toast "You must be signed in to update standings." |
| Non-admin | `FORBIDDEN` | Toast "You do not have permission to update standings." |
| Bad input | `VALIDATION` | Field messages under Wins / Losses |
| Stale save / concurrent create | `CONFLICT` | Toast + table reloads with latest values |
| Team deleted | `NOT_FOUND` | Toast "This team no longer exists." + reload |
| Anything else | `SERVER` | Generic toast; details only in server logs |
| Public read failure | `SERVER` | "Standings are temporarily unavailable…" |

## 9. Testing

### Jest (DB mocked, following `src/services/matches.test.ts` and `src/actions/match-import.test.ts`)

- `src/services/standings.test.ts`
  - `rankStandings`: wins desc; losses break ties; equal W and L share rank (1, 1, 3);
    full ties ordered by school then team name; all 0-0 → `hasResults: false` and `rank: null`;
    empty input.
  - `getSeasonStandings`: missing record → 0-0 with `updatedAt: null`; only active teams of the
    season; grouped per category with independent ranks; category order; DB error → `SERVER`
    without DB details.
  - `saveRecord`: insert path; update path with matching `updated_at`; 0-row update with existing
    record → `CONFLICT`; 0-row update with no record → `NOT_FOUND`; `23505` → `CONFLICT`;
    `23503` → `NOT_FOUND`; unknown error → `SERVER` without details.
- `src/lib/validations/standings.test.ts`: rejects negative, decimal, > 999, string numbers,
  non-UUID team id, malformed timestamp, missing and extra fields; accepts valid input with
  `expectedUpdatedAt` null or ISO; search-param schema falls back on junk.
- `src/actions/standings.test.ts`: signed out → `UNAUTHENTICATED`, league operator →
  `FORBIDDEN`, neither calls the service; asks for `['admin']`; invalid input → `VALIDATION` with
  `fieldErrors` and no service call; success → `revalidateStandings` once; failure → no
  revalidation; `getStandings` rejects a bad season id.
- `src/hooks/use-standings.test.tsx` (`renderHook` + `QueryClientProvider`, actions mocked):
  `useStandingsTable` search, sort and category switching.
- `src/components/admin/standings/standings-row.test.tsx`: field error appears for invalid
  input, Save disabled while invalid, Save/Reset appear only when changed.

### Project checks

Run `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build` **before** changes (baseline)
and after. Report results as executed, separating pre-existing failures from new ones.

### Live check (browser pane, local dev server)

- Public `/standings`: ordering, shared ranks, 0-0 note, category chips, invalid query params,
  375 px mobile viewport, keyboard focus through chips.
- Admin: the user signs in as admin in the browser pane (Claude does not enter credentials).
  Then edit a team, see inline validation, save, see the success toast and the new rank, and
  confirm `/standings` reflects it. Any record Claude changes is set back to its prior values
  afterwards (0-0 for a team that had no record, which displays the same as no record).
- RLS: an anonymous REST `insert` into `team_standings` with a random UUID must be rejected.
- `/players` season filter lists seasons again.

## 10. Rollout order

1. Baseline project checks.
2. Migration file, Drizzle schema, `database.types.ts` entry. **Ask before applying to the DB.**
3. Types → validation → service (TDD).
4. Actions (TDD) → revalidation helper.
5. Hooks → admin UI → sidebar/routes.
6. Public page → removals → `players-grid` fix.
7. Docs.
8. Project checks + live check; report.

## 11. Out of scope

- Deriving standings from match results, brackets, play-ins, per-stage records.
- Draws, points, win percentage, streaks, games played.
- League-operator access.
- Public school filter.
- Audit history of who changed a record.
- Fixing other `@ts-nocheck` services or the hydration warning from the navbar clock.
