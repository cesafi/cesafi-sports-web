# Cebu Schools Athletic Foundation – Design & Branding Guide

##  Project Overview

The **Cebu Schools Athletic Foundation Website** is the central digital hub for showcasing athletic excellence, academic-driven sports, and esports-inspired energy within Cebu's schools.  

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
| Name       | Hex     | RGB              | Usage                        | CSS Variable    |
|------------|---------|------------------|------------------------------|-----------------|
| Teal       | #336c61 | (51, 108, 97)    | Primary actions, headers     | `--color-teal`  |
| Emerald    | #19b33e | (25, 179, 62)    | Success states, secondary    | `--color-emerald` |
| Gold       | #f4b248 | (244, 178, 72)   | Highlights, featured content | `--color-gold`  |
| White      | #ffffff | (255, 255, 255)  | Backgrounds, text contrast   | N/A             |
| Off-White  | #f6f5f0 | (246, 245, 240)  | Section dividers, subtle bg  | `--color-off-white` |

### Secondary / Neutral Colors  
- **Gray 900 (#111111)** – Headlines, contrast text  
- **Gray 600 (#666666)** – Secondary body text  
- **Gray 200 (#e5e5e5)** – Dividers, card borders  
- **Black (#000000)** – Deep contrast when necessary  

### Color Usage Guidelines

#### Teal (#336c61) - Primary Brand Color
- **Primary Actions:** Create, Add, Save, Submit buttons
- **Navigation:** Active states, primary links
- **Headers:** Section titles, main headings
- **Accents:** Focus states, important callouts
- **CSS Classes:** `.bg-teal`, `.text-teal`, `.border-teal`

#### Emerald (#19b33e) - Success & Secondary
- **Success States:** Active status, published content, completed actions
- **Secondary Actions:** Edit, Update, Modify buttons
- **Status Indicators:** Live events, successful operations
- **CSS Classes:** `.bg-emerald`, `.text-emerald`, `.border-emerald`

#### Gold (#f4b248) - Highlights & Features
- **Featured Content:** Highlighted items, promoted content
- **Special Actions:** Feature, Highlight, Promote buttons
- **Achievement States:** Awards, rankings, special recognition
- **Call-to-Actions:** Important promotional buttons
- **CSS Classes:** `.bg-gold`, `.text-gold`, `.border-gold`

---

### Typography System

#### Font Hierarchy
- **Primary Font:** `Moderniz` (modern, distinctive, clean)
  - **Usage:** Headings, buttons, navigation, UI labels, rankings
  - **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
  - **CSS Class:** `.font-moderniz`

- **Secondary Font:** `Roboto` (clean, professional, highly readable)
  - **Usage:** Body text, descriptions, form inputs, long content
  - **Weights:** 400 (regular), 500 (medium)
  - **CSS Class:** `.font-roboto`

#### Typography Scale
```css
/* Headings - Moderniz */
H1: 2.25rem (36px) - font-bold
H2: 1.875rem (30px) - font-semibold  
H3: 1.5rem (24px) - font-semibold
H4: 1.25rem (20px) - font-medium
H5: 1.125rem (18px) - font-medium
H6: 1rem (16px) - font-medium

/* Body Text - Roboto */
Large: 1.125rem (18px) - font-normal
Base: 1rem (16px) - font-normal
Small: 0.875rem (14px) - font-normal
XSmall: 0.75rem (12px) - font-normal
```

#### Usage Examples
- **Buttons:** System font Medium - consistent with UI components
- **Table Headers:** Moderniz Medium
- **Form Labels:** Roboto Medium
- **Body Content:** Roboto Regular
- **Captions:** Roboto Regular (small)
- **Status Badges:** Moderniz Regular (small)

---

### Logo & Brand Usage  
- Maintain **clear space** equal to the height of the "C" in the logo around all sides.  
- Logo must **not** be distorted, recolored, or placed on low-contrast backgrounds.  
- Always pair logo with foundation name in **Moderniz Regular** when used in headers.  
- Favicon version available for small-scale usage.

---

##  UI/UX Design System

### Action Button System

Our button system follows a consistent hierarchy that reinforces brand identity and user experience patterns.

#### Button Variants

##### Primary Actions (`variant="primary"`)
- **Color:** Teal background (#336c61)
- **Usage:** Main actions like Create, Add, Save, Submit
- **Style:** Rounded corners (xl), shadow, hover effects
- **Font:** System font Medium
```tsx
<Button variant="primary">Add New Item</Button>
```

##### Secondary Actions (`variant="secondary"`)
- **Color:** Emerald background (#19b33e)
- **Usage:** Edit, Update, Modify actions
- **Style:** Rounded corners (xl), shadow, hover effects
- **Font:** System font Medium
```tsx
<Button variant="secondary">Edit Item</Button>
```

##### Accent Actions (`variant="accent"`)
- **Color:** Gold background (#f4b248)
- **Usage:** Feature, Highlight, Promote actions
- **Style:** Rounded corners (xl), shadow, hover effects, semibold text
- **Font:** System font Semibold
```tsx
<Button variant="accent">Highlight Item</Button>
```

##### Standard Outline Actions (`variant="outline"`)
- **Color:** Standard border and text colors
- **Usage:** General outline buttons (news cards, etc.)
- **Style:** Standard border, subtle hover effects
- **Font:** System font Medium
```tsx
<Button variant="outline">Read More</Button>
```

##### Primary Outline Actions (`variant="primary-outline"`)
- **Color:** Teal border and text, transparent background
- **Usage:** Management system actions (View, Preview)
- **Style:** 2px border, hover fills with teal
- **Font:** System font Medium
```tsx
<Button variant="primary-outline">View Details</Button>
```

##### Destructive Actions (`variant="destructive"`)
- **Color:** Red background (#dc2626)
- **Usage:** Delete, Remove actions
- **Style:** Rounded corners (xl), shadow, hover effects
- **Font:** System font Medium
```tsx
<Button variant="destructive">Delete Item</Button>
```

##### Live Actions (`variant="live"`)
- **Color:** Red background with pulse animation
- **Usage:** Live streaming, real-time actions
- **Style:** Animated pulse, special hover effects
- **Font:** System font Medium
```tsx
<Button variant="live">Watch Live</Button>
```

#### Button Sizes
- **Small (`size="sm"`):** Height 32px, padding 16px, text-xs
- **Default (`size="default"`):** Height 40px, padding 24px, text-sm
- **Large (`size="lg"`):** Height 48px, padding 32px, text-base

#### Button States
- **Default:** Base styling with subtle shadow
- **Hover:** Slight scale (1.02x), enhanced shadow, color darkening
- **Active:** Scale down (0.98x) for tactile feedback
- **Disabled:** 50% opacity, no interactions
- **Loading:** Spinner icon with "Loading..." text

---

### Status Badge System

Consistent status indicators across all management systems.

#### Success States (Emerald)
```tsx
<Badge className="bg-emerald hover:bg-emerald/80">Active</Badge>
<Badge className="bg-emerald hover:bg-emerald/80">Published</Badge>
<Badge className="bg-emerald hover:bg-emerald/80">Live</Badge>
```

#### Highlighted States (Gold)
```tsx
<Badge className="bg-gold text-gray-900 hover:bg-gold/80">Featured</Badge>
<Badge className="bg-gold text-gray-900 hover:bg-gold/80">Highlighted</Badge>
```

#### Category States (Teal Outline)
```tsx
<Badge variant="outline" className="border-teal text-teal">General</Badge>
<Badge variant="outline" className="border-teal text-teal">Sports</Badge>
```

#### Inactive States (Secondary)
```tsx
<Badge variant="secondary">Inactive</Badge>
<Badge variant="secondary">Draft</Badge>
```

---

### Smart Date & Time Display System

Consistent date and time formatting across all components using UTC-aware utilities.

#### Component Usage

##### Full Format
```tsx
<SmartDateTime date={utcDate} variant="full" />
// Output: "Monday, January 15, 2024 at 2:30 PM"
```

##### Table Format
```tsx
<TableDateTime date={utcDate} />
// Output: "Jan 15, 2024" or "Today" or "2 hours ago"
```

##### Compact Format
```tsx
<CompactDateTime date={utcDate} />
// Output: "Jan 15"
```

##### Relative Format
```tsx
<RelativeDateTime date={utcDate} />
// Output: "2 hours ago" or "Yesterday"
```

##### Live Format
```tsx
<LiveDateTime date={futureDate} isLive={true} />
// Output: "2h 30m 15s" (countdown) or "Live now"
```

#### Date Display Patterns
- **Recent (< 24h):** "2 hours ago", "Just now"
- **This Week:** "Yesterday", "Monday"
- **This Year:** "Jan 15", "Mar 3"
- **Older:** "Jan 15, 2023"
- **Live Events:** Real-time countdown with red styling

#### Timezone Handling
- All dates stored in UTC in database
- Automatically converted to user's local timezone for display
- Timezone abbreviation shown when `showTimezone={true}`

---

### Core Components

#### Cards
- **Border Radius:** 2xl (16px)
- **Shadow:** Soft drop shadow with hover enhancement
- **Padding:** 24px (p-6)
- **Background:** Card background with subtle border
- **Hover:** Slight scale and enhanced shadow

#### Tables
- **Headers:** Moderniz Medium, teal color
- **Borders:** Minimal, using border color
- **Row Hover:** Subtle background change
- **Actions:** Consistent button variants in action columns
- **Status:** Color-coded badges for different states

#### Forms
- **Labels:** Roboto Medium, proper spacing
- **Inputs:** Rounded borders, teal focus states
- **Validation:** Red error text, clear messaging
- **Buttons:** Primary variant for submit actions

#### Modals & Dialogs
- **Backdrop:** Semi-transparent overlay
- **Content:** Centered card with rounded corners
- **Header:** Moderniz Semibold with icon
- **Footer:** Right-aligned button group
- **Close:** X icon in top-right corner

---

### Page Layout Patterns  

#### Management System Layouts
- **Header:** Logo, navigation, user actions, live indicator
- **Sidebar:** Optional navigation for admin sections
- **Main Content:** Cards, tables, forms with consistent spacing
- **Action Areas:** Floating action buttons, toolbars

#### Content Layouts
- **Hero Section:** Full-width with dynamic background
- **Content Grid:** Responsive 3-4 column layouts
- **Article Layout:** Featured image, typography hierarchy
- **Gallery:** Grid with lightbox functionality

---

### Responsive Guidelines  
- **Desktop-first design**, scaling down to tablet and mobile
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Mobile Navigation:** Collapsible hamburger menu
- **Button Scaling:** Maintain touch targets (44px minimum)
- **Grid Collapse:** 4-col → 2-col → 1-col progression

---

### Accessibility Standards
- **Contrast Ratio:** Minimum 4.5:1 for all text/background combinations
- **Focus States:** Visible focus rings on all interactive elements
- **Alt Text:** Descriptive alt text for all images and icons
- **Font Sizes:** 16px minimum for body text, scalable
- **Keyboard Navigation:** Full keyboard accessibility for forms and menus
- **Screen Readers:** Proper ARIA labels and semantic HTML

---

##  Esports-Inspired Aesthetic

Our website embodies a **modern esports-inspired aesthetic** that balances **prestige, energy, and clarity**.  

### Visual Principles
- **Light & Dark Modes:** Premium themes with high-contrast accent colors
- **Card-Based System:** Structured, gamified presentation of information
- **Interactive Elements:** Hover states, animations, micro-interactions
- **Competitive Edge:** Sharp lines, bold highlights, dynamic layouts

### Animation & Motion
- **Button Interactions:** Scale effects (1.02x hover, 0.98x active)
- **Card Hover:** Subtle lift with enhanced shadows
- **Loading States:** Smooth spinners and skeleton screens
- **Live Elements:** Pulse animations for real-time content
- **Page Transitions:** Smooth, purposeful animations

### Gamification Elements
- **Status Badges:** Achievement-style indicators
- **Progress Indicators:** Visual feedback for processes
- **Live Counters:** Real-time updates with special styling
- **Ranking Systems:** Gold/silver/bronze color coding
- **Interactive Feedback:** Immediate visual responses to actions

---

##  Implementation Guidelines

### CSS Custom Properties
```css
:root {
  /* Brand Colors */
  --color-teal: #336c61;
  --color-emerald: #19b33e;
  --color-gold: #f4b248;
  --color-off-white: #f6f5f0;
  
  /* Typography */
  --font-moderniz: 'Moderniz', system-ui, sans-serif;
  --font-roboto: 'Roboto', system-ui, sans-serif;
}
```

### Utility Classes
```css
/* Brand Colors */
.bg-teal { background-color: var(--color-teal); }
.text-teal { color: var(--color-teal); }
.border-teal { border-color: var(--color-teal); }

/* Typography */
.font-moderniz { font-family: var(--font-moderniz); }
.font-roboto { font-family: var(--font-roboto); }

/* Brand Button Styles */
.btn-cesafi-primary { @apply bg-teal text-white hover:bg-teal/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-moderniz font-medium; }
```

### Component Structure  
- Use **reusable UI components** for consistency
- Implement **design tokens** for spacing, colors, typography
- Follow **atomic design principles** for component hierarchy
- Maintain **TypeScript interfaces** for component props

### Development Best Practices
- **Consistent Naming:** Use semantic component and class names
- **Prop Validation:** TypeScript interfaces for all component props
- **Accessibility First:** Include ARIA labels and semantic HTML
- **Performance:** Optimize images, lazy load components
- **Testing:** Unit tests for component behavior and styling

---

##  Quality Assurance

### Design Review Checklist
- [ ] Brand colors used correctly (teal, emerald, gold)
- [ ] Typography hierarchy followed (Moderniz/Roboto)
- [ ] Button variants applied consistently
- [ ] Date/time formatting standardized
- [ ] Status badges follow color conventions
- [ ] Responsive design tested across breakpoints
- [ ] Accessibility standards met (contrast, focus, alt-text)
- [ ] Interactive states implemented (hover, active, disabled)
- [ ] Loading and error states designed
- [ ] Cross-browser compatibility verified

### Component Audit
Regular audits should verify:
- Consistent button styling across all management systems
- Proper color usage following brand guidelines
- Typography consistency in headings and body text
- Date/time display uniformity
- Status indicator standardization
- Responsive behavior across devices

---

This branding guide ensures consistent, professional, and accessible user interfaces across all CESAFI management systems while maintaining the dynamic, esports-inspired aesthetic that defines our digital presence.