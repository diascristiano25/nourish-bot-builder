import { describe, it, expect } from 'vitest';
import { calculateCaloriesBurned } from '../exercise-calculator';

describe('calculateCaloriesBurned', () => {
  it('calculates correctly using MET formula', () => {
    // Running at 8 METs, 70kg person, 30 minutes
    // Formula: MET × weight_kg × duration_hours
    const result = calculateCaloriesBurned(8, 70, 30);
    expect(result).toBe(280); // 8 × 70 × 0.5
  });

  it('returns 0 for zero duration', () => {
    expect(calculateCaloriesBurned(5, 70, 0)).toBe(0);
  });
});