import {
  PaginatedResponse,
  PaginationOptions,
  ServiceResponse,
  FilterValue
} from '@/lib/types/base';
import { BaseService } from './base';
import {
  Match,
  MatchWithStageDetails,
  MatchWithFullDetails,
  ScheduleMatch,
  ScheduleFilters,
  SchedulePaginationOptions,
  ScheduleResponse,
  ScheduleByDateResponse,
  MatchInsert,
  MatchUpdate
} from '@/lib/types/matches';
import { formatCategoryName } from '@/lib/utils/sports';

const TABLE_NAME = 'matches';
const SPORTS_SEASONS_STAGES_TABLE = 'sports_seasons_stages';
const SCHOOLS_TEAMS_TABLE = 'schools_teams';
const MATCH_PARTICIPANTS_TABLE = 'match_participants';
const GAMES_TABLE = 'games';

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


  static async getCount(): Promise<ServiceResponse<number>> {
    try {
      const supabase = await this.getClient();
      const { count, error } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return { success: true, data: count ?? 0 };
    } catch (err) {
      return this.formatError(err, `Failed to get ${TABLE_NAME} count.`);
    }
  }

  static async getRecent(
    limit: number = 5
  ): Promise<ServiceResponse<Pick<Match, 'id' | 'name' | 'created_at' | 'status' | 'scheduled_at'>[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('id, name, created_at, status, scheduled_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch recent ${TABLE_NAME} entities.`);
    }
  }

  static async getUpcomingWithDetails(
    limit: number = 5
  ): Promise<ServiceResponse<MatchWithFullDetails[]>> {
    try {
      const supabase = await this.getClient();
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
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
            seasons(
              id,
              start_at,
              end_at
            )
          ),
          match_participants!inner(
            id,
            match_id,
            team_id,
            match_score,
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
          `
        )
        .gte('scheduled_at', now)
        .order('scheduled_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch upcoming matches with details.`);
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


  static async getByIdWithDetails(id: number): Promise<ServiceResponse<MatchWithFullDetails>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
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
            match_score,
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
        `
        )
        .eq('id', id)
        .single();

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
        .select(
          `
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
        `
        )
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

  static async getBySportCategory(sportCategoryId: number): Promise<ServiceResponse<Match[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
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
        `
        )
        .eq('sports_seasons_stages.sport_category_id', sportCategoryId)
        .order('scheduled_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(
        err,
        `Failed to fetch matches for sport category ${sportCategoryId}.`
      );
    }
  }

  static async getBySeason(seasonId: number): Promise<ServiceResponse<Match[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
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
        `
        )
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

  // New method for schedule feature with infinite scrolling
  static async getScheduleMatches(
    options: SchedulePaginationOptions
  ): Promise<ServiceResponse<ScheduleResponse>> {
    try {
      const supabase = await this.getClient();
      let query = supabase.from(TABLE_NAME).select(`
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
            match_score,
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
        `);

      // Apply filters
      if (options.filters?.season_id) {
        query = query.eq('sports_seasons_stages.season_id', options.filters.season_id);
      }
      if (options.filters?.sport_id) {
        query = query.eq(
          'sports_seasons_stages.sports_categories.sport_id',
          options.filters.sport_id
        );
      }
      if (options.filters?.sport_category_id) {
        query = query.eq(
          'sports_seasons_stages.sport_category_id',
          options.filters.sport_category_id
        );
      }
      if (options.filters?.stage_id) {
        query = query.eq('stage_id', options.filters.stage_id);
      }
      if (options.filters?.status) {
        query = query.eq('status', options.filters.status);
      }
      if (options.filters?.date_from) {
        query = query.gte('scheduled_at', options.filters.date_from);
      }
      if (options.filters?.date_to) {
        query = query.lte('scheduled_at', options.filters.date_to);
      }
      if (options.filters?.search) {
        query = query.or(
          `name.ilike.%${options.filters.search}%,description.ilike.%${options.filters.search}%`
        );
      }

      // Apply cursor-based pagination
      if (options.cursor) {
        if (options.direction === 'future') {
          query = query.gt('scheduled_at', options.cursor);
        } else {
          query = query.lt('scheduled_at', options.cursor);
        }
      }

      // Order by scheduled_at (future matches ascending, past matches descending)
      if (options.direction === 'future') {
        query = query.order('scheduled_at', { ascending: true, nullsFirst: false });
      } else {
        query = query.order('scheduled_at', { ascending: false, nullsFirst: false });
      }

      // Add secondary ordering
      query = query.order('created_at', { ascending: false });

      // Get one extra to check if there are more
      const { data, error } = await query.limit(options.limit + 1);

      if (error) {
        throw error;
      }

      const hasMore = data && data.length > options.limit;
      const rawMatches = data ? data.slice(0, options.limit) : [];

      // Transform to ScheduleMatch format
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const matches: ScheduleMatch[] = rawMatches.map((match) => {
        const matchDate = match.scheduled_at ? new Date(match.scheduled_at) : null;
        const dateKey = matchDate ? matchDate.toISOString().split('T')[0] : '';

        return {
          ...match,
          displayDate: dateKey,
          displayTime: matchDate
            ? matchDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            : '',
          isToday: dateKey === today.toISOString().split('T')[0],
          isPast: matchDate ? matchDate < now : false,
          isUpcoming: matchDate ? matchDate > now : false
        };
      });

      let nextCursor: string | undefined;
      let prevCursor: string | undefined;

      if (matches.length > 0) {
        if (options.direction === 'future') {
          nextCursor = matches[matches.length - 1]?.scheduled_at ?? undefined;
          prevCursor = matches[0]?.scheduled_at ?? undefined;
        } else {
          nextCursor = matches[0]?.scheduled_at ?? undefined;
          prevCursor = matches[matches.length - 1]?.scheduled_at ?? undefined;
        }
      }

      // Get total count for the filtered results
      const countQuery = supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true });

      // Apply same filters to count query
      if (options.filters?.season_id) {
        countQuery.eq('sports_seasons_stages.season_id', options.filters.season_id);
      }
      if (options.filters?.sport_id) {
        countQuery.eq('sports_seasons_stages.sports_categories.sport_id', options.filters.sport_id);
      }
      if (options.filters?.sport_category_id) {
        countQuery.eq('sports_seasons_stages.sport_category_id', options.filters.sport_category_id);
      }
      if (options.filters?.stage_id) {
        countQuery.eq('stage_id', options.filters.stage_id);
      }
      if (options.filters?.status) {
        countQuery.eq('status', options.filters.status);
      }
      if (options.filters?.date_from) {
        countQuery.gte('scheduled_at', options.filters.date_from);
      }
      if (options.filters?.date_to) {
        countQuery.lte('scheduled_at', options.filters.date_to);
      }
      if (options.filters?.search) {
        countQuery.or(
          `name.ilike.%${options.filters.search}%,description.ilike.%${options.filters.search}%`
        );
      }

      const { count } = await countQuery;

      return {
        success: true,
        data: {
          matches: matches || [],
          nextCursor,
          prevCursor,
          hasMore,
          totalCount: count ?? 0
        }
      };
    } catch (err) {
      return this.formatError(err, 'Failed to fetch schedule matches.');
    }
  }

  // Method to get matches grouped by date for the schedule view
  static async getScheduleMatchesByDate(
    options: ScheduleFilters
  ): Promise<ServiceResponse<ScheduleByDateResponse>> {
    try {
      const supabase = await this.getClient();
      let query = supabase.from(TABLE_NAME).select(`
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
            match_score,
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
        `);

      // Apply filters
      if (options.season_id) {
        query = query.eq('sports_seasons_stages.season_id', options.season_id);
      }
      if (options.sport_id) {
        query = query.eq('sports_seasons_stages.sports_categories.sport_id', options.sport_id);
      }
      if (options.sport_category_id) {
        query = query.eq('sports_seasons_stages.sport_category_id', options.sport_category_id);
      }
      if (options.stage_id) {
        query = query.eq('stage_id', options.stage_id);
      }
      if (options.status) {
        query = query.eq('status', options.status);
      }
      if (options.date_from) {
        query = query.gte('scheduled_at', options.date_from);
      }
      if (options.date_to) {
        query = query.lte('scheduled_at', options.date_to);
      }
      if (options.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      // Order by scheduled_at
      query = query.order('scheduled_at', { ascending: true, nullsFirst: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Group matches by date
      const groupedMatches: Record<string, ScheduleMatch[]> = {};
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (data) {
        data.forEach((match) => {
          if (match.scheduled_at) {
            const matchDate = new Date(match.scheduled_at);
            const dateKey = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD format

            if (!groupedMatches[dateKey]) {
              groupedMatches[dateKey] = [];
            }

            // Add display properties
            const displayMatch: ScheduleMatch = {
              ...match,
              displayDate: dateKey,
              displayTime: matchDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }),
              isToday: dateKey === today.toISOString().split('T')[0],
              isPast: matchDate < now,
              isUpcoming: matchDate > now
            };

            groupedMatches[dateKey].push(displayMatch);
          }
        });
      }

      // Sort date keys chronologically
      const sortedDateKeys = Object.keys(groupedMatches).sort((a, b) => a.localeCompare(b));
      const totalMatches = Object.values(groupedMatches).flat().length;

      return {
        success: true,
        data: {
          groupedMatches,
          sortedDateKeys,
          totalMatches
        }
      };
    } catch (err) {
      return this.formatError(err, 'Failed to fetch schedule matches by date.');
    }
  }

  static async insert(
    data: MatchInsert
  ): Promise<ServiceResponse<Match>> {
    try {
      const supabase = await this.getClient();

      // Validate that the stage_id exists
      const { data: stageExists, error: stageError } = await supabase
        .from(SPORTS_SEASONS_STAGES_TABLE)
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
            error: `Match scheduling conflict detected with: ${conflictingMatches.map((m) => m.name).join(', ')}`
          };
        }
      }

      const { data: newMatch, error } = await supabase.from(TABLE_NAME).insert(data).select().single();

      if (error) {
        throw error;
      }

      return { success: true, data: newMatch };
    } catch (err) {
      return this.formatError(err, `Failed to insert new ${TABLE_NAME} entity.`);
    }
  }

  static async updateById(
    data: MatchUpdate
  ): Promise<ServiceResponse<Match>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Entity ID is required to update.' };
      }

      const supabase = await this.getClient();

      // Validate stage_id if provided
      if (data.stage_id) {
        const { data: stageExists, error: stageError } = await supabase
          .from(SPORTS_SEASONS_STAGES_TABLE)
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
            error: `Match scheduling conflict detected with: ${conflictingMatches.map((m) => m.name).join(', ')}`
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

        const scheduledAt =
          data.scheduled_at !== undefined ? data.scheduled_at : currentMatch.scheduled_at;
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

      // Fetch the updated match
      const { data: updatedMatch, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', data.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return { success: true, data: updatedMatch };
    } catch (err) {
      return this.formatError(err, `Failed to update ${TABLE_NAME} entity.`);
    }
  }

  static async insertWithParticipants(
    matchData: MatchInsert,
    participantTeamIds: string[]
  ): Promise<ServiceResponse<Match>> {
    try {
      const supabase = await this.getClient();

      // Validate that the stage_id exists
      const { data: stageExists, error: stageError } = await supabase
        .from(SPORTS_SEASONS_STAGES_TABLE)
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
          .from(SCHOOLS_TEAMS_TABLE)
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
        const participantData = participantTeamIds.map((teamId) => ({
          match_id: matchId,
          team_id: teamId
        }));

        const { error: participantsError } = await supabase
          .from(MATCH_PARTICIPANTS_TABLE)
          .insert(participantData);

        if (participantsError) {
          // If participants insertion fails, clean up the match
          await supabase.from(TABLE_NAME).delete().eq('id', matchId);
          throw participantsError;
        }
      }

      // Fetch the created match
      const { data: newMatch, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', matchId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return { success: true, data: newMatch };
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
        .from(GAMES_TABLE)
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
        .from(MATCH_PARTICIPANTS_TABLE)
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

  /**
   * Get matches by school ID through match participants
   */
  static async getMatchesBySchoolId(
    schoolId: string,
    options: {
      limit?: number;
      season_id?: number;
      direction?: 'future' | 'past';
    } = {}
  ): Promise<ServiceResponse<MatchWithFullDetails[]>> {
    try {
      const supabase = await this.getClient();
      const { limit = 10, season_id, direction = 'past' } = options;

      let query = supabase
        .from(TABLE_NAME)
        .select(
          `
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
            seasons(
              id,
              start_at,
              end_at
            )
          ),
          match_participants!inner(
            id,
            match_id,
            team_id,
            match_score,
            schools_teams!inner(
              id,
              name,
              schools!inner(
                id,
                name,
                abbreviation,
                logo_url
              )
            )
          )
        `
        )
        .eq('match_participants.schools_teams.school_id', schoolId)
        .order('scheduled_at', { ascending: direction === 'future' })
        .limit(limit);

      // Add season filter if provided
      if (season_id) {
        query = query.eq('sports_seasons_stages.season_id', season_id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch matches by school ID.`);
    }
  }

  /**
   * Get available sport categories for filtering
   */
  static async getAvailableSportCategories(): Promise<ServiceResponse<Array<{
    id: number;
    division: string;
    levels: string;
    sport_name: string;
    formatted_name: string;
  }>>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('sports_categories')
        .select(`
          id,
          division,
          levels,
          sports!inner(
            name
          )
        `)
        .order('sports.name', { ascending: true })
        .order('division', { ascending: true })
        .order('levels', { ascending: true });

      if (error) {
        throw error;
      }

      // Format the categories with proper naming using sports utils
      const formattedCategories = data?.map(category => ({
        id: category.id,
        division: category.division,
        levels: category.levels,
        sport_name: category.sports.name,
        formatted_name: `${category.sports.name} - ${formatCategoryName(category.division, category.levels)}`
      })) || [];

      return { success: true, data: formattedCategories };
    } catch (err) {
      return this.formatError(err, `Failed to fetch available sport categories.`);
    }
  }
}
