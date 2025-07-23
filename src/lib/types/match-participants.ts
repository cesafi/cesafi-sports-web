import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type MatchParticipant = Database['public']['Tables']['match_participants']['Row'];
export type MatchParticipantInsert = Database['public']['Tables']['match_participants']['Insert'];
export type MatchParticipantUpdate = Database['public']['Tables']['match_participants']['Update'];

export interface MatchParticipantSearchFilters {
  matches_id?: string;
  schools_teams_id?: string;
  placement?: number;
  match_name?: string;
  team_name?: string;
  school_name?: string;
  sport_name?: string;
  season_number?: number;
}

export type MatchParticipantPaginationOptions = PaginationOptions<
  MatchParticipantSearchFilters & Record<string, FilterValue>
>;