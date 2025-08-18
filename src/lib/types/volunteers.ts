import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Volunteer = Database['public']['Tables']['volunteers']['Row'];
export type VolunteerInsert = Database['public']['Tables']['volunteers']['Insert'];
export type VolunteerUpdate = Database['public']['Tables']['volunteers']['Update'];

export interface VolunteersSearchFilters {
  full_name?: string;
  department?: string | string[];
  created_at?: string;
  updated_at?: string;
  date_range?: {
    start?: string;
    end?: string;
  };
}

export type VolunteersPaginationOptions = PaginationOptions<
  VolunteersSearchFilters & Record<string, FilterValue>
>;

// Additional helper types
export type VolunteerWithoutTimestamps = Omit<Volunteer, 'created_at' | 'updated_at'>;
export type VolunteerCreateData = Omit<VolunteerInsert, 'id' | 'created_at' | 'updated_at'>;

// Department-specific types for better type safety
export interface VolunteerByDepartment {
  department: string;
  volunteers: Volunteer[];
}

export interface VolunteerDepartmentStats {
  department: string;
  count: number;
}
