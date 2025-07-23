import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Sport = Database['public']['Tables']['sports']['Row'];
export type SportInsert = Database['public']['Tables']['sports']['Insert'];
export type SportUpdate = Database['public']['Tables']['sports']['Update'];

export type SportDivision = Database['public']['Enums']['sport_divisions'];
export type SportLevel = Database['public']['Enums']['sport_levels'];

export interface SportsSearchFilters {
  name?: string;
  division?: SportDivision | SportDivision[];
  level?: SportLevel | SportLevel[];
  created_at?: string;
  updated_at?: string;
  date_range?: {
    start?: string;
    end?: string;
  };
}

export type SportsPaginationOptions = PaginationOptions<
  SportsSearchFilters & Record<string, FilterValue>
>;
