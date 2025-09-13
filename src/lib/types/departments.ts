import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Department = Database['public']['Tables']['departments']['Row'];

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
