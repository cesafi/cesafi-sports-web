import { z } from 'zod';

export const createMatchSchema = z
  .object({
    name: z
      .string({ message: 'Match name is required.' })
      .min(1, { message: 'Match name cannot be empty.' })
      .max(255, { message: 'Match name cannot exceed 255 characters.' }),
    description: z
      .string({ message: 'Match description is required.' })
      .min(1, { message: 'Match description cannot be empty.' }),
    best_of: z
      .number({ message: 'Best of must be a number.' })
      .int({ message: 'Best of must be an integer.' })
      .positive({ message: 'Best of must be positive.' })
      .default(1),
    sports_seasons_stage_id: z.number({ message: 'Sports seasons stage ID is required.' }),
    scheduled_at: z.string().optional().nullable(),
    start_at: z.string().optional().nullable(),
    end_at: z.string().optional().nullable()
  })
  .refine(
    (data) => {
      if (data.start_at && data.end_at) {
        return new Date(data.start_at) < new Date(data.end_at);
      }
      return true;
    },
    {
      message: 'Start date must be before end date.',
      path: ['end_at']
    }
  )
  .refine(
    (data) => {
      if (data.scheduled_at && data.start_at) {
        return new Date(data.scheduled_at) <= new Date(data.start_at);
      }
      return true;
    },
    {
      message: 'Scheduled date must be before or equal to start date.',
      path: ['start_at']
    }
  );

export const updateMatchSchema = z
  .object({
    id: z.number({ message: 'ID is required for updating a match.' }),
    name: z
      .string()
      .min(1, { message: 'Match name cannot be empty.' })
      .max(255, { message: 'Match name cannot exceed 255 characters.' })
      .optional(),
    description: z.string().min(1, { message: 'Match description cannot be empty.' }).optional(),
    best_of: z
      .number({ message: 'Best of must be a number.' })
      .int({ message: 'Best of must be an integer.' })
      .positive({ message: 'Best of must be positive.' })
      .optional(),
    sports_seasons_stage_id: z
      .number({ message: 'Sports seasons stage ID is required.' })
      .optional(),
    scheduled_at: z.string().optional().nullable(),
    start_at: z.string().optional().nullable(),
    end_at: z.string().optional().nullable()
  })
  .refine(
    (data) => {
      if (data.start_at && data.end_at) {
        return new Date(data.start_at) < new Date(data.end_at);
      }
      return true;
    },
    {
      message: 'Start date must be before end date.',
      path: ['end_at']
    }
  )
  .refine(
    (data) => {
      if (data.scheduled_at && data.start_at) {
        return new Date(data.scheduled_at) <= new Date(data.start_at);
      }
      return true;
    },
    {
      message: 'Scheduled date must be before or equal to start date.',
      path: ['start_at']
    }
  );

// Legacy exports for backward compatibility
export const MatchInsertSchema = createMatchSchema;
export const MatchUpdateSchema = updateMatchSchema;
