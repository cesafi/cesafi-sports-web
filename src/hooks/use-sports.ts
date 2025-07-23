import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedSports,
  getAllSports,
  getSportById,
  createSport,
  updateSportById,
  deleteSportById
} from '@/actions/sports';

import { SportInsert, SportUpdate, SportsPaginationOptions, Sport } from '@/lib/types/sports';

import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';

export const sportKeys = {
  all: ['sports'] as const,
  paginated: (options: SportsPaginationOptions) =>
    [...sportKeys.all, 'paginated', options] as const,
  details: (id: string) => [...sportKeys.all, id] as const
};

export function usePaginatedSports(
  options: SportsPaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<Sport>>,
    Error,
    PaginatedResponse<Sport>
  >
) {
  return useQuery({
    queryKey: sportKeys.paginated(options),
    queryFn: () => getPaginatedSports(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated sports.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllSports(
  queryOptions?: UseQueryOptions<ServiceResponse<Sport[]>, Error, Sport[]>
) {
  return useQuery({
    queryKey: sportKeys.all,
    queryFn: getAllSports,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch all sports.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useSportById(
  id: string,
  queryOptions?: UseQueryOptions<ServiceResponse<Sport>, Error, Sport>
) {
  return useQuery({
    queryKey: sportKeys.details(id),
    queryFn: () => getSportById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Sport with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useCreateSport(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SportInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSport,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportKeys.all });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create sport:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateSport(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, SportUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSportById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: sportKeys.details(variables.id) });
        }
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update sport:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteSport(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSportById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: sportKeys.all });
        queryClient.invalidateQueries({ queryKey: sportKeys.details(id) });
      }
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete sport:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}
