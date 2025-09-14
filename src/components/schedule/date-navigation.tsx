'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Removed unused dropdown menu imports
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { formatDateForHeader } from '@/lib/utils/date-formatting';

interface DateNavigationProps {
  readonly currentDate: Date;
  readonly onDateChange: (date: Date) => void;
  readonly hasMatches: boolean;
  readonly onPreviousDay?: () => void;
  readonly onNextDay?: () => void;
  readonly onGoToToday?: () => void;
  readonly selectedSport?: string;
  readonly onSportChange?: (sport: string) => void;
  readonly availableSports?: string[];
  readonly availableDates?: Date[];
  readonly hasMorePast?: boolean;
  readonly hasMoreFuture?: boolean;
}

export default function DateNavigation({
  currentDate,
  onDateChange,
  onPreviousDay,
  onNextDay,
  onGoToToday,
  selectedSport = 'all',
  onSportChange,
  availableSports = ['Basketball', 'Volleyball', 'Football', 'Tennis', 'Badminton', 'Track and Field', 'Swimming'],
  availableDates = [],
  hasMorePast = false,
  hasMoreFuture = false
}: DateNavigationProps) {
  const goToPreviousDay = () => {
    if (onPreviousDay) {
      onPreviousDay();
    } else if (availableDates.length > 0) {
      const currentIndex = availableDates.findIndex(date => 
        date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
      );
      if (currentIndex > 0) {
        onDateChange(availableDates[currentIndex - 1]);
      }
    }
  };

  const goToNextDay = () => {
    if (onNextDay) {
      onNextDay();
    } else if (availableDates.length > 0) {
      const currentIndex = availableDates.findIndex(date => 
        date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
      );
      if (currentIndex < availableDates.length - 1) {
        onDateChange(availableDates[currentIndex + 1]);
      }
    }
  };

  const handleGoToToday = () => {
    if (onGoToToday) {
      onGoToToday();
    } else {
      const today = new Date();
      onDateChange(today);
    }
  };

  // Date formatting is now handled by the utility function

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side: Date display and navigation like LoL Esports */}
          <div className="flex items-center gap-6">
            {/* Large date display */}
            <h1 className="font-mango-grotesque text-foreground text-2xl font-bold">
              {formatDateForHeader(currentDate)}
            </h1>

            {/* Date Navigation */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousDay}
                disabled={!hasMorePast && availableDates.length > 0 && availableDates.findIndex(date => 
                  date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
                ) <= 0}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoToToday}
                className="h-8 px-3 mx-1 hover:bg-muted"
              >
                Today
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextDay}
                disabled={!hasMoreFuture && availableDates.length > 0 && availableDates.findIndex(date => 
                  date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
                ) >= availableDates.length - 1}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* League/Season Filter Button */}
            <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-muted">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold mr-2">
                4
              </div>
              <span className="text-sm">Leagues</span>
            </Button>
          </div>

          {/* Right side: Sport filter and settings */}
          <div className="flex items-center gap-3">
            {/* Sport Filter */}
            <Select value={selectedSport} onValueChange={onSportChange}>
              <SelectTrigger className="w-[180px] h-8 bg-background border-border text-sm">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {availableSports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Settings button */}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}