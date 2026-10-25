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
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  plan_data?: any;
  total_calories?: number;
  meals_per_day?: number;
  is_active?: boolean;
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
      const startOfDay = new Date(date).toISOString().split("T")[0];
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query = query
        .gte("scheduled_at", `${startOfDay}T00:00:00`)
        .lt("scheduled_at", endOfDay.toISOString());
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
    const { data, error } = await supabase
      .from("meal_plans")
      .select("id, patient_id, name, description, created_at, updated_at, plan_data, total_calories, meals_per_day, is_active")
      .eq("patient_id", patientId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw new Error(`Failed to fetch meal plan: ${error.message}`);

    return {
      id: data.id,
      patient_id: data.patient_id,
      name: data.name || "",
      description: data.description,
      created_at: data.created_at,
      updated_at: data.updated_at,
      plan_data: data.plan_data,
      total_calories: data.total_calories,
      meals_per_day: data.meals_per_day,
      is_active: data.is_active,
    };
  } catch (error) {
    // Return null/empty object if no meal plan found (PGRST116 error for .single())
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
