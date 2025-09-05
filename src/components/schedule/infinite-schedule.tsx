'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ScheduleMatch } from '@/lib/types/matches';
import { ScheduleDateGroup, groupMatchesByDate } from './utils';
import DateGroup from './date-group';
import DateNavigation from './date-navigation';

interface InfiniteScheduleProps {
  readonly matches: ScheduleMatch[];
  readonly onMatchClick?: (match: ScheduleMatch) => void;
  readonly onLoadMore?: (direction: 'future' | 'past') => void;
  readonly hasMoreFuture?: boolean;
  readonly hasMorePast?: boolean;
  readonly isLoading?: boolean;
}

export default function InfiniteSchedule({
  matches,
  onMatchClick,
  onLoadMore,
  hasMoreFuture = false,
  hasMorePast = false,
  isLoading = false
}: InfiniteScheduleProps) {
  const [dateGroups, setDateGroups] = useState<ScheduleDateGroup[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const topObserverRef = useRef<IntersectionObserver | null>(null);
  const bottomObserverRef = useRef<IntersectionObserver | null>(null);
  const topLoadMoreRef = useRef<HTMLDivElement | null>(null);
  const bottomLoadMoreRef = useRef<HTMLDivElement | null>(null);

  // Group matches by date
  useEffect(() => {
    const grouped = groupMatchesByDate(matches);
    setDateGroups(grouped);
  }, [matches]);

  // Set up intersection observers for infinite scroll
  useEffect(() => {
    // Top observer for loading past matches
    if (topObserverRef.current) {
      topObserverRef.current.disconnect();
    }

    topObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePast && !isLoading) {
          onLoadMore?.('past');
        }
      },
      { threshold: 0.1 }
    );

    if (topLoadMoreRef.current) {
      topObserverRef.current.observe(topLoadMoreRef.current);
    }

    // Bottom observer for loading future matches
    if (bottomObserverRef.current) {
      bottomObserverRef.current.disconnect();
    }

    bottomObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreFuture && !isLoading) {
          onLoadMore?.('future');
        }
      },
      { threshold: 0.1 }
    );

    if (bottomLoadMoreRef.current) {
      bottomObserverRef.current.observe(bottomLoadMoreRef.current);
    }

    return () => {
      if (topObserverRef.current) {
        topObserverRef.current.disconnect();
      }
      if (bottomObserverRef.current) {
        bottomObserverRef.current.disconnect();
      }
    };
  }, [hasMorePast, hasMoreFuture, isLoading, onLoadMore]);

  const handleDateNavigation = useCallback(
    (direction: 'previous' | 'next') => {
      const targetDate = new Date(currentDate);
      if (direction === 'previous') {
        targetDate.setDate(targetDate.getDate() - 1);
      } else {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      // Find the date group for the target date
      const targetDateString = targetDate.toISOString().split('T')[0];
      const targetGroup = dateGroups.find((group) => group.date === targetDateString);

      if (targetGroup) {
        // Scroll to the target date group
        const element = document.getElementById(`date-group-${targetDateString}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      setCurrentDate(targetDate);
    },
    [currentDate, dateGroups]
  );

  const handleGoToToday = useCallback(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayGroup = dateGroups.find((group) => group.date === todayString);

    if (todayGroup) {
      const element = document.getElementById(`date-group-${todayString}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    setCurrentDate(today);
  }, [dateGroups]);

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <DateNavigation
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        hasMatches={dateGroups.some(
          (group) => group.date === currentDate.toISOString().split('T')[0]
        )}
        onPreviousDay={() => handleDateNavigation('previous')}
        onNextDay={() => handleDateNavigation('next')}
        onGoToToday={handleGoToToday}
      />

      {/* Load More Past Trigger */}
      {hasMorePast && (
        <div ref={topLoadMoreRef} className="flex h-10 items-center justify-center">
          {isLoading && (
            <div className="text-muted-foreground font-roboto text-sm">Loading past matches...</div>
          )}
        </div>
      )}

      {/* All Matches - Infinite Scroll */}
      {dateGroups.length > 0 ? (
        <div className="space-y-6">
          {dateGroups.map((dateGroup) => (
            <div key={dateGroup.date} id={`date-group-${dateGroup.date}`}>
              <DateGroup dateGroup={dateGroup} onMatchClick={onMatchClick} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="text-muted-foreground font-roboto">No matches found.</div>
        </div>
      )}

      {/* Load More Future Trigger */}
      {hasMoreFuture && (
        <div ref={bottomLoadMoreRef} className="flex h-10 items-center justify-center">
          {isLoading && (
            <div className="text-muted-foreground font-roboto text-sm">
              Loading future matches...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
