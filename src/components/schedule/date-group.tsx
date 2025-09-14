'use client';

import { Clock } from 'lucide-react';
import { ScheduleDateGroup } from './utils';
import { formatDateForGroup } from '@/lib/utils/date-formatting';
import MatchCard from './match-card';

interface DateGroupProps {
  readonly dateGroup: ScheduleDateGroup;
  readonly onMatchClick?: (match: { id: number; name: string; scheduled_at: string | null }) => void;
}

export default function DateGroup({ dateGroup, onMatchClick }: DateGroupProps) {
  // Date formatting is now handled by the utility function

  return (
    <div className="space-y-6">
      {/* Date Header - LoL Esports style */}
      <div className="px-6">
        <h2 className="font-mango-grotesque text-foreground text-2xl font-bold">
          {formatDateForGroup(dateGroup.date, dateGroup.isToday, dateGroup.isYesterday)}
        </h2>
      </div>

      {/* Matches */}
      <div className="space-y-3 px-6">
        {dateGroup.matches.map((match) => (
          <MatchCard key={match.id} match={match} onMatchClick={onMatchClick} />
        ))}
      </div>

      {/* No Matches Message */}
      {dateGroup.matches.length === 0 && (
        <div className="px-6">
          <div className="bg-muted/10 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Clock className="text-muted-foreground h-12 w-12" />
              <div>
                <h3 className="font-mango-grotesque text-foreground text-lg font-semibold">
                  No matches scheduled
                </h3>
                <p className="text-muted-foreground font-roboto text-sm">
                  There are no matches scheduled for this date.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
