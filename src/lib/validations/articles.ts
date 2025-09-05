import { z } from 'zod';
import { Constants } from '../../../database.types';

const ArticleContentSchema = z.union([
  z.string().min(1, { message: 'Content cannot be empty.' }),
  z.object({
    root: z.object({
      children: z.array(z.any()),
      direction: z.string().optional(),
      format: z.string().optional(),
      indent: z.number().optional(),
      type: z.string(),
      version: z.number()
    }),
    // Allow other Lexical-specific properties
  }).passthrough().refine(
    (content) => {
      try {
        JSON.stringify(content);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Content must be valid JSON' }
  ),
  // Fallback for any other object structure
  z.record(z.string(), z.any()).refine(
    (content) => {
      try {
        JSON.stringify(content);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Content must be valid JSON' }
  )
]);

export const createArticleSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Article title is required.' })
    .max(255, { message: 'Title cannot exceed 255 characters.' }),
  content: ArticleContentSchema,
  cover_image_url: z.string().optional().default(''),
  authored_by: z.string().min(1, { message: 'Author is required.' }),
  slug: z.string().min(1, { message: 'Slug is required.' }),
  status: z
    .enum(Constants.public.Enums.article_status, {
      message: 'Status must be one of: draft, review, approved, revise, cancelled'
    })
    .default('review'),
  published_at: z.string().nullable().optional()
});

export const updateArticleSchema = z.object({
  id: z.string().min(1, { message: 'ID is required for updating an article.' }),
  title: z
    .string()
    .min(1, { message: 'Article title cannot be empty.' })
    .max(255, { message: 'Title cannot exceed 255 characters.' })
    .optional(),
  content: ArticleContentSchema.optional(),
  cover_image_url: z.string().optional(),
  authored_by: z.string().min(1, { message: 'Author cannot be empty.' }).optional(),
  slug: z.string().min(1, { message: 'Slug cannot be empty.' }).optional(),
  status: z
    .enum(Constants.public.Enums.article_status, {
      message: 'Status must be one of: draft, review, approved, revise, cancelled'
    })
    .optional(),
  published_at: z.string().nullable().optional()
});

// Legacy exports for backward compatibility
export const ArticleInsertSchema = createArticleSchema;
export const ArticleUpdateSchema = updateArticleSchema;
