import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type SportsSeasonsStage = Database['public']['Tables']['sports_seasons_stages']['Row'];
export type SportsSeasonsStageInsert =
  Database['public']['Tables']['sports_seasons_stages']['Insert'];
export type SportsSeasonsStageUpdate =
  Database['public']['Tables']['sports_seasons_stages']['Update'];

export type CompetitionStage = Database['public']['Enums']['competition_stage'];

export interface SportsSeasonsStageWithDetails extends SportsSeasonsStage {
  sports_categories: {
    id: number;
    division: Database['public']['Enums']['sport_divisions'];
    levels: Database['public']['Enums']['sport_levels'];
    sports: {
      id: number;
      name: string;
    };
  };
  seasons: {
    id: number;
    start_at: string;
    end_at: string;
  };
}

export interface SportsSeasonsStageSearchFilters {
  season_id?: number;
  sport_category_id?: number;
  competition_stage?: CompetitionStage;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type SportsSeasonsStagesPaginationOptions = PaginationOptions<
  SportsSeasonsStageSearchFilters & Record<string, FilterValue>
>;
