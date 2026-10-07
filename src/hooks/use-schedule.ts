// @ts-nocheck
/**
 * Specialized hook for the schedule feature
 * Provides infinite scrolling, date grouping, and filtering capabilities
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSeason } from '@/components/contexts/season-provider';
import { getScheduleMatches, getScheduleMatchesAroundDate, getScheduleMatchesByDate } from '@/actions/matches';
import { ScheduleFilters, ScheduleMatch, SchedulePaginationOptions } from '@/lib/types/matches';
import {
  getNextSchedulePageParam,
  getPreviousSchedulePageParam,
  SchedulePage,
  SchedulePageParam
} from '@/lib/utils/schedule-pagination';

export const scheduleKeys = {
  all: ['schedule'] as const,
  infinite: (options: SchedulePaginationOptions) =>
    [...scheduleKeys.all, 'infinite', options] as const,
  range: (range: { from: string; to: string }) => [...scheduleKeys.all, 'range', range] as const,
  byDate: (filters: ScheduleFilters) => [...scheduleKeys.all, 'byDate', filters] as const
};

/**
 * Hook for infinite scrolling schedule matches
 * Follows LOL sports pattern: the first page straddles today, scroll down for future, scroll up for past
 */
export function useInfiniteSchedule(
  options: {
    limit?: number;
    initialLimit?: number;
    referenceDate: string;
    filters?: ScheduleFilters;
    initialPage?: SchedulePage;
  }
) {
  const { limit = 20, initialLimit = 50, referenceDate, filters = {}, initialPage } = options;

  return useInfiniteQuery({
    queryKey: scheduleKeys.infinite({ limit, cursor: referenceDate, filters }),
    queryFn: async ({ pageParam }): Promise<SchedulePage | undefined> => {
      if (pageParam.direction === 'around') {
        const res = await getScheduleMatchesAroundDate({
          totalLimit: initialLimit,
          referenceDate: pageParam.cursor,
          filters
        });
        if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch schedule matches.');
        return toAroundPage(res.data);
      }

      const res = await getScheduleMatches({
        cursor: pageParam.cursor,
        limit,
        direction: pageParam.direction,
        filters
      });
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch schedule matches.');
      return { ...res.data, direction: pageParam.direction } as SchedulePage;
    },
    initialPageParam: { direction: 'around', cursor: referenceDate } as SchedulePageParam,
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [{ direction: 'around', cursor: referenceDate } as SchedulePageParam] }
      : undefined,
    getNextPageParam: (lastPage) => getNextSchedulePageParam(lastPage),
    getPreviousPageParam: (firstPage) => getPreviousSchedulePageParam(firstPage),
    select: (data) => {
      // Keep chronological order (past pages come back newest-first) and dedupe by id
      const seen = new Set<number>();
      const matches = data.pages
        .flatMap((page) => page?.matches ?? [])
        .filter((match) => {
          if (seen.has(match.id)) return false;
          seen.add(match.id);
          return true;
        })
        .sort((a, b) => new Date(a.scheduled_at ?? 0).getTime() - new Date(b.scheduled_at ?? 0).getTime());

      return { pages: data.pages, pageParams: data.pageParams, matches };
    }
  });
}

export function toAroundPage(data: {
  matches: ScheduleMatch[];
  hasMorePast: boolean;
  hasMoreFuture: boolean;
  pastCursor: string | null;
  futureCursor: string | null;
}): SchedulePage {
  return {
    matches: data.matches,
    direction: 'around',
    hasMore: data.hasMorePast || data.hasMoreFuture,
    nextCursor: data.futureCursor,
    prevCursor: data.pastCursor,
    hasMorePast: data.hasMorePast,
    hasMoreFuture: data.hasMoreFuture,
    pastCursor: data.pastCursor,
    futureCursor: data.futureCursor
  };
}

/**
 * Hook for every match in a date range (the calendar's visible month or week).
 * Independent of the infinite feed so the calendar never depends on how far the list has been scrolled.
 */
export function useScheduleRange(range: { from: string; to: string }) {
  return useQuery({
    queryKey: scheduleKeys.range(range),
    queryFn: async () => {
      const res = await getScheduleMatchesByDate({ date_from: range.from, date_to: range.to });
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch schedule matches.');
      return res.data.sortedDateKeys.flatMap((key) => res.data.groupedMatches[key]);
    },
    placeholderData: (previous) => previous
  });
}

