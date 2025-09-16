# Match Deletion Revalidation Improvements

## Overview
Enhanced the revalidation system to ensure comprehensive data refresh when matches are deleted, preventing stale data and ensuring UI consistency.

## Server-Side Revalidation (Next.js Cache)

### Enhanced RevalidationHelper
- **New Method**: `revalidateMatchDeletion()` - Comprehensive revalidation for match deletion
- **Revalidates**:
  - All match-related routes (`/admin/matches`, `/league-operator/matches`)
  - Match participants routes
  - Games and game scores routes
  - Dashboard routes (admin and league operator)
  - Public routes (landing page, schedule)
  - Match detail pages (forces 404 for deleted matches)

### Updated Match Actions
- `deleteMatchByIdWithCascade()` now uses `RevalidationHelper.revalidateMatchDeletion()`
- Ensures server-side cache is properly invalidated

## Client-Side Revalidation (React Query)

### Enhanced useDeleteMatchWithCascade Hook
- **Comprehensive Query Invalidation**:
  - All match queries (`matchKeys.all`)
  - Schedule queries (`matches.schedule`, `matches.scheduleByDate`)
  - Related entity queries (`games`, `match_participants`, `game_scores`)
  - Dashboard and overview queries
  - School-specific match queries
- **Force Refetch**: Actively refetches critical queries after invalidation

### Enhanced useMatchesTable Hook
- **Stage-Specific Revalidation**: Invalidates queries for the current stage
- **Comprehensive Invalidation**: All match-related queries
- **Force Refetch**: Calls `refetch()` to immediately update table data

### Consolidated useMatchRefetch Hook (in use-matches.ts)
- **Utility Hook**: Provides methods for comprehensive match data refetching
- **Methods**:
  - `refetchAllMatchData()` - Refetches all match-related data
  - `refetchMatchById(id)` - Refetches specific match data
  - `refetchMatchesByStage(stageId)` - Refetches stage-specific matches
  - `refetchScheduleData()` - Refetches schedule data

## UI Improvements

### Enhanced MatchesTable Component
- **Immediate Refetch**: Uses `useMatchRefetch` for comprehensive data refresh
- **Delayed Refetch**: 500ms delay to ensure server-side revalidation completes
- **Better UX**: Ensures table data is immediately updated after deletion

### Enhanced MatchDeletionModal
- **Optional Callback**: `onDeleted` prop for post-deletion actions
- **Extensible**: Can trigger additional refetch logic if needed

## Query Key Strategy

### Comprehensive Invalidation Patterns
```typescript
// All match queries
queryClient.invalidateQueries({ queryKey: matchKeys.all });

// Schedule queries
queryClient.invalidateQueries({ queryKey: ['matches', 'schedule'] });
queryClient.invalidateQueries({ queryKey: ['matches', 'scheduleByDate'] });

// Related entities
queryClient.invalidateQueries({ queryKey: ['games'] });
queryClient.invalidateQueries({ queryKey: ['match_participants'] });
queryClient.invalidateQueries({ queryKey: ['game_scores'] });

// Dashboard queries
queryClient.invalidateQueries({ queryKey: ['dashboard'] });
queryClient.invalidateQueries({ queryKey: ['overview'] });
```

## Benefits

1. **No Stale Data**: Comprehensive invalidation ensures all related data is refreshed
2. **Immediate UI Updates**: Force refetch provides instant feedback
3. **Server-Client Sync**: Both server cache and client cache are properly invalidated
4. **Better UX**: Users see updated data immediately after deletion
5. **Consistent State**: All components showing match data are synchronized

## Usage Examples

### Basic Match Deletion
```typescript
const { deleteMatch } = useMatchesTable(stageId);
// Automatically handles comprehensive revalidation
deleteMatch(matchId);
```

### Manual Refetch
```typescript
import { useMatchRefetch } from '@/hooks/use-matches';

const { refetchAllMatchData } = useMatchRefetch();
// Force comprehensive refetch when needed
refetchAllMatchData();
```

### Component-Specific Refetch
```typescript
import { useMatchRefetch } from '@/hooks/use-matches';

const { refetchMatchesByStage } = useMatchRefetch();
// Refetch only stage-specific data
refetchMatchesByStage(stageId);
```

## Performance Considerations

- **Selective Invalidation**: Only invalidates relevant queries
- **Batched Updates**: React Query batches multiple invalidations
- **Background Refetch**: Uses React Query's background refetch for better UX
- **Delayed Refetch**: 500ms delay ensures server-side changes are complete

This comprehensive revalidation system ensures that when a match is deleted, all related data across the application is properly refreshed, providing a consistent and up-to-date user experience.