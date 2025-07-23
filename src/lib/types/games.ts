import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Game = Database['public']['Tables']['games']['Row'];
export type GameInsert = Database['public']['Tables']['games']['Insert'];
export type GameUpdate = Database['public']['Tables']['games']['Update'];

export interface GameSearchFilters {
  match_id?: string;
  game_number?: number;
  duration?: string;
  start_at?: string;
  end_at?: string;
  date_range?: {
    start?: string;
    end?: string;
  };
  game_number_range?: {
    min?: number;
    max?: number;
  };
}

export type GamePaginationOptions = PaginationOptions<
  GameSearchFilters & Record<string, FilterValue>
>;