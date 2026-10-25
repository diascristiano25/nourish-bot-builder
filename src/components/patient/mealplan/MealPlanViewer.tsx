/**
 * MealPlanViewer - Full meal plan display with weekly view
 * Shows complete meal plan with nutrition details and completion tracking
 */

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';
import { Coffee, Sun, Sunset, Moon, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';

interface Meal {
  id: string;
  type: string;
  name: string;
  time: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  description?: string;
}

interface MealPlanViewerProps {
  mealPlan: {
    data?: {
      id?: string;
      name?: string;
      meals?: Meal[];
      start_date?: string;
      end_date?: string;
    };
  };
  onMarkMealDone?: (mealId: string) => void;
}

const mealIcons: Record<string, React.ReactNode> = {
  breakfast: <Coffee className="w-5 h-5" />,
  lunch: <Sun className="w-5 h-5" />,
  snack: <Sunset className="w-5 h-5" />,
  dinner: <Moon className="w-5 h-5" />,
};

const mealLabels: Record<string, string> = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
};

export function MealPlanViewer({ mealPlan, onMarkMealDone }: MealPlanViewerProps) {
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());
  const plan = mealPlan?.data;
  const meals = plan?.meals || [];

  // Group meals by type
  const mealsByType = meals.reduce((acc, meal) => {
    if (!acc[meal.type]) acc[meal.type] = [];
    acc[meal.type].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

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
    onMarkMealDone?.(mealId);
  };

  if (!plan || meals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum plano alimentar disponível</p>
        <p className="text-sm text-muted-foreground mt-2">
          Entre em contato com seu nutricionista para criar um plano personalizado
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Plan header */}
      <motion.div variants={staggerItem} className="bg-card rounded-lg p-6 border border-blue-200 shadow-sm">
        <h2 className="text-2xl font-bold text-foreground">{plan.name || 'Meu Plano Alimentar'}</h2>
        {plan.start_date && (
          <p className="text-sm text-muted-foreground mt-2">
            Período: {new Date(plan.start_date).toLocaleDateString('pt-BR')} até{' '}
            {plan.end_date ? new Date(plan.end_date).toLocaleDateString('pt-BR') : 'Indeterminado'}
          </p>
        )}
      </motion.div>

      {/* Meals by type */}
      {Object.entries(mealsByType).map(([type, typeMeals]) => (
        <motion.div
          key={type}
          variants={staggerItem}
          className="bg-card rounded-lg p-6 border border-blue-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-teal-500">
              {mealIcons[type] || <Coffee className="w-6 h-6" />}
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {mealLabels[type] || type}
            </h3>
          </div>

          <div className="space-y-3">
            {typeMeals.map((meal) => {
              const isCompleted = completedMeals.has(meal.id);
              return (
                <div
                  key={meal.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-secondary border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-foreground">{meal.name}</h4>
                        <span className="text-sm text-muted-foreground">{meal.time}</span>
                      </div>
                      {meal.description && (
                        <p className="text-sm text-muted-foreground mt-2">{meal.description}</p>
                      )}
                      {(meal.calories || meal.protein || meal.carbs || meal.fats) && (
                        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                          {meal.calories && <span>{meal.calories} kcal</span>}
                          {meal.protein && <span>{meal.protein}g proteína</span>}
                          {meal.carbs && <span>{meal.carbs}g carboidratos</span>}
                          {meal.fats && <span>{meal.fats}g gordura</span>}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleMealCompletion(meal.id)}
                      className="ml-4 text-muted-foreground hover:text-teal-500 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
