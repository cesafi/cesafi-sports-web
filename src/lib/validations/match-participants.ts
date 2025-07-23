import { z } from 'zod';

export const MatchParticipantInsertSchema = z.object({
  matches_id: z.uuid({ message: 'Match ID must be a valid UUID.' }),
  schools_teams_id: z.uuid({ message: 'Schools team ID must be a valid UUID.' }),
  placement: z
    .number({ message: 'Placement must be a number.' })
    .int({ message: 'Placement must be an integer.' })
    .min(1, { message: 'Placement must be at least 1.' })
    .max(100, { message: 'Placement cannot exceed 100.' })
    .optional()
});

export const MatchParticipantUpdateSchema = z.object({
  id: z.uuid({ message: 'ID must be a valid UUID.' }),
  matches_id: z.uuid({ message: 'Match ID must be a valid UUID.' }).optional(),
  schools_teams_id: z.uuid({ message: 'Schools team ID must be a valid UUID.' }).optional(),
  placement: z
    .number({ message: 'Placement must be a number.' })
    .int({ message: 'Placement must be an integer.' })
    .min(1, { message: 'Placement must be at least 1.' })
    .max(100, { message: 'Placement cannot exceed 100.' })
    .optional()
});
