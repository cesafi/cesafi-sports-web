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
          published_at: string
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
          published_at: string
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
          published_at?: string
          status?: Database["public"]["Enums"]["article_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          created_at: string
          games_id: string
          id: string
          match_participants_id: string
          score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          games_id: string
          id?: string
          match_participants_id: string
          score: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          games_id?: string
          id?: string
          match_participants_id?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_scores_games_id_fkey"
            columns: ["games_id"]
            isOneToOne: false
            referencedRelation: "game_scores_detailed"
            referencedColumns: ["game_id"]
          },
          {
            foreignKeyName: "game_scores_games_id_fkey"
            columns: ["games_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_scores_match_participants_id_fkey"
            columns: ["match_participants_id"]
            isOneToOne: false
            referencedRelation: "game_scores_detailed"
            referencedColumns: ["match_participant_id"]
          },
          {
            foreignKeyName: "game_scores_match_participants_id_fkey"
            columns: ["match_participants_id"]
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
          id: string
          match_id: string
          start_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: string
          end_at?: string | null
          game_number?: number
          id?: string
          match_id: string
          start_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string
          end_at?: string | null
          game_number?: number
          id?: string
          match_id?: string
          start_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "game_scores_detailed"
            referencedColumns: ["match_id"]
          },
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
          id: string
          matches_id: string
          placement: number
          schools_teams_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          matches_id: string
          placement?: number
          schools_teams_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          matches_id?: string
          placement?: number
          schools_teams_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_matches_id_fkey"
            columns: ["matches_id"]
            isOneToOne: false
            referencedRelation: "game_scores_detailed"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "match_participants_matches_id_fkey"
            columns: ["matches_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_schools_teams_id_fkey"
            columns: ["schools_teams_id"]
            isOneToOne: false
            referencedRelation: "game_scores_detailed"
            referencedColumns: ["school_team_id"]
          },
          {
            foreignKeyName: "match_participants_schools_teams_id_fkey"
            columns: ["schools_teams_id"]
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
          id: string
          name: string
          scheduled_at: string | null
          sports_seasons_stages_id: string
          start_at: string | null
          updated_at: string
        }
        Insert: {
          best_of?: number
          created_at?: string
          description: string
          end_at?: string | null
          id?: string
          name: string
          scheduled_at?: string | null
          sports_seasons_stages_id: string
          start_at?: string | null
          updated_at?: string
        }
        Update: {
          best_of?: number
          created_at?: string
          description?: string
          end_at?: string | null
          id?: string
          name?: string
          scheduled_at?: string | null
          sports_seasons_stages_id?: string
          start_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_sports_seasons_stages_id_fkey"
            columns: ["sports_seasons_stages_id"]
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
          logo_url: string
          name: string
          updated_at: string
        }
        Insert: {
          abbreviation?: string
          created_at?: string
          id?: string
          is_active: boolean
          logo_url?: string
          name?: string
          updated_at?: string
        }
        Update: {
          abbreviation?: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string
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
          schools_id: string
          seasons_id: string
          sports_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          schools_id: string
          seasons_id: string
          sports_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          schools_id?: string
          seasons_id?: string
          sports_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_teams_schools_id_fkey"
            columns: ["schools_id"]
            isOneToOne: false
            referencedRelation: "game_scores_detailed"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "schools_teams_schools_id_fkey"
            columns: ["schools_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schools_teams_seasons_id_fkey"
            columns: ["seasons_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schools_teams_sports_id_fkey"
            columns: ["sports_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          end_at: string
          id: string
          number: number
          start_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          number: number
          start_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          number?: number
          start_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sports: {
        Row: {
          created_at: string
          division: Database["public"]["Enums"]["sport_divisions"]
          id: string
          level: Database["public"]["Enums"]["sport_levels"]
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          division: Database["public"]["Enums"]["sport_divisions"]
          id?: string
          level: Database["public"]["Enums"]["sport_levels"]
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          division?: Database["public"]["Enums"]["sport_divisions"]
          id?: string
          level?: Database["public"]["Enums"]["sport_levels"]
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sports_seasons_stages: {
        Row: {
          competition_stage: Database["public"]["Enums"]["competition_stage"]
          created_at: string
          id: string
          seasons_id: string
          sports_id: string
          updated_at: string
        }
        Insert: {
          competition_stage: Database["public"]["Enums"]["competition_stage"]
          created_at?: string
          id?: string
          seasons_id: string
          sports_id: string
          updated_at?: string
        }
        Update: {
          competition_stage?: Database["public"]["Enums"]["competition_stage"]
          created_at?: string
          id?: string
          seasons_id?: string
          sports_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_seasons_stages_seasons_id_fkey"
            columns: ["seasons_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_seasons_stages_sports_id_fkey"
            columns: ["sports_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          created_at: string
          department: string | null
          full_name: string
          id: string
          image_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          image_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      game_scores_detailed: {
        Row: {
          game_end_time: string | null
          game_id: string | null
          game_number: number | null
          game_score_created_at: string | null
          game_score_id: string | null
          game_score_updated_at: string | null
          game_start_time: string | null
          match_id: string | null
          match_name: string | null
          match_participant_id: string | null
          placement: number | null
          school_abbreviation: string | null
          school_id: string | null
          school_name: string | null
          school_team_id: string | null
          score: number | null
          team_name: string | null
        }
        Relationships: []
      }
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
      competition_stage: "group_stage" | "playins" | "playoffs" | "finals"
      match_status: "upcoming" | "ongoing" | "finished" | "canceled"
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
      ],
      competition_stage: ["group_stage", "playins", "playoffs", "finals"],
      match_status: ["upcoming", "ongoing", "finished", "canceled"],
      sport_divisions: ["men", "women", "mixed"],
      sport_levels: ["elementary", "high_school", "college"],
      user_roles: ["admin", "head_writer", "league_operator", "writer"],
    },
  },
} as const
