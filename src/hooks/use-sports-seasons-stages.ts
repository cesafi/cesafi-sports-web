import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedSportsSeasonsStages,
  getAllSportsSeasonsStages,
  getSportsSeasonsStagesBySeason,
  getSportsSeasonsStageById,
  createSportsSeasonsStage,
  updateSportsSeasonsStageById,
  deleteSportsSeasonsStageById
} from '@/actions/sports-seasons-stages';

import {
  SportsSeasonsStageInsert,
  SportsSeasonsStageUpdate,
  SportsSeasonsStagesPaginationOptions,
  SportsSeasonsStage,
  SportsSeasonsStageWithDetails
} from '@/lib/types/sports-seasons-stages';
import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';
import { useTable } from './use-table';
import { TableFilters } from '@/lib/types/table';
import { toast } from 'sonner';
import { useSeason } from '@/components/contexts/season-provider';

export const sportsSeasonsStageKeys = {
  all: ['sports-seasons-stages'] as const,
  paginated: (options: SportsSeasonsStagesPaginationOptions) =>
    [...sportsSeasonsStageKeys.all, 'paginated', options] as const,
  details: (id: number) => [...sportsSeasonsStageKeys.all, id] as const
};

export function usePaginatedSportsSeasonsStages(
  options: SportsSeasonsStagesPaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<SportsSeasonsStage>>,
    Error,
    PaginatedResponse<SportsSeasonsStage>
  >
) {
  return useQuery({
    queryKey: sportsSeasonsStageKeys.paginated(options),
    queryFn: () => getPaginatedSportsSeasonsStages(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated sports seasons stages.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllSportsSeasonsStages(
  queryOptions?: UseQueryOptions<ServiceResponse<SportsSeasonsStageWithDetails[]>, Error, SportsSeasonsStageWithDetails[]>
) {
  const { currentSeason } = useSeason();
  
  return useQuery({
    queryKey: [...sportsSeasonsStageKeys.all, 'bySeason', currentSeason?.id],
    queryFn: () => currentSeason ? getSportsSeasonsStagesBySeason(currentSeason.id) : getAllSportsSeasonsStages(),
    enabled: !!currentSeason,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch all sports seasons stages.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSportsSeasonsStageById(
  id: number,
  queryOptions?: UseQueryOptions<ServiceResponse<SportsSeasonsStage>, Error, SportsSeasonsStage>
) {
  return useQuery({
    queryKey: sportsSeasonsStageKeys.details(id),
    queryFn: () => getSportsSeasonsStageById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Sports seasons stage with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useCreateSportsSeasonsStage(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SportsSeasonsStageInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSportsSeasonsStage,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportsSeasonsStageKeys.all });
        // Also invalidate related sports and seasons queries since this is a bridge entity
        queryClient.invalidateQueries({ queryKey: ['sports'] });
        queryClient.invalidateQueries({ queryKey: ['seasons'] });
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create sports seasons stage:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateSportsSeasonsStage(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SportsSeasonsStageUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSportsSeasonsStageById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportsSeasonsStageKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: sportsSeasonsStageKeys.details(variables.id) });
        }
        // Also invalidate related sports and seasons queries since this is a bridge entity
        queryClient.invalidateQueries({ queryKey: ['sports'] });
        queryClient.invalidateQueries({ queryKey: ['seasons'] });
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update sports seasons stage:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteSportsSeasonsStage(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, number>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSportsSeasonsStageById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportsSeasonsStageKeys.all });
        queryClient.invalidateQueries({ queryKey: sportsSeasonsStageKeys.details(id) });
        // Also invalidate related sports and seasons queries since this is a bridge entity
        queryClient.invalidateQueries({ queryKey: ['sports'] });
        queryClient.invalidateQueries({ queryKey: ['seasons'] });
      }
      (mutationOptions?.onSuccess as any)?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete sports seasons stage:', error);
      (mutationOptions?.onError as any)?.(error, id, context);
    },
    ...mutationOptions
  });
}

// Table-specific hook that extends the base sports seasons stage functionality
export function useSportsSeasonsStagesTable() {
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
  } = useTable<SportsSeasonsStage>({
    initialPage: 1,
    initialPageSize: 10,
    initialSortBy: 'created_at',
    initialSortOrder: 'desc',
    pageSizeOptions: [5, 10, 25, 50, 100]
  });

  // Fetch data filtered by current season
  const {
    data: stagesData,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['sports-seasons-stages', 'bySeason', currentSeason?.id, paginationOptions],
    queryFn: () => currentSeason ? getSportsSeasonsStagesBySeason(currentSeason.id) : Promise.resolve({ success: false, error: 'No season selected' } as ServiceResponse<SportsSeasonsStageWithDetails[]>),
    enabled: !!currentSeason,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch sports seasons stages');
      }
      return data.data;
    }
  });

  // Show table body loading when fetching (for sorting, searching, filtering)
  // but not on initial load
  const tableBodyLoading = isFetching && !isLoading;

  const queryClient = useQueryClient();

  // Create stage mutation
  const createStageMutation = useMutation({
    mutationFn: createSportsSeasonsStage,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('League stage created successfully');
        queryClient.invalidateQueries({ queryKey: ['sports-seasons-stages'] });
      } else {
        toast.error(result.error || 'Failed to create league stage');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Update stage mutation
  const updateStageMutation = useMutation({
    mutationFn: (data: SportsSeasonsStageUpdate) => updateSportsSeasonsStageById(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('League stage updated successfully');
        queryClient.invalidateQueries({ queryKey: ['sports-seasons-stages'] });
      } else {
        toast.error(result.error || 'Failed to update league stage');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Delete stage mutation
  const deleteStageMutation = useMutation({
    mutationFn: deleteSportsSeasonsStageById,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('League stage deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['sports-seasons-stages'] });
      } else {
        toast.error(result.error || 'Failed to delete league stage');
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
    stages: stagesData || [],
    totalCount: 0, // This hook doesn't provide pagination info
    pageCount: 0, // This hook doesn't provide pagination info
    currentPage: tableState.page,
    pageSize: tableState.pageSize,
    loading: isLoading,
    tableBodyLoading,
    error: error?.message || null,

    // Mutations
    createStage: createStageMutation.mutate,
    updateStage: updateStageMutation.mutate,
    deleteStage: deleteStageMutation.mutate,

    // Loading states
    isCreating: createStageMutation.isPending,
    isUpdating: updateStageMutation.isPending,
    isDeleting: deleteStageMutation.isPending,

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
