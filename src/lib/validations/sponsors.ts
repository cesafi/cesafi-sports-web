import { z } from 'zod';

export const createSponsorSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  tagline: z
    .string()
    .min(1, 'Tagline is required')
    .max(200, 'Tagline must be less than 200 characters'),
  logo_url: z.url('Must be a valid URL').optional().or(z.literal('')),
  is_active: z.boolean().default(true)
});

export const updateSponsorSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  tagline: z
    .string()
    .min(1, 'Tagline is required')
    .max(200, 'Tagline must be less than 200 characters')
    .optional(),
  logo_url: z.url('Must be a valid URL').optional().or(z.literal('')),
  is_active: z.boolean().optional()
});

// Export inferred types
export type SponsorInsert = z.infer<typeof createSponsorSchema>;
export type SponsorUpdate = z.infer<typeof updateSponsorSchema>;