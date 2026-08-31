import { z } from 'zod';
import { FilterValue, PaginationOptions } from './base';
import { createMatchParticipantSchema, updateMatchParticipantSchema } from '@/lib/validations/match-participants';
import { matchParticipants } from '@/db/schema';
import { CompetitionStage, SportDivision, SportLevel } from '@/db/schema';

export type MatchParticipant = typeof matchParticipants.$inferSelect;
export type MatchParticipantInsert = typeof matchParticipants.$inferInsert;
export type MatchParticipantUpdate = Partial<MatchParticipantInsert>;

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
  match_score: number | null;
  created_at: string;
  updated_at: string;
  schools_teams: {
    id: string;
    name: string;
    school: {
      name: string;
      abbreviation: string;
    };
  };
}

export interface MatchParticipantWithMatchDetails {
  id: number;
  match_id: number;
  team_id: string;
  match_score: number | null;
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
  match_score: number | null;
  created_at: string;
  updated_at: string;
  schools_teams: {
    id: string;
    name: string;
    school: {
      name: string;
      abbreviation: string;
      logo_url: string | null;
    };
  };
  matches: {
    id: number;
    name: string;
    scheduled_at: string | null;
  };
  [key: string]: unknown;
}

// Type for match participants as returned by the service (without created_at, updated_at, matches)
export interface MatchParticipantWithTeamDetailsOnly {
  id: number;
  match_id: number;
  team_id: string;
  match_score: number | null;
  schools_teams: {
    id: string;
    name: string;
    school: {
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
  match_score: number | null;
  created_at: string;
  updated_at: string;
  matches: {
    id: number;
    name: string;
    scheduled_at: string | null;
    venue: string;
    sports_seasons_stages: {
      competition_stage: CompetitionStage;
      sports_categories: {
        division: SportDivision;
        levels: SportLevel;
        sports: {
          name: string;
        };
      };
    };
  };
}
