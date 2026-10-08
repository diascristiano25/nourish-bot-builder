import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
import { AppLayout } from '@/components/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';

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
  const { mealPlanId } = useParams<{ mealPlanId: string }>();
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
    if (user && mealPlanId) {
      fetchDataAndGenerate();
    }
  }, [user, mealPlanId]);

  const fetchDataAndGenerate = async () => {
    try {
      setLoading(true);

      const { data: planDataResult, error: planError } = await supabase
        .from('meal_plans')
        .select('meals, title, client_id')
        .eq('id', mealPlanId)
        .single();

      if (planError) throw planError;

      setPlanTitle(planDataResult.title);

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('full_name')
        .eq('id', planDataResult.client_id)
        .single();

      if (patientError) throw patientError;
      setPatientName(patientData.full_name);

      await generateGroceryList(planDataResult.meals as unknown as MealPlanData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
      navigate(`/cardapio/${mealPlanId}`);
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
      setCheckedItems(new Set());
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
        .select('meals')
        .eq('id', mealPlanId)
        .single();

      if (error) throw error;
      await generateGroceryList(planDataResult.meals as unknown as MealPlanData);
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
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {generating ? 'Gerando lista de compras com IA...' : 'Carregando...'}
          </p>
        </div>
      </AppLayout>
    );
  }

  const totalItems = groceryData?.totalItems || 0;
  const completedCount = checkedItems.size;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background print:bg-white">
        {/* Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-border/30 print:hidden">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(`/cardapio/${mealPlanId}`)} className="glass hover:bg-primary/10 rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-lg flex items-center gap-2">
                    Lista de <NeonText variant="lime">Compras</NeonText>
                  </h1>
                  <p className="text-xs text-muted-foreground">{patientName} • {days} dias</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRegenerate} disabled={generating} className="glass hover:bg-primary/10 rounded-xl">
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </header>

        {/* Print Header */}
        <div className="hidden print:block p-6 border-b">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🛒 Lista de Compras ({days} dias)
          </h1>
          <p className="text-muted-foreground">{planTitle} - {patientName}</p>
        </div>

        <main className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 print:max-w-none">
          {/* AI Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Lista gerada com inteligência artificial</span>
          </div>

          {/* Progress */}
          <GlassCard className="p-5 print:shadow-none print:border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <span className="font-semibold font-mono text-foreground">{completedCount}/{totalItems} itens</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${totalItems > 0 ? (completedCount / totalItems) * 100 : 0}%` }}
              />
            </div>
          </GlassCard>

          {/* Grouped Items */}
          {groceryData?.categories.map((category) => (
            <GlassCard key={category.name} className="overflow-hidden print:shadow-none print:border print:break-inside-avoid">
              <div className="py-3 px-5 border-b border-border/30">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <span className="text-2xl">{category.emoji}</span>
                  {category.name}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({category.items.length})
                  </span>
                </h3>
              </div>
              <div className="p-3 space-y-1">
                {category.items.map((item) => {
                  const isChecked = isItemChecked(category.name, item.name);
                  return (
                    <div 
                      key={item.name}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-primary/5 ${
                        isChecked ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => toggleItem(category.name, item.name)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(category.name, item.name)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          ))}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 print:hidden">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 gap-2"
                onClick={handleCopyForWhatsApp}
              >
                <MessageCircle className="w-4 h-4" />
                Copiar p/ WhatsApp
              </Button>
              <Button 
                variant="secondary"
                className="w-full gap-2"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
                Imprimir Lista
              </Button>
            </div>
            <Button 
              variant="outline"
              className="w-full border-border/50 gap-2"
              onClick={handleCopyToClipboard}
            >
              <Copy className="w-4 h-4" />
              Copiar Texto
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate(`/cardapio/${mealPlanId}`)}
            >
              Voltar ao Cardápio
            </Button>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
