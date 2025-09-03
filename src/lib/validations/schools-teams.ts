import { z } from 'zod';

export const createSchoolsTeamSchema = z.object({
  team_name: z
    .string({ message: 'Team name is required.' })
    .min(1, { message: 'Team name cannot be empty.' })
    .max(100, { message: 'Team name cannot exceed 100 characters.' }),
  school_id: z.number({ message: 'School ID is required.' }),
  sport_category_id: z.number({ message: 'Sport category ID is required.' })
});

export const updateSchoolsTeamSchema = z.object({
  id: z.number({ message: 'ID is required for updating a schools team.' }),
  team_name: z
    .string()
    .min(1, { message: 'Team name cannot be empty.' })
    .max(100, { message: 'Team name cannot exceed 100 characters.' })
    .optional(),
  school_id: z.number({ message: 'School ID is required.' }).optional(),
  sport_category_id: z.number({ message: 'Sport category ID is required.' }).optional()
});

// Legacy exports for backward compatibility
export const SchoolsTeamInsertSchema = createSchoolsTeamSchema;
export const SchoolsTeamUpdateSchema = updateSchoolsTeamSchema;
