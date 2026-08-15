import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { createDepartmentSchema, updateDepartmentSchema } from '@/lib/validations/departments';
import { departments } from '@/db/schema';

export type Department = typeof departments.$inferSelect;
export type DepartmentInsert = typeof departments.$inferInsert;
export type DepartmentUpdate = Partial<DepartmentInsert>;

export interface DepartmentSearchFilters {
  name?: string;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type DepartmentPaginationOptions = PaginationOptions<
  DepartmentSearchFilters & Record<string, FilterValue>
>;
