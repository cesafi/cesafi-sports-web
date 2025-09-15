import { z } from 'zod';

export const createHeroSectionLiveSchema = z.object({
  video_link: z.string().url('Please provide a valid video URL'),
  end_at: z.string().min(1, 'End date is required').refine(
    (date) => {
      const endDate = new Date(date);
      const now = new Date();
      return endDate > now;
    },
    'End date must be in the future'
  ),
});

export const updateHeroSectionLiveSchema = z.object({
  video_link: z.string().url('Please provide a valid video URL').optional(),
  end_at: z.string().min(1, 'End date is required').refine(
    (date) => {
      const endDate = new Date(date);
      const now = new Date();
      return endDate > now;
    },
    'End date must be in the future'
  ).optional(),
});

export type CreateHeroSectionLiveInput = z.infer<typeof createHeroSectionLiveSchema>;
export type UpdateHeroSectionLiveInput = z.infer<typeof updateHeroSectionLiveSchema>;

