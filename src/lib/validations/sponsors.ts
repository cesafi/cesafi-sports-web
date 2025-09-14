import { z } from 'zod';

export const createSponsorSchema = z.object({
  title: z.string().min(1, { message: 'Sponsor title is required.' }),
  tagline: z.string().min(1, { message: 'Sponsor tagline is required.' }),
  logo_url: z
    .string()
    .min(1, { message: 'Sponsor logo is required.' })
    .url({ message: 'Please upload a valid logo image.' }),
  is_active: z.boolean().default(true)
});

export const updateSponsorSchema = z.object({
  id: z.string({ message: 'ID is required for updating a sponsor.' }),
  title: z.string().min(1, { message: 'Sponsor title cannot be empty.' }).optional(),
  tagline: z.string().min(1, { message: 'Sponsor tagline cannot be empty.' }).optional(),
  logo_url: z.string().nullable().optional(),
  is_active: z.boolean().optional()
});
