import { ServiceResponse } from '@/lib/types/base';
import { SportCategory, SportCategoryInsert, SportCategoryUpdate } from '@/lib/types/sports';

import { BaseService } from './base';
import { nowUtc } from '@/lib/utils/utc-time';

const TABLE_NAME = 'sports_categories';
const SCHOOLS_TEAMS_TABLE = 'schools_teams';
const SPORTS_SEASONS_STAGES_TABLE = 'sports_seasons_stages';

export class SportCategoryService extends BaseService {
  static async getAll(): Promise<ServiceResponse<SportCategory[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('sport_id', { ascending: true })
        .order('division', { ascending: true })
        .order('levels', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all sport categories.`);
    }
  }

  static async getById(id: number): Promise<ServiceResponse<SportCategory>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch sport category with ID ${id}.`);
    }
  }

  static async getBySportId(sportId: number): Promise<ServiceResponse<SportCategory[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('sport_id', sportId)
        .order('division', { ascending: true })
        .order('levels', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch sport categories for sport ${sportId}.`);
    }
  }

  static async getByDivision(
    division: 'men' | 'women' | 'mixed'
  ): Promise<ServiceResponse<SportCategory[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          sports!inner(name)
        `
        )
        .eq('division', division)
        .order('sports.name', { ascending: true })
        .order('levels', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch sport categories for division ${division}.`);
    }
  }

  static async getByLevel(
    level: 'elementary' | 'high_school' | 'college'
  ): Promise<ServiceResponse<SportCategory[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          sports!inner(name)
        `
        )
        .eq('levels', level)
        .order('sports.name', { ascending: true })
        .order('division', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch sport categories for level ${level}.`);
    }
  }

  static async getBySportAndDivision(
    sportId: number,
    division: 'men' | 'women' | 'mixed'
  ): Promise<ServiceResponse<SportCategory[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('sport_id', sportId)
        .eq('division', division)
        .order('levels', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(
        err,
        `Failed to fetch sport categories for sport ${sportId} and division ${division}.`
      );
    }
  }

  static async getBySportAndLevel(
    sportId: number,
    level: 'elementary' | 'high_school' | 'college'
  ): Promise<ServiceResponse<SportCategory[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('sport_id', sportId)
        .eq('levels', level)
        .order('division', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(
        err,
        `Failed to fetch sport categories for sport ${sportId} and level ${level}.`
      );
    }
  }

  // CRUD operations
  static async insert(data: SportCategoryInsert): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();

      // Check for duplicate sport category with same sport, division, and level
      const { data: existingCategory, error: checkError } = await supabase
        .from(TABLE_NAME)
        .select('id, sport_id, division, levels')
        .eq('sport_id', data.sport_id)
        .eq('division', data.division)
        .eq('levels', data.levels)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw checkError;
      }

      if (existingCategory) {
        return {
          success: false,
          error: `Sport category with division "${data.division}" and level "${data.levels}" already exists for this sport.`
        };
      }

      const { error } = await supabase.from(TABLE_NAME).insert({
        ...data,
        created_at: nowUtc(),
        updated_at: nowUtc()
      });

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to insert new sport category.`);
    }
  }

  static async updateById(data: SportCategoryUpdate): Promise<ServiceResponse<undefined>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Sport category ID is required to update.' };
      }

      const supabase = await this.getClient();

      // If updating sport_id, division, or levels, check for duplicates
      if (data.sport_id || data.division || data.levels) {
        // Get current category data to fill in missing fields
        const { data: currentCategory, error: currentError } = await supabase
          .from(TABLE_NAME)
          .select('sport_id, division, levels')
          .eq('id', data.id)
          .single();

        if (currentError) {
          throw currentError;
        }

        const sportId = data.sport_id || currentCategory.sport_id;
        const division = data.division || currentCategory.division;
        const levels = data.levels || currentCategory.levels;

        const { data: existingCategory, error: checkError } = await supabase
          .from(TABLE_NAME)
          .select('id, sport_id, division, levels')
          .eq('sport_id', sportId)
          .eq('division', division)
          .eq('levels', levels)
          .neq('id', data.id) // Exclude current category from duplicate check
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 is "not found" error
          throw checkError;
        }

        if (existingCategory) {
          return {
            success: false,
            error: `Sport category with division "${division}" and level "${levels}" already exists for this sport.`
          };
        }
      }

      const { error } = await supabase.from(TABLE_NAME).update({
        ...data,
        updated_at: nowUtc()
      }).eq('id', data.id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to update sport category.`);
    }
  }

  static async deleteById(id: number): Promise<ServiceResponse<undefined>> {
    try {
      if (!id) {
        return { success: false, error: 'Sport category ID is required to delete.' };
      }

      const supabase = await this.getClient();

      // Check if this category is referenced by schools_teams
      const { data: schoolsTeams, error: checkError } = await supabase
        .from(SCHOOLS_TEAMS_TABLE)
        .select('id')
        .eq('sport_category_id', id)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (schoolsTeams && schoolsTeams.length > 0) {
        return {
          success: false,
          error:
            'Cannot delete sport category that is used by teams. Please remove team associations first.'
        };
      }

      // Check if this category is referenced by sports_seasons_stages
      const { data: sportsSeasonsStages, error: stageCheckError } = await supabase
        .from(SPORTS_SEASONS_STAGES_TABLE)
        .select('id')
        .eq('sport_category_id', id)
        .limit(1);

      if (stageCheckError) {
        throw stageCheckError;
      }

      if (sportsSeasonsStages && sportsSeasonsStages.length > 0) {
        return {
          success: false,
          error:
            'Cannot delete sport category that is used in season stages. Please remove stage associations first.'
        };
      }

      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to delete sport category.`);
    }
  }

  // Utility methods for specific use cases
  static async getCategoriesWithSportDetails(): Promise<ServiceResponse<SportCategory[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          sports!inner(name)
        `
        )
        .order('sports.name', { ascending: true })
        .order('division', { ascending: true })
        .order('levels', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch sport categories with sport details.`);
    }
  }

  static async getUniqueDivisions(): Promise<ServiceResponse<string[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('division')
        .order('division', { ascending: true });

      if (error) {
        throw error;
      }

      const uniqueDivisions = [...new Set(data?.map((cat) => cat.division) || [])];
      return { success: true, data: uniqueDivisions };
    } catch (err) {
      return this.formatError(err, `Failed to fetch unique divisions.`);
    }
  }

  static async getUniqueLevels(): Promise<ServiceResponse<string[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('levels')
        .order('levels', { ascending: true });

      if (error) {
        throw error;
      }

      const uniqueLevels = [...new Set(data?.map((cat) => cat.levels) || [])];
      return { success: true, data: uniqueLevels };
    } catch (err) {
      return this.formatError(err, `Failed to fetch unique levels.`);
    }
  }

  static async getCountBySportId(sportId: number): Promise<ServiceResponse<number>> {
    try {
      const supabase = await this.getClient();
      const { count, error } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true })
        .eq('sport_id', sportId);

      if (error) {
        throw error;
      }

      return { success: true, data: count || 0 };
    } catch (err) {
      return this.formatError(err, `Failed to fetch category count for sport ${sportId}.`);
    }
  }
}
