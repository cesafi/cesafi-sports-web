export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          authored_by: string
          content: Json
          cover_image_url: string
          created_at: string
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          title: string
          updated_at: string
        }
        Insert: {
          authored_by: string
          content: Json
          cover_image_url: string
          created_at?: string
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          title: string
          updated_at?: string
        }
        Update: {
          authored_by?: string
          content?: Json
          cover_image_url?: string
          created_at?: string
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          created_at: string
          game_id: number | null
          id: number
          match_participant_id: number
          score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_id?: number | null
          id?: number
          match_participant_id: number
          score: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_id?: number | null
          id?: number
          match_participant_id?: number
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_scores_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_scores_match_participant_id_fkey"
            columns: ["match_participant_id"]
            isOneToOne: false
            referencedRelation: "match_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          duration: string
          end_at: string | null
          game_number: number
          id: number
          match_id: number
          start_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: string
          end_at?: string | null
          game_number?: number
          id?: number
          match_id: number
          start_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string
          end_at?: string | null
          game_number?: number
          id?: number
          match_id?: number
          start_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_participants: {
        Row: {
          created_at: string
          id: number
          match_id: number
          match_score: number | null
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          match_id: number
          match_score?: number | null
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          match_id?: number
          match_score?: number | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "schools_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          best_of: number
          created_at: string
          description: string
          end_at: string | null
          id: number
          name: string
          scheduled_at: string | null
          stage_id: number
          start_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
          venue: string
        }
        Insert: {
          best_of?: number
          created_at?: string
          description: string
          end_at?: string | null
          id?: number
          name: string
          scheduled_at?: string | null
          stage_id: number
          start_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
          venue: string
        }
        Update: {
          best_of?: number
          created_at?: string
          description?: string
          end_at?: string | null
          id?: number
          name?: string
          scheduled_at?: string | null
          stage_id?: number
          start_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "sports_seasons_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          abbreviation: string
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          abbreviation?: string
          created_at?: string
          id?: string
          is_active: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Update: {
          abbreviation?: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      schools_teams: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          school_id: string
          season_id: number
          sport_category_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          school_id: string
          season_id: number
          sport_category_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          season_id?: number
          sport_category_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_teams_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schools_teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schools_teams_sport_category_id_fkey"
            columns: ["sport_category_id"]
            isOneToOne: false
            referencedRelation: "sports_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          end_at: string
          id: number
          start_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: number
          start_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: number
          start_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sports: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sports_categories: {
        Row: {
          created_at: string
          division: Database["public"]["Enums"]["sport_divisions"]
          id: number
          levels: Database["public"]["Enums"]["sport_levels"]
          sport_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          division: Database["public"]["Enums"]["sport_divisions"]
          id?: number
          levels: Database["public"]["Enums"]["sport_levels"]
          sport_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          division?: Database["public"]["Enums"]["sport_divisions"]
          id?: number
          levels?: Database["public"]["Enums"]["sport_levels"]
          sport_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sports_categories_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_seasons_stages: {
        Row: {
          competition_stage: Database["public"]["Enums"]["competition_stage"]
          created_at: string
          id: number
          season_id: number | null
          sport_category_id: number | null
          updated_at: string
        }
        Insert: {
          competition_stage: Database["public"]["Enums"]["competition_stage"]
          created_at?: string
          id?: number
          season_id?: number | null
          sport_category_id?: number | null
          updated_at?: string
        }
        Update: {
          competition_stage?: Database["public"]["Enums"]["competition_stage"]
          created_at?: string
          id?: number
          season_id?: number | null
          sport_category_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_seasons_stages_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_seasons_stages_sport_category_id_fkey"
            columns: ["sport_category_id"]
            isOneToOne: false
            referencedRelation: "sports_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          created_at: string
          department_id: number | null
          full_name: string
          id: string
          image_url: string | null
          is_active: boolean | null
          season_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: number | null
          full_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          season_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: number | null
          full_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          season_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_has_role: {
        Args: { "": string[] }
        Returns: boolean
      }
    }
    Enums: {
      article_status:
        | "review"
        | "published"
        | "revise"
        | "cancelled"
        | "approved"
        | "draft"
      competition_stage: "group_stage" | "playins" | "playoffs" | "finals"
      match_status: "upcoming" | "ongoing" | "finished" | "cancelled"
      sport_divisions: "men" | "women" | "mixed"
      sport_levels: "elementary" | "high_school" | "college"
      user_roles: "admin" | "head_writer" | "league_operator" | "writer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      article_status: [
        "review",
        "published",
        "revise",
        "cancelled",
        "approved",
        "draft",
      ],
      competition_stage: ["group_stage", "playins", "playoffs", "finals"],
      match_status: ["upcoming", "ongoing", "finished", "cancelled"],
      sport_divisions: ["men", "women", "mixed"],
      sport_levels: ["elementary", "high_school", "college"],
      user_roles: ["admin", "head_writer", "league_operator", "writer"],
    },
  },
} as const
