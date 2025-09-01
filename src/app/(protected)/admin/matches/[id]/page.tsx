'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Square, Clock, Plus, Users, Trophy, Settings } from 'lucide-react';
import { useMatchDetails } from '@/hooks/use-match-details';
import { useUpdateMatch } from '@/hooks/use-matches';
import { MatchInfoCard, MatchParticipantsTable, MatchGamesTable, MatchStatusModal } from '@/components/admin/matches';
import { MatchUpdate } from '@/lib/types/matches';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatSmartDate } from '@/lib/utils/date';

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

  const getMatchStatusBadge = () => {
    if (!match) return null;

    const status = match.status || 'upcoming';
    const statusConfig = {
      upcoming: { label: 'Upcoming', variant: 'secondary' as const, icon: Clock, color: 'text-amber-600' },
      ongoing: { label: 'Ongoing', variant: 'default' as const, icon: Play, color: 'text-green-600' },
      finished: { label: 'Finished', variant: 'default' as const, icon: Square, color: 'text-blue-600' },
      cancelled: { label: 'Cancelled', variant: 'secondary' as const, icon: Square, color: 'text-red-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-2">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
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
    <div className="w-full space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-6">
        {/* Back Button */}
        <Button onClick={handleBack} variant="ghost" size="sm" className="p-0 h-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Matches
        </Button>

        {/* Match Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{match.name}</h1>
            <p className="text-lg text-muted-foreground">{match.description}</p>
          </div>
          <div className="flex items-center gap-3">
            {getMatchStatusBadge()}
            <Button
              onClick={() => setIsStatusModalOpen(true)}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Status
            </Button>
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
