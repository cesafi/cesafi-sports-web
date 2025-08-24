# Date Utilities

A comprehensive set of date formatting utilities for consistent date display across the dashboard.

## 🚀 Quick Start

```tsx
import { formatSmartDate, formatTableDate, DateDisplay } from '@/lib/utils/date';

// Smart formatting (automatically chooses best format)
formatSmartDate(new Date()) // "Today at 2:30 PM"
formatSmartDate('2023-03-15') // "Mar 15 at 2:30 PM"

// Table formatting (compact)
formatTableDate(new Date()) // "Today"
formatTableDate('2023-03-15') // "Mar 15"

// Component usage
<DateDisplay date={new Date()} variant="smart" />
<DateDisplay date={new Date()} variant="table" />
```

## 📅 Available Functions

### Core Functions

- **`formatSmartDate(date, options)`** - Automatically chooses the best format based on recency
- **`formatTableDate(date)`** - Compact format for table displays
- **`formatDetailedDate(date)`** - Full detailed format
- **`formatRelativeTime(date)`** - Relative format (e.g., "2 hours ago")
- **`formatTime(date, format)`** - Time only (12h or 24h)

### Utility Functions

- **`isRecent(date, hours)`** - Check if date is within specified hours
- **`getAge(birthDate)`** - Calculate age from birth date
- **`formatDuration(minutes)`** - Format duration in human-readable format
- **`getDayBounds(date)`** - Get start/end of day
- **`getWeekBounds(date)`** - Get start/end of week
- **`getMonthBounds(date)`** - Get start/end of month

## 🎨 Formatting Options

```tsx
interface DateFormatOptions {
  showTime?: boolean;        // Show time (default: true)
  showYear?: boolean;        // Show year for older dates (default: true)
  showRelative?: boolean;    // Use relative time for recent dates (default: true)
  timeFormat?: '12h' | '24h'; // Time format (default: '12h')
  locale?: Locale;           // Locale for internationalization
}
```

## 📱 Smart Formatting Examples

| Date | Output |
|------|--------|
| Today | "Today at 2:30 PM" |
| Yesterday | "Yesterday at 3:15 PM" |
| This week | "Monday at 2:30 PM" |
| This year | "Mar 15 at 2:30 PM" |
| Older | "Mar 15, 2023 at 2:30 PM" |

## 🧩 React Components

### DateDisplay
Main component with multiple variants:

```tsx
<DateDisplay 
  date={new Date()} 
  variant="smart" 
  showTime={true} 
  showRelative={true} 
/>
```

### Specialized Components

```tsx
// Compact table display
<TableDate date={new Date()} />

// Smart display with relative time
<SmartDate date={new Date()} showTime={false} />

// Relative time only
<RelativeDate date={new Date()} />

// Detailed format
<DetailedDate date={new Date()} />
```

## 🔄 Migration from Old Code

### Before (Old way)
```tsx
<span>{new Date(account.createdAt).toLocaleDateString()}</span>
```

### After (New way)
```tsx
import { formatTableDate } from '@/lib/utils/date';

<span>Created {formatTableDate(account.createdAt)}</span>
```

## 🌍 Internationalization

The utilities support locale-based formatting:

```tsx
import { enUS, es } from 'date-fns/locale';

formatSmartDate(new Date(), { locale: enUS }); // English
formatSmartDate(new Date(), { locale: es });    // Spanish
```

## 📊 Dashboard Best Practices

1. **Tables**: Use `formatTableDate()` for compact display
2. **Cards**: Use `formatSmartDate()` for smart formatting
3. **Details**: Use `formatDetailedDate()` for full information
4. **Recent Activity**: Use `formatRelativeTime()` for "time ago" display
5. **Consistency**: Always use these utilities instead of manual date formatting

## 🚨 Error Handling

All functions handle invalid dates gracefully:

```tsx
formatTableDate(null)        // "—"
formatTableDate('invalid')   // "Invalid"
formatTableDate(undefined)   // "—"
```

## 🔧 Customization

You can extend the utilities by creating custom formatting functions:

```tsx
export function formatCustomDate(date: Date): string {
  // Your custom logic here
  return formatSmartDate(date, { showTime: false, showRelative: false });
}
```
