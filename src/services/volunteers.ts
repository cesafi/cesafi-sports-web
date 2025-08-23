import { PaginatedResponse, PaginationOptions, ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import {
  Volunteer,
  VolunteerInsert,
  VolunteerUpdate,
  VolunteersPaginationOptions,
  VolunteerByDepartment,
  VolunteerDepartmentStats
} from '@/lib/types/volunteers';
import { AuthService } from './auth';

const TABLE_NAME = 'volunteers';

export class VolunteerService extends BaseService {
  static async getPaginated(
    options: VolunteersPaginationOptions,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<Volunteer>>> {
    try {
      const result = await this.getPaginatedData<Volunteer, typeof TABLE_NAME>(
        TABLE_NAME,
        options,
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
        .order('full_name', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all ${TABLE_NAME} entity.`);
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

  static async getByDepartment(department: string): Promise<ServiceResponse<Volunteer[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .eq('department', department)
        .order('full_name', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch volunteers by department.`);
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

      // Check if volunteer has authored any articles before deletion
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('id, title')
        .eq('authored_by', id)
        .limit(1);

      if (articlesError) {
        throw articlesError;
      }

      if (articles && articles.length > 0) {
        return {
          success: false,
          error:
            'Cannot delete volunteer who has authored articles. Please reassign articles first.'
        };
      }

      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to delete ${TABLE_NAME} entity.`);
    }
  }

  static async getDepartments(): Promise<ServiceResponse<string[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('department')
        .not('department', 'is', null)
        .order('department', { ascending: true });

      if (error) {
        throw error;
      }

      // Extract unique departments
      const departments: string[] = [
        ...new Set<string>(
          data
            .map((item) => item.department)
            .filter((dept): dept is string => dept !== null)
        )
      ];

      return { success: true, data: departments };
    } catch (err) {
      return this.formatError(err, `Failed to fetch volunteer departments.`);
    }
  }
}
