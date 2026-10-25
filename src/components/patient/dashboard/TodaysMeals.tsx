/**
 * TodaysMeals - Displays today's meal schedule
 * Shows all meals for the current day with completion status
 * Supports multiple plan_data structures from AI generation
 */

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion-variants';
import { Coffee, Sun, Sunset, Moon, Check, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';

interface Meal {
  id: string;
  type: string;
  name: string;
  time: string;
  calories?: number;
  completed?: boolean;
}

interface TodaysMealsProps {
  mealPlan: {
    data?: any;
    plan_data?: any;
    total_calories?: number;
    meals_per_day?: number;
  };
}

const mealIcons: Record<string, React.ReactNode> = {
  breakfast: <Coffee className="w-5 h-5" />,
  lunch: <Sun className="w-5 h-5" />,
  snack: <Sunset className="w-5 h-5" />,
  dinner: <Moon className="w-5 h-5" />,
  cafe_da_manha: <Coffee className="w-5 h-5" />,
  almoco: <Sun className="w-5 h-5" />,
  lanche: <Sunset className="w-5 h-5" />,
  jantar: <Moon className="w-5 h-5" />,
};

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
  cafe_da_manha: 'Café da Manhã',
  almoco: 'Almoço',
  lanche: 'Lanche',
  jantar: 'Jantar',
};

// Helper to extract meals array from various plan_data structures
function extractMeals(planData: any): Meal[] {
  if (!planData) return [];

  // Structure 1: plan_data.meals (array of meal objects)
  if (Array.isArray(planData.meals)) {
    return planData.meals.map((m: any, idx: number) => ({
      id: m.id || `meal-${idx}`,
      type: m.type || m.tipo || 'snack',
      name: m.name || m.nome || m.title || 'Refeição',
      time: m.time || m.horario || m.hour || '',
      calories: m.calories || m.kcal || undefined,
      completed: false,
    }));
  }

  // Structure 2: plan_data is an array of days, each with meals
  if (Array.isArray(planData) && planData.length > 0) {
    const firstDay = planData[0];
    if (Array.isArray(firstDay.meals)) {
      return firstDay.meals.map((m: any, idx: number) => ({
        id: m.id || `meal-${idx}`,
        type: m.type || m.tipo || 'snack',
        name: m.name || m.nome || m.title || 'Refeição',
        time: m.time || m.horario || m.hour || '',
        calories: m.calories || m.kcal || undefined,
        completed: false,
      }));
    }
    if (Array.isArray(firstDay)) {
      return firstDay.map((m: any, idx: number) => ({
        id: m.id || `meal-${idx}`,
        type: m.type || m.tipo || 'snack',
        name: m.name || m.nome || m.title || 'Refeição',
        time: m.time || m.horario || m.hour || '',
        calories: m.calories || m.kcal || undefined,
        completed: false,
      }));
    }
  }

  // Structure 3: plan_data.days[0].meals
  if (planData.days && Array.isArray(planData.days) && planData.days[0]) {
    if (Array.isArray(planData.days[0].meals)) {
      return planData.days[0].meals.map((m: any, idx: number) => ({
        id: m.id || `meal-${idx}`,
        type: m.type || m.tipo || 'snack',
        name: m.name || m.nome || m.title || 'Refeição',
        time: m.time || m.horario || m.hour || '',
        calories: m.calories || m.kcal || undefined,
        completed: false,
      }));
    }
  }

  // Structure 4: plan_data has meal types as keys (cafe_da_manha, almoco, etc.)
  const mealTypes = ['cafe_da_manha', 'breakfast', 'almoco', 'lunch', 'lanche', 'snack', 'jantar', 'dinner'];
  const foundMeals: Meal[] = [];
  for (const type of mealTypes) {
    if (planData[type]) {
      const meal = planData[type];
      if (typeof meal === 'object' && !Array.isArray(meal)) {
        foundMeals.push({
          id: type,
          type: type,
          name: meal.name || meal.nome || meal.title || mealTypeLabels[type] || type.replace('_', ' '),
          time: meal.time || meal.horario || meal.hour || '',
          calories: meal.calories || meal.kcal || undefined,
          completed: false,
        });
      } else if (Array.isArray(meal)) {
        meal.forEach((m: any, idx: number) => {
          foundMeals.push({
            id: `${type}-${idx}`,
            type: type,
            name: m.name || m.nome || m.title || mealTypeLabels[type] || type.replace('_', ' '),
            time: m.time || m.horario || m.hour || '',
            calories: m.calories || m.kcal || undefined,
            completed: false,
          });
        });
      }
    }
  }
  if (foundMeals.length > 0) return foundMeals;

  // Structure 5: plan_data has a "day_1" or similar key with meals
  const dayKeys = Object.keys(planData).filter(k => k.startsWith('day_') || k.startsWith('dia_'));
  if (dayKeys.length > 0) {
    const firstDayData = planData[dayKeys[0]];
    if (firstDayData && typeof firstDayData === 'object') {
      return extractMeals(firstDayData); // Recursive call
    }
  }

  return [];
}

export function TodaysMeals({ mealPlan }: TodaysMealsProps) {
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());

  // Try multiple data paths: plan_data (new), data.plan_data, data.meals (legacy)
  const planData = mealPlan?.plan_data || mealPlan?.data?.plan_data || mealPlan?.data;
  const meals = extractMeals(planData);
  const totalCalories = mealPlan?.total_calories || mealPlan?.data?.total_calories;

  const toggleMealCompletion = (mealId: string) => {
    setCompletedMeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
      } else {
        newSet.add(mealId);
      }
      return newSet;
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-nf-teal" />
          Refeições de Hoje
        </h2>
        {totalCalories && (
          <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            {totalCalories} kcal
          </span>
        )}
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-8">
          <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Nenhuma refeição planejada para hoje
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Seu nutricionista ainda não atribuiu um cardápio
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          className="space-y-3"
        >
          {meals.map((meal) => {
            const isCompleted = completedMeals.has(meal.id);
            return (
              <motion.div
                key={meal.id}
                variants={staggerItem}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-secondary/50 border-border hover:border-nf-teal/50 hover:bg-secondary'
                }`}
                onClick={() => toggleMealCompletion(meal.id)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-nf-teal/10 text-nf-teal'
                }`}>
                  {mealIcons[meal.type] || <Coffee className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${isCompleted ? 'text-emerald-400 line-through' : 'text-foreground'}`}>
                    {meal.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs capitalize ${isCompleted ? 'text-emerald-500/70' : 'text-muted-foreground'}`}>
                      {mealTypeLabels[meal.type] || meal.type.replace('_', ' ')}
                    </span>
                    {meal.time && (
                      <span className={`text-xs ${isCompleted ? 'text-emerald-500/70' : 'text-muted-foreground/60'}`}>
                        • {meal.time}
                      </span>
                    )}
                    {meal.calories && (
                      <span className={`text-xs ${isCompleted ? 'text-emerald-500/70' : 'text-muted-foreground/60'}`}>
                        • {meal.calories} kcal
                      </span>
                    )}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-border'
                }`}>
                  {isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}