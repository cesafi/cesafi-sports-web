import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getPaginatedGameScores,
  getAllGameScores,
  getGameScoreById,
  getGameScoresByGameId,
  getGameScoresByParticipantId,
  createGameScore,
  updateGameScoreById,
  deleteGameScoreById,
  getParticipantMatchAggregate,
  getGameScoresWithDetails
} from '@/actions/game-scores';

import {
  GameScoreInsert,
  GameScoreUpdate,
  GameScorePaginationOptions,
  GameScore,
  GameScoreDetailedView
} from '@/lib/types/game-scores';

import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';

import { gameKeys } from './use-games';
import { matchParticipantKeys } from './use-match-participants';
import { matchKeys } from './use-matches';

export const gameScoreKeys = {
  all: ['game-scores'] as const,
  paginated: (options: GameScorePaginationOptions) =>
    [...gameScoreKeys.all, 'paginated', options] as const,
  details: (id: string) => [...gameScoreKeys.all, id] as const,
  byGame: (gameId: string) => [...gameScoreKeys.all, 'game', gameId] as const,
  byParticipant: (participantId: string) =>
    [...gameScoreKeys.all, 'participant', participantId] as const,
  participantAggregate: (participantId: string) =>
    [...gameScoreKeys.all, 'aggregate', participantId] as const,
  withDetails: (gameId: string) => [...gameScoreKeys.all, 'details', gameId] as const
};

export function usePaginatedGameScores(
  options: GameScorePaginationOptions,
  queryOptions?: UseQueryOptions<
    ServiceResponse<PaginatedResponse<GameScore>>,
    Error,
    PaginatedResponse<GameScore>
  >
) {
  return useQuery({
    queryKey: gameScoreKeys.paginated(options),
    queryFn: () => getPaginatedGameScores(options),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch paginated game scores.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useAllGameScores(
  queryOptions?: UseQueryOptions<ServiceResponse<GameScore[]>, Error, GameScore[]>
) {
  return useQuery({
    queryKey: gameScoreKeys.all,
    queryFn: getAllGameScores,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch all game scores.');
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useGameScoreById(
  id: string,
  queryOptions?: UseQueryOptions<ServiceResponse<GameScore>, Error, GameScore>
) {
  return useQuery({
    queryKey: gameScoreKeys.details(id),
    queryFn: () => getGameScoreById(id),
    enabled: !!id,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Game score with ID ${id} not found.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useGameScoresByGameId(
  gameId: string,
  queryOptions?: UseQueryOptions<ServiceResponse<GameScore[]>, Error, GameScore[]>
) {
  return useQuery({
    queryKey: gameScoreKeys.byGame(gameId),
    queryFn: () => getGameScoresByGameId(gameId),
    enabled: !!gameId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Failed to fetch game scores for game ${gameId}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useGameScoresByParticipantId(
  participantId: string,
  queryOptions?: UseQueryOptions<ServiceResponse<GameScore[]>, Error, GameScore[]>
) {
  return useQuery({
    queryKey: gameScoreKeys.byParticipant(participantId),
    queryFn: () => getGameScoresByParticipantId(participantId),
    enabled: !!participantId,
    select: (data) => {
      if (!data.success) {
        throw new Error(
          data.error || `Failed to fetch game scores for participant ${participantId}.`
        );
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useParticipantMatchAggregate(
  participantId: string,
  queryOptions?: UseQueryOptions<
    ServiceResponse<{
      totalScore: number;
      averageScore: number;
      gameCount: number;
      highestScore: number;
      lowestScore: number;
    }>,
    Error,
    {
      totalScore: number;
      averageScore: number;
      gameCount: number;
      highestScore: number;
      lowestScore: number;
    }
  >
) {
  return useQuery({
    queryKey: gameScoreKeys.participantAggregate(participantId),
    queryFn: () => getParticipantMatchAggregate(participantId),
    enabled: !!participantId,
    select: (data) => {
      if (!data.success) {
        throw new Error(
          data.error || `Failed to fetch aggregate for participant ${participantId}.`
        );
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useGameScoresWithDetails(
  gameId: string,
  queryOptions?: UseQueryOptions<
    ServiceResponse<GameScoreDetailedView[]>,
    Error,
    GameScoreDetailedView[]
  >
) {
  return useQuery({
    queryKey: gameScoreKeys.withDetails(gameId),

    queryFn: () => getGameScoresWithDetails(gameId),
    enabled: !!gameId,

    select: (response) => {
      if (!response.success) {
        throw new Error(`Failed to fetch detailed game scores for game ${gameId}`);
      }
      return response.data;
    },
    ...queryOptions
  });
}

export function useCreateGameScore(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, GameScoreInsert>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGameScore,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: gameScoreKeys.all });

        if (variables.games_id) {
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.byGame(variables.games_id)
          });
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.withDetails(variables.games_id)
          });
          queryClient.invalidateQueries({ queryKey: gameKeys.all });
          queryClient.invalidateQueries({
            queryKey: gameKeys.details(variables.games_id)
          });
        }

        if (variables.match_participants_id) {
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.byParticipant(variables.match_participants_id)
          });
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.participantAggregate(variables.match_participants_id)
          });
          queryClient.invalidateQueries({ queryKey: matchParticipantKeys.all });
          queryClient.invalidateQueries({
            queryKey: matchParticipantKeys.details(variables.match_participants_id)
          });
        }

        queryClient.invalidateQueries({ queryKey: matchKeys.all });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to create game score:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useUpdateGameScore(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, GameScoreUpdate>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGameScoreById,
    onSuccess: (result, variables, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: gameScoreKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: gameScoreKeys.details(variables.id) });
        }

        if (variables.games_id) {
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.byGame(variables.games_id)
          });
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.withDetails(variables.games_id)
          });
          queryClient.invalidateQueries({ queryKey: gameKeys.all });
          queryClient.invalidateQueries({
            queryKey: gameKeys.details(variables.games_id)
          });
        }

        if (variables.match_participants_id) {
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.byParticipant(variables.match_participants_id)
          });
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.participantAggregate(variables.match_participants_id)
          });
          queryClient.invalidateQueries({ queryKey: matchParticipantKeys.all });
          queryClient.invalidateQueries({
            queryKey: matchParticipantKeys.details(variables.match_participants_id)
          });
        }

        queryClient.invalidateQueries({ queryKey: matchKeys.all });
      }
      mutationOptions?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Failed to update game score:', error);
      mutationOptions?.onError?.(error, variables, context);
    },
    ...mutationOptions
  });
}

export function useDeleteGameScore(
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGameScoreById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: gameScoreKeys.all });
        queryClient.invalidateQueries({ queryKey: gameScoreKeys.details(id) });

        queryClient.invalidateQueries({ queryKey: gameKeys.all });
        queryClient.invalidateQueries({ queryKey: matchParticipantKeys.all });
        queryClient.invalidateQueries({ queryKey: matchKeys.all });
      }
      mutationOptions?.onSuccess?.(result, id, context);
    },
    onError: (error, id, context) => {
      console.error('Failed to delete game score:', error);
      mutationOptions?.onError?.(error, id, context);
    },
    ...mutationOptions
  });
}
