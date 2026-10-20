import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface PlanItem {
  label: string;
  percent: number;
  color: string;
}

interface PlansProgressProps {
  plans?: PlanItem[];
}

const defaultPlans: PlanItem[] = [
  { label: "Consultas", percent: 0, color: "bg-[#518C5B]" },
  { label: "Pacientes", percent: 0, color: "bg-[#C4764A]" },
  { label: "Planos", percent: 0, color: "bg-pink-500" },
];

export function PlansProgress({ plans = defaultPlans }: PlansProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-soft"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          MEUS PLANOS CONCLUÍDOS
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-1.5 bg-[#518C5B]/10 text-[#518C5B] text-xs font-semibold rounded-lg hover:bg-[#518C5B]/20 transition-colors"
        >
          Hoje
        </motion.button>
      </div>

      <div className="space-y-4 mb-5">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground font-medium">{plan.label}</span>
              <span className="text-sm font-bold text-foreground">{plan.percent}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${plan.percent}%` }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                className={`h-full ${plan.color} rounded-full`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(81, 140, 91, 0.05)' }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-[#518C5B] hover:border-[#518C5B]/40 transition-all"
      >
        <Plus className="w-4 h-4" />
        Adicionar plano
      </motion.button>
    </motion.div>
  );
}