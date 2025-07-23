import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type SportsSeasonsStage = Database['public']['Tables']['sports_seasons_stages']['Row'];
export type SportsSeasonsStageInsert =
  Database['public']['Tables']['sports_seasons_stages']['Insert'];
export type SportsSeasonsStageUpdate =
  Database['public']['Tables']['sports_seasons_stages']['Update'];

export type CompetitionStage = Database['public']['Enums']['competition_stage'];

export interface SportsSeasonsStageSearchFilters {
  sports_id?: string;
  seasons_id?: string;
  competition_stage?: CompetitionStage | CompetitionStage[];
  sport_name?: string;
  season_number?: number;
  created_at?: string;
  updated_at?: string;
  date_range?: {
    start?: string;
    end?: string;
  };
}

export type SportsSeasonsStagesPaginationOptions = PaginationOptions<
  SportsSeasonsStageSearchFilters & Record<string, FilterValue>
>;
