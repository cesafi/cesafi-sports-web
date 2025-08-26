import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type Game = Database['public']['Tables']['games']['Row'];
export type GameInsert = Database['public']['Tables']['games']['Insert'];
export type GameUpdate = Database['public']['Tables']['games']['Update'];

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