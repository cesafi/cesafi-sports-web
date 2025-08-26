import {
  PaginatedResponse,
  PaginationOptions,
  ServiceResponse,
  FilterValue
} from '@/lib/types/base';
import { BaseService } from './base';
import { Sport, SportInsert, SportUpdate, SportCategoryFormData } from '@/lib/types/sports';
import { AuthService } from './auth';

const TABLE_NAME = 'sports';

export class SportService extends BaseService {
  static async getPaginated(
    options: PaginationOptions<Record<string, FilterValue>>
  ): Promise<ServiceResponse<PaginatedResponse<Sport>>> {
    try {
      const searchableFields = ['name', 'created_at', 'updated_at'];
      const optionsWithSearchableFields = {
        ...options,
        searchableFields
      };

      // Use a custom select query to include category count
      const customSelectQuery = `
        *,
        _count: sports_categories(count)
      `;

      const result = await this.getPaginatedData<Sport, typeof TABLE_NAME>(
        TABLE_NAME,
        optionsWithSearchableFields,
        customSelectQuery
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

  static async getById(id: number): Promise<ServiceResponse<Sport>> {
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

      // Check for duplicate sport name
      const { data: existingSport, error: checkError } = await supabase
        .from(TABLE_NAME)
        .select('id, name')
        .eq('name', data.name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw checkError;
      }

      if (existingSport) {
        return {
          success: false,
          error: `Sport "${data.name}" already exists.`
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

  static async insertWithCategories(
    sportData: SportInsert,
    categories: SportCategoryFormData[]
  ): Promise<ServiceResponse<{ sportId: number }>> {
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

      // Check for duplicate sport name
      const { data: existingSport, error: checkError } = await supabase
        .from(TABLE_NAME)
        .select('id, name')
        .eq('name', sportData.name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw checkError;
      }

      if (existingSport) {
        return {
          success: false,
          error: `Sport "${sportData.name}" already exists.`
        };
      }

      // Start a transaction by inserting the sport first
      const { data: insertedSport, error: sportError } = await supabase
        .from(TABLE_NAME)
        .insert(sportData)
        .select('id')
        .single();

      if (sportError) {
        throw sportError;
      }

      const sportId = insertedSport.id;

      // If we have categories, create them
      if (categories.length > 0) {
        // Validate category data
        for (const category of categories) {
          if (!category.division || !category.levels) {
            return {
              success: false,
              error: 'All categories must have both division and level specified.'
            };
          }
        }

        // Create all categories
        const categoryData = categories.map((category) => ({
          sport_id: sportId,
          division: category.division,
          levels: category.levels
        }));

        const { error: categoriesError } = await supabase
          .from('sports_categories')
          .insert(categoryData);

        if (categoriesError) {
          // If categories fail to create, we should rollback the sport creation
          // For now, we'll just return an error
          return {
            success: false,
            error: `Sport created but failed to create categories: ${categoriesError.message}`
          };
        }
      }

      return { success: true, data: { sportId } };
    } catch (err) {
      return this.formatError(err, `Failed to insert new sport with categories`);
    }
  }

  static async addCategoriesToExistingSport(
    sportId: number,
    categories: SportCategoryFormData[]
  ): Promise<ServiceResponse<undefined>> {
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

      // Verify the sport exists
      const { error: sportCheckError } = await supabase
        .from(TABLE_NAME)
        .select('id')
        .eq('id', sportId)
        .single();

      if (sportCheckError) {
        return {
          success: false,
          error: 'Sport not found.'
        };
      }

      if (categories.length === 0) {
        return { success: true, data: undefined };
      }

      // Validate category data
      for (const category of categories) {
        if (!category.division || !category.levels) {
          return {
            success: false,
            error: 'All categories must have both division and level specified.'
          };
        }
      }

      // Check for duplicate categories
      for (const category of categories) {
        const { data: existingCategory, error: checkError } = await supabase
          .from('sports_categories')
          .select('id')
          .eq('sport_id', sportId)
          .eq('division', category.division)
          .eq('levels', category.levels)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 is "not found" error
          throw checkError;
        }

        if (existingCategory) {
          return {
            success: false,
            error: `Category with division "${category.division}" and level "${category.levels}" already exists for this sport.`
          };
        }
      }

      // Create all categories
      const categoryData = categories.map((category) => ({
        sport_id: sportId,
        division: category.division,
        levels: category.levels
      }));

      const { error: categoriesError } = await supabase
        .from('sports_categories')
        .insert(categoryData);

      if (categoriesError) {
        return {
          success: false,
          error: `Failed to create categories: ${categoriesError.message}`
        };
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to add categories to existing sport`);
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

      // If updating name, check for duplicates
      if (data.name) {
        const { data: existingSport, error: checkError } = await supabase
          .from(TABLE_NAME)
          .select('id, name')
          .eq('name', data.name)
          .neq('id', data.id) // Exclude current sport from duplicate check
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 is "not found" error
          throw checkError;
        }

        if (existingSport) {
          return {
            success: false,
            error: `Sport "${data.name}" already exists.`
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

  static async deleteById(id: number): Promise<ServiceResponse<undefined>> {
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
