import { z } from 'zod';

// Helper: allow empty string → null, otherwise validate as URL
const optionalUrl = z.string()
  .transform(val => val === '' ? null : val)
  .pipe(z.string().url().nullable());

export const createPlayerSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required.' }),
  last_name: z.string().min(1, { message: 'Last name is required.' }),
  player_number: z.number().int().optional().nullable(),
  position: z.string().optional().nullable(),
  photo_url: optionalUrl.optional(),
  school_team_id: z.string().min(1, { message: 'School team is required.' }),
  sport_id: z.number().int().min(1, { message: 'Sport is required.' }),
  is_active: z.boolean().default(true),
  slug: z.string().min(1, { message: 'Slug is required.' }),
  bio: z.string().optional().nullable(),
});

export const updatePlayerSchema = z.object({
  id: z.string({ message: 'ID is required for updating a player.' }),
  first_name: z.string().min(1, { message: 'First name cannot be empty.' }).optional(),
  last_name: z.string().min(1, { message: 'Last name cannot be empty.' }).optional(),
  player_number: z.number().int().optional().nullable(),
  position: z.string().optional().nullable(),
  photo_url: optionalUrl.optional(),
  school_team_id: z.string().optional(),
  sport_id: z.number().int().optional(),
  is_active: z.boolean().optional(),
  slug: z.string().optional(),
  bio: z.string().optional().nullable(),
});
