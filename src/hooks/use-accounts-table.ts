import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaginatedAccounts, createAccountAction, updateAccountAction, updateAccountRoleAction, deleteAccountAction } from '@/actions/accounts';
import { useTable } from './use-table';
import { AccountData } from '@/services/accounts';
import { UpdateAccountFormData } from '@/lib/validations/accounts';
import { toast } from 'sonner';
import { TableFilters } from '@/lib/types/table';

export function useAccountsTable() {
  const {
    tableState,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters,
    resetFilters,
    paginationOptions
  } = useTable<AccountData>({
    initialPage: 1,
    initialPageSize: 5,
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
    pageSizeOptions: [5, 10, 25, 50, 100]
  });

  // Fetch paginated accounts
  const {
    data: accountsData,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['accounts', 'paginated', paginationOptions],
    queryFn: () => getPaginatedAccounts(paginationOptions),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch accounts');
      }
      return data.data;
    }
  });

  // Show table body loading when fetching (for sorting, searching, filtering)
  // but not on initial load
  const tableBodyLoading = isFetching && !isLoading;

  const queryClient = useQueryClient();

  // Create account mutation
  const createAccount = useMutation({
    mutationFn: createAccountAction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Account created successfully');
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      } else {
        toast.error(result.error || 'Failed to create account');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Update account mutation
  const updateAccount = useMutation({
    mutationFn: ({ userId, accountData }: { userId: string; accountData: UpdateAccountFormData }) =>
      updateAccountAction(userId, accountData),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Account updated successfully');
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      } else {
        toast.error(result.error || 'Failed to update account');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Update account role mutation
  const updateAccountRole = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: string }) =>
      updateAccountRoleAction(userId, newRole),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Account role updated successfully');
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      } else {
        toast.error(result.error || 'Failed to update account role');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Delete account mutation
  const deleteAccount = useMutation({
    mutationFn: deleteAccountAction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Account deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      } else {
        toast.error(result.error || 'Failed to delete account');
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
    // Table state
    tableState,
    
    // Data
    accounts: accountsData?.data || [],
    totalCount: accountsData?.totalCount || 0,
    pageCount: accountsData?.pageCount || 0,
    currentPage: tableState.page,
    pageSize: tableState.pageSize,
    loading: isLoading,
    tableBodyLoading,
    error: error?.message || null,
    
    // Actions
    createAccount: createAccount.mutate,
    updateAccount: updateAccount.mutate,
    updateAccountRole: updateAccountRole.mutate,
    deleteAccount: deleteAccount.mutate,
    
    // Mutations state
    isCreating: createAccount.isPending,
    isUpdating: updateAccount.isPending,
    isDeleting: deleteAccount.isPending,
    
    // Event handlers
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    onSortChange: handleSort,
    onSearchChange: handleSearch,
    onFiltersChange: handleFilters,
    
    // Utilities
    resetFilters,
    paginationOptions,
    refetch
  };
}
