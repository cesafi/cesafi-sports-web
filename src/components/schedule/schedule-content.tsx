'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfiniteSchedule } from '@/components/schedule';
import { ScheduleMatch } from '@/lib/types/matches';

interface ScheduleContentProps {
  initialMatches: ScheduleMatch[];
  availableCategories: Array<{
    id: number;
    division: string;
    levels: string;
    sport_name: string;
    formatted_name: string;
  }>;
}

export default function ScheduleContent({ initialMatches, availableCategories }: ScheduleContentProps) {
  const [selectedMatch, setSelectedMatch] = useState<ScheduleMatch | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>('all');

  const handleMatchClick = (match: ScheduleMatch) => {
    setSelectedMatch(match);
  };

  const handleLoadMore = (direction: 'future' | 'past') => {
    // TODO: Implement load more functionality when API is ready
    // This will be implemented when we connect to the actual API
    console.log(`Loading more ${direction} matches...`);
  };

  // Create sport options from categories
  const sportOptions = availableCategories.map(category => ({
    value: category.formatted_name,
    label: category.formatted_name
  }));

  return (
    <>
      {/* Main Content - Add top padding for navbar spacing */}
      <div className="pt-8 pb-6">
        <InfiniteSchedule
          matches={initialMatches}
          onMatchClick={handleMatchClick}
          onLoadMore={handleLoadMore}
          hasMoreFuture={false} // TODO: Implement when API is ready - will be true when we have more future data to load
          hasMorePast={false} // TODO: Implement when API is ready - will be true when we have more past data to load
          isLoading={false}
          selectedSport={selectedSport}
          onSportChange={setSelectedSport}
          availableSports={sportOptions.map(option => option.value)}
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
    </>
  );
}
