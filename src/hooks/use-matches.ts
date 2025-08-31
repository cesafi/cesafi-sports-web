import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedMatches,
  getAllMatches,
  getMatchById,
  getMatchesByStageId,
  getMatchesBySportAndCategory,
  getMatchesBySeason,
  createMatch,
  createMatchWithParticipants,
  updateMatchById,
  deleteMatchById
} from '@/actions/matches';

import { MatchInsert, MatchUpdate, MatchPaginationOptions, Match, MatchWithStageDetails, MatchWithFullDetails } from '@/lib/types/matches';

import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';
import { useTable } from './use-table';
import { TableFilters } from '@/lib/types/table';
import { toast } from 'sonner';

export const matchKeys = {
  all: ['matches'] as const,
  paginated: (options: MatchPaginationOptions) => [...matchKeys.all, 'paginated', options] as const,
  details: (id: number) => [...matchKeys.all, id] as const,
  byStage: (stageId: number) => [...matchKeys.all, 'stage', stageId] as const
};

export function usePaginatedMatches(
  options: MatchPaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<Match>>,
    Error,
    PaginatedResponse<Match>
  >
) {
  return useQuery({
    queryKey: matchKeys.paginated(options),
    queryFn: () => getPaginatedMatches(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated matches.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllMatches(
  queryOptions?: UseQueryOptions<ServiceResponse<Match[]>, Error, Match[]>
) {
  return useQuery({
    queryKey: matchKeys.all,
    queryFn: getAllMatches,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch all matches.');
      }
      return data.data;
    },
    ...queryOptions
  });
}



export function useCreateMatch(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, MatchInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMatch,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: matchKeys.all });
        // Invalidate stage-specific queries if stage_id is provided
        if (variables.stage_id) {
          queryClient.invalidateQueries({
            queryKey: matchKeys.byStage(variables.stage_id)
          });
        }
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create match:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateMatch(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, MatchUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMatchById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: matchKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: matchKeys.details(variables.id) });
        }
        // Invalidate stage-specific queries if stage_id is provided
        if (variables.stage_id) {
          queryClient.invalidateQueries({
            queryKey: matchKeys.byStage(variables.stage_id)
          });
        }
        // Also invalidate games and participants that might be related
        queryClient.invalidateQueries({ queryKey: ['games'] });
        queryClient.invalidateQueries({ queryKey: ['match_participants'] });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update match:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteMatch(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, number>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMatchById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: matchKeys.all });
        queryClient.invalidateQueries({ queryKey: matchKeys.details(id) });
        // Invalidate related entities
        queryClient.invalidateQueries({ queryKey: ['games'] });
        queryClient.invalidateQueries({ queryKey: ['match_participants'] });
        queryClient.invalidateQueries({ queryKey: ['game_scores'] });
      }
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete match:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}

// Table-specific hook for matches management
export function useMatchesTable(selectedStageId: number | null) {
  const {
    tableState,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters,
    resetFilters,
    paginationOptions
  } = useTable<MatchWithStageDetails>({
    initialPage: 1,
    initialPageSize: 10,
    initialSortBy: 'scheduled_at',
    initialSortOrder: 'asc',
    pageSizeOptions: [5, 10, 25, 50, 100]
  });

  // Fetch matches for selected stage
  const {
    data: matches,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['matches', 'byStage', selectedStageId, paginationOptions],
    queryFn: () => getMatchesByStageId(selectedStageId!),
    enabled: !!selectedStageId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch matches for stage');
      }
      return data.data;
    }
  });

  // Show table body loading when fetching (for sorting, searching, filtering)
  // but not on initial load
  const tableBodyLoading = isFetching && !isLoading;

  const queryClient = useQueryClient();

  // Create match mutation
  const createMatchMutation = useMutation({
    mutationFn: ({ matchData, participantTeamIds }: { matchData: MatchInsert; participantTeamIds?: string[] }) => {
      if (participantTeamIds && participantTeamIds.length > 0) {
        return createMatchWithParticipants(matchData, participantTeamIds);
      } else {
        return createMatch(matchData);
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Match created successfully');
        if (selectedStageId) {
          queryClient.invalidateQueries({ queryKey: matchKeys.byStage(selectedStageId) });
        }
      } else {
        toast.error(result.error || 'Failed to create match');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Update match mutation
  const updateMatchMutation = useMutation({
    mutationFn: (data: MatchUpdate) => updateMatchById(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Match updated successfully');
        if (selectedStageId) {
          queryClient.invalidateQueries({ queryKey: matchKeys.byStage(selectedStageId) });
        }
      } else {
        toast.error(result.error || 'Failed to update match');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Delete match mutation
  const deleteMatchMutation = useMutation({
    mutationFn: deleteMatchById,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Match deleted successfully');
        if (selectedStageId) {
          queryClient.invalidateQueries({ queryKey: matchKeys.byStage(selectedStageId) });
        }
      } else {
        toast.error(result.error || 'Failed to delete match');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Handle search with debouncing
  const handleSearch = (search: string) => {
    setSearch(search);
  };

  // Handle filters
  const handleFilters = (filters: TableFilters) => {
    setFilters(filters);
  };

  // Handle sorting
  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSortBy(sortBy, sortOrder);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
  };

  return {
    // Data
    matches: matches || [],
    totalCount: matches?.length || 0,
    pageCount: Math.ceil((matches?.length || 0) / tableState.pageSize),
    currentPage: tableState.page,
    pageSize: tableState.pageSize,
    loading: isLoading,
    tableBodyLoading,
    error: error?.message || null,

    // Mutations
    createMatch: (matchData: MatchInsert, participantTeamIds?: string[]) => 
      createMatchMutation.mutate({ matchData, participantTeamIds }),
    updateMatch: updateMatchMutation.mutate,
    deleteMatch: deleteMatchMutation.mutate,

    // Loading states
    isCreating: createMatchMutation.isPending,
    isUpdating: updateMatchMutation.isPending,
    isDeleting: deleteMatchMutation.isPending,

    // Actions
    refetch,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    onSortChange: handleSort,
    onSearchChange: handleSearch,
    onFiltersChange: handleFilters,
    resetFilters
  };
}
