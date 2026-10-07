// @ts-nocheck
'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { InfiniteSchedule } from '@/components/schedule';
import OngoingUpcomingShowcase from './ongoing-upcoming-showcase';
import ScheduleCalendarView from './schedule-calendar-view';
import { ScheduleMatch } from '@/lib/types/matches';
import { toAroundPage, useInfiniteSchedule, useScheduleRange } from '@/hooks/use-schedule';
import { getCalendarRange, matchesScheduleFilters } from '@/lib/utils/schedule-pagination';
import { Season } from '@/lib/types/seasons';
import { sportsSeasonStageWithDetails } from '@/lib/types/sports-seasons-stages';
import type { RichSportCategory } from './schedule-filter-bar';

interface ScheduleContentProps {
  initialSchedule: {
    matches: ScheduleMatch[];
    hasMorePast: boolean;
    hasMoreFuture: boolean;
    pastCursor: string | null;
    futureCursor: string | null;
    referenceDate: string;
  } | null;
  availableCategories: RichSportCategory[];
  availableSeasons: Season[];
  availableStages: sportsSeasonStageWithDetails[];
  availableSchools?: any[];
}

export default function ScheduleContent({
  initialSchedule,
  availableCategories,
  availableSeasons,
  availableStages,
  availableSchools = []
}: ScheduleContentProps) {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Callback ref for scrolling to a specific date from Calendar / Showcase
  const scrollToDateRef = useRef<((dateStr: string) => void) | null>(null);

  const handleRegisterScrollToDate = useCallback((fn: (dateStr: string) => void) => {
    scrollToDateRef.current = fn;
  }, []);

  const scrollFeedToDate = useCallback((dateStr: string) => {
    if (scrollToDateRef.current) {
      scrollToDateRef.current(dateStr);
    } else {
      const element = document.getElementById(`date-group-${dateStr}`);
      if (element) {
        const headerOffset = 180;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  }, []);

  // A date picked on the calendar may not be loaded in the feed yet; page the feed toward it, then scroll
  const [pendingScrollDate, setPendingScrollDate] = useState<string | null>(null);

  const handleScrollToDate = useCallback((dateStr: string) => {
    if (document.getElementById(`date-group-${dateStr}`)) {
      scrollFeedToDate(dateStr);
    } else {
      setPendingScrollDate(dateStr);
    }
  }, [scrollFeedToDate]);

  // Derive IDs for query
  const sportIdFilter = useMemo(() => {
    return selectedSport === 'all' ? undefined : parseInt(selectedSport);
  }, [selectedSport]);

  const divisionFilter = useMemo(() => {
    return selectedDivision === 'all' ? undefined : selectedDivision;
  }, [selectedDivision]);

  const seasonIdFilter = useMemo(() => {
    return selectedSeason === 'all' ? undefined : parseInt(selectedSeason);
  }, [selectedSeason]);

  const stageNameFilter = useMemo(() => {
    return selectedStage === 'all' ? undefined : selectedStage;
  }, [selectedStage]);

  const schoolIdFilter = useMemo(() => {
    return selectedSchool === 'all' ? undefined : selectedSchool;
  }, [selectedSchool]);

  const statusFilter = useMemo(() => {
    return selectedStatus === 'all' ? undefined : selectedStatus;
  }, [selectedStatus]);

  const isFiltersApplied = selectedSport !== 'all' ||
    selectedDivision !== 'all' ||
    selectedSeason !== 'all' ||
    selectedStage !== 'all' ||
    selectedSchool !== 'all' ||
    selectedStatus !== 'all';

  const filterSelection = useMemo(() => ({
    season: selectedSeason,
    sport: selectedSport,
    division: selectedDivision,
    stage: selectedStage,
    school: selectedSchool,
    status: selectedStatus
  }), [selectedSeason, selectedSport, selectedDivision, selectedStage, selectedSchool, selectedStatus]);

  // Anchor the feed on the same "today" the server used, so its pre-rendered page can seed the query
  const [referenceDate] = useState(() => initialSchedule?.referenceDate ?? new Date().toISOString());
  const initialPage = useMemo(() => (initialSchedule ? toAroundPage(initialSchedule) : undefined), [initialSchedule]);

  // Use the infinite schedule hook for client-side data fetching
  const {
    data,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    error: _error
  } = useInfiniteSchedule({
    limit: 10,
    referenceDate,
    initialPage: isFiltersApplied ? undefined : initialPage,
    filters: {
      sport_id: sportIdFilter,
      division: divisionFilter,
      season_id: seasonIdFilter,
      stage_name: stageNameFilter,
      school_id: schoolIdFilter,
      status: statusFilter
    }
  });

  // Calendar loads every match in its visible month/week on its own, independent of the feed
  const [calendarRange, setCalendarRange] = useState(() => getCalendarRange(new Date(), 'month'));
  const { data: rangeMatches, isFetching: isCalendarFetching } = useScheduleRange(calendarRange);

  const calendarMatches = useMemo(
    () => (rangeMatches ?? []).filter((match) => matchesScheduleFilters(match, filterSelection)),
    [rangeMatches, filterSelection]
  );

  const [isWaiting, setIsWaiting] = useState(false);

  const handleLoadMore = useCallback(async (direction: 'future' | 'past') => {
    setIsWaiting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (direction === 'future' && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    } else if (direction === 'past' && hasPreviousPage && !isFetchingPreviousPage) {
      fetchPreviousPage();
    }
    setIsWaiting(false);
  }, [hasNextPage, hasPreviousPage, isFetchingNextPage, isFetchingPreviousPage, fetchNextPage, fetchPreviousPage]);

  const handleSportChange = useCallback((esportId: string) => {
    setSelectedSport(esportId);
    setSelectedDivision('all');
    setSelectedStage('all');
  }, []);

  const handleDivisionChange = useCallback((division: string) => {
    setSelectedDivision(division);
    setSelectedStage('all');
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedSport('all');
    setSelectedDivision('all');
    setSelectedSeason('all');
    setSelectedStage('all');
    setSelectedSchool('all');
    setSelectedStatus('all');
  }, []);

  // While a filtered query is loading, show the server-rendered matches that satisfy the filters
  const displayMatches = useMemo(() => {
    if (data) return data.matches;
    const initialMatches = initialSchedule?.matches ?? [];
    return isFiltersApplied
      ? initialMatches.filter((match) => matchesScheduleFilters(match, filterSelection))
      : initialMatches;
  }, [data, initialSchedule, isFiltersApplied, filterSelection]);

  useEffect(() => {
    if (!pendingScrollDate || isFetchingNextPage || isFetchingPreviousPage) return;

    const dateKeys = displayMatches
      .filter((match) => match.scheduled_at)
      .map((match) => {
        const d = new Date(match.scheduled_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      });
    const firstLoaded = dateKeys[0];
    const lastLoaded = dateKeys[dateKeys.length - 1];

    if (lastLoaded && pendingScrollDate > lastLoaded && hasNextPage) {
      fetchNextPage();
    } else if (firstLoaded && pendingScrollDate < firstLoaded && hasPreviousPage) {
      fetchPreviousPage();
    } else {
      // Loaded (or nothing more to load): let the feed render its date groups before scrolling
      const dateStr = pendingScrollDate;
      setPendingScrollDate(null);
      setTimeout(() => scrollFeedToDate(dateStr), 150);
    }
  }, [pendingScrollDate, displayMatches, hasNextPage, hasPreviousPage, isFetchingNextPage, isFetchingPreviousPage, fetchNextPage, fetchPreviousPage, scrollFeedToDate]);

  return (
    <div className="flex h-full w-full min-w-0 flex-col space-y-6">
      {/* Top Section: Immediate Ongoing / Next Match Showcase (Full Width) */}
      <OngoingUpcomingShowcase
        matches={displayMatches}
        onSelectDate={handleScrollToDate}
      />

      {/* Maximized Monthly Calendar View (Full Width) */}
      <ScheduleCalendarView
        matches={calendarMatches}
        isLoading={isCalendarFetching}
        onVisibleRangeChange={setCalendarRange}
        onSelectDate={handleScrollToDate}
      />

      {/* Infinite Match Feed with Sticky Filter Toolbar */}
      <div className="flex-shrink-0 w-full">
        <InfiniteSchedule
          matches={displayMatches}
          onLoadMore={handleLoadMore}
          hasMoreFuture={hasNextPage}
          hasMorePast={hasPreviousPage}
          isLoading={isFetching || isWaiting}
          isFetchingNextPage={isFetchingNextPage || isWaiting}
          isFetchingPreviousPage={isFetchingPreviousPage || isWaiting}
          selectedSportId={selectedSport}
          onSportChange={handleSportChange}
          selectedDivision={selectedDivision}
          onDivisionChange={handleDivisionChange}
          availableRichSports={availableCategories}
          availableSeasons={availableSeasons}
          selectedSeason={selectedSeason}
          onSeasonChange={setSelectedSeason}
          availableStages={availableStages}
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
          availableSchools={availableSchools}
          selectedSchool={selectedSchool}
          onSchoolChange={setSelectedSchool}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onResetFilters={handleResetFilters}
          onRegisterScrollToDate={handleRegisterScrollToDate}
        />
      </div>
    </div>
  );
}
