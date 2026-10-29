# Admin & Operational Role Manual (Technical & User Guide)

This document provides a comprehensive operational user guide and technical specification for all protected management modules within **CESAFI Sports Web**. It serves System Administrators (`admin`), League Operators (`league_operator`), Head Writers (`head_writer`), and Content Writers (`writer`).

---

## Table of Contents
1. [Overview & Role Matrix](#1-overview--role-matrix)
2. [Dashboard & Overview](#2-dashboard--overview)
3. [User Accounts Management](#3-user-accounts-management)
4. [Seasons Management](#4-seasons-management)
5. [Sports Management](#5-sports-management)
6. [Sport Categories (Divisions)](#6-sport-categories-divisions)
7. [Sport Statistics Mapping](#7-sport-statistics-mapping)
8. [Schools & Institutional Profiles](#8-schools--institutional-profiles)
9. [School Teams Management](#9-school-teams-management)
10. [Players & Roster History](#10-players--roster-history)
11. [Matches & Live Scoring](#11-matches--live-scoring)
12. [News & Articles Publishing](#12-news--articles-publishing)
13. [FAQ Management](#13-faq-management)
14. [Historical Timeline Milestones](#14-historical-timeline-milestones)
15. [Volunteers & Department Management](#15-volunteers--department-management)
16. [Sponsors & Tier Directory](#16-sponsors--tier-directory)
17. [Hero Section Live Banner](#17-hero-section-live-banner)
18. [Photo Gallery Curation](#18-photo-gallery-curation)
19. [Broadcast & Production Hub](#19-broadcast--production-hub)
20. [Team Standings](#20-team-standings)

---

## 1. Overview & Role Matrix

| Module | Route | Admin | League Operator | Head Writer | Writer |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Accounts** | `/admin/accounts` | ✅ | ❌ | ❌ | ❌ |
| **Seasons** | `/admin/seasons` | ✅ | ❌ | ❌ | ❌ |
| **Sports** | `/admin/sports` | ✅ | ❌ | ❌ | ❌ |
| **Categories** | `/admin/sports/[slug]/categories` | ✅ | ✅ | ❌ | ❌ |
| **Stats Mapping** | `/admin/sports/[slug]/stats` | ✅ | ✅ | ❌ | ❌ |
| **Schools** | `/admin/schools` | ✅ | ❌ | ❌ | ❌ |
| **School Teams** | `/admin/school-teams` | ✅ | ❌ | ❌ | ❌ |
| **Standings** | `/admin/standings` | ✅ | ❌ | ❌ | ❌ |
| **Players** | `/admin/players` | ✅ | ❌ | ❌ | ❌ |
| **Matches** | `/admin/matches` | ✅ | ✅ | ❌ | ❌ |
| **Articles** | `/admin/articles` | ✅ | ❌ | ✅ | ✅ (Own) |
| **FAQ** | `/admin/faq` | ✅ | ❌ | ✅ | ❌ |
| **Timeline** | `/admin/timeline` | ✅ | ❌ | ✅ | ❌ |
| **Volunteers** | `/admin/volunteers` | ✅ | ❌ | ❌ | ❌ |
| **Sponsors** | `/admin/sponsors` | ✅ | ❌ | ❌ | ❌ |
| **Hero Banner** | `/admin/hero-section` | ✅ | ❌ | ❌ | ❌ |
| **Gallery** | `/admin/photo-gallery` | ✅ | ❌ | ❌ | ❌ |
| **Production** | `/admin/production` | ✅ | ✅ | ✅ | ❌ |

---

## 2. Dashboard & Overview

- **Routes:** `/admin`, `/league-operator`, `/head-writer`, `/writer`
- **User Guide:** Provides high-level operational metrics (active season status, total matches scheduled, pending article submissions, system alerts).
- **Technical Specs:**
  - `src/app/(protected)/admin/page.tsx`
  - `src/hooks/use-dashboard-data.ts`
  - Leverages React Query for parallel fetching of system summary counters.

---

## 3. User Accounts Management

- **Route:** `/admin/accounts` (Admin only)
- **User Guide:**
  - **View Accounts:** Displays a paginated table of registered administrative users, including names, email, role, and creation date.
  - **Create Account:** Click **"Add Account"**, specify email, password, full name, and assign role (`admin`, `league_operator`, `head_writer`, `writer`).
  - **Edit / Revoke:** Click the edit icon to change user roles or delete obsolete accounts.
- **Technical Specs:**
  - Component: `src/components/admin/accounts/`
  - Actions: `src/actions/accounts.ts`
  - Service: `src/services/accounts.ts` (uses Supabase Admin API `createAdminClient()`).

---

## 4. Seasons Management

- **Route:** `/admin/seasons` (Admin only)
- **User Guide:**
  - Manages competition academic years (e.g., CESAFI Season 24).
  - **Set Current Season:** Mark a season as "Current" to make it the default context for public schedule, standings, and rosters.
- **Technical Specs:**
  - Schema: `src/db/schema/seasons.ts`
  - Provider: `SeasonProvider` context (`src/components/contexts/season-provider.tsx`).

---

## 5. Sports Management

- **Route:** `/admin/sports` (Admin only)
- **User Guide:**
  - Lists physical sports registered in CESAFI (Basketball, Volleyball, Karatedo, Beach Volleyball, Football, Chess, etc.).
  - **Add/Edit Sport:** Update sport name and SVG icon mapping (`src/components/ui/sport-icon.tsx`).
  - **Quick Navigation:** Action buttons link directly to **Categories** and **Stats Configuration** for each sport.
- **Technical Specs:**
  - Component: `src/components/admin/sports/`
  - Service: `src/services/sports.ts`

---

## 6. Sport Categories (Divisions)

- **Routes:** `/admin/sports/[slug]/categories`, `/league-operator/sports/[slug]/categories`
- **User Guide:**
  - Configures division categories per sport (e.g., Seniors, Juniors, Men's, Women's).
  - Full-width table layout showing category names, code abbreviations, and target gender/age level.
- **Technical Specs:**
  - Component: `src/components/admin/sports/categories/`
  - Schema: `src/db/schema/sports-categories.ts`

---

## 7. Sport Statistics Mapping

- **Routes:** `/admin/sports/[slug]/stats`, `/league-operator/sports/[slug]/stats`
- **User Guide:**
  - Maps the flexible numeric database columns (`stat1` through `stat12`) to human-readable labels specific to that sport.
  - **Example Mapping:**
    - Basketball: `stat1` = Points, `stat2` = Rebounds, `stat3` = Assists.
    - Football: `stat1` = Goals, `stat2` = Assists, `stat3` = Shots on Target.
  - Leave fields blank for stat columns not used by the sport. Click **"Save Configuration"**.
- **Technical Specs:**
  - Component: `StatsMappingForm` (`src/components/admin/sports/stats/stats-mapping-form.tsx`)
  - Schema: `sport_stat_mappings` (`src/db/schema/sport-stat-mappings.ts`)
  - Service: `src/services/statistics.ts`

---

## 8. Schools & Institutional Profiles

- **Route:** `/admin/schools` (Admin only)
- **User Guide:**
  - Manages member educational institutions (UV, UC, USC, USJR, CIT-U, etc.).
  - Upload school logo images (automatically routed through Cloudinary), define school abbreviations, official primary/secondary brand colors, and description.
- **Technical Specs:**
  - Component: `src/components/admin/schools/`
  - Schema: `src/db/schema/schools.ts`

---

## 9. School Teams Management

- **Route:** `/admin/school-teams` (Admin only)
- **User Guide:**
  - Binds member schools to specific sports categories for a given season (e.g., "USC Warriors - Men's Basketball Seniors - Season 24").
- **Technical Specs:**
  - Component: `src/components/admin/school-teams/`
  - Service: `src/services/schools-teams.ts`

---

## 10. Players & Roster History

- **Route:** `/admin/players` (Admin only)
- **User Guide:**
  - **Master Roster Table:** Full client/server paginated table of registered athletes.
  - **Add / Edit Player:** Input first name, last name, position, jersey number, eligibility years, and photo URL.
  - **Team Season History:** Click **"View History"** icon on any player to open a modal detailing all past season team bindings (`PlayerSeasonsTable`).
- **Technical Specs:**
  - Component: `src/components/admin/players/`
  - Schema: `src/db/schema/players.ts` & `player-seasons.ts`

---

## 11. Matches & Live Scoring

- **Routes:** `/admin/matches`, `/league-operator/matches`
- **User Guide:**
  - **Fixture Management:** Schedule matches between school teams, set venue, date, time, and stage.
  - **Match Status:** Update match status (`scheduled`, `live`, `completed`, `postponed`).
  - **Box Score & Player Stats:** Enter set scores (`game_scores`) and individual player stat values corresponding to the configured `stat1...stat12` mappings.
- **Technical Specs:**
  - Component: `src/components/shared/matches/`
  - Service: `src/services/matches.ts` & `src/services/game-scores.ts`

---

## 12. News & Articles Publishing

- **Routes:** `/admin/articles`, `/head-writer/articles`, `/writer/articles`
- **User Guide:**
  - Rich-text news editor powered by **Lexical**.
  - **Drafting & Publishing:** Writers create drafts; Head Writers and Admins can publish or archive articles.
  - Features cover image uploading via Cloudinary with dynamic crop adjustments.
- **Technical Specs:**
  - Component: `src/components/shared/articles/`
  - Schema: `src/db/schema/articles.ts`

---

## 13. FAQ Management

- **Routes:** `/admin/faq`, `/head-writer/faq`
- **User Guide:**
  - Create and reorder frequently asked questions and answers for the public help portal.
- **Technical Specs:**
  - Schema: `src/db/schema/faq.ts`

---

## 14. Historical Timeline Milestones

- **Routes:** `/admin/timeline`, `/head-writer/timeline`
- **User Guide:**
  - Add historical CESAFI milestones (year, title, description, image) for the public interactive timeline.
- **Technical Specs:**
  - Schema: `src/db/schema/cesafi-timeline.ts`

---

## 15. Volunteers & Department Management

- **Routes:** `/admin/volunteers`, `/admin/departments`
- **User Guide:**
  - Manage volunteer committees (Media, Logistics, Medical, Technical) and review volunteer candidate applications.
- **Technical Specs:**
  - Schema: `src/db/schema/volunteers.ts` & `departments.ts`

---

## 16. Sponsors & Tier Directory

- **Route:** `/admin/sponsors` (Admin only)
- **User Guide:**
  - Add league corporate sponsors, assign tier levels (Title, Gold, Silver, Official Partner), and manage logo link destination URLs.
- **Technical Specs:**
  - Schema: `src/db/schema/sponsors.ts`

---

## 17. Hero Section Live Banner

- **Route:** `/admin/hero-section` (Admin only)
- **User Guide:**
  - Configure the main landing page hero section. Toggle live broadcast status, set stream embed URL, headline text, and background media.
- **Technical Specs:**
  - Schema: `src/db/schema/hero-section-live.ts`

---

## 18. Photo Gallery Curation

- **Route:** `/admin/photo-gallery` (Admin only)
- **User Guide:**
  - Upload high-resolution event photography and curate galleries displayed on the landing page.
- **Technical Specs:**
  - Schema: `src/db/schema/photo-gallery.ts`

---

## 19. Broadcast & Production Hub

- **Routes:** `/admin/production`, `/league-operator/production`, `/head-writer/production`
- **User Guide:**
  - Placeholder / Coming-Soon operations hub for live stream operators, broadcast graphics overlays, and instant replay logging.

---

## 20. Team Standings

- **Route:** `/admin/standings` (Admin only — sidebar **Seasonal → Standings**)
- **User Guide:**
  - Each team's line is its **starting record** (W, L, +/−, typed here) **plus finished matches** after the category's cut-off date. PTS (3 × W) and the totals are worked out automatically.
  - Uses the season picked in the season switcher. Each category with active teams gets a tab (e.g. *Basketball · Men's College*).
  - Every active team in the category is listed automatically and starts at **0-0**. Inactive teams are hidden but keep their record; deleting a team deletes its record.
  - **Edit the starting record:** type Start W / Start L / Start +/− in the row, then click **Save** (or **Reset** to undo). W and L are whole numbers from 0 to 999; +/− is a whole number from -9999 to 9999. Invalid values are flagged under the field and cannot be saved. **From matches** and **Total** are read-only.
  - **Cut-off date ("Starting record covers games through"):** finished matches on or before this date are treated as already included in the starting record and are not added again. Move it forward only when you re-copy every team's totals (e.g. from cesafi.ph) as of a new date. **Clear** makes every finished match count (use it when the starting records are all 0-0).
  - **Which matches count:** status *Finished*, a round-robin stage (Elimination Round / Group Stage — not play-ins, quarterfinals, semifinals, playoffs or finals), exactly two teams, both scores entered, and not tied. Entering scores for a match dated on or before the cut-off does **not** change the standings.
  - **Ranking (automatic):** most PTS first, then fewest losses, then best +/−, then school name; every team gets its own position. While every team in a category is 0-0, ranks show "–".
  - **Search & sort:** filter by school, abbreviation or team name; sort by Rank, School A–Z, Most wins or Most losses (display only — ranks never change).
  - **Two admins editing at once:** if someone else saved the same team after you loaded it, your save is rejected with *"Someone else updated this team's record. The latest numbers have been loaded."* Re-enter your change if it is still needed.
  - Saved changes, and match status / score changes made under Matches, appear on the public `/standings` page immediately.
- **Technical Specs:**
  - Tables: `team_standings` (`team_id` PK → `schools_teams.id`, `wins`/`losses` ≥ 0, `point_diff` -9999…9999, `updated_at` used for conflict detection) and `standings_cutoffs` (`season_id` + `sport_category_id` PK, `counted_through` date). Migrations `supabase/migrations/20261022000000_add_team_standings.sql`, `20261029000000_add_automatic_standings.sql` and `20261029000100_seed_season_26_standings.sql`, applied with `scripts/migrate-team-standings.mjs` and `scripts/migrate-automatic-standings.mjs`. RLS: public read, admin-only writes.
  - Calculations: `src/lib/utils/standings-calc.ts` (`tallyMatches`, `rankStandings`, `isStandingsStage`, `formatPointDiff`)
  - Service: `src/services/standings.ts` (`getSeasonStandings`, `saveRecord`, `saveCutoff`)
  - Actions: `src/actions/standings.ts` (`getStandings`, `updateTeamStanding`, `updateStandingsCutoff` — admin role + Zod)
  - Hooks: `src/hooks/use-standings.ts`; Components: `src/components/admin/standings/`
