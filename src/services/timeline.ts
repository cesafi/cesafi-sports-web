import {
  PaginatedResponse,
  PaginationOptions,
  ServiceResponse,
  FilterValue
} from '@/lib/types/base';
import { BaseService } from './base';
import { Timeline, TimelineInsert, TimelineUpdate } from '@/lib/types/timeline';

const TABLE_NAME = 'cesafi_timeline';

export class TimelineService extends BaseService {
  static async getPaginated(
    options: PaginationOptions<Record<string, FilterValue>>,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<Timeline>>> {
    try {
      const searchableFields = ['title', 'description', 'year'];
      const optionsWithSearchableFields = {
        ...options,
        searchableFields
      };

      const result = await this.getPaginatedData<Timeline, typeof TABLE_NAME>(
        TABLE_NAME,
        optionsWithSearchableFields,
        selectQuery
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated ${TABLE_NAME}.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<Timeline[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('year', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all ${TABLE_NAME}.`);
    }
  }

  static async getById(id: number): Promise<ServiceResponse<Timeline>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch ${TABLE_NAME} entity.`);
    }
  }

  static async getHighlights(): Promise<ServiceResponse<Timeline[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('is_highlight', true)
        .order('year', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch highlight ${TABLE_NAME} events.`);
    }
  }

  static async getByCategory(category: string): Promise<ServiceResponse<Timeline[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('category', category)
        .order('year', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch ${TABLE_NAME} by category.`);
    }
  }

  static async insert(data: TimelineInsert): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();
      const { error } = await supabase.from(TABLE_NAME).insert(data);

      if (error) throw error;
      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to insert new ${TABLE_NAME} entity.`);
    }
  }

  static async updateById(data: TimelineUpdate): Promise<ServiceResponse<undefined>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Timeline ID is required to update.' };
      }

      const supabase = await this.getClient();
      const { error } = await supabase
        .from(TABLE_NAME)
        .update(data)
        .eq('id', data.id);

      if (error) throw error;
      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to update ${TABLE_NAME} entity.`);
    }
  }

  static async deleteById(id: number): Promise<ServiceResponse<undefined>> {
    try {
      if (!id) {
        return { success: false, error: 'Timeline ID is required to delete.' };
      }

      const supabase = await this.getClient();
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to delete ${TABLE_NAME} entity.`);
    }
  }

  static async reorderTimeline(ids: number[]): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();
      
      // Update the order of timeline items
      const updates = ids.map((id) => 
        supabase
          .from(TABLE_NAME)
          .update({ updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      
      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to reorder timeline items');
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to reorder ${TABLE_NAME} items.`);
    }
  }
}
