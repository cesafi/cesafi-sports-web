// @ts-nocheck
'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { InfiniteSchedule } from '@/components/schedule';
import OngoingUpcomingShowcase from './ongoing-upcoming-showcase';
import ScheduleCalendarView from './schedule-calendar-view';
import { ScheduleMatch } from '@/lib/types/matches';
import { useInfiniteSchedule } from '@/hooks/use-schedule';
import { Season } from '@/lib/types/seasons';
import { sportsSeasonStageWithDetails } from '@/lib/types/sports-seasons-stages';
import type { RichSportCategory } from './schedule-filter-bar';

interface ScheduleContentProps {
  initialMatches: ScheduleMatch[];
  initialHasMorePast?: boolean;
  initialHasMoreFuture?: boolean;
  initialPastCursor?: string | null;
  initialFutureCursor?: string | null;
  availableCategories: RichSportCategory[];
  availableSeasons: Season[];
  availableStages: sportsSeasonStageWithDetails[];
  availableSchools?: any[];
}

export default function ScheduleContent({ 
  initialMatches, 
  initialHasMorePast = true,
  initialHasMoreFuture = false,
  initialPastCursor = null,
  initialFutureCursor = null,
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

  const handleScrollToDate = useCallback((dateStr: string) => {
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
    direction: 'future',
    filters: {
      sport_id: sportIdFilter,
      division: divisionFilter,
      season_id: seasonIdFilter,
      stage_name: stageNameFilter,
      school_id: schoolIdFilter,
      status: statusFilter
    }
  });

  const matches = data?.matches || [];

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

  // Check if any filters are applied
  const isFiltersApplied = selectedSport !== 'all' || 
    selectedDivision !== 'all' || 
    selectedSeason !== 'all' || 
    selectedStage !== 'all' || 
    selectedSchool !== 'all' ||
    selectedStatus !== 'all';

  // Use server-side initial data if client-side data is not ready yet
  const displayMatches = useMemo(() => {
    if (matches.length > 0) {
      return matches;
    }
    
    if (isFiltersApplied) {
      return initialMatches.filter((match) => {
        // Season filter
        if (selectedSeason !== 'all') {
          const matchSeasonId = match.sports_seasons_stages?.season_id;
          if (!matchSeasonId || matchSeasonId.toString() !== selectedSeason) {
            return false;
          }
        }
        
        // Sport filter
        if (selectedSport !== 'all') {
          const matchSportId = match.sports_seasons_stages?.sports_categories?.sports?.id;
          if (!matchSportId || matchSportId.toString() !== selectedSport) {
            return false;
          }
        }
        
        // Division filter
        if (selectedDivision !== 'all') {
          const matchDivision = match.sports_seasons_stages?.sports_categories?.division;
          if (!matchDivision || matchDivision !== selectedDivision) {
            return false;
          }
        }
        
        // Stage filter
        if (selectedStage !== 'all') {
          const matchStageName = match.sports_seasons_stages?.competition_stage;
          if (!matchStageName || matchStageName !== selectedStage) {
            return false;
          }
        }
        
        // School filter
        if (selectedSchool !== 'all') {
          const matchHasSchool = match.match_participants?.some(p => 
            p.schools_teams?.school?.id?.toString() === selectedSchool ||
            p.schools_teams?.school?.abbreviation === selectedSchool
          );
          if (!matchHasSchool) {
            return false;
          }
        }

        // Status filter
        if (selectedStatus !== 'all') {
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
    }
    
    return initialMatches;
  }, [matches, initialMatches, isFiltersApplied, selectedSeason, selectedSport, selectedDivision, selectedStage, selectedSchool, selectedStatus]);

  return (
    <div className="flex h-full w-full min-w-0 flex-col space-y-6">
      {/* Top Section: Immediate Ongoing / Next Match Showcase (Full Width) */}
      <OngoingUpcomingShowcase
        matches={displayMatches}
        onSelectDate={handleScrollToDate}
      />

      {/* Maximized Monthly Calendar View (Full Width) */}
      <ScheduleCalendarView
        matches={displayMatches}
        onSelectDate={handleScrollToDate}
      />

      {/* Infinite Match Feed with Sticky Filter Toolbar */}
      <div className="flex-shrink-0 w-full">
        <InfiniteSchedule
          matches={displayMatches}
          onLoadMore={handleLoadMore}
          hasMoreFuture={data ? hasNextPage : initialHasMoreFuture}
          hasMorePast={data ? hasPreviousPage : initialHasMorePast}
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
