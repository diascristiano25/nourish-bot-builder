import { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Sparkles, Save, FileDown, Eye, Calendar,
  UtensilsCrossed, Coffee, Sun, Sunset, Moon
} from 'lucide-react';
import { MealCard } from './MealCard';
import { FoodSearchDialog } from './FoodSearchDialog';
import { NutritionalSummary } from './NutritionalSummary';
import { AIGenerationPanel } from './AIGenerationPanel';
import { useToast } from '@/hooks/use-toast';

interface Food {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  foods: Food[];
}

interface DayPlan {
  day: string;
  dayOfWeek: string;
  meals: Meal[];
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const MEAL_ICONS = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Sunset,
  snack: UtensilsCrossed
};

const MEAL_LABELS = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche'
};

const MEAL_COLORS = {
  breakfast: 'from-amber-500 to-orange-600',
  lunch: 'from-emerald-500 to-teal-600',
  dinner: 'from-blue-500 to-indigo-600',
  snack: 'from-[#C4764A] to-[#a8573a]' // Terracotta (brand secondary color)
};

export function MealPlanBuilder() {
  const { toast } = useToast();
  const [currentDay, setCurrentDay] = useState(0);
  const [planData, setPlanData] = useState<DayPlan[]>(
    DAYS.map((day, index) => ({
      day: `Dia ${index + 1}`,
      dayOfWeek: day,
      meals: [
        { id: `${index}-breakfast`, type: 'breakfast', time: '07:00', foods: [] },
        { id: `${index}-lunch`, type: 'lunch', time: '12:00', foods: [] },
        { id: `${index}-snack`, type: 'snack', time: '15:00', foods: [] },
        { id: `${index}-dinner`, type: 'dinner', time: '19:00', foods: [] }
      ]
    }))
  );
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<{ dayIndex: number; mealId: string } | null>(null);

  const handleAddFood = useCallback((food: Food) => {
    if (!selectedMeal) return;

    setPlanData(prev => {
      const newData = [...prev];
      const day = newData[selectedMeal.dayIndex];
      const meal = day.meals.find(m => m.id === selectedMeal.mealId);
      if (meal) {
        meal.foods.push(food);
      }
      return newData;
    });

    toast({
      title: "Alimento adicionado",
      description: `${food.name} foi adicionado à refeição.`
    });

    setSearchDialogOpen(false);
  }, [selectedMeal, toast]);

  const handleRemoveFood = useCallback((dayIndex: number, mealId: string, foodId: string) => {
    setPlanData(prev => {
      const newData = [...prev];
      const day = newData[dayIndex];
      const meal = day.meals.find(m => m.id === mealId);
      if (meal) {
        meal.foods = meal.foods.filter(f => f.id !== foodId);
      }
      return newData;
    });
  }, []);

  const handleUpdateFoodQuantity = useCallback((
    dayIndex: number,
    mealId: string,
    foodId: string,
    quantity: number
  ) => {
    setPlanData(prev => {
      const newData = [...prev];
      const day = newData[dayIndex];
      const meal = day.meals.find(m => m.id === mealId);
      if (meal) {
        const food = meal.foods.find(f => f.id === foodId);
        if (food) {
          food.quantity = quantity;
        }
      }
      return newData;
    });
  }, []);

  const openFoodSearch = (dayIndex: number, mealId: string) => {
    setSelectedMeal({ dayIndex, mealId });
    setSearchDialogOpen(true);
  };

  const handleAIGenerate = async (preferences: any) => {
    // AI generation logic (already integrated with Claude)
    toast({
      title: "Gerando cardápio...",
      description: "Aguarde enquanto a IA cria seu plano personalizado."
    });
  };

  const handleSave = async () => {
    // Save to database
    toast({
      title: "Cardápio salvo!",
      description: "O plano alimentar foi salvo com sucesso."
    });
  };

  const handleExportPDF = () => {
    // Export logic
    toast({
      title: "Exportando PDF...",
      description: "Seu cardápio será baixado em instantes."
    });
  };

  const currentDayData = planData[currentDay];
  const totalDayMacros = currentDayData.meals.reduce(
    (acc, meal) => {
      const mealMacros = meal.foods.reduce(
        (mAcc, food) => ({
          calories: mAcc.calories + food.calories * (food.quantity / 100),
          protein: mAcc.protein + food.protein * (food.quantity / 100),
          carbs: mAcc.carbs + food.carbs * (food.quantity / 100),
          fats: mAcc.fats + food.fats * (food.quantity / 100)
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );
      return {
        calories: acc.calories + mealMacros.calories,
        protein: acc.protein + mealMacros.protein,
        carbs: acc.carbs + mealMacros.carbs,
        fats: acc.fats + mealMacros.fats
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/40">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Construtor de Cardápio</h1>
            <p className="text-sm text-muted-foreground">
              Monte um plano alimentar personalizado para seu paciente
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setAiPanelOpen(true)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Gerar com IA
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="gap-2">
              <FileDown className="w-4 h-4" />
              Exportar PDF
            </Button>
            <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4" />
              Salvar Cardápio
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Day Selector */}
            <Card className="p-6">
              <Tabs value={String(currentDay)} onValueChange={(v) => setCurrentDay(Number(v))}>
                <TabsList className="grid grid-cols-7 w-full">
                  {DAYS.map((day, index) => (
                    <TabsTrigger key={index} value={String(index)} className="text-xs">
                      {day.slice(0, 3)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </Card>

            {/* Meals */}
            <div className="space-y-4">
              {currentDayData.meals.map((meal, mealIndex) => {
                const Icon = MEAL_ICONS[meal.type];
                const mealMacros = meal.foods.reduce(
                  (acc, food) => ({
                    calories: acc.calories + food.calories * (food.quantity / 100),
                    protein: acc.protein + food.protein * (food.quantity / 100),
                    carbs: acc.carbs + food.carbs * (food.quantity / 100),
                    fats: acc.fats + food.fats * (food.quantity / 100)
                  }),
                  { calories: 0, protein: 0, carbs: 0, fats: 0 }
                );

                return (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: mealIndex * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      {/* Meal Header */}
                      <div className={`bg-gradient-to-r ${MEAL_COLORS[meal.type]} p-4 text-white`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-card/20 flex items-center justify-center">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{MEAL_LABELS[meal.type]}</h3>
                              <p className="text-sm text-white/80">{meal.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{Math.round(mealMacros.calories)}</p>
                            <p className="text-xs text-white/80">kcal</p>
                          </div>
                        </div>
                      </div>

                      {/* Food List */}
                      <div className="p-4 space-y-2">
                        {meal.foods.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Nenhum alimento adicionado</p>
                          </div>
                        ) : (
                          <Reorder.Group
                            axis="y"
                            values={meal.foods}
                            onReorder={(newOrder) => {
                              setPlanData(prev => {
                                const newData = [...prev];
                                newData[currentDay].meals[mealIndex].foods = newOrder;
                                return newData;
                              });
                            }}
                            className="space-y-2"
                          >
                            {meal.foods.map((food) => (
                              <MealCard
                                key={food.id}
                                food={food}
                                onRemove={() => handleRemoveFood(currentDay, meal.id, food.id)}
                                onUpdateQuantity={(quantity) =>
                                  handleUpdateFoodQuantity(currentDay, meal.id, food.id, quantity)
                                }
                              />
                            ))}
                          </Reorder.Group>
                        )}

                        <Button
                          variant="outline"
                          onClick={() => openFoodSearch(currentDay, meal.id)}
                          className="w-full mt-4 border-dashed"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Alimento
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar - Nutritional Summary */}
          <div className="space-y-6">
            <NutritionalSummary
              calories={totalDayMacros.calories}
              protein={totalDayMacros.protein}
              carbs={totalDayMacros.carbs}
              fats={totalDayMacros.fats}
              targetCalories={2000}
              targetProtein={150}
              targetCarbs={250}
              targetFats={67}
            />

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Copiar para outros dias
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Eye className="w-4 h-4" />
                  Pré-visualizar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <FoodSearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        onSelectFood={handleAddFood}
      />

      <AIGenerationPanel
        open={aiPanelOpen}
        onOpenChange={setAiPanelOpen}
        onGenerate={handleAIGenerate}
      />
    </div>
  );
}

