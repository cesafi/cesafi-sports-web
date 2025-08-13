import { PaginatedResponse, PaginationOptions, ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import { Sport, SportInsert, SportUpdate } from '@/lib/types/sports';
import { AuthService } from './auth';

const TABLE_NAME = 'sports';

export class SportService extends BaseService {
  static async getPaginated(
    options: PaginationOptions,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<Sport>>> {
    try {
      const result = await this.getPaginatedData<Sport, typeof TABLE_NAME>(
        TABLE_NAME,
        options,
        selectQuery
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated sports.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<Sport[]>> {
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

  static async getById(id: string): Promise<ServiceResponse<Sport>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch ${TABLE_NAME} entity.`);
    }
  }

  static async insert(data: SportInsert): Promise<ServiceResponse<undefined>> {
    try {
      const roles = ['admin', 'league_operator'];

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

      // Check for duplicate sport name with same division and level
      const { data: existingSport, error: checkError } = await supabase
        .from(TABLE_NAME)
        .select('id, name, division, level')
        .eq('name', data.name)
        .eq('division', data.division)
        .eq('level', data.level)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw checkError;
      }

      if (existingSport) {
        return {
          success: false,
          error: `Sport "${data.name}" already exists for ${data.division} ${data.level}.`
        };
      }

      const { error } = await supabase.from(TABLE_NAME).insert(data);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to insert new ${TABLE_NAME} entity.`);
    }
  }

  static async updateById(data: SportUpdate): Promise<ServiceResponse<undefined>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Entity ID is required to update.' };
      }

      const roles = ['admin', 'league_operator'];

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

      // If updating name, division, or level, check for duplicates
      if (data.name || data.division || data.level) {
        // Get current sport data to fill in missing fields
        const { data: currentSport, error: currentError } = await supabase
          .from(TABLE_NAME)
          .select('name, division, level')
          .eq('id', data.id)
          .single();

        if (currentError) {
          throw currentError;
        }

        const name = data.name || currentSport.name;
        const division = data.division || currentSport.division;
        const level = data.level || currentSport.level;

        const { data: existingSport, error: checkError } = await supabase
          .from(TABLE_NAME)
          .select('id, name, division, level')
          .eq('name', name)
          .eq('division', division)
          .eq('level', level)
          .neq('id', data.id) // Exclude current sport from duplicate check
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
          throw checkError;
        }

        if (existingSport) {
          return {
            success: false,
            error: `Sport "${name}" already exists for ${division} ${level}.`
          };
        }
      }

      const { error } = await supabase.from(TABLE_NAME).update(data).eq('id', data.id);

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

      const roles = ['admin', 'league_operator'];

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