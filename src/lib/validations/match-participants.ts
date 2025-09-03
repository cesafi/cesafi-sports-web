import { z } from 'zod';

export const createMatchParticipantSchema = z.object({
  match_id: z.number({ message: 'Match ID is required.' }),
  schools_team_id: z.number({ message: 'Schools team ID is required.' }),
  placement: z
    .number({ message: 'Placement must be a number.' })
    .int({ message: 'Placement must be an integer.' })
    .min(1, { message: 'Placement must be at least 1.' })
    .max(100, { message: 'Placement cannot exceed 100.' })
    .optional()
});

export const updateMatchParticipantSchema = z.object({
  id: z.number({ message: 'ID is required for updating a match participant.' }),
  match_id: z.number({ message: 'Match ID is required.' }).optional(),
  schools_team_id: z.number({ message: 'Schools team ID is required.' }).optional(),
  placement: z
    .number({ message: 'Placement must be a number.' })
    .int({ message: 'Placement must be an integer.' })
    .min(1, { message: 'Placement must be at least 1.' })
    .max(100, { message: 'Placement cannot exceed 100.' })
    .optional()
});

export const MatchParticipantInsertSchema = createMatchParticipantSchema;
export const MatchParticipantUpdateSchema = updateMatchParticipantSchema;
