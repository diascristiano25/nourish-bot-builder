import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const mealGradients: Record<string, string> = {
  'Café da Manhã': 'from-amber-500/20 to-amber-500/5',
  'Lanche da Manhã': 'from-orange-500/20 to-orange-500/5',
  'Almoço': 'from-green-500/20 to-green-500/5',
  'Lanche da Tarde': 'from-blue-500/20 to-blue-500/5',
  'Jantar': 'from-purple-500/20 to-purple-500/5',
  'Ceia': 'from-slate-500/20 to-slate-500/5',
};

export function NextMealCard({ meal }: NextMealCardProps) {
  const Icon = mealIcons[meal.name] || UtensilsCrossed;
  const gradient = mealGradients[meal.name] || 'from-primary/20 to-primary/5';

  return (
    <Card className={`border-border/50 overflow-hidden bg-gradient-to-br ${gradient}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Próxima Refeição</h2>
          {meal.isTomorrow && (
            <span className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full">
              Amanhã
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-background/60 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{meal.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{meal.scheduledTime || meal.time}</span>
              {meal.totalCalories && (
                <>
                  <span className="mx-1">•</span>
                  <span>{meal.totalCalories} kcal</span>
                </>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Preview items */}
        {meal.items && meal.items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              {meal.items.slice(0, 3).map(item => item.food).join(' • ')}
              {meal.items.length > 3 && ` +${meal.items.length - 3} mais`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
