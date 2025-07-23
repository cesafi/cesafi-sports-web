import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedMatchParticipants,
  getAllMatchParticipants,
  getMatchParticipantById,
  createMatchParticipant,
  updateMatchParticipantById,
  deleteMatchParticipantById
} from '@/actions/match-participants';

import {
  MatchParticipantInsert,
  MatchParticipantUpdate,
  MatchParticipantPaginationOptions,
  MatchParticipant
} from '@/lib/types/match-participants';

import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';

import { matchKeys } from './use-matches';
import { schoolsTeamKeys } from './use-schools-teams';

export const matchParticipantKeys = {
  all: ['match-participants'] as const,
  paginated: (options: MatchParticipantPaginationOptions) =>
    [...matchParticipantKeys.all, 'paginated', options] as const,
  details: (id: string) => [...matchParticipantKeys.all, id] as const
};

export function usePaginatedMatchParticipants(
  options: MatchParticipantPaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<MatchParticipant>>,
    Error,
    PaginatedResponse<MatchParticipant>
  >
) {
  return useQuery({
    queryKey: matchParticipantKeys.paginated(options),
    queryFn: () => getPaginatedMatchParticipants(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated match participants.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllMatchParticipants(
  queryOptions?: UseQueryOptions<ServiceResponse<MatchParticipant[]>, Error, MatchParticipant[]>
) {
  return useQuery({
    queryKey: matchParticipantKeys.all,
    queryFn: getAllMatchParticipants,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch all match participants.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useMatchParticipantById(
  id: string,
  queryOptions?: UseQueryOptions<ServiceResponse<MatchParticipant>, Error, MatchParticipant>
) {
  return useQuery({
    queryKey: matchParticipantKeys.details(id),
    queryFn: () => getMatchParticipantById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Match participant with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useCreateMatchParticipant(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, MatchParticipantInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMatchParticipant,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        // Invalidate match participants queries
        queryClient.invalidateQueries({ queryKey: matchParticipantKeys.all });

        // Invalidate related entity queries since participants are relationships
        queryClient.invalidateQueries({ queryKey: matchKeys.all });
        queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create match participant:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateMatchParticipant(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, MatchParticipantUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMatchParticipantById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        // Invalidate match participants queries
        queryClient.invalidateQueries({ queryKey: matchParticipantKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: matchParticipantKeys.details(variables.id) });
        }

        // Invalidate related entity queries since participants are relationships
        queryClient.invalidateQueries({ queryKey: matchKeys.all });
        queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update match participant:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteMatchParticipant(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMatchParticipantById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        // Invalidate match participants queries
        queryClient.invalidateQueries({ queryKey: matchParticipantKeys.all });
        queryClient.invalidateQueries({ queryKey: matchParticipantKeys.details(id) });

        // Invalidate related entity queries since participants are relationships
        queryClient.invalidateQueries({ queryKey: matchKeys.all });
        queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });
      }
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete match participant:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}
