# Cebu Schools Athletic Foundation – Design & Branding Guide

##  Project Overview

The **Cebu Schools Athletic Foundation Website** is the central digital hub for showcasing athletic excellence, academic-driven sports, and esports-inspired energy within Cebu’s schools.  

**Purpose:**  
- Provide updates on games, tournaments, schedules, and results.  
- Highlight athletes, schools, and events in both traditional sports and esports.  
- Serve as a professional yet vibrant space for students, athletes, coaches, fans, and partner schools.  

**Target Audience:**  
- Student-athletes  
- Fans and supporters  
- School administrators and staff  
- Sponsors and partner organizations  

**Look & Feel:**  
- **Modern, dynamic, and vibrant** – inspired by esports branding (Fnatic, LoL Esports) while maintaining **academic sports professionalism**.  
- Balanced with clean layouts, bold highlights, and immersive action-driven imagery.  

---

##  Brand Identity

### Primary Colors  
| Name       | Hex     | RGB              | Usage                        |
|------------|---------|------------------|------------------------------|
| Teal       | #336c61 | (51, 108, 97)    | Headers, accents, callouts   |
| Emerald    | #19b33e | (25, 179, 62)    | Secondary elements, success  |
| Gold       | #f4b248 | (244, 178, 72)   | Key highlights, CTAs         |
| White      | #ffffff | (255, 255, 255)  | Backgrounds, text contrast   |
| Off-White  | #f6f5f0 | (246, 245, 240)  | Section dividers, subtle bg  |

### Secondary / Neutral Colors  
- **Gray 900 (#111111)** – Headlines, contrast text  
- **Gray 600 (#666666)** – Secondary body text  
- **Gray 200 (#e5e5e5)** – Dividers, card borders  
- **Black (#000000)** – Deep contrast when necessary  

---

### Typography  
- **Primary Font:** `Moderniz` (modern, distinctive, clean – contemporary design aesthetic)  
  - Headings, navbars, hero sections, leaderboard titles, rankings  
  - Weight: 400 (regular)  
- **Secondary Font:** `Roboto` (clean, professional, highly readable)  
  - Body text, captions, form labels, long articles  
  - Weights: 400 (regular), 500 (medium)  

Usage Example:  
- `H1, H2, H3` → Moderniz Regular  
- Body text → Roboto Regular  
- Buttons → Moderniz Regular (ALL CAPS recommended)  
- Leaderboards & rankings → Moderniz Regular with gold/silver/bronze highlights  

---

### Logo & Brand Usage  
- Maintain **clear space** equal to the height of the “C” in the logo around all sides.  
- Logo must **not** be distorted, recolored, or placed on low-contrast backgrounds.  
- Always pair logo with foundation name in **Moderniz Regular** when used in headers.  
- Favicon version available for small-scale usage.  

---

##  UI/UX Design System

### Core Components
- **Header/Navbar** – Sticky top, logo left, nav items center, CTA button (gold) right.  
- **Footer** – Multi-column (About, Quick Links, Contact, Partners).  
- **Buttons** – Rounded (xl radius), bold text, hover states with subtle glow.  
- **Cards** – Soft shadows, 2xl rounded corners, used for athlete profiles, events, news.  
- **Tables** – Minimal borders, alternating row shades, highlight wins/losses in emerald/gold.  
- **Forms** – Clean input fields, teal focus states, error text in red.  
- **Modals** – Dimmed overlay, centered content card with close icon.  

### Page Layout Patterns  
- **Hero Section** – Full-width banner (dynamic background, headline, CTA button).  
- **Content Grid** – 3 or 4-column responsive layouts for athletes, schools, or articles.  
- **Sidebar** – Optional for schedules, standings, and quick navigation.  
- **News/Article Layout** – Featured image, headline, byline, body content, related articles.  

### Responsive Guidelines  
- **Desktop-first design**, scaling down to tablet and mobile.  
- Mobile nav → collapsible menu (hamburger).  
- Grids collapse into 1 or 2-column stacks on smaller screens.  

### Accessibility  
- Contrast ratio: **Minimum 4.5:1** for text/background.  
- Provide **alt-text** for all media.  
- Font sizes: 16px min body text, scalable for readability.  
- Keyboard navigability for forms and menus.  

---

##  Esports-Inspired Aesthetic

Our website will embody a **modern esports-inspired aesthetic** that balances **prestige, energy, and clarity**.  

- **Light & Dark Modes:** The foundation supports both themes to create a premium, immersive environment where **content pops through high-contrast accent colors** like green, gold, silver, and deep neutrals.  
- **Card-Based System:** Information will be presented in cards and leaderboard tables, making stats, rankings, and achievements feel **structured and gamified**.  
- **Typography:** Moderniz for **headings and rankings**, contrasted with Roboto for details and long-form readability.  
- **Highlights & Gradients:** Metallic gold for **first**, silver for **second**, bronze for **third**, applied through gradients and iconography to reinforce **achievement and prestige**.  
- **Layout Dynamics:**  
  - Impactful **hero sections** with animated elements.  
  - **Interactive hover states** on cards and buttons.  
  - **Community side panels** for live updates, chats, or schedules.  
- **Gamified Features:** Countdown timers, match highlights, and ranking badges reinforce urgency and excitement.  
- **Consistency:** Iconography, color schemes, and typography unify the design while channeling a **competitive arena energy**.  

**In short:** Modern, bold, competitive, and gamified — a **digital arena** that captures the **thrill of esports** while grounding it in **academic athletic prestige**.  

---

##  Media & Imagery Guidelines

### Photography Style  
- High-energy **action shots** (sports, esports gameplay).  
- **Team highlights** – group photos, candid celebrations.  
- **Volunteer/community shots** – smiling, engaged, authentic.  


### Volunteer Photos  
- Default circular avatar if no profile photo.  
- Use off-white background for consistency.  

### Gallery Presentation  
- **Grid-style gallery** (3–4 columns on desktop).  
- Expandable **lightbox view** on click/tap.  

---

##  Tone & Feel

- **Dynamic & Competitive** – reflects the intensity of athletic and esports spirit.  
- **Community-driven** – highlights collaboration between schools and athletes.  
- **Professional yet vibrant** – serious enough for academics, exciting enough for fans.  
- **Esports-inspired edge** – sharp lines, bold highlights, immersive visuals.  

---

##  Developer Implementation Notes

### Component Structure  
- Use **reusable UI components** for navbars, buttons, cards, etc.  
- Maintain consistent styling with **Tailwind CSS utility classes** (spacing, typography, colors).  

