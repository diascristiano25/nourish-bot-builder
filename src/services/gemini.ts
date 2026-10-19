// Edge Function handles Gemini API calls

export interface MealPlanRequest {
  patientName: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  objective: "hypertrophy" | "weight_loss" | "maintenance" | "athletic_performance";
  dietary_restrictions: string[];
  allergies: string[];
  activity_level: "sedentary" | "light" | "moderate" | "intense" | "very_intense";
  meals_per_day: number;
  preferences: string[];
}

export interface MealPlan {
  breakfast: Meal[];
  mid_morning_snack?: Meal[];
  lunch: Meal[];
  afternoon_snack?: Meal[];
  dinner: Meal[];
  notes: string;
}

export interface Meal {
  name: string;
  portion: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export async function generateMealPlan(
  request: MealPlanRequest
): Promise<MealPlan> {
  // Hardcoded Supabase credentials (public anon key - safe for client-side)
  const supabaseUrl = 'https://nwenbxqmfpyspxpibgwp.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZW5ieHFtZnB5c3B4cGliZ3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjA0MjgsImV4cCI6MjEwNjUzNjQyOH0.W6LxzVqjiE9edLvNryO2QOudjxqQOHroCIu31e2UDf4';

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-meal-plan`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle rate limit specifically
      if (response.status === 429) {
        throw new Error(
          "Limite de requisições atingido. Por favor, aguarde alguns minutos e tente novamente."
        );
      }

      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const mealPlan = await response.json();
    return mealPlan as MealPlan;
  } catch (error) {
    console.error("Error generating meal plan:", error);

    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Falha ao gerar plano alimentar. Tente novamente.");
  }
}

export async function validateMealPlan(mealPlan: MealPlan): Promise<boolean> {
  const totalCalories =
    (mealPlan.breakfast?.reduce((sum, m) => sum + m.macros.calories, 0) || 0) +
    (mealPlan.lunch?.reduce((sum, m) => sum + m.macros.calories, 0) || 0) +
    (mealPlan.dinner?.reduce((sum, m) => sum + m.macros.calories, 0) || 0);

  return totalCalories > 1000 && totalCalories < 5000;
}
