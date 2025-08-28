import { PaginatedResponse, PaginationOptions, ServiceResponse, FilterValue } from '@/lib/types/base';
import { BaseService } from './base';
import { SportsSeasonsStage, SportsSeasonsStageInsert, SportsSeasonsStageUpdate } from '@/lib/types/sports-seasons-stages';

const TABLE_NAME = 'sports_seasons_stages';

export class SportsSeasonsStageService extends BaseService {
  static async getPaginated(
    options: PaginationOptions<Record<string, FilterValue>>,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<SportsSeasonsStage>>> {
    try {
      const searchableFields = ['competition_stage', 'sport_category_id', 'season_id', 'created_at'];
      const optionsWithSearchableFields = {
        ...options,
        searchableFields
      };

      const result = await this.getPaginatedData<SportsSeasonsStage, typeof TABLE_NAME>(
        TABLE_NAME,
        optionsWithSearchableFields,
        selectQuery
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated sports seasons stages.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<SportsSeasonsStage[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .order('created_at', { ascending: false });

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
      const { count, error } = await supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return { success: true, data: count || 0 };
    } catch (err) {
      return this.formatError(err, `Failed to get ${TABLE_NAME} count.`);
    }
  }

  static async getById(id: number): Promise<ServiceResponse<SportsSeasonsStage>> {
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

  static async insert(data: SportsSeasonsStageInsert): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();

      // Check if the combination of sport category, season, and competition stage already exists
      if (!data.sport_category_id || !data.season_id) {
        return {
          success: false,
          error: 'Both sport category ID and season ID are required.'
        };
      }

      const { data: existingStage, error: checkError } = await supabase
        .from(TABLE_NAME)
        .select('id')
        .eq('sport_category_id', data.sport_category_id)
        .eq('season_id', data.season_id)
        .eq('competition_stage', data.competition_stage)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw checkError;
      }

      if (existingStage) {
        return {
          success: false,
          error: `A ${data.competition_stage} stage already exists for this sport and season combination.`
        };
      }

      // Verify that the referenced entities exist
      const [sportCategoryCheck, seasonCheck] = await Promise.all([
        supabase.from('sports_categories').select('id').eq('id', data.sport_category_id).single(),
        supabase.from('seasons').select('id').eq('id', data.season_id).single()
      ]);

      if (sportCategoryCheck.error) {
        return { success: false, error: 'Referenced sport category does not exist.' };
      }
      if (seasonCheck.error) {
        return { success: false, error: 'Referenced season does not exist.' };
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

  static async updateById(data: SportsSeasonsStageUpdate): Promise<ServiceResponse<undefined>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Entity ID is required to update.' };
      }

      const supabase = await this.getClient();

      // If updating relationship fields or competition stage, check for duplicates
      if (data.sport_category_id || data.season_id || data.competition_stage) {
        // Get current stage data to fill in missing fields
        const { data: currentStage, error: currentError } = await supabase
          .from(TABLE_NAME)
          .select('sport_category_id, season_id, competition_stage')
          .eq('id', data.id)
          .single();

        if (currentError) {
          throw currentError;
        }

        const sportCategoryId = data.sport_category_id || currentStage.sport_category_id;
        const seasonId = data.season_id || currentStage.season_id;
        const competitionStage = data.competition_stage || currentStage.competition_stage;

        // Ensure we have valid IDs before querying
        if (!sportCategoryId || !seasonId) {
          return {
            success: false,
            error: 'Both sport category ID and season ID are required.'
          };
        }

        // Check if the combination already exists (excluding current stage)
        const { data: existingStage, error: checkError } = await supabase
          .from(TABLE_NAME)
          .select('id')
          .eq('sport_category_id', sportCategoryId)
          .eq('season_id', seasonId)
          .eq('competition_stage', competitionStage)
          .neq('id', data.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
          throw checkError;
        }

        if (existingStage) {
          return {
            success: false,
            error: `A ${competitionStage} stage already exists for this sport and season combination.`
          };
        }

        // Verify that the referenced entities exist if they're being updated
        const checks = [];
        if (data.sport_category_id) {
          checks.push(supabase.from('sports_categories').select('id').eq('id', data.sport_category_id).single());
        }
        if (data.season_id) {
          checks.push(supabase.from('seasons').select('id').eq('id', data.season_id).single());
        }

        if (checks.length > 0) {
          const results = await Promise.all(checks);
          let index = 0;
          
          if (data.sport_category_id && results[index]?.error) {
            return { success: false, error: 'Referenced sport category does not exist.' };
          }
          if (data.sport_category_id) index++;
          
          if (data.season_id && results[index]?.error) {
            return { success: false, error: 'Referenced season does not exist.' };
          }
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

      const supabase = await this.getClient();

      // Check if this stage is referenced by matches
      const { data: matches, error: checkError } = await supabase
        .from('matches')
        .select('id')
        .eq('stage_id', id)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (matches && matches.length > 0) {
        return {
          success: false,
          error: 'Cannot delete sports seasons stage that has associated matches. Please remove matches first.'
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