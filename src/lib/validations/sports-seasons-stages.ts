import { z } from 'zod';
import { Constants } from '@/../database.types';

// Extract enum values for validation
const COMPETITION_STAGES = Constants.public.Enums.competition_stage;

export const SportsSeasonsStageInsertSchema = z.object({
  sports_id: z.uuid({ message: 'Sport ID must be a valid UUID.' }),
  seasons_id: z.uuid({ message: 'Season ID must be a valid UUID.' }),
  competition_stage: z.enum(COMPETITION_STAGES, {
    message: `Competition stage must be one of: ${COMPETITION_STAGES.join(', ')}.`
  })
});

export const SportsSeasonsStageUpdateSchema = z.object({
  id: z.uuid({ message: 'ID must be a valid UUID.' }),
  sports_id: z.uuid({ message: 'Sport ID must be a valid UUID.' }).optional(),
  seasons_id: z.uuid({ message: 'Season ID must be a valid UUID.' }).optional(),
  competition_stage: z
    .enum(COMPETITION_STAGES, {
      message: `Competition stage must be one of: ${COMPETITION_STAGES.join(', ')}.`
    })
    .optional()
});
