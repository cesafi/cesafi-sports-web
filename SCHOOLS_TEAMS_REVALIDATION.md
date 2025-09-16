# Schools Teams Revalidation Improvements

## Overview
Enhanced the revalidation system for schools teams operations (create, update, delete) to ensure comprehensive data refresh across all related components and pages.

## Why Schools Teams Need Comprehensive Revalidation

Schools teams are central to the sports management system and affect multiple areas:
- **Matches**: Teams participate in matches as match participants
- **Schedules**: Team information appears in schedule views
- **Dashboards**: Team counts and activities affect dashboard statistics
- **Schools**: Teams belong to schools and affect school data
- **Seasons**: Teams participate in specific seasons
- **League Stages**: Teams compete in various league stages

## Server-Side Revalidation (Next.js Cache)

### New RevalidationHelper Method
- **`revalidateSchoolsTeamsOperation()`**: Comprehensive revalidation for all schools teams operations
- **Revalidates**:
  - Schools and school teams routes
  - Seasons routes (teams participate in seasons)
  - Matches and match participants routes (teams are in matches)
  - League stage routes (teams compete in stages)
  - Dashboard routes (admin and league operator)
  - Public routes (landing page, schools page, schedule)

### Updated Schools Teams Actions
- `createSchoolsTeam()` now uses `RevalidationHelper.revalidateSchoolsTeamsOperation()`
- `updateSchoolsTeamById()` now uses `RevalidationHelper.revalidateSchoolsTeamsOperation()`
- `deleteSchoolsTeamById()` now uses `RevalidationHelper.revalidateSchoolsTeamsOperation()`

## Client-Side Revalidation (React Query)

### Enhanced Mutation Hooks
All schools teams mutation hooks now include:
- **Schools Teams Queries**: All schools teams-related queries
- **Related Entity Queries**: Schools, seasons, sports queries
- **Match-Related Queries**: Matches, match participants, schedule queries
- **Dashboard Queries**: Dashboard and overview queries
- **Force Refetch**: Active queries are refetched immediately
- **Toast Notifications**: Success/error feedback for better UX

### Enhanced useSchoolsTeamsTable Hook
- **Immediate Refetch**: Calls `refetch()` after successful operations
- **Comprehensive Invalidation**: All related queries are invalidated
- **Better UX**: Table data updates immediately after operations

### Consolidated useSchoolsTeamsRefetch Hook (in use-schools-teams.ts)
Utility hook providing methods for comprehensive schools teams data refetching:
- `refetchAllSchoolsTeamsData()` - Refetches all schools teams-related data
- `refetchTeamsBySchool(schoolId)` - Refetches teams for specific school
- `refetchTeamsBySeason(seasonId)` - Refetches teams for specific season
- `refetchTeamsBySportCategory(categoryId)` - Refetches teams for sport category
- `refetchTeamById(teamId)` - Refetches specific team data
- `refetchActiveTeamsBySchool(schoolId)` - Refetches active teams for school
- `refetchMatchRelatedData()` - Refetches match-related data that depends on teams

## Query Invalidation Strategy

### Comprehensive Invalidation Pattern
```typescript
// Schools teams queries
queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });

// Related entity queries
queryClient.invalidateQueries({ queryKey: schoolKeys.all });
queryClient.invalidateQueries({ queryKey: seasonKeys.all });
queryClient.invalidateQueries({ queryKey: sportKeys.all });

// Match-related queries (critical for teams)
queryClient.invalidateQueries({ queryKey: ['matches'] });
queryClient.invalidateQueries({ queryKey: ['match_participants'] });
queryClient.invalidateQueries({ queryKey: ['matches', 'schedule'] });
queryClient.invalidateQueries({ queryKey: ['matches', 'scheduleByDate'] });

// Dashboard queries
queryClient.invalidateQueries({ queryKey: ['dashboard'] });
queryClient.invalidateQueries({ queryKey: ['overview'] });
```

## Benefits

1. **Match Data Consistency**: When teams are added/updated/deleted, all match-related data is refreshed
2. **Schedule Accuracy**: Schedule views immediately reflect team changes
3. **Dashboard Updates**: Dashboard statistics update immediately after team operations
4. **School Data Sync**: School pages show updated team information
5. **Better UX**: Users see updated data immediately across all components
6. **No Stale Data**: Comprehensive invalidation prevents outdated information

## Usage Examples

### Creating a School Team
```typescript
const { createTeam } = useSchoolsTeamsTable(schoolId);
// Automatically handles comprehensive revalidation
createTeam(teamData);
```

### Manual Comprehensive Refetch
```typescript
import { useSchoolsTeamsRefetch } from '@/hooks/use-schools-teams';

const { refetchAllSchoolsTeamsData } = useSchoolsTeamsRefetch();
// Force comprehensive refetch when needed
refetchAllSchoolsTeamsData();
```

### Refetch Match-Related Data After Team Changes
```typescript
import { useSchoolsTeamsRefetch } from '@/hooks/use-schools-teams';

const { refetchMatchRelatedData } = useSchoolsTeamsRefetch();
// Specifically refetch match data that depends on teams
refetchMatchRelatedData();
```

## Impact Areas

When a school team is created, updated, or deleted, the following areas are automatically refreshed:

### ✅ Direct Impact
- Schools teams tables and lists
- School detail pages (showing teams)
- Season pages (showing participating teams)

### ✅ Indirect Impact
- Match creation/editing (team selection dropdowns)
- Match participant management
- Schedule views (showing team information)
- Dashboard statistics (team counts, recent activity)

### ✅ Public Pages
- Landing page (if showing team-related content)
- Schools page (showing school teams)
- Schedule page (showing team information in matches)

This comprehensive revalidation system ensures that when you add, update, or delete a school team, all related data across the entire application is properly refreshed, providing a consistent and up-to-date user experience.