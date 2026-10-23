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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
          updated_at: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
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
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          nutritionist_id: string
          patient_id: string
          reminder_sent: boolean | null
          scheduled_at: string
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          nutritionist_id: string
          patient_id: string
          reminder_sent?: boolean | null
          scheduled_at: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          nutritionist_id?: string
          patient_id?: string
          reminder_sent?: boolean | null
          scheduled_at?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number | null
          clicks: number | null
          conversions: number | null
          created_at: string | null
          creative_url: string | null
          description: string | null
          id: string
          impressions: number | null
          meta_ad_id: string | null
          meta_ad_set_id: string | null
          meta_campaign_id: string | null
          nutritionist_id: string
          platform: string | null
          schedule_end: string | null
          schedule_start: string | null
          spend: number | null
          status: string | null
          target_audience: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          creative_url?: string | null
          description?: string | null
          id?: string
          impressions?: number | null
          meta_ad_id?: string | null
          meta_ad_set_id?: string | null
          meta_campaign_id?: string | null
          nutritionist_id: string
          platform?: string | null
          schedule_end?: string | null
          schedule_start?: string | null
          spend?: number | null
          status?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          creative_url?: string | null
          description?: string | null
          id?: string
          impressions?: number | null
          meta_ad_id?: string | null
          meta_ad_set_id?: string | null
          meta_campaign_id?: string | null
          nutritionist_id?: string
          platform?: string | null
          schedule_end?: string | null
          schedule_start?: string | null
          spend?: number | null
          status?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          activity_level: string | null
          avatar_url: string | null
          birthdate: string | null
          created_at: string | null
          dietary_restrictions: string[] | null
          email: string | null
          gender: string | null
          goals: string[] | null
          health_conditions: string[] | null
          height: number | null
          id: string
          name: string
          notes: string | null
          nutritionist_id: string
          phone: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          gender?: string | null
          goals?: string[] | null
          health_conditions?: string[] | null
          height?: number | null
          id?: string
          name: string
          notes?: string | null
          nutritionist_id: string
          phone?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          gender?: string | null
          goals?: string[] | null
          health_conditions?: string[] | null
          height?: number | null
          id?: string
          name?: string
          notes?: string | null
          nutritionist_id?: string
          phone?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          direction: string | null
          id: string
          model: string | null
          role: string
          tokens_used: number | null
          tool_calls: Json | null
          tool_results: Json | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          direction?: string | null
          id?: string
          model?: string | null
          role: string
          tokens_used?: number | null
          tool_calls?: Json | null
          tool_results?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          direction?: string | null
          id?: string
          model?: string | null
          role?: string
          tokens_used?: number | null
          tool_calls?: Json | null
          tool_results?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          contact_id: string
          contact_name: string | null
          contact_phone: string | null
          contact_stage: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          last_outbound_at: string | null
          message_count: number | null
          metadata: Json | null
          prospect_campaign_id: string | null
          prospect_step: number | null
          source: string | null
          started_at: string | null
          updated_at: string | null
        }
        Insert: {
          contact_id: string
          contact_name?: string | null
          contact_phone?: string | null
          contact_stage?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_outbound_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          prospect_campaign_id?: string | null
          prospect_step?: number | null
          source?: string | null
          started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_id?: string
          contact_name?: string | null
          contact_phone?: string | null
          contact_stage?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_outbound_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          prospect_campaign_id?: string | null
          prospect_step?: number | null
          source?: string | null
          started_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_foods: {
        Row: {
          calories: number | null
          carbs: number | null
          category: string | null
          created_at: string | null
          fat: number | null
          fiber: number | null
          id: string
          is_active: boolean | null
          name: string
          nutritionist_id: string
          protein: number | null
          serving_size: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          nutritionist_id: string
          protein?: number | null
          serving_size?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          nutritionist_id?: string
          protein?: number | null
          serving_size?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_foods_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_recipes: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          ingredients: Json | null
          instructions: string | null
          is_active: boolean | null
          name: string
          nutrition_info: Json | null
          nutritionist_id: string
          prep_time_minutes: number | null
          servings: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ingredients?: Json | null
          instructions?: string | null
          is_active?: boolean | null
          name: string
          nutrition_info?: Json | null
          nutritionist_id: string
          prep_time_minutes?: number | null
          servings?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ingredients?: Json | null
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          nutrition_info?: Json | null
          nutritionist_id?: string
          prep_time_minutes?: number | null
          servings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_recipes_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          patient_id: string | null
          payment_method: string | null
          processed_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          transaction_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          payment_method?: string | null
          processed_at?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          transaction_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          payment_method?: string | null
          processed_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      food_database: {
        Row: {
          brand: string | null
          calories: number | null
          carbs: number | null
          category: string | null
          fat: number | null
          id: string
          is_supplement: boolean | null
          name: string
          portion_description: string | null
          portion_grams: number | null
          protein: number | null
          supplement_type: string | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          calories?: number | null
          carbs?: number | null
          category?: string | null
          fat?: number | null
          id?: string
          is_supplement?: boolean | null
          name: string
          portion_description?: string | null
          portion_grams?: number | null
          protein?: number | null
          supplement_type?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          calories?: number | null
          carbs?: number | null
          category?: string | null
          fat?: number | null
          id?: string
          is_supplement?: boolean | null
          name?: string
          portion_description?: string | null
          portion_grams?: number | null
          protein?: number | null
          supplement_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      food_intake_logs: {
        Row: {
          created_at: string | null
          hunger_before: number | null
          id: string
          logged_at: string | null
          meal_type: string
          notes: string | null
          patient_id: string
          photo_url: string | null
          satiety_after: number | null
        }
        Insert: {
          created_at?: string | null
          hunger_before?: number | null
          id?: string
          logged_at?: string | null
          meal_type: string
          notes?: string | null
          patient_id: string
          photo_url?: string | null
          satiety_after?: number | null
        }
        Update: {
          created_at?: string | null
          hunger_before?: number | null
          id?: string
          logged_at?: string | null
          meal_type?: string
          notes?: string | null
          patient_id?: string
          photo_url?: string | null
          satiety_after?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "food_intake_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_consents: {
        Row: {
          consent_type: string
          created_at: string | null
          granted: boolean
          granted_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
          user_type: string
          version: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string | null
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_type: string
          version?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string | null
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_type?: string
          version?: string | null
        }
        Relationships: []
      }
      lgpd_data_access_log: {
        Row: {
          accessor_email: string | null
          accessor_user_id: string | null
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          reason: string | null
          record_ids: Json | null
          target_table: string | null
          target_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          accessor_email?: string | null
          accessor_user_id?: string | null
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          reason?: string | null
          record_ids?: Json | null
          target_table?: string | null
          target_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accessor_email?: string | null
          accessor_user_id?: string | null
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          reason?: string | null
          record_ids?: Json | null
          target_table?: string | null
          target_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          created_at: string | null
          hunger_before: number | null
          id: string
          logged_at: string | null
          meal_type: string | null
          notes: string | null
          patient_id: string
          photo_url: string | null
          satiety_after: number | null
        }
        Insert: {
          created_at?: string | null
          hunger_before?: number | null
          id?: string
          logged_at?: string | null
          meal_type?: string | null
          notes?: string | null
          patient_id: string
          photo_url?: string | null
          satiety_after?: number | null
        }
        Update: {
          created_at?: string | null
          hunger_before?: number | null
          id?: string
          logged_at?: string | null
          meal_type?: string | null
          notes?: string | null
          patient_id?: string
          photo_url?: string | null
          satiety_after?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          ai_generated: boolean | null
          calories_target: number | null
          carbs_target: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          fat_target: number | null
          id: string
          is_active: boolean | null
          meals: Json
          nutritionist_id: string
          patient_id: string
          protein_target: number | null
          start_date: string | null
          title: string
          total_calories: number | null
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          calories_target?: number | null
          carbs_target?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          fat_target?: number | null
          id?: string
          is_active?: boolean | null
          meals?: Json
          nutritionist_id: string
          patient_id: string
          protein_target?: number | null
          start_date?: string | null
          title: string
          total_calories?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          calories_target?: number | null
          carbs_target?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          fat_target?: number | null
          id?: string
          is_active?: boolean | null
          meals?: Json
          nutritionist_id?: string
          patient_id?: string
          protein_target?: number | null
          start_date?: string | null
          title?: string
          total_calories?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          nutritionist_id: string
          patient_id: string
          read_at: string | null
          sender_type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          nutritionist_id: string
          patient_id: string
          read_at?: string | null
          sender_type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          nutritionist_id?: string
          patient_id?: string
          read_at?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      nutritionists: {
        Row: {
          created_at: string | null
          crn: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          specialty: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crn?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          specialty?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crn?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          specialty?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          activity_level: string | null
          allergies: string[] | null
          birth_date: string | null
          created_at: string
          critical_tags: string[] | null
          data_retention_until: string | null
          dietary_restrictions: string[] | null
          email: string | null
          full_name: string | null
          gender: string | null
          goal: string | null
          height: number | null
          id: string
          initial_weight: number | null
          is_active: boolean | null
          medical_conditions: string | null
          notes: string | null
          nutritionist_id: string
          phone: string | null
          privacy_consent_at: string | null
          privacy_consent_version: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_level?: string | null
          allergies?: string[] | null
          birth_date?: string | null
          created_at?: string
          critical_tags?: string[] | null
          data_retention_until?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          initial_weight?: number | null
          is_active?: boolean | null
          medical_conditions?: string | null
          notes?: string | null
          nutritionist_id: string
          phone?: string | null
          privacy_consent_at?: string | null
          privacy_consent_version?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_level?: string | null
          allergies?: string[] | null
          birth_date?: string | null
          created_at?: string
          critical_tags?: string[] | null
          data_retention_until?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          initial_weight?: number | null
          is_active?: boolean | null
          medical_conditions?: string | null
          notes?: string | null
          nutritionist_id?: string
          phone?: string | null
          privacy_consent_at?: string | null
          privacy_consent_version?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          customer_id: string | null
          error: string | null
          event_type: string
          id: string
          metadata: Json | null
          payment_intent_id: string | null
          processed: boolean
          processed_at: string | null
          raw_event: Json
          status: string | null
          stripe_event_id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          error?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          processed?: boolean
          processed_at?: string | null
          raw_event: Json
          status?: string | null
          stripe_event_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          error?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          processed?: boolean
          processed_at?: string | null
          raw_event?: Json
          status?: string | null
          stripe_event_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          admin_notes: string | null
          created_at: string | null
          crn: string | null
          email_signature: string | null
          full_name: string
          has_seen_onboarding: boolean | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          last_login_at: string | null
          logo_url: string | null
          marketing_opt_in: boolean | null
          phone: string | null
          primary_color: string | null
          privacy_consent_at: string | null
          privacy_consent_version: string | null
          secondary_color: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_status?: string | null
          admin_notes?: string | null
          created_at?: string | null
          crn?: string | null
          email_signature?: string | null
          full_name: string
          has_seen_onboarding?: boolean | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          last_login_at?: string | null
          logo_url?: string | null
          marketing_opt_in?: boolean | null
          phone?: string | null
          primary_color?: string | null
          privacy_consent_at?: string | null
          privacy_consent_version?: string | null
          secondary_color?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_status?: string | null
          admin_notes?: string | null
          created_at?: string | null
          crn?: string | null
          email_signature?: string | null
          full_name?: string
          has_seen_onboarding?: boolean | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          last_login_at?: string | null
          logo_url?: string | null
          marketing_opt_in?: boolean | null
          phone?: string | null
          primary_color?: string | null
          privacy_consent_at?: string | null
          privacy_consent_version?: string | null
          secondary_color?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      purchase_events: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          patient_id: string | null
          payment_status: string
          product_id: string | null
          product_type: string
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          payment_status: string
          product_id?: string | null
          product_type: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          payment_status?: string
          product_id?: string | null
          product_type?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          is_staff_reply: boolean
          message: string
          ticket_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_staff_reply?: boolean
          message: string
          ticket_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_staff_reply?: boolean
          message?: string
          ticket_id?: string
          updated_at?: string
          user_id?: string
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
          assigned_to: string | null
          category: string | null
          created_at: string
          description: string
          id: string
          patient_id: string | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          patient_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          patient_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          logged_at: string
          notes: string | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          id?: string
          logged_at?: string
          notes?: string | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          logged_at?: string
          notes?: string | null
          patient_id?: string
          updated_at?: string
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
          measured_at: string
          notes: string | null
          patient_id: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          measured_at?: string
          notes?: string | null
          patient_id: string
          updated_at?: string
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          measured_at?: string
          notes?: string | null
          patient_id?: string
          updated_at?: string
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
      find_patient_by_email: {
        Args: { p_email: string }
        Returns: {
          full_name: string
          id: string
          nutritionist_id: string
        }[]
      }
      get_user_account_status: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      is_current_user_master_admin: { Args: never; Returns: boolean }
      is_master_admin: { Args: never; Returns: boolean }
      link_patient_user: { Args: { p_email: string }; Returns: undefined }
      patients_select_by_email_for_auth: {
        Args: { patient_email: string }
        Returns: {
          full_name: string
          id: string
          nutritionist_id: string
        }[]
      }
      send_message: {
        Args: {
          p_content: string
          p_nutritionist_id: string
          p_patient_id: string
          p_sender_type: string
        }
        Returns: {
          msg_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
