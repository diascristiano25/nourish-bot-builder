import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Flame,
  Clock,
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
    meals?: any[];
  } | null;
}

const mealIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Café da Manhã': Coffee,
  'Lanche da Manhã': Cookie,
  'Almoço': Sun,
  'Lanche da Tarde': Cookie,
  'Jantar': Moon,
  'Ceia': UtensilsCrossed,
  cafe_da_manha: Coffee,
  breakfast: Coffee,
  almoco: Sun,
  lunch: Sun,
  lanche: Cookie,
  snack: Cookie,
  jantar: Moon,
  dinner: Moon,
};

// Clean clinical accent per meal type — muted, not neon
const mealAccent: Record<string, string> = {
  'Café da Manhã': 'text-amber-600 bg-amber-500/10',
  'Lanche da Manhã': 'text-orange-600 bg-orange-500/10',
  'Almoço': 'text-[#518C5B] bg-[#518C5B]/10',
  'Lanche da Tarde': 'text-sky-600 bg-sky-500/10',
  'Jantar': 'text-indigo-600 bg-indigo-500/10',
  'Ceia': 'text-muted-foreground bg-muted',
  cafe_da_manha: 'text-amber-600 bg-amber-500/10',
  breakfast: 'text-amber-600 bg-amber-500/10',
  almoco: 'text-[#518C5B] bg-[#518C5B]/10',
  lunch: 'text-[#518C5B] bg-[#518C5B]/10',
  lanche: 'text-sky-600 bg-sky-500/10',
  snack: 'text-sky-600 bg-sky-500/10',
  jantar: 'text-indigo-600 bg-indigo-500/10',
  dinner: 'text-indigo-600 bg-indigo-500/10',
};

const defaultAccent = 'text-muted-foreground bg-muted';

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
 * Extrai grupos de refeição de qualquer estrutura de plan_data/meals que a IA possa gerar.
 * Suporta: meals[], array de dias, days[0].meals, chaves por tipo (cafe_da_manha/almoco), day_1 aninhado.
 */
function extractMealGroups(planData: any): MealGroup[] {
  if (!planData) return [];

  if (Array.isArray(planData.meals)) {
    return planData.meals.map((m: any, idx: number) => normalizeMealGroup(m, idx));
  }

  if (Array.isArray(planData) && planData.length > 0) {
    const first = planData[0];
    if (Array.isArray(first?.meals)) {
      return first.meals.map((m: any, idx: number) => normalizeMealGroup(m, idx));
    }
    if (Array.isArray(first)) {
      return first.map((m: any, idx: number) => normalizeMealGroup(m, idx));
    }
  }

  if (planData.days && Array.isArray(planData.days) && planData.days[0]) {
    const day = planData.days[0];
    if (Array.isArray(day.meals)) {
      return day.meals.map((m: any, idx: number) => normalizeMealGroup(m, idx));
    }
  }

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
      <div className="px-4 pt-4">
        <header className="mb-5">
          <h1 className="text-xl font-semibold text-foreground">Plano Alimentar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Seu cardápio personalizado</p>
        </header>
        <Card className="border-dashed border-border/60">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-foreground font-medium">Nenhum cardápio disponível</p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Aguarde seu nutricionista criar seu plano alimentar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lê tanto a coluna real `meals` quanto o alias `plan_data`
  const planData = mealPlan.plan_data || (mealPlan.meals ? { meals: mealPlan.meals } : null);
  const mealGroups = extractMealGroups(planData);
  const totalCalories = mealPlan.total_calories || planData?.totalCalories || planData?.total_calories;
  const planTitle = mealPlan.title || mealPlan.name || 'Cardápio Personalizado';

  return (
    <div className="px-4 pt-4 pb-4">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-foreground">Plano Alimentar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{planTitle}</p>
      </header>

      {totalCalories != null && (
        <Card className="border-border/60 mb-4 bg-[#518C5B]/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#518C5B]/15 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 text-[#518C5B]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Meta diária</p>
              <p className="text-lg font-semibold text-foreground leading-tight tabular-nums">
                {totalCalories} <span className="text-sm font-normal text-muted-foreground">kcal</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {mealGroups.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-foreground font-medium">Refeições indisponíveis</p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Seu nutricionista está preparando seu cardápio.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible defaultValue="meal-0" className="space-y-2.5">
          {mealGroups.map((meal, index) => {
            const Icon = mealIcons[meal.name] || mealIcons[meal.id] || UtensilsCrossed;
            const accent = mealAccent[meal.name] || mealAccent[meal.id] || defaultAccent;
            const [accentText, accentBg] = accent.split(' ');
            return (
              <AccordionItem
                key={meal.id}
                value={`meal-${index}`}
                className="border border-border/60 rounded-2xl overflow-hidden bg-card px-1"
              >
                <AccordionTrigger className="px-3 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', accentBg)}>
                      <Icon className={cn('w-4 h-4', accentText)} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{meal.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        {meal.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {meal.time}
                          </span>
                        )}
                        {meal.totalCalories != null && (
                          <>
                            {meal.time && <span className="text-muted-foreground/40">•</span>}
                            <span className="tabular-nums">{meal.totalCalories} kcal</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 pt-1">
                  {meal.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">Detalhes em breve</p>
                  ) : (
                    <ul className="space-y-1 mb-3">
                      {meal.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-start justify-between gap-3 py-2 border-b border-border/40 last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground leading-snug">{item.food}</p>
                            {item.portion && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.portion}</p>
                            )}
                          </div>
                          {item.calories != null && (
                            <span className="text-xs text-muted-foreground font-medium tabular-nums flex-shrink-0">
                              {item.calories} kcal
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9 rounded-xl border-dashed border-border/70 text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedMeal(meal.name)}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-2" />
                        Ver substituições
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle className="text-base">Substituições — {meal.name}</DrawerTitle>
                      </DrawerHeader>
                      <div className="px-4 pb-8 space-y-2.5">
                        {(mealSubstitutes[meal.name] || mealSubstitutes['Almoço']).map((sub, i) => (
                          <Card
                            key={i}
                            className="border-border/60 hover:border-[#518C5B]/40 transition-colors cursor-pointer"
                          >
                            <CardContent className="p-3.5 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground leading-snug">{sub.food}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{sub.portion}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  {sub.calories} kcal
                                </span>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
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

      {planData?.notes && (
        <Card className="border-border/60 mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-foreground mb-1.5">Observações</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{planData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}