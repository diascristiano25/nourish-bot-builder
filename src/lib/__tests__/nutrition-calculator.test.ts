import { describe, it, expect } from 'vitest';
import { calculateMealMacros } from '../nutrition-calculator';

describe('calculateMealMacros', () => {
  it('sums macros correctly for multiple items', () => {
    const items = [
      { food_id: '1', quantity_g: 100, calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2 },
      { food_id: '2', quantity_g: 200, calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6 },
    ];
    const result = calculateMealMacros(items);
    expect(result.calories).toBe(382); // 52 + 330
    expect(result.protein).toBe(62.3); // 0.3 + 62
  });

  it('returns zeros for empty array', () => {
    expect(calculateMealMacros([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});