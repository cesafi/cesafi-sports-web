'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useMatchDetails } from '@/hooks/use-match-details';
import { useUpdateMatch } from '@/hooks/use-matches';
import { MatchInfoCard, MatchParticipantsTable, MatchGamesTable, MatchStatusModal } from '@/components/admin/matches';
import { MatchUpdate } from '@/lib/types/matches';
import { toast } from 'sonner';

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = parseInt(params.id as string);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Load match details
  const {
    data: match,
    isLoading: matchLoading,
    error: matchError,
    refetch: refetchMatch
  } = useMatchDetails(matchId);

  // Update match mutation
  const updateMatchMutation = useUpdateMatch();

  const handleBack = () => {
    router.back();
  };

  const handleUpdateMatch = async (data: MatchUpdate) => {
    try {
      const result = await updateMatchMutation.mutateAsync(data);
      if (result.success) {
        toast.success('Match status updated successfully');
        setIsStatusModalOpen(false);
        refetchMatch();
      } else {
        toast.error(result.error || 'Failed to update match status');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      throw error;
    }
  };

  if (matchLoading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (matchError || !match) {
    return (
      <div className="w-full flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load match details</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matches
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{match.name}</h1>
            <p className="text-muted-foreground">Match Details & Game Management</p>
          </div>
        </div>
      </div>

      {/* Match Information */}
      <MatchInfoCard
        match={match}
        onManageStatus={() => setIsStatusModalOpen(true)}
      />

      {/* Match Participants Data Table */}
      <MatchParticipantsTable
        matchId={matchId}
        isLoading={matchLoading}
      />

      {/* Games Table */}
      <MatchGamesTable
        matchId={matchId}
        isLoading={matchLoading}
      />

      {/* Match Status Modal */}
      <MatchStatusModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        match={match}
        onUpdateMatch={handleUpdateMatch}
        isSubmitting={updateMatchMutation.isPending}
      />
    </div>
  );
}
