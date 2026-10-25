import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientData, MealPlan, Meal } from '@/pages/PatientMobileApp';
import { CircularWaterTracker } from './CircularWaterTracker';
import { MacroSummary } from './MacroSummary';
import { NextMealCard } from './NextMealCard';
import { CalendarDays, Droplets, Flame, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface PatientDashboardProps {
  patient: PatientData;
  mealPlan: MealPlan | null;
  waterLog: { currentMl: number; goalMl: number };
  onAddWater: (amount: number) => void;
}

/**
 * Soma os macros consumidos no dia a partir das refeições do plano.
 * Como o paciente ainda não marca refeições "concluídas" de forma persistente,
 * consideramos como "consumido" as refeições cujo horário já passou hoje —
 * assim as barras refletem o progresso real do dia em vez de ficarem zeradas.
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
    if (currentMinutes < scheduled) continue; // refeição ainda não aconteceu

    const items = meal.items || [];
    for (const item of items) {
      calories += Number(item.calories) || 0;
      // macros por item não vêm do banco hoje; estimamos a partir das calorias
      // usando uma distribuição clínica padrão (30% prot / 45% carb / 25% gordura)
      const kcal = Number(item.calories) || 0;
      protein += (kcal * 0.3) / 4; // 4 kcal/g
      carbs += (kcal * 0.45) / 4;
      fat += (kcal * 0.25) / 9; // 9 kcal/g
    }
    // se a refeição tem totalCalories mas sem itens detalhados, contabiliza o total
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

export function PatientDashboard({ patient, mealPlan, waterLog, onAddWater }: PatientDashboardProps) {
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
    <div className="px-4 pt-4 space-y-4 pb-4">
      {/* Hero greeting card — clean clinical green */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-[#518C5B] p-5 text-white"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-white/75 text-xs font-medium capitalize flex items-center gap-1.5 mb-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {today}
          </p>
          <h1 className="text-xl font-semibold leading-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-white/70 text-sm mt-0.5">
            Vamos cuidar da sua saúde hoje
          </p>
        </div>
      </motion.div>

      {/* Quick stats row — calories + water at a glance */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="bg-card rounded-2xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#C4764A]/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#C4764A]" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Calorias</span>
          </div>
          <p className="text-2xl font-semibold text-foreground leading-none">
            {current.calories}
            <span className="text-sm font-normal text-muted-foreground"> / {goals.calories}</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">kcal consumidas hoje</p>
        </div>

        <div className="bg-card rounded-2xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Água</span>
          </div>
          <p className="text-2xl font-semibold text-foreground leading-none">
            {Math.round(waterLog.currentMl / 100) / 10}
            <span className="text-sm font-normal text-muted-foreground"> / {Math.round(waterLog.goalMl / 100) / 10}</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">litros • {waterPercent}% da meta</p>
        </div>
      </motion.div>

      {/* Water Tracker Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.4 }}
        className="bg-card rounded-2xl border border-border/60 p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Hidratação</h2>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {waterPercent}%
          </span>
        </div>
        <CircularWaterTracker
          currentMl={waterLog.currentMl}
          goalMl={waterLog.goalMl}
          onAddWater={onAddWater}
        />
      </motion.div>

      {/* Macro Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-card rounded-2xl border border-border/60 p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#C4764A]/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[#C4764A]" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Resumo Nutricional</h2>
        </div>
        <MacroSummary macros={macros} />
      </motion.div>

      {/* Next Meal */}
      {nextMeal && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.4 }}
        >
          <NextMealCard meal={nextMeal} />
        </motion.div>
      )}
    </div>
  );
}