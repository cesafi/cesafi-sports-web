import { PaginatedResponse, PaginationOptions, ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import { MatchParticipant, MatchParticipantInsert, MatchParticipantUpdate } from '@/lib/types/match-participants';
import { AuthService } from './auth';

const TABLE_NAME = 'match_participants';

export class MatchParticipantService extends BaseService {
  static async getPaginated(
    options: PaginationOptions,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<MatchParticipant>>> {
    try {
      const result = await this.getPaginatedData<MatchParticipant, typeof TABLE_NAME>(
        TABLE_NAME,
        options,
        selectQuery
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated match participants.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<MatchParticipant[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .order('placement', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all ${TABLE_NAME} entity.`);
    }
  }

  static async getById(id: string): Promise<ServiceResponse<MatchParticipant>> {
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

  static async insert(data: MatchParticipantInsert): Promise<ServiceResponse<undefined>> {
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

      // Check if the combination of match and team already exists
      const { data: existingParticipant, error: checkError } = await supabase
        .from(TABLE_NAME)
        .select('id')
        .eq('matches_id', data.matches_id)
        .eq('schools_teams_id', data.schools_teams_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw checkError;
      }

      if (existingParticipant) {
        return {
          success: false,
          error: `This team is already participating in this match.`
        };
      }

      // Verify that the referenced entities exist
      const [matchCheck, teamCheck] = await Promise.all([
        supabase.from('matches').select('id').eq('id', data.matches_id).single(),
        supabase.from('schools_teams').select('id').eq('id', data.schools_teams_id).single()
      ]);

      if (matchCheck.error) {
        return { success: false, error: 'Referenced match does not exist.' };
      }
      if (teamCheck.error) {
        return { success: false, error: 'Referenced team does not exist.' };
      }

      // If placement is provided, check if it's already taken in this match
      if (data.placement) {
        const { data: placementCheck, error: placementError } = await supabase
          .from(TABLE_NAME)
          .select('id')
          .eq('matches_id', data.matches_id)
          .eq('placement', data.placement)
          .single();

        if (placementError && placementError.code !== 'PGRST116') {
          throw placementError;
        }

        if (placementCheck) {
          return {
            success: false,
            error: `Placement ${data.placement} is already taken in this match.`
          };
        }
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

  static async updateById(data: MatchParticipantUpdate): Promise<ServiceResponse<undefined>> {
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
      if (data.matches_id || data.schools_teams_id) {
        // Get current participant data to fill in missing relationship IDs
        const { data: currentParticipant, error: currentError } = await supabase
          .from(TABLE_NAME)
          .select('matches_id, schools_teams_id')
          .eq('id', data.id)
          .single();

        if (currentError) {
          throw currentError;
        }

        const matchesId = data.matches_id || currentParticipant.matches_id;
        const schoolsTeamsId = data.schools_teams_id || currentParticipant.schools_teams_id;

        // Check if the combination already exists (excluding current participant)
        const { data: existingParticipant, error: checkError } = await supabase
          .from(TABLE_NAME)
          .select('id')
          .eq('matches_id', matchesId)
          .eq('schools_teams_id', schoolsTeamsId)
          .neq('id', data.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
          throw checkError;
        }

        if (existingParticipant) {
          return {
            success: false,
            error: `This team is already participating in this match.`
          };
        }

        // Verify that the referenced entities exist if they're being updated
        const checks = [];
        if (data.matches_id) {
          checks.push(supabase.from('matches').select('id').eq('id', data.matches_id).single());
        }
        if (data.schools_teams_id) {
          checks.push(supabase.from('schools_teams').select('id').eq('id', data.schools_teams_id).single());
        }

        if (checks.length > 0) {
          const results = await Promise.all(checks);
          let index = 0;
          
          if (data.matches_id && results[index]?.error) {
            return { success: false, error: 'Referenced match does not exist.' };
          }
          if (data.matches_id) index++;
          
          if (data.schools_teams_id && results[index]?.error) {
            return { success: false, error: 'Referenced team does not exist.' };
          }
        }
      }

      // If placement is being updated, check if it's already taken in this match
      if (data.placement) {
        // Get the match ID for this participant
        const { data: currentParticipant, error: currentError } = await supabase
          .from(TABLE_NAME)
          .select('matches_id')
          .eq('id', data.id)
          .single();

        if (currentError) {
          throw currentError;
        }

        const matchId = data.matches_id || currentParticipant.matches_id;

        const { data: placementCheck, error: placementError } = await supabase
          .from(TABLE_NAME)
          .select('id')
          .eq('matches_id', matchId)
          .eq('placement', data.placement)
          .neq('id', data.id)
          .single();

        if (placementError && placementError.code !== 'PGRST116') {
          throw placementError;
        }

        if (placementCheck) {
          return {
            success: false,
            error: `Placement ${data.placement} is already taken in this match.`
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

      // Check if this participant has game scores
      const { data: gameScores, error: checkError } = await supabase
        .from('game_scores')
        .select('id')
        .eq('match_participants_id', id)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (gameScores && gameScores.length > 0) {
        return {
          success: false,
          error: 'Cannot delete match participant that has game scores. Please remove game scores first.'
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