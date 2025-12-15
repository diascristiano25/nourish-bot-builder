import { useEffect, useState, useMemo } from 'react';
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
  Apple,
  Beef,
  Wheat,
  Milk,
  Fish,
  Carrot,
  Package
} from 'lucide-react';

interface MealItem {
  food: string;
  portion: string;
}

interface Meal {
  name: string;
  items: MealItem[];
}

interface MealPlanData {
  meals: Meal[];
}

interface GroceryItem {
  name: string;
  portions: string[];
  category: string;
  checked: boolean;
}

// Categorias de alimentos (simplificadas)
const FOOD_CATEGORIES: Record<string, string[]> = {
  'Hortifrúti': ['banana', 'maçã', 'laranja', 'limão', 'abacate', 'morango', 'uva', 'manga', 'mamão', 'melão', 'melancia', 'abacaxi', 'tomate', 'alface', 'rúcula', 'espinafre', 'couve', 'brócolis', 'cenoura', 'beterraba', 'batata', 'batata doce', 'mandioca', 'cebola', 'alho', 'pepino', 'abobrinha', 'berinjela', 'pimentão', 'vagem', 'quiabo', 'chuchu', 'repolho', 'couve-flor', 'agrião', 'salsinha', 'cebolinha', 'hortelã', 'manjericão', 'frutas', 'legumes', 'verduras', 'salada'],
  'Carnes e Proteínas': ['frango', 'carne', 'bovina', 'patinho', 'alcatra', 'filé', 'peito de frango', 'coxa', 'sobrecoxa', 'peixe', 'salmão', 'tilápia', 'atum', 'sardinha', 'camarão', 'ovo', 'ovos', 'clara', 'carne moída', 'músculo', 'acém', 'porco', 'linguiça', 'bacon', 'presunto', 'peru', 'chester'],
  'Laticínios': ['leite', 'queijo', 'iogurte', 'requeijão', 'cream cheese', 'manteiga', 'nata', 'creme de leite', 'ricota', 'cottage', 'mussarela', 'parmesão', 'coalho', 'whey', 'leite fermentado'],
  'Padaria e Cereais': ['pão', 'torrada', 'biscoito', 'bolacha', 'bolo', 'tapioca', 'cuscuz', 'aveia', 'granola', 'cereal', 'arroz', 'macarrão', 'massa', 'farinha', 'fubá', 'milho', 'pipoca', 'quinoa', 'chia', 'linhaça', 'integral'],
  'Grãos e Leguminosas': ['feijão', 'lentilha', 'grão de bico', 'ervilha', 'soja', 'amendoim', 'castanha', 'nozes', 'amêndoas', 'avelã', 'grão'],
  'Bebidas': ['água', 'café', 'chá', 'suco', 'água de coco', 'leite vegetal', 'bebida'],
  'Outros': []
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Hortifrúti': <Apple className="w-5 h-5" />,
  'Carnes e Proteínas': <Beef className="w-5 h-5" />,
  'Laticínios': <Milk className="w-5 h-5" />,
  'Padaria e Cereais': <Wheat className="w-5 h-5" />,
  'Grãos e Leguminosas': <Carrot className="w-5 h-5" />,
  'Bebidas': <Fish className="w-5 h-5" />,
  'Outros': <Package className="w-5 h-5" />,
};

