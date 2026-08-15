import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { createSchoolSchema, updateSchoolSchema } from '@/lib/validations/schools';
import { schools } from '@/db/schema';

export type School = typeof schools.$inferSelect;
export type SchoolInsert = typeof schools.$inferInsert;
export type SchoolUpdate = Partial<SchoolInsert>;

export interface SchoolSearchFilters {
  name?: string;
  address?: string;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type SchoolPaginationOptions = PaginationOptions<
  SchoolSearchFilters & Record<string, FilterValue>
>;
