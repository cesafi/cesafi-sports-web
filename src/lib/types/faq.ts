import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { createFaqSchema, updateFaqSchema } from '@/lib/validations/faq';
import { faq } from '@/db/schema';

// Base FAQ types from database
export type Faq = typeof faq.$inferSelect;
export type FaqInsert = typeof faq.$inferInsert;
export type FaqUpdate = Partial<FaqInsert>;

// Search filters for FAQ
export interface FaqSearchFilters {
  is_active?: boolean;
  is_open?: boolean;
}

// Pagination options for FAQ
export type FaqPaginationOptions = PaginationOptions<
  FaqSearchFilters & Record<string, FilterValue>
>;

export interface FaqPaginationResponse {
  data: Faq[];
  totalCount: number;
  pageCount: number;
  page: number;
  pageSize: number;
}

// Form data types
export interface FaqFormData {
  question: string;
  answer: string;
  is_open: boolean;
  display_order: number;
  is_active: boolean;
}
