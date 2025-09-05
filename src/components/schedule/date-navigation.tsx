'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, Filter, Settings } from 'lucide-react';
import { formatDateShort } from './utils';

interface DateNavigationProps {
  readonly currentDate: Date;
  readonly onDateChange: (date: Date) => void;
  readonly hasMatches: boolean;
  readonly onPreviousDay?: () => void;
  readonly onNextDay?: () => void;
  readonly selectedSport?: string;
  readonly onSportChange?: (sport: string) => void;
  readonly availableSports?: string[];
}

export default function DateNavigation({
  currentDate,
  onDateChange,
  hasMatches,
  onPreviousDay,
  onNextDay,
  selectedSport = 'all',
  onSportChange,
  availableSports = ['Basketball', 'Volleyball', 'Football', 'Tennis', 'Badminton', 'Track and Field', 'Swimming']
}: DateNavigationProps) {
  const goToPreviousDay = () => {
    if (onPreviousDay) {
      onPreviousDay();
    } else {
      const previousDay = new Date(currentDate);
      previousDay.setDate(previousDay.getDate() - 1);
      onDateChange(previousDay);
    }
  };

  const goToNextDay = () => {
    if (onNextDay) {
      onNextDay();
    } else {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      onDateChange(nextDay);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    onDateChange(today);
  };

  return (
    <Card className="sticky top-20 z-10 border-border bg-card shadow-sm mt-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side: Navigation controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousDay}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={handleGoToToday}
              className="font-mango-grotesque text-foreground text-lg font-semibold hover:bg-primary/10"
            >
              {formatDateShort(currentDate)}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextDay}
              className="flex items-center gap-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Right side: Filters and settings */}
          <div className="flex items-center gap-3">
            {/* Sport Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-muted-foreground h-4 w-4" />
              <Select value={selectedSport} onValueChange={onSportChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sport" />
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
            </div>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="p-2 text-sm text-muted-foreground">
                  Settings coming soon...
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}