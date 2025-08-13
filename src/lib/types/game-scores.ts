import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type GameScore = Database['public']['Tables']['game_scores']['Row'];
export type GameScoreInsert = Database['public']['Tables']['game_scores']['Insert'];
export type GameScoreUpdate = Database['public']['Tables']['game_scores']['Update'];
export type GameScoreDetailedView = Database['public']['Views']['game_scores_detailed']['Row'];

export interface GameScoreSearchFilters {
  games_id?: string;
  match_participants_id?: string;
  score?: number;
  score_range?: {
    min?: number;
    max?: number;
  };
  // Game-related filters
  match_id?: string;
  game_number?: number;
  // Participant-related filters
  schools_teams_id?: string;
  matches_id?: string;
  placement?: number;
  // Team/School-related filters
  team_name?: string;
  school_name?: string;
  sport_name?: string;
  season_number?: number;
}

export type GameScorePaginationOptions = PaginationOptions<
  GameScoreSearchFilters & Record<string, FilterValue>
>;
