import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  UtensilsCrossed,
  Coffee,
  Sun,
  Moon,
  Cookie,
  RefreshCw,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MealItem {
  food: string;
  portion: string;
  calories?: number;
}

interface MealGroup {
  id: string;
  name: string;
  time?: string;
  totalCalories?: number;
  items: MealItem[];
}

interface PatientPlanoProps {
  mealPlan: {
    title?: string;
    name?: string;
    total_calories?: number;
    plan_data?: any;
  } | null;
}

const mealIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Café da Manhã': Coffee,
  'Lanche da Manhã': Cookie,
  'Almoço': Sun,
  'Lanche da Tarde': Cookie,
  'Jantar': Moon,
  'Ceia': UtensilsCrossed,
  'cafe_da_manha': Coffee,
  'breakfast': Coffee,
  'almoco': Sun,
  'lunch': Sun,
  'lanche': Cookie,
  'snack': Cookie,
  'jantar': Moon,
  'dinner': Moon,
};

const mealColors: Record<string, { bg: string; text: string; border: string }> = {
  'Café da Manhã': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  'Lanche da Manhã': { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  'Almoço': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  'Lanche da Tarde': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  'Jantar': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  'Ceia': { bg: 'bg-secondary/10', text: 'text-muted-foreground', border: 'border-border' },
  'cafe_da_manha': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  'breakfast': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  'almoco': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  'lunch': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  'lanche': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  'snack': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  'jantar': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  'dinner': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
};

const defaultColors = { bg: 'bg-secondary/10', text: 'text-muted-foreground', border: 'border-border' };

// Dummy substitutes data
const mealSubstitutes: Record<string, MealItem[]> = {
  'Café da Manhã': [
    { food: 'Pão integral com queijo branco', portion: '2 fatias + 30g', calories: 180 },
    { food: 'Mingau de aveia com banana', portion: '1 porção', calories: 220 },
    { food: 'Tapioca com ovo mexido', portion: '1 unidade', calories: 200 },
  ],
  'Almoço': [
    { food: 'Frango grelhado com batata doce', portion: '150g + 100g', calories: 350 },
    { food: 'Peixe assado com legumes', portion: '180g + 150g', calories: 320 },
    { food: 'Carne moída com purê de abóbora', portion: '120g + 150g', calories: 340 },
  ],
  'Jantar': [
    { food: 'Omelete de legumes', portion: '3 ovos', calories: 280 },
    { food: 'Sopa de legumes com frango', portion: '1 prato', calories: 250 },
    { food: 'Salada com atum e grão-de-bico', portion: '1 porção', calories: 300 },
  ],
};

const mealTypeLabels: Record<string, string> = {
  cafe_da_manha: 'Café da Manhã',
  breakfast: 'Café da Manhã',
  almoco: 'Almoço',
  lunch: 'Almoço',
  lanche: 'Lanche',
  snack: 'Lanche',
  jantar: 'Jantar',
  dinner: 'Jantar',
};

/**
 * Robustly extract meal groups from any plan_data structure the AI might generate.
 * Returns an array of MealGroup with normalized items.
 */
function extractMealGroups(planData: any): MealGroup[] {
  if (!planData) return [];

  // Structure A: plan_data.meals is array of meal groups (each with items[])
  if (Array.isArray(planData.meals)) {
    return planData.meals.map((m: any, idx: number) => normalizeMealGroup(m, idx));
  }

  // Structure B: plan_data is array of days → take first day's meals
  if (Array.isArray(planData) && planData.length > 0) {
    const first = planData[0];
    if (Array.isArray(first?.meals)) {
      return first.meals.map((m: any, idx: number) => normalizeMealGroup(m, idx));
    }
    if (Array.isArray(first)) {
      return first.map((m: any, idx: number) => normalizeMealGroup(m, idx));
    }
  }

  // Structure C: plan_data.days[0].meals
  if (planData.days && Array.isArray(planData.days) && planData.days[0]) {
    const day = planData.days[0];
    if (Array.isArray(day.meals)) {
      return day.meals.map((m: any, idx: number) => normalizeMealGroup(m, idx));
    }
  }

  // Structure D: plan_data has meal-type keys (cafe_da_manha, almoco, etc.)
  const mealKeys = ['cafe_da_manha', 'breakfast', 'almoco', 'lunch', 'lanche', 'snack', 'jantar', 'dinner', 'ceia'];
  const found: MealGroup[] = [];
  for (const key of mealKeys) {
    if (planData[key]) {
      const val = planData[key];
      if (Array.isArray(val)) {
        found.push({
          id: key,
          name: mealTypeLabels[key] || key,
          items: val.map((it: any, i: number) => normalizeItem(it, i)),
        });
      } else if (typeof val === 'object') {
        found.push({
          id: key,
          name: mealTypeLabels[key] || key,
          items: [normalizeItem(val, 0)],
        });
      }
    }
  }
  if (found.length > 0) return found;

  // Structure E: plan_data.day_1 / dia_1 with nested meals
  const dayKeys = Object.keys(planData).filter(k => /^day[_-]?\d|^dia[_-]?\d/i.test(k));
  if (dayKeys.length > 0) {
    return extractMealGroups(planData[dayKeys[0]]);
  }

  return [];
}

function normalizeMealGroup(m: any, idx: number): MealGroup {
  const rawItems = m.items || m.foods || m.alimentos || m.refeicoes || [];
  return {
    id: m.id || `meal-${idx}`,
    name: m.name || m.nome || m.title || m.tipo || `Refeição ${idx + 1}`,
    time: m.time || m.horario || m.hour || undefined,
    totalCalories: m.totalCalories || m.total_calories || m.kcal || undefined,
    items: Array.isArray(rawItems)
      ? rawItems.map((it: any, i: number) => normalizeItem(it, i))
      : [],
  };
}

function normalizeItem(it: any, idx: number): MealItem {
  if (typeof it === 'string') {
    return { food: it, portion: '', calories: undefined };
  }
  return {
    food: it.food || it.nome || it.name || it.alimento || `Item ${idx + 1}`,
    portion: it.portion || it.porcao || it.quantidade || it.amount || '',
    calories: it.calories || it.kcal || it.calorias || undefined,
  };
}

export function PatientPlano({ mealPlan }: PatientPlanoProps) {
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);

  if (!mealPlan) {
    return (
      <div className="px-4 pt-4 animate-fade-in">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Plano Alimentar</h1>
          <p className="text-sm text-muted-foreground">Seu cardápio personalizado</p>
        </header>
        <Card className="border-dashed border-border/50">
          <CardContent className="p-8 text-center">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Nenhum cardápio disponível</p>
            <p className="text-sm text-muted-foreground mt-2">
              Aguarde seu nutricionista criar seu plano alimentar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planData = mealPlan.plan_data;
  const mealGroups = extractMealGroups(planData);
  const totalCalories = mealPlan.total_calories || planData?.totalCalories || planData?.total_calories;
  const planTitle = mealPlan.title || mealPlan.name || 'Cardápio Personalizado';

  return (
    <div className="px-4 pt-4 animate-fade-in">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Plano Alimentar</h1>
        <p className="text-sm text-muted-foreground">{planTitle}</p>
      </header>

      {/* Calories Summary */}
      {totalCalories && (
        <Card className="border-border/50 mb-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total diário</p>
                <p className="text-xl font-bold text-foreground">
                  {totalCalories} kcal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meals Accordion */}
      {mealGroups.length === 0 ? (
        <Card className="border-dashed border-border/50">
          <CardContent className="p-8 text-center">
            <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Refeições indisponíveis</p>
            <p className="text-sm text-muted-foreground mt-2">
              Seu nutricionista está preparando seu cardápio.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible defaultValue="meal-0" className="space-y-3">
          {mealGroups.map((meal, index) => {
            const Icon = mealIcons[meal.name] || mealIcons[meal.id] || UtensilsCrossed;
            const colors = mealColors[meal.name] || mealColors[meal.id] || defaultColors;
            return (
              <AccordionItem
                key={meal.id}
                value={`meal-${index}`}
                className={cn(
                  "border rounded-xl overflow-hidden",
                  colors.border
                )}
              >
                <AccordionTrigger className={cn(
                  "px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-b-none",
                  colors.bg
                )}>
                  <div className="flex items-center gap-3 w-full">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      "bg-background/60"
                    )}>
                      <Icon className={cn("w-4 h-4", colors.text)} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-foreground text-sm">{meal.name}</h3>
                      {meal.time && (
                        <p className="text-xs text-muted-foreground">{meal.time}</p>
                      )}
                    </div>
                    {meal.totalCalories && (
                      <Badge variant="secondary" className="mr-2 text-xs">
                        {meal.totalCalories} kcal
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  {meal.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">Detalhes em breve</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {meal.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between py-2 border-b border-dashed border-border/30 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-sm text-foreground">{item.food}</p>
                            {item.portion && (
                              <p className="text-xs text-muted-foreground">{item.portion}</p>
                            )}
                          </div>
                          {item.calories != null && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {item.calories} kcal
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Substitute Button */}
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9 rounded-lg border-dashed"
                        onClick={() => setSelectedMeal(meal.name)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Substituir
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Opções de Substituição</DrawerTitle>
                      </DrawerHeader>
                      <div className="px-4 pb-8 space-y-3">
                        {(mealSubstitutes[meal.name] || mealSubstitutes['Almoço']).map((sub, i) => (
                          <Card
                            key={i}
                            className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                          >
                            <CardContent className="p-4 flex items-center justify-between">
                              <div>
                                <p className="font-medium text-foreground">{sub.food}</p>
                                <p className="text-xs text-muted-foreground">{sub.portion}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground font-mono">
                                  {sub.calories} kcal
                                </span>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </DrawerContent>
                  </Drawer>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Notes */}
      {planData?.notes && (
        <Card className="border-border/50 mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-foreground mb-2">Observações</h3>
            <p className="text-sm text-muted-foreground">{planData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}