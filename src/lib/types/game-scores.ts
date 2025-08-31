import { Database } from '../../../database.types';
import { FilterValue, PaginationOptions } from './base';

export type GameScore = Database['public']['Tables']['game_scores']['Row'];
export type GameScoreInsert = Database['public']['Tables']['game_scores']['Insert'];
export type GameScoreUpdate = Database['public']['Tables']['game_scores']['Update'];

export interface GameScoreDetailedView extends GameScore {
  [key: string]: unknown;
}

export interface GameScoreSearchFilters {
  match_id?: number;
  game_number?: number;
  match_participant_id?: number;
  score?: number;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type GameScorePaginationOptions = PaginationOptions<
  GameScoreSearchFilters & Record<string, FilterValue>
>;
