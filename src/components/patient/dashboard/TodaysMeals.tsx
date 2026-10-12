/**
 * TodaysMeals - Displays today's meal schedule
 * Shows all meals for the current day with completion status
 */

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion-variants';
import { Coffee, Sun, Sunset, Moon, Check } from 'lucide-react';
import { useState } from 'react';

interface Meal {
  id: string;
  type: string;
  name: string;
  time: string;
  completed?: boolean;
}

interface TodaysMealsProps {
  mealPlan: {
    data?: {
      meals?: Meal[];
      mealsPerDay?: number;
    };
  };
}

const mealIcons: Record<string, React.ReactNode> = {
  breakfast: <Coffee className="w-5 h-5" />,
  lunch: <Sun className="w-5 h-5" />,
  snack: <Sunset className="w-5 h-5" />,
  dinner: <Moon className="w-5 h-5" />,
};

export function TodaysMeals({ mealPlan }: TodaysMealsProps) {
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());
  const meals = mealPlan?.data?.meals || [];

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
      className="rounded-lg border border-blue-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-bold text-slate-900 mb-4">Refeições de Hoje</h2>

      {meals.length === 0 ? (
        <p className="text-slate-500 text-center py-8">
          Nenhuma refeição planejada para hoje
        </p>
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
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200 hover:border-teal-300'
                }`}
                onClick={() => toggleMealCompletion(meal.id)}
              >
                <div className={`${isCompleted ? 'text-emerald-500' : 'text-teal-500'}`}>
                  {mealIcons[meal.type] || <Coffee className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${isCompleted ? 'text-emerald-900' : 'text-slate-900'}`}>
                    {meal.name}
                  </h3>
                  <p className={`text-sm ${isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {meal.time}
                  </p>
                </div>
                {isCompleted && (
                  <div className="text-emerald-500">
                    <Check className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