/**
 * Hook for getting schedule matches grouped by date
 * Useful for calendar-style views
 */
export function useScheduleByDate(filters: ScheduleFilters = {}) {
  const { currentSeason } = useSeason();

  // Merge season filter with provided filters - memoized to prevent unnecessary re-renders
  const mergedFilters: ScheduleFilters = useMemo(() => ({
    ...filters,
    season_id: filters.season_id || currentSeason?.id
  }), [filters, currentSeason?.id]);

  return useQuery({
    queryKey: scheduleKeys.byDate(mergedFilters),
    queryFn: () => getScheduleMatchesByDate(mergedFilters),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch schedule matches by date.');
      }

      // The service already returns grouped data
      return data.data;
    },
    enabled: !!currentSeason
  });
}

/**
 * Hook for getting upcoming matches (next N matches)
 */
export function useUpcomingMatches(limit: number = 5, filters: ScheduleFilters = {}) {
  const { currentSeason } = useSeason();

  const mergedFilters: ScheduleFilters = useMemo(() => ({
    ...filters,
    season_id: filters.season_id || currentSeason?.id
  }), [filters, currentSeason?.id]);

  return useQuery({
    queryKey: [...scheduleKeys.all, 'upcoming', limit, mergedFilters],
    queryFn: () =>
      getScheduleMatches({
        limit,
        direction: 'future',
        filters: mergedFilters
      }),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch upcoming matches.');
      }
      return data.data.matches;
    },
    enabled: !!currentSeason
  });
}

/**
 * Hook for getting recent matches (last N matches)
 */
export function useRecentMatches(limit: number = 5, filters: ScheduleFilters = {}) {
  const { currentSeason } = useSeason();

  const mergedFilters: ScheduleFilters = useMemo(() => ({
    ...filters,
    season_id: filters.season_id || currentSeason?.id
  }), [filters, currentSeason?.id]);

  return useQuery({
    queryKey: [...scheduleKeys.all, 'recent', limit, mergedFilters],
    queryFn: () =>
      getScheduleMatches({
        limit,
        direction: 'past',
        filters: mergedFilters
      }),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch recent matches.');
      }
      return data.data.matches;
    },
    enabled: !!currentSeason
  });
}

/**
 * Hook for getting today's matches
 */
export function useTodayMatches(filters: ScheduleFilters = {}) {
  const { currentSeason } = useSeason();
  const today = new Date().toISOString().split('T')[0];

  const mergedFilters: ScheduleFilters = useMemo(() => ({
    ...filters,
    season_id: filters.season_id || currentSeason?.id,
    date_from: today,
    date_to: today
  }), [filters, currentSeason?.id, today]);

  return useQuery({
    queryKey: [...scheduleKeys.all, 'today', mergedFilters],
    queryFn: () =>
      getScheduleMatches({
        limit: 50, // Large limit to get all today's matches
        direction: 'future',
        filters: mergedFilters
      }),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch today's matches.");
      }
      return data.data.matches;
    },
    enabled: !!currentSeason
  });
}

/**
 * Hook for getting this week's matches
 */
export function useThisWeekMatches(filters: ScheduleFilters = {}) {
  const { currentSeason } = useSeason();

  const today = useMemo(() => new Date(), []);
  const endOfWeek = useMemo(() => {
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7);
    return endDate;
  }, [today]);

  const mergedFilters: ScheduleFilters = useMemo(() => ({
    ...filters,
    season_id: filters.season_id || currentSeason?.id,
    date_from: today.toISOString(),
    date_to: endOfWeek.toISOString()
  }), [filters, currentSeason?.id, today, endOfWeek]);

  return useQuery({
    queryKey: [...scheduleKeys.all, 'thisWeek', mergedFilters],
    queryFn: () =>
      getScheduleMatches({
        limit: 100, // Large limit to get all week's matches
        direction: 'future',
        filters: mergedFilters
      }),
    select: (data) => {
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch this week's matches.");
      }
      return data.data.matches;
    },
    enabled: !!currentSeason
  });
}
