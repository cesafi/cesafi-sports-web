import { PaginatedResponse, PaginationOptions, ServiceResponse, FilterValue } from '@/lib/types/base';
import { BaseService } from './base';
import { Department, DepartmentInsert, DepartmentUpdate } from '@/lib/types/departments';

const TABLE_NAME = 'departments';

export class DepartmentService extends BaseService {
  static async getPaginated(
    options: PaginationOptions<Record<string, FilterValue>>,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<Department>>> {
    try {
      const searchableFields = ['name'];
      const optionsWithSearchableFields = {
        ...options,
        searchableFields
      };

      const result = await this.getPaginatedData<Department, typeof TABLE_NAME>(
        TABLE_NAME,
        optionsWithSearchableFields,
        selectQuery
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated departments.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<Department[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .order('name', { ascending: true });

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

  static async getById(id: number): Promise<ServiceResponse<Department>> {
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

  static async insert(data: DepartmentInsert): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();

      const { data: existingDepartment, error: checkError } = await supabase
        .from(TABLE_NAME)
        .select('id, name')
        .eq('name', data.name.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingDepartment) {
        return {
          success: false,
          error: `Department "${data.name}" already exists.`
        };
      }

      const { error } = await supabase.from(TABLE_NAME).insert({
        ...data,
        name: data.name.trim()
      });

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to insert new ${TABLE_NAME} entity.`);
    }
  }

  static async updateById(data: DepartmentUpdate): Promise<ServiceResponse<undefined>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Entity ID is required to update.' };
      }

      const supabase = await this.getClient();

      if (data.name) {
        const { data: existingDepartment, error: checkError } = await supabase
          .from(TABLE_NAME)
          .select('id, name')
          .eq('name', data.name.trim())
          .neq('id', data.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingDepartment) {
          return {
            success: false,
            error: `Department "${data.name}" already exists.`
          };
        }
      }

      const updateData = { ...data };
      if (updateData.name) {
        updateData.name = updateData.name.trim();
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

  static async deleteById(id: number): Promise<ServiceResponse<undefined>> {
    try {
      if (!id) {
        return { success: false, error: 'Entity ID is required to delete.' };
      }

      const supabase = await this.getClient();

      const { data: volunteers, error: checkError } = await supabase
        .from('volunteers')
        .select('id, full_name')
        .eq('department_id', id)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (volunteers && volunteers.length > 0) {
        return {
          success: false,
          error:
            'Cannot delete department that has associated volunteers. Please reassign volunteers first.'
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
}
