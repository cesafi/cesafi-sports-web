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

- **Next.js 15:** Our choice for a high-performance, server-side rendered React application, delivering lightning-fast page loads and an exceptional user experience.
- **Shadcn/UI:** Crafting a beautiful, accessible, and highly customizable user interface with a robust collection of pre-built components.
- **TanStack React Query:** Powering our data fetching, caching, and state management, ensuring real-time data synchronization and a smooth, responsive feel.
- **Zod:** Providing powerful, schema-first data validation, giving us confidence in the integrity and safety of our application's data.
- **Supabase:** Our comprehensive open-source backend, offering a real-time PostgreSQL database, robust authentication, and seamless file storage, accelerating our development process.

---

## 🚀 Project Status & Contribution

The CESAFI Sports Website is currently in **early development**. We're actively building out core features and laying the groundwork for a truly impactful platform.

**Note on Contributions:** At this stage, contributions are strictly managed and limited to **authorized volunteers within the CESAFI Website Team organization**. If you are a CESAFI volunteer and wish to contribute, please follow the guidelines below.

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

| Role                  | Name                | GitHub Profile                                     |
| :-------------------- | :------------------ | :------------------------------------------------- |
| **Project Lead**      | Porter, Nicolo Ryne | [@nicoryne](https://github.com/nicoryne)           |
| Frontend Developer    | [Team Member Name]  | [@Member1GitHub](https://github.com/Member1GitHub) |
| Backend Developer     | [Team Member Name]  | [@Member2GitHub](https://github.com/Member2GitHub) |
| UI/UX Designer        | [Team Member Name]  | [@Member3GitHub](https://github.com/Member3GitHub) |
| Quality Assurance     | [Team Member Name]  | [@Member4GitHub](https://github.com/Member4GitHub) |
| Website Administrator | [Team Member Name]  | [@Member5GitHub](https://github.com/Member5GitHub) |

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
