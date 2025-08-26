import { z } from 'zod';
import { Constants } from '@/../database.types';

const SPORT_DIVISIONS = Constants.public.Enums.sport_divisions;
const SPORT_LEVELS = Constants.public.Enums.sport_levels;

export const createSportCategorySchema = z.object({
  sport_id: z.number({ message: 'Sport ID is required.' }),
  division: z.enum(SPORT_DIVISIONS, {
    message: `Division must be one of: ${SPORT_DIVISIONS.join(', ')}.`
  }),
  levels: z.enum(SPORT_LEVELS, {
    message: `Level must be one of: ${SPORT_LEVELS.join(', ')}.`
  })
});

export const updateSportCategorySchema = z.object({
  id: z.number({ message: 'ID is required for updating a sport category.' }),
  sport_id: z.number({ message: 'Sport ID is required.' }).optional(),
  division: z
    .enum(SPORT_DIVISIONS, {
      message: `Division must be one of: ${SPORT_DIVISIONS.join(', ')}.`
    })
    .optional(),
  levels: z
    .enum(SPORT_LEVELS, {
      message: `Level must be one of: ${SPORT_LEVELS.join(', ')}.`
    })
    .optional()
});

// Legacy exports for backward compatibility
export const SportCategoryInsertSchema = createSportCategorySchema;
export const SportCategoryUpdateSchema = updateSportCategorySchema;
