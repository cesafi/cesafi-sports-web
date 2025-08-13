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

import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';

export const articleKeys = {
  all: ['articles'] as const,
  paginated: (options: ArticlePaginationOptions) =>
    [...articleKeys.all, 'paginated', options] as const,
  details: (id: string) => [...articleKeys.all, id] as const
};

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
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch all articles.');
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
      if (!data.success) {
        throw new Error(data.error || `Article with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

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
