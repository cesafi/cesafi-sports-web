'use client';

import { useState } from 'react';
import { DataTable } from '@/components/table';
import { useMatchesTable } from '@/hooks/use-matches';
import {
  getMatchesTableColumns,
  getMatchesTableActions
} from '@/components/admin/matches';
import { MatchWithStageDetails } from '@/lib/types/matches';
import { MatchModal } from '@/components/admin/matches';
import { LeagueStageSelector } from '@/components/admin/matches';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import {
  MatchInsert,
  MatchUpdate
} from '@/lib/types/matches';

export default function MatchesManagementPage() {
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [selectedSportCategoryId, setSelectedSportCategoryId] = useState<number | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingMatch, setEditingMatch] = useState<MatchWithStageDetails | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<MatchWithStageDetails | undefined>();

  const {
    matches,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading,
    tableBodyLoading,
    error,
    createMatch,
    updateMatch,
    deleteMatch,
    isCreating,
    isUpdating,
    isDeleting,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    onFiltersChange
  } = useMatchesTable(selectedStageId);

  const handleEditMatch = (match: MatchWithStageDetails) => {
    setEditingMatch(match);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteMatch = (match: MatchWithStageDetails) => {
    setMatchToDelete(match);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteMatch = async () => {
    if (!matchToDelete) return;

    try {
      deleteMatch(matchToDelete.id);
      setIsDeleteModalOpen(false);
      setMatchToDelete(undefined);
    } catch {
      setIsDeleteModalOpen(false);
      setMatchToDelete(undefined);
    }
  };

  const handleSubmit = async (data: MatchInsert | MatchUpdate) => {
    if (modalMode === 'add') {
      createMatch(data as MatchInsert);
    } else {
      updateMatch(data as MatchUpdate);
    }
  };

  const columns = getMatchesTableColumns();
  const actions = getMatchesTableActions(handleEditMatch, handleDeleteMatch);

  // Show loading state while waiting for initial data
  if (!selectedStageId) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Select League Stage</h2>
          <LeagueStageSelector
            selectedSportId={selectedSportId}
            selectedSportCategoryId={selectedSportCategoryId}
            selectedStageId={selectedStageId}
            onSportChange={setSelectedSportId}
            onSportCategoryChange={setSelectedSportCategoryId}
            onStageChange={setSelectedStageId}
            className="max-w-2xl"
          />
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Waiting for league stage selection...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Please select a sport, category, and stage above
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* League Stage Selector */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Select League Stage</h2>
        <LeagueStageSelector
          selectedSportId={selectedSportId}
          selectedSportCategoryId={selectedSportCategoryId}
          selectedStageId={selectedStageId}
          onSportChange={setSelectedSportId}
          onSportCategoryChange={setSelectedSportCategoryId}
          onStageChange={setSelectedStageId}
          className="max-w-2xl"
        />
      </div>

      {/* Matches Table */}
      <DataTable
        data={matches}
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
        title="Matches Management"
        subtitle={`Managing matches for the selected league stage. Currently showing ${matches.length} matches.`}
        searchPlaceholder="Search matches..."
        showSearch={true}
        showFilters={false}
        addButton={{
          label: 'Add Match',
          onClick: () => {
            setModalMode('add');
            setEditingMatch(undefined);
            setIsModalOpen(true);
          }
        }}
        className=""
        emptyMessage="No matches found for the selected league stage"
      />

      {/* Match Modal */}
      <MatchModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        match={editingMatch}
        selectedStageId={selectedStageId}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteMatch}
        type="delete"
        title="Delete Match"
        message={`Are you sure you want to delete the match "${matchToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
