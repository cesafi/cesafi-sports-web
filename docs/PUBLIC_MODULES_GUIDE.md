# Public Modules Specification & User Experience Guide

This document details the technical specification, user experience, and data integration for all public-facing pages and dynamic routes on **CESAFI Sports Web**.

---

## Table of Contents
1. [Landing Page (`/`)](#1-landing-page-)
2. [News & Articles (`/news`, `/news/[slug]`)](#2-news--articles-news-newsslug)
3. [Match Schedule Hub (`/schedule`)](#3-match-schedule-hub-schedule)
4. [League Standings (`/standings`)](#4-league-standings-standings)
5. [Schools Directory & Profiles (`/schools`, `/schools/[slug]`)](#5-schools-directory--profiles-schools-schoolsslug)
6. [Player Directory & Profiles (`/players`, `/players/[playerSlug]`)](#6-player-directory--profiles-players-playersplayerslug)
7. [Match Detail & Box Score (`/matches/[matchId]`)](#7-match-detail--box-score-matchesmatchid)
8. [Public Statistics Hub (`/statistics`)](#8-public-statistics-hub-statistics)
9. [Volunteers Portal (`/volunteers`)](#9-volunteers-portal-volunteers)
10. [Sponsors Directory (`/sponsors`)](#10-sponsors-directory-sponsors)
11. [Help & FAQ (`/faq`)](#11-help--faq-faq)
12. [About Us & Contact (`/about-us`, `/contact`)](#12-about-us--contact-about-us-contact)
13. [Legal Pages (`/privacy-policy`, `/terms-of-service`)](#13-legal-pages-privacy-policy-terms-of-service)

---

## 1. Landing Page (`/`)

- **Route:** `/`
- **Technical Specification:** `src/app/(public)/page.tsx`
- **Features & Components:**
  - **Live Hero Section (`HeroSection`):** Displays current live stream match or featured league banner configured in `hero_section_live`.
  - **Upcoming Games (`UpcomingGames`):** Horizontal scroll card list of scheduled matches.
  - **Latest News (`LatestNews`):** Responsive grid of recent published news articles with cover images.
  - **Schools Grid (`SchoolsGrid`):** Interactive logos of member universities linking to `/schools/[slug]`.
  - **About CESAFI (`AboutCesafi`):** Historical introduction block.
  - **Sponsor Bar (`SponsorsGrid`):** Carousel of corporate partner logos.

---

## 2. News & Articles (`/news`, `/news/[slug]`)

- **Routes:** `/news`, `/news/[slug]`
- **Technical Specification:**
  - `src/app/(public)/news/page.tsx`
  - `src/app/(public)/news/[slug]/page.tsx`
- **Features:**
  - Category filtering tabs (All, Announcements, Game Reports, Features).
  - Search bar filtering article titles.
  - **Lexical Content Renderer:** Full article view uses custom Lexical JSON renderer to display formatted text, embedded images, and quotes.

---

## 3. Match Schedule Hub (`/schedule`)

- **Route:** `/schedule`
- **Technical Specification:** `src/app/(public)/schedule/page.tsx`
- **Features:**
  - **Date Navigation (`DateNavigation`):** Horizontal date bar allowing single-click filtering by match day.
  - **Sport Filter Tabs:** Filter matches by sport (Basketball, Volleyball, Karatedo, etc.).
  - **Date Grouping (`InfiniteSchedule`):** Matches grouped chronologically into date cards.
  - **Match Card (`MatchCard`):** Displays team logos, scores, live status indicator, venue, and time.

---

## 4. League Standings (`/standings`)

- **Routes:** `/standings`, `/standings/[[...slug]]`
- **Technical Specification:** `src/app/(public)/standings/page.tsx`
- **Features:**
  - **Sport & Division Selector:** Toggle between sports and categories (e.g., Men's Basketball Seniors).
  - **Group Stage Table (`GroupStageTable`):** Ranks teams by Wins, Losses, Points, Win Percentage, and Streak.
  - **Bracket Visualization (`BracketVisualization`):** Dynamic playoff trees for elimination rounds.

---

## 5. Schools Directory & Profiles (`/schools`, `/schools/[slug]`)

- **Routes:** `/schools`, `/schools/[slug]`
- **Technical Specification:** `src/app/(public)/schools/[slug]/page.tsx`
- **Features:**
  - **Header Banner:** Displays official school primary/secondary colors, logo, abbreviation, and school name.
  - **Active Roster Tabs:** Lists school teams by sport and season.
  - **Historical Trophies:** Showcases championships won per division.

---

## 6. Player Directory & Profiles (`/players`, `/players/[playerSlug]`)

- **Routes:** `/players`, `/players/[playerSlug]`
- **Technical Specification:** `src/app/(public)/players/[playerSlug]/page.tsx`
- **Features:**
  - **Player Search & Filters:** Search by athlete name, filter by school or sport.
  - **Athlete Profile:** Displays athlete photo, height, position, eligibility year, current team binding.
  - **Team History Table:** Complete breakdown of teams represented across previous CESAFI seasons.

---

## 7. Match Detail & Box Score (`/matches/[matchId]`)

- **Route:** `/matches/[matchId]`
- **Technical Specification:** `src/app/(public)/matches/[matchId]/page.tsx`
- **Features:**
  - Scoreboard header with live status updates.
  - Game-by-game set scores (e.g., quarter scores for basketball, set scores for volleyball).
  - Player box score table displaying individual performance data mapped from `game_stats`.

---

## 8. Public Statistics Hub (`/statistics`)

- **Route:** `/statistics`
- **Technical Specification:** `src/app/(public)/statistics/page.tsx`
- **Features:**
  - League-wide leaderboards for top scorers and performers.
  - Dynamically renders column headers based on `sport_stat_mappings`.

---

## 9. Volunteers Portal (`/volunteers`)

- **Route:** `/volunteers`
- **Technical Specification:** `src/app/(public)/volunteers/page.tsx`
- **Features:**
  - Department overview tabs (Media, Technical, Medical, Operations).
  - Volunteer application guidelines and registration forms.

---

## 10. Sponsors Directory (`/sponsors`)

- **Route:** `/sponsors`
- **Technical Specification:** `src/app/(public)/sponsors/page.tsx`
- **Features:**
  - Displays CESAFI corporate partners grouped by sponsorship tier.

---

## 11. Help & FAQ (`/faq`)

- **Route:** `/faq`
- **Technical Specification:** `src/app/(public)/faq/page.tsx`
- **Features:**
  - Accordion view of frequently asked questions regarding ticketing, venue policies, and schedules.

---

## 12. About Us & Contact (`/about-us`, `/contact`)

- **Routes:** `/about-us`, `/contact`
- **Technical Specification:**
  - `src/app/(public)/about-us/page.tsx`
  - `src/app/(public)/contact/page.tsx`
- **Features:**
  - Interactive history timeline milestone viewer.
  - Public contact form wired to server action email notification dispatch.

---

## 13. Legal Pages (`/privacy-policy`, `/terms-of-service`)

- **Routes:** `/privacy-policy`, `/terms-of-service`
- **Technical Specification:** Static legal terms and data privacy compliance disclosures.
