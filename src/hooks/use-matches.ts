import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedMatches,
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatchById,
  deleteMatchById
} from '@/actions/matches';

import { MatchInsert, MatchUpdate, MatchPaginationOptions, Match } from '@/lib/types/matches';

import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';

export const matchKeys = {
  all: ['matches'] as const,
  paginated: (options: MatchPaginationOptions) => [...matchKeys.all, 'paginated', options] as const,
  details: (id: string) => [...matchKeys.all, id] as const,
  byStage: (stageId: string) => [...matchKeys.all, 'stage', stageId] as const
};

export function usePaginatedMatches(
  options: MatchPaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<Match>>,
    Error,
    PaginatedResponse<Match>
  >
) {
  return useQuery({
    queryKey: matchKeys.paginated(options),
    queryFn: () => getPaginatedMatches(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated matches.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllMatches(
  queryOptions?: UseQueryOptions<ServiceResponse<Match[]>, Error, Match[]>
) {
  return useQuery({
    queryKey: matchKeys.all,
    queryFn: getAllMatches,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch all matches.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useMatchById(
  id: string,
  queryOptions?: UseQueryOptions<ServiceResponse<Match>, Error, Match>
) {
  return useQuery({
    queryKey: matchKeys.details(id),
    queryFn: () => getMatchById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Match with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useCreateMatch(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, MatchInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMatch,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: matchKeys.all });
        // Invalidate stage-specific queries if sports_seasons_stages_id is provided
        if (variables.sports_seasons_stages_id) {
          queryClient.invalidateQueries({
            queryKey: matchKeys.byStage(variables.sports_seasons_stages_id)
          });
        }
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create match:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateMatch(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, MatchUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMatchById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: matchKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: matchKeys.details(variables.id) });
        }
        // Invalidate stage-specific queries if sports_seasons_stages_id is provided
        if (variables.sports_seasons_stages_id) {
          queryClient.invalidateQueries({
            queryKey: matchKeys.byStage(variables.sports_seasons_stages_id)
          });
        }
        // Also invalidate games and participants that might be related
        queryClient.invalidateQueries({ queryKey: ['games'] });
        queryClient.invalidateQueries({ queryKey: ['match_participants'] });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update match:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteMatch(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMatchById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: matchKeys.all });
        queryClient.invalidateQueries({ queryKey: matchKeys.details(id) });
        // Invalidate related entities
        queryClient.invalidateQueries({ queryKey: ['games'] });
        queryClient.invalidateQueries({ queryKey: ['match_participants'] });
        queryClient.invalidateQueries({ queryKey: ['game_scores'] });
      }
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete match:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}
