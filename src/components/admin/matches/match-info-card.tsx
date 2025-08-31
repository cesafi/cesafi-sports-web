'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Square,
  Play,
  Settings
} from 'lucide-react';
import { MatchWithFullDetails } from '@/lib/types/matches';
import { formatTableDate } from '@/lib/utils/date';
import { formatCategoryName } from '@/lib/utils/sports';

interface MatchInfoCardProps {
  match: MatchWithFullDetails;
  participantCount?: number;
  onManageStatus?: () => void;
}

export function MatchInfoCard({ match, participantCount, onManageStatus }: MatchInfoCardProps) {
  const getMatchStatusBadge = (match: MatchWithFullDetails) => {
    // Use the actual status field if available, otherwise derive from timing
    const status = match.status || (match.start_at && match.end_at ? 'finished' : match.start_at ? 'ongoing' : 'upcoming');
    
    switch (status) {
      case 'finished':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Finished</Badge>;
      case 'ongoing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Ongoing</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'upcoming':
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Upcoming</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Match Information</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getMatchStatusBadge(match)}
            {onManageStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={onManageStatus}
                className="flex items-center space-x-1"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Status</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${participantCount !== undefined ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Scheduled</span>
            </div>
            <p className="font-medium">
              {match.scheduled_at ? formatTableDate(match.scheduled_at) : 'Not scheduled'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Venue</span>
            </div>
            <p className="font-medium">{match.venue}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Best of</span>
            </div>
            <p className="font-medium">{match.best_of} game(s)</p>
          </div>

          {participantCount !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Participants</span>
              </div>
              <p className="font-medium">{participantCount} team(s)</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Sport & Competition Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Sport & Category</h4>
            <div className="space-y-1">
              <p className="font-medium">{match.sports_seasons_stages.sports_categories.sports.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCategoryName(
                  match.sports_seasons_stages.sports_categories.division,
                  match.sports_seasons_stages.sports_categories.levels
                )}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Competition Stage</h4>
            <p className="font-medium">
              {match.sports_seasons_stages.competition_stage
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-2">
          <h4 className="font-semibold">Description</h4>
          <p className="text-muted-foreground">{match.description}</p>
        </div>

        {/* Match Timing */}
        {(match.start_at || match.end_at) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold">Match Timing</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {match.start_at && (
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Started:</span>
                    <span className="font-medium">{formatTableDate(match.start_at)}</span>
                  </div>
                )}
                {match.end_at && (
                  <div className="flex items-center space-x-2">
                    <Square className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-muted-foreground">Ended:</span>
                    <span className="font-medium">{formatTableDate(match.end_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}