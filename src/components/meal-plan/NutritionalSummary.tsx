import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';

interface NutritionalSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
}

export function NutritionalSummary({
  calories,
  protein,
  carbs,
  fats,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFats
}: NutritionalSummaryProps) {
  const macros = [
    {
      label: 'Calorias',
      value: Math.round(calories),
      target: targetCalories,
      unit: 'kcal',
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      progressColor: 'bg-orange-500'
    },
    {
      label: 'Proteína',
      value: protein.toFixed(1),
      target: targetProtein,
      unit: 'g',
      icon: Beef,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      progressColor: 'bg-red-500'
    },
    {
      label: 'Carboidratos',
      value: carbs.toFixed(1),
      target: targetCarbs,
      unit: 'g',
      icon: Wheat,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      progressColor: 'bg-amber-500'
    },
    {
      label: 'Gorduras',
      value: fats.toFixed(1),
      target: targetFats,
      unit: 'g',
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      progressColor: 'bg-blue-500'
    }
  ];

  return (
    <Card className="p-6 sticky top-24">
      <h3 className="font-semibold text-lg mb-6">Resumo Nutricional</h3>

      <div className="space-y-6">
        {macros.map((macro, index) => {
          const Icon = macro.icon;
          const percentage = (Number(macro.value) / macro.target) * 100;
          const isOverTarget = percentage > 100;

          return (
            <motion.div
              key={macro.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${macro.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${macro.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{macro.label}</span>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isOverTarget ? 'text-red-600' : macro.color}`}>
                    {macro.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Meta: {macro.target}{macro.unit}
                  </p>
                </div>
              </div>

              <Progress
                value={Math.min(percentage, 100)}
                className="h-2"
                indicatorClassName={macro.progressColor}
              />

              <p className="text-xs text-right text-muted-foreground">
                {percentage.toFixed(0)}% da meta {isOverTarget && '(excedido)'}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Macros Distribution Pie (Visual Placeholder) */}
      <div className="mt-6 pt-6 border-t border-border/40">
        <h4 className="text-sm font-medium mb-4">Distribuição de Macros</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold text-red-600">
              {((protein * 4 / (calories || 1)) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Proteína</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">
              {((carbs * 4 / (calories || 1)) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Carboidratos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {((fats * 9 / (calories || 1)) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Gorduras</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
