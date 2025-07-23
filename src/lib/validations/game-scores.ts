import { z } from 'zod';

export const GameScoreInsertSchema = z.object({
  games_id: z.uuid({ message: 'Game ID must be a valid UUID.' }),
  match_participants_id: z.uuid({ message: 'Match participant ID must be a valid UUID.' }),
  score: z
    .number({ message: 'Score must be a number.' })
    .min(0, { message: 'Score cannot be negative.' })
    .max(1000000, { message: 'Score cannot exceed 1,000,000.' })
});

export const GameScoreUpdateSchema = z.object({
  id: z.uuid({ message: 'ID must be a valid UUID.' }),
  games_id: z.uuid({ message: 'Game ID must be a valid UUID.' }).optional(),
  match_participants_id: z
    .uuid({ message: 'Match participant ID must be a valid UUID.' })
    .optional(),
  score: z
    .number({ message: 'Score must be a number.' })
    .min(0, { message: 'Score cannot be negative.' })
    .max(1000000, { message: 'Score cannot exceed 1,000,000.' })
    .optional()
});
