// @ts-nocheck
'use client';

import { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScheduleMatch } from '@/lib/types/matches';
import { ScheduleDateGroup, groupMatchesByDate } from './utils';
import DateGroup from './date-group';
import ScheduleFilterBar, { RichSportCategory } from './schedule-filter-bar';
import FloatingNavButton from './floating-nav-button';
import { roboto } from '@/lib/fonts';
import { Season } from '@/lib/types/seasons';
import { sportsSeasonStageWithDetails } from '@/lib/types/sports-seasons-stages';

// Helper function to safely get ISO date string from a Date object
function safeGetDateString(date: Date | null | undefined): string | null {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split('T')[0];
}

interface InfiniteScheduleProps {
  readonly matches: ScheduleMatch[];
  readonly onLoadMore?: (direction: 'future' | 'past') => void;
  readonly hasMoreFuture?: boolean;
  readonly hasMorePast?: boolean;
  readonly isLoading?: boolean;
  readonly isFetchingNextPage?: boolean;
  readonly isFetchingPreviousPage?: boolean;
  readonly selectedSportId?: string;
  readonly onSportChange?: (id: string) => void;
  readonly selectedDivision?: string;
  readonly onDivisionChange?: (division: string) => void;
  readonly availableRichSports?: RichSportCategory[];
  readonly availableSeasons?: Season[];
  readonly selectedSeason?: string;
  readonly onSeasonChange?: (seasonId: string) => void;
  readonly availableStages?: sportsSeasonStageWithDetails[];
  readonly selectedStage?: string;
  readonly onStageChange?: (stageId: string) => void;
  readonly availableSchools?: any[];
  readonly selectedSchool?: string;
  readonly onSchoolChange?: (schoolId: string) => void;
  readonly selectedStatus?: string;
  readonly onStatusChange?: (status: string) => void;
  readonly onResetFilters?: () => void;
  readonly onRegisterScrollToDate?: (fn: (dateStr: string) => void) => void;
}

