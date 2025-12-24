import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

// Base standings entry for a team
export interface StandingsEntry {
  team_id: string;
  team_name: string;
  school_name: string;
  school_abbreviation: string;
  school_logo_url: string | null;

  // Match statistics
  matches_played: number;
  wins: number;
  losses: number;
  draws: number;

  // Scoring statistics
  goals_for: number;
  goals_against: number;
  goal_difference: number;

  // Points and position
  points: number;
  position: number;
}

// Group stage standings (table format)
export interface GroupStageStandings {
  stage_id: number;
  stage_name: string;
  competition_stage: Database['public']['Enums']['competition_stage'];
  groups: GroupStanding[];
}

export interface GroupStanding {
  group_name?: string; // For when there are multiple groups
  teams: StandingsEntry[];
}

// Bracket/Tournament standings
export interface BracketStandings {
  stage_id: number;
  stage_name: string;
  competition_stage: Database['public']['Enums']['competition_stage'];
  bracket: BracketMatch[];
}

// Play-ins standings (simple list of matches)
export interface PlayinsStandings {
  stage_id: number;
  stage_name: string;
  competition_stage: Database['public']['Enums']['competition_stage'];
  matches: PlayinsMatch[];
}

export interface PlayinsMatch {
  match_id: number;
  match_name: string;
  team1: BracketTeam | null;
  team2: BracketTeam | null;
  winner: BracketTeam | null;
  match_status: Database['public']['Enums']['match_status'];
  scheduled_at: string | null;
  venue: string;
  round?: number; // Optional for playins
}

export interface BracketMatch {
  match_id: number;
  match_name: string;
  round: number;
  position: number;
  team1: BracketTeam | null;
  team2: BracketTeam | null;
  winner: BracketTeam | null;
  match_status: Database['public']['Enums']['match_status'];
  scheduled_at: string | null;
  venue: string;
}

export interface BracketTeam {
  team_id: string;
  team_name: string;
  school_name: string;
  school_abbreviation: string;
  school_logo_url: string | null;
  score: number | null;
}

// Navigation structure types
export interface StandingsNavigation {
  season: {
    id: number;
    name: string;
    start_at: string;
    end_at: string;
  };
  sport: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    division: Database['public']['Enums']['sport_divisions'];
    levels: Database['public']['Enums']['sport_levels'];
    display_name: string;
  };
  stages: StandingsStage[];
}

export interface StandingsStage {
  id: number;
  name: string;
  competition_stage: Database['public']['Enums']['competition_stage'];
  order: number;
}

// Combined standings response
export type StandingsData = GroupStageStandings | BracketStandings | PlayinsStandings;

// Filter and pagination types
export interface StandingsFilters {
  season_id?: number;
  sport_id?: number;
  sport_category_id?: number;
  stage_id?: number;
  competition_stage?: Database['public']['Enums']['competition_stage'];
}

export type StandingsPaginationOptions = PaginationOptions<
  StandingsFilters & Record<string, FilterValue>
>;

// Service response types
export interface StandingsResponse {
  navigation: StandingsNavigation;
  standings: StandingsData;
}

// Component props types
export interface StandingsPageProps {
  season_id?: string;
  sport_id?: string;
  category_id?: string;
  stage_id?: string;
}

export interface GroupStageTableProps {
  standings: GroupStageStandings;
  loading?: boolean;
}

export interface BracketVisualizationProps {
  standings: BracketStandings;
  loading?: boolean;
}

// Navigation component props
export interface StandingsNavigationProps {
  navigation: StandingsNavigation;
  currentStage?: number;
  onStageChange: (stageId: number) => void;
}
