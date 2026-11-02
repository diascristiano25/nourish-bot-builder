import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientData, MealPlan, Meal } from '@/pages/PatientMobileApp';
import { CircularWaterTracker } from './CircularWaterTracker';
import { MacroSummary } from './MacroSummary';
import { NextMealCard } from './NextMealCard';
import { StreakTracker } from './StreakTracker';
import { QuickActions } from './QuickActions';
import { CalendarDays, Droplets, Flame, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface PatientDashboardProps {
  patient: PatientData;
  mealPlan: MealPlan | null;
  waterLog: { currentMl: number; goalMl: number };
  onAddWater: (amount: number) => void;
  onNavigateToRegistro?: () => void;
  onNavigateToAgenda?: () => void;
}

/**
 * Soma os macros consumidos no dia a partir das refeições do plano.
 * Consideramos como "consumido" as refeições cujo horário já passou hoje.
 */
function computeDayMacros(mealPlan: MealPlan | null) {
  const goals = {
    calories: mealPlan?.total_calories || 2000,
    protein: mealPlan?.plan_data?.macros?.protein || 150,
    carbs: mealPlan?.plan_data?.macros?.carbs || 250,
    fat: mealPlan?.plan_data?.macros?.fat || 65,
  };

  const meals: Meal[] = mealPlan?.plan_data?.meals || [];
  if (meals.length === 0) {
    return { current: { calories: 0, protein: 0, carbs: 0, fat: 0 }, goals };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const mealMinutes: Record<string, number> = {
    'Café da Manhã': 7 * 60,
    'Lanche da Manhã': 10 * 60,
    'Almoço': 12 * 60,
    'Lanche da Tarde': 15 * 60,
    'Jantar': 19 * 60,
    'Ceia': 21 * 60,
  };

  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const meal of meals) {
    const scheduled = parseMealMinutes(meal.time) ?? mealMinutes[meal.name] ?? 12 * 60;
    if (currentMinutes < scheduled) continue;

    const items = meal.items || [];
    for (const item of items) {
      calories += Number(item.calories) || 0;
      const kcal = Number(item.calories) || 0;
      protein += (kcal * 0.3) / 4;
      carbs += (kcal * 0.45) / 4;
      fat += (kcal * 0.25) / 9;
    }
    if (items.length === 0 && meal.totalCalories) {
      calories += Number(meal.totalCalories);
      const kcal = Number(meal.totalCalories);
      protein += (kcal * 0.3) / 4;
      carbs += (kcal * 0.45) / 4;
      fat += (kcal * 0.25) / 9;
    }
  }

  return {
    current: {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    },
    goals,
  };
}

function parseMealMinutes(time?: string): number | null {
  if (!time) return null;
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export function PatientDashboard({ patient, mealPlan, waterLog, onAddWater, onNavigateToRegistro, onNavigateToAgenda }: PatientDashboardProps) {
  const firstName = patient.full_name.split(' ')[0];
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const { current, goals } = computeDayMacros(mealPlan);
  const macros = {
    calories: { current: current.calories, goal: goals.calories },
    protein: { current: current.protein, goal: goals.protein },
    carbs: { current: current.carbs, goal: goals.carbs },
    fat: { current: current.fat, goal: goals.fat },
  };

  const getNextMeal = () => {
    const meals = mealPlan?.plan_data?.meals;
    if (!meals || meals.length === 0) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const mealMinutes: Record<string, number> = {
      'Café da Manhã': 7 * 60, 'Lanche da Manhã': 10 * 60, 'Almoço': 12 * 60,
      'Lanche da Tarde': 15 * 60, 'Jantar': 19 * 60, 'Ceia': 21 * 60,
    };
    for (const meal of meals) {
      const scheduled = parseMealMinutes(meal.time) ?? mealMinutes[meal.name] ?? 12 * 60;
      if (currentMinutes < scheduled) {
        const h = Math.floor(scheduled / 60);
        const m = scheduled % 60;
        return { ...meal, scheduledTime: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` };
      }
    }
    return { ...meals[0], scheduledTime: '07:00', isTomorrow: true };
  };
  const nextMeal = getNextMeal();
  const waterPercent = Math.min(100, Math.round((waterLog.currentMl / waterLog.goalMl) * 100));

  return (
    <div className="px-4 pt-4 space-y-5 pb-6">
      {/* Hero greeting card — premium gradient with decorative orbs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(168,76%,36%)] via-[hsl(168,76%,42%)] to-[hsl(155,40%,45%)] p-6 text-white shadow-lg shadow-primary/20"
      >
        {/* Decorative background orbs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-8 w-20 h-20 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
            <CalendarDays className="w-3.5 h-3.5 text-white/90" />
            <span className="text-white/90 text-xs font-medium capitalize">{today}</span>
          </div>
          <h1 className="text-2xl font-display font-semibold leading-tight mb-1">
            {greeting}, {firstName}
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Vamos cuidar da sua saúde hoje ✨
          </p>
        </div>
      </motion.div>

      {/* Quick stats row — calories + water at a glance */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-2 gap-3"
      >
        {/* Calories card */}
        <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
              <Flame className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Calorias</span>
          </div>
          <p className="text-3xl font-bold text-foreground leading-none tabular-nums">
            {current.calories}
          </p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            de {goals.calories} kcal
          </p>
          {/* Mini progress bar */}
          <div className="mt-3 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (current.calories / goals.calories) * 100)}%` }}
            />
          </div>
        </div>

        {/* Water card */}
        <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info/20 to-info/5 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-info" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Água</span>
          </div>
          <p className="text-3xl font-bold text-foreground leading-none tabular-nums">
            {Math.round(waterLog.currentMl / 100) / 10}
          </p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            de {Math.round(waterLog.goalMl / 100) / 10} L • {waterPercent}%
          </p>
          {/* Mini progress bar */}
          <div className="mt-3 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-info to-info/80 rounded-full transition-all duration-700"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Water Tracker Card — elevated design */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className="bg-card rounded-3xl border border-border/40 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info/20 to-info/5 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-info" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Hidratação</h2>
              <p className="text-xs text-muted-foreground">Acompanhe sua meta diária</p>
            </div>
          </div>
          <span className="text-sm font-bold text-info bg-info/10 px-3 py-1.5 rounded-full">
            {waterPercent}%
          </span>
        </div>
        <CircularWaterTracker
          currentMl={waterLog.currentMl}
          goalMl={waterLog.goalMl}
          onAddWater={onAddWater}
        />
      </motion.div>

      {/* Macro Summary Card — elevated design */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.4 }}
        className="bg-card rounded-3xl border border-border/40 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
            <Activity className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Resumo Nutricional</h2>
            <p className="text-xs text-muted-foreground">Macros do dia</p>
          </div>
        </div>
        <MacroSummary macros={macros} />
      </motion.div>

      {/* Next Meal */}
      {nextMeal && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.4 }}
        >
          <NextMealCard meal={nextMeal} />
        </motion.div>
      )}

      {/* Streak Tracker */}
      <StreakTracker />

      {/* Quick Actions FAB */}
      <QuickActions
        onAddWater={onAddWater}
        onNavigateToRegistro={onNavigateToRegistro || (() => {})}
        onNavigateToAgenda={onNavigateToAgenda || (() => {})}
      />
    </div>
  );
}