export default function InfiniteSchedule({
  matches,
  onLoadMore,
  hasMoreFuture = false,
  hasMorePast = false,
  isLoading = false,
  isFetchingNextPage = false,
  isFetchingPreviousPage = false,
  selectedSportId = 'all',
  onSportChange,
  selectedDivision = 'all',
  onDivisionChange,
  availableRichSports = [],
  availableSeasons = [],
  selectedSeason = 'all',
  onSeasonChange,
  availableStages = [],
  selectedStage = 'all',
  onStageChange,
  availableSchools = [],
  selectedSchool = 'all',
  onSchoolChange,
  selectedStatus = 'all',
  onStatusChange,
  onResetFilters,
  onRegisterScrollToDate
}: InfiniteScheduleProps) {
  const getValidDate = (date: Date | string | null | undefined): Date => {
    if (!date) return new Date();
    const d = date instanceof Date ? date : new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const [dateGroups, setDateGroups] = useState<ScheduleDateGroup[]>([]);
  const dateGroupsRef = useRef(dateGroups);
  useEffect(() => {
    dateGroupsRef.current = dateGroups;
  }, [dateGroups]);
  const prevScrollStateRef = useRef({ height: 0, top: 0, isPrepend: false });

  const [displayedDate, setDisplayedDate] = useState(() => getValidDate(new Date()));
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [floatingButtonDirection, setFloatingButtonDirection] = useState<'up' | 'down'>('up');
  const topObserverRef = useRef<IntersectionObserver | null>(null);
  const bottomObserverRef = useRef<IntersectionObserver | null>(null);
  const topLoadMoreRef = useRef<HTMLDivElement | null>(null);
  const bottomLoadMoreRef = useRef<HTMLDivElement | null>(null);

  // Filter matches by sport/division/school/status - memoized
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      // Filter by Sport ID
      if (selectedSportId !== 'all') {
        const sportId = match.sports_seasons_stages?.sports_categories?.sports?.id?.toString();
        if (sportId !== selectedSportId) return false;
      }

      // Filter by Division ("Category")
      if (selectedDivision !== 'all') {
        const division = match.sports_seasons_stages?.sports_categories?.division;
        if (division !== selectedDivision) return false;
      }

      // Filter by School
      if (selectedSchool && selectedSchool !== 'all') {
        const matchSchool = match.match_participants?.some((p: any) =>
          p.schools_teams?.school?.id?.toString() === selectedSchool ||
          p.schools_teams?.school?.abbreviation === selectedSchool
        );
        if (!matchSchool) return false;
      }

      // Filter by Status
      if (selectedStatus && selectedStatus !== 'all') {
        const status = match.status;
        if (selectedStatus === 'live') {
          if (status !== 'live' && status !== 'ongoing') return false;
        } else if (selectedStatus === 'cancelled') {
          if (status !== 'cancelled' && status !== 'canceled') return false;
        } else if (selectedStatus === 'rescheduled') {
          if (status !== 'rescheduled') return false;
        } else if (selectedStatus === 'finished') {
          if (status !== 'finished' && status !== 'completed') return false;
        } else if (selectedStatus === 'upcoming') {
          if (status !== 'upcoming') return false;
        }
      }

      return true;
    });
  }, [matches, selectedSportId, selectedDivision, selectedSchool, selectedStatus]);

  // Group filtered matches by date (chronological ascending)
  useEffect(() => {
    const grouped = groupMatchesByDate(filteredMatches);
    const currentGroups = dateGroupsRef.current;

    const oldFirstDate = currentGroups.length > 0 ? currentGroups[0].date : null;
    const newFirstDate = grouped.length > 0 ? grouped[0].date : null;
    const isPrepend = !!(oldFirstDate && newFirstDate && oldFirstDate !== newFirstDate && grouped.some(g => g.date === oldFirstDate));

    if (isPrepend) {
      prevScrollStateRef.current = {
        height: document.documentElement.scrollHeight,
        top: window.scrollY,
        isPrepend: true
      };
    } else {
      prevScrollStateRef.current.isPrepend = false;
    }

    setDateGroups(grouped);
  }, [filteredMatches]);

  useLayoutEffect(() => {
    if (prevScrollStateRef.current.isPrepend) {
      const newScrollHeight = document.documentElement.scrollHeight;
      const heightDiff = newScrollHeight - prevScrollStateRef.current.height;
      if (heightDiff > 0) {
        window.scrollBy({ top: heightDiff, behavior: 'instant' });
      }
      prevScrollStateRef.current.isPrepend = false;
    }
  }, [dateGroups]);

  // Scroll smoothly to specific date group element
  const scrollToDateGroup = useCallback((dateStr: string) => {
    const element = document.getElementById(`date-group-${dateStr}`);
    if (element) {
      const headerOffset = 180;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setDisplayedDate(getValidDate(dateStr));
    }
  }, []);

  // Register external scroll handler if needed by parent (e.g. Calendar click)
  useEffect(() => {
    if (onRegisterScrollToDate) {
      onRegisterScrollToDate(scrollToDateGroup);
    }
  }, [onRegisterScrollToDate, scrollToDateGroup]);

  // Scroll to today (or nearest date) on initial mount
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    if (dateGroups.length === 0 || hasScrolledRef.current) return;

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    let targetGroup = dateGroups.find(g => g.date === todayString);

    if (!targetGroup) {
      let closestIndex = 0;
      let minDiff = Infinity;
      dateGroups.forEach((group, index) => {
        const groupDate = getValidDate(group.date);
        const diff = Math.abs(groupDate.getTime() - today.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });
      targetGroup = dateGroups[closestIndex];
    }

    if (targetGroup) {
      setDisplayedDate(getValidDate(targetGroup.date));
      setTimeout(() => {
        const element = document.getElementById(`date-group-${targetGroup!.date}`);
        if (element) {
          const headerOffset = 180;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'auto' });
          hasScrolledRef.current = true;
        }
      }, 100);
    }
  }, [dateGroups]);

  // Scroll detection for floating button & active displayed date
  useEffect(() => {
    const handleScroll = () => {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const todayGroup = dateGroups.find((group) => group.date === todayString);

      let visibleDateGroup: ScheduleDateGroup | null = null;
      let minDistance = Infinity;

      for (const group of dateGroups) {
        const element = document.getElementById(`date-group-${group.date}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const distanceFromTop = Math.abs(rect.top);

          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            if (distanceFromTop < minDistance) {
              minDistance = distanceFromTop;
              visibleDateGroup = group;
            }
          }
        }
      }

      if (visibleDateGroup) {
        setDisplayedDate(getValidDate(visibleDateGroup.date));
      }

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
        if (rect.top < 0) {
          setFloatingButtonDirection('up');
        } else {
          setFloatingButtonDirection('down');
        }
      } else {
        setShowFloatingButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dateGroups]);

  // Set up intersection observers:
  // TOP loads PAST matches (scrolling upwards into past)
  // BOTTOM loads FUTURE matches (doomscrolling downwards into future)
  useEffect(() => {
    if (topObserverRef.current) {
      topObserverRef.current.disconnect();
    }

    topObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePast && !isLoading && window.scrollY > 150) {
          onLoadMore?.('past');
        }
      },
      { threshold: 0.1 }
    );

    if (topLoadMoreRef.current) {
      topObserverRef.current.observe(topLoadMoreRef.current);
    }

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
      if (topObserverRef.current) topObserverRef.current.disconnect();
      if (bottomObserverRef.current) bottomObserverRef.current.disconnect();
    };
  }, [hasMorePast, hasMoreFuture, isLoading, onLoadMore]);

  const handleDateChange = useCallback((targetDate: Date) => {
    if (dateGroups.length === 0) return;

    let targetGroup = dateGroups.find(g => g.date === safeGetDateString(targetDate));

    if (!targetGroup) {
      let minDiff = Infinity;
      dateGroups.forEach(g => {
        const diff = Math.abs(getValidDate(g.date).getTime() - targetDate.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          targetGroup = g;
        }
      });
    }

    if (targetGroup) {
      scrollToDateGroup(targetGroup.date);
    }
  }, [dateGroups, scrollToDateGroup]);

  const handleDateNavigation = useCallback(
    (direction: 'previous' | 'next') => {
      const displayedDateStr = safeGetDateString(displayedDate);
      if (!displayedDateStr || dateGroups.length === 0) return;

      const currentIndex = dateGroups.findIndex(g => g.date === displayedDateStr);
      if (currentIndex === -1) return;

      let targetGroup = null;
      if (direction === 'previous' && currentIndex > 0) {
        targetGroup = dateGroups[currentIndex - 1];
      } else if (direction === 'next' && currentIndex < dateGroups.length - 1) {
        targetGroup = dateGroups[currentIndex + 1];
      }

      if (targetGroup) {
        scrollToDateGroup(targetGroup.date);
      }
    },
    [displayedDate, dateGroups, scrollToDateGroup]
  );

  const handleFloatingButtonClick = useCallback(() => {
    const today = new Date();
    handleDateChange(today);
  }, [handleDateChange]);

  return (
    <div className="w-full max-w-full space-y-4">
      {/* Sticky Filter & Navigation Toolbar */}
      <ScheduleFilterBar
        currentDate={displayedDate}
        onDateChange={handleDateChange}
        onPreviousDay={() => handleDateNavigation('previous')}
        onNextDay={() => handleDateNavigation('next')}
        selectedSportId={selectedSportId}
        onSportChange={onSportChange}
        selectedDivision={selectedDivision}
        onDivisionChange={onDivisionChange}
        availableRichSports={availableRichSports}
        availableDates={dateGroups.map((group) => getValidDate(group.date))}
        availableSeasons={availableSeasons}
        selectedSeason={selectedSeason}
        onSeasonChange={onSeasonChange}
        availableStages={availableStages}
        selectedStage={selectedStage}
        onStageChange={onStageChange}
        availableSchools={availableSchools}
        selectedSchool={selectedSchool}
        onSchoolChange={onSchoolChange}
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
        onResetFilters={onResetFilters}
      />

      {/* Load More Past Trigger (Top) - when scrolling up into past */}
      {hasMorePast && (
        <div ref={topLoadMoreRef} className="flex h-8 items-center justify-center py-2">
          {isFetchingPreviousPage && (
            <div className={`${roboto.className} flex items-center text-muted-foreground/60 text-xs`}>
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              Loading past matches…
            </div>
          )}
        </div>
      )}

      {/* All Matches - Chronological Downward List */}
      {dateGroups.length > 0 ? (
        <div className="space-y-8">
          {dateGroups.map((dateGroup) => (
            <motion.div
              key={dateGroup.date}
              id={`date-group-${dateGroup.date}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <DateGroup dateGroup={dateGroup} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border border-border/30 rounded-xl bg-card/30">
          <div className={`${roboto.className} text-muted-foreground/60 text-sm`}>
            No matches found matching the selected filters.
          </div>
        </div>
      )}

      {/* Load More Future Trigger (Bottom) - when doomscrolling downwards */}
      {hasMoreFuture && (
        <div ref={bottomLoadMoreRef} className="flex h-8 items-center justify-center py-2">
          {isFetchingNextPage && (
            <div className={`${roboto.className} flex items-center text-muted-foreground/60 text-xs`}>
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              Loading more matches…
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
