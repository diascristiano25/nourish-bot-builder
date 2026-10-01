import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientData, MealPlan } from '@/pages/PatientMobileApp';
import { CircularWaterTracker } from './CircularWaterTracker';
import { MacroSummary } from './MacroSummary';
import { NextMealCard } from './NextMealCard';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

interface PatientDashboardProps {
  patient: PatientData;
  mealPlan: MealPlan | null;
  waterLog: { currentMl: number; goalMl: number };
  onAddWater: (amount: number) => void;
}

export function PatientDashboard({ patient, mealPlan, waterLog, onAddWater }: PatientDashboardProps) {
  const firstName = patient.full_name.split(' ')[0];
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  // Calculate macros from meal plan
  const macros = {
    calories: { current: 0, goal: mealPlan?.total_calories || 2000 },
    protein: { current: 0, goal: 150 },
    carbs: { current: 0, goal: 250 },
    fat: { current: 0, goal: 65 },
  };

  // Find next meal based on current time
  const getNextMeal = () => {
    if (!mealPlan?.plan_data?.meals) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Simple logic based on time of day
    const mealTimes: Record<string, number> = {
      'Café da Manhã': 7,
      'Lanche da Manhã': 10,
      'Almoço': 12,
      'Lanche da Tarde': 15,
      'Jantar': 19,
      'Ceia': 21,
    };

    for (const meal of mealPlan.plan_data.meals) {
      const mealHour = mealTimes[meal.name] || 12;
      if (currentHour < mealHour) {
        return { ...meal, scheduledTime: `${mealHour}:00` };
      }
    }
    
    // If all meals passed, return first meal for tomorrow
    return mealPlan.plan_data.meals[0] ? { 
      ...mealPlan.plan_data.meals[0], 
      scheduledTime: '07:00',
      isTomorrow: true 
    } : null;
  };

  const nextMeal = getNextMeal();

  return (
    <div className="px-4 pt-4 space-y-5 animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Olá, <span className="text-primary">{firstName}</span>! 👋
          </h1>
          <p className="text-sm text-muted-foreground capitalize flex items-center gap-1.5 mt-0.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {today}
          </p>
        </div>
      </header>

      {/* Water Tracker */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Controle de Água</h2>
          <CircularWaterTracker 
            currentMl={waterLog.currentMl}
            goalMl={waterLog.goalMl}
            onAddWater={onAddWater}
          />
        </CardContent>
      </Card>

      {/* Macro Summary */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Resumo do Dia</h2>
          <MacroSummary macros={macros} />
        </CardContent>
      </Card>

      {/* Next Meal */}
      {nextMeal && (
        <NextMealCard meal={nextMeal} />
      )}
    </div>
  );
}
