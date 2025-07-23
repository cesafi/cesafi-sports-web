import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Match = Database['public']['Tables']['matches']['Row'];
export type MatchInsert = Database['public']['Tables']['matches']['Insert'];
export type MatchUpdate = Database['public']['Tables']['matches']['Update'];

export interface MatchSearchFilters {
  name?: string;
  description?: string;
  best_of?: number;
  sports_seasons_stages_id?: string;
  scheduled_at?: string;
  start_at?: string;
  end_at?: string;
  date_range?: {
    start?: string;
    end?: string;
  };
  scheduled_date_range?: {
    start?: string;
    end?: string;
  };
}

export type MatchPaginationOptions = PaginationOptions<
  MatchSearchFilters & Record<string, FilterValue>
>;