import { z } from 'zod';
import { ServiceResponse } from '@/lib/types/base';
import { Sponsor, SponsorPaginationOptions } from '@/lib/types/sponsors';
import { BaseService } from './base';
import { createSponsorSchema, updateSponsorSchema } from '@/lib/validations/sponsors';

const TABLE_NAME = 'sponsors';

export class SponsorService extends BaseService {
  static async getPaginated(
    options: SponsorPaginationOptions
  ): Promise<
    ServiceResponse<{ data: Sponsor[]; totalCount: number; pageCount: number; currentPage: number }>
  > {
    try {
      const supabase = await this.getClient();
      const { page, pageSize, sortBy, sortOrder, filters } = options;

      let query = supabase.from(TABLE_NAME).select('*', { count: 'exact' });

      // Apply filters
      if (filters?.title) {
        query = query.ilike('title', `%${filters.title}%`);
      }
      if (filters?.tagline) {
        query = query.ilike('tagline', `%${filters.tagline}%`);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters?.created_at?.gte) {
        query = query.gte('created_at', filters.created_at.gte);
      }
      if (filters?.created_at?.lte) {
        query = query.lte('created_at', filters.created_at.lte);
      }

      // Apply sorting
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const totalCount = count || 0;
      const pageCount = Math.ceil(totalCount / pageSize);

      return {
        success: true,
        data: {
          data: data || [],
          totalCount,
          pageCount,
          currentPage: page
        }
      };
    } catch (err) {
      return this.formatError(err, 'Failed to fetch paginated sponsors.');
    }
  }

  static async getAll(): Promise<ServiceResponse<Sponsor[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, 'Failed to fetch all sponsors.');
    }
  }

  static async getActive(): Promise<ServiceResponse<Sponsor[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, 'Failed to fetch active sponsors.');
    }
  }

  static async getById(id: string): Promise<ServiceResponse<Sponsor>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch sponsor with ID ${id}.`);
    }
  }

  static async insert(
    data: z.infer<typeof createSponsorSchema>
  ): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();
      const { error } = await supabase.from(TABLE_NAME).insert(data);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, 'Failed to create sponsor.');
    }
  }

  static async updateById(
    data: z.infer<typeof updateSponsorSchema>
  ): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();
      const { id, ...updateData } = data;

      const { error } = await supabase.from(TABLE_NAME).update(updateData).eq('id', id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to update sponsor with ID ${data.id}.`);
    }
  }

  static async deleteById(id: string): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to delete sponsor with ID ${id}.`);
    }
  }
}
