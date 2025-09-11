'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/table';
import { useVolunteersTable } from '@/hooks/use-volunteers';
import { useAllDepartments } from '@/hooks/use-departments';
import {
  getVolunteersTableColumns,
  getVolunteersTableActions
} from '@/components/admin/volunteers';
import { Volunteer } from '@/lib/types/volunteers';
import { VolunteersModal } from '@/components/admin/volunteers';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { VolunteerInsert, VolunteerUpdate } from '@/lib/types/volunteers';
import { useSeason } from '@/components/contexts/season-provider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function VolunteersManagementPage() {
  const { currentSeason } = useSeason();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<Volunteer | undefined>();

  // Department filter state
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Fetch departments for the filter dropdown
  const { data: departments } = useAllDepartments();

  const {
    volunteers,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading,
    tableBodyLoading,
    error,
    createVolunteer,
    updateVolunteer,
    deleteVolunteer,
    isCreating,
    isUpdating,
    isDeleting,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    onFiltersChange,
    resetFilters,
    refetch
  } = useVolunteersTable(currentSeason?.id?.toString());

  useEffect(() => {
    console.log('Current Page:', currentPage)
  }, [currentPage])

  const handleEditVolunteer = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteVolunteer = (volunteer: Volunteer) => {
    setVolunteerToDelete(volunteer);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteVolunteer = async () => {
    if (!volunteerToDelete) return;

    try {
      deleteVolunteer(volunteerToDelete.id);
      setIsDeleteModalOpen(false);
      setVolunteerToDelete(undefined);
    } catch {
      setIsDeleteModalOpen(false);
      setVolunteerToDelete(undefined);
    }
  };

  const handleSubmit = async (data: VolunteerInsert | VolunteerUpdate) => {
    if (modalMode === 'add') {
      createVolunteer(data as VolunteerInsert);
    } else {
      updateVolunteer(data as VolunteerUpdate);
    }
  };

  const handleSuccess = () => {
    // Force refetch to ensure new image URLs are loaded
    refetch();
  };

  const clearFilters = () => {
    setDepartmentFilter('all');
    resetFilters();
  };

  // Handle filter changes - this will trigger server-side filtering
  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'department') {
      setDepartmentFilter(value);
    }

    // For "all" departments, we need to reset filters completely since onFiltersChange merges
    if (value === 'all') {
      resetFilters();
    } else {
      // Only include department filter if it's not "all"
      const filters = { department_id: parseInt(value) };
      onFiltersChange(filters);
    }
  };

  const columns = getVolunteersTableColumns(departments);
  const actions = getVolunteersTableActions(handleEditVolunteer, handleDeleteVolunteer);

  return (
    <div className="w-full space-y-6">
      {/* Simple Filter Bar */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <Label htmlFor="department-filter">Department:</Label>
          <Select
            value={departmentFilter}
            onValueChange={(value) => handleFilterChange('department', value)}
          >
            <SelectTrigger id="department-filter" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {departmentFilter !== 'all' && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="h-9">
            Clear Filters
          </Button>
        )}
      </div>

      {/* Filter Badges */}
      {departmentFilter !== 'all' && (
        <div className="mb-4 flex flex-wrap gap-2">
          {departmentFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Department:{' '}
              {departments?.find((d) => d.id.toString() === departmentFilter)?.name ||
                `Dept ${departmentFilter}`}
              <button
                onClick={() => handleFilterChange('department', 'all')}
                className="hover:text-destructive ml-1"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={volunteers}
        totalCount={totalCount}
        loading={loading}
        tableBodyLoading={tableBodyLoading}
        error={error}
        columns={columns}
        actions={actions}
        currentPage={currentPage}
        pageCount={pageCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSortChange={onSortChange}
        onSearchChange={onSearchChange}
        onFiltersChange={onFiltersChange}
        title="Volunteers Management"
        subtitle={`View and manage volunteers for ${currentSeason ? `Season ${currentSeason.id}` : 'the current season'}.`}
        searchPlaceholder="Search volunteers..."
        showSearch={true}
        showFilters={false}
        addButton={{
          label: 'Add Volunteer',
          onClick: () => {
            setModalMode('add');
            setEditingVolunteer(undefined);
            setIsModalOpen(true);
          }
        }}
        className=""
        emptyMessage="No volunteers found for this season"
        initialSortBy="department_id"
        initialSortOrder="asc"
        refetch={refetch}
      />

      {/* Modal */}
      <VolunteersModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        volunteer={editingVolunteer}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        onSuccess={handleSuccess}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteVolunteer}
        type="delete"
        title="Delete Volunteer"
        message="Are you sure you want to delete this volunteer? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
