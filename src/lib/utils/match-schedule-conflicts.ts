// Matches have no stored duration; when end_at is missing we assume this length.
export const DEFAULT_MATCH_DURATION_MINUTES = 30;

export interface ScheduledMatchSlot {
  id?: number;
  name?: string;
  venue: string | null;
  scheduled_at: string | null;
  end_at?: string | null;
  team_ids: string[];
}

export interface MatchScheduleConflict {
  match: ScheduledMatchSlot;
  reasons: ('venue' | 'team')[];
}

export function getMatchInterval(slot: Pick<ScheduledMatchSlot, 'scheduled_at' | 'end_at'>) {
  if (!slot.scheduled_at) return null;
  const start = new Date(slot.scheduled_at).getTime();
  const end = slot.end_at ? new Date(slot.end_at).getTime() : NaN;
  return {
    start,
    end: end > start ? end : start + DEFAULT_MATCH_DURATION_MINUTES * 60000
  };
}

const normalizeVenue = (venue: string | null) => venue?.trim().toLowerCase() ?? '';

export function findMatchScheduleConflicts(
  target: ScheduledMatchSlot,
  existing: ScheduledMatchSlot[]
): MatchScheduleConflict[] {
  const targetInterval = getMatchInterval(target);
  if (!targetInterval) return [];

  const targetVenue = normalizeVenue(target.venue);
  const targetTeams = new Set(target.team_ids);
  const conflicts: MatchScheduleConflict[] = [];

  for (const match of existing) {
    if (target.id !== undefined && match.id === target.id) continue;

    const interval = getMatchInterval(match);
    if (!interval) continue;
    if (!(interval.start < targetInterval.end && interval.end > targetInterval.start)) continue;

    const reasons: MatchScheduleConflict['reasons'] = [];
    if (targetVenue && normalizeVenue(match.venue) === targetVenue) reasons.push('venue');
    if (match.team_ids.some((teamId) => targetTeams.has(teamId))) reasons.push('team');

    if (reasons.length > 0) conflicts.push({ match, reasons });
  }

  return conflicts;
}

export function formatMatchScheduleConflicts(conflicts: MatchScheduleConflict[]) {
  const details = conflicts
    .map(({ match, reasons }) => {
      const why = reasons.map((r) => (r === 'venue' ? 'same venue' : 'same team')).join(' & ');
      return `${match.name ?? `Match #${match.id}`} (${why})`;
    })
    .join(', ');
  return `Match scheduling conflict detected with: ${details}`;
}
