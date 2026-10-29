# Automatic Standings (W · L · PTS · +/−) — Design

**Date:** 2026-10-29
**Status:** Approved in brainstorming, pending written-spec review
**Builds on:** `2026-10-22-team-standings-design.md` (manual win/loss records)
**Reference:** https://cesafi.ph/standings/basketball/ (official CESAFI standings)

## 1. Goal

Make `/standings` look and behave like the official CESAFI table: columns **#, Team, W, L, PTS, +/−**,
kept up to date from match results.

Success means:

- Right after rollout, all four Season 26 basketball categories (College, High School, U12, U15) match
  cesafi.ph number for number. The one expected difference is the order of BC and SHS in U12 (§2,
  tiebreak).
- When an admin or league operator marks a later match **Finished** with scores, both teams'
  W, L, PTS and +/− change on `/standings` with no other step.

## 2. Decisions (from brainstorming)

| Topic | Decision |
|---|---|
| Source of truth | **Starting record + finished matches.** Each team keeps an admin-edited starting record (W, L, +/−). Finished matches after the category's cut-off date are added on top automatically. |
| Starting data | Copied once from cesafi.ph. W/L already match the saved records for all 40 teams; this change adds +/− for all 40. |
| Double counting | Each category has a **"starting record covers games through"** date. Finished matches dated on or before it are already in the starting record and are skipped. Set to **2026-10-29** for the four Season 26 categories. |
| Points | **PTS = 3 × W.** A loss is worth 0 (this holds for every row on cesafi.ph). |
| Ranking | PTS desc → losses asc → +/− desc → school name A–Z → team name A–Z. Positions run 1…n with no shared ranks (cesafi.ph style). cesafi.ph appears to use head-to-head for equal records, so U12 BC (4-6, +11) and SHS (4-6, +81) will be in the opposite order from cesafi.ph. Accepted. |
| Which matches count | Status `finished`, stage is a round-robin stage (Elimination Round / Group Stage), exactly two participants, both scores entered, scores not equal. |
| Not in scope | Head-to-head tiebreaks, Football/Volleyball sport tabs, pulling data from cesafi.ph, playoff brackets. |
| Branch | Work directly on `dev`. |

### Evidence for the 2026-10-29 cut-off

College has 9 teams, so the first round is 8 games per team. Every College team's saved game count
equals 8 plus the number of its database matches scheduled before 2026-10-29: 10 = 8 + 2 for seven
teams, and 9 = 8 + 1 for UP and USJR. So the cesafi.ph totals already include every match dated
before today. The next match in the database is on 2026-10-31.

## 3. Context (current codebase and data)

- Standings today (`2026-10-22` spec): `team_standings(team_id PK, wins, losses, created_at,
  updated_at)`, admin-only writes through RLS, optimistic concurrency on `updated_at`, and
  `rankStandings` in `src/services/standings.ts`. All 40 active Season 26 teams have a record.
- Matches: `matches(id, stage_id, status, scheduled_at, …)` → `sports_seasons_stages(id, season_id,
  sport_category_id, competition_stage text)`. Scores live in `match_participants(match_id, team_id,
  match_score int default 0)`. `game_scores` has no rows and is not used here.
- The live DB has 78 Season 26 matches (stages 5 and 6, all "Elimination Round", all `upcoming`, none
  scored), dated 2026-10-17 to 2026-12-12. U12 and U15 have no matches yet.
- `competition_stage` is free text. The admin form suggests: Elimination Round, Group Stage,
  Quarterfinals, Semifinals, Play-ins, Playoffs, Finals.
- Scores are saved by `updateMatchScores` (`src/actions/match-participants.ts`) from
  `match-status-modal.tsx`. The status is saved by `updateMatchById`. Both call revalidation helpers
  that do not cover `/standings` today.
- `seasons.id` and `sports_categories.id` are `serial` (integer).

## 4. Data model

### Migration `supabase/migrations/20261029000000_add_automatic_standings.sql`

