import { formatInTimeZone } from 'date-fns-tz';
import type { StandingLine } from '@/lib/types/standings';

export const POINTS_PER_WIN = 3;

const STANDINGS_STAGES = new Set(['eliminationround', 'elimination', 'groupstage', 'roundrobin']);

/** Round-robin stages feed the standings; play-ins, knockouts and finals do not. */
export function isStandingsStage(competitionStage: string): boolean {
  return STANDINGS_STAGES.has(competitionStage.toLowerCase().replace(/[^a-z]/g, ''));
}

/** Calendar day (YYYY-MM-DD) of an instant in Manila, where every CESAFI game is played. */
export function manilaDate(iso: string): string {
  return formatInTimeZone(iso, 'Asia/Manila', 'yyyy-MM-dd');
}

export interface StandingsMatch {
  scheduledAt: string | null;
  participants: { teamId: string; score: number | null }[];
}

const addResult = (tally: Map<string, StandingLine>, teamId: string, won: boolean, pointDiff: number) => {
  const line = tally.get(teamId) ?? { wins: 0, losses: 0, pointDiff: 0 };
  tally.set(teamId, {
    wins: line.wins + (won ? 1 : 0),
    losses: line.losses + (won ? 0 : 1),
    pointDiff: line.pointDiff + pointDiff
  });
};

/**
 * Adds up finished matches per team. Matches dated on or before `countedThrough` (Manila day) are
 * already in the starting records and are skipped, as are matches without exactly two teams, a
 * missing score, or a tie (which includes 0-0 before scores are entered).
 */
export function tallyMatches(matches: StandingsMatch[], countedThrough: string | null): Map<string, StandingLine> {
  const tally = new Map<string, StandingLine>();

  for (const { scheduledAt, participants } of matches) {
    if (countedThrough && scheduledAt && manilaDate(scheduledAt) <= countedThrough) continue;
    if (participants.length !== 2) continue;

    const [a, b] = participants;
    if (a.score === null || b.score === null || a.score === b.score) continue;

    const diff = a.score - b.score;
    addResult(tally, a.teamId, diff > 0, diff);
    addResult(tally, b.teamId, diff < 0, -diff);
  }

  return tally;
}

interface RankableStanding {
  wins: number;
  losses: number;
  pointDiff: number;
  points: number;
  teamName: string;
  school: { name: string };
}

/**
 * Ranks one category: most points, then fewest losses, then best +/-, then school and team name.
 * Every team gets its own position (1…n). When nobody has played, ranks are null.
 */
export function rankStandings<T extends RankableStanding>(
  rows: T[]
): { teams: (T & { rank: number | null })[]; hasResults: boolean } {
  const hasResults = rows.some((r) => r.wins + r.losses > 0);
  const sorted = [...rows].sort(
    (a, b) =>
      b.points - a.points ||
      a.losses - b.losses ||
      b.pointDiff - a.pointDiff ||
      a.school.name.localeCompare(b.school.name) ||
      a.teamName.localeCompare(b.teamName)
  );

  return { teams: sorted.map((team, i) => ({ ...team, rank: hasResults ? i + 1 : null })), hasResults };
}

/** +100, −1 (true minus sign), 0 */
export function formatPointDiff(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${Math.abs(value)}`;
  return '0';
}
