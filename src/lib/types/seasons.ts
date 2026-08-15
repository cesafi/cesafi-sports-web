import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { createSeasonSchema, updateSeasonSchema } from '@/lib/validations/seasons';
import { seasons } from '@/db/schema';

export type Season = typeof seasons.$inferSelect;
export type SeasonInsert = typeof seasons.$inferInsert;
export type SeasonUpdate = Partial<SeasonInsert>;

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
