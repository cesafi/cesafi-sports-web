import { z } from 'zod';
import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';
import { createSponsorSchema, updateSponsorSchema } from '@/lib/validations/sponsors';

export type Sponsor = Database['public']['Tables']['sponsors']['Row'];
export type SponsorInsert = z.infer<typeof createSponsorSchema>;
export type SponsorUpdate = z.infer<typeof updateSponsorSchema>;

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
