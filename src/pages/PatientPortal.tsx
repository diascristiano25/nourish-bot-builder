import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  UtensilsCrossed, 
  ShoppingCart,
  Coffee,
  Sun,
  Cookie,
  Moon,
  Leaf,
  LogOut,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealItem {
  food: string;
  portion: string;
  calories?: number;
}

interface Meal {
  name: string;
  time?: string;
  items: MealItem[];
  totalCalories?: number;
}

interface MealPlanData {
  meals: Meal[];
  totalCalories?: number;
  notes?: string;
}

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  total_calories: number | null;
  plan_data: MealPlanData;
  created_at: string;
}

interface GroceryItem {
  name: string;
  quantity: string;
  checked: boolean;
}

interface GroceryCategory {
  category: string;
  emoji: string;
  items: GroceryItem[];
}

const mealIcons: Record<string, React.ReactNode> = {
  'Café da Manhã': <Coffee className="w-5 h-5" />,
  'Lanche da Manhã': <Cookie className="w-5 h-5" />,
  'Almoço': <Sun className="w-5 h-5" />,
  'Lanche da Tarde': <Cookie className="w-5 h-5" />,
  'Jantar': <Moon className="w-5 h-5" />,
  'Ceia': <UtensilsCrossed className="w-5 h-5" />,
};

const mealColors: Record<string, string> = {
  'Café da Manhã': 'bg-warning/10 text-warning',
  'Lanche da Manhã': 'bg-info/10 text-info',
  'Almoço': 'bg-success/10 text-success',
  'Lanche da Tarde': 'bg-info/10 text-info',
  'Jantar': 'bg-primary/10 text-primary',
  'Ceia': 'bg-muted text-muted-foreground',
};

export default function PatientPortal() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patientName, setPatientName] = useState<string>('');
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrocery, setLoadingGrocery] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/patient-auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkUserTypeAndFetchData();
    }
  }, [user]);

  const checkUserTypeAndFetchData = async () => {
    try {
      // Check if user is a patient
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('user_id', user!.id)
        .single();

      if (patientError || !patient) {
        // User is not a patient, redirect to dashboard
        navigate('/dashboard');
        return;
      }

      setPatientName(patient.full_name);

      // Fetch latest meal plan
      const { data: mealPlans, error: mealError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!mealError && mealPlans && mealPlans.length > 0) {
        const plan = mealPlans[0];
        setMealPlan({
          ...plan,
          plan_data: plan.plan_data as unknown as MealPlanData,
        });
      }
    } catch (error: any) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateGroceryList = async () => {
    if (!mealPlan) return;

    setLoadingGrocery(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-grocery-list', {
        body: {
          mealPlan: mealPlan.plan_data,
          days: 7,
        },
      });

      if (error) throw error;

      if (data.groceryList) {
        setGroceryList(data.groceryList);
      }
    } catch (error: any) {
      console.error('Error generating grocery list:', error);
      toast({
        title: "Erro ao gerar lista",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingGrocery(false);
    }
  };

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const newChecked = new Set(checkedItems);
    if (newChecked.has(key)) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setCheckedItems(newChecked);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/patient-auth');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">Olá, {patientName.split(' ')[0]}!</p>
              <p className="text-xs text-muted-foreground">Seu cardápio personalizado</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="pb-20">
        <Tabs defaultValue="dieta" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sticky top-14 z-40 bg-card border-b rounded-none h-12">
            <TabsTrigger value="dieta" className="data-[state=active]:bg-primary/10 rounded-none">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Dieta
            </TabsTrigger>
            <TabsTrigger value="lista" className="data-[state=active]:bg-primary/10 rounded-none">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dieta" className="mt-0 px-4 py-4 space-y-4">
            {!mealPlan ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum cardápio disponível ainda</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Aguarde seu nutricionista criar seu plano alimentar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary */}
                <Card className="border-0 shadow-sm gradient-card">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-bold">{mealPlan.title}</h2>
                        <p className="text-xs text-muted-foreground">
                          Atualizado em {format(new Date(mealPlan.created_at), "d 'de' MMM", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {mealPlan.total_calories || mealPlan.plan_data.totalCalories || '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">kcal/dia</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Meals */}
                {mealPlan.plan_data.meals?.map((meal, index) => (
                  <Card key={index} className="border-0 shadow-sm overflow-hidden">
                    <CardHeader className={`${mealColors[meal.name] || 'bg-muted'} py-3 px-4`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center">
                          {mealIcons[meal.name] || <UtensilsCrossed className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{meal.name}</CardTitle>
                          {meal.time && (
                            <p className="text-xs opacity-70">{meal.time}</p>
                          )}
                        </div>
                        {meal.totalCalories && (
                          <Badge variant="secondary" className="bg-background/50 text-xs">
                            {meal.totalCalories} kcal
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="py-3 px-4">
                      <div className="space-y-2">
                        {meal.items?.map((item, itemIndex) => (
                          <div 
                            key={itemIndex} 
                            className="flex items-center justify-between py-1.5 border-b last:border-0 border-dashed"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.food}</p>
                              <p className="text-xs text-muted-foreground">{item.portion}</p>
                            </div>
                            {item.calories && (
                              <span className="text-xs text-muted-foreground">{item.calories} kcal</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Notes */}
                {mealPlan.plan_data.notes && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{mealPlan.plan_data.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="lista" className="mt-0 px-4 py-4 space-y-4">
            {!mealPlan ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Lista indisponível</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    É necessário ter um cardápio para gerar a lista de compras.
                  </p>
                </CardContent>
              </Card>
            ) : groceryList.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6 text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Lista de compras não gerada</p>
                  <Button onClick={generateGroceryList} disabled={loadingGrocery}>
                    {loadingGrocery ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      'Gerar Lista de Compras'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Progress */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm text-muted-foreground">
                        {checkedItems.size} / {groceryList.reduce((acc, cat) => acc + cat.items.length, 0)} itens
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(checkedItems.size / groceryList.reduce((acc, cat) => acc + cat.items.length, 0)) * 100}%` 
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                {groceryList.map((category, catIndex) => (
                  <Card key={catIndex} className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span>{category.emoji}</span>
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {category.items.map((item, itemIndex) => {
                        const key = `${catIndex}-${itemIndex}`;
                        const isChecked = checkedItems.has(key);
                        return (
                          <button
                            key={itemIndex}
                            onClick={() => toggleItem(catIndex, itemIndex)}
                            className={`w-full flex items-center gap-3 py-2 px-2 rounded-lg transition-colors ${
                              isChecked ? 'bg-success/10' : 'hover:bg-muted/50'
                            }`}
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className={`flex-1 text-left text-sm ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                              {item.name}
                            </span>
                            <span className={`text-xs ${isChecked ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                              {item.quantity}
                            </span>
                          </button>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={generateGroceryList}
                  disabled={loadingGrocery}
                >
                  {loadingGrocery ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Regenerando...
                    </>
                  ) : (
                    'Regenerar Lista'
                  )}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
