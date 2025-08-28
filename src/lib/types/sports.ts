import { Database } from '../../../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Sport = Database['public']['Tables']['sports']['Row'];
export type SportInsert = Database['public']['Tables']['sports']['Insert'];
export type SportUpdate = Database['public']['Tables']['sports']['Update'];

export type SportCategory = Database['public']['Tables']['sports_categories']['Row'];
export type SportCategoryInsert = Database['public']['Tables']['sports_categories']['Insert'];
export type SportCategoryUpdate = Database['public']['Tables']['sports_categories']['Update'];

export type SportDivision = Database['public']['Enums']['sport_divisions'];
export type SportLevel = Database['public']['Enums']['sport_levels'];

// Type for category form data (used in forms and API calls)
export type SportCategoryFormData = {
  division: SportDivision;
  levels: SportLevel;
};

export interface SportsSearchFilters {
  name?: string;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export interface SportCategoriesSearchFilters {
  sport_id?: number;
  division?: SportDivision;
  levels?: SportLevel;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type SportsPaginationOptions = PaginationOptions<
  SportsSearchFilters & Record<string, FilterValue>
>;

export type SportCategoriesPaginationOptions = PaginationOptions<
  SportCategoriesSearchFilters & Record<string, FilterValue>
>;
