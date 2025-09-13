import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';
import { Match } from './matches';

export type Game = Database['public']['Tables']['games']['Row'];

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
