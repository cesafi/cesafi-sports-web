// Team standings: admin-edited starting records plus finished matches, ranked per category

export interface StandingLine {
  wins: number;
  losses: number;
  pointDiff: number;
}

export interface RankedTeamStanding {
  teamId: string;
  teamName: string;
  school: { id: string; name: string; abbreviation: string; logoUrl: string | null };
  /** Admin-edited starting record (0-0, 0 when none saved) */
  starting: StandingLine;
  /** Finished matches after the category cut-off */
  fromMatches: StandingLine;
  /** Totals: starting + fromMatches */
  wins: number;
  losses: number;
  pointDiff: number;
  /** 3 × wins */
  points: number;
  /** 1…n; null when nobody in the category has played */
  rank: number | null;
  /** Version of the starting record; null = none saved yet */
  updatedAt: string | null;
}

export interface CategoryStandings {
  category: { id: number; sportName: string; division: string; levels: string; name: string };
  /** YYYY-MM-DD; null = every finished match counts */
  countedThrough: string | null;
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
  pointDiff: number;
  updatedAt: string;
}

export interface SavedStandingsCutoff {
  seasonId: number;
  sportCategoryId: number;
  countedThrough: string | null;
}

export type StandingsSortKey = 'rank' | 'school' | 'wins' | 'losses';

export type StandingsErrorCode =
  | 'VALIDATION'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'SERVER';

export type StandingsFieldErrors = Partial<
  Record<'teamId' | 'wins' | 'losses' | 'pointDiff' | 'countedThrough', string[]>
>;

export type StandingsResult<T> =
  | { success: true; data: T }
  | { success: false; code: StandingsErrorCode; error: string; fieldErrors?: StandingsFieldErrors };
