import { FilterValue, PaginationOptions } from './base';
import { sportsSeasonsStages, CompetitionStage, SportDivision, SportLevel } from '@/db/schema';

export type SportsSeasonsStage = typeof sportsSeasonsStages.$inferSelect;
export type SportsSeasonsStageInsert = typeof sportsSeasonsStages.$inferInsert;
export type SportsSeasonsStageUpdate = Partial<SportsSeasonsStageInsert>;

// Re-export types that other files expect to find here
export type { CompetitionStage, SportDivision, SportLevel } from '@/db/schema';

export interface SportsSeasonsStageWithDetails extends SportsSeasonsStage {
  sports_categories: {
    id: number;
    division: SportDivision;
    levels: SportLevel;
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
