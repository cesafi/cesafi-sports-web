import { ServiceResponse } from '@/lib/types/base';
import {
  SchoolsTeamInsert,
  SchoolsTeamUpdate,
  SchoolsTeamWithSportDetails,
  SchoolsTeamWithSchoolDetails,
  SchoolsTeamWithFullDetails
} from '@/lib/types/schools-teams';
import { BaseService } from './base';

const TABLE_NAME = 'schools_teams';

export class SchoolsTeamService extends BaseService {
  static async getBySchoolId(
    schoolId: string
  ): Promise<ServiceResponse<SchoolsTeamWithSportDetails[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          sports_categories!inner(
            id,
            division,
            levels,
            sports!inner(name)
          )
        `
        )
        .eq('school_id', schoolId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch teams for school ${schoolId}.`);
    }
  }

  static async getBySeasonId(
    seasonId: number
  ): Promise<ServiceResponse<SchoolsTeamWithSchoolDetails[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          schools!inner(name, abbreviation, logo_url),
          sports_categories!inner(
            id,
            division,
            levels,
            sports!inner(name)
          )
        `
        )
        .eq('season_id', seasonId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch teams for season ${seasonId}.`);
    }
  }

  static async getBySportCategoryId(
    sportCategoryId: number
  ): Promise<ServiceResponse<SchoolsTeamWithSchoolDetails[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          schools!inner(name, abbreviation, logo_url)
        `
        )
        .eq('sport_category_id', sportCategoryId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch teams for sport category ${sportCategoryId}.`);
    }
  }

  static async getBySchoolAndSeason(
    schoolId: string,
    seasonId: number
  ): Promise<ServiceResponse<SchoolsTeamWithSportDetails[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          sports_categories!inner(
            id,
            division,
            levels,
            sports!inner(name)
          )
        `
        )
        .eq('school_id', schoolId)
        .eq('season_id', seasonId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(
        err,
        `Failed to fetch teams for school ${schoolId} and season ${seasonId}.`
      );
    }
  }

  static async getBySchoolAndSportCategory(
    schoolId: string,
    sportCategoryId: number
  ): Promise<ServiceResponse<SchoolsTeamWithFullDetails[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          sports_categories!inner(
            id,
            division,
            levels,
            sports!inner(name)
          ),
          seasons!inner(
            id,
            start_at,
            end_at
          )
        `
        )
        .eq('school_id', schoolId)
        .eq('sport_category_id', sportCategoryId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(
        err,
        `Failed to fetch teams for school ${schoolId} and sport category ${sportCategoryId}.`
      );
    }
  }

  static async insert(data: SchoolsTeamInsert): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();

      // Check if the combination of school, season, and sport already exists
      const { data: existingTeam, error: checkError } = await supabase
        .from(TABLE_NAME)
        .select('id, name')
        .eq('school_id', data.school_id)
        .eq('season_id', data.season_id)
        .eq('sport_category_id', data.sport_category_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw checkError;
      }

      if (existingTeam) {
        return {
          success: false,
          error: `A team already exists for this school, season, and sport combination.`
        };
      }

      // Verify that the referenced entities exist
      const [schoolCheck, seasonCheck, sportCheck] = await Promise.all([
        supabase.from('schools').select('id').eq('id', data.school_id).single(),
        supabase.from('seasons').select('id').eq('id', data.season_id).single(),
        supabase.from('sports_categories').select('id').eq('id', data.sport_category_id).single()
      ]);

      if (schoolCheck.error) {
        return { success: false, error: 'Referenced school does not exist.' };
      }
      if (seasonCheck.error) {
        return { success: false, error: 'Referenced season does not exist.' };
      }
      if (sportCheck.error) {
        return { success: false, error: 'Referenced sport does not exist.' };
      }

      const { error } = await supabase.from(TABLE_NAME).insert(data);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to insert new team.`);
    }
  }

  static async updateById(data: SchoolsTeamUpdate): Promise<ServiceResponse<undefined>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Team ID is required to update.' };
      }

      const supabase = await this.getClient();

      // If updating relationship fields, check for duplicates
      if (data.school_id || data.season_id || data.sport_category_id) {
        // Get current team data to fill in missing relationship IDs
        const { data: currentTeam, error: currentError } = await supabase
          .from(TABLE_NAME)
          .select('school_id, season_id, sport_category_id')
          .eq('id', data.id)
          .single();

        if (currentError) {
          throw currentError;
        }

        const schoolsId = data.school_id || currentTeam.school_id;
        const seasonsId = data.season_id || currentTeam.season_id;
        const sportsId = data.sport_category_id || currentTeam.sport_category_id;

        // Check if the combination already exists (excluding current team)
        const { data: existingTeam, error: checkError } = await supabase
          .from(TABLE_NAME)
          .select('id, name')
          .eq('school_id', schoolsId)
          .eq('season_id', seasonsId)
          .eq('sport_category_id', sportsId)
          .neq('id', data.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 is "not found" error
          throw checkError;
        }

        if (existingTeam) {
          return {
            success: false,
            error: `A team already exists for this school, season, and sport combination.`
          };
        }

        // Verify that the referenced entities exist if they're being updated
        const checks = [];
        if (data.school_id) {
          checks.push(supabase.from('schools').select('id').eq('id', data.school_id).single());
        }
        if (data.season_id) {
          checks.push(supabase.from('seasons').select('id').eq('id', data.season_id).single());
        }
        if (data.sport_category_id) {
          checks.push(
            supabase
              .from('sports_categories')
              .select('id')
              .eq('id', data.sport_category_id)
              .single()
          );
        }

        if (checks.length > 0) {
          const results = await Promise.all(checks);
          let index = 0;

          if (data.school_id && results[index]?.error) {
            return { success: false, error: 'Referenced school does not exist.' };
          }
          if (data.school_id) index++;

          if (data.season_id && results[index]?.error) {
            return { success: false, error: 'Referenced season does not exist.' };
          }
          if (data.season_id) index++;

          if (data.sport_category_id && results[index]?.error) {
            return { success: false, error: 'Referenced sport does not exist.' };
          }
        }
      }

      const { error } = await supabase.from(TABLE_NAME).update(data).eq('id', data.id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to update team.`);
    }
  }

  static async deleteById(id: string): Promise<ServiceResponse<undefined>> {
    try {
      if (!id) {
        return { success: false, error: 'Team ID is required to delete.' };
      }

      const supabase = await this.getClient();

      // Check if this team is referenced by match participants
      const { data: matchParticipants, error: checkError } = await supabase
        .from('match_participants')
        .select('id')
        .eq('team_id', id)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (matchParticipants && matchParticipants.length > 0) {
        return {
          success: false,
          error:
            'Cannot delete team that has participated in matches. Please remove match participations first.'
        };
      }

      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to delete team.`);
    }
  }

  // Utility methods for specific use cases
  static async getTeamsWithFullDetails(
    schoolId: string
  ): Promise<ServiceResponse<SchoolsTeamWithFullDetails[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          sports_categories!inner(
            id,
            division,
            levels,
            sports!inner(name)
          ),
          seasons!inner(
            id,
            start_at,
            end_at
          )
        `
        )
        .eq('school_id', schoolId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(
        err,
        `Failed to fetch teams with full details for school ${schoolId}.`
      );
    }
  }

  static async getActiveTeamsBySchool(
    schoolId: string
  ): Promise<ServiceResponse<SchoolsTeamWithSportDetails[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          sports_categories!inner(
            id,
            division,
            levels,
            sports!inner(name)
          )
        `
        )
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch active teams for school ${schoolId}.`);
    }
  }

  static async getTeamsForStage(
    stageId: number
  ): Promise<ServiceResponse<SchoolsTeamWithSchoolDetails[]>> {
    try {
      const supabase = await this.getClient();
      
      // First get the stage details to know which sport category and season
      const { data: stage, error: stageError } = await supabase
        .from('sports_seasons_stages')
        .select('sport_category_id, season_id')
        .eq('id', stageId)
        .single();

      if (stageError) {
        throw stageError;
      }

      if (!stage.sport_category_id || !stage.season_id) {
        return { success: false, error: 'Stage must have both sport category and season defined.' };
      }

      // Get teams for this sport category and season
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          schools!inner(name, abbreviation, logo_url),
          sports_categories!inner(
            id,
            division,
            levels,
            sports!inner(name)
          )
        `
        )
        .eq('sport_category_id', stage.sport_category_id)
        .eq('season_id', stage.season_id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch teams for stage ${stageId}.`);
    }
  }
}
