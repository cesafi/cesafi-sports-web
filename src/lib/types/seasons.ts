import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Season = Database['public']['Tables']['seasons']['Row'];
export type SeasonInsert = Database['public']['Tables']['seasons']['Insert'];
export type SeasonUpdate = Database['public']['Tables']['seasons']['Update'];

export interface SeasonSearchFilters {
  number?: number;
  start_at?: string;
  end_at?: string;
  date_range?: {
    start?: string;
    end?: string;
  };
}

export type SeasonPaginationOptions = PaginationOptions<
  SeasonSearchFilters & Record<string, FilterValue>
>;