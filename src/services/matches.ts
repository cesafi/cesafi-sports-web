import { PaginatedResponse, PaginationOptions, ServiceResponse, FilterValue } from '@/lib/types/base';
import { BaseService } from './base';
import { Match, MatchInsert, MatchUpdate, MatchWithStageDetails, MatchWithFullDetails } from '@/lib/types/matches';

const TABLE_NAME = 'matches';

export class MatchService extends BaseService {
  static async getPaginated(
    options: PaginationOptions<Record<string, FilterValue>>,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<Match>>> {
    try {
      const searchableFields = ['name', 'scheduled_at', 'created_at'];
      const optionsWithSearchableFields = {
        ...options,
        searchableFields
      };

      const result = await this.getPaginatedData<Match, typeof TABLE_NAME>(
        TABLE_NAME,
        optionsWithSearchableFields,
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

  static async getRecent(limit: number = 5): Promise<ServiceResponse<Pick<Match, 'id' | 'name' | 'scheduled_at' | 'created_at'>[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('id, name, scheduled_at, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch recent ${TABLE_NAME}.`);
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

  static async getById(id: number): Promise<ServiceResponse<Match>> {
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

  static async getByIdBasic(id: number): Promise<ServiceResponse<MatchWithFullDetails>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          sports_seasons_stages!inner(
            id,
            competition_stage,
            season_id,
            sport_category_id,
            sports_categories!inner(
              id,
              division,
              levels,
              sports!inner(
                id,
                name
              )
            ),
            seasons!inner(
              id,
              start_at,
              end_at
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch ${TABLE_NAME} entity with basic details.`);
    }
  }

  static async getByIdWithDetails(id: number): Promise<ServiceResponse<MatchWithFullDetails>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          sports_seasons_stages!inner(
            id,
            competition_stage,
            season_id,
            sport_category_id,
            sports_categories!inner(
              id,
              division,
              levels,
              sports!inner(
                id,
                name
              )
            ),
            seasons!inner(
              id,
              start_at,
              end_at
            )
          ),
          match_participants!inner(
            id,
            match_id,
            team_id,
            schools_teams!inner(
              id,
              name,
              schools!inner(
                name,
                abbreviation,
                logo_url
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      console.log(data)

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch ${TABLE_NAME} entity with details.`);
    }
  }

  static async getByStageId(stageId: number): Promise<ServiceResponse<MatchWithStageDetails[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          sports_seasons_stages!inner(
            id,
            competition_stage,
            season_id,
            sport_category_id,
            sports_categories!inner(
              id,
              division,
              levels,
              sports!inner(
                id,
                name
              )
            ),
            seasons!inner(
              id,
              start_at,
              end_at
            )
          )
        `)
        .eq('stage_id', stageId)
        .order('scheduled_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch matches for stage ${stageId}.`);
    }
  }

  static async getBySportAndCategory(sportId: number, sportCategoryId: number): Promise<ServiceResponse<Match[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          sports_seasons_stages!inner(
            id,
            competition_stage,
            season_id,
            sport_category_id,
            sports_categories!inner(
              id,
              division,
              levels,
              sports!inner(
                id,
                name
              )
            ),
            seasons!inner(
              id,
              start_at,
              end_at
            )
          )
        `)
        .eq('sports_seasons_stages.sport_category_id', sportCategoryId)
        .order('scheduled_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch matches for sport category ${sportCategoryId}.`);
    }
  }

  static async getBySeason(seasonId: number): Promise<ServiceResponse<Match[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          sports_seasons_stages!inner(
            id,
            competition_stage,
            season_id,
            sport_category_id,
            sports_categories!inner(
              id,
              division,
              levels,
              sports!inner(
                id,
                name
              )
            ),
            seasons!inner(
              id,
              start_at,
              end_at
            )
          )
        `)
        .eq('sports_seasons_stages.season_id', seasonId)
        .order('scheduled_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch matches for season ${seasonId}.`);
    }
  }

  static async insert(data: MatchInsert): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();

      // Validate that the sports_seasons_stage_id exists
      const { data: stageExists, error: stageError } = await supabase
        .from('sports_seasons_stages')
        .select('id')
        .eq('id', data.stage_id)
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

      const supabase = await this.getClient();

      // Validate stage_id if provided
      if (data.stage_id) {
        const { data: stageExists, error: stageError } = await supabase
          .from('sports_seasons_stages')
          .select('id')
          .eq('id', data.stage_id)
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
            error: 'Scheduled t ime must be before or equal to start time.'
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

  static async insertWithParticipants(
    matchData: MatchInsert,
    participantTeamIds: string[]
  ): Promise<ServiceResponse<{ matchId: number }>> {
    try {
      const supabase = await this.getClient();

      // Validate that the sports_seasons_stage_id exists
      const { data: stageExists, error: stageError } = await supabase
        .from('sports_seasons_stages')
        .select('id')
        .eq('id', matchData.stage_id)
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
      if (matchData.scheduled_at) {
        const scheduledDate = new Date(matchData.scheduled_at);
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
            error: `Match scheduling conflict detected with: ${conflictingMatches.map((m: { name: string }) => m.name).join(', ')}`
          };
        }
      }

      // Validate that all team IDs exist
      if (participantTeamIds.length > 0) {
        const { data: teams, error: teamsError } = await supabase
          .from('schools_teams')
          .select('id')
          .in('id', participantTeamIds);

        if (teamsError) {
          throw teamsError;
        }

        if (!teams || teams.length !== participantTeamIds.length) {
          return {
            success: false,
            error: 'One or more team IDs are invalid.'
          };
        }
      }

      // Insert the match first
      const { data: insertedMatch, error: matchError } = await supabase
        .from(TABLE_NAME)
        .insert(matchData)
        .select('id')
        .single();

      if (matchError) {
        throw matchError;
      }

      const matchId = insertedMatch.id;

      // Insert match participants if any
      if (participantTeamIds.length > 0) {
        const participantData = participantTeamIds.map(teamId => ({
          match_id: matchId,
          team_id: teamId
        }));

        const { error: participantsError } = await supabase
          .from('match_participants')
          .insert(participantData);

        if (participantsError) {
          // If participants insertion fails, clean up the match
          await supabase.from(TABLE_NAME).delete().eq('id', matchId);
          throw participantsError;
        }
      }

      return { success: true, data: { matchId } };
    } catch (err) {
      return this.formatError(err, `Failed to create match with participants.`);
    }
  }

  static async deleteById(id: number): Promise<ServiceResponse<undefined>> {
    try {
      if (!id) {
        return { success: false, error: 'Entity ID is required to delete.' };
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
        .eq('match_id', id)
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
