# Dashboard Components

This directory contains reusable dashboard components for the CESAFI admin system.

## Components

### DashboardLayout
The main layout wrapper that combines the sidebar and header.

```tsx
import { DashboardLayout } from '@/components/dashboard';

export default function MyPage() {
  return (
    <DashboardLayout userRole="admin" userRoleDisplay="Admin">
      {/* Your page content */}
    </DashboardLayout>
  );
}
```

**Props:**
- `children`: ReactNode - The page content
- `userRole`: 'admin' | 'head_writer' | 'writer' | 'league_operator' - User's role for navigation
- `userRoleDisplay`: string - Display name for the user role (optional)
- `userName`: string - User's name (defaults to 'Admin')

### DashboardSidebar
The left navigation sidebar that automatically adapts based on user role.

**Features:**
- Role-based navigation items
- Active page highlighting
- CESAFI branding
- Responsive design

**Navigation by Role:**
- **Admin**: Overview, Accounts, Schools, Seasons, Sports, Articles, Volunteers
- **Head Writer**: Overview, Articles, Writers
- **Writer**: Overview, My Articles, Drafts
- **League Operator**: Overview, Schedules, Results, Standings

### DashboardHeader
The top header with theme switcher and user profile dropdown.

**Features:**
- Theme toggle (light/dark mode)
- User profile dropdown
- Responsive design

## Usage Examples

### Basic Admin Page
```tsx
import { DashboardLayout } from '@/components/dashboard';

export default function AdminPage() {
  return (
    <DashboardLayout userRole="admin">
      <h1>Admin Dashboard</h1>
      {/* Your content */}
    </DashboardLayout>
  );
}
```

### Head Writer Page
```tsx
import { DashboardLayout } from '@/components/dashboard';

export default function HeadWriterPage() {
  return (
    <DashboardLayout 
      userRole="head_writer" 
      userRoleDisplay="Head Writer"
      userName="John Doe"
    >
      <h1>Head Writer Dashboard</h1>
      {/* Your content */}
    </DashboardLayout>
  );
}
```

### Custom Navigation
If you need to customize the navigation for a specific page, you can override the sidebar:

```tsx
import { DashboardHeader, DashboardSidebar } from '@/components/dashboard';

export default function CustomPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar userRole="admin" />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader userRole="Admin" userName="Custom User" />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Your custom content */}
        </main>
      </div>
    </div>
  );
}
```

## Styling

The components use CSS variables defined in `globals.css` for consistent theming:

- `--sidebar`: Sidebar background color
- `--sidebar-foreground`: Sidebar text color
- `--sidebar-primary`: Primary accent color for active states
- `--sidebar-accent`: Hover and secondary background colors

## Responsive Design

The dashboard is designed to be responsive:
- Sidebar collapses on smaller screens (you can add a toggle button)
- Header adapts to different screen sizes
- Content area scrolls independently

## Adding New Pages

1. Create a new page in the appropriate directory
2. Import and use `DashboardLayout`
3. Set the appropriate `userRole`
4. Add any new navigation items to the sidebar component if needed

## Customization

To customize the dashboard:
1. Modify the CSS variables in `globals.css`
2. Update the navigation items in `DashboardSidebar`
3. Add new UI components as needed
4. Extend the layout for specific use cases
