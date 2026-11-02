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
 <div className="bg-card rounded-3xl border border-border/40 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
 Próxima Refeição
 </span>
 {meal.isTomorrow && (
 <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
 Amanhã
 </span>
 )}
 </div>
 {meal.scheduledTime && (
 <span className="text-sm font-bold text-primary flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full">
 <Clock className="w-3.5 h-3.5" />
 {meal.scheduledTime}
 </span>
 )}
 </div>

 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
 <Icon className="w-7 h-7 text-primary" />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="font-bold text-foreground text-base">{meal.name}</h3>
 <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
 {meal.totalCalories && (
 <span className="font-semibold tabular-nums text-foreground/80">{meal.totalCalories} kcal</span>
 )}
 {meal.items && meal.items.length > 0 && (
 <>
 {meal.totalCalories && <span className="text-muted-foreground/30">•</span>}
 <span className="truncate text-xs">
 {meal.items.slice(0, 2).map(item => item.food).join(', ')}
 {meal.items.length > 2 && ` +${meal.items.length - 2}`}
 </span>
 </>
 )}
 </div>
 </div>
 <ChevronRight className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
 </div>
 </div>
 );
}