# Management System Design Patterns

## Overview
This document outlines the consistent design patterns implemented across all CESAFI management systems to ensure uniform user experience and branding.

## Table Column Patterns

### 1. ID/Identifier Column
**Pattern**: First column with icon, ID, and description
```tsx
{
  key: 'id',
  header: 'Item Name',
  sortable: true,
  width: '15-20%',
  render: (item) => (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <IconComponent className="text-primary h-5 w-5" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">Primary Text</p>
        <p className="text-muted-foreground truncate text-xs">Secondary Text</p>
      </div>
    </div>
  ),
}
```

### 2. Content Column
**Pattern**: Main content with title and description
```tsx
{
  key: 'content',
  header: 'Content Information',
  sortable: false,
  width: '35-40%',
  render: (item) => (
    <div className="space-y-1">
      <div className="text-sm font-medium line-clamp-2">
        {item.title}
      </div>
      <div className="text-xs text-muted-foreground line-clamp-2">
        {item.description}
      </div>
    </div>
  ),
}
```

### 3. Status/Category Column
**Pattern**: Badges with brand colors
```tsx
{
  key: 'status',
  header: 'Status',
  sortable: true,
  width: '15-25%',
  render: (item) => (
    <div className="space-y-2">
      <Badge 
        variant={item.is_active ? 'default' : 'secondary'}
        className="capitalize"
        style={item.is_active ? { backgroundColor: 'var(--color-emerald)' } : {}}
      >
        {item.is_active ? 'Active' : 'Inactive'}
      </Badge>
      {item.is_featured && (
        <Badge 
          variant="default"
          className="capitalize text-gray-900"
          style={{ backgroundColor: 'var(--color-gold)', color: '#111111' }}
        >
          Featured
        </Badge>
      )}
    </div>
  ),
}
```

### 4. Date Column
**Pattern**: Consistent date formatting using TableDateTime
```tsx
{
  key: 'created_at',
  header: 'Created',
  sortable: true,
  width: '15-20%',
  render: (item) => (
    <TableDateTime date={item.created_at} />
  ),
}
```

## Action Button Patterns

### Standard Action Set
```tsx
export const getItemActions = (
  onView: (item: Item) => void,
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void,
  onToggleFeature?: (item: Item) => void
): TableAction<Item>[] => [
  {
    key: 'view',
    label: 'View Item',
    icon: <Eye className="h-4 w-4" />,
    onClick: onView,
    variant: 'secondary' as const,
    size: 'sm' as const,
  },
  {
    key: 'edit',
    label: 'Edit Item',
    icon: <Edit className="h-4 w-4" />,
    onClick: onEdit,
    variant: 'primary-outline' as const,
    size: 'sm' as const,
  },
  ...(onToggleFeature ? [{
    key: 'toggle-feature',
    label: 'Toggle Feature',
    icon: <Star className="h-4 w-4" />,
    onClick: onToggleFeature,
    variant: 'accent' as const,
    size: 'sm' as const,
  }] : []),
  {
    key: 'delete',
    label: 'Delete Item',
    icon: <Trash2 className="h-4 w-4" />,
    onClick: onDelete,
    variant: 'destructive' as const,
    size: 'sm' as const,
  },
];
```

## Badge Color System

### Status Badges
- **Active/Success**: `backgroundColor: 'var(--color-emerald)'`
- **Inactive/Secondary**: `backgroundColor: 'var(--color-slate)'`
- **In Progress/Warning**: `backgroundColor: 'var(--color-amber)'`
- **Featured/Highlighted**: `backgroundColor: 'var(--color-gold)', color: '#111111'`
- **Categories**: Use specific brand colors (blue, purple, orange, etc.)

### Implementation Examples
```tsx
// Active Status
<Badge 
  variant="default"
  className="capitalize"
  style={{ backgroundColor: 'var(--color-emerald)' }}
>
  Active
</Badge>

// Featured Item
<Badge 
  variant="default"
  className="capitalize text-gray-900"
  style={{ backgroundColor: 'var(--color-gold)', color: '#111111' }}
>
  Featured
</Badge>

// Category
<Badge 
  variant="outline"
  className="capitalize"
  style={{ borderColor: 'var(--color-teal)', color: 'var(--color-teal)' }}
>
  Category Name
</Badge>
```

## Icon Usage Patterns

### Primary Icons by System
- **Hero Sections**: `Video` icon
- **FAQ**: `MessageSquare` icon
- **Sports**: `Trophy` icon
- **Schools**: School logo or `Building` icon
- **Seasons**: `Calendar` icon
- **Matches**: `Trophy` icon
- **Articles**: `FileText` icon

### Icon Container
```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
  <IconComponent className="text-primary h-5 w-5" />
</div>
```

## Date & Time Display

### Consistent Usage
- Import: `import { TableDateTime } from '@/components/smart-date-time';`
- Usage: `<TableDateTime date={item.created_at} />`
- Automatic formatting based on recency (Today, Yesterday, relative dates)

## Typography Patterns

### Table Content
- **Primary Text**: `text-sm font-medium`
- **Secondary Text**: `text-xs text-muted-foreground`
- **Line Clamping**: `line-clamp-1` or `line-clamp-2` for overflow

### Spacing
- **Column Spacing**: `space-x-3` for horizontal, `space-y-1` or `space-y-2` for vertical
- **Badge Spacing**: `space-y-2` for stacked badges

## Responsive Patterns

### Column Widths
- **ID Column**: 15-20%
- **Content Column**: 35-40%
- **Status Column**: 15-25%
- **Date Column**: 15-20%
- **Actions**: Auto-width

### Mobile Considerations
- Use `line-clamp` for text overflow
- Ensure touch targets are at least 44px
- Stack badges vertically on smaller screens

## Implementation Checklist

When creating new management system tables:

- [ ] Use consistent column structure (ID, Content, Status, Date)
- [ ] Implement proper icon usage with brand colors
- [ ] Use TableDateTime for all date displays
- [ ] Apply brand color system to badges
- [ ] Use standard action button variants
- [ ] Include proper TypeScript types
- [ ] Test responsive behavior
- [ ] Ensure accessibility (alt text, keyboard navigation)

## Examples in Codebase

### Implemented Systems
- ✅ **Hero Sections**: `src/components/admin/hero-section/hero-section-table-columns.tsx`
- ✅ **FAQ**: `src/components/admin/faq/faq-table-columns.tsx`
- ✅ **Sports**: `src/components/admin/sports/sports-table-columns.tsx`
- ✅ **Schools**: `src/components/admin/schools/schools-table-columns.tsx`
- ✅ **Seasons**: `src/components/admin/seasons/seasons-table-columns.tsx`
- ✅ **Matches**: `src/components/shared/matches/matches-table-columns.tsx`
- ✅ **Timeline**: `src/components/admin/timeline/timeline-table-columns.tsx`

### Pattern Consistency
All systems now follow the same visual hierarchy, color usage, and interaction patterns, ensuring a cohesive user experience across the entire CESAFI management platform.