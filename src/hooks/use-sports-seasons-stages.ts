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
  getSportsSeasonsStageById,
  createSportsSeasonsStage,
  updateSportsSeasonsStageById,
  deleteSportsSeasonsStageById
} from '@/actions/sports-seasons-stages';

import {
  SportsSeasonsStageInsert,
  SportsSeasonsStageUpdate,
  SportsSeasonsStagesPaginationOptions,
  SportsSeasonsStage
} from '@/lib/types/sports-seasons-stages';

import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';

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
  queryOptions?: UseQueryOptions<ServiceResponse<SportsSeasonsStage[]>, Error, SportsSeasonsStage[]>
) {
  return useQuery({
    queryKey: sportsSeasonsStageKeys.all,
    queryFn: getAllSportsSeasonsStages,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch all sports seasons stages.');
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
      if (!data.success) {
        throw new Error(data.error || `Sports seasons stage with ID ${id} not found.`);
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
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create sports seasons stage:', error);
      mutationOptions?.onError?.(error, variables, context);
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
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update sports seasons stage:', error);
      mutationOptions?.onError?.(error, variables, context);
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
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete sports seasons stage:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}
