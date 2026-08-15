import {
  PaginatedResponse,
  ServiceResponse
} from '@/lib/types/base';
import { BaseService } from './base';
import { Article, ArticlePaginationOptions, ArticleInsert, ArticleUpdate } from '@/lib/types/articles';
import { articles } from '@/db/schema';
import { eq, desc, lte, and, isNotNull } from 'drizzle-orm';

export class ArticleService extends BaseService {
  static async getPaginated(
    options: ArticlePaginationOptions
  ): Promise<ServiceResponse<PaginatedResponse<Article>>> {
    try {
      const searchableFields = ['title', 'content', 'status'];
      const optionsWithSearchableFields = {
        ...options,
        searchableFields
      };

      const result = await this.getDrizzlePaginatedData<Article, typeof articles>(
        articles,
        optionsWithSearchableFields
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated articles.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<Article[]>> {
    try {
      const db = this.getDrizzle();
      const data = await db.select().from(articles);
      return { success: true, data: data as Article[] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all articles entity.`);
    }
  }

  static async getCount(): Promise<ServiceResponse<number>> {
    try {
      const db = this.getDrizzle();
      const { sql } = await import('drizzle-orm');
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(articles);
      return { success: true, data: Number(count) };
    } catch (err) {
      return this.formatError(err, `Failed to get articles count.`);
    }
  }

  static async getRecent(
    limit: number = 5
  ): Promise<ServiceResponse<Pick<Article, 'id' | 'title' | 'created_at' | 'status'>[]>> {
    try {
      const db = this.getDrizzle();
      const data = await db
        .select({
          id: articles.id,
          title: articles.title,
          created_at: articles.created_at,
          status: articles.status
        })
        .from(articles)
        .orderBy(desc(articles.created_at))
        .limit(limit);

      return { success: true, data: data as Pick<Article, 'id' | 'title' | 'created_at' | 'status'>[] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch recent articles.`);
    }
  }

  static async getRecentPublished(
    limit: number = 6
  ): Promise<ServiceResponse<Article[]>> {
    try {
      const db = this.getDrizzle();
      const data = await db
        .select()
        .from(articles)
        .where(eq(articles.status, 'published'))
        .orderBy(desc(articles.published_at))
        .limit(limit);

      return { success: true, data: data as Article[] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch recent published articles.`);
    }
  }

  static async getById(id: string): Promise<ServiceResponse<Article>> {
    try {
      const db = this.getDrizzle();
      const [data] = await db.select().from(articles).where(eq(articles.id, id));

      if (!data) {
        throw new Error('Article not found');
      }

      return { success: true, data: data as Article };
    } catch (err) {
      return this.formatError(err, `Failed to fetch articles entity.`);
    }
  }

  static async getBySlug(slug: string): Promise<ServiceResponse<Article>> {
    try {
      const db = this.getDrizzle();
      const [data] = await db
        .select()
        .from(articles)
        .where(and(eq(articles.slug, slug), eq(articles.status, 'published')));

      if (!data) {
        throw new Error('Article not found');
      }

      return { success: true, data: data as Article };
    } catch (err) {
      return this.formatError(err, `Failed to fetch articles entity by slug.`);
    }
  }

  static async insert(
    data: ArticleInsert
  ): Promise<ServiceResponse<Article>> {
    try {
      const db = this.getDrizzle();
      const insertData = { ...data };

      if (insertData.status && !['published', 'approved'].includes(insertData.status)) {
        insertData.published_at = null;
      }

      const [insertedData] = await db
        .insert(articles)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .values(insertData as any)
        .returning();

      return { success: true, data: insertedData as Article };
    } catch (err) {
      return this.formatError(err, `Failed to insert new articles entity.`);
    }
  }

  static async updateById(
    data: ArticleUpdate
  ): Promise<ServiceResponse<Article>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Entity ID is required to update.' };
      }

      const db = this.getDrizzle();
      const updateData = { ...data };

      if (updateData.status && !['published', 'approved'].includes(updateData.status)) {
        updateData.published_at = null;
      }

      const [updatedArticle] = await db
        .update(articles)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .set(updateData as any)
        .where(eq(articles.id, data.id))
        .returning();

      if (!updatedArticle) {
        throw new Error('Failed to update article');
      }

      return { success: true, data: updatedArticle as Article };
    } catch (err) {
      return this.formatError(err, `Failed to update articles entity.`);
    }
  }

  static async deleteById(id: string): Promise<ServiceResponse<undefined>> {
    try {
      if (!id) {
        return { success: false, error: 'Entity ID is required to delete.' };
      }

      const db = this.getDrizzle();
      await db.delete(articles).where(eq(articles.id, id));

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to delete articles entity.`);
    }
  }

  static async getScheduledForPublishing(): Promise<ServiceResponse<Article[]>> {
    try {
      const db = this.getDrizzle();
      const now = new Date().toISOString();

      const data = await db
        .select()
        .from(articles)
        .where(
          and(
            eq(articles.status, 'approved'),
            isNotNull(articles.published_at),
            lte(articles.published_at, now)
          )
        );

      return { success: true, data: data as Article[] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch articles scheduled for publishing.`);
    }
  }
}
