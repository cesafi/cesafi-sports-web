import { Database } from '../../../database.types';
import { FilterValue, PaginationOptions } from './base';
import { BaseEntity } from './table';

export type Match = Database['public']['Tables']['matches']['Row'];
export type MatchInsert = Database['public']['Tables']['matches']['Insert'];
export type MatchUpdate = Database['public']['Tables']['matches']['Update'];

export type MatchStatus = Database['public']['Enums']['match_status'];

export interface MatchSearchFilters {
  name?: string;
  stage_id?: number;
  venue?: string;
  match_status?: MatchStatus;
  sport_id?: number;
  sport_category_id?: number;
  season_id?: number;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type MatchPaginationOptions = PaginationOptions<
  MatchSearchFilters & Record<string, FilterValue>
>;

// Detailed view types for service responses
export interface MatchWithStageDetails extends BaseEntity {
  id: number;
  name: string;
  description: string;
  venue: string;
  scheduled_at: string | null;
  start_at: string | null;
  end_at: string | null;
  best_of: number;
  stage_id: number;
  created_at: string;
  updated_at: string;
  sports_seasons_stages: {
    id: number;
    competition_stage: Database['public']['Enums']['competition_stage'];
    season_id: number | null;
    sport_category_id: number | null;
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
  };
}

export interface MatchWithFullDetails extends BaseEntity {
  id: number;
  name: string;
  description: string;
  venue: string;
  scheduled_at: string | null;
  start_at: string | null;
  end_at: string | null;
  best_of: number;
  stage_id: number;
  created_at: string;
  updated_at: string;
  sports_seasons_stages: {
    id: number;
    competition_stage: Database['public']['Enums']['competition_stage'];
    season_id: number | null;
    sport_category_id: number | null;
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
  };
  match_participants: {
    id: number;
    match_id: number;
    team_id: string;
    schools_teams: {
      id: string;
      name: string;
      schools: {
        name: string;
        abbreviation: string;
        logo_url: string | null;
      };
    };
  }[];
}