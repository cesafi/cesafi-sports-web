# League Stage Management System

This directory contains the components for managing sports season stages (league stages) in the admin dashboard.

## Overview

The League Stage Management System allows administrators to:
- Create new competition stages for sports seasons
- Edit existing stages
- Delete stages (with validation that no matches are associated)
- View all stages in a paginated table

## Components

### `league-stage-table-columns.tsx`
Defines the table columns and actions for displaying league stages:
- **Stage Information**: Shows the competition stage name and ID with a trophy icon
- **Sport & Category**: Displays the actual sport name and formatted category details (e.g., "Basketball" and "Men's High School")
- **Season**: Shows the season ID
- **Created**: Shows the creation date
- **Actions**: Edit and delete buttons

**Enhanced Sport Display**: The Sport & Category column now shows real-time fetched data:
- **Sport Name**: Fetched from the sports table (e.g., "Basketball", "Volleyball")
- **Category Details**: Formatted using utility functions (e.g., "Men's High School", "Women's College")
- **Loading States**: Shows "Loading..." while fetching data
- **Error Handling**: Gracefully handles fetch failures

### `league-stage-modal.tsx`
Modal component for creating and editing league stages:
- **Sport Selection**: Dropdown to select a sport
- **Sport Category Selection**: Filtered dropdown based on selected sport with formatted category names
- **Season Selection**: Dropdown to select a season (defaults to current season)
- **Competition Stage Selection**: Dropdown with predefined stages (group_stage, playins, playoffs, finals)

**Important Form Pattern**: The modal form uses a unique form ID and the submit button references it via the `form` attribute to ensure proper form submission behavior:

```tsx
<ModalLayout
  // ... other props
  footer={
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      <Button type="submit" form="league-stage-form" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Stage' : 'Update Stage'}
      </Button>
    </div>
  }
>
  <form id="league-stage-form" onSubmit={handleSubmit} className="space-y-4">
    {/* Form fields */}
  </form>
</ModalLayout>
```

### `page.tsx`
Main page component that integrates all functionality:
- Uses the `useSportsSeasonsStagesTable` hook for data management
- Implements DataTable with search, pagination, and sorting
- Handles modal state and CRUD operations
- Includes confirmation modal for deletions

## Data Flow

1. **Season Context**: Gets the current season and available seasons from the season provider
2. **Sports Data**: Fetches all sports and sport categories using React Query hooks
3. **Form Validation**: Uses Zod schemas for client-side validation
4. **Server Actions**: Handles CRUD operations through server actions
5. **Real-time Updates**: Automatically refreshes data after successful operations

## Key Features

### Seasonal Management
- Automatically gets the current season from context
- Allows selection from all available seasons
- Prevents duplicate stages for the same sport-season combination

### Sport Category Filtering
- Sport selection filters available categories
- Prevents invalid category selections
- Shows division and level information

### Validation
- Client-side validation with Zod schemas
- Server-side validation for business rules
- Prevents deletion of stages with associated matches

### User Experience
- Loading states for all operations
- Success/error toast notifications
- Automatic modal closing after successful operations
- Responsive table with search and pagination

### Form Submission Pattern
- **Form ID**: Each modal form has a unique ID (e.g., `league-stage-form`)
- **Button Form Attribute**: Submit buttons use `form="form-id"` to reference the form
- **Proper Submission**: This ensures the button can submit the form even when outside the form element
- **Accessibility**: Improves screen reader support and form behavior

### Enhanced Data Display
- **Real-time Sport Names**: Fetches and displays actual sport names instead of IDs
- **Formatted Categories**: Uses utility functions to show human-readable category names
- **Loading States**: Provides visual feedback while data is being fetched
- **Error Resilience**: Gracefully handles network failures and missing data

## Database Schema

The system works with the `sports_seasons_stages` table:
- `id`: Primary key
- `competition_stage`: Enum (group_stage, playins, playoffs, finals)
- `season_id`: Foreign key to seasons table
- `sport_category_id`: Foreign key to sports_categories table
- `created_at`, `updated_at`: Timestamps

## Dependencies

- **React Query**: For data fetching and caching
- **Zod**: For form validation
- **Shadcn/UI**: For UI components
- **Lucide React**: For icons
- **Season Context**: For current season management
- **Sports Utils**: For formatting sport category names

## Usage

Navigate to `/admin/league-stage` to access the management interface. The system automatically loads the current season and provides a comprehensive interface for managing competition stages across different sports and seasons.

## Implementation Notes

### Modal Form Pattern
When implementing modals with forms, always follow this pattern:

1. **Assign a unique ID to the form**: `<form id="unique-form-id">`
2. **Reference the form ID in the submit button**: `<Button form="unique-form-id" type="submit">`
3. **Ensure the form ID is descriptive and unique** across the application

This pattern ensures:
- Proper form submission behavior
- Accessibility compliance
- Consistent user experience
- Proper event handling in complex modal layouts

### Enhanced Data Display Pattern
For displaying related data in table columns:

1. **Create a component for complex data**: Use a separate component for data that requires multiple API calls
2. **Use utility functions**: Leverage existing utility functions for consistent formatting
3. **Implement loading states**: Show loading indicators while fetching data
4. **Handle errors gracefully**: Provide fallback displays for failed requests
5. **Optimize with useEffect**: Use useEffect to fetch data when the component mounts or dependencies change
