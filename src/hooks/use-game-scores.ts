import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getGameScoresByGameId,
  getGameScoresByParticipantId,
  getGameScoresByMatchId,
  createGameScore,
  updateGameScoreById,
  deleteGameScoreById,
  getParticipantMatchAggregate,
  getGameScoresWithDetails
} from '@/actions/game-scores';

import {
  GameScoreInsert,
  GameScoreUpdate,
  GameScore,
  GameScoreDetailedView
} from '@/lib/types/game-scores';

import { ServiceResponse } from '@/lib/types/base';

import { gameKeys } from './use-games';
import { matchParticipantKeys } from './use-match-participants';
import { matchKeys } from './use-matches';

export const gameScoreKeys = {
  all: ['game-scores'] as const,
  details: (id: number) => [...gameScoreKeys.all, id] as const,
  byGame: (gameId: number) => [...gameScoreKeys.all, 'game', gameId] as const,
  byParticipant: (participantId: number) =>
    [...gameScoreKeys.all, 'participant', participantId] as const,
  byMatch: (matchId: number) => [...gameScoreKeys.all, 'match', matchId] as const,
  participantAggregate: (matchId: number, participantId: number) =>
    [...gameScoreKeys.all, 'aggregate', matchId, participantId] as const,
  withDetails: (gameId: number) => [...gameScoreKeys.all, 'details', gameId] as const
};

export function useGameScoresByGameId(
  gameId: number,
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
  participantId: number,
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

export function useGameScoresByMatchId(
  matchId: number,
  queryOptions?: UseQueryOptions<ServiceResponse<GameScore[]>, Error, GameScore[]>
) {
  return useQuery({
    queryKey: gameScoreKeys.byMatch(matchId),
    queryFn: () => getGameScoresByMatchId(matchId),
    enabled: !!matchId,
    select: (data) => {
      if (!data.success) {
        throw new Error(
          data.error || `Failed to fetch game scores for match ${matchId}.`
        );
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useParticipantMatchAggregate(
  matchId: number,
  participantId: number,
  queryOptions?: UseQueryOptions<
    ServiceResponse<{
      totalScore: number;
      gamesPlayed: number;
    }>,
    Error,
    {
      totalScore: number;
      gamesPlayed: number;
    }
  >
) {
  return useQuery({
    queryKey: gameScoreKeys.participantAggregate(matchId, participantId),
    queryFn: () => getParticipantMatchAggregate(matchId, participantId),
    enabled: !!matchId && !!participantId,
    select: (data) => {
      if (!data.success) {
        throw new Error(
          data.error || `Failed to fetch aggregate for match ${matchId}, participant ${participantId}.`
        );
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useGameScoresWithDetails(
  gameId: number,
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

        if (variables.game_id) {
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.byGame(variables.game_id)
          });
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.withDetails(variables.game_id)
          });
          queryClient.invalidateQueries({ queryKey: gameKeys.all });
          queryClient.invalidateQueries({
            queryKey: gameKeys.details(variables.game_id)
          });
        }

        if (variables.match_participant_id) {
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.byParticipant(variables.match_participant_id)
          });
          queryClient.invalidateQueries({ queryKey: matchParticipantKeys.all });
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

        if (variables.game_id) {
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.byGame(variables.game_id)
          });
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.withDetails(variables.game_id)
          });
          queryClient.invalidateQueries({ queryKey: gameKeys.all });
          queryClient.invalidateQueries({
            queryKey: gameKeys.details(variables.game_id)
          });
        }

        if (variables.match_participant_id) {
          queryClient.invalidateQueries({
            queryKey: gameScoreKeys.byParticipant(variables.match_participant_id)
          });
          queryClient.invalidateQueries({ queryKey: matchParticipantKeys.all });
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
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, number>
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
