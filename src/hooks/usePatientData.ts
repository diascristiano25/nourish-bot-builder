/**
 * usePatientData - Custom hook for fetching patient data
 * Manages patient profile, meal plan, and progress queries with unified error handling
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  Patient,
  MealPlan,
  ProgressEntry,
  fetchPatient,
  fetchCurrentMealPlan,
  fetchProgressData,
} from "@/lib/supabase-queries";

interface UsePatientDataReturn {
  patient: UseQueryResult<Patient>;
  mealPlan: UseQueryResult<MealPlan>;
  progress: UseQueryResult<ProgressEntry[]>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch all patient data including profile, meal plan, and progress
 */
export function usePatientData(patientId: string): UsePatientDataReturn {
  const patientQuery = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => fetchPatient(patientId),
    enabled: !!patientId,
  });

  const mealPlanQuery = useQuery({
    queryKey: ["patientMealPlan", patientId],
    queryFn: () => fetchCurrentMealPlan(patientId),
    enabled: !!patientId,
  });

  const progressQuery = useQuery({
    queryKey: ["patientProgress", patientId],
    queryFn: () => fetchProgressData(patientId),
    enabled: !!patientId,
  });

  const isLoading = patientQuery.isLoading || mealPlanQuery.isLoading || progressQuery.isLoading;

  const error = patientQuery.error || mealPlanQuery.error || progressQuery.error || null;

  return {
    patient: patientQuery,
    mealPlan: mealPlanQuery,
    progress: progressQuery,
    isLoading,
    error: error as Error | null,
  };
}
