import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { Match } from './matches';
import { createGameSchema, updateGameSchema } from '@/lib/validations/games';
import { games } from '@/db/schema';

export type Game = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;
export type GameUpdate = Partial<GameInsert>;

export interface GameWithDetails extends Game {
  matches?: Match;
  [key: string]: unknown;
}

export interface GameSearchFilters {
  match_id?: number;
  game_number?: number;
  start_at?: {
    gte?: string;
    lte?: string;
  };
  end_at?: {
    gte?: string;
    lte?: string;
  };
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type GamePaginationOptions = PaginationOptions<
  GameSearchFilters & Record<string, FilterValue>
>;
