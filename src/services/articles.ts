import { PaginatedResponse, PaginationOptions, ServiceResponse, FilterValue } from '@/lib/types/base';
import { BaseService } from './base';
import { Article, ArticleInsert, ArticleUpdate } from '@/lib/types/articles';
import { AuthService } from './auth';

const TABLE_NAME = 'articles';

export class ArticleService extends BaseService {
  static async getPaginated(
    options: PaginationOptions<Record<string, FilterValue>>,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<Article>>> {
    try {
      const searchableFields = ['title', 'content', 'status'];
      const optionsWithSearchableFields = {
        ...options,
        searchableFields
      };

      const result = await this.getPaginatedData<Article, typeof TABLE_NAME>(
        TABLE_NAME,
        optionsWithSearchableFields,
        selectQuery
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated articles.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<Article[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase.from(TABLE_NAME).select();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all ${TABLE_NAME} entity.`);
    }
  }

  static async getCount(): Promise<ServiceResponse<number>> {
    try {
      const supabase = await this.getClient();
      const { count, error } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return { success: true, data: count || 0 };
    } catch (err) {
      return this.formatError(err, `Failed to get ${TABLE_NAME} count.`);
    }
  }

  static async getRecent(
    limit: number = 5
  ): Promise<ServiceResponse<Pick<Article, 'id' | 'title' | 'created_at' | 'status'>[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('id, title, created_at, status')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch recent ${TABLE_NAME}.`);
    }
  }

  static async getById(id: string): Promise<ServiceResponse<Article>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase.from(TABLE_NAME).select().eq('id', id).single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch ${TABLE_NAME} entity.`);
    }
  }

  static async insert(data: ArticleInsert): Promise<ServiceResponse<undefined>> {
    try {
      const roles = ['admin', 'head_writer', 'writer'];

      const authResult = await AuthService.checkAuth(roles);

      if (!authResult.authenticated) {
        return { success: false, error: authResult.error || 'Authentication failed.' };
      }

      if (!authResult.authorized) {
        return {
          success: false,
          error: authResult.error || 'Authorization failed: insufficient permissions.'
        };
      }

      const supabase = await this.getClient();

      const insertData = { ...data };

      if (insertData.status === 'published' && !insertData.published_at) {
        insertData.published_at = new Date().toISOString();
      }

      if (insertData.status !== 'published') {
        insertData.published_at = '';
      }

      const { error } = await supabase.from(TABLE_NAME).insert(insertData);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to insert new ${TABLE_NAME} entity.`);
    }
  }

  static async updateById(data: ArticleUpdate): Promise<ServiceResponse<undefined>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Entity ID is required to update.' };
      }

      // Articles require admin, head_writer, or writer roles for write operations
      const roles = ['admin', 'head_writer', 'writer'];

      const authResult = await AuthService.checkAuth(roles);

      if (!authResult.authenticated) {
        return { success: false, error: authResult.error || 'Authentication failed.' };
      }

      if (!authResult.authorized) {
        return {
          success: false,
          error: authResult.error || 'Authorization failed: insufficient permissions.'
        };
      }

      const supabase = await this.getClient();

      // Handle publishing workflow logic
      const updateData = { ...data };

      // If article is being published and published_at is not set, set it now
      if (updateData.status === 'published' && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      // If article is being unpublished, clear published_at
      if (updateData.status !== 'published') {
        updateData.published_at = '';
      }

      const { error } = await supabase.from(TABLE_NAME).update(updateData).eq('id', data.id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to update ${TABLE_NAME} entity.`);
    }
  }

  static async deleteById(id: string): Promise<ServiceResponse<undefined>> {
    try {
      if (!id) {
        return { success: false, error: 'Entity ID is required to delete.' };
      }

      const roles = ['admin', 'head_writer', 'writer'];

      const authResult = await AuthService.checkAuth(roles);

      if (!authResult.authenticated) {
        return { success: false, error: authResult.error || 'Authentication failed.' };
      }

      if (!authResult.authorized) {
        return {
          success: false,
          error: authResult.error || 'Authorization failed: insufficient permissions.'
        };
      }

      const supabase = await this.getClient();
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to delete ${TABLE_NAME} entity.`);
    }
  }
}
