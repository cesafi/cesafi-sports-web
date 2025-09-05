'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ScheduleMatch } from '@/lib/types/matches';
import { ScheduleDateGroup, groupMatchesByDate } from './utils';
import DateGroup from './date-group';
import DateNavigation from './date-navigation';
import FloatingNavButton from './floating-nav-button';

interface InfiniteScheduleProps {
  readonly matches: ScheduleMatch[];
  readonly onMatchClick?: (match: ScheduleMatch) => void;
  readonly onLoadMore?: (direction: 'future' | 'past') => void;
  readonly hasMoreFuture?: boolean;
  readonly hasMorePast?: boolean;
  readonly isLoading?: boolean;
  readonly selectedSport?: string;
  readonly onSportChange?: (sport: string) => void;
  readonly availableSports?: string[];
}

export default function InfiniteSchedule({
  matches,
  onMatchClick,
  onLoadMore,
  hasMoreFuture = false,
  hasMorePast = false,
  isLoading = false,
  selectedSport = 'all',
  onSportChange,
  availableSports = [
    'Basketball',
    'Volleyball',
    'Football',
    'Tennis',
    'Badminton',
    'Track and Field',
    'Swimming'
  ]
}: InfiniteScheduleProps) {
  const [displayedDate, setDisplayedDate] = useState(new Date()); // Date shown on left side
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [floatingButtonDirection, setFloatingButtonDirection] = useState<'up' | 'down'>('up');
  const topObserverRef = useRef<IntersectionObserver | null>(null);
  const bottomObserverRef = useRef<IntersectionObserver | null>(null);
  const topLoadMoreRef = useRef<HTMLDivElement | null>(null);
  const bottomLoadMoreRef = useRef<HTMLDivElement | null>(null);

  // Filter matches by sport
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      if (selectedSport === 'all') return true;
      return match.sports_seasons_stages.sports_categories.sports.name === selectedSport;
    });
  }, [matches, selectedSport]);

  // Group filtered matches by date
  const dateGroups = useMemo(() => {
    return groupMatchesByDate(filteredMatches);
  }, [filteredMatches]);

  // Handle scroll detection for floating button and displayed date
  const handleScroll = useCallback(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayGroup = dateGroups.find((group) => group.date === todayString);

    // Find the currently visible date group
    let visibleDateGroup: ScheduleDateGroup | null = null;
    let minDistance = Infinity;

    for (const group of dateGroups) {
      const element = document.getElementById(`date-group-${group.date}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const distanceFromTop = Math.abs(rect.top);

        // If the element is visible in the viewport
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          if (distanceFromTop < minDistance) {
            minDistance = distanceFromTop;
            visibleDateGroup = group;
          }
        }
      }
    }

    // Update displayed date if we found a visible group
    if (visibleDateGroup) {
      const newDisplayedDate = new Date(visibleDateGroup.date);
      setDisplayedDate((prevDate) => {
        // Only update if the date is actually different
        if (prevDate.toISOString().split('T')[0] !== newDisplayedDate.toISOString().split('T')[0]) {
          return newDisplayedDate;
        }
        return prevDate;
      });
    }

    // Floating button logic
    if (!todayGroup) {
      setShowFloatingButton(false);
      return;
    }

    const todayElement = document.getElementById(`date-group-${todayString}`);
    if (!todayElement) {
      setShowFloatingButton(false);
      return;
    }

    const rect = todayElement.getBoundingClientRect();
    const isTodayVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

    if (!isTodayVisible) {
      setShowFloatingButton(true);
      // Determine direction based on scroll position
      if (rect.top < 0) {
        setFloatingButtonDirection('up'); // We're below today, need to go up
      } else {
        setFloatingButtonDirection('down'); // We're above today, need to go down
      }
    } else {
      setShowFloatingButton(false);
    }
  }, [dateGroups]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
      const availableDates = dateGroups.map((group) => new Date(group.date));
      const currentIndex = availableDates.findIndex(
        (date) => date.toISOString().split('T')[0] === displayedDate.toISOString().split('T')[0]
      );

      let targetDate: Date;
      if (direction === 'previous' && currentIndex > 0) {
        targetDate = availableDates[currentIndex - 1];
      } else if (direction === 'next' && currentIndex < availableDates.length - 1) {
        targetDate = availableDates[currentIndex + 1];
      } else {
        return; // No more dates in that direction
      }

      // Scroll to the target date group
      const targetDateString = targetDate.toISOString().split('T')[0];
      const element = document.getElementById(`date-group-${targetDateString}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      setDisplayedDate(targetDate);
    },
    [displayedDate, dateGroups]
  );

  const handleGoToToday = useCallback(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayGroup = dateGroups.find((group) => group.date === todayString);

    if (todayGroup) {
      const element = document.getElementById(`date-group-${todayString}`);
      if (element) {
        // Calculate offset to center the element in the viewport
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.scrollY;
        const offset = window.innerHeight / 2 - elementRect.height / 2;
        const targetPosition = absoluteElementTop - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }

    setDisplayedDate(today);
  }, [dateGroups]);

  // Alias for floating button
  const handleFloatingButtonClick = handleGoToToday;

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <DateNavigation
        currentDate={displayedDate}
        onDateChange={setDisplayedDate}
        hasMatches={dateGroups.some(
          (group) => group.date === displayedDate.toISOString().split('T')[0]
        )}
        onPreviousDay={() => handleDateNavigation('previous')}
        onNextDay={() => handleDateNavigation('next')}
        onGoToToday={handleGoToToday}
        selectedSport={selectedSport}
        onSportChange={onSportChange}
        availableSports={availableSports}
        availableDates={dateGroups.map((group) => new Date(group.date))}
        hasMorePast={hasMorePast}
        hasMoreFuture={hasMoreFuture}
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
        <div className="space-y-12">
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

      {/* Floating Navigation Button */}
      <FloatingNavButton
        isVisible={showFloatingButton}
        direction={floatingButtonDirection}
        onClick={handleFloatingButtonClick}
      />
    </div>
  );
}
