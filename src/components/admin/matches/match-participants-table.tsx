'use client';

import { useState } from 'react';
import { DataTable } from '@/components/table';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { TeamSelectionModal } from './team-selection-modal';
import { MatchParticipantWithFullDetails } from '@/lib/types/match-participants';
import { useMatchParticipantsTable } from '@/hooks/use-match-participants-table';
import { getMatchParticipantsTableColumns, getMatchParticipantsTableActions } from './match-participants-table-columns';

interface MatchParticipantsTableProps {
  matchId: number;
  isLoading?: boolean;
}

export function MatchParticipantsTable({ matchId, isLoading: externalLoading }: MatchParticipantsTableProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<MatchParticipantWithFullDetails | undefined>();

  // Fetch participants for this match
  const {
    participants,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading: participantsLoading,
    tableBodyLoading,
    error: participantsError,
    addParticipant,
    removeParticipant,
    isAdding,
    isRemoving,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    onFiltersChange,
    refetch
  } = useMatchParticipantsTable(matchId);

  const handleRemoveParticipant = (participant: MatchParticipantWithFullDetails) => {
    setParticipantToDelete(participant);
    setIsDeleteModalOpen(true);
  };

  const confirmRemoveParticipant = async () => {
    if (!participantToDelete) return;

    try {
      removeParticipant(participantToDelete.id);
      setIsDeleteModalOpen(false);
      setParticipantToDelete(undefined);
    } catch {
      setIsDeleteModalOpen(false);
      setParticipantToDelete(undefined);
    }
  };

  const columns = getMatchParticipantsTableColumns();
  const actions = getMatchParticipantsTableActions(handleRemoveParticipant);

  const loading = externalLoading || participantsLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Participating Teams</h3>
            <p className="text-sm text-muted-foreground">Loading participating teams for this match...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 border rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading participants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={participants}
        totalCount={totalCount}
        loading={false}
        tableBodyLoading={tableBodyLoading}
        error={participantsError}
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
        title="Participating Teams"
        subtitle={`Managing teams participating in this match. Currently showing ${participants.length} teams.`}
        searchPlaceholder="Search teams..."
        showSearch={true}
        showFilters={false}
        addButton={{
          label: 'Add Team',
          onClick: () => setIsAddModalOpen(true)
        }}
        className=""
        emptyMessage="No teams participating in this match"
      />

      {/* Team Selection Modal */}
      <TeamSelectionModal
        matchId={matchId}
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onTeamAdded={() => {
          refetch();
          setIsAddModalOpen(false);
        }}
        existingParticipants={participants}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmRemoveParticipant}
        type="delete"
        title="Remove Team from Match"
        message={
          participantToDelete
            ? `Are you sure you want to remove ${participantToDelete.schools_teams.schools.abbreviation} ${participantToDelete.schools_teams.name} from this match? This action cannot be undone.`
            : ''
        }
        confirmText="Remove"
        cancelText="Cancel"
        destructive={true}
        isLoading={isRemoving}
      />
    </div>
  );
}