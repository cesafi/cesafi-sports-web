import { Database } from '../../../database.types';
import { FilterValue, PaginationOptions } from './base';
import { BaseEntity } from './table';

export type Sponsor = Database['public']['Tables']['sponsors']['Row'];
export type SponsorInsert = Database['public']['Tables']['sponsors']['Insert'];
export type SponsorUpdate = Database['public']['Tables']['sponsors']['Update'];

export interface SponsorSearchFilters {
  title?: string;
  tagline?: string;
  is_active?: boolean;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type SponsorPaginationOptions = PaginationOptions<
  SponsorSearchFilters & Record<string, FilterValue>
>;
