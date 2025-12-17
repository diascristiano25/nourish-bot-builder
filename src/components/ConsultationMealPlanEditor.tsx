import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Target,
  Search,
  Star,
  Brain,
  FileDown,
  Printer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FoodItem {
  id: string;
  nome: string;
  porcao: string;
  calorias: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
  isCustom?: boolean;
}

interface Meal {
  id: string;
  tipo: string;
  nome: string;
  horario: string;
  alimentos: FoodItem[];
}

interface NutritionistProfile {
  full_name: string;
  crn: string | null;
  phone: string | null;
  logo_url: string | null;
  primary_color: string | null;
}

interface ConsultationMealPlanEditorProps {
  patientId?: string;
  patientName?: string;
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

// Mock TACO foods (Brazilian Table of Food Composition)
const tacoFoods: Omit<FoodItem, 'id'>[] = [
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

export function ConsultationMealPlanEditor({ patientId, patientName = 'Paciente', onSave }: ConsultationMealPlanEditorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const [meals, setMeals] = useState<Meal[]>(
    mealTemplates.map(t => ({ ...t, id: generateId(), alimentos: [] }))
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfNotes, setPdfNotes] = useState('');
  const [nutritionist, setNutritionist] = useState<NutritionistProfile | null>(null);
  const [goals, setGoals] = useState({
    calories: 2000,
    carbs: 250,
    protein: 150,
    fat: 65
  });
  
  // Food selection modal state
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [foodSearchTerm, setFoodSearchTerm] = useState('');
  const [customFoods, setCustomFoods] = useState<Omit<FoodItem, 'id'>[]>([]);
  const [customRecipes, setCustomRecipes] = useState<Omit<FoodItem, 'id'>[]>([]);

  // Fetch custom foods, recipes, and nutritionist profile
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const { data: nutri } = await supabase
          .from('nutritionists')
          .select('id, full_name, crn, phone, logo_url, primary_color')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!nutri) return;
        
        setNutritionist({
          full_name: nutri.full_name,
          crn: nutri.crn,
          phone: nutri.phone,
          logo_url: nutri.logo_url,
          primary_color: nutri.primary_color
        });
        
        const [foodsResult, recipesResult] = await Promise.all([
          supabase
            .from('custom_foods')
            .select('*')
            .eq('nutritionist_id', nutri.id),
          supabase
            .from('custom_recipes')
            .select('*')
            .eq('nutritionist_id', nutri.id)
        ]);
        
        if (foodsResult.data) {
          setCustomFoods(foodsResult.data.map(f => ({
            nome: f.name,
            porcao: `1 ${f.unit_type}`,
            calorias: Number(f.kcal),
            carboidratos: Number(f.carb),
            proteinas: Number(f.protein),
            gorduras: Number(f.fat),
            isCustom: true
          })));
        }
        
        if (recipesResult.data) {
          setCustomRecipes(recipesResult.data.map(r => {
            const macros = r.estimated_macros as { kcal: number; protein: number; carb: number; fat: number };
            return {
              nome: r.name,
              porcao: '1 porção',
              calorias: macros.kcal,
              carboidratos: macros.carb,
              proteinas: macros.protein,
              gorduras: macros.fat,
              isCustom: true
            };
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [user]);

  // PDF Export function
  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    
    setIsExporting(true);
    
    try {
      // Make the hidden div visible for capture
      pdfRef.current.style.display = 'block';
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Hide it again
      pdfRef.current.style.display = 'none';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // If content is taller than one page, add more pages
      const totalPages = Math.ceil((imgHeight * ratio) / pdfHeight);
      if (totalPages > 1) {
        for (let i = 1; i < totalPages; i++) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', imgX, -(pdfHeight * i), imgWidth * ratio, imgHeight * ratio);
        }
      }
      
      pdf.save(`plano-alimentar-${patientName.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
      
      toast({
        title: '✅ PDF exportado com sucesso!',
        description: 'O arquivo foi baixado para o seu dispositivo.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Erro ao exportar PDF',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // All foods combined
  const allFoods = useMemo(() => [...customFoods, ...customRecipes, ...tacoFoods], [customFoods, customRecipes]);
  
  const filteredFoods = useMemo(() => 
    allFoods.filter(f => f.nome.toLowerCase().includes(foodSearchTerm.toLowerCase())),
    [allFoods, foodSearchTerm]
  );

  const openFoodModal = useCallback((mealId: string) => {
    setSelectedMealId(mealId);
    setFoodSearchTerm('');
    setFoodModalOpen(true);
  }, []);

  const handleSelectFood = useCallback((food: Omit<FoodItem, 'id'>) => {
    if (selectedMealId) {
      addFood(selectedMealId, food);
    }
    setFoodModalOpen(false);
  }, [selectedMealId]);

  // Calculate totals with useMemo for performance
  const totals = useMemo(() => {
    return meals.reduce((acc, meal) => {
      meal.alimentos.forEach(food => {
        acc.calorias += food.calorias;
        acc.carboidratos += food.carboidratos;
        acc.proteinas += food.proteinas;
        acc.gorduras += food.gorduras;
      });
      return acc;
    }, { calorias: 0, carboidratos: 0, proteinas: 0, gorduras: 0 });
  }, [meals]);

  const addFood = useCallback((mealId: string, food: Omit<FoodItem, 'id'>) => {
    setMeals(prev => prev.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          alimentos: [...meal.alimentos, { ...food, id: generateId() }]
        };
      }
      return meal;
    }));
  }, []);

  const removeFood = useCallback((mealId: string, foodId: string) => {
    setMeals(prev => prev.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          alimentos: meal.alimentos.filter(f => f.id !== foodId)
        };
      }
      return meal;
    }));
  }, []);

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    
    // Elegant loading messages
    const messages = [
      'Analisando perfil do paciente...',
      'Calculando necessidades calóricas...',
      'Selecionando alimentos ideais...',
      'Balanceando macronutrientes...',
      'Montando plano alimentar...',
      'Finalizando dieta personalizada...'
    ];
    
    let messageIndex = 0;
    setGeneratingMessage(messages[0]);
    
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setGeneratingMessage(messages[messageIndex]);
    }, 600);
    
    // Simulate AI generation (3-4 seconds)
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    clearInterval(messageInterval);
    
    // Fill with example diet targeting ~2000 kcal
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
          { id: generateId(), nome: 'Batata doce', porcao: '150g', calorias: 129, carboidratos: 30, proteinas: 3, gorduras: 0 },
          { id: generateId(), nome: 'Salada verde', porcao: '1 prato', calorias: 25, carboidratos: 5, proteinas: 2, gorduras: 0 },
          { id: generateId(), nome: 'Azeite de oliva', porcao: '1 colher (10ml)', calorias: 90, carboidratos: 0, proteinas: 0, gorduras: 10 },
        ]
      },
    ];
    
    setMeals(exampleDiet);
    setIsGenerating(false);
    setGeneratingMessage('');
    
    toast({
      title: "✨ Dieta gerada com sucesso!",
      description: "Plano de ~1.636 kcal pronto para revisão.",
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

        {/* PDF Notes */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notas para o PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={pdfNotes}
              onChange={(e) => setPdfNotes(e.target.value)}
              placeholder="Recomendações, observações para o paciente..."
              className="min-h-[80px] text-sm"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            className="w-full gap-2 relative overflow-hidden"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="animate-pulse">Gerando...</span>
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
            disabled={isSaving || isGenerating}
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
          <Button 
            variant="secondary" 
            onClick={handleExportPDF}
            disabled={isExporting || meals.every(m => m.alimentos.length === 0)}
            className="w-full gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Gerar e Exportar PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right Column - Meal Editor */}
      <div className="lg:col-span-2 space-y-4 relative">
        {/* AI Generating Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
            <div className="text-center space-y-4 p-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Gerando plano inteligente</p>
                <p className="text-sm text-primary animate-pulse min-h-[20px]">
                  {generatingMessage}
                </p>
              </div>
              <div className="flex justify-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => openFoodModal(meal.id)}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Alimento
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Food Selection Modal */}
      <Dialog open={foodModalOpen} onOpenChange={setFoodModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Selecionar Alimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alimento..."
                value={foodSearchTerm}
                onChange={(e) => setFoodSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
                <TabsTrigger value="custom" className="flex-1">Meus Alimentos</TabsTrigger>
                <TabsTrigger value="taco" className="flex-1">Tabela TACO</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  {filteredFoods.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhum alimento encontrado</p>
                  ) : (
                    filteredFoods.map((food, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectFood(food)}
                        className="w-full p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          {food.isCustom && (
                            <Star className="w-4 h-4 text-primary" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{food.nome}</p>
                            <p className="text-xs text-muted-foreground">{food.porcao}</p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{food.calorias}</span> kcal
                          <br />
                          C:{food.carboidratos} P:{food.proteinas} G:{food.gorduras}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="mt-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  {[...customFoods, ...customRecipes].filter(f => 
                    f.nome.toLowerCase().includes(foodSearchTerm.toLowerCase())
                  ).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum alimento personalizado</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cadastre na página "Biblioteca"
                      </p>
                    </div>
                  ) : (
                    [...customFoods, ...customRecipes].filter(f => 
                      f.nome.toLowerCase().includes(foodSearchTerm.toLowerCase())
                    ).map((food, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectFood(food)}
                        className="w-full p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Star className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{food.nome}</p>
                            <p className="text-xs text-muted-foreground">{food.porcao}</p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{food.calorias}</span> kcal
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="taco" className="mt-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  {tacoFoods.filter(f => 
                    f.nome.toLowerCase().includes(foodSearchTerm.toLowerCase())
                  ).map((food, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectFood(food)}
                      className="w-full p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">{food.nome}</p>
                        <p className="text-xs text-muted-foreground">{food.porcao}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{food.calorias}</span> kcal
                        <br />
                        C:{food.carboidratos} P:{food.proteinas} G:{food.gorduras}
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden PDF Document for Export */}
      <div 
        ref={pdfRef}
        style={{ display: 'none', position: 'absolute', left: '-9999px' }}
        className="bg-white text-black p-8 w-[800px]"
      >
        {/* PDF Header */}
        <div 
          className="p-6 rounded-lg mb-6 text-white"
          style={{ 
            background: `linear-gradient(135deg, ${nutritionist?.primary_color || '#4a7c59'}, ${nutritionist?.primary_color || '#2d5a3d'}dd)` 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{nutritionist?.full_name || 'Nutricionista'}</h1>
              {nutritionist?.crn && (
                <p className="text-sm opacity-90">{nutritionist.crn}</p>
              )}
              {nutritionist?.phone && (
                <p className="text-sm opacity-90">{nutritionist.phone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Data de emissão:</p>
              <p className="font-semibold">
                {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mb-6 pb-4 border-b-2" style={{ borderColor: nutritionist?.primary_color || '#4a7c59' }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: nutritionist?.primary_color || '#4a7c59' }}>
            Plano Alimentar Personalizado
          </h2>
          <p className="text-gray-600">
            <strong>Paciente:</strong> {patientName}
          </p>
        </div>

        {/* Nutritional Summary */}
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `${nutritionist?.primary_color || '#4a7c59'}15` }}>
          <h3 className="font-bold mb-3" style={{ color: nutritionist?.primary_color || '#4a7c59' }}>
            Resumo Nutricional Diário
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: nutritionist?.primary_color || '#4a7c59' }}>
                {totals.calorias}
              </p>
              <p className="text-sm text-gray-600">kcal</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{totals.proteinas}g</p>
              <p className="text-sm text-gray-600">Proteínas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{totals.carboidratos}g</p>
              <p className="text-sm text-gray-600">Carboidratos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totals.gorduras}g</p>
              <p className="text-sm text-gray-600">Gorduras</p>
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-4">
          {meals.map((meal) => (
            <div key={meal.id} className="border rounded-lg overflow-hidden">
              <div 
                className="p-3 text-white font-bold flex justify-between items-center"
                style={{ backgroundColor: nutritionist?.primary_color || '#4a7c59' }}
              >
                <span>{meal.nome} - {meal.horario}</span>
                <span className="text-sm font-normal opacity-90">
                  {meal.alimentos.reduce((sum, f) => sum + f.calorias, 0)} kcal
                </span>
              </div>
              {meal.alimentos.length > 0 && (
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-2 text-sm font-semibold">Alimento</th>
                      <th className="text-left p-2 text-sm font-semibold">Porção</th>
                      <th className="text-center p-2 text-sm font-semibold">Kcal</th>
                      <th className="text-center p-2 text-sm font-semibold">P</th>
                      <th className="text-center p-2 text-sm font-semibold">C</th>
                      <th className="text-center p-2 text-sm font-semibold">G</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.alimentos.map((food) => (
                      <tr key={food.id} className="border-t">
                        <td className="p-2">{food.nome}</td>
                        <td className="p-2 text-gray-600">{food.porcao}</td>
                        <td className="p-2 text-center">{food.calorias}</td>
                        <td className="p-2 text-center">{food.proteinas}g</td>
                        <td className="p-2 text-center">{food.carboidratos}g</td>
                        <td className="p-2 text-center">{food.gorduras}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        {pdfNotes && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2" style={{ color: nutritionist?.primary_color || '#4a7c59' }}>
              Observações e Recomendações
            </h3>
            <p className="text-gray-700 text-sm whitespace-pre-line">{pdfNotes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
          <p>Plano alimentar gerado por NutriFlow</p>
          <p className="mt-1">
            Este documento é de uso pessoal e não substitui orientação profissional presencial.
          </p>
        </div>
      </div>
    </div>
  );
}
