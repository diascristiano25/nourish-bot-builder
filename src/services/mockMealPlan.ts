import type { MealPlan } from "./gemini";

/**
 * Mock meal plan for testing and development
 * Based on TACO (Brazilian Food Composition Table)
 */
export const mockMealPlan: MealPlan = {
  breakfast: [
    {
      name: "Aveia com banana e mel",
      portion: "50g aveia + 1 banana média + 1 colher chá mel",
      macros: {
        calories: 320,
        protein: 12,
        carbs: 58,
        fat: 6,
        fiber: 8,
      },
    },
    {
      name: "Ovo mexido com queijo",
      portion: "2 ovos + 30g queijo minas",
      macros: {
        calories: 245,
        protein: 18,
        carbs: 2,
        fat: 18,
        fiber: 0,
      },
    },
    {
      name: "Suco de laranja natural",
      portion: "200ml (1 copo)",
      macros: {
        calories: 90,
        protein: 1,
        carbs: 21,
        fat: 0,
        fiber: 1,
      },
    },
  ],
  lunch: [
    {
      name: "Arroz integral",
      portion: "150g (4 colheres de sopa)",
      macros: {
        calories: 170,
        protein: 4,
        carbs: 36,
        fat: 2,
        fiber: 3,
      },
    },
    {
      name: "Feijão preto",
      portion: "100g (1 concha média)",
      macros: {
        calories: 77,
        protein: 5,
        carbs: 14,
        fat: 0.5,
        fiber: 5,
      },
    },
    {
      name: "Peito de frango grelhado",
      portion: "150g (1 filé médio)",
      macros: {
        calories: 195,
        protein: 42,
        carbs: 0,
        fat: 3,
        fiber: 0,
      },
    },
    {
      name: "Salada de alface e tomate",
      portion: "100g mista com azeite",
      macros: {
        calories: 60,
        protein: 1,
        carbs: 5,
        fat: 4,
        fiber: 2,
      },
    },
  ],
  dinner: [
    {
      name: "Batata doce assada",
      portion: "200g (1 unidade média)",
      macros: {
        calories: 180,
        protein: 3,
        carbs: 42,
        fat: 0.2,
        fiber: 4,
      },
    },
    {
      name: "Salmão grelhado",
      portion: "150g (1 filé)",
      macros: {
        calories: 280,
        protein: 32,
        carbs: 0,
        fat: 17,
        fiber: 0,
      },
    },
    {
      name: "Brócolis refogado",
      portion: "100g",
      macros: {
        calories: 55,
        protein: 4,
        carbs: 8,
        fat: 1,
        fiber: 3,
      },
    },
  ],
  snack_morning: [
    {
      name: "Castanhas mistas",
      portion: "30g (1 punhado)",
      macros: {
        calories: 185,
        protein: 5,
        carbs: 6,
        fat: 16,
        fiber: 3,
      },
    },
  ],
  snack_afternoon: [
    {
      name: "Iogurte grego natural",
      portion: "150g",
      macros: {
        calories: 130,
        protein: 15,
        carbs: 9,
        fat: 4,
        fiber: 0,
      },
    },
    {
      name: "Morango",
      portion: "100g (8 unidades)",
      macros: {
        calories: 32,
        protein: 1,
        carbs: 8,
        fat: 0,
        fiber: 2,
      },
    },
  ],
  notes:
    "Plano alimentar balanceado com ~2400 kcal/dia. Distribui bem os macronutrientes: carboidratos complexos, proteínas magras e gorduras saudáveis. Inclui fibras e micronutrientes essenciais. Beba 2-3L de água ao longo do dia.",
};
