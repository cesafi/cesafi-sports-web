import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { createVolunteerSchema, updateVolunteerSchema } from '@/lib/validations/volunteers';
import { volunteers } from '@/db/schema';

export type Volunteer = typeof volunteers.$inferSelect;
export type VolunteerInsert = typeof volunteers.$inferInsert;
export type VolunteerUpdate = Partial<VolunteerInsert>;

export interface VolunteersSearchFilters {
  full_name?: string;
  department_id?: number;
  season_id?: number;
  is_active?: boolean;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type VolunteersPaginationOptions = PaginationOptions<
  VolunteersSearchFilters & Record<string, FilterValue>
>;

// Additional helper types
export type VolunteerWithoutTimestamps = Omit<Volunteer, 'created_at' | 'updated_at'>;

// Department-specific types for better type safety
export interface VolunteerByDepartment {
  department: string;
  volunteers: Volunteer[];
}

export interface VolunteerDepartmentStats {
  department: string;
  count: number;
}
