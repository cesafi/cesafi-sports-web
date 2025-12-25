import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedDepartments,
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartmentById,
  deleteDepartmentById
} from '@/actions/departments';

import {
  DepartmentInsert,
  DepartmentUpdate,
  DepartmentPaginationOptions,
  Department
} from '@/lib/types/departments';

import { PaginatedResponse, ServiceResponse, FilterValue, PaginationOptions } from '@/lib/types/base';
import { useTable } from './use-table';
import { TableFilters } from '@/lib/types/table';
import { toast } from 'sonner';

// Query keys for caching
export const departmentKeys = {
  all: ['departments'] as const,
  paginated: (options: DepartmentPaginationOptions) =>
    [...departmentKeys.all, 'paginated', options] as const,
  details: (id: number) => [...departmentKeys.all, id] as const
};

// Basic department operations (for non-table use cases)
export function usePaginatedDepartments(
  options: DepartmentPaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<Department>>,
    Error,
    PaginatedResponse<Department>
  >
) {
  return useQuery({
    queryKey: departmentKeys.paginated(options),
    queryFn: () => getPaginatedDepartments(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated departments.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllDepartments(
  queryOptions?: UseQueryOptions<ServiceResponse<Department[]>, Error, Department[]>
) {
  return useQuery({
    queryKey: departmentKeys.all,
    queryFn: getAllDepartments,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch all departments.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useDepartmentById(
  id: number,
  queryOptions?: UseQueryOptions<ServiceResponse<Department>, Error, Department>
) {
  return useQuery({
    queryKey: departmentKeys.details(id),
    queryFn: () => getDepartmentById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Department with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

// Mutation hooks
export function useCreateDepartment(
  mutationOptions?: UseMutationOptions<ServiceResponse<Department>, Error, DepartmentInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create department:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateDepartment(
  mutationOptions?: UseMutationOptions<ServiceResponse<Department>, Error, DepartmentUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDepartmentById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: departmentKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: departmentKeys.details(variables.id) });
        }
      }
      (mutationOptions?.onSuccess as any)?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update department:', error);
      (mutationOptions?.onError as any)?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteDepartment(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, number>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartmentById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: departmentKeys.all });
        queryClient.invalidateQueries({ queryKey: departmentKeys.details(id) });
      }
      (mutationOptions?.onSuccess as any)?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete department:', error);
      (mutationOptions?.onError as any)?.(error, id, context);
    },
    ...mutationOptions
  });
}

// Table-specific hook that extends the base department functionality
export function useDepartmentsTable() {
  const {
    tableState,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters,
    resetFilters,
    paginationOptions
  } = useTable<Department>({
    initialPage: 1,
    initialPageSize: 10,
    initialSortBy: 'created_at',
    initialSortOrder: 'desc',
    pageSizeOptions: [5, 10, 25, 50, 100]
  });

  // Fetch paginated data
  const {
    data: departmentData,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['departments', 'paginated', paginationOptions],
    queryFn: () => getPaginatedDepartments(paginationOptions as PaginationOptions<Record<string, FilterValue>>),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch departments');
      }
      return data.data;
    }
  });

  // Show table body loading when fetching (for sorting, searching, filtering)
  // but not on initial load
  const tableBodyLoading = isFetching && !isLoading;

  const queryClient = useQueryClient();

  // Create department mutation
  const createDepartmentMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Department created successfully');
        queryClient.invalidateQueries({ queryKey: ['departments'] });
      } else {
        toast.error(result.error || 'Failed to create department');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Update department mutation
  const updateDepartmentMutation = useMutation({
    mutationFn: (data: DepartmentUpdate) => updateDepartmentById(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Department updated successfully');
        queryClient.invalidateQueries({ queryKey: ['departments'] });
      } else {
        toast.error(result.error || 'Failed to update department');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: deleteDepartmentById,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Department deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['departments'] });
      } else {
        toast.error(result.error || 'Failed to delete department');
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
    departments: departmentData?.data || [],
    totalCount: departmentData?.totalCount || 0,
    pageCount: departmentData?.pageCount || 0,
    currentPage: tableState.page,
    pageSize: tableState.pageSize,
    loading: isLoading,
    tableBodyLoading,
    error: error?.message || null,

    // Mutations
    createDepartment: createDepartmentMutation.mutate,
    updateDepartment: updateDepartmentMutation.mutate,
    deleteDepartment: deleteDepartmentMutation.mutate,

    // Loading states
    isCreating: createDepartmentMutation.isPending,
    isUpdating: updateDepartmentMutation.isPending,
    isDeleting: deleteDepartmentMutation.isPending,

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
