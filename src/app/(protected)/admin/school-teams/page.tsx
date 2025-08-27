'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/table';
import { useSchoolsTeamsTable } from '@/hooks/use-schools-teams';
import {
  getSchoolsTeamsTableColumns,
  getSchoolsTeamsTableActions
} from '@/components/admin/schools-teams';
import { SchoolsTeamWithSportDetails } from '@/lib/types/schools-teams';
import { SchoolTeamModal } from '@/components/admin/schools-teams';
import { SchoolSelector } from '@/components/admin/schools-teams';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import {
  SchoolsTeamInsert,
  SchoolsTeamUpdate
} from '@/lib/types/schools-teams';
import { useAllSchools } from '@/hooks/use-schools';

export default function SchoolsTeamsManagementPage() {
  const { data: schools } = useAllSchools();
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingTeam, setEditingTeam] = useState<SchoolsTeamWithSportDetails | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<SchoolsTeamWithSportDetails | undefined>();

  // Auto-select first school on page load
  useEffect(() => {
    if (!selectedSchoolId && schools && schools.length > 0) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [selectedSchoolId, schools]);

  const {
    teams,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading,
    tableBodyLoading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    isCreating,
    isUpdating,
    isDeleting,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    onFiltersChange
  } = useSchoolsTeamsTable(selectedSchoolId);

  const selectedSchool = schools?.find(school => school.id === selectedSchoolId);

  const handleEditTeam = (team: SchoolsTeamWithSportDetails) => {
    setEditingTeam(team);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteTeam = (team: SchoolsTeamWithSportDetails) => {
    setTeamToDelete(team);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      deleteTeam(teamToDelete.id);
      setIsDeleteModalOpen(false);
      setTeamToDelete(undefined);
    } catch {
      setIsDeleteModalOpen(false);
      setTeamToDelete(undefined);
    }
  };

  const handleSubmit = async (data: SchoolsTeamInsert | SchoolsTeamUpdate) => {
    if (modalMode === 'add') {
      createTeam(data as SchoolsTeamInsert);
    } else {
      updateTeam(data as SchoolsTeamUpdate);
    }
  };

  const columns = getSchoolsTeamsTableColumns();
  const actions = getSchoolsTeamsTableActions(handleEditTeam, handleDeleteTeam);

  // Don't render the page until a school is selected
  if (!selectedSchoolId) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading schools...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* School Selector */}
      <div className="bg-card p-6 rounded-lg border">
        <SchoolSelector
          selectedSchoolId={selectedSchoolId}
          onSchoolChange={setSelectedSchoolId}
          className="max-w-md"
        />
      </div>

      {/* Teams Table */}
      <DataTable
        data={teams}
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
        title={`${selectedSchool?.name} Teams Management`}
        subtitle={`Manage teams for ${selectedSchool?.name}. Currently showing ${teams.length} teams.`}
        searchPlaceholder="Search teams..."
        showSearch={true}
        showFilters={false}
        addButton={{
          label: 'Add Team',
          onClick: () => {
            setModalMode('add');
            setEditingTeam(undefined);
            setIsModalOpen(true);
          }
        }}
        className=""
        emptyMessage={`No teams found for ${selectedSchool?.name}`}
      />

      {/* Team Modal */}
      <SchoolTeamModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        team={editingTeam}
        selectedSchoolId={selectedSchoolId}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteTeam}
        type="delete"
        title="Delete Team"
        message={`Are you sure you want to delete the team "${teamToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
