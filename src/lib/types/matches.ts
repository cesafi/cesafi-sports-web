import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Match = Database['public']['Tables']['matches']['Row'];
export type MatchInsert = Database['public']['Tables']['matches']['Insert'];
export type MatchUpdate = Database['public']['Tables']['matches']['Update'];

export type MatchStatus = Database['public']['Enums']['match_status'];

export interface MatchSearchFilters {
  name?: string;
  stage_id?: number;
  venue?: string;
  match_status?: MatchStatus;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type MatchPaginationOptions = PaginationOptions<
  MatchSearchFilters & Record<string, FilterValue>
>;