// Auto-generated types from Supabase schema
// NutriFlow - Complete Database Types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          crn: string | null
          specialties: string[] | null
          subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise'
          subscription_status: 'active' | 'inactive' | 'trial' | 'expired'
          subscription_expires_at: string | null
          avatar_url: string | null
          phone: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          crn?: string | null
          specialties?: string[] | null
          subscription_tier?: 'free' | 'basic' | 'premium' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'trial' | 'expired'
          subscription_expires_at?: string | null
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
