![CESAFI Logo](.github/assets/cesafi.png 'Cebu Schools Athletic Foundation, Inc. Logo')

# CESAFI Sports Website

Welcome to the official repository for the **CESAFI Sports Website**, the digital heartbeat of Cebuano collegiate athletics! Our mission is to be the go-to platform for everything CESAFI, bringing the thrill of the games closer to fans, athletes, and the entire community. Get ready for real-time updates, in-depth coverage, and seamless access to all your favorite CESAFI sports action.

---

## ✨ Features That Score Big!

The CESAFI Sports Website is being meticulously built to deliver a dynamic and comprehensive experience. Here's a glimpse of what's live or coming soon:

- **⚡ Live Game Updates:** Follow the action as it happens with real-time scores.
- **📰 Latest Articles & News:** Dive into game recaps, previews, and feature stories. (Seamlessly integrated with CESAFI's official social media for the freshest posts!)
- **🏆 Match Results & Event Schedules:** Never miss a moment with detailed results and upcoming game schedules at your fingertips.
- **📈 Standings, Rankings & Brackets:** Track team progress, league standings, and championship brackets as the season unfolds.
- **🏀 Team Profiles:** Get to know the participating schools and their rosters.

---

## 🛠️ Built on a Solid Foundation: Our Tech Stack

We're leveraging cutting-edge technologies to ensure the CESAFI Sports Hub is fast, reliable, and a joy to build and use.

### **Core Framework & Runtime**

- **Next.js 15.5.2** with **React 19.1.0** - High-performance, server-side rendered application with App Router
- **TypeScript 5+** (Strict mode) - End-to-end type safety from database to UI
- **Turbopack** - Lightning-fast development builds and hot reloading

### **Backend & Database**

- **Supabase 2.55.0** - PostgreSQL database with real-time capabilities, authentication, and file storage
- **Row-Level Security (RLS)** - Database-level permission enforcement
- **Auto-generated TypeScript types** - Type safety directly from database schema

### **State Management & Data Fetching**

- **TanStack React Query 5.83.0** - Sophisticated client-side state management, caching, and data synchronization
- **Server Actions** - Next.js 15 server actions with `'use server'` directive
- **Optimistic updates** - Responsive UI with intelligent cache invalidation

### **UI & Styling**

- **Shadcn/UI** - Beautiful, accessible components built on Radix UI primitives
- **Tailwind CSS 4.0** - Utility-first CSS framework for rapid UI development
- **Framer Motion 12.23.6** - Smooth animations and transitions
- **Lucide React** - Consistent icon system

### **Validation & Type Safety**

- **Zod 4.0.5** - Runtime schema validation with TypeScript integration
- **End-to-end type safety** - From database types to component props

### **Media & Assets**

- **Cloudinary 6.16.0** - Advanced image management and optimization
- **next-cloudinary** - Seamless Next.js integration for image handling

### **Development & Quality**

- **Jest + React Testing Library** - Comprehensive testing framework (setup ready)
- **ESLint + Prettier** - Code quality and formatting
- **Vercel** - Production deployment and hosting

---

## 🏗️ Architecture Overview

The CESAFI Sports Website follows a **5-Layer Service Architecture** designed for scalability, maintainability, and clear separation of concerns:

### **Architecture Pattern**

```
┌─────────────────────────────────────────────────────────────┐
│                    1. COMPONENT LAYER (UI)                 │
│  React Components (src/app/, src/components/)              │
│  Thin, focused on presentation logic only                  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. HOOKS LAYER (src/hooks/)             │
│  React Query hooks, query key factories, cache management  │
│  Data access layer for components                          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   3. ACTIONS LAYER (src/actions/)          │
│  Next.js Server Actions with 'use server' directive        │
│  Bridge between client hooks and server services           │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   4. SERVICES LAYER (src/services/)        │
│  BaseService pattern, business logic, CRUD operations      │
│  Universal client management (server/browser)              │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    5. DATABASE LAYER                       │
│  Supabase PostgreSQL with auto-generated TypeScript types  │
│  Real-time capabilities, authentication, RLS               │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow**

- **Read Operations**: Component → Hook → Service → Supabase → Service → Hook → Component
- **Write Operations**: Component → Hook → Action → Service → Supabase → Service → Action → Hook → Component (with cache invalidation)

### **Key Features**

- **Feature-based organization** - Each entity has corresponding files across all layers
- **Type safety** - End-to-end TypeScript types from database to UI
- **Cache management** - Intelligent React Query cache invalidation
- **Error handling** - Standardized ServiceResponse<T> pattern
- **Validation** - Zod schemas for runtime type validation

### **Database Schema**

The application manages comprehensive sports data including:

- **17 Schools** with teams, matches, and game results
- **Sports categories** (basketball, volleyball, etc.) with divisions and levels
- **Competition stages** (group stage, playoffs, finals)
- **Content management** (articles, volunteers, departments)
- **Real-time updates** for live scores and match status

---

## 🚀 Project Status & Contribution

The CESAFI Sports Website is currently in **early development**. We're actively building out core features and laying the groundwork for a truly impactful platform.

**Note on Contributions:** At this stage, contributions are strictly managed and limited to **authorized volunteers within the CESAFI Website Team organization**. If you are a CESAFI volunteer and wish to contribute, please follow the guidelines below.

---

## 📋 Development Guidelines

### **For AI Assistants & New Developers**

**🚨 CRITICAL**: Before starting any work, **ALWAYS READ** the `.cursor-directives.md` file first. This file contains:

- Complete project architecture understanding
- Development patterns and standards
- Git workflow and branching strategy
- Database structure and relationships
- Security considerations and current issues
- Quality standards and checklists
- All established conventions and best practices

### **Core Development Philosophy**

- **QUALITY OVER SPEED**: Every change requires deep thinking, thorough analysis, and careful consideration
- **ULTRA-THINKING**: Prevent redundant code, missed logic, and architectural inconsistencies
- **CLEANLINESS**: Focus on readability, maintainability, and simplicity
- **ARCHITECTURE CONSISTENCY**: Follow established 5-layer service architecture patterns

### **Key Development Rules**

1. **Never skip layers** - All changes must flow through all 5 layers
2. **Maintain type safety** - Update types and validation schemas
3. **Handle relationships** - Consider impact on related entities
4. **Cache invalidation** - Update invalidation strategies for related data
5. **Error handling** - Use consistent ServiceResponse<T> pattern
6. **Business rules** - Enforce in validation layer with Zod schemas

---

## 💻 Getting Started (For Contributors)

To set up the CESAFI Sports Website development environment on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/cesafi/cesafi-sports-web.git
    cd cesafi-sports-web
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Configure Environment Variables:**
    - Duplicate `.env.example` to create `.env.local`.
    - **Crucially:** Contact the project lead (porternicolo@gmail.com) to obtain the necessary Supabase API keys and other credentials for `.env.local`.
4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 🧪 Testing Guide

We are committed to maintaining a high-quality, reliable, and bug-free application. Our testing strategy primarily focuses on ensuring that new features integrate smoothly and existing functionalities remain robust.

### Our Testing Philosophy

- **Unit Tests:** Focus on individual functions, components, and hooks in isolation (e.g., utility functions, Zod schemas, custom React hooks).
- **Integration Tests:** Verify how different parts of the application work together (e.g., a component interacting with a data-fetching hook).

### Tools We Use

- **Jest & React Testing Library:** For fast and reliable unit and integration tests of React components and TypeScript logic. We leverage Jest's integration with Next.js for an optimized testing environment.

### Running Tests

To run the tests on your local machine:

1.  **Unit & Integration Tests (Jest):**
    ```bash
    npm test
    # or
    yarn test
    ```
    To run tests in watch mode (reruns on file changes):
    ```bash
    npm run test:watch
    # or
    yarn test:watch
    ```
    To generate a code coverage report:
    ```bash
    npm run test:coverage
    # or
    yarn test:coverage
    ```

---

## 🌿 Branching & Naming Conventions

To maintain a clean and organized codebase, we follow a consistent branching strategy. All development work occurs on dedicated branches, which are then merged into `main` via pull requests after review and approval.

- **`main`**: This branch represents the **production-ready** code. It is always stable and deployable. All direct pushes to `main` are restricted.
- **`dev`**: This branch serves as the **staging/integration environment**. All new features (`feat/`), bug fixes (`fix/`), and refactors (`refactor/`) are merged into `dev` first for testing and review before being merged into `main`. This branch may not always be production-ready but should generally be stable enough for internal testing.
- **`feat/<description>`**: For new features. (e.g., `feat/live-scoreboard`, `feat/team-profiles`)
- **`fix/<description>`**: For bug fixes. (e.g., `fix/login-issue`, `fix/missing-article-image`)
- **`docs/<description>`**: For documentation updates. (e.g., `docs/add-setup-guide`)
- **`refactor/<description>`**: For code refactoring or improvements that don't add new features or fix bugs. (e.g., `refactor/api-calls`)
- **`chore/<description>`**: For miscellaneous tasks, build process changes, or dependency updates. (e.g., `chore/update-dependencies`, `chore/add-eslint-config`)

**Workflow:**

1.  Create your feature or fix branch from `main`.
2.  Work on your changes.
3.  Open a Pull Request (PR) against `main`.
4.  Get your PR reviewed and approved by at least one other team member.
5.  Merge your PR into `main`. Vercel will automatically deploy `main` to production.

---

## 🧑‍💻 Meet Our Team

The CESAFI Sports Website is brought to life by a dedicated team of passionate volunteers. We're always looking for talented individuals to join us in shaping the future of CESAFI's digital presence.

| Role                 | Name               | GitHub Profile                           |
| :------------------- | :----------------- | :--------------------------------------- |
| Project Lead         | Nicolo Porter      | [@nicoryne](https://github.com/nicoryne) |
| Frontend             | Adrian Sajulga     | [@wetooa](https://github.com/Wetooa)     |
| Backend & Cloudinary | Derrick Binangbang | [@drkcutie](https://github.com/drkcutie) |
| Backend & Supabase   | Gelo Cadavos       | [@Eloe321](https://github.com/Eloe321)   |
| Frontend & Branding  | Zak Floreta        | [@Kaazzz](https://github.com/Kaazzz)     |

---

## 🌐 About CESAFI 🏆

The Cebu Schools Athletic Foundation, Inc. (CESAFI) is a leading sports and academic association in Cebu, Philippines. Established in 2001, CESAFI proudly unites 17 schools, colleges, and universities, fostering excellence in both athletics and academics. We aim to showcase the vibrant spirit and achievements of Cebuano collegiate sports and education through our digital presence. 🇵🇭

## ✨ Our Mission (CESAFI Website Team)

Our mission is to ensure the CESAFI website is a comprehensive, user-friendly, and up-to-date resource for students, faculty, alumni, and sports enthusiasts. We are committed to:

- Maintaining the website's functionality and performance. 🛠️
- Developing new features and improvements. 💡
- Showcasing CESAFI events, news, and results. 📊
- Supporting the digital needs of the CESAFI organization. 🤝

---

## 📧 Contact

For any inquiries, including obtaining development credentials, please reach out:

**Contact Person**: porternicolo@gmail.com

## 📱 Connect with CESAFI

Stay connected and get the latest updates from CESAFI:

**Official Facebook Page**: [The CESAFI Official Page](https://www.facebook.com/thecesafi/) 👍

_For more context on CESAFI, you can check out the CESAFI Facebook page._ 📚
