import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedSchools,
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchoolById,
  deleteSchoolById
} from '@/actions/schools';

import { SchoolInsert, SchoolUpdate, SchoolPaginationOptions, School } from '@/lib/types/schools';

import { ServiceResponse, FilterValue, PaginationOptions } from '@/lib/types/base';
import { useTable } from './use-table';
import { TableFilters } from '@/lib/types/table';
import { toast } from 'sonner';

export const schoolKeys = {
  all: ['schools'] as const,
  paginated: (options: SchoolPaginationOptions) =>
    [...schoolKeys.all, 'paginated', options] as const,
  details: (id: string) => [...schoolKeys.all, id] as const
};

export function usePaginatedSchools(
  options: SchoolPaginationOptions,
  queryOptions?: UseQueryOptions<
    {
      success: boolean;
      error?: string;
      data?: { data: School[]; totalCount: number; pageCount: number; currentPage: number };
    },
    Error,
    { data: School[]; totalCount: number; pageCount: number; currentPage: number }
  >
) {
  return useQuery({
    queryKey: schoolKeys.paginated(options),
    queryFn: () => getPaginatedSchools(options),
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch paginated schools.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllSchools(
  queryOptions?: UseQueryOptions<ServiceResponse<School[]>, Error, School[]>
) {
  return useQuery({
    queryKey: schoolKeys.all,
    queryFn: getAllSchools,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch all schools.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSchoolById(
  id: string,
  queryOptions?: UseQueryOptions<ServiceResponse<School>, Error, School>
) {
  return useQuery({
    queryKey: schoolKeys.details(id),
    queryFn: () => getSchoolById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `School with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useCreateSchool(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SchoolInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSchool,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: schoolKeys.all });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create school:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateSchool(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SchoolUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSchoolById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: schoolKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: schoolKeys.details(variables.id) });
        }
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update school:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteSchool(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSchoolById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: schoolKeys.all });
        queryClient.invalidateQueries({ queryKey: schoolKeys.details(id) });
        // CRITICAL: Invalidate related entities that depend on this school
        queryClient.invalidateQueries({ queryKey: ['schools-teams'] });
        queryClient.invalidateQueries({ queryKey: ['match_participants'] });
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete school:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}

// Table-specific hook that extends the base school functionality
export function useSchoolsTable() {
  const {
    tableState,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters,
    resetFilters,
    paginationOptions
  } = useTable<School>({
    initialPage: 1,
    initialPageSize: 10,
    initialSortBy: 'name',
    initialSortOrder: 'asc',
    pageSizeOptions: [5, 10, 25, 50, 100]
  });

  // Fetch paginated schools
  const {
    data: schoolsData,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['schools', 'paginated', paginationOptions],
    queryFn: () =>
      getPaginatedSchools(paginationOptions as PaginationOptions<Record<string, FilterValue>>),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch schools');
      }
      return data.data;
    }
  });

  // Show table body loading when fetching (for sorting, searching, filtering)
  // but not on initial load
  const tableBodyLoading = isFetching && !isLoading;

  const queryClient = useQueryClient();

  // Create school mutation
  const createSchoolMutation = useMutation({
    mutationFn: createSchool,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('School created successfully');
        queryClient.invalidateQueries({ queryKey: ['schools'] });
      } else {
        toast.error(result.error || 'Failed to create school');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Update school mutation
  const updateSchoolMutation = useMutation({
    mutationFn: (data: SchoolUpdate) => updateSchoolById(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('School updated successfully');
        queryClient.invalidateQueries({ queryKey: ['schools'] });
      } else {
        toast.error(result.error || 'Failed to update school');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Delete school mutation
  const deleteSchoolMutation = useMutation({
    mutationFn: deleteSchoolById,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('School deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['schools'] });
      } else {
        toast.error(result.error || 'Failed to delete school');
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

  // Extract data from the response
  const schools = schoolsData?.data || [];
  const totalCount = schoolsData?.totalCount || 0;
  const pageCount = schoolsData?.pageCount || 0;
  const currentPage = tableState.page;
  const pageSize = tableState.pageSize;

  return {
    // Data
    schools,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    loading: isLoading,
    tableBodyLoading,
    error: error?.message || null,

    // Mutations
    createSchool: createSchoolMutation.mutate,
    updateSchool: updateSchoolMutation.mutate,
    deleteSchool: deleteSchoolMutation.mutate,

    // Loading states
    isCreating: createSchoolMutation.isPending,
    isUpdating: updateSchoolMutation.isPending,
    isDeleting: deleteSchoolMutation.isPending,

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
