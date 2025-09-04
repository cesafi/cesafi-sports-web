import { Database } from '../../../database.types';
import { FilterValue, PaginationOptions } from './base';

export type School = Database['public']['Tables']['schools']['Row'];
export type SchoolInsert = Database['public']['Tables']['schools']['Insert'];
export type SchoolUpdate = Database['public']['Tables']['schools']['Update'];

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
