import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedSeasons,
  getAllSeasons,
  getSeasonById,
  createSeason,
  updateSeasonById,
  deleteSeasonById
} from '@/actions/seasons';

import { SeasonInsert, SeasonUpdate, SeasonPaginationOptions, Season } from '@/lib/types/seasons';

import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';

export const seasonKeys = {
  all: ['seasons'] as const,
  paginated: (options: SeasonPaginationOptions) =>
    [...seasonKeys.all, 'paginated', options] as const,
  details: (id: string) => [...seasonKeys.all, id] as const
};

export function usePaginatedSeasons(
  options: SeasonPaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<Season>>,
    Error,
    PaginatedResponse<Season>
  >
) {
  return useQuery({
    queryKey: seasonKeys.paginated(options),
    queryFn: () => getPaginatedSeasons(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated seasons.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllSeasons(
  queryOptions?: UseQueryOptions<ServiceResponse<Season[]>, Error, Season[]>
) {
  return useQuery({
    queryKey: seasonKeys.all,
    queryFn: getAllSeasons,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch all seasons.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSeasonById(
  id: string,
  queryOptions?: UseQueryOptions<ServiceResponse<Season>, Error, Season>
) {
  return useQuery({
    queryKey: seasonKeys.details(id),
    queryFn: () => getSeasonById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Season with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useCreateSeason(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SeasonInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSeason,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: seasonKeys.all });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create season:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateSeason(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SeasonUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSeasonById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: seasonKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: seasonKeys.details(variables.id) });
        }
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update season:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteSeason(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSeasonById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: seasonKeys.all });
        queryClient.invalidateQueries({ queryKey: seasonKeys.details(id) });
      }
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete season:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}