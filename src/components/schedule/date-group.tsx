'use client';

import { Calendar } from 'lucide-react';
import { ScheduleDateGroup } from './utils';
import { ScheduleMatch } from '@/lib/types/matches';
import MatchCard from './match-card';
import { roboto } from '@/lib/fonts';

interface DateGroupProps {
  readonly dateGroup: ScheduleDateGroup;
}

export default function DateGroup({ dateGroup }: DateGroupProps) {
  return (
    <div className="space-y-3">
      {/* Date Header */}
      <div className="flex items-center gap-2.5">
        {!dateGroup.isToday && <Calendar className="text-muted-foreground/40 h-4 w-4" />}
        <h2 className="font-mango-grotesque text-foreground text-lg sm:text-xl font-bold tracking-wide">
          {dateGroup.isToday ? 'Today' : dateGroup.displayDate}
        </h2>
        {dateGroup.matches.length > 0 && (
          <span className={`${roboto.className} text-muted-foreground/50 text-xs`}>
            {dateGroup.matches.length} match{dateGroup.matches.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {dateGroup.matches.length > 0 ? (
        <div
          className={`space-y-2 ${dateGroup.isToday ? 'rounded-lg p-3 bg-primary/[0.03] border border-primary/10' : ''}`}
        >
          {dateGroup.matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="bg-card/40 border border-border/30 rounded-lg p-5">
           <h3 className={`${roboto.className} text-foreground/80 text-sm font-medium mb-0.5`}>
               No Matches Scheduled {dateGroup.isToday ? 'Today' : 'on This Date'}
           </h3>
           <p className={`${roboto.className} text-muted-foreground/50 text-xs`}>
               Check back soon to find more matches
           </p>
        </div>
      )}
    </div>
  );
}
