import { z } from 'zod';

export const SchoolsTeamInsertSchema = z.object({
  name: z
    .string({ message: 'Team name is required.' })
    .min(1, { message: 'Team name cannot be empty.' })
    .max(100, { message: 'Team name cannot exceed 100 characters.' })
    .optional(),
  is_active: z.boolean({ message: 'Active status must be a boolean.' }).default(true),
  schools_id: z.uuid({ message: 'School ID must be a valid UUID.' }),
  seasons_id: z.uuid({ message: 'Season ID must be a valid UUID.' }),
  sports_id: z.uuid({ message: 'Sport ID must be a valid UUID.' })
});

export const SchoolsTeamUpdateSchema = z.object({
  id: z.uuid({ message: 'ID must be a valid UUID.' }),
  name: z
    .string()
    .min(1, { message: 'Team name cannot be empty.' })
    .max(100, { message: 'Team name cannot exceed 100 characters.' })
    .optional(),
  is_active: z.boolean({ message: 'Active status must be a boolean.' }).optional(),
  schools_id: z.uuid({ message: 'School ID must be a valid UUID.' }).optional(),
  seasons_id: z.uuid({ message: 'Season ID must be a valid UUID.' }).optional(),
  sports_id: z.uuid({ message: 'Sport ID must be a valid UUID.' }).optional()
});
