import { FilterValue, PaginationOptions } from './base';
import { sponsors } from '@/db/schema';
import { SponsorType } from '@/db/schema/enums';

// Direct database type mapping
export type Sponsor = typeof sponsors.$inferSelect;
export type SponsorInsert = typeof sponsors.$inferInsert;
export type SponsorUpdate = Partial<SponsorInsert>;

// Search filters for sponsors
export interface SponsorSearchFilters {
  title?: string;
  tagline?: string;
  is_active?: boolean;
  type?: SponsorType;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

// Pagination options for sponsors
export type SponsorPaginationOptions = PaginationOptions<
  SponsorSearchFilters & Record<string, FilterValue>
>;