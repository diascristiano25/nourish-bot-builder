import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY || ""
);

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
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Você é um nutricionista profissional. Gere um plano alimentar detalhado baseado nas informações abaixo.

PACIENTE:
- Nome: ${request.patientName}
- Idade: ${request.age} anos
- Peso: ${request.weight} kg
- Altura: ${request.height} cm
- Objetivo: ${request.objective}
- Restrições: ${request.dietary_restrictions.join(", ") || "Nenhuma"}
- Alergias: ${request.allergies.join(", ") || "Nenhuma"}
- Nível de atividade: ${request.activity_level}
- Preferências: ${request.preferences.join(", ") || "Nenhuma"}
- Refeições por dia: ${request.meals_per_day}

INSTRUÇÕES:
1. Baseie-se na Tabela TACO (Tabela Brasileira de Composição de Alimentos)
2. Use alimentos brasileiros prioritariamente
3. Retorne em formato JSON estruturado
4. Cada refeição deve ter 2-3 itens
5. Inclua macronutrientes em cada item
6. Responda APENAS com JSON válido, sem markdown ou explicação

FORMATO JSON ESPERADO:
{
  "breakfast": [{"name": "", "portion": "", "macros": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0}}],
  "lunch": [],
  "dinner": [],
  "notes": ""
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response (handles cases with markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini");
    }

    const mealPlan = JSON.parse(jsonMatch[0]) as MealPlan;
    return mealPlan;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error(
      `Failed to generate meal plan: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function validateMealPlan(mealPlan: MealPlan): Promise<boolean> {
  const totalCalories =
    (mealPlan.breakfast?.reduce((sum, m) => sum + m.macros.calories, 0) || 0) +
    (mealPlan.lunch?.reduce((sum, m) => sum + m.macros.calories, 0) || 0) +
    (mealPlan.dinner?.reduce((sum, m) => sum + m.macros.calories, 0) || 0);

  return totalCalories > 1000 && totalCalories < 5000;
}
