import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Volunteer = Database['public']['Tables']['volunteers']['Row'];
export type VolunteerInsert = Database['public']['Tables']['volunteers']['Insert'];
export type VolunteerUpdate = Database['public']['Tables']['volunteers']['Update'];

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
