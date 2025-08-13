import { PaginatedResponse, PaginationOptions, ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import { Match, MatchInsert, MatchUpdate } from '@/lib/types/matches';
import { AuthService } from './auth';

const TABLE_NAME = 'matches';

export class MatchService extends BaseService {
  static async getPaginated(
    options: PaginationOptions,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<Match>>> {
    try {
      const result = await this.getPaginatedData<Match, typeof TABLE_NAME>(
        TABLE_NAME,
        options,
        selectQuery
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated matches.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<Match[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .order('scheduled_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all ${TABLE_NAME} entity.`);
    }
  }

  static async getById(id: string): Promise<ServiceResponse<Match>> {
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

  static async insert(data: MatchInsert): Promise<ServiceResponse<undefined>> {
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

      // Validate that the sports_seasons_stages_id exists
      const { data: stageExists, error: stageError } = await supabase
        .from('sports_seasons_stages')
        .select('id')
        .eq('id', data.sports_seasons_stages_id)
        .single();

      if (stageError && stageError.code !== 'PGRST116') {
        throw stageError;
      }

      if (!stageExists) {
        return {
          success: false,
          error: 'Invalid sports seasons stage ID provided.'
        };
      }

      // Check for scheduling conflicts if scheduled_at is provided
      if (data.scheduled_at) {
        const scheduledDate = new Date(data.scheduled_at);
        const bufferMinutes = 30; // 30-minute buffer between matches
        const startBuffer = new Date(scheduledDate.getTime() - bufferMinutes * 60000);
        const endBuffer = new Date(scheduledDate.getTime() + bufferMinutes * 60000);

        const { data: conflictingMatches, error: conflictError } = await supabase
          .from(TABLE_NAME)
          .select('id, name, scheduled_at')
          .not('scheduled_at', 'is', null)
          .gte('scheduled_at', startBuffer.toISOString())
          .lte('scheduled_at', endBuffer.toISOString());

        if (conflictError) {
          throw conflictError;
        }

        if (conflictingMatches && conflictingMatches.length > 0) {
          return {
            success: false,
            error: `Match scheduling conflict detected with: ${conflictingMatches.map(m => m.name).join(', ')}`
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

  static async updateById(data: MatchUpdate): Promise<ServiceResponse<undefined>> {
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

      // Validate sports_seasons_stages_id if provided
      if (data.sports_seasons_stages_id) {
        const { data: stageExists, error: stageError } = await supabase
          .from('sports_seasons_stages')
          .select('id')
          .eq('id', data.sports_seasons_stages_id)
          .single();

        if (stageError && stageError.code !== 'PGRST116') {
          throw stageError;
        }

        if (!stageExists) {
          return {
            success: false,
            error: 'Invalid sports seasons stage ID provided.'
          };
        }
      }

      // Check for scheduling conflicts if scheduled_at is being updated
      if (data.scheduled_at) {
        const scheduledDate = new Date(data.scheduled_at);
        const bufferMinutes = 30; // 30-minute buffer between matches
        const startBuffer = new Date(scheduledDate.getTime() - bufferMinutes * 60000);
        const endBuffer = new Date(scheduledDate.getTime() + bufferMinutes * 60000);

        const { data: conflictingMatches, error: conflictError } = await supabase
          .from(TABLE_NAME)
          .select('id, name, scheduled_at')
          .neq('id', data.id) // Exclude current match
          .not('scheduled_at', 'is', null)
          .gte('scheduled_at', startBuffer.toISOString())
          .lte('scheduled_at', endBuffer.toISOString());

        if (conflictError) {
          throw conflictError;
        }

        if (conflictingMatches && conflictingMatches.length > 0) {
          return {
            success: false,
            error: `Match scheduling conflict detected with: ${conflictingMatches.map(m => m.name).join(', ')}`
          };
        }
      }

      // Validate time sequence if updating time fields
      if (data.start_at || data.end_at || data.scheduled_at) {
        // Get current match data to fill in missing times
        const { data: currentMatch, error: currentError } = await supabase
          .from(TABLE_NAME)
          .select('scheduled_at, start_at, end_at')
          .eq('id', data.id)
          .single();

        if (currentError) {
          throw currentError;
        }

        const scheduledAt = data.scheduled_at !== undefined ? data.scheduled_at : currentMatch.scheduled_at;
        const startAt = data.start_at !== undefined ? data.start_at : currentMatch.start_at;
        const endAt = data.end_at !== undefined ? data.end_at : currentMatch.end_at;

        // Validate time sequence
        if (scheduledAt && startAt && new Date(scheduledAt) > new Date(startAt)) {
          return {
            success: false,
            error: 'Scheduled time must be before or equal to start time.'
          };
        }

        if (startAt && endAt && new Date(startAt) >= new Date(endAt)) {
          return {
            success: false,
            error: 'Start time must be before end time.'
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

      // Check if match has associated games or participants before deletion
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('id')
        .eq('match_id', id)
        .limit(1);

      if (gamesError) {
        throw gamesError;
      }

      if (games && games.length > 0) {
        return {
          success: false,
          error: 'Cannot delete match with associated games. Delete games first.'
        };
      }

      const { data: participants, error: participantsError } = await supabase
        .from('match_participants')
        .select('id')
        .eq('matches_id', id)
        .limit(1);

      if (participantsError) {
        throw participantsError;
      }

      if (participants && participants.length > 0) {
        return {
          success: false,
          error: 'Cannot delete match with associated participants. Remove participants first.'
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