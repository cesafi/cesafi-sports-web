import { Database, Json } from '../../../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Article = Database['public']['Tables']['articles']['Row'];
export type ArticleInsert = Database['public']['Tables']['articles']['Insert'];
export type ArticleUpdate = Database['public']['Tables']['articles']['Update'];

export type ArticleStatus = Database['public']['Enums']['article_status'];

// Re-export Json type for convenience
export type { Json };

export interface ArticleSearchFilters {
  title?: string;
  author_id?: string;
  status?: ArticleStatus;
  is_published?: boolean;
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