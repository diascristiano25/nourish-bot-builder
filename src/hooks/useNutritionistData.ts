/**
 * useNutritionistData - Custom hook for fetching nutritionist data
 * Manages profile, patients, and appointments queries with unified error handling
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  NutritionistProfile,
  Patient,
  Appointment,
  fetchNutritionistProfile,
  fetchPatients,
  fetchAppointments,
} from "@/lib/supabase-queries";

interface UseNutritionistDataReturn {
  profile: UseQueryResult<NutritionistProfile>;
  patients: UseQueryResult<Patient[]>;
  appointments: UseQueryResult<Appointment[]>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch all nutritionist data including profile, patients, and appointments
 */
export function useNutritionistData(nutritionistId: string): UseNutritionistDataReturn {
  const profileQuery = useQuery({
    queryKey: ["nutritionistProfile", nutritionistId],
    queryFn: () => fetchNutritionistProfile(nutritionistId),
    enabled: !!nutritionistId,
  });

  const patientsQuery = useQuery({
    queryKey: ["nutritionistPatients", nutritionistId],
    queryFn: () => fetchPatients(nutritionistId),
    enabled: !!nutritionistId,
  });

  const appointmentsQuery = useQuery({
    queryKey: ["nutritionistAppointments", nutritionistId],
    queryFn: () => fetchAppointments(nutritionistId),
    enabled: !!nutritionistId,
  });

  const isLoading = profileQuery.isLoading || patientsQuery.isLoading || appointmentsQuery.isLoading;

  const error = profileQuery.error || patientsQuery.error || appointmentsQuery.error || null;

  return {
    profile: profileQuery,
    patients: patientsQuery,
    appointments: appointmentsQuery,
    isLoading,
    error: error as Error | null,
  };
}
