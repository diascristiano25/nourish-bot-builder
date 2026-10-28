export interface FoodItem {
  food_id: string;
  quantity_g: number;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function calculateMealMacros(items: FoodItem[]): MacroTotals {
  if (items.length === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  const totals = items.reduce(
    (acc, item) => {
      const factor = item.quantity_g / 100;
      acc.calories += item.calories_per_100g * factor;
      acc.protein += item.protein_per_100g * factor;
      acc.carbs += item.carbs_per_100g * factor;
      acc.fat += item.fat_per_100g * factor;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    calories: Math.round(totals.calories * 10) / 10,
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
  };
}