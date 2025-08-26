import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedArticles,
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticleById,
  deleteArticleById
} from '@/actions/articles';

import {
  ArticleInsert,
  ArticleUpdate,
  ArticlePaginationOptions,
  Article
} from '@/lib/types/articles';

import { PaginatedResponse, ServiceResponse, FilterValue, PaginationOptions } from '@/lib/types/base';
import { useTable } from './use-table';
import { TableFilters } from '@/lib/types/table';
import { toast } from 'sonner';

// Query keys for caching
export const articleKeys = {
  all: ['articles'] as const,
  paginated: (options: ArticlePaginationOptions) =>
    [...articleKeys.all, 'paginated', options] as const,
  details: (id: string) => [...articleKeys.all, id] as const
};

// Basic article operations (for non-table use cases)
export function usePaginatedArticles(
  options: ArticlePaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<Article>>,
    Error,
    PaginatedResponse<Article>
  >
) {
  return useQuery({
    queryKey: articleKeys.paginated(options),
    queryFn: () => getPaginatedArticles(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated articles.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllArticles(
  queryOptions?: UseQueryOptions<ServiceResponse<Article[]>, Error, Article[]>
) {
  return useQuery({
    queryKey: articleKeys.all,
    queryFn: getAllArticles,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : 'Failed to fetch all articles.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useArticleById(
  id: string,
  queryOptions?: UseQueryOptions<ServiceResponse<Article>, Error, Article>
) {
  return useQuery({
    queryKey: articleKeys.details(id),
    queryFn: () => getArticleById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success || !data.data) {
        throw new Error(data.success === false ? data.error : `Article with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

// Mutation hooks
export function useCreateArticle(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, ArticleInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createArticle,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: articleKeys.all });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create article:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateArticle(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, ArticleUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateArticleById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: articleKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: articleKeys.details(variables.id) });
        }
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update article:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteArticle(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteArticleById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: articleKeys.all });
        queryClient.invalidateQueries({ queryKey: articleKeys.details(id) });
      }
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete article:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}

// Table-specific hook that extends the base article functionality
export function useArticlesTable() {
  const {
    tableState,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters,
    resetFilters,
    paginationOptions
  } = useTable<Article>({
    initialPage: 1,
    initialPageSize: 10,
    initialSortBy: 'created_at',
    initialSortOrder: 'desc',
    pageSizeOptions: [5, 10, 25, 50, 100]
  });

  // Fetch paginated data
  const {
    data: articleData,
    isLoading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['articles', 'paginated', paginationOptions],
    queryFn: () => getPaginatedArticles(paginationOptions as PaginationOptions<Record<string, FilterValue>>),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch articles');
      }
      return data.data;
    }
  });

  // Show table body loading when fetching (for sorting, searching, filtering)
  // but not on initial load
  const tableBodyLoading = isFetching && !isLoading;

  const queryClient = useQueryClient();

  // Create article mutation
  const createArticleMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Article created successfully');
        queryClient.invalidateQueries({ queryKey: ['articles'] });
      } else {
        toast.error(result.error || 'Failed to create article');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Update article mutation
  const updateArticleMutation = useMutation({
    mutationFn: (data: ArticleUpdate) => updateArticleById(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Article updated successfully');
        queryClient.invalidateQueries({ queryKey: ['articles'] });
      } else {
        toast.error(result.error || 'Failed to update article');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: deleteArticleById,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Article deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['articles'] });
      } else {
        toast.error(result.error || 'Failed to delete article');
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
    articles: articleData?.data || [],
    totalCount: articleData?.totalCount || 0,
    pageCount: articleData?.pageCount || 0,
    currentPage: tableState.page,
    pageSize: tableState.pageSize,
    loading: isLoading,
    tableBodyLoading,
    error: error?.message || null,

    // Mutations
    createArticle: createArticleMutation.mutate,
    updateArticle: updateArticleMutation.mutate,
    deleteArticle: deleteArticleMutation.mutate,

    // Loading states
    isCreating: createArticleMutation.isPending,
    isUpdating: updateArticleMutation.isPending,
    isDeleting: deleteArticleMutation.isPending,

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
