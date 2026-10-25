import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientData, MealPlan } from '@/pages/PatientMobileApp';
import { CircularWaterTracker } from './CircularWaterTracker';
import { MacroSummary } from './MacroSummary';
import { NextMealCard } from './NextMealCard';
import { CalendarDays, Droplets, Flame, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

interface PatientDashboardProps {
  patient: PatientData;
  mealPlan: MealPlan | null;
  waterLog: { currentMl: number; goalMl: number };
  onAddWater: (amount: number) => void;
}

export function PatientDashboard({ patient, mealPlan, waterLog, onAddWater }: PatientDashboardProps) {
  const firstName = patient.full_name.split(' ')[0];
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const macros = {
    calories: { current: 0, goal: mealPlan?.total_calories || 2000 },
    protein: { current: 0, goal: 150 },
    carbs: { current: 0, goal: 250 },
    fat: { current: 0, goal: 65 },
  };

  const getNextMeal = () => {
    if (!mealPlan?.plan_data?.meals) return null;
    const now = new Date();
    const currentHour = now.getHours();
    const mealTimes: Record<string, number> = {
      'Café da Manhã': 7, 'Lanche da Manhã': 10, 'Almoço': 12,
      'Lanche da Tarde': 15, 'Jantar': 19, 'Ceia': 21,
    };
    for (const meal of mealPlan.plan_data.meals) {
      const mealHour = mealTimes[meal.name] || 12;
      if (currentHour < mealHour) {
        return { ...meal, scheduledTime: `${mealHour}:00` };
      }
    }
    return mealPlan.plan_data.meals[0] ? {
      ...mealPlan.plan_data.meals[0],
      scheduledTime: '07:00',
      isTomorrow: true
    } : null;
  };

  const nextMeal = getNextMeal();
  const waterPercent = Math.min(100, Math.round((waterLog.currentMl / waterLog.goalMl) * 100));

  return (
    <div className="px-4 pt-4 space-y-5 pb-4">
      {/* Hero greeting card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#518C5B] via-[#4a7d52] to-[#3d7047] p-6 text-white shadow-xl shadow-emerald-900/20"
      >
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 right-16 opacity-25"
        >
          <Leaf className="w-8 h-8" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-4 right-8 opacity-20"
        >
          <Droplets className="w-10 h-10" />
        </motion.div>
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-white/80 text-sm font-medium capitalize flex items-center gap-1.5 mb-1"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            {today}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-2xl font-bold leading-tight"
          >
            {greeting}, {firstName}! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-white/75 text-sm mt-1"
          >
            Vamos cuidar da sua saúde hoje
          </motion.p>
        </div>
      </motion.div>

      {/* Water Tracker Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-card rounded-3xl border border-border/60 shadow-soft overflow-hidden p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Hidratação</h2>
          </div>
          <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-card rounded-3xl border border-border/60 shadow-soft p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#C4764A]/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#C4764A]" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Resumo do Dia</h2>
        </div>
        <MacroSummary macros={macros} />
      </motion.div>

      {/* Next Meal */}
      {nextMeal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <NextMealCard meal={nextMeal} />
        </motion.div>
      )}
    </div>
  );
}