```sql
ALTER TABLE public.team_standings
  ADD COLUMN IF NOT EXISTS point_diff INTEGER NOT NULL DEFAULT 0
  CONSTRAINT team_standings_point_diff_range CHECK (point_diff BETWEEN -9999 AND 9999);

CREATE TABLE IF NOT EXISTS public.standings_cutoffs (
  season_id         INTEGER NOT NULL
                    REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE CASCADE,
  sport_category_id INTEGER NOT NULL
                    REFERENCES public.sports_categories(id) ON UPDATE CASCADE ON DELETE CASCADE,
  counted_through   DATE NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (season_id, sport_category_id)
);

-- The team_standings trigger function only sets NEW.updated_at, so it is reused here.
CREATE TRIGGER trigger_standings_cutoffs_updated_at
  BEFORE UPDATE ON public.standings_cutoffs
  FOR EACH ROW EXECUTE FUNCTION public.update_team_standings_updated_at();

ALTER TABLE public.standings_cutoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view standings cutoffs"
  ON public.standings_cutoffs FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert standings cutoffs"
  ON public.standings_cutoffs FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(ARRAY['admin'::text]));

CREATE POLICY "Admins can update standings cutoffs"
  ON public.standings_cutoffs FOR UPDATE TO authenticated
  USING (public.user_has_role(ARRAY['admin'::text]))
  WITH CHECK (public.user_has_role(ARRAY['admin'::text]));

CREATE POLICY "Admins can delete standings cutoffs"
  ON public.standings_cutoffs FOR DELETE TO authenticated
  USING (public.user_has_role(ARRAY['admin'::text]));

NOTIFY pgrst, 'reload schema';
```

The migration only adds things: one column with a default, and one new table.

### Data migration `supabase/migrations/20261029000100_seed_season_26_standings.sql`

Sets `team_standings.point_diff` for the 40 Season 26 teams and inserts the four cut-off rows.
Teams are matched by `(sport_category_id, schools.abbreviation)` within season 26. The file then
checks that exactly 40 rows were updated and raises an error otherwise (`DO $$ … GET DIAGNOSTICS …
RAISE EXCEPTION …`), so a wrong mapping fails instead of half-applying. Values copied from cesafi.ph
on 2026-10-29:

| Category (id) | +/− by abbreviation |
|---|---|
| College (3) | BC +100, UV +83, CIT-U +21, USC +18, USJR −1, UCMN +56, UCLM −120, UP −68, USPF −89 |
| High School (9) | UCLM +166, CIT-U +79, UCMN +150, SHS-AdC +71, USJR +123, UV +37, CEC −29, SRCDC −138, BC −50, SCSC −66, USPF −47, DBTC −120, PSS −176 |
| U12 (10) | CEC +191, USJR +192, CIT-U +248, BC +11, SHS-AdC +81, SCSC −310, DBTC −413 |
| U15 (11) | UV +113, USPF +91, CIT-U +176, BC +34, SHS-AdC +76, USJR +102, SCSC −106, CEC +36, DBTC −132, SRCDC −163, PSS −227 |

Cut-offs: `(26, 3)`, `(26, 9)`, `(26, 10)` and `(26, 11)`, each with `counted_through = '2026-10-29'`.

Both files are applied with a script that works like `scripts/migrate-team-standings.mjs`
(`scripts/migrate-automatic-standings.mjs`), and **only after the user confirms**.

### Code-side schema

- `src/db/schema/team-standings.ts`: add `point_diff`.
- `src/db/schema/standings-cutoffs.ts` (new) + export from `src/db/schema/index.ts`.
- `database.types.ts`: add `point_diff` to `team_standings`, and add a `standings_cutoffs` entry, by
  hand.

## 5. Architecture

Same layering as before: UI → hooks → server actions → `StandingsService` → Supabase (RLS).

### 5.1 Types (`src/lib/types/standings.ts`)