function categorizeFood(foodName: string): string {
  const lowerFood = foodName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(FOOD_CATEGORIES)) {
    if (category === 'Outros') continue;
    for (const keyword of keywords) {
      if (lowerFood.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'Outros';
}

function aggregateGroceries(planData: MealPlanData): GroceryItem[] {
  const groceryMap = new Map<string, { portions: string[]; category: string }>();
  
  planData.meals?.forEach(meal => {
    meal.items?.forEach(item => {
      const normalizedName = item.food.trim();
      const key = normalizedName.toLowerCase();
      
      if (groceryMap.has(key)) {
        const existing = groceryMap.get(key)!;
        existing.portions.push(item.portion);
      } else {
        groceryMap.set(key, {
          portions: [item.portion],
          category: categorizeFood(normalizedName)
        });
      }
    });
  });
  
  const items: GroceryItem[] = [];
  groceryMap.forEach((value, key) => {
    // Capitalizar primeira letra
    const capitalizedName = key.charAt(0).toUpperCase() + key.slice(1);
    items.push({
      name: capitalizedName,
      portions: value.portions,
      category: value.category,
      checked: false
    });
  });
  
  // Ordenar por categoria e depois alfabeticamente
  return items.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
}

export default function GroceryList() {
  const { id, planId } = useParams<{ id: string; planId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [planData, setPlanData] = useState<MealPlanData | null>(null);
  const [patientName, setPatientName] = useState<string>('');
  const [planTitle, setPlanTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && planId) {
      fetchData();
    }
  }, [user, planId]);

  const fetchData = async () => {
    try {
      const { data: planDataResult, error: planError } = await supabase
        .from('meal_plans')
        .select('plan_data, title, patient_id')
        .eq('id', planId)
        .single();

      if (planError) throw planError;
      
      setPlanData(planDataResult.plan_data as unknown as MealPlanData);
      setPlanTitle(planDataResult.title);

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('full_name')
        .eq('id', planDataResult.patient_id)
        .single();

      if (patientError) throw patientError;
      setPatientName(patientData.full_name);
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

  const groceryItems = useMemo(() => {
    if (!planData) return [];
    return aggregateGroceries(planData);
  }, [planData]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, GroceryItem[]> = {};
    groceryItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [groceryItems]);

  const toggleItem = (itemName: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const formatPortions = (portions: string[]): string => {
    if (portions.length === 1) return portions[0];
    
    // Tentar agregar porções simples
    const portionCounts = new Map<string, number>();
    portions.forEach(p => {
      portionCounts.set(p, (portionCounts.get(p) || 0) + 1);
    });
    
    if (portionCounts.size === 1) {
      const [portion, count] = [...portionCounts.entries()][0];
      return count > 1 ? `${count}x ${portion}` : portion;
    }
    
    return portions.join(' + ');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    const listText = Object.entries(groupedItems)
      .map(([category, items]) => {
        const itemsText = items
          .map(item => `${checkedItems.has(item.name) ? '✓' : '☐'} ${item.name}: ${formatPortions(item.portions)}`)
          .join('\n');
        return `== ${category} ==\n${itemsText}`;
      })
      .join('\n\n');

    const fullText = `LISTA DE COMPRAS\n${planTitle} - ${patientName}\n\n${listText}`;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedCount = checkedItems.size;
  const totalCount = groceryItems.length;

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
              <p className="text-xs text-muted-foreground">{patientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block p-6 border-b">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          Lista de Compras
        </h1>
        <p className="text-muted-foreground">{planTitle} - {patientName}</p>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6 print:max-w-none">
        {/* Progress */}
        <Card className="border-0 shadow-md print:shadow-none print:border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <span className="font-semibold">{completedCount}/{totalCount} itens</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Grouped Items */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category} className="border-0 shadow-md print:shadow-none print:border print:break-inside-avoid">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {CATEGORY_ICONS[category]}
                {category}
                <span className="text-sm font-normal text-muted-foreground">
                  ({items.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div 
                    key={item.name}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
                      checkedItems.has(item.name) ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => toggleItem(item.name)}
                  >
                    <Checkbox
                      checked={checkedItems.has(item.name)}
                      onCheckedChange={() => toggleItem(item.name)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${checkedItems.has(item.name) ? 'line-through text-muted-foreground' : ''}`}>
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatPortions(item.portions)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Back Button */}
        <div className="pt-4 print:hidden">
          <Button 
            variant="outline" 
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
