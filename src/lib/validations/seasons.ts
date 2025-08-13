import { z } from 'zod';

export const SeasonInsertSchema = z
  .object({
    number: z
      .number({ message: 'Season number is required.' })
      .int({ message: 'Season number must be an integer.' })
      .positive({ message: 'Season number must be positive.' }),
    start_at: z.iso.datetime({ message: 'Start date must be a valid ISO datetime string.' }),
    end_at: z.iso.datetime({ message: 'End date must be a valid ISO datetime string.' })
  })
  .refine((data) => new Date(data.start_at) < new Date(data.end_at), {
    message: 'Start date must be before end date.',
    path: ['end_at']
  });

export const SeasonUpdateSchema = z
  .object({
    id: z.uuid({ message: 'ID is required for updating a season.' }),
    number: z
      .number({ message: 'Season number must be a number.' })
      .int({ message: 'Season number must be an integer.' })
      .positive({ message: 'Season number must be positive.' })
      .optional(),
    start_at: z.iso
      .datetime({ message: 'Start date must be a valid ISO datetime string.' })
      .optional(),
    end_at: z.iso.datetime({ message: 'End date must be a valid ISO datetime string.' }).optional()
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
  );
