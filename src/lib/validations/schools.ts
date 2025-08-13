import { z } from 'zod';

export const SchoolInsertSchema = z.object({
  name: z.string().min(1, { message: 'School name is required.' }),
  abbreviation: z
    .string()
    .min(2, { message: 'Abbreviation must be at least 2 characters.' })
    .max(10, { message: 'Abbreviation cannot exceed 10 characters.' })
    .optional(),
  logo_url: z.url({ message: 'Logo URL must be a valid URL.' }).optional(),
  is_active: z.boolean({ error: 'Is active status is required.' }).default(true)
});

export const SchoolUpdateSchema = z.object({
  id: z.uuid({ message: 'ID is required for updating a school.' }),
  name: z.string().min(1, { message: 'School name cannot be empty.' }).optional(),
  abbreviation: z
    .string()
    .min(2, { message: 'Abbreviation must be at least 2 characters.' })
    .max(10, { message: 'Abbreviation cannot exceed 10 characters.' })
    .optional(),
  logo_url: z.url({ message: 'Logo URL must be a valid URL.' }).optional(),
  is_active: z.boolean({ error: 'Is active status must be a boolean.' }).optional()
});
