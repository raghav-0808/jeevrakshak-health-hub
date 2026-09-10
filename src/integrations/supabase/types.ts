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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      animals: {
        Row: {
          age_years: number | null
          breed: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          owner_id: string
          photo_url: string | null
          sex: string | null
          species: string
          updated_at: string
        }
        Insert: {
          age_years?: number | null
          breed?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          owner_id: string
          photo_url?: string | null
          sex?: string | null
          species: string
          updated_at?: string
        }
        Update: {
          age_years?: number | null
          breed?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string
          photo_url?: string | null
          sex?: string | null
          species?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_notes: {
        Row: {
          author_id: string
          case_id: string
          created_at: string
          id: string
          note: string
        }
        Insert: {
          author_id: string
          case_id: string
          created_at?: string
          id?: string
          note: string
        }
        Update: {
          author_id?: string
          case_id?: string
          created_at?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          address: string | null
          ai_assessment: Json | null
          animal_id: string | null
          assigned_vet_id: string | null
          created_at: string
          description: string
          id: string
          latitude: number | null
          longitude: number | null
          photo_url: string | null
          reporter_id: string | null
          reporter_name: string | null
          reporter_phone: string | null
          species: string
          status: Database["public"]["Enums"]["case_status"]
          tracking_code: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          address?: string | null
          ai_assessment?: Json | null
          animal_id?: string | null
          assigned_vet_id?: string | null
          created_at?: string
          description: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          photo_url?: string | null
          reporter_id?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          species: string
          status?: Database["public"]["Enums"]["case_status"]
          tracking_code: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          address?: string | null
          ai_assessment?: Json | null
          animal_id?: string | null
          assigned_vet_id?: string | null
          created_at?: string
          description?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          photo_url?: string | null
          reporter_id?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          species?: string
          status?: Database["public"]["Enums"]["case_status"]
          tracking_code?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          animal_id: string
          created_at: string
          diagnosis: string | null
          id: string
          notes: string | null
          owner_id: string
          record_date: string
          title: string
          treatment: string | null
          vet_name: string | null
        }
        Insert: {
          animal_id: string
          created_at?: string
          diagnosis?: string | null
          id?: string
          notes?: string | null
          owner_id: string
          record_date: string
          title: string
          treatment?: string | null
          vet_name?: string | null
        }
        Update: {
          animal_id?: string
          created_at?: string
          diagnosis?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          record_date?: string
          title?: string
          treatment?: string | null
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          animal_id: string
          created_at: string
          given_on: string
          id: string
          next_due_on: string | null
          notes: string | null
          owner_id: string
          vaccine: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          given_on: string
          id?: string
          next_due_on?: string | null
          notes?: string | null
          owner_id: string
          vaccine: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          given_on?: string
          id?: string
          next_due_on?: string | null
          notes?: string | null
          owner_id?: string
          vaccine?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "vet"
      case_status: "new" | "accepted" | "in_progress" | "resolved" | "closed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["owner", "vet"],
      case_status: ["new", "accepted", "in_progress", "resolved", "closed"],
    },
  },
} as const
