/**
 * Supabase query helpers for nutritionist and patient data
 * All functions handle errors gracefully and return typed responses
 */

import { supabase } from "@/integrations/supabase/client";

// Type definitions for API responses
export interface NutritionistProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties?: string[];
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nutritionist_id?: string;
  age?: number;
  gender?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  nutritionist_id: string;
  user_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  status?: string;
  notes?: string;
  created_at: string;
}

export interface FinancialRecord {
  id: string;
  nutritionist_id: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  month: string;
  created_at: string;
}

export interface MealPlan {
  id: string;
  patient_id: string;
  title?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // REAL schema (verified via supabase db query): column is `meals` (jsonb array),
  // structure: [{ name, time, totalCalories, items: [{ food, portion, calories, protein, carbs, fat }] }]
  meals?: any[];
  total_calories?: number;
  protein_target?: number;
  carbs_target?: number;
  fat_target?: number;
  ai_generated?: boolean;
  is_active?: boolean;
  // Legacy alias kept for components that read plan_data — populated from `meals` at fetch time
  plan_data?: any;
}

export interface ProgressEntry {
  id: string;
  patient_id: string;
  date: string;
  weight?: number;
  notes?: string;
  created_at: string;
}

/**
 * Fetch nutritionist profile by user ID
 */
export async function fetchNutritionistProfile(
  userId: string
): Promise<NutritionistProfile> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, specialties, bio, created_at, updated_at")
      .eq("id", userId)
      .single();

    if (error) throw new Error(`Failed to fetch nutritionist profile: ${error.message}`);

    return {
      id: data.id,
      name: data.full_name || "",
      email: data.email || "",
      phone: data.phone,
      specialties: data.specialties,
      bio: data.bio,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    throw new Error(
      `Nutritionist profile fetch error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Fetch patients for a nutritionist with pagination
 */
export async function fetchPatients(
  nutritionistId: string,
  limit: number = 10,
  offset: number = 0
): Promise<Patient[]> {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("id, full_name, email, phone, nutritionist_id, age, gender, created_at, updated_at")
      .eq("nutritionist_id", nutritionistId)
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch patients: ${error.message}`);

    return (data || []).map((patient: any) => ({
      id: patient.id,
      name: patient.full_name || "",
      email: patient.email || "",
      phone: patient.phone,
      nutritionist_id: patient.nutritionist_id,
      age: patient.age,
      gender: patient.gender,
      created_at: patient.created_at,
      updated_at: patient.updated_at,
    }));
  } catch (error) {
    throw new Error(
      `Patients fetch error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Fetch appointments for a nutritionist, optionally filtered by date
 */
export async function fetchAppointments(
  nutritionistId: string,
  date?: string
): Promise<Appointment[]> {
  try {
    let query = supabase
      .from("appointments")
      .select("id, nutritionist_id, user_id, scheduled_at, duration_minutes, status, notes, created_at")
      .eq("nutritionist_id", nutritionistId);

    if (date) {
      // FIX: use local-timezone day boundaries instead of naive UTC strings.
      // The old code built "YYYY-MM-DDT00:00:00" (no offset) which Postgres
      // interprets as UTC midnight — 3h off for Brazil, pulling wrong-day rows.
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      query = query
        .gte("scheduled_at", dayStart.toISOString())
        .lte("scheduled_at", dayEnd.toISOString());
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch appointments: ${error.message}`);

    return (data || []).map((appointment: any) => ({
      id: appointment.id,
      nutritionist_id: appointment.nutritionist_id,
      user_id: appointment.user_id,
      scheduled_at: appointment.scheduled_at,
      duration_minutes: appointment.duration_minutes,
      status: appointment.status,
      notes: appointment.notes,
      created_at: appointment.created_at,
    }));
  } catch (error) {
    throw new Error(
      `Appointments fetch error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Fetch financial records for a nutritionist, optionally filtered by month
 */
export async function fetchFinancialRecords(
  nutritionistId: string,
  month?: string
): Promise<FinancialRecord[]> {
  try {
    let query = supabase
      .from("financial_records")
      .select("id, nutritionist_id, amount, type, description, month, created_at")
      .eq("nutritionist_id", nutritionistId);

    if (month) {
      query = query.eq("month", month);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch financial records: ${error.message}`);

    return (data || []).map((record: any) => ({
      id: record.id,
      nutritionist_id: record.nutritionist_id,
      amount: record.amount,
      type: record.type,
      description: record.description,
      month: record.month,
      created_at: record.created_at,
    }));
  } catch (error) {
    throw new Error(
      `Financial records fetch error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Fetch a single patient by ID
 */
export async function fetchPatient(patientId: string): Promise<Patient> {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("id, full_name, email, phone, nutritionist_id, age, gender, created_at, updated_at")
      .eq("id", patientId)
      .single();

    if (error) throw new Error(`Failed to fetch patient: ${error.message}`);

    return {
      id: data.id,
      name: data.full_name || "",
      email: data.email || "",
      phone: data.phone,
      nutritionist_id: data.nutritionist_id,
      age: data.age,
      gender: data.gender,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    throw new Error(
      `Patient fetch error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Fetch current meal plan for a patient
 */
export async function fetchCurrentMealPlan(patientId: string): Promise<MealPlan> {
  try {
    // REAL schema (verified via `supabase db query --linked`):
    // meal_plans columns: id, patient_id, title, description, protein_target, carbs_target,
    // fat_target, meals (jsonb array), ai_generated, created_at, updated_at,
    // total_calories, is_active. There is NO `name` and NO `plan_data` column.
    // `meals` structure: [{ name, time, totalCalories, items: [{ food, portion, calories, protein, carbs, fat }] }]
    const { data, error } = await supabase
      .from("meal_plans")
      .select("id, patient_id, title, description, created_at, updated_at, meals, total_calories, protein_target, carbs_target, fat_target, ai_generated, is_active")
      .eq("patient_id", patientId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw new Error(`Failed to fetch meal plan: ${error.message}`);

    const meals = Array.isArray(data.meals) ? data.meals : [];
    return {
      id: data.id,
      patient_id: data.patient_id,
      title: data.title || "",
      description: data.description,
      created_at: data.created_at,
      updated_at: data.updated_at,
      meals,
      total_calories: data.total_calories,
      protein_target: data.protein_target,
      carbs_target: data.carbs_target,
      fat_target: data.fat_target,
      ai_generated: data.ai_generated,
      is_active: data.is_active,
      // Legacy alias: components read plan_data.meals — mirror the real `meals` column here
      plan_data: { meals, totalCalories: data.total_calories },
    };
  } catch (error) {
    // Return empty object if no meal plan found (PGRST116 error for .single())
    if (error instanceof Error && error.message.includes('PGRST116')) {
      return {} as MealPlan;
    }
    throw new Error(
      `Meal plan fetch error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Fetch progress entries for a patient, optionally filtered by number of days
 */
export async function fetchProgressData(
  patientId: string,
  days: number = 30
): Promise<ProgressEntry[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("progress_entries")
      .select("id, patient_id, date, weight, notes, created_at")
      .eq("patient_id", patientId)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (error) throw new Error(`Failed to fetch progress data: ${error.message}`);

    return (data || []).map((entry: any) => ({
      id: entry.id,
      patient_id: entry.patient_id,
      date: entry.date,
      weight: entry.weight,
      notes: entry.notes,
      created_at: entry.created_at,
    }));
  } catch (error) {
    throw new Error(
      `Progress data fetch error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
