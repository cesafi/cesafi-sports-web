import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  useInfiniteQuery
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
  deleteMatchById,
  getMatchByIdBasic,
  getScheduleMatches,
  getScheduleMatchesByDate
} from '@/actions/matches';

import { MatchInsert, MatchUpdate, MatchPaginationOptions, Match, MatchWithStageDetails, MatchWithFullDetails } from '@/lib/types/matches';

import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';
import { useTable } from './use-table';
import { TableFilters } from '@/lib/types/table';
import { toast } from 'sonner';
import { useSeason } from '@/components/contexts/season-provider';

export const matchKeys = {
  all: ['matches'] as const,
  paginated: (options: MatchPaginationOptions) => [...matchKeys.all, 'paginated', options] as const,
  details: (id: number) => [...matchKeys.all, id] as const,
  byStage: (stageId: number) => [...matchKeys.all, 'stage', stageId] as const,
  // Schedule keys
  schedule: (options: any) => [...matchKeys.all, 'schedule', options] as const,
  scheduleByDate: (options: any) => [...matchKeys.all, 'scheduleByDate', options] as const,
  // Detail keys (for backward compatibility)
  detailKeys: {
    match: (id: number) => ['match-details', id] as const,
  }
};

// ============================================================================
// BASIC QUERY HOOKS
// ============================================================================

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

export function useMatchById(
  id: number,
  queryOptions?: UseQueryOptions<ServiceResponse<Match>, Error, Match>
) {
  return useQuery({
    queryKey: matchKeys.details(id),
    queryFn: () => getMatchById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Match with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

// ============================================================================
// DETAILS HOOKS (for backward compatibility)
// ============================================================================

export function useMatchDetails(matchId: number) {
  return useQuery({
    queryKey: matchKeys.detailKeys.match(matchId),
    queryFn: async (): Promise<MatchWithFullDetails> => {
      const result: ServiceResponse<MatchWithFullDetails> = await getMatchByIdBasic(matchId);
      if (!result.success) {
        throw new Error(result.error || `Match with ID ${matchId} not found.`);
      }
      return result.data;
    },
    enabled: !!matchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

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

// ============================================================================
// TABLE HOOKS
// ============================================================================

// Table-specific hook for matches management
export function useMatchesTable(selectedStageId: number | null) {
  const { currentSeason } = useSeason();
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

  // Fetch matches for selected stage and current season
  const {
    data: matches,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['matches', 'byStageAndSeason', selectedStageId, currentSeason?.id, paginationOptions],
    queryFn: async () => {
      if (selectedStageId && currentSeason) {
        // First get matches by stage, then filter by season
        const result = await getMatchesByStageId(selectedStageId);
        if (result.success && result.data) {
          // Filter matches by current season
          const filteredMatches = result.data.filter(match => 
            match.sports_seasons_stages?.season_id === currentSeason?.id
          );
          return { success: true, data: filteredMatches };
        }
        return result;
      }
      return { success: false, error: 'Stage and season are required' };
    },
    enabled: !!selectedStageId && !!currentSeason,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch matches for stage and season');
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

// ============================================================================
// SCHEDULE HOOKS
// ============================================================================

export function useScheduleMatches(
  options: {
    cursor?: string;
    limit: number;
    direction: 'future' | 'past';
    filters?: {
      season_id?: number;
      sport_id?: number;
      sport_category_id?: number;
      stage_id?: number;
      status?: string;
      date_from?: string;
      date_to?: string;
      search?: string;
    };
  },
  queryOptions?: UseQueryOptions<
    ServiceResponse<{
      matches: any[];
      nextCursor?: string;
      prevCursor?: string;
      hasMore: boolean;
      totalCount: number;
    }>,
    Error,
    {
      matches: any[];
      nextCursor?: string;
      prevCursor?: string;
      hasMore: boolean;
      totalCount: number;
    }
  >
) {
  return useQuery({
    queryKey: matchKeys.schedule(options),
    queryFn: () => getScheduleMatches(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch schedule matches.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useScheduleMatchesByDate(
  options: {
    season_id?: number;
    sport_id?: number;
    sport_category_id?: number;
    stage_id?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  },
  queryOptions?: UseQueryOptions<
    ServiceResponse<Record<string, any[]>>,
    Error,
    Record<string, any[]>
  >
) {
  return useQuery({
    queryKey: matchKeys.scheduleByDate(options),
    queryFn: () => getScheduleMatchesByDate(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch schedule matches by date.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

// ============================================================================
// INFINITE QUERY HOOKS FOR SCHEDULE
// ============================================================================

export function useInfiniteScheduleMatches(
  options: {
    limit: number;
    direction: 'future' | 'past';
    filters?: {
      season_id?: number;
      sport_id?: number;
      sport_category_id?: number;
      stage_id?: number;
      status?: string;
      date_from?: string;
      date_to?: string;
      search?: string;
    };
  },
  queryOptions?: any
) {
  return useInfiniteQuery({
    queryKey: matchKeys.schedule(options),
    queryFn: ({ pageParam }) => getScheduleMatches({
      ...options,
      cursor: pageParam as string | undefined
    }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.success && lastPage.data) {
        return lastPage.data.nextCursor;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.success && firstPage.data) {
        return firstPage.data.prevCursor;
      }
      return undefined;
    },
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      matches: data.pages.flatMap(page => page.success ? page.data.matches : []),
      hasNextPage: data.pages[data.pages.length - 1]?.success ? data.pages[data.pages.length - 1].data.hasMore : false,
      hasPreviousPage: data.pages[0]?.success ? data.pages[0].data.hasMore : false,
      totalCount: data.pages[0]?.success ? data.pages[0].data.totalCount : 0
    }),
    ...queryOptions
  });
}
