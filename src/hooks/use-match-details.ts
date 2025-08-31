import { useQuery } from '@tanstack/react-query';
import { getMatchByIdBasic } from '@/actions/matches';
import { MatchWithFullDetails } from '@/lib/types/matches';
import { ServiceResponse } from '@/lib/types/base';

export const matchDetailKeys = {
  match: (id: number) => ['match-details', id] as const,
};

export function useMatchDetails(matchId: number) {
  return useQuery({
    queryKey: matchDetailKeys.match(matchId),
    queryFn: async (): Promise<MatchWithFullDetails> => {
      const result: ServiceResponse<MatchWithFullDetails> = await getMatchByIdBasic(matchId);
      if (!result.success) {
        throw new Error(result.error || `Match with ID ${matchId} not found.`);
      }
      return result.data;
    },
    enabled: !!matchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}