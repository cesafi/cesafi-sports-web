import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Sponsor = Database['public']['Tables']['sponsors']['Row'];

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
