import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type SchoolsTeam = Database['public']['Tables']['schools_teams']['Row'];
export type SchoolsTeamInsert = Database['public']['Tables']['schools_teams']['Insert'];
export type SchoolsTeamUpdate = Database['public']['Tables']['schools_teams']['Update'];

export interface SchoolsTeamSearchFilters {
  name?: string;
  is_active?: boolean;
  schools_id?: string;
  seasons_id?: string;
  sports_id?: string;
  school_name?: string;
  season_number?: number;
  sport_name?: string;
}

export type SchoolsTeamPaginationOptions = PaginationOptions<
  SchoolsTeamSearchFilters & Record<string, FilterValue>
>;