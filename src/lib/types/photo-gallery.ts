import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { createPhotoGallerySchema, updatePhotoGallerySchema } from '@/lib/validations/photo-gallery';
import { photoGallery } from '@/db/schema';

// Base photo gallery types from database
export type PhotoGallery = typeof photoGallery.$inferSelect;
export type PhotoGalleryInsert = typeof photoGallery.$inferInsert;
export type PhotoGalleryUpdate = Partial<PhotoGalleryInsert>;

// Search filters for photo gallery
export interface PhotoGallerySearchFilters {
  title?: string;
  category?: string;
  photo_by?: string;
}

// Pagination options for photo gallery
export type PhotoGalleryPaginationOptions = PaginationOptions<
  PhotoGallerySearchFilters & Record<string, FilterValue>
>;

// Photo gallery categories
export type PhotoGalleryCategory = 'sports' | 'events' | 'awards' | 'general' | 'team' | 'facilities';

// Photo gallery with additional computed fields
export interface PhotoGalleryWithDetails extends PhotoGallery {
  // Add any computed fields here if needed
  category_display?: string;
  formatted_date?: string;
}
