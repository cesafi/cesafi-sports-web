import { PaginatedResponse, PaginationOptions, ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import { SchoolsTeam, SchoolsTeamInsert, SchoolsTeamUpdate } from '@/lib/types/schools-teams';
import { AuthService } from './auth';

const TABLE_NAME = 'schools_teams';

export class SchoolsTeamService extends BaseService {
  static async getPaginated(
    options: PaginationOptions,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<SchoolsTeam>>> {
    try {
      const result = await this.getPaginatedData<SchoolsTeam, typeof TABLE_NAME>(
        TABLE_NAME,
        options,
        selectQuery
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated schools teams.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<SchoolsTeam[]>> {
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

  static async getById(id: string): Promise<ServiceResponse<SchoolsTeam>> {
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
static async insert(data: SchoolsTeamInsert): Promise<ServiceResponse<undefined>> {
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

      // Check if the combination of school, season, and sport already exists
      const { data: existingTeam, error: checkError } = await supabase
        .from(TABLE_NAME)
        .select('id, name')
        .eq('schools_id', data.schools_id)
        .eq('seasons_id', data.seasons_id)
        .eq('sports_id', data.sports_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
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
        supabase.from('schools').select('id').eq('id', data.schools_id).single(),
        supabase.from('seasons').select('id').eq('id', data.seasons_id).single(),
        supabase.from('sports').select('id').eq('id', data.sports_id).single()
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
      return this.formatError(err, `Failed to insert new ${TABLE_NAME} entity.`);
    }
  }

  static async updateById(data: SchoolsTeamUpdate): Promise<ServiceResponse<undefined>> {
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

      // If updating relationship fields, check for duplicates
      if (data.schools_id || data.seasons_id || data.sports_id) {
        // Get current team data to fill in missing relationship IDs
        const { data: currentTeam, error: currentError } = await supabase
          .from(TABLE_NAME)
          .select('schools_id, seasons_id, sports_id')
          .eq('id', data.id)
          .single();

        if (currentError) {
          throw currentError;
        }

        const schoolsId = data.schools_id || currentTeam.schools_id;
        const seasonsId = data.seasons_id || currentTeam.seasons_id;
        const sportsId = data.sports_id || currentTeam.sports_id;

        // Check if the combination already exists (excluding current team)
        const { data: existingTeam, error: checkError } = await supabase
          .from(TABLE_NAME)
          .select('id, name')
          .eq('schools_id', schoolsId)
          .eq('seasons_id', seasonsId)
          .eq('sports_id', sportsId)
          .neq('id', data.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
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
        if (data.schools_id) {
          checks.push(supabase.from('schools').select('id').eq('id', data.schools_id).single());
        }
        if (data.seasons_id) {
          checks.push(supabase.from('seasons').select('id').eq('id', data.seasons_id).single());
        }
        if (data.sports_id) {
          checks.push(supabase.from('sports').select('id').eq('id', data.sports_id).single());
        }

        if (checks.length > 0) {
          const results = await Promise.all(checks);
          let index = 0;
          
          if (data.schools_id && results[index]?.error) {
            return { success: false, error: 'Referenced school does not exist.' };
          }
          if (data.schools_id) index++;
          
          if (data.seasons_id && results[index]?.error) {
            return { success: false, error: 'Referenced season does not exist.' };
          }
          if (data.seasons_id) index++;
          
          if (data.sports_id && results[index]?.error) {
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

      // Check if this team is referenced by match participants
      const { data: matchParticipants, error: checkError } = await supabase
        .from('match_participants')
        .select('id')
        .eq('schools_teams_id', id)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (matchParticipants && matchParticipants.length > 0) {
        return {
          success: false,
          error: 'Cannot delete team that has participated in matches. Please remove match participations first.'
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