import { z } from 'zod';
import { Constants } from '../../../database.types';

const ArticleContentSchema = z.record(z.string(), z.any()).refine(
  (content) => {
    try {
      JSON.stringify(content);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Content must be valid JSON' }
);

export const ArticleInsertSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Article title is required.' })
    .max(255, { message: 'Title cannot exceed 255 characters.' }),
  content: ArticleContentSchema,
  cover_image_url: z.url({ message: 'Cover image URL must be a valid URL.' }),
  author_id: z.uuid({ message: 'Author ID must be a valid UUID.' }),
  status: z
    .enum(Constants.public.Enums.article_status, {
      message: 'Status must be one of: review, approved, revise, canceled'
    })
    .default('review'),
  is_published: z.boolean({ message: 'Published status must be a boolean.' }).default(false),
  published_at: z.iso.datetime({ message: 'Published date must be a valid ISO datetime.' })
});

export const ArticleUpdateSchema = z.object({
  id: z.uuid({ message: 'ID is required for updating an article.' }),
  title: z
    .string()
    .min(1, { message: 'Article title cannot be empty.' })
    .max(255, { message: 'Title cannot exceed 255 characters.' })
    .optional(),
  content: ArticleContentSchema.optional(),
  cover_image_url: z.url({ message: 'Cover image URL must be a valid URL.' }).optional(),
  author_id: z.uuid({ message: 'Author ID must be a valid UUID.' }).optional(),
  status: z
    .enum(Constants.public.Enums.article_status, {
      message: 'Status must be one of: review, approved, revise, canceled'
    })
    .optional(),
  is_published: z.boolean({ message: 'Published status must be a boolean.' }).optional(),
  published_at: z.iso
    .datetime({ message: 'Published date must be a valid ISO datetime.' })
    .optional()
});
