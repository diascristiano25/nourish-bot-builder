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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anthropometrics: {
        Row: {
          body_fat_percentage: number | null
          created_at: string
          height_cm: number | null
          hip_cm: number | null
          id: string
          measured_at: string
          notes: string | null
          patient_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          created_at?: string
          height_cm?: number | null
          hip_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          patient_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          created_at?: string
          height_cm?: number | null
          hip_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          patient_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anthropometrics_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          date_time: string
          id: string
          notes: string | null
          nutritionist_id: string
          patient_id: string
          status: string
        }
        Insert: {
          created_at?: string
          date_time: string
          id?: string
          notes?: string | null
          nutritionist_id: string
          patient_id: string
          status?: string
        }
        Update: {
          created_at?: string
          date_time?: string
          id?: string
          notes?: string | null
          nutritionist_id?: string
          patient_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_foods: {
        Row: {
          carb: number
          created_at: string
          fat: number
          id: string
          kcal: number
          name: string
          nutritionist_id: string
          protein: number
          unit_type: string
          updated_at: string
        }
        Insert: {
          carb?: number
          created_at?: string
          fat?: number
          id?: string
          kcal?: number
          name: string
          nutritionist_id: string
          protein?: number
          unit_type?: string
          updated_at?: string
        }
        Update: {
          carb?: number
          created_at?: string
          fat?: number
          id?: string
          kcal?: number
          name?: string
          nutritionist_id?: string
          protein?: number
          unit_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_foods_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_recipes: {
        Row: {
          created_at: string
          estimated_macros: Json | null
          id: string
          ingredients: Json | null
          name: string
          notes: string | null
          nutritionist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_macros?: Json | null
          id?: string
          ingredients?: Json | null
          name: string
          notes?: string | null
          nutritionist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_macros?: Json | null
          id?: string
          ingredients?: Json | null
          name?: string
          notes?: string | null
          nutritionist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_recipes_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          nutritionist_id: string
          record_date: string
          record_type: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          nutritionist_id: string
          record_date?: string
          record_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          nutritionist_id?: string
          record_date?: string
          record_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          nutritionist_id: string
          patient_id: string
          plan_data: Json
          title: string
          total_calories: number | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          nutritionist_id: string
          patient_id: string
          plan_data?: Json
          title: string
          total_calories?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          nutritionist_id?: string
          patient_id?: string
          plan_data?: Json
          title?: string
          total_calories?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      nutritionists: {
        Row: {
          account_status: string
          created_at: string
          crn: string | null
          full_name: string
          id: string
          is_active: boolean
          is_admin: boolean
          logo_url: string | null
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string
          created_at?: string
          crn?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          is_admin?: boolean
          logo_url?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string
          created_at?: string
          crn?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          is_admin?: boolean
          logo_url?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          activity_level: Database["public"]["Enums"]["activity_level"] | null
          allergies: string[] | null
          birth_date: string | null
          created_at: string
          dietary_restrictions: string[] | null
          email: string | null
          full_name: string
          gender: string | null
          goal: Database["public"]["Enums"]["patient_goal"] | null
          id: string
          medical_conditions: string | null
          notes: string | null
          nutritionist_id: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          allergies?: string[] | null
          birth_date?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          email?: string | null
          full_name: string
          gender?: string | null
          goal?: Database["public"]["Enums"]["patient_goal"] | null
          id?: string
          medical_conditions?: string | null
          notes?: string | null
          nutritionist_id: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          allergies?: string[] | null
          birth_date?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          email?: string | null
          full_name?: string
          gender?: string | null
          goal?: Database["public"]["Enums"]["patient_goal"] | null
          id?: string
          medical_conditions?: string | null
          notes?: string | null
          nutritionist_id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_type: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_response: string | null
          created_at: string
          id: string
          message: string
          nutritionist_id: string
          responded_at: string | null
          status: string
          subject: string
          ticket_number: number
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          id?: string
          message: string
          nutritionist_id: string
          responded_at?: string | null
          status?: string
          subject: string
          ticket_number?: number
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          id?: string
          message?: string
          nutritionist_id?: string
          responded_at?: string | null
          status?: string
          subject?: string
          ticket_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
        ]
      }
      water_logs: {
        Row: {
          created_at: string
          date: string
          goal_ml: number
          id: string
          patient_id: string
          quantity_ml: number
        }
        Insert: {
          created_at?: string
          date?: string
          goal_ml?: number
          id?: string
          patient_id: string
          quantity_ml?: number
        }
        Update: {
          created_at?: string
          date?: string
          goal_ml?: number
          id?: string
          patient_id?: string
          quantity_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "water_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_logs: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          recorded_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          recorded_at?: string
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          recorded_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_account_status: { Args: never; Returns: string }
      get_user_type: { Args: never; Returns: string }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_user_patient: { Args: never; Returns: boolean }
    }
    Enums: {
      activity_level:
        | "sedentary"
        | "light"
        | "moderate"
        | "active"
        | "very_active"
      patient_goal:
        | "hypertrophy"
        | "weight_loss"
        | "maintenance"
        | "health"
        | "performance"
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
      activity_level: [
        "sedentary",
        "light",
        "moderate",
        "active",
        "very_active",
      ],
      patient_goal: [
        "hypertrophy",
        "weight_loss",
        "maintenance",
        "health",
        "performance",
      ],
    },
  },
} as const
