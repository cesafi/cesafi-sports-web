# Shared Components

This directory contains reusable components that can be used across different parts of the application.

## SmartBreadcrumbs

A smart, reusable breadcrumb component that automatically handles long routes by showing ellipsis when there are too many breadcrumb items.

### Features

- **Automatic Route Parsing**: Automatically generates breadcrumbs from the current URL path
- **Smart Ellipsis**: Shows "..." when there are too many breadcrumb items to prevent overflow
- **Configurable**: Customizable maximum visible items, home label, and home icon
- **Responsive**: Automatically adapts to different screen sizes
- **Accessible**: Built with proper ARIA labels and semantic HTML

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxVisibleItems` | `number` | `5` | Maximum number of breadcrumb items to show before ellipsis |
| `className` | `string` | `''` | Additional CSS classes for styling |
| `showHomeIcon` | `boolean` | `true` | Whether to show the home icon on the first breadcrumb |
| `customHomeLabel` | `string` | `'Admin Dashboard'` | Custom label for the home/first breadcrumb |

### Usage

#### Basic Usage

```tsx
import { SmartBreadcrumbs } from '@/components/shared';

function MyComponent() {
  return <SmartBreadcrumbs />;
}
```

#### With Custom Configuration

```tsx
import { SmartBreadcrumbs } from '@/components/shared';

function MyComponent() {
  return (
    <SmartBreadcrumbs 
      maxVisibleItems={3}
      showHomeIcon={false}
      customHomeLabel="Dashboard"
      className="my-custom-class"
    />
  );
}
```

### How It Works

1. **Route Parsing**: The component automatically parses the current URL path into segments
2. **Smart Truncation**: When the number of breadcrumb items exceeds `maxVisibleItems`:
   - Always shows the first item (home)
   - Always shows the last item (current page)
   - Shows some middle items if possible
   - Adds ellipsis (`...`) when needed
3. **Label Formatting**: Automatically formats URL segments into readable labels (e.g., "user-profile" → "User Profile")

### Examples

#### Short Route
```
/admin/schools
```
Shows: `Admin Dashboard > Schools`

#### Medium Route
```
/admin/schools/123/teams
```
Shows: `Admin Dashboard > Schools > 123 > Teams`

#### Long Route (with ellipsis)
```
/admin/schools/123/teams/456/players/789/profile
```
Shows: `Admin Dashboard > Schools > ... > Profile` (when maxVisibleItems = 5)

### Integration

The component is already integrated into the admin dashboard header and can be easily added to any other part of the application that needs breadcrumb navigation.

### Accessibility

- Uses proper `nav` element with `aria-label="breadcrumb"`
- Each breadcrumb item has appropriate ARIA attributes
- Ellipsis includes screen reader text ("More")
- Separators are properly marked as presentational
