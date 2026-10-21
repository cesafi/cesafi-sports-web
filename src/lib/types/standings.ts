// Team standings: manual season win/loss totals, ranked per category

export interface RankedTeamStanding {
  teamId: string;
  teamName: string;
  school: { id: string; name: string; abbreviation: string; logoUrl: string | null };
  wins: number;
  losses: number;
  /** null when the category has no results yet */
  rank: number | null;
  /** null = no record saved yet (shown as 0-0) */
  updatedAt: string | null;
}

export interface CategoryStandings {
  category: { id: number; sportName: string; division: string; levels: string; name: string };
  /** false when every team is 0-0 */
  hasResults: boolean;
  teams: RankedTeamStanding[];
}

export interface SeasonStandings {
  seasonId: number;
  categories: CategoryStandings[];
}

export interface SavedTeamStanding {
  teamId: string;
  wins: number;
  losses: number;
  updatedAt: string;
}

export type StandingsSortKey = 'rank' | 'school' | 'wins' | 'losses';

export type StandingsErrorCode =
  | 'VALIDATION'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'SERVER';

export type StandingsFieldErrors = Partial<Record<'teamId' | 'wins' | 'losses', string[]>>;

export type StandingsResult<T> =
  | { success: true; data: T }
  | { success: false; code: StandingsErrorCode; error: string; fieldErrors?: StandingsFieldErrors };
