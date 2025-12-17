import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Coffee, 
  Sun, 
  Apple, 
  Moon,
  Loader2,
  Save,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FoodItem {
  id: string;
  nome: string;
  porcao: string;
  calorias: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
}

interface Meal {
  id: string;
  tipo: string;
  nome: string;
  horario: string;
  alimentos: FoodItem[];
}

interface ConsultationMealPlanEditorProps {
  patientId?: string;
  onSave?: (planData: any) => void;
}

const mealTemplates: Omit<Meal, 'id' | 'alimentos'>[] = [
  { tipo: 'cafe', nome: 'Café da Manhã', horario: '07:00' },
  { tipo: 'almoco', nome: 'Almoço', horario: '12:00' },
  { tipo: 'lanche', nome: 'Lanche da Tarde', horario: '15:30' },
  { tipo: 'jantar', nome: 'Jantar', horario: '19:00' },
];

const mealIcons: Record<string, React.ElementType> = {
  'cafe': Coffee,
  'almoco': Sun,
  'lanche': Apple,
  'jantar': Moon,
};

// Mock food database (to be replaced with real API)
const mockFoods: Omit<FoodItem, 'id'>[] = [
  { nome: 'Pão integral', porcao: '2 fatias (50g)', calorias: 130, carboidratos: 24, proteinas: 5, gorduras: 2 },
  { nome: 'Ovo cozido', porcao: '2 unidades', calorias: 140, carboidratos: 1, proteinas: 12, gorduras: 10 },
  { nome: 'Banana', porcao: '1 unidade média', calorias: 105, carboidratos: 27, proteinas: 1, gorduras: 0 },
  { nome: 'Frango grelhado', porcao: '150g', calorias: 165, carboidratos: 0, proteinas: 31, gorduras: 4 },
  { nome: 'Arroz integral', porcao: '4 colheres (100g)', calorias: 111, carboidratos: 23, proteinas: 3, gorduras: 1 },
  { nome: 'Feijão', porcao: '1 concha (100g)', calorias: 77, carboidratos: 14, proteinas: 5, gorduras: 0 },
  { nome: 'Salada verde', porcao: '1 prato', calorias: 25, carboidratos: 5, proteinas: 2, gorduras: 0 },
  { nome: 'Azeite de oliva', porcao: '1 colher (10ml)', calorias: 90, carboidratos: 0, proteinas: 0, gorduras: 10 },
  { nome: 'Iogurte natural', porcao: '170g', calorias: 100, carboidratos: 6, proteinas: 17, gorduras: 1 },
  { nome: 'Aveia', porcao: '3 colheres (30g)', calorias: 117, carboidratos: 20, proteinas: 4, gorduras: 2 },
  { nome: 'Batata doce', porcao: '100g', calorias: 86, carboidratos: 20, proteinas: 2, gorduras: 0 },
  { nome: 'Whey protein', porcao: '1 scoop (30g)', calorias: 120, carboidratos: 2, proteinas: 24, gorduras: 1 },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

export function ConsultationMealPlanEditor({ patientId, onSave }: ConsultationMealPlanEditorProps) {
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>(
    mealTemplates.map(t => ({ ...t, id: generateId(), alimentos: [] }))
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [goals, setGoals] = useState({
    calories: 2000,
    carbs: 250,
    protein: 150,
    fat: 65
  });

  // Calculate totals
  const totals = meals.reduce((acc, meal) => {
    meal.alimentos.forEach(food => {
      acc.calorias += food.calorias;
      acc.carboidratos += food.carboidratos;
      acc.proteinas += food.proteinas;
      acc.gorduras += food.gorduras;
    });
    return acc;
  }, { calorias: 0, carboidratos: 0, proteinas: 0, gorduras: 0 });

  const addFood = (mealId: string, food: Omit<FoodItem, 'id'>) => {
    setMeals(prev => prev.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          alimentos: [...meal.alimentos, { ...food, id: generateId() }]
        };
      }
      return meal;
    }));
  };

  const removeFood = (mealId: string, foodId: string) => {
    setMeals(prev => prev.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          alimentos: meal.alimentos.filter(f => f.id !== foodId)
        };
      }
      return meal;
    }));
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fill with example diet
    const exampleDiet: Meal[] = [
      {
        id: generateId(),
        tipo: 'cafe',
        nome: 'Café da Manhã',
        horario: '07:00',
        alimentos: [
          { id: generateId(), nome: 'Pão integral', porcao: '2 fatias (50g)', calorias: 130, carboidratos: 24, proteinas: 5, gorduras: 2 },
          { id: generateId(), nome: 'Ovo cozido', porcao: '2 unidades', calorias: 140, carboidratos: 1, proteinas: 12, gorduras: 10 },
          { id: generateId(), nome: 'Banana', porcao: '1 unidade média', calorias: 105, carboidratos: 27, proteinas: 1, gorduras: 0 },
        ]
      },
      {
        id: generateId(),
        tipo: 'almoco',
        nome: 'Almoço',
        horario: '12:00',
        alimentos: [
          { id: generateId(), nome: 'Frango grelhado', porcao: '150g', calorias: 165, carboidratos: 0, proteinas: 31, gorduras: 4 },
          { id: generateId(), nome: 'Arroz integral', porcao: '4 colheres (100g)', calorias: 111, carboidratos: 23, proteinas: 3, gorduras: 1 },
          { id: generateId(), nome: 'Feijão', porcao: '1 concha (100g)', calorias: 77, carboidratos: 14, proteinas: 5, gorduras: 0 },
          { id: generateId(), nome: 'Salada verde', porcao: '1 prato', calorias: 25, carboidratos: 5, proteinas: 2, gorduras: 0 },
          { id: generateId(), nome: 'Azeite de oliva', porcao: '1 colher (10ml)', calorias: 90, carboidratos: 0, proteinas: 0, gorduras: 10 },
        ]
      },
      {
        id: generateId(),
        tipo: 'lanche',
        nome: 'Lanche da Tarde',
        horario: '15:30',
        alimentos: [
          { id: generateId(), nome: 'Iogurte natural', porcao: '170g', calorias: 100, carboidratos: 6, proteinas: 17, gorduras: 1 },
          { id: generateId(), nome: 'Aveia', porcao: '3 colheres (30g)', calorias: 117, carboidratos: 20, proteinas: 4, gorduras: 2 },
        ]
      },
      {
        id: generateId(),
        tipo: 'jantar',
        nome: 'Jantar',
        horario: '19:00',
        alimentos: [
          { id: generateId(), nome: 'Frango grelhado', porcao: '120g', calorias: 132, carboidratos: 0, proteinas: 25, gorduras: 3 },
          { id: generateId(), nome: 'Batata doce', porcao: '100g', calorias: 86, carboidratos: 20, proteinas: 2, gorduras: 0 },
          { id: generateId(), nome: 'Salada verde', porcao: '1 prato', calorias: 25, carboidratos: 5, proteinas: 2, gorduras: 0 },
        ]
      },
    ];
    
    setMeals(exampleDiet);
    setIsGenerating(false);
    
    toast({
      title: "Dieta gerada com sucesso!",
      description: "Revise os alimentos e ajuste conforme necessário.",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const planData = {
      meals: meals.map(m => ({
        tipo: m.tipo,
        nome: m.nome,
        horario: m.horario,
        alimentos: m.alimentos.map(a => ({
          nome: a.nome,
          porcao: a.porcao,
          calorias: a.calorias,
          carboidratos: a.carboidratos,
          proteinas: a.proteinas,
          gorduras: a.gorduras,
        }))
      })),
      totals,
      goals
    };
    
    if (onSave) {
      await onSave(planData);
    }
    
    setIsSaving(false);
    
    toast({
      title: "Plano salvo!",
      description: "O plano alimentar foi salvo com sucesso.",
    });
  };

  const getProgressColor = (current: number, goal: number) => {
    const ratio = current / goal;
    if (ratio < 0.8) return 'text-muted-foreground';
    if (ratio <= 1.1) return 'text-primary';
    return 'text-destructive';
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column - Goals & Summary */}
      <div className="space-y-4">
        {/* Goals Card */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Metas Diárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Calorias</label>
                <Input
                  type="number"
                  value={goals.calories}
                  onChange={(e) => setGoals(prev => ({ ...prev, calories: Number(e.target.value) }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Carboidratos (g)</label>
                <Input
                  type="number"
                  value={goals.carbs}
                  onChange={(e) => setGoals(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Proteínas (g)</label>
                <Input
                  type="number"
                  value={goals.protein}
                  onChange={(e) => setGoals(prev => ({ ...prev, protein: Number(e.target.value) }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Gorduras (g)</label>
                <Input
                  type="number"
                  value={goals.fat}
                  onChange={(e) => setGoals(prev => ({ ...prev, fat: Number(e.target.value) }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Macros Summary - Smart Header */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent sticky top-20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resumo do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Calorias</span>
                <span className={`text-sm font-semibold ${getProgressColor(totals.calorias, goals.calories)}`}>
                  {totals.calorias} / {goals.calories} kcal
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(100, (totals.calorias / goals.calories) * 100)}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Carbo</p>
                  <p className={`text-sm font-semibold ${getProgressColor(totals.carboidratos, goals.carbs)}`}>
                    {totals.carboidratos}g
                  </p>
                  <p className="text-[10px] text-muted-foreground">/ {goals.carbs}g</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Prot</p>
                  <p className={`text-sm font-semibold ${getProgressColor(totals.proteinas, goals.protein)}`}>
                    {totals.proteinas}g
                  </p>
                  <p className="text-[10px] text-muted-foreground">/ {goals.protein}g</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Gord</p>
                  <p className={`text-sm font-semibold ${getProgressColor(totals.gorduras, goals.fat)}`}>
                    {totals.gorduras}g
                  </p>
                  <p className="text-[10px] text-muted-foreground">/ {goals.fat}g</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar com IA
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Plano
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right Column - Meal Editor */}
      <div className="lg:col-span-2 space-y-4">
        <Accordion type="multiple" defaultValue={['cafe', 'almoco', 'lanche', 'jantar']} className="space-y-3">
          {meals.map((meal) => {
            const MealIcon = mealIcons[meal.tipo] || Coffee;
            const mealCalories = meal.alimentos.reduce((sum, f) => sum + f.calorias, 0);
            
            return (
              <AccordionItem 
                key={meal.id} 
                value={meal.tipo}
                className="border border-border/50 rounded-xl overflow-hidden bg-card"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MealIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">{meal.nome}</p>
                      <p className="text-xs text-muted-foreground">{meal.horario}</p>
                    </div>
                    <Badge variant="secondary" className="mr-2">
                      {mealCalories} kcal
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {/* Food List */}
                  <div className="space-y-2 mb-4">
                    {meal.alimentos.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum alimento adicionado
                      </p>
                    ) : (
                      meal.alimentos.map((food) => (
                        <div 
                          key={food.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 group"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{food.nome}</p>
                            <p className="text-xs text-muted-foreground">{food.porcao}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right text-xs text-muted-foreground">
                              <span className="text-foreground font-medium">{food.calorias}</span> kcal
                              <br />
                              C:{food.carboidratos} P:{food.proteinas} G:{food.gorduras}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeFood(meal.id, food.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Food */}
                  <div className="border-t border-border/50 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">Adicionar alimento:</p>
                    <div className="flex flex-wrap gap-2">
                      {mockFoods.slice(0, 6).map((food, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => addFood(meal.id, food)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {food.nome}
                        </Button>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
