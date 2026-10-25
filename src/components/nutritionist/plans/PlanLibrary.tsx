import { motion } from 'framer-motion';
import { fadeInScale, staggerContainer, staggerItem, rotateHover } from '@/lib/motion-variants';
import { PlanCard } from './PlanCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export interface MealPlan {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: number;
  createdAt: string;
  updatedAt: string;
}

interface PlanLibraryProps {
  plans: MealPlan[];
  onSelectPlan: (plan: MealPlan) => void;
  onCreateNew: () => void;
  isLoading?: boolean;
}

export function PlanLibrary({ plans, onSelectPlan, onCreateNew, isLoading = false }: PlanLibraryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      role="region"
      aria-label="Biblioteca de planos de refeição"
      className="space-y-6"
    >
      {/* New Plan Button */}
      <motion.div
        whileHover={rotateHover}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={onCreateNew}
          size="lg"
          className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          <Plus className="w-4 h-4" />
          Novo Plano
        </Button>
      </motion.div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <p>Nenhum plano criado ainda. Comece criando seu primeiro plano!</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={staggerItem}
            >
              <PlanCard
                plan={plan}
                onSelect={() => onSelectPlan(plan)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
