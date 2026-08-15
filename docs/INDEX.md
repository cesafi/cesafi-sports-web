# CESAFI Sports Web — System & Module Documentation Index

Welcome to the central documentation index for **CESAFI Sports Web**. This documentation repository serves as both a **technical architecture reference** for developers and an **operational user guide** for administrators and league staff.

---

## 📚 Core Documentation Suite

### 1. ⚙️ [System Architecture & Developer Guide](./SYSTEM_ARCHITECTURE.md)
*Technical foundation, architecture guidelines, and developer workflow.*
- **Core Technology Stack:** Next.js 15, React 19, Supabase PostgreSQL, Drizzle ORM, Tailwind CSS 4, React Query v5, Zod v4, Cloudinary.
- **4-Layer Data Flow Architecture:** Unidirectional flow from UI -> Hooks -> Server Actions -> Service Layer -> Database.
- **Role-Based Access Control (RBAC):** Middleware route protection, `ROLE_ROUTES`, and user roles (`admin`, `league_operator`, `head_writer`, `writer`).
- **Entity Addition Workflow:** Step-by-step developer guidelines for introducing new database tables and UI features.
- **Database Schema Overview:** Dynamic statistics model (`game_stats` & `sport_stat_mappings`).

---

### 2. 🛡️ [Admin & Operational Role Manual](./ADMIN_USER_GUIDE.md)
*Comprehensive user manual and technical specification for all protected management modules.*
- **Role Matrix:** Permission breakdown across Admin, League Operator, Head Writer, and Writer.
- **User Accounts:** Creating, assigning roles, and revoking staff access.
- **Seasons & Competition Context:** Active season toggle and historical academic year management.
- **Sports & Categories:** Configuring sports list, age/gender divisions, and code abbreviations.
- **Sport Statistics Mapping:** Dynamic mapping of `stat1...stat12` columns to sport-specific metric labels (Points, Goals, Rebounds, Assists).
- **Schools & Team Bindings:** University profiles, school logos, and team assignments per season.
- **Player Rosters & History:** Athlete management and historical season roster tracking.
- **Matches & Live Box Scores:** Match scheduling, set scores, and game stat logging.
- **Articles & Content Management:** Lexical rich-text editing, publishing workflow, and cover image cropping.
- **Timeline, FAQ, Volunteers, Sponsors, Gallery & Live Banner:** Curation guides for administrative staff.

---

### 3. 🌐 [Public Modules Specification & User Guide](./PUBLIC_MODULES_GUIDE.md)
*Technical specification and user experience guide for all public-facing pages.*
- **Landing Page (`/`):** Hero live banner, upcoming fixtures carousel, news grid, and school showcase.
- **News Hub (`/news`, `/news/[slug]`):** Lexical content rendering, article search, and category tabs.
- **Match Schedule (`/schedule`):** Date bar navigation, sport filters, and infinite date grouping.
- **League Standings (`/standings`):** Group stage tables, win/loss stats, tiebreaker rules, and elimination bracket visualizer.
- **School & Player Profiles (`/schools/[slug]`, `/players/[playerSlug]`):** Institutional pages, active rosters, and athlete profiles.
- **Match Center (`/matches/[matchId]`):** Live match scoreboards, set breakdowns, and box score tables.
- **Volunteers, Sponsors, FAQ & Legal:** Public portals and informational compliance pages.

---

## 🚀 Quick Navigation Map

| User Goal | Target Document | Relevant Section |
| :--- | :--- | :--- |
| **Understand system data flow & code structure** | [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md) | [2. Architecture & Data Flow](./SYSTEM_ARCHITECTURE.md#2-architecture--data-flow) |
| **Add a new database entity / feature** | [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md) | [4. Entity Addition Workflow](./SYSTEM_ARCHITECTURE.md#4-entity-addition-workflow) |
| **Configure sport stat column labels (e.g. Points/Goals)** | [`ADMIN_USER_GUIDE.md`](./ADMIN_USER_GUIDE.md) | [7. Sport Statistics Mapping](./ADMIN_USER_GUIDE.md#7-sport-statistics-mapping) |
| **Manage user accounts and staff roles** | [`ADMIN_USER_GUIDE.md`](./ADMIN_USER_GUIDE.md) | [3. User Accounts Management](./ADMIN_USER_GUIDE.md#3-user-accounts-management) |
| **Schedule a match and record box scores** | [`ADMIN_USER_GUIDE.md`](./ADMIN_USER_GUIDE.md) | [11. Matches & Live Scoring](./ADMIN_USER_GUIDE.md#11-matches--live-scoring) |
| **Understand the Schedule page architecture** | [`PUBLIC_MODULES_GUIDE.md`](./PUBLIC_MODULES_GUIDE.md) | [3. Match Schedule Hub](./PUBLIC_MODULES_GUIDE.md#3-match-schedule-hub-schedule) |
