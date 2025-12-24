import { z } from 'zod';
import { Constants } from '@/../database.types';

const COMPETITION_STAGES = Constants.public.Enums.competition_stage;

export const createSportsSeasonsStageSchema = z.object({
  sport_category_id: z.number({ message: 'Sport category ID is required.' }),
  season_id: z.number({ message: 'Season ID is required.' }),
  competition_stage: z.enum(COMPETITION_STAGES, {
    message: `Competition stage must be one of: ${COMPETITION_STAGES.join(', ')}.`
  })
});

export const updateSportsSeasonsStageSchema = z.object({
  id: z.number({ message: 'ID is required for updating a sports seasons stage.' }),
  sport_category_id: z.number({ message: 'Sport category ID is required.' }).optional(),
  season_id: z.number({ message: 'Season ID is required.' }).optional(),
  competition_stage: z
    .enum(COMPETITION_STAGES, {
      message: `Competition stage must be one of: ${COMPETITION_STAGES.join(', ')}.`
    })
    .optional()
});
