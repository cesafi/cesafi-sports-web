import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Season = Database['public']['Tables']['seasons']['Row'];

export interface SeasonSearchFilters {
  start_at?: {
    gte?: string;
    lte?: string;
  };
  end_at?: {
    gte?: string;
    lte?: string;
  };
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type SeasonPaginationOptions = PaginationOptions<
  SeasonSearchFilters & Record<string, FilterValue>
>;
