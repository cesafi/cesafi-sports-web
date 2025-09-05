'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatDateShort, isToday } from './utils';

interface DateNavigationProps {
  readonly currentDate: Date;
  readonly onDateChange: (date: Date) => void;
  readonly hasMatches: boolean;
  readonly onPreviousDay?: () => void;
  readonly onNextDay?: () => void;
  readonly onGoToToday?: () => void;
}

export default function DateNavigation({
  currentDate,
  onDateChange,
  hasMatches,
  onPreviousDay,
  onNextDay,
  onGoToToday
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

  const goToToday = () => {
    if (onGoToToday) {
      onGoToToday();
    } else {
      onDateChange(new Date());
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Previous Day Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousDay}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Day
          </Button>

          {/* Current Date Display */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <div className="text-center">
                <div className="font-mango-grotesque text-foreground text-lg font-semibold">
                  {formatDateShort(currentDate)}
                </div>
                <div className="text-muted-foreground font-roboto text-sm">
                  {isToday(currentDate)
                    ? 'Today'
                    : currentDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                </div>
              </div>
            </div>

            {!isToday(currentDate) && (
              <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
                Go to Today
              </Button>
            )}
          </div>

          {/* Next Day Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextDay}
            className="flex items-center gap-2"
          >
            Next Day
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Match Count Indicator */}
        {hasMatches && (
          <div className="mt-3 text-center">
            <div className="bg-primary/10 inline-flex items-center gap-2 rounded-full px-3 py-1">
              <div className="bg-primary h-2 w-2 rounded-full" />
              <span className="text-primary font-roboto text-sm font-medium">
                {hasMatches ? 'Matches available' : 'No matches'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
