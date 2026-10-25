import { motion } from 'framer-motion';
import { fadeInScale, liftHover, glowHover } from '@/lib/motion-variants';
import { MealPlan } from './PlanLibrary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Copy, Trash2, Flame, Leaf, Wheat } from 'lucide-react';
import { useState } from 'react';

interface PlanCardProps {
  plan: MealPlan;
  onSelect: () => void;
  onDuplicate?: (plan: MealPlan) => void;
  onDelete?: (planId: string) => void;
}

export function PlanCard({ plan, onSelect, onDuplicate, onDelete }: PlanCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedDate = new Date(plan.createdAt).toLocaleDateString('pt-BR');

  return (
    <motion.div
      variants={fadeInScale}
      whileHover={liftHover}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden cursor-pointer transition-all bg-card/50 backdrop-blur-sm hover:border-orange-300 border border-border">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground line-clamp-2">
              {plan.name}
            </h3>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {plan.description || 'Sem descrição'}
          </p>

          {/* Nutrition Info */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-medium text-orange-600">
                <Flame className="w-3 h-3" />
                Calorias
              </div>
              <p className="text-lg font-bold text-foreground">{plan.calories}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                <Wheat className="w-3 h-3" />
                Refeições
              </div>
              <p className="text-lg font-bold text-foreground">{plan.meals}</p>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-red-50 rounded p-2 text-center">
              <p className="font-bold text-red-700">{Math.round(plan.protein)}g</p>
              <p className="text-red-600 text-xs">Proteína</p>
            </div>
            <div className="bg-amber-50 rounded p-2 text-center">
              <p className="font-bold text-amber-700">{Math.round(plan.carbs)}g</p>
              <p className="text-amber-600 text-xs">Carbos</p>
            </div>
            <div className="bg-yellow-50 rounded p-2 text-center">
              <p className="font-bold text-yellow-700">{Math.round(plan.fats)}g</p>
              <p className="text-yellow-600 text-xs">Gorduras</p>
            </div>
          </div>

          {/* Actions */}
          <motion.div
            className="flex gap-2 pt-3 border-t border-gray-100"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: isHovered ? 1 : 0.6 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="sm"
              variant="default"
              className="flex-1 gap-1 bg-orange-500 hover:bg-orange-600"
              onClick={onSelect}
            >
              <Edit className="w-3 h-3" />
              Editar
            </Button>
            {onDuplicate && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1"
                onClick={() => onDuplicate(plan)}
              >
                <Copy className="w-3 h-3" />
                Copiar
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(plan.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
