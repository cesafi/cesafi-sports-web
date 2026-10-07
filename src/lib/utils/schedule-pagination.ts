import { endOfDay, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';
import { ScheduleMatch } from '@/lib/types/matches';

/**
 * 'around' is the first page: matches on both sides of a reference date (today).
 * Encoding the direction in the param keeps refetches correct, since React Query
 * replays stored pageParams rather than the direction a page was originally fetched in.
 */
export type SchedulePageDirection = 'around' | 'future' | 'past';

export interface SchedulePageParam {
  direction: SchedulePageDirection;
  cursor: string;
}

export interface SchedulePage {
  matches: ScheduleMatch[];
  direction: SchedulePageDirection;
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
  // Only set on 'around' pages
  hasMorePast?: boolean;
  hasMoreFuture?: boolean;
  pastCursor?: string | null;
  futureCursor?: string | null;
}

export function getNextSchedulePageParam(page: SchedulePage | undefined): SchedulePageParam | undefined {
  if (!page) return undefined;

  if (page.direction === 'around') {
    return page.hasMoreFuture && page.futureCursor ? { direction: 'future', cursor: page.futureCursor } : undefined;
  }
  if (page.direction === 'future') {
    return page.hasMore && page.nextCursor ? { direction: 'future', cursor: page.nextCursor } : undefined;
  }
  return undefined;
}

export function getPreviousSchedulePageParam(page: SchedulePage | undefined): SchedulePageParam | undefined {
  if (!page) return undefined;

  if (page.direction === 'around') {
    return page.hasMorePast && page.pastCursor ? { direction: 'past', cursor: page.pastCursor } : undefined;
  }
  if (page.direction === 'past') {
    // Past pages are ordered newest-first; prevCursor is the oldest match in the slice
    return page.hasMore && page.prevCursor ? { direction: 'past', cursor: page.prevCursor } : undefined;
  }
  return undefined;
}

/** Local-time bounds of what the calendar shows: the whole month, or the Sunday–Saturday week. */
export function getCalendarRange(anchor: Date, viewMode: 'month' | 'week'): { from: string; to: string } {
  const start = viewMode === 'week' ? startOfWeek(anchor, { weekStartsOn: 0 }) : startOfMonth(anchor);
  const end = viewMode === 'week' ? endOfWeek(anchor, { weekStartsOn: 0 }) : endOfMonth(anchor);
  return { from: start.toISOString(), to: endOfDay(end).toISOString() };
}

export interface ScheduleFilterSelection {
  season: string;
  sport: string;
  division: string;
  stage: string;
  school: string;
  status: string;
}

export function matchesScheduleFilters(match: ScheduleMatch, filters: ScheduleFilterSelection): boolean {
  const stage = match.sports_seasons_stages;
  const category = stage?.sports_categories;

  if (filters.season !== 'all' && stage?.season_id?.toString() !== filters.season) return false;
  if (filters.sport !== 'all' && category?.sports?.id?.toString() !== filters.sport) return false;
  if (filters.division !== 'all' && category?.division !== filters.division) return false;
  if (filters.stage !== 'all' && stage?.competition_stage !== filters.stage) return false;

  if (filters.school !== 'all') {
    const hasSchool = match.match_participants?.some(
      (p) =>
        p.schools_teams?.school?.id?.toString() === filters.school ||
        p.schools_teams?.school?.abbreviation === filters.school
    );
    if (!hasSchool) return false;
  }

  if (filters.status !== 'all') {
    // Widened to string: legacy rows/aliases ('live', 'canceled', 'completed') sit outside the enum
    const status: string | null = match.status;
    switch (filters.status) {
      case 'live':
        return status === 'live' || status === 'ongoing';
      case 'cancelled':
        return status === 'cancelled' || status === 'canceled';
      case 'finished':
        return status === 'finished' || status === 'completed';
      case 'rescheduled':
      case 'upcoming':
        return status === filters.status;
    }
  }

  return true;
}
