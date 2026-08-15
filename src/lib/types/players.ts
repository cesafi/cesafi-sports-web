import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { createPlayerSchema, updatePlayerSchema } from '@/lib/validations/players';
import { Players } from '@/db/schema';

export type Player = Players;
export type PlayerInsert = z.infer<typeof createPlayerSchema>;
export type PlayerUpdate = z.infer<typeof updatePlayerSchema>;

export interface PlayerWithTeam extends Player {
  schools_teams?: {
    id: string;
    name: string;
    school_id: string;
    schools: {
      id: string;
      name: string;
      abbreviation: string;
      logo_url: string | null;
    } | null;
  } | null;
  [key: string]: unknown;
}

export interface PlayerSearchFilters {
  first_name?: string;
  last_name?: string;
  player_number?: number;
  position?: string;
  school_team_id?: string;
  sport_id?: number;
  is_active?: boolean;
}

export type PlayerPaginationOptions = PaginationOptions<
  PlayerSearchFilters & Record<string, FilterValue>
>;
