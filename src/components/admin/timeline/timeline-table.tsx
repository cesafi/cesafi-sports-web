'use client';

import { useState } from 'react';
import { DataTable } from '@/components/table';
import { Plus } from 'lucide-react';
import { Timeline, TimelinePaginationOptions } from '@/lib/types/timeline';
import { timelineTableColumns, getTimelineActions } from './timeline-table-columns';
import { useTable } from '@/hooks/use-table';
import { usePaginatedTimeline, useDeleteTimeline, useUpdateTimeline } from '@/hooks/use-timeline';
import { TimelineFormDialog } from './timeline-form-dialog';
import { TimelineViewDialog } from './timeline-view-dialog';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { toast } from 'sonner';

interface TimelineTableProps {
  initialData?: {
    data: Timeline[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
  };
  initialPagination?: TimelinePaginationOptions;
}

export function TimelineTable({ initialPagination }: TimelineTableProps) {
  const [selectedTimeline, setSelectedTimeline] = useState<Timeline | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [timelineToDelete, setTimelineToDelete] = useState<Timeline | null>(null);

  // Table state management
  const {
    tableState,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters
  } = useTable<Timeline>({
    initialPage: initialPagination?.page || 1,
    initialPageSize: initialPagination?.pageSize || 10,
    initialSortBy: initialPagination?.sortBy || 'year',
    initialSortOrder: initialPagination?.sortOrder || 'asc'
  });

  // Data fetching
  const {
    data: timelineData,
    isLoading,
    error
  } = usePaginatedTimeline({
    page: tableState.page,
    pageSize: tableState.pageSize,
    sortBy: tableState.sortBy,
    sortOrder: tableState.sortOrder,
    searchQuery: tableState.filters.search,
    filters: tableState.filters as any // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  // Mutations
  const deleteTimelineMutation = useDeleteTimeline({
    onSuccess: () => {
      toast.success('Timeline event deleted successfully');
      setIsDeleteOpen(false);
      setTimelineToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete timeline event: ${error.message}`);
    }
  });

  const updateTimelineMutation = useUpdateTimeline({
    onSuccess: () => {
      toast.success('Timeline event updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update timeline event: ${error.message}`);
    }
  });

  // Event handlers
  const handleView = (timeline: Timeline) => {
    setSelectedTimeline(timeline);
    setIsViewOpen(true);
  };

  const handleEdit = (timeline: Timeline) => {
    setSelectedTimeline(timeline);
    setIsFormOpen(true);
  };

  const handleDelete = (timeline: Timeline) => {
    setTimelineToDelete(timeline);
    setIsDeleteOpen(true);
  };

  const handleToggleHighlight = async (timeline: Timeline) => {
    await updateTimelineMutation.mutateAsync({
      id: timeline.id,
      is_highlight: !timeline.is_highlight
    });
  };

  const handleConfirmDelete = async () => {
    if (timelineToDelete) {
      await deleteTimelineMutation.mutateAsync(timelineToDelete.id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTimeline(null);
  };

  const handleViewClose = () => {
    setIsViewOpen(false);
    setSelectedTimeline(null);
  };

  // Table actions
  const actions = getTimelineActions(
    handleView,
    handleEdit,
    handleDelete,
    handleToggleHighlight
  );

  return (
    <>
      <DataTable
        data={timelineData?.data || []}
        totalCount={timelineData?.totalCount || 0}
        currentPage={timelineData?.currentPage || 1}
        pageCount={timelineData?.pageCount || 0}
        pageSize={tableState.pageSize}
        loading={isLoading}
        error={error?.message || null}
        columns={timelineTableColumns}
        actions={actions}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={setSortBy}
        onSearchChange={setSearch}
        onFiltersChange={setFilters}
        title="Timeline Events"
        subtitle="Manage CESAFI timeline events and milestones"
        searchPlaceholder="Search timeline events..."
        addButton={{
          label: 'Add Event',
          onClick: () => setIsFormOpen(true),
          icon: <Plus className="h-4 w-4" />
        }}
        emptyMessage="No timeline events found. Create your first event to get started."
        initialSortBy="year"
        initialSortOrder="asc"
      />

      {/* Form Dialog */}
      <TimelineFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        timeline={selectedTimeline}
        onClose={handleFormClose}
      />

      {/* View Dialog */}
      <TimelineViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        timeline={selectedTimeline}
        onClose={handleViewClose}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setTimelineToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Timeline Event"
        message={`Are you sure you want to delete the timeline event "${timelineToDelete?.title}"? This action cannot be undone and will permanently remove the event from the system.`}
        type="delete"
        confirmText="Delete Event"
        cancelText="Cancel"
        destructive={true}
        isLoading={deleteTimelineMutation.isPending}
      />
    </>
  );
}