```ts
export interface StandingLine {
  wins: number;
  losses: number;
  pointDiff: number;
}

export interface RankedTeamStanding {
  teamId: string;
  teamName: string;
  school: { id: string; name: string; abbreviation: string; logoUrl: string | null };
  /** Admin-edited starting record (0-0, 0 when none saved) */
  starting: StandingLine;
  /** Finished matches after the category cut-off */
  fromMatches: StandingLine;
  /** Totals: starting + fromMatches */
  wins: number;
  losses: number;
  pointDiff: number;
  /** 3 × wins */
  points: number;
  /** 1…n; null when nobody in the category has played */
  rank: number | null;
  /** Version of the starting record; null = none saved yet */
  updatedAt: string | null;
}

export interface CategoryStandings {
  category: { id: number; sportName: string; division: string; levels: string; name: string };
  /** YYYY-MM-DD; null = every finished match counts */
  countedThrough: string | null;
  hasResults: boolean;
  teams: RankedTeamStanding[];
}

export interface SavedTeamStanding {
  teamId: string;
  wins: number;
  losses: number;
  pointDiff: number;
  updatedAt: string;
}

export interface SavedStandingsCutoff {
  seasonId: number;
  sportCategoryId: number;
  countedThrough: string | null;
}

export type StandingsFieldErrors = Partial<
  Record<'teamId' | 'wins' | 'losses' | 'pointDiff' | 'countedThrough', string[]>
>;
```

`SeasonStandings`, `StandingsSortKey`, `StandingsErrorCode` and `StandingsResult` stay as they are.

### 5.2 Validation (`src/lib/validations/standings.ts`)

- `STANDINGS_MAX_POINT_DIFF = 9999`. `pointDiffSchema`: whole number from −9999 to 9999, message
  "+/− must be a whole number from -9999 to 9999."
- `updateTeamStandingSchema` gains `pointDiff: pointDiffSchema`.
- New `updateStandingsCutoffSchema = z.strictObject({ seasonId: int > 0, sportCategoryId: int > 0,
  countedThrough: z.iso.date().nullable() })`, with message "Enter a valid date." `null` clears the
  cut-off.

### 5.3 Pure functions (`src/lib/utils/standings-calc.ts`, new)

Kept out of the service so they are easy to test and reuse:

- `isStandingsStage(competitionStage: string): boolean`: lowercase the name and strip
  non-letters, then accept `eliminationround`, `elimination`, `groupstage` and `roundrobin`.
  Everything else (play-ins, quarterfinals, semifinals, playoffs, finals) returns false.
- `manilaDate(iso: string): string`: the `YYYY-MM-DD` calendar date in `Asia/Manila`
  (`date-fns-tz`, already a dependency).
- `tallyMatches(matches, countedThrough): Map<teamId, StandingLine>`, where each match is
  `{ scheduledAt: string | null; participants: { teamId: string; score: number | null }[] }`
  (finished, standings-stage matches of one category). A match is skipped when:
  - it has a `scheduledAt`, a `countedThrough` is set, and `manilaDate(scheduledAt) <= countedThrough`;
  - it does not have exactly two participants;
  - either score is null;
  - the two scores are equal.

  Otherwise the higher score gets +1 W, the lower +1 L, and each team gets `own − opponent` added to
  `pointDiff`. Matches with no `scheduledAt` always count.
- `rankStandings(rows)` moves here from the service (the service re-exports it so existing imports
  keep working). It now sorts by `points` desc → `losses` asc → `pointDiff` desc → school name →
  team name. `hasResults = rows.some(r => r.wins + r.losses > 0)`. `rank = index + 1` when
  `hasResults`, else `null`.

### 5.4 Service (`src/services/standings.ts`)

**`getSeasonStandings(seasonId)`** runs three reads in parallel:

1. Teams, as today, embedding `team_standings(wins, losses, point_diff, updated_at)`.
2. Finished matches of the season:
   `matches.select('scheduled_at, sports_seasons_stages!inner(season_id, sport_category_id,
   competition_stage), match_participants(team_id, match_score)')
   .eq('status', 'finished').eq('sports_seasons_stages.season_id', seasonId)`.
3. `standings_cutoffs.select('sport_category_id, counted_through').eq('season_id', seasonId)`.

