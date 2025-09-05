'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { ScheduleDateGroup } from './utils';
import MatchCard from './match-card';

interface DateGroupProps {
  readonly dateGroup: ScheduleDateGroup;
  readonly onMatchClick?: (match: any) => void;
}

export default function DateGroup({ dateGroup, onMatchClick }: DateGroupProps) {

  return (
    <div className="space-y-12">
      {/* Date Header */}
      <div className="relative">
        {/* Date separator line at top */}
        <div className="border-border absolute -top-6 left-0 right-0 border-t"></div>
        
        <div className={`flex items-center gap-3 pb-4 ${dateGroup.isToday ? 'bg-gradient-to-b from-primary/5 to-primary/10 rounded-lg p-4' : ''}`}>
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground h-5 w-5" />
            <h2 className="font-mango-grotesque text-foreground text-xl font-semibold">
              {dateGroup.displayDate}
            </h2>
          </div>
          <div className="text-muted-foreground font-roboto text-sm">
            {dateGroup.matches.length} match{dateGroup.matches.length !== 1 ? 'es' : ''}
          </div>
        </div>
      </div>

      {/* Matches */}
      <div className="space-y-4">
        {dateGroup.matches.map((match) => (
          <MatchCard key={match.id} match={match} onMatchClick={onMatchClick} />
        ))}
      </div>

      {/* No Matches Message */}
      {dateGroup.matches.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
