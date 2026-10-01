import { useState } from 'react';
import { MealPlan, Meal } from '@/pages/PatientMobileApp';
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

interface PatientPlanoProps {
  mealPlan: MealPlan | null;
}

const mealIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Café da Manhã': Coffee,
  'Lanche da Manhã': Cookie,
  'Almoço': Sun,
  'Lanche da Tarde': Cookie,
  'Jantar': Moon,
  'Ceia': UtensilsCrossed,
};

const mealColors: Record<string, { bg: string; text: string; border: string }> = {
  'Café da Manhã': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  'Lanche da Manhã': { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  'Almoço': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  'Lanche da Tarde': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  'Jantar': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  'Ceia': { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/30' },
};

// Dummy substitutes data
const mealSubstitutes: Record<string, { food: string; portion: string; calories: number }[]> = {
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

  return (
    <div className="px-4 pt-4 animate-fade-in">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Plano Alimentar</h1>
        <p className="text-sm text-muted-foreground">{mealPlan.title}</p>
      </header>

      {/* Calories Summary */}
      <Card className="border-border/50 mb-4 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total diário</p>
              <p className="text-xl font-bold text-foreground">
                {mealPlan.total_calories || mealPlan.plan_data.totalCalories || '—'} kcal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals Accordion */}
      <Accordion type="single" collapsible className="space-y-3">
        {mealPlan.plan_data.meals?.map((meal, index) => {
          const Icon = mealIcons[meal.name] || UtensilsCrossed;
          const colors = mealColors[meal.name] || mealColors['Ceia'];

          return (
            <AccordionItem 
              key={index} 
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
                <div className="space-y-2 mb-4">
                  {meal.items?.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      className="flex items-center justify-between py-2 border-b border-dashed border-border/30 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.food}</p>
                        <p className="text-xs text-muted-foreground">{item.portion}</p>
                      </div>
                      {item.calories && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {item.calories} kcal
                        </span>
                      )}
                    </div>
                  ))}
                </div>

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

      {/* Notes */}
      {mealPlan.plan_data.notes && (
        <Card className="border-border/50 mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm text-foreground mb-2">Observações</h3>
            <p className="text-sm text-muted-foreground">{mealPlan.plan_data.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
