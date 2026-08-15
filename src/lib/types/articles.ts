import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { createArticleSchema, updateArticleSchema } from '@/lib/validations/articles';
import { Articles } from '@/db/schema/articles';
import { articleStatusEnum } from '@/db/schema/enums';

export type Article = Articles;
export type ArticleInsert = z.infer<typeof createArticleSchema>;
export type ArticleUpdate = z.infer<typeof updateArticleSchema>;

export type ArticleStatus = typeof articleStatusEnum.enumValues[number];

// Re-export Json type for convenience
export type Json = unknown;

export interface ArticleSearchFilters {
  title?: string;
  authored_by?: string;
  status?: ArticleStatus;
  created_at?: {
    gte?: string;
    lte?: string;
  };
  published_at?: {
    gte?: string;
    lte?: string;
  };
}

export type ArticlePaginationOptions = PaginationOptions<
  ArticleSearchFilters & Record<string, FilterValue>
>;
