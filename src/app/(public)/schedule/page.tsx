'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, TrendingUp } from 'lucide-react';
import { SeasonProvider } from '@/components/contexts/season-provider';
import { InfiniteSchedule, mockScheduleMatches } from '@/components/schedule';
import { ScheduleMatch } from '@/lib/types/matches';

export default function SchedulePage() {
  const [selectedMatch, setSelectedMatch] = useState<ScheduleMatch | null>(null);
  const [matches] = useState<ScheduleMatch[]>(mockScheduleMatches);

  const handleMatchClick = (match: ScheduleMatch) => {
    setSelectedMatch(match);
  };

  const handleLoadMore = (direction: 'future' | 'past') => {
    // TODO: Implement load more functionality when API is ready
    // This will be implemented when we connect to the actual API
    console.log(`Loading more ${direction} matches...`);
  };

  return (
    <SeasonProvider>
      <div className="bg-background min-h-screen">
        {/* Header */}
        <div className="border-border bg-card border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <Calendar className="text-primary h-6 w-6" />
              </div>
              <div>
                <h1 className="font-mango-grotesque text-foreground text-3xl font-bold">
                  Match Schedule
                </h1>
                <p className="text-muted-foreground font-roboto mt-1">
                  Follow all CESAFI matches with real-time updates and live scores
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald/10 rounded-lg p-2">
                      <TrendingUp className="text-emerald h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-roboto text-sm">Live Matches</p>
                      <p className="font-mango-grotesque text-foreground text-2xl font-bold">
                        {matches.filter((m) => m.status === 'ongoing').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Calendar className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-roboto text-sm">
                        Today&apos;s Matches
                      </p>
                      <p className="font-mango-grotesque text-foreground text-2xl font-bold">
                        {matches.filter((m) => m.isToday).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gold/10 rounded-lg p-2">
                      <Filter className="text-gold h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-roboto text-sm">This Week</p>
                      <p className="font-mango-grotesque text-foreground text-2xl font-bold">
                        {matches.filter((m) => !m.isPast).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto max-w-[1200px] px-4 py-8">
          <InfiniteSchedule
            matches={matches}
            onMatchClick={handleMatchClick}
            onLoadMore={handleLoadMore}
            hasMoreFuture={false} // TODO: Implement when API is ready - will be true when we have more future data to load
            hasMorePast={false} // TODO: Implement when API is ready - will be true when we have more past data to load
            isLoading={false}
          />
        </div>

        {/* Match Details Modal Placeholder */}
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="mx-4 w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="font-mango-grotesque">{selectedMatch.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-roboto">Match details would be displayed here...</p>
                <Button onClick={() => setSelectedMatch(null)} className="mt-4">
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SeasonProvider>
  );
}
