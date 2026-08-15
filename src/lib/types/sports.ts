import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { 
  createSportSchema, 
  updateSportSchema, 
  createSportCategorySchema, 
  updateSportCategorySchema 
} from '@/lib/validations/sports';
import { sports, sportsCategories } from '@/db/schema';

export type Sport = typeof sports.$inferSelect;
export type SportInsert = typeof sports.$inferInsert;
export type SportUpdate = Partial<SportInsert>;

export type SportCategory = typeof sportsCategories.$inferSelect;
export type SportCategoryInsert = typeof sportsCategories.$inferInsert;
export type SportCategoryUpdate = Partial<SportCategoryInsert>;

import { SportDivision, SportLevel } from '@/db/schema';
export type { SportDivision, SportLevel };

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