Then for each category: keep only the matches whose stage passes `isStandingsStage` and whose
`sport_category_id` is this category. Call `tallyMatches` with that category's cut-off. Build each
team's `starting` / `fromMatches` / totals / `points`, then `rankStandings`. A match participant
that is not an active team of the category is ignored, but the opponent's result still counts.
Errors work as today: log on the server, return `SERVER` "Could not load standings."

**`saveRecord`** writes `point_diff` alongside `wins` and `losses`. The concurrency and error
mapping stay the same, and `23514` now also covers the +/− range check.

**`saveCutoff({ seasonId, sportCategoryId, countedThrough })`**: when `countedThrough` is null,
delete the row. Otherwise `upsert` on `(season_id, sport_category_id)`. Last write wins: this is a
single admin setting, so it gets no optimistic concurrency. `23503` → `NOT_FOUND`
("This season or category no longer exists."); anything else → `SERVER`
"Could not save the cut-off date. Please try again."

### 5.5 Server actions (`src/actions/standings.ts`)

- `updateTeamStanding`: unchanged flow, and the input now includes `pointDiff`.
- `updateStandingsCutoff(input: unknown)`: the same steps as `updateTeamStanding`. Admin check
  (`UNAUTHENTICATED` / `FORBIDDEN`), then schema validation (`VALIDATION` + `fieldErrors`), then
  `saveCutoff`, then `revalidateStandings()` on success only.

### 5.6 Revalidation (`src/lib/utils/revalidation.ts`)

`revalidateMatches()` and `revalidateMatchParticipants()` each call `this.revalidateStandings()`.
That covers: match create/update/delete (status changes included), score saves
(`updateMatchScores`), participant changes, match deletion (through `revalidateMatchDeletion`) and
CSV import.

### 5.7 Hooks (`src/hooks/use-standings.ts`)

- `useUpdateTeamStanding`: on success, patch the team's `starting` and `updatedAt` in the cache,
  then invalidate the query so totals and ranks refetch. Toast:
  `"<team> starting record saved: W-L, ±D"`.
- `useUpdateStandingsCutoff(seasonId)`: a new mutation. On success it invalidates the season query
  and toasts "Cut-off saved" or "Cut-off cleared". `VALIDATION` failures show next to the field;
  other failures show as a toast.
- `useStandingsTable`: sorters are unchanged (`wins` and `losses` are now totals).

## 6. UI

### 6.1 Public `/standings` (`src/components/standings/standings-table.tsx`)

- Columns: **#** (screen-reader label "Rank"), **Team**, **W**, **L**, **PTS**, **+/−**. Each short
  header has a screen-reader label: Wins, Losses, Points, Point difference.
- +/− is shown as `+100`, `−1` (U+2212) or `0` using `formatPointDiff` in `standings-calc.ts`, in
  muted tabular figures. PTS is shown in bold, like W today.
- Ranks keep the existing gold/silver/bronze colours and the trophy icon for #1.
- Phones (375 px): all six columns fit with no horizontal scroll. The numeric columns narrow
  (`w-10`), the logo shrinks to 28 px, and the abbreviation shows below the team name (current
  behaviour).
- The "No results recorded yet" note and the other empty states are unchanged.

### 6.2 Admin `/admin/standings`

- Header subtitle: "Season {id} · starting records and match results by category".
- Each category tab gets a cut-off bar above the table: label "Starting record covers games
  through", an `<Input type="date">`, **Save** and **Clear**, and help text: "Finished matches on or
  before this date are already in the starting record and are not added again. Leave empty to count
  every finished match."
- Columns: **Rank**, **Team**, **Start W**, **Start L**, **Start +/−** (inputs), **From matches**
  (read-only, e.g. `2-0 · +24`, or `—` when there are none), **Total** (read-only, e.g.
  `11-1 · 33 pts · +124`), and Actions (Save/Reset, as today). The table scrolls sideways on narrow
  screens, as it does today.
