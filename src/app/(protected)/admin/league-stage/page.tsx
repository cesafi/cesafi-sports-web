'use client';

import { useState } from 'react';
import { DataTable } from '@/components/table';
import { useSportsSeasonsStagesTable } from '@/hooks/use-sports-seasons-stages';
import {
  getLeagueStageTableColumns,
  getLeagueStageTableActions
} from '@/components/admin/league-stage';
import { SportsSeasonsStage } from '@/lib/types/sports-seasons-stages';
import { LeagueStageModal } from '@/components/admin/league-stage';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import {
  SportsSeasonsStageInsert,
  SportsSeasonsStageUpdate
} from '@/lib/types/sports-seasons-stages';

export default function LeagueStageManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingStage, setEditingStage] = useState<SportsSeasonsStage | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<SportsSeasonsStage | undefined>();

  const {
    stages,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading,
    tableBodyLoading,
    error,
    createStage,
    updateStage,
    deleteStage,
    isCreating,
    isUpdating,
    isDeleting,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    onFiltersChange
  } = useSportsSeasonsStagesTable();

  const handleEditStage = (stage: SportsSeasonsStage) => {
    setEditingStage(stage);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteStage = (stage: SportsSeasonsStage) => {
    setStageToDelete(stage);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteStage = async () => {
    if (!stageToDelete) return;

    try {
      deleteStage(stageToDelete.id);
      setIsDeleteModalOpen(false);
      setStageToDelete(undefined);
    } catch {
      setIsDeleteModalOpen(false);
      setStageToDelete(undefined);
    }
  };

  const handleSubmit = async (data: SportsSeasonsStageInsert | SportsSeasonsStageUpdate) => {
    if (modalMode === 'add') {
      createStage(data as SportsSeasonsStageInsert);
    } else {
      updateStage(data as SportsSeasonsStageUpdate);
    }
  };

  const columns = getLeagueStageTableColumns();
  const actions = getLeagueStageTableActions(handleEditStage, handleDeleteStage);

  return (
    <div className="w-full space-y-6">
      {/* Data Table */}
      <DataTable
        data={stages}
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
        title="League Stages Management"
        subtitle="View and manage competition stages for sports seasons."
        searchPlaceholder="Search stages..."
        showSearch={true}
        showFilters={false}
        addButton={{
          label: 'Add League Stage',
          onClick: () => {
            setModalMode('add');
            setEditingStage(undefined);
            setIsModalOpen(true);
          }
        }}
        className=""
        emptyMessage="No league stages found"
      />

      {/* Modal */}
      <LeagueStageModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        stage={editingStage}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteStage}
        type="delete"
        title="Delete League Stage"
        message={`Are you sure you want to delete this league stage? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
