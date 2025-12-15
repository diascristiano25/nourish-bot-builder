import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Printer,
  Copy,
  ShoppingCart,
  MessageCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface GroceryItem {
  name: string;
  quantity: string;
}

interface GroceryCategory {
  name: string;
  emoji: string;
  items: GroceryItem[];
}

interface GroceryListData {
  categories: GroceryCategory[];
  totalItems: number;
}

interface MealPlanData {
  meals: Array<{
    name: string;
    time?: string;
    items: Array<{
      food: string;
      portion: string;
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
    }>;
    totalCalories?: number;
  }>;
  totalCalories?: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  notes?: string;
}

export default function GroceryList() {
  const { id, planId } = useParams<{ id: string; planId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [groceryData, setGroceryData] = useState<GroceryListData | null>(null);
  const [patientName, setPatientName] = useState<string>('');
  const [planTitle, setPlanTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && planId) {
      fetchDataAndGenerate();
    }
  }, [user, planId]);

  const fetchDataAndGenerate = async () => {
    try {
      setLoading(true);
      
      // Fetch meal plan data
      const { data: planDataResult, error: planError } = await supabase
        .from('meal_plans')
        .select('plan_data, title, patient_id')
        .eq('id', planId)
        .single();

      if (planError) throw planError;
      
      setPlanTitle(planDataResult.title);

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('full_name')
        .eq('id', planDataResult.patient_id)
        .single();

      if (patientError) throw patientError;
      setPatientName(patientData.full_name);

      // Generate grocery list with AI
      await generateGroceryList(planDataResult.plan_data as unknown as MealPlanData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
      navigate(`/patients/${id}/meal-plan/${planId}`);
    } finally {
      setLoading(false);
    }
  };

  const generateGroceryList = async (mealPlan: MealPlanData) => {
    try {
      setGenerating(true);

      const { data, error } = await supabase.functions.invoke('generate-grocery-list', {
        body: { mealPlan, days }
      });

      if (error) throw error;

      setGroceryData(data.groceryList);
      setCheckedItems(new Set()); // Reset checked items
    } catch (error: any) {
      console.error('Error generating grocery list:', error);
      toast({
        title: "Erro ao gerar lista",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      const { data: planDataResult, error } = await supabase
        .from('meal_plans')
        .select('plan_data')
        .eq('id', planId)
        .single();

      if (error) throw error;
      await generateGroceryList(planDataResult.plan_data as unknown as MealPlanData);
    } catch (error: any) {
      toast({
        title: "Erro ao regenerar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleItem = (categoryName: string, itemName: string) => {
    const key = `${categoryName}:${itemName}`;
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const isItemChecked = (categoryName: string, itemName: string) => {
    return checkedItems.has(`${categoryName}:${itemName}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToClipboard = async () => {
    if (!groceryData) return;

    const listText = groceryData.categories
      .map(category => {
        const itemsText = category.items
          .map(item => {
            const checked = isItemChecked(category.name, item.name);
            return `${checked ? '✓' : '☐'} ${item.name}: ${item.quantity}`;
          })
          .join('\n');
        return `${category.emoji} ${category.name.toUpperCase()}\n${itemsText}`;
      })
      .join('\n\n');

    const fullText = `🛒 LISTA DE COMPRAS (${days} dias)\n${planTitle} - ${patientName}\n\n${listText}\n\n📱 Gerado por NutriFlow`;

    try {
      await navigator.clipboard.writeText(fullText);
      toast({
        title: "Copiado!",
        description: "Lista copiada para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a lista.",
        variant: "destructive",
      });
    }
  };

  const handleCopyForWhatsApp = async () => {
    if (!groceryData) return;

    const listText = groceryData.categories
      .map(category => {
        const itemsText = category.items
          .map(item => `• ${item.name}: ${item.quantity}`)
          .join('\n');
        return `*${category.emoji} ${category.name.toUpperCase()}*\n${itemsText}`;
      })
      .join('\n\n');

    const fullText = `🛒 *LISTA DE COMPRAS* (${days} dias)\n_${planTitle}_\n_Paciente: ${patientName}_\n\n${listText}\n\n_📱 Gerado por NutriFlow_`;

    try {
      await navigator.clipboard.writeText(fullText);
      toast({
        title: "Copiado para WhatsApp!",
        description: "Cole no WhatsApp para enviar formatado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a lista.",
        variant: "destructive",
      });
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {generating ? 'Gerando lista de compras com IA...' : 'Carregando...'}
        </p>
      </div>
    );
  }

  const totalItems = groceryData?.totalItems || 0;
  const completedCount = checkedItems.size;

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b print:hidden">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}/meal-plan/${planId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Lista de Compras
              </h1>
              <p className="text-xs text-muted-foreground">{patientName} • {days} dias</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRegenerate} disabled={generating}>
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block p-6 border-b">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🛒 Lista de Compras ({days} dias)
        </h1>
        <p className="text-muted-foreground">{planTitle} - {patientName}</p>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6 print:max-w-none">
        {/* AI Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Lista gerada com inteligência artificial</span>
        </div>

        {/* Progress */}
        <Card className="border-0 shadow-md print:shadow-none print:border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <span className="font-semibold">{completedCount}/{totalItems} itens</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${totalItems > 0 ? (completedCount / totalItems) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Grouped Items */}
        {groceryData?.categories.map((category) => (
          <Card key={category.name} className="border-0 shadow-md print:shadow-none print:border print:break-inside-avoid">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">{category.emoji}</span>
                {category.name}
                <span className="text-sm font-normal text-muted-foreground">
                  ({category.items.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.items.map((item) => {
                  const isChecked = isItemChecked(category.name, item.name);
                  return (
                    <div 
                      key={item.name}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
                        isChecked ? 'bg-muted/30' : ''
                      }`}
                      onClick={() => toggleItem(category.name, item.name)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(category.name, item.name)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 print:hidden">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="default"
              className="w-full"
              onClick={handleCopyForWhatsApp}
            >
              <MessageCircle className="mr-2 w-4 h-4" />
              Copiar p/ WhatsApp
            </Button>
            <Button 
              variant="secondary"
              className="w-full"
              onClick={handlePrint}
            >
              <Printer className="mr-2 w-4 h-4" />
              Imprimir Lista
            </Button>
          </div>
          <Button 
            variant="outline"
            className="w-full"
            onClick={handleCopyToClipboard}
          >
            <Copy className="mr-2 w-4 h-4" />
            Copiar Texto
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => navigate(`/patients/${id}/meal-plan/${planId}`)}
          >
            Voltar ao Cardápio
          </Button>
        </div>
      </main>
    </div>
  );
}
