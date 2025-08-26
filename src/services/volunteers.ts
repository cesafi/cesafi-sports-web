import { PaginatedResponse, ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import {
  Volunteer,
  VolunteerInsert,
  VolunteerUpdate,
  VolunteersPaginationOptions
} from '@/lib/types/volunteers';
import { AuthService } from './auth';

const TABLE_NAME = 'volunteers';

export class VolunteerService extends BaseService {
  static async getPaginated(
    options: VolunteersPaginationOptions,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<Volunteer>>> {
    try {
      const searchableFields = ['full_name', 'department_id'];
      const optionsWithSearchableFields = {
        ...options,
        searchableFields
      };

      // Filter by season_id if provided
      if (options.filters?.season_id) {
        const supabase = await this.getClient();
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .select('*')
          .eq('season_id', options.filters.season_id)
          .order(options.sortBy || 'created_at', { ascending: options.sortOrder === 'asc' });

        if (error) {
          throw error;
        }

        // Get total count for pagination
        const { count } = await supabase
          .from(TABLE_NAME)
          .select('*', { count: 'exact', head: true })
          .eq('season_id', options.filters.season_id);

        const totalCount = count || 0;
        const pageCount = Math.ceil(totalCount / (options.pageSize || 10));
        const currentPage = options.page || 1;

        return {
          success: true,
          data: {
            data: (data || []) as Volunteer[],
            totalCount,
            pageCount,
            currentPage
          }
        };
      }

      const result = await this.getPaginatedData<Volunteer, typeof TABLE_NAME>(
        TABLE_NAME,
        optionsWithSearchableFields,
        selectQuery
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated volunteers.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<Volunteer[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .order('department_id', { ascending: true })
        .order('full_name', { ascending: true });

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

  static async getById(id: string): Promise<ServiceResponse<Volunteer>> {
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

  static async getByDepartment(departmentId: number): Promise<ServiceResponse<Volunteer[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .eq('department_id', departmentId)
        .order('full_name', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch volunteers by department_id.`);
    }
  }

  static async insert(data: VolunteerInsert): Promise<ServiceResponse<undefined>> {
    try {
      const roles = ['admin', 'head_writer'];

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

      // Validate required fields
      if (!data.full_name || data.full_name.trim().length === 0) {
        return {
          success: false,
          error: 'Full name is required and cannot be empty.'
        };
      }

      // Check for duplicate volunteer by full name
      const { data: existingVolunteer, error: duplicateError } = await supabase
        .from(TABLE_NAME)
        .select('id, full_name')
        .eq('full_name', data.full_name.trim())
        .limit(1);

      if (duplicateError) {
        throw duplicateError;
      }

      if (existingVolunteer && existingVolunteer.length > 0) {
        return {
          success: false,
          error: `A volunteer with the name "${data.full_name}" already exists.`
        };
      }

      const { error } = await supabase.from(TABLE_NAME).insert({
        ...data,
        full_name: data.full_name.trim()
      });

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to insert new ${TABLE_NAME} entity.`);
    }
  }

  static async updateById(data: VolunteerUpdate): Promise<ServiceResponse<undefined>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Entity ID is required to update.' };
      }

      const roles = ['admin', 'head_writer'];

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

      // Validate full_name if provided
      if (data.full_name !== undefined) {
        if (!data.full_name || data.full_name.trim().length === 0) {
          return {
            success: false,
            error: 'Full name cannot be empty.'
          };
        }

        // Check for duplicate volunteer by full name (excluding current volunteer)
        const { data: existingVolunteer, error: duplicateError } = await supabase
          .from(TABLE_NAME)
          .select('id, full_name')
          .eq('full_name', data.full_name.trim())
          .neq('id', data.id)
          .limit(1);

        if (duplicateError) {
          throw duplicateError;
        }

        if (existingVolunteer && existingVolunteer.length > 0) {
          return {
            success: false,
            error: `A volunteer with the name "${data.full_name}" already exists.`
          };
        }
      }

      const updateData = { ...data };
      if (updateData.full_name) {
        updateData.full_name = updateData.full_name.trim();
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

      const roles = ['admin', 'head_writer'];

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
