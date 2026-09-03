import { z } from 'zod';
import { competitionStageEnum } from '@/db/schema';

const COMPETITION_STAGES = competitionStageEnum.enumValues;

export const createSportsSeasonsStageSchema = z.object({
  sport_category_id: z.number({ message: 'Sport category ID is required.' }),
  season_id: z.number({ message: 'Season ID is required.' }),
  competition_stage: z
    .string({ message: 'Competition stage name is required.' })
    .min(1, { message: 'Competition stage name cannot be empty.' })
    .max(100, { message: 'Competition stage name cannot exceed 100 characters.' })
});

export const updateSportsSeasonsStageSchema = z.object({
  id: z.number({ message: 'ID is required for updating a sports seasons stage.' }),
  sport_category_id: z.number({ message: 'Sport category ID is required.' }).optional(),
  season_id: z.number({ message: 'Season ID is required.' }).optional(),
  competition_stage: z
    .string()
    .min(1, { message: 'Competition stage name cannot be empty.' })
    .max(100, { message: 'Competition stage name cannot exceed 100 characters.' })
    .optional()
});
