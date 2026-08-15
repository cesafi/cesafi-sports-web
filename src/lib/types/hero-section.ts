import { z } from 'zod';
import { FilterValue, PaginationOptions, ServiceResponse } from './base';
import { createHeroSectionLiveSchema, updateHeroSectionLiveSchema } from '@/lib/validations/hero-section';
import { heroSectionLive } from '@/db/schema';

// Base hero section live types from database
export type HeroSectionLive = typeof heroSectionLive.$inferSelect;
export type HeroSectionLiveInsert = typeof heroSectionLive.$inferInsert;
export type HeroSectionLiveUpdate = Partial<HeroSectionLiveInsert>;

// Search filters for hero section live
export interface HeroSectionLiveSearchFilters {
  video_link?: string;
  is_active?: boolean; // Computed based on end_at
}

// Pagination options for hero section live
export type HeroSectionLivePaginationOptions = PaginationOptions<
  HeroSectionLiveSearchFilters & Record<string, FilterValue>
>;

// Hero section live with additional computed fields
export interface HeroSectionLiveWithDetails extends HeroSectionLive {
  is_active: boolean; // Computed based on end_at
  is_expired: boolean; // Computed based on end_at
  time_remaining?: string; // Computed time until expiration
  formatted_end_date?: string; // Formatted end date
}

// Service response for getting current active hero section
export type CurrentHeroSectionResponse = ServiceResponse<HeroSectionLiveWithDetails | null>;
