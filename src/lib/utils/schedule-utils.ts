/**
 * Utility functions for the schedule feature
 */

import { ScheduleMatch } from '@/lib/types/matches';

/**
 * Format a date for display in the schedule
 */
export function formatScheduleDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateKey = dateObj.toISOString().split('T')[0];
  const todayKey = today.toISOString().split('T')[0];
  const tomorrowKey = tomorrow.toISOString().split('T')[0];
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  if (dateKey === todayKey) {
    return 'Today';
  } else if (dateKey === tomorrowKey) {
    return 'Tomorrow';
  } else if (dateKey === yesterdayKey) {
    return 'Yesterday';
  } else {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }
}

/**
 * Format time for display in the schedule
 */
export function formatScheduleTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Group matches by date for the schedule view
 */
export function groupMatchesByDate(matches: ScheduleMatch[]): Record<string, ScheduleMatch[]> {
  const grouped: Record<string, ScheduleMatch[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  matches.forEach(match => {
    if (match.scheduled_at) {
      const matchDate = new Date(match.scheduled_at);
      const dateKey = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      // Add display properties
      const displayMatch: ScheduleMatch = {
        ...match,
        displayDate: dateKey,
        displayTime: formatScheduleTime(matchDate),
        isToday: dateKey === today.toISOString().split('T')[0],
        isPast: matchDate < now,
        isUpcoming: matchDate > now
      };
      
      grouped[dateKey].push(displayMatch);
    }
  });

  // Sort matches within each date group by time
  Object.keys(grouped).forEach(dateKey => {
    grouped[dateKey].sort((a, b) => {
      if (!a.scheduled_at || !b.scheduled_at) return 0;
      return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
    });
  });

  return grouped;
}

/**
 * Sort date keys chronologically
 */
export function sortDateKeys(dateKeys: string[]): string[] {
  return dateKeys.sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
}

/**
 * Get the current date as a cursor for pagination
 */
export function getCurrentDateCursor(): string {
  return new Date().toISOString();
}

/**
 * Check if a match is happening today
 */
export function isMatchToday(match: ScheduleMatch): boolean {
  if (!match.scheduled_at) return false;
  const matchDate = new Date(match.scheduled_at);
  const today = new Date();
  return matchDate.toDateString() === today.toDateString();
}

/**
 * Check if a match is happening this week
 */
export function isMatchThisWeek(match: ScheduleMatch): boolean {
  if (!match.scheduled_at) return false;
  const matchDate = new Date(match.scheduled_at);
  const today = new Date();
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);
  
  return matchDate >= today && matchDate <= weekFromNow;
}

/**
 * Get the status color for a match
 */
export function getMatchStatusColor(match: ScheduleMatch): string {
  if (match.status === 'finished') return 'text-green-600';
  if (match.status === 'ongoing') return 'text-blue-600';
  if (match.status === 'cancelled') return 'text-red-600';
  if (match.isPast) return 'text-gray-500';
  return 'text-gray-900';
}

/**
 * Format the sport and category information for display
 */
export function formatSportInfo(match: ScheduleMatch): string {
  const sport = match.sports_seasons_stages?.sports_categories?.sports?.name || 'Unknown Sport';
  const category = match.sports_seasons_stages?.sports_categories?.levels || '';
  const stage = match.sports_seasons_stages?.competition_stage || '';
  
  let result = sport;
  if (category) result += ` - ${category}`;
  if (stage) result += ` (${stage})`;
  
  return result;
}

/**
 * Get the best of format for display
 */
export function formatBestOf(match: ScheduleMatch): string {
  if (!match.best_of || match.best_of <= 1) return 'Single Game';
  return `Best of ${match.best_of}`;
}
