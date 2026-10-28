/**
 * Calculate calories burned based on MET value, weight, and duration.
 * Formula: MET × weight_kg × (duration_min / 60)
 *
 * @param metValue - Metabolic Equivalent of Task value
 * @param weightKg - Patient weight in kilograms
 * @param durationMin - Exercise duration in minutes
 * @returns Calories burned (rounded to nearest integer)
 */
export function calculateCaloriesBurned(
  metValue: number,
  weightKg: number,
  durationMin: number
): number {
  if (durationMin === 0) return 0;

  const durationHours = durationMin / 60;
  const caloriesBurned = metValue * weightKg * durationHours;

  return Math.round(caloriesBurned);
}