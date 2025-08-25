import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaginatedSchools, createSchool, updateSchoolById, deleteSchoolById } from '@/actions/schools';
import { useTable } from './use-table';
import { School } from '@/lib/types/schools';
import { SchoolUpdate } from '@/lib/types/schools';
import { toast } from 'sonner';
import { TableFilters } from '@/lib/types/table';
import { FilterValue, PaginationOptions } from '@/lib/types/base';

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
    initialSortBy: 'created_at',
    initialSortOrder: 'desc',
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
    queryFn: () => getPaginatedSchools(paginationOptions as PaginationOptions<Record<string, FilterValue>>),
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
