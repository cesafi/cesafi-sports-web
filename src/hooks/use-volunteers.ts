import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedVolunteers,
  getAllVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteerById,
  deleteVolunteerById
} from '@/actions/volunteers';

import { VolunteerInsert, VolunteerUpdate, Volunteer, VolunteersPaginationOptions } from '@/lib/types/volunteers';
import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';
import { useTable } from './use-table';
import { TableFilters } from '@/lib/types/table';
import { toast } from 'sonner';

// Query keys for caching
export const volunteerKeys = {
  all: ['volunteers'] as const,
  paginated: (options: VolunteersPaginationOptions) =>
    [...volunteerKeys.all, 'paginated', options] as const,
  details: (id: string) => [...volunteerKeys.all, id] as const
};

// Basic volunteer operations (for non-table use cases)
export function usePaginatedVolunteers(
  options: VolunteersPaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<Volunteer>>,
    Error,
    PaginatedResponse<Volunteer>
  >
) {
  return useQuery({
    queryKey: volunteerKeys.paginated(options),
    queryFn: () => getPaginatedVolunteers(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated volunteers.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllVolunteers(
  queryOptions?: UseQueryOptions<ServiceResponse<Volunteer[]>, Error, Volunteer[]>
) {
  return useQuery({
    queryKey: volunteerKeys.all,
    queryFn: getAllVolunteers,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch all volunteers.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useVolunteerById(
  id: string,
  queryOptions?: UseQueryOptions<ServiceResponse<Volunteer>, Error, Volunteer>
) {
  return useQuery({
    queryKey: volunteerKeys.details(id),
    queryFn: () => getVolunteerById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Volunteer with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

// Mutation hooks
export function useCreateVolunteer(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, VolunteerInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVolunteer,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: volunteerKeys.all });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create volunteer:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateVolunteer(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, VolunteerUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVolunteerById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: volunteerKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: volunteerKeys.details(variables.id) });
        }
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update volunteer:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteVolunteer(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVolunteerById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: volunteerKeys.all });
        queryClient.invalidateQueries({ queryKey: volunteerKeys.details(id) });
      }
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete volunteer:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}

// Simple table hook for volunteers
export function useVolunteersTable(seasonId?: string) {
  const {
    tableState,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters,
    resetFilters,
    paginationOptions
  } = useTable<Volunteer>({
    initialPage: 1,
    initialPageSize: 10,
    initialSortBy: 'department_id',
    initialSortOrder: 'asc',
    pageSizeOptions: [5, 10, 25, 50, 100]
  });

  // Add season filter to pagination options
  const paginationOptionsWithSeason: VolunteersPaginationOptions = {
    ...paginationOptions,
    filters: {
      ...paginationOptions.filters,
      ...(seasonId && { season_id: parseInt(seasonId) })
    }
  };

  // Fetch paginated data
  const {
    data: volunteerData,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['volunteers', 'paginated', paginationOptionsWithSeason],
    queryFn: () => getPaginatedVolunteers(paginationOptionsWithSeason),
    select: (data: ServiceResponse<PaginatedResponse<Volunteer>>) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch volunteers');
      }
      return data.data;
    }
  });

  // Show table body loading when fetching (for sorting, searching, filtering)
  // but not on initial load
  const tableBodyLoading = isFetching && !isLoading;

  const queryClient = useQueryClient();

  // Create volunteer mutation
  const createVolunteerMutation = useMutation({
    mutationFn: createVolunteer,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Volunteer created successfully');
        queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      } else {
        toast.error(result.error || 'Failed to create volunteer');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Update volunteer mutation
  const updateVolunteerMutation = useMutation({
    mutationFn: (data: VolunteerUpdate) => updateVolunteerById(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Volunteer updated successfully');
        queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      } else {
        toast.error(result.error || 'Failed to update volunteer');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Delete volunteer mutation
  const deleteVolunteerMutation = useMutation({
    mutationFn: deleteVolunteerById,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Volunteer deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      } else {
        toast.error(result.error || 'Failed to delete volunteer');
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
    volunteers: volunteerData?.data || [],
    totalCount: volunteerData?.totalCount || 0,
    pageCount: volunteerData?.pageCount || 0,
    currentPage: tableState.page,
    pageSize: tableState.pageSize,
    loading: isLoading,
    tableBodyLoading,
    error: error?.message || null,

    // Mutations
    createVolunteer: createVolunteerMutation.mutate,
    updateVolunteer: updateVolunteerMutation.mutate,
    deleteVolunteer: deleteVolunteerMutation.mutate,

    // Loading states
    isCreating: createVolunteerMutation.isPending,
    isUpdating: updateVolunteerMutation.isPending,
    isDeleting: deleteVolunteerMutation.isPending,

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

