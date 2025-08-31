import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';

import {
  getMatchParticipantsByMatchId,
  getMatchParticipantsByTeamId,
  getMatchParticipantByMatchAndTeam,
  createMatchParticipant,
  updateMatchParticipantById,
  deleteMatchParticipantById,
  getMatchParticipantsWithDetails,
  getTeamMatchHistory
} from '@/actions/match-participants';

import {
  MatchParticipantInsert,
  MatchParticipantUpdate,
  MatchParticipant,
  MatchParticipantWithTeamDetails,
  MatchParticipantWithMatchDetails,
  MatchParticipantWithFullDetails,
  MatchParticipantWithMatchHistory
} from '@/lib/types/match-participants';

import { ServiceResponse } from '@/lib/types/base';

import { matchKeys } from './use-matches';
import { schoolsTeamKeys } from './use-schools-teams';

export const matchParticipantKeys = {
  all: ['match-participants'] as const,
  details: (id: number) => [...matchParticipantKeys.all, id] as const,
  byMatch: (matchId: number) => [...matchParticipantKeys.all, 'match', matchId] as const,
  byTeam: (teamId: string) => [...matchParticipantKeys.all, 'team', teamId] as const,
  byMatchAndTeam: (matchId: number, teamId: string) =>
    [...matchParticipantKeys.all, 'match-team', matchId, teamId] as const,
  withDetails: (matchId: number) => [...matchParticipantKeys.all, 'details', matchId] as const,
  teamHistory: (teamId: string) => [...matchParticipantKeys.all, 'history', teamId] as const
};

export function useMatchParticipantsByMatchId(
  matchId: number,
  queryOptions?: UseQueryOptions<ServiceResponse<MatchParticipant[]>, Error, MatchParticipant[]>
) {
  return useQuery({
    queryKey: matchParticipantKeys.byMatch(matchId),
    queryFn: () => getMatchParticipantsByMatchId(matchId),
    enabled: !!matchId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Failed to fetch match participants for match ${matchId}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useMatchParticipantsByTeamId(
  teamId: string,
  queryOptions?: UseQueryOptions<ServiceResponse<MatchParticipant[]>, Error, MatchParticipant[]>
) {
  return useQuery({
    queryKey: matchParticipantKeys.byTeam(teamId),
    queryFn: () => getMatchParticipantsByTeamId(teamId),
    enabled: !!teamId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Failed to fetch match participants for team ${teamId}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useMatchParticipantByMatchAndTeam(
  matchId: number,
  teamId: string,
  queryOptions?: UseQueryOptions<ServiceResponse<MatchParticipant>, Error, MatchParticipant>
) {
  return useQuery({
    queryKey: matchParticipantKeys.byMatchAndTeam(matchId, teamId),
    queryFn: () => getMatchParticipantByMatchAndTeam(matchId, teamId),
    enabled: !!matchId && !!teamId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Failed to fetch match participant for match ${matchId}, team ${teamId}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useMatchParticipantsWithDetails(
  matchId: number,
  queryOptions?: UseQueryOptions<
    ServiceResponse<MatchParticipantWithFullDetails[]>,
    Error,
    MatchParticipantWithFullDetails[]
  >
) {
  return useQuery({
    queryKey: matchParticipantKeys.withDetails(matchId),
    queryFn: () => getMatchParticipantsWithDetails(matchId),
    enabled: !!matchId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Failed to fetch match participants with details for match ${matchId}.`);
      }
      return data.data;
    },
    ...queryOptions
  });
}

export function useTeamMatchHistory(
  teamId: string,
  queryOptions?: UseQueryOptions<
    ServiceResponse<MatchParticipantWithMatchHistory[]>,
    Error,
    MatchParticipantWithMatchHistory[]
  >
) {
  return useQuery({
    queryKey: matchParticipantKeys.teamHistory(teamId),
    queryFn: () => getTeamMatchHistory(teamId),
    enabled: !!teamId,
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || `Failed to fetch match history for team ${teamId}.`);
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
        queryClient.invalidateQueries({ queryKey: matchParticipantKeys.all });

        if (variables.match_id) {
          queryClient.invalidateQueries({
            queryKey: matchParticipantKeys.byMatch(variables.match_id)
          });
          queryClient.invalidateQueries({
            queryKey: matchParticipantKeys.withDetails(variables.match_id)
          });
          queryClient.invalidateQueries({ queryKey: matchKeys.all });
          queryClient.invalidateQueries({
            queryKey: matchKeys.details(variables.match_id)
          });
        }

        if (variables.team_id) {
          queryClient.invalidateQueries({
            queryKey: matchParticipantKeys.byTeam(variables.team_id)
          });
          queryClient.invalidateQueries({
            queryKey: matchParticipantKeys.teamHistory(variables.team_id)
          });
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });
          queryClient.invalidateQueries({
            queryKey: schoolsTeamKeys.details(variables.team_id)
          });
        }
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
        queryClient.invalidateQueries({ queryKey: matchParticipantKeys.all });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: matchParticipantKeys.details(variables.id) });
        }

        if (variables.match_id) {
          queryClient.invalidateQueries({
            queryKey: matchParticipantKeys.byMatch(variables.match_id)
          });
          queryClient.invalidateQueries({
            queryKey: matchParticipantKeys.withDetails(variables.match_id)
          });
          queryClient.invalidateQueries({ queryKey: matchKeys.all });
          queryClient.invalidateQueries({
            queryKey: matchKeys.details(variables.match_id)
          });
        }

        if (variables.team_id) {
          queryClient.invalidateQueries({
            queryKey: matchParticipantKeys.byTeam(variables.team_id)
          });
          queryClient.invalidateQueries({
            queryKey: matchParticipantKeys.teamHistory(variables.team_id)
          });
          queryClient.invalidateQueries({ queryKey: schoolsTeamKeys.all });
          queryClient.invalidateQueries({
            queryKey: schoolsTeamKeys.details(variables.team_id)
          });
        }
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
  mutationOptions?: UseMutationOptions<ServiceResponse<undefined>, Error, number>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMatchParticipantById,
    onSuccess: (result, id, context) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: matchParticipantKeys.all });
        queryClient.invalidateQueries({ queryKey: matchParticipantKeys.details(id) });

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


