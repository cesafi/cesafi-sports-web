'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { formatDateShort, isToday } from './utils';

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

  return (
    <Card className="sticky top-24 z-10 border-border bg-card shadow-sm mt-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Left side: Current date display */}
          <div className="flex items-center">
            <h2 className="font-mango-grotesque text-foreground text-2xl font-bold">
              {isToday(currentDate) ? 'Today' : formatDateShort(currentDate)}
            </h2>
          </div>

          {/* Right side: Date navigation and filters */}
          <div className="flex items-center gap-4">
            {/* Date Navigation - Unified button style */}
            <div className="flex items-center">
              <Button
                variant="outline"
                size="default"
                onClick={goToPreviousDay}
                disabled={!hasMorePast && availableDates.length > 0 && availableDates.findIndex(date => 
                  date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
                ) <= 0}
                className="rounded-r-none border-r-0 h-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="default"
                onClick={handleGoToToday}
                className="rounded-none border-r-0 border-l-0 h-9"
              >
                Today
              </Button>

              <Button
                variant="outline"
                size="default"
                onClick={goToNextDay}
                disabled={!hasMoreFuture && availableDates.length > 0 && availableDates.findIndex(date => 
                  date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
                ) >= availableDates.length - 1}
                className="rounded-l-none h-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Sport Filter */}
            <Select value={selectedSport} onValueChange={onSportChange}>
              <SelectTrigger className="w-[180px] h-9 bg-background border-border">
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

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <div className="p-2 text-sm text-muted-foreground">Settings coming soon...</div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}