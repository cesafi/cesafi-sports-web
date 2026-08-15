import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { createGameScoreSchema, updateGameScoreSchema } from '@/lib/validations/game-scores';
import { gameScores } from '@/db/schema';

export type GameScore = typeof gameScores.$inferSelect;
export type GameScoreInsert = typeof gameScores.$inferInsert;
export type GameScoreUpdate = Partial<GameScoreInsert>;

export interface GameScoreDetailedView extends GameScore {
  [key: string]: unknown;
}

export interface GameScoreSearchFilters {
  match_id?: number;
  game_number?: number;
  match_participant_id?: number;
  score?: number;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type GameScorePaginationOptions = PaginationOptions<
  GameScoreSearchFilters & Record<string, FilterValue>
>;
