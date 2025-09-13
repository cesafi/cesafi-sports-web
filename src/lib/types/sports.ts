import { z } from 'zod';
import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';
import { 
  createSportSchema, 
  updateSportSchema, 
  createSportCategorySchema, 
  updateSportCategorySchema 
} from '@/lib/validations/sports';

export type Sport = Database['public']['Tables']['sports']['Row'];
export type SportInsert = z.infer<typeof createSportSchema>;
export type SportUpdate = z.infer<typeof updateSportSchema>;

export type SportCategory = Database['public']['Tables']['sports_categories']['Row'];
export type SportCategoryInsert = z.infer<typeof createSportCategorySchema>;
export type SportCategoryUpdate = z.infer<typeof updateSportCategorySchema>;

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
