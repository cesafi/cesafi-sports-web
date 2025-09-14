'use client';

import { Card, CardContent } from '@/components/ui/card';
// Removed unused Badge import
import {
  Clock,
  Trophy,
  Volleyball,
  Activity,
  Zap,
  MapPin as MapPinIcon,
  Waves,
  Sword,
  Sparkles,
  Music,
  Circle,
  Target,
  Dumbbell
} from 'lucide-react';
import Image from 'next/image';
import { ScheduleMatch } from '@/lib/types/matches';
import { determineWinner } from './utils';
import { getSportIcon } from '@/lib/utils/sports';

// Utility function to format competition stage names
const formatCompetitionStage = (stage: string): string => {
  return stage
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface MatchCardProps {
  readonly match: ScheduleMatch;
  readonly onMatchClick?: (match: ScheduleMatch) => void;
}

export default function MatchCard({ match, onMatchClick }: MatchCardProps) {
  // Transform match_participants to the format expected by determineWinner
  const participants = match.match_participants.map((p) => ({
    id: p.id,
    teamName: p.schools_teams.name,
    schoolName: p.schools_teams.schools.name,
    schoolAbbreviation: p.schools_teams.schools.abbreviation,
    schoolLogo: p.schools_teams.schools.logo_url,
    score: p.match_score,
    isWinner: false
  }));

  const participantsWithWinners = determineWinner(participants);
  const [team1, team2] = participantsWithWinners;

  // Get sport icon component
  const getSportIconComponent = (sportName: string) => {
    const iconName = getSportIcon(sportName);
    const iconProps = { className: 'h-4 w-4' };

    switch (iconName) {
      case 'Basketball':
        return <Circle {...iconProps} />; // Using Circle for basketball
      case 'Volleyball':
        return <Volleyball {...iconProps} />;
      case 'Football':
        return <Circle {...iconProps} />; // Using Circle for football
      case 'Tennis':
        return <Circle {...iconProps} />; // Using Circle for tennis
      case 'Badminton':
        return <Circle {...iconProps} />; // Using Circle for badminton
      case 'TableTennis':
        return <Circle {...iconProps} />; // Using Circle for table tennis
      case 'Baseball':
        return <Circle {...iconProps} />; // Using Circle for baseball
      case 'Softball':
        return <Circle {...iconProps} />; // Using Circle for softball
      case 'Activity':
        return <Activity {...iconProps} />;
      case 'Zap':
        return <Zap {...iconProps} />;
      case 'MapPin':
        return <MapPinIcon {...iconProps} />;
      case 'Waves':
        return <Waves {...iconProps} />;
      case 'Fist':
        return <Target {...iconProps} />; // Using Target for combat sports
      case 'Sword':
        return <Sword {...iconProps} />;
      case 'Chess':
        return <Target {...iconProps} />; // Using Target for chess
      case 'Sparkles':
        return <Sparkles {...iconProps} />;
      case 'Music':
        return <Music {...iconProps} />;
      case 'Circle':
        return <Circle {...iconProps} />;
      case 'Target':
        return <Target {...iconProps} />;
      case 'Dumbbell':
        return <Dumbbell {...iconProps} />;
      default:
        return <Trophy {...iconProps} />;
    }
  };

  // Removed unused status helper functions

  return (
    <Card
      className="border-border bg-card hover:border-primary/20 cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
      onClick={() => onMatchClick?.(match)}
    >
      <CardContent className="p-4">
        {/* Compact Match Layout - Like LoL Esports sample */}
        <div className="flex items-center justify-between">
          {/* Left: Play button / Status indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              {match.status === 'ongoing' ? (
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              ) : match.status === 'finished' ? (
                <Trophy className="h-4 w-4 text-yellow-500" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            {/* Team 1 */}
            <div className="flex items-center gap-2">
              <Image
                src={team1.schoolLogo ?? '/img/cesafi-logo.webp'}
                alt={`${team1.schoolAbbreviation} logo`}
                width={32}
                height={32}
                className="border-border h-8 w-8 rounded-full border object-cover"
              />
              <div className="font-mango-grotesque text-foreground text-sm font-semibold">
                {team1.schoolAbbreviation}
              </div>
            </div>
          </div>

          {/* Center: Scores */}
          <div className="flex items-center gap-2">
            <div
              className={`font-mango-grotesque text-lg font-bold ${
                team1.isWinner && match.status === 'finished' ? 'text-primary' : 'text-foreground'
              }`}
            >
              {team1.score ?? '-'}
            </div>
            <div className="text-muted-foreground font-roboto text-sm">/</div>
            <div
              className={`font-mango-grotesque text-lg font-bold ${
                team2.isWinner && match.status === 'finished' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {team2.score ?? '-'}
            </div>
          </div>

          {/* Right: Team 2 and Match Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-mango-grotesque text-foreground text-sm font-semibold">
                {team2.schoolAbbreviation}
              </div>
              <div className="text-muted-foreground font-roboto text-xs">
                {match.displayTime}
              </div>
            </div>
            <Image
              src={team2.schoolLogo ?? '/img/cesafi-logo.webp'}
              alt={`${team2.schoolAbbreviation} logo`}
              width={32}
              height={32}
              className="border-border h-8 w-8 rounded-full border object-cover"
            />
            <div className="text-muted-foreground font-roboto text-xs">
              BO{match.best_of}
            </div>
          </div>
        </div>

        {/* Bottom: Sport and Stage Info */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSportIconComponent(match.sports_seasons_stages.sports_categories.sports.name)}
            <div className="text-muted-foreground font-roboto text-xs">
              {match.sports_seasons_stages.sports_categories.sports.name} • {formatCompetitionStage(match.sports_seasons_stages.competition_stage)}
            </div>
          </div>
          <div className="text-muted-foreground font-roboto text-xs">
            {match.venue}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
