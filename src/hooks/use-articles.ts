import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { useEffect, useState, useCallback, useRef } from 'react';

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
    enabled: queryOptions?.enabled ?? true,
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
  mutationOptions?: UseMutationOptions<ServiceResponse<Article>, Error, ArticleInsert>
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
  mutationOptions?: UseMutationOptions<ServiceResponse<Article>, Error, ArticleUpdate>
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

// ============================================================================
// DETAILS HOOKS (for backward compatibility)
// ============================================================================

// Simple alias for useArticleById to match the naming convention used in other detail pages
export const useArticleDetails = useArticleById;

// Auto-save hook for articles
export function useAutoSave(articleId: string, content: string, delay = 30000) {
  // Always call ALL hooks in the same order - no early returns allowed
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const queryClient = useQueryClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>('');

  // Auto-save mutation - always declared
  const autoSaveMutation = useMutation({
    mutationFn: async (data: { id: string; content: string }) => {
      // Parse the content string back to JSON object for database storage
      let contentToSave;
      try {
        contentToSave = JSON.parse(data.content);
      } catch {
        // If parsing fails, use the string as is
        contentToSave = data.content;
      }
      
      return updateArticleById({
        id: data.id,
        content: contentToSave,
        status: 'draft', // Always save as draft during auto-save
        updated_at: new Date().toISOString()
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        
        // Clear browser storage after successful save
        localStorage.removeItem(`article-draft-${articleId}`);
        
        // Invalidate queries to update UI
        queryClient.invalidateQueries({ queryKey: articleKeys.details(articleId) });
        queryClient.invalidateQueries({ queryKey: articleKeys.all });
      } else {
        // Fallback to browser storage if server save fails
        localStorage.setItem(`article-draft-${articleId}`, content);
        console.warn('Auto-save failed, saved to browser storage:', result.error);
      }
    },
    onError: (error) => {
      // Fallback to browser storage on error
      localStorage.setItem(`article-draft-${articleId}`, content);
      console.error('Auto-save error, saved to browser storage:', error);
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });

  // Auto-save function
  const performAutoSave = useCallback(async () => {
    if (!articleId || !content || content.length === 0 || content === lastContentRef.current) {
      return;
    }

    setIsSaving(true);
    lastContentRef.current = content;
    
    try {
      await autoSaveMutation.mutateAsync({ id: articleId, content });
    } catch {
      // Error handling is done in the mutation
    }
  }, [articleId, content, autoSaveMutation]);

  // Set up auto-save timer
  useEffect(() => {
    if (!articleId || !content || content.length === 0) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set hasUnsavedChanges if content is different from last saved
    if (content !== lastContentRef.current) {
      setHasUnsavedChanges(true);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [articleId, content, delay, performAutoSave]);

  // Recover draft on mount
  useEffect(() => {
    if (!articleId) return;
    
    const savedDraft = localStorage.getItem(`article-draft-${articleId}`);
    if (savedDraft && savedDraft !== content) {
      // Notify parent component about recovered draft
      console.log('Recovered unsaved draft for article:', articleId);
    }
  }, [articleId, content]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (!articleId) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performAutoSave();
  }, [articleId, performAutoSave]);

  // Clear draft function
  const clearDraft = useCallback(() => {
    if (!articleId) return;
    
    localStorage.removeItem(`article-draft-${articleId}`);
    setHasUnsavedChanges(false);
  }, [articleId]);

  // Return appropriate values based on whether articleId exists
  if (!articleId) {
    return {
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      saveNow: () => {},
      clearDraft: () => {},
      autoSaveError: null
    };
  }

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveNow,
    clearDraft,
    autoSaveError: autoSaveMutation.error
  };
}
