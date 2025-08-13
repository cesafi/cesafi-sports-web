import { z } from 'zod';
import { Constants } from '@/../database.types';

const SPORT_DIVISIONS = Constants.public.Enums.sport_divisions;
const SPORT_LEVELS = Constants.public.Enums.sport_levels;

export const SportInsertSchema = z.object({
  name: z
    .string({ message: 'Sport name is required.' })
    .min(1, { message: 'Sport name cannot be empty.' })
    .max(100, { message: 'Sport name must be 100 characters or less.' })
    .trim(),
  division: z.enum(SPORT_DIVISIONS, {
    message: `Division must be one of: ${SPORT_DIVISIONS.join(', ')}.`
  }),
  level: z.enum(SPORT_LEVELS, {
    message: `Level must be one of: ${SPORT_LEVELS.join(', ')}.`
  })
});

export const SportUpdateSchema = z.object({
  id: z.uuid({ message: 'ID is required for updating a sport.' }),
  name: z
    .string({ message: 'Sport name must be a string.' })
    .min(1, { message: 'Sport name cannot be empty.' })
    .max(100, { message: 'Sport name must be 100 characters or less.' })
    .trim()
    .optional(),
  division: z
    .enum(SPORT_DIVISIONS, {
      message: `Division must be one of: ${SPORT_DIVISIONS.join(', ')}.`
    })
    .optional(),
  level: z
    .enum(SPORT_LEVELS, {
      message: `Level must be one of: ${SPORT_LEVELS.join(', ')}.`
    })
    .optional()
});
