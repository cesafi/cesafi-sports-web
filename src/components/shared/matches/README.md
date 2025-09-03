# Matches Management System

This directory contains the components for managing matches in the admin dashboard with advanced filtering capabilities.

## Overview

The Matches Management System allows administrators to:
- Select a sport, sport category, and league stage to filter matches
- View all matches for the selected league stage
- Create new matches with detailed information
- Edit existing match details
- Delete matches (with confirmation)
- Switch between different league stages seamlessly

## Architecture

### **Multi-Level Filtering System**
- **Sport Selection**: First level filter for sports
- **Sport Category Selection**: Second level filter based on selected sport
- **League Stage Selection**: Third level filter based on selected sport category
- **Page-Exclusive Context**: All filtering is local to the page component

## Components

### `league-stage-selector.tsx`
Multi-level selector component that allows users to filter matches:
- **Sport Selection**: Dropdown to select a sport
- **Sport Category Selection**: Filtered dropdown based on selected sport
- **League Stage Selection**: Filtered dropdown based on selected sport category
- **Auto-Selection**: Automatically selects first available options
- **Current Selection Display**: Shows the complete filter path
- **Cascading Filters**: Each selection filters the next level

### `matches-table-columns.tsx`
Defines the table columns and actions for displaying matches:
- **Match Information**: Shows match name and description with trophy icon
- **Sport & Category**: Displays sport name and formatted category details
- **League Stage**: Shows the competition stage (e.g., "Group Stage", "Playoffs")
- **Venue**: Shows match venue with location icon
- **Scheduled**: Shows scheduled date and start time
- **Actions**: Edit and delete buttons

### `match-modal.tsx`
Modal component for creating and editing matches:
- **Match Name**: Text input for match name
- **Description**: Textarea for match description
- **Venue**: Text input for venue
- **League Stage Display**: Shows selected stage information (read-only)
- **Best of**: Dropdown for match format (1, 3, 5, 7)
- **Scheduled Date**: DateTime picker for scheduled time
- **Start Date**: DateTime picker for start time
- **End Date**: DateTime picker for end time

**Form Pattern**: Uses the established form ID pattern for proper submission behavior.

### `page.tsx`
Main page component that integrates all functionality:
- **League Stage Selector**: At the top for multi-level filtering
- **Matches Table**: Below showing matches for selected stage
- **Modal Management**: Handles match creation, editing, and deletion
- **State Management**: Manages all filter selections and match operations

## Data Flow

1. **Page Load**: Fetches available sports and auto-selects the first one
2. **Sport Selection**: User selects a sport, filters available categories
3. **Category Selection**: User selects a sport category, filters available stages
4. **Stage Selection**: User selects a league stage, fetches matches
5. **CRUD Operations**: All match operations are scoped to the selected stage
6. **Real-time Updates**: Table refreshes after successful operations

## Key Features

### Multi-Level Filtering
- **Cascading Selection**: Each choice filters the next level
- **Auto-Selection**: Automatically selects first available options
- **Visual Feedback**: Clear display of current filter path
- **Smart Filtering**: Only shows relevant options at each level

### Match Management
- **Full CRUD**: Create, read, update, and delete matches
- **Stage Integration**: Matches are linked to specific league stages
- **DateTime Management**: Comprehensive scheduling capabilities
- **Format Control**: Best-of series configuration

### User Experience
- **Loading States**: Visual feedback during data fetching
- **Error Handling**: Graceful error handling and user feedback
- **Responsive Design**: Works well on different screen sizes
- **Consistent UI**: Follows established admin patterns

## State Management

### Local State (Page-Exclusive)
```tsx
const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
const [selectedSportCategoryId, setSelectedSportCategoryId] = useState<number | null>(null);
const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
const [editingMatch, setEditingMatch] = useState<MatchWithStageDetails | undefined>();
```

### Hook Integration
```tsx
const {
  matches,
  createMatch,
  updateMatch,
  deleteMatch,
  // ... other properties
} = useMatchesTable(selectedStageId);
```

## Database Schema

The system works with the `matches` table and related entities:
- **matches**: Primary table with match information
- **sports_seasons_stages**: Links sports, categories, and competition stages
- **sports_categories**: Defines sport divisions and levels
- **sports**: Basic sport information
- **seasons**: Season information

## Dependencies

- **React Query**: For data fetching and caching
- **Shadcn/UI**: For UI components
- **Lucide React**: For icons
- **Sports Utils**: For formatting sport category names
- **Date Utils**: For date formatting and manipulation

## Usage

Navigate to `/admin/matches` to access the management interface. The system:
1. Automatically loads available sports
2. Allows selection of sport, category, and stage
3. Shows matches for the selected league stage
4. Provides full match management capabilities
5. Maintains filter context throughout the session

## Implementation Notes

### Filtering Pattern
- **Cascading Logic**: Each selection filters the next level
- **Auto-Selection**: First available options are automatically selected
- **State Synchronization**: All filter states are properly synchronized
- **Performance**: Efficient filtering with minimal API calls

### Match Operations
- **Stage-Scoped**: All operations are limited to the selected stage
- **Real-time Updates**: Table refreshes after successful operations
- **Error Handling**: Comprehensive error handling with user feedback
- **Validation**: Client-side validation for all form fields

### Performance Considerations
- **Conditional Fetching**: Matches are only fetched when a stage is selected
- **Query Invalidation**: Proper cache invalidation after mutations
- **Loading States**: Separate loading states for initial load vs. operations
- **Optimistic Updates**: Immediate UI feedback for better UX
