import { ServiceResponse } from '../lib/types/base';
import { GameScoreInsert, GameScoreUpdate, GameScoreDetailedView } from '../lib/types/game-scores';
import { BaseService } from './base';

const TABLE_NAME = 'game_scores';

export class GameScoreService extends BaseService {
  static async getByGameId(gameId: number): Promise<ServiceResponse<GameScoreDetailedView[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch game scores for game ${gameId}.`);
    }
  }

  static async getByParticipantId(
    participantId: number
  ): Promise<ServiceResponse<GameScoreDetailedView[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('match_participant_id', participantId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch game scores for participant ${participantId}.`);
    }
  }

  static async getByMatchId(matchId: number): Promise<ServiceResponse<GameScoreDetailedView[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          games!inner(match_id)
        `
        )
        .eq('games.match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch game scores for match ${matchId}.`);
    }
  }

  static async insert(data: GameScoreInsert): Promise<ServiceResponse<undefined>> {
    try {
      const supabase = await this.getClient();

      const [gameCheck, participantCheck] = await Promise.all([
        supabase.from('games').select('id').eq('id', data.game_id!).single(),
        supabase
          .from('match_participants')
          .select('id')
          .eq('id', data.match_participant_id!)
          .single()
      ]);

      if (gameCheck.error) {
        return { success: false, error: 'Referenced game does not exist.' };
      }
      if (participantCheck.error) {
        return { success: false, error: 'Referenced match participant does not exist.' };
      }

      const { error } = await supabase.from(TABLE_NAME).insert(data);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to insert new game score.`);
    }
  }

  static async updateById(data: GameScoreUpdate): Promise<ServiceResponse<undefined>> {
    try {
      if (!data.id) {
        return { success: false, error: 'Game score ID is required to update.' };
      }

      const supabase = await this.getClient();

      const checks = [];
      if (data.game_id !== undefined && data.game_id !== null) {
        checks.push(supabase.from('games').select('id').eq('id', data.game_id).single());
      }
      if (data.match_participant_id !== undefined && data.match_participant_id !== null) {
        checks.push(
          supabase
            .from('match_participants')
            .select('id')
            .eq('id', data.match_participant_id)
            .single()
        );
      }

      if (checks.length > 0) {
        const results = await Promise.all(checks);
        let index = 0;

        if (data.game_id !== undefined && data.game_id !== null && results[index]?.error) {
          return { success: false, error: 'Referenced game does not exist.' };
        }
        if (data.game_id !== undefined && data.game_id !== null) index++;

        if (
          data.match_participant_id !== undefined &&
          data.match_participant_id !== null &&
          results[index]?.error
        ) {
          return { success: false, error: 'Referenced match participant does not exist.' };
        }
      }

      const { error } = await supabase.from(TABLE_NAME).update(data).eq('id', data.id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to update game score.`);
    }
  }

  static async deleteById(id: number): Promise<ServiceResponse<undefined>> {
    try {
      if (!id) {
        return { success: false, error: 'Game score ID is required to delete.' };
      }

      const supabase = await this.getClient();

      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

      if (error) {
        throw error;
      }

      return { success: true, data: undefined };
    } catch (err) {
      return this.formatError(err, `Failed to delete game score.`);
    }
  }

  static async getParticipantMatchAggregate(
    matchId: number,
    participantId: number
  ): Promise<ServiceResponse<{ totalScore: number; gamesPlayed: number }>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          score,
          games!inner(match_id)
        `
        )
        .eq('games.match_id', matchId)
        .eq('match_participant_id', participantId);

      if (error) {
        throw error;
      }

      const totalScore = (data || []).reduce(
        (sum: number, score: { score?: number | null }) => sum + (score.score || 0),
        0
      );
      const gamesPlayed = data?.length || 0;

      return {
        success: true,
        data: { totalScore, gamesPlayed }
      };
    } catch (err) {
      return this.formatError(err, `Failed to get participant match aggregate.`);
    }
  }

  static async getScoresWithDetails(
    gameId: number
  ): Promise<ServiceResponse<GameScoreDetailedView[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(
          `
          *,
          match_participants!inner(
            id,
            schools_teams!inner(name, schools!inner(name))
          )
        `
        )
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      return this.formatError(err, `Failed to fetch game scores with details.`);
    }
  }
}
