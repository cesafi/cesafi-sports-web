import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMatchParticipant, deleteMatchParticipantById } from '@/actions/match-participants';
import { MatchParticipantInsert } from '@/lib/types/match-participants';
import { matchParticipantDetailKeys } from './use-match-participants-details';
import { toast } from 'sonner';

export function useCreateMatchParticipant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMatchParticipant,
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate match participants queries
        queryClient.invalidateQueries({
          queryKey: matchParticipantDetailKeys.participants(variables.match_id)
        });
        // Also invalidate match details to update participant count
        queryClient.invalidateQueries({
          queryKey: ['match-details', variables.match_id]
        });
      }
    },
  });
}

export function useDeleteMatchParticipant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteMatchParticipantById,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Team removed from match successfully');
      } else {
        toast.error(result.error || 'Failed to remove team from match');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred');
    }
  });
}