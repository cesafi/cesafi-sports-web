# Hook Consolidation Improvements

## Overview
Consolidated refetch utility functions into their main hook files for better maintainability and developer experience.

## Before: Separate Files
```
src/hooks/
├── use-matches.ts
├── use-match-refetch.ts          ❌ Separate file
├── use-schools-teams.ts
└── use-schools-teams-refetch.ts  ❌ Separate file
```

## After: Consolidated Files
```
src/hooks/
├── use-matches.ts                ✅ Contains useMatchRefetch
└── use-schools-teams.ts          ✅ Contains useSchoolsTeamsRefetch
```

## Benefits of Consolidation

### 1. **Better Maintainability**
- Related functionality is kept together
- Easier to find and modify refetch logic
- Reduces cognitive load when working with hooks

### 2. **Simplified Imports**
```typescript
// Before: Multiple imports
import { useDeleteMatchWithCascade } from '@/hooks/use-matches';
import { useMatchRefetch } from '@/hooks/use-match-refetch';

// After: Single import
import { useDeleteMatchWithCascade, useMatchRefetch } from '@/hooks/use-matches';
```

### 3. **Reduced File Count**
- Fewer files to navigate
- Cleaner project structure
- Less context switching for developers

### 4. **Logical Grouping**
- Query hooks and refetch utilities are logically related
- Follows the principle of keeping related code together
- Easier to understand the complete API of each entity

## File Structure

### src/hooks/use-matches.ts
```typescript
// Query hooks
export function useMatchById() { ... }
export function useDeleteMatchWithCascade() { ... }
export function useMatchesTable() { ... }

// Refetch utilities (consolidated)
export function useMatchRefetch() {
  return {
    refetchAllMatchData,
    refetchMatchById,
    refetchMatchesByStage,
    refetchScheduleData
  };
}
```

### src/hooks/use-schools-teams.ts
```typescript
// Query hooks
export function useCreateSchoolsTeam() { ... }
export function useSchoolsTeamsTable() { ... }

// Refetch utilities (consolidated)
export function useSchoolsTeamsRefetch() {
  return {
    refetchAllSchoolsTeamsData,
    refetchTeamsBySchool,
    refetchTeamsBySeason,
    refetchMatchRelatedData
  };
}
```

## Usage Examples

### Matches
```typescript
import { 
  useDeleteMatchWithCascade, 
  useMatchRefetch 
} from '@/hooks/use-matches';

function MatchComponent() {
  const deleteMatch = useDeleteMatchWithCascade();
  const { refetchAllMatchData } = useMatchRefetch();
  
  // Use both hooks from same import
}
```

### Schools Teams
```typescript
import { 
  useCreateSchoolsTeam, 
  useSchoolsTeamsRefetch 
} from '@/hooks/use-schools-teams';

function TeamsComponent() {
  const createTeam = useCreateSchoolsTeam();
  const { refetchAllSchoolsTeamsData } = useSchoolsTeamsRefetch();
  
  // Use both hooks from same import
}
```

## Developer Experience Improvements

1. **Single Source of Truth**: All entity-related hooks in one file
2. **Easier Discovery**: Developers can see all available hooks for an entity
3. **Better IntelliSense**: IDE can provide better autocomplete suggestions
4. **Simplified Documentation**: One file to document per entity
5. **Easier Testing**: Related functionality can be tested together

## Best Practices Applied

- ✅ **Cohesion**: Related functionality grouped together
- ✅ **Single Responsibility**: Each file handles one entity
- ✅ **DRY Principle**: No duplication of query client logic
- ✅ **Discoverability**: Easy to find all hooks for an entity
- ✅ **Maintainability**: Changes to refetch logic are localized

This consolidation makes the codebase more maintainable while preserving all the comprehensive revalidation functionality we implemented.