- Inline checks for +/− use `pointDiffSchema`, like W/L. Labels: "Starting wins for <team>",
  "Starting losses for <team>", "Starting point difference for <team>".

## 7. Error handling

| Situation | Result |
|---|---|
| Non-admin saves a starting record or cut-off | `FORBIDDEN` toast; RLS also blocks it |
| +/− out of range or not a whole number | Field message under Start +/− |
| Bad cut-off date | Field message under the date input |
| Stale starting-record save | `CONFLICT` toast + reload (unchanged) |
| Finished match with a missing score, a tie, or ≠ 2 teams | Skipped silently: no change until scores are fixed |
| Matches query fails | Whole page shows "Standings are temporarily unavailable…" (no partial table that looks correct but isn't) |

## 8. Testing

### Jest

- `src/lib/utils/standings-calc.test.ts`:
  - `isStandingsStage`: accepted and rejected stage names.
  - `manilaDate`: the date rolls over at Manila midnight (`2026-10-29T16:30:00Z` → `2026-10-30`).
  - `tallyMatches`: winner and loser counts; +/− from both sides; skips on/before the cut-off and
    counts after it; no cut-off counts everything; null `scheduledAt` counts; skips a missing score,
    a tie, and 1 or 3 participants.
  - `rankStandings`: PTS → losses → +/− → names; ranks 1…n; no results → null ranks.
  - `formatPointDiff`.
- `src/services/standings.test.ts`: extend the mock with the `matches` and `standings_cutoffs` tables.
  - totals = starting + matches;
  - `fromMatches` is zero when every match is before the cut-off;
  - non-standings stages and other categories are ignored;
  - a matches query error returns `SERVER`;
  - `saveRecord` writes `point_diff`;
  - `saveCutoff` upsert, delete on null, and the `23503` → `NOT_FOUND` mapping.
- `src/lib/validations/standings.test.ts`: `pointDiff` bounds and type; cut-off schema (valid date,
  null, bad date, extra fields).
- `src/actions/standings.test.ts`: `updateStandingsCutoff` auth, validation, revalidation on success
  only.
- `src/components/standings/standings-table.test.tsx`: PTS and +/− columns and their formatting.
- `src/components/admin/standings/standings-row.test.tsx`: +/− input validation; From matches and
  Total text.

### Project checks

Run `npm test`, `npx tsc --noEmit`, `npm run lint` and `npm run build` before (baseline) and after.
Report the results as run, keeping failures that already existed apart from new ones.

### Live check (browser pane, local dev server)

- After the migrations: compare all four categories on `/standings` against cesafi.ph (W, L, PTS,
  +/−, order). The only allowed difference is the U12 BC/SHS order.
- Auto update: with the user's OK, temporarily mark one future match (2026-10-31 or later) Finished
  with scores using a DB script. Confirm both teams' W/L/PTS/+/− change on `/standings`, then put
  the match back to `upcoming` with scores 0.
- 375 px viewport: no horizontal scroll on the public table.
- Admin tab: the user signs in; Claude does not enter credentials. Check the cut-off bar and the
  starting +/− input show the seeded values.
- RLS: an anonymous REST insert into `standings_cutoffs` is rejected.

## 9. Rollout order

1. Baseline project checks.
2. Migration + data-migration files, Drizzle schema, `database.types.ts`. **Ask before applying.**
3. `standings-calc.ts` (TDD) → types → validation (TDD).
4. Service (TDD) → actions (TDD) → revalidation.
5. Hooks → public table → admin row/manager.
6. Docs: `docs/PUBLIC_MODULES_GUIDE.md` §4 and `docs/ADMIN_USER_GUIDE.md` (starting record, cut-off,
   automatic updates).
7. Project checks + live check; report.

## 10. Known gaps (not fixed here)

- `updateMatchScores` (`src/actions/match-participants.ts`) has no role check of its own and relies
  on RLS. This exists today and is not part of this change.
- The cut-off compares each match's `scheduled_at`. A postponed match must have its date moved past
  the cut-off, or it will not count when it finishes. This is the right result, since a game that
  has not been played cannot already be in the starting record.
