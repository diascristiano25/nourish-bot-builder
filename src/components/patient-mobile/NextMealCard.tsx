import { Card, CardContent } from '@/components/ui/card';
import { Clock, ChevronRight, Coffee, Sun, Moon, Cookie, UtensilsCrossed } from 'lucide-react';
import { Meal } from '@/pages/PatientMobileApp';

interface NextMealCardProps {
  meal: Meal & { scheduledTime?: string; isTomorrow?: boolean };
}

const mealIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Café da Manhã': Coffee,
  'Lanche da Manhã': Cookie,
  'Almoço': Sun,
  'Lanche da Tarde': Cookie,
  'Jantar': Moon,
  'Ceia': UtensilsCrossed,
};

export function NextMealCard({ meal }: NextMealCardProps) {
  const Icon = mealIcons[meal.name] || UtensilsCrossed;

  return (
    <Card className="border-border/60 overflow-hidden bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Próxima Refeição
            </span>
            {meal.isTomorrow && (
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                Amanhã
              </span>
            )}
          </div>
          {meal.scheduledTime && (
            <span className="text-xs font-medium text-[#518C5B] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {meal.scheduledTime}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#518C5B]/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-[#518C5B]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">{meal.name}</h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              {meal.totalCalories && (
                <span className="tabular-nums">{meal.totalCalories} kcal</span>
              )}
              {meal.items && meal.items.length > 0 && (
                <>
                  {meal.totalCalories && <span className="text-muted-foreground/40">•</span>}
                  <span className="truncate">
                    {meal.items.slice(0, 2).map(item => item.food).join(', ')}
                    {meal.items.length > 2 && ` +${meal.items.length - 2}`}
                  </span>
                </>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}