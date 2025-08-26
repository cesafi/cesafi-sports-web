import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';

export type MatchParticipant = Database['public']['Tables']['match_participants']['Row'];
export type MatchParticipantInsert = Database['public']['Tables']['match_participants']['Insert'];
export type MatchParticipantUpdate = Database['public']['Tables']['match_participants']['Update'];

export interface MatchParticipantSearchFilters {
  match_id?: number;
  team_id?: string;
  placement?: number;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type MatchParticipantPaginationOptions = PaginationOptions<
  MatchParticipantSearchFilters & Record<string, FilterValue>
>;

// Detailed view types for service responses
export interface MatchParticipantWithTeamDetails {
  id: number;
  match_id: number;
  team_id: string;
  created_at: string;
  updated_at: string;
  schools_teams: {
    id: string;
    name: string;
    schools: {
      name: string;
      abbreviation: string;
    };
  };
}

export interface MatchParticipantWithMatchDetails {
  id: number;
  match_id: number;
  team_id: string;
  created_at: string;
  updated_at: string;
  matches: {
    id: number;
    name: string;
    scheduled_at: string | null;
  };
}

export interface MatchParticipantWithFullDetails {
  id: number;
  match_id: number;
  team_id: string;
  created_at: string;
  updated_at: string;
  schools_teams: {
    id: string;
    name: string;
    schools: {
      name: string;
      abbreviation: string;
      logo_url: string | null;
    };
  };
}

export interface MatchParticipantWithMatchHistory {
  id: number;
  match_id: number;
  team_id: string;
  created_at: string;
  updated_at: string;
  matches: {
    id: number;
    name: string;
    scheduled_at: string | null;
    venue: string;
    sports_seasons_stages: {
      competition_stage: Database['public']['Enums']['competition_stage'];
      sports_categories: {
        division: Database['public']['Enums']['sport_divisions'];
        levels: Database['public']['Enums']['sport_levels'];
        sports: {
          name: string;
        };
      };
    };
  };
}