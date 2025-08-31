import { useQuery } from '@tanstack/react-query';
import { getMatchParticipantsWithDetails } from '@/actions/match-participants';
import { MatchParticipantWithFullDetails } from '@/lib/types/match-participants';
import { ServiceResponse } from '@/lib/types/base';

export const matchParticipantDetailKeys = {
  participants: (matchId: number) => ['match-participant-details', matchId] as const,
};

export function useMatchParticipantsDetails(matchId: number) {
  return useQuery({
    queryKey: matchParticipantDetailKeys.participants(matchId),
    queryFn: async (): Promise<MatchParticipantWithFullDetails[]> => {
      const result: ServiceResponse<MatchParticipantWithFullDetails[]> = await getMatchParticipantsWithDetails(matchId);
      if (!result.success) {
        throw new Error(result.error || `Failed to fetch match participants for match ${matchId}.`);
      }
      return result.data || [];
    },
    enabled: !!matchId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}