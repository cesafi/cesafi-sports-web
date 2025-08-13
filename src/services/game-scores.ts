import { PaginatedResponse, PaginationOptions, ServiceResponse } from '@/lib/types/base';
import { BaseService } from './base';
import {
  GameScore,
  GameScoreDetailedView,
  GameScoreInsert,
  GameScoreUpdate
} from '@/lib/types/game-scores';
import { AuthService } from './auth';

const TABLE_NAME = 'game_scores';

export class GameScoreService extends BaseService {
  static async getPaginated(
    options: PaginationOptions,
    selectQuery: string = '*'
  ): Promise<ServiceResponse<PaginatedResponse<GameScore>>> {
    try {
      const result = await this.getPaginatedData<GameScore, typeof TABLE_NAME>(
        TABLE_NAME,
        options,
        selectQuery
      );

      return result;
    } catch (err) {
      return this.formatError(err, `Failed to retrieve paginated game scores.`);
    }
  }

  static async getAll(): Promise<ServiceResponse<GameScore[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .order('games_id', { ascending: true })
        .order('score', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch all ${TABLE_NAME} entity.`);
    }
  }

  static async getById(id: string): Promise<ServiceResponse<GameScore>> {
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

  static async getByGameId(gameId: string): Promise<ServiceResponse<GameScore[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .eq('games_id', gameId)
        .order('score', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch game scores for game ${gameId}.`);
    }
  }

  static async getByParticipantId(participantId: string): Promise<ServiceResponse<GameScore[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select()
        .eq('match_participants_id', participantId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      return this.formatError(err, `Failed to fetch game scores for participant ${participantId}.`);
    }
  }

  static async insert(data: GameScoreInsert): Promise<ServiceResponse<undefined>> {
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

      const { data: gameExists, error: gameError } = await supabase
        .from('games')
        .select('id, match_id')
        .eq('id', data.games_id)
        .single();

      if (gameError && gameError.code !== 'PGRST116') {
        throw gameError;
      }

      if (!gameExists) {
        return {
          success: false,
          error: 'Invalid game ID provided.'
        };
      }

      const { data: participantExists, error: participantError } = await supabase
        .from('match_participants')
        .select('id, matches_id')
        .eq('id', data.match_participants_id)
        .single();

      if (participantError && participantError.code !== 'PGRST116') {
        throw participantError;
      }

      if (!participantExists) {
        return {
          success: false,
          error: 'Invalid match participant ID provided.'
        };
      }

      if (participantExists.matches_id !== gameExists.match_id) {
        return {
          success: false,
          error: 'Match participant does not belong to the same match as the game.'
        };
      }

      const { data: existingScore, error: existingError } = await supabase
        .from(TABLE_NAME)
        .select('id')
        .eq('games_id', data.games_id)
        .eq('match_participants_id', data.match_participants_id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existingScore) {
        return {
          success: false,
          error: 'A score already exists for this participant in this game.'
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

  static async updateById(data: GameScoreUpdate): Promise<ServiceResponse<undefined>> {
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

      const { data: currentScore, error: currentError } = await supabase
        .from(TABLE_NAME)
        .select('games_id, match_participants_id')
        .eq('id', data.id)
        .single();

      if (currentError) {
        throw currentError;
      }

      if (data.games_id || data.match_participants_id) {
        const gameId = data.games_id || currentScore.games_id;
        const participantId = data.match_participants_id || currentScore.match_participants_id;

        const { data: gameExists, error: gameError } = await supabase
          .from('games')
          .select('id, match_id')
          .eq('id', gameId)
          .single();

        if (gameError && gameError.code !== 'PGRST116') {
          throw gameError;
        }

        if (!gameExists) {
          return {
            success: false,
            error: 'Invalid game ID provided.'
          };
        }

        const { data: participantExists, error: participantError } = await supabase
          .from('match_participants')
          .select('id, matches_id')
          .eq('id', participantId)
          .single();

        if (participantError && participantError.code !== 'PGRST116') {
          throw participantError;
        }

        if (!participantExists) {
          return {
            success: false,
            error: 'Invalid match participant ID provided.'
          };
        }

        if (participantExists.matches_id !== gameExists.match_id) {
          return {
            success: false,
            error: 'Match participant does not belong to the same match as the game.'
          };
        }

        if (
          gameId !== currentScore.games_id ||
          participantId !== currentScore.match_participants_id
        ) {
          const { data: duplicateScore, error: duplicateError } = await supabase
            .from(TABLE_NAME)
            .select('id')
            .eq('games_id', gameId)
            .eq('match_participants_id', participantId)
            .neq('id', data.id)
            .single();

          if (duplicateError && duplicateError.code !== 'PGRST116') {
            throw duplicateError;
          }

          if (duplicateScore) {
            return {
              success: false,
              error: 'A score already exists for this participant in this game.'
            };
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
   * Calculate aggregate scores for a match participant across all games
   */
  static async getParticipantMatchAggregate(participantId: string): Promise<
    ServiceResponse<{
      totalScore: number;
      averageScore: number;
      gameCount: number;
      highestScore: number;
      lowestScore: number;
    }>
  > {
    try {
      const supabase = await this.getClient();
      const { data: scores, error } = await supabase
        .from(TABLE_NAME)
        .select('score')
        .eq('match_participants_id', participantId);

      if (error) {
        throw error;
      }

      if (!scores || scores.length === 0) {
        return {
          success: true,
          data: {
            totalScore: 0,
            averageScore: 0,
            gameCount: 0,
            highestScore: 0,
            lowestScore: 0
          }
        };
      }

      const scoreValues = scores.map((s) => s.score);
      const totalScore = scoreValues.reduce((sum, score) => sum + score, 0);
      const averageScore = totalScore / scoreValues.length;
      const highestScore = Math.max(...scoreValues);
      const lowestScore = Math.min(...scoreValues);

      return {
        success: true,
        data: {
          totalScore,
          averageScore,
          gameCount: scoreValues.length,
          highestScore,
          lowestScore
        }
      };
    } catch (err) {
      return this.formatError(err, `Failed to calculate participant match aggregate.`);
    }
  }

  static async getScoresWithDetails(
    gameId: string
  ): Promise<ServiceResponse<GameScoreDetailedView[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('game_scores_detailed')
        .select('*')
        .eq('game_id', gameId)
        .order('score', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data: data as GameScoreDetailedView[] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch game scores with details.`);
    }
  }
}
