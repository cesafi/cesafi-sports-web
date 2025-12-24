import { z } from 'zod';
import { Database } from '@/../database.types';
import { FilterValue, PaginationOptions } from './base';
import { BaseEntity } from './table';
import { createSchoolTeamSchema, updateSchoolTeamSchema } from '@/lib/validations/schools-teams';

export type SchoolsTeam = Database['public']['Tables']['schools_teams']['Row'];
export type SchoolsTeamInsert = z.infer<typeof createSchoolTeamSchema>;
export type SchoolsTeamUpdate = z.infer<typeof updateSchoolTeamSchema>;

export interface SchoolsTeamSearchFilters {
  school_id?: string;
  season_id?: number;
  sport_category_id?: number;
  team_name?: string;
  created_at?: {
    gte?: string;
    lte?: string;
  };
}

export type SchoolsTeamPaginationOptions = PaginationOptions<
  SchoolsTeamSearchFilters & Record<string, FilterValue>
>;

// Detailed view types for service responses
export interface SchoolsTeamWithSportDetails extends BaseEntity {
  id: string;
  name: string;
  school_id: string;
  season_id: number;
  sport_category_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sports_categories: {
    id: number;
    division: Database['public']['Enums']['sport_divisions'];
    levels: Database['public']['Enums']['sport_levels'];
    sports: {
      name: string;
    };
  };
}

export interface SchoolsTeamWithSchoolDetails {
  id: string;
  name: string;
  school_id: string;
  season_id: number;
  sport_category_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  schools: {
    name: string;
    abbreviation: string;
    logo_url: string | null;
  };
}

export interface SchoolsTeamWithFullDetails {
  id: string;
  name: string;
  school_id: string;
  season_id: number;
  sport_category_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sports_categories: {
    id: number;
    division: Database['public']['Enums']['sport_divisions'];
    levels: Database['public']['Enums']['sport_levels'];
    sports: {
      name: string;
    };
  };
  seasons: {
    id: number;
    start_at: string;
    end_at: string;
  };
}
