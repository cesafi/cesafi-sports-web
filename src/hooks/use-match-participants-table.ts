import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTable } from './use-table';
import { getMatchParticipantsWithDetails, deleteMatchParticipantById } from '@/actions/match-participants';
import { MatchParticipantWithFullDetails } from '@/lib/types/match-participants';
import { PaginationOptions } from '@/lib/types/base';

export const matchParticipantsTableKeys = {
  byMatch: (matchId: number, options?: PaginationOptions) => ['match-participants-table', matchId, options] as const,
};

export function useMatchParticipantsTable(matchId: number) {
  const queryClient = useQueryClient();
  const {
    tableState,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters,
    resetFilters,
    paginationOptions
  } = useTable<MatchParticipantWithFullDetails>({
    initialPage: 1,
    initialPageSize: 10,
  });

  // Fetch participants for the match
  const {
    data: participants = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: matchParticipantsTableKeys.byMatch(matchId, paginationOptions as PaginationOptions),
    queryFn: async () => {
      const result = await getMatchParticipantsWithDetails(matchId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch match participants');
      }
      return result.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // For now, we'll use simple pagination on the client side
  // In the future, this could be moved to server-side pagination
  const startIndex = (tableState.page - 1) * tableState.pageSize;
  const endIndex = startIndex + tableState.pageSize;
  const paginatedParticipants = participants.slice(startIndex, endIndex);
  const totalCount = participants.length;
  const pageCount = Math.ceil(totalCount / tableState.pageSize);

  // Add participant mutation (placeholder for future implementation)
  const addParticipantMutation = useMutation({
    mutationFn: async (teamId: string) => {
      // This would be implemented when we add the team selection functionality
      throw new Error('Add participant not implemented yet');
    },
    onSuccess: () => {
      toast.success('Team added to match successfully');
      queryClient.invalidateQueries({ queryKey: matchParticipantsTableKeys.byMatch(matchId) });
    },
    onError: () => {
      toast.error('Failed to add team to match');
    }
  });

  // Remove participant mutation
  const removeParticipantMutation = useMutation({
    mutationFn: deleteMatchParticipantById,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Team removed from match successfully');
        queryClient.invalidateQueries({ queryKey: matchParticipantsTableKeys.byMatch(matchId) });
      } else {
        toast.error(result.error || 'Failed to remove team from match');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  return {
    // Data
    participants: paginatedParticipants,
    totalCount,
    pageCount,
    currentPage: tableState.page,
    pageSize: tableState.pageSize,
    loading,
    tableBodyLoading: loading,
    error: error?.message,

    // Table controls
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onSortChange: setSortBy,
    onSearchChange: setSearch,
    onFiltersChange: setFilters,
    resetFilters,
    refetch,

    // Mutations
    addParticipant: addParticipantMutation.mutate,
    removeParticipant: removeParticipantMutation.mutate,

    // Loading states
    isAdding: addParticipantMutation.isPending,
    isRemoving: removeParticipantMutation.isPending
  };
}