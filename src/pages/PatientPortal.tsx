import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PatientProgressTab } from '@/components/monitoring';
import { 
  Loader2, 
  UtensilsCrossed, 
  ShoppingCart,
  Coffee,
  Sun,
  Cookie,
  Moon,
  LogOut,
  CheckCircle2,
  Circle,
  TrendingUp
} from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';

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
  'Café da Manhã': 'from-amber-500/20 to-amber-500/5 text-amber-400',
  'Lanche da Manhã': 'from-orange-500/20 to-orange-500/5 text-orange-400',
  'Almoço': 'from-primary/20 to-primary/5 text-primary',
  'Lanche da Tarde': 'from-blue-500/20 to-blue-500/5 text-blue-400',
  'Jantar': 'from-secondary/20 to-secondary/5 text-secondary',
  'Ceia': 'from-muted/50 to-muted/20 text-muted-foreground',
};

export default function PatientPortal() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patientId, setPatientId] = useState<string | null>(null);
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
      // First try to find patient by user_id
      let { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('user_id', user!.id)
        .maybeSingle();

      // If not found by user_id, try by email
      if (!patient && user?.email) {
        const { data: patientByEmail, error: emailError } = await supabase
          .from('patients')
          .select('id, full_name')
          .eq('email', user.email)
          .maybeSingle();

        if (patientByEmail) {
          patient = patientByEmail;
          // Link the patient to this user account
          await supabase
            .from('patients')
            .update({ user_id: user.id })
            .eq('id', patientByEmail.id);
        }
      }

      if (!patient) {
        // Not a patient, check if nutritionist
        const { data: nutritionist } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user!.id)
          .maybeSingle();

        if (nutritionist) {
          navigate('/dashboard');
        } else {
          navigate('/patient-auth');
        }
        return;
      }

      setPatientId(patient.id);
      setPatientName(patient.full_name);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/30">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="w-8 h-8 object-contain" />
            <div>
              <p className="font-semibold text-sm text-foreground">
                Olá, <NeonText variant="lime">{patientName.split(' ')[0]}</NeonText>!
              </p>
              <p className="text-xs text-muted-foreground">Seu cardápio personalizado</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="pb-20">
        <Tabs defaultValue="dieta" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sticky top-14 z-40 glass-strong border-b border-border/30 rounded-none h-12">
            <TabsTrigger value="dieta" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              Dieta
            </TabsTrigger>
            <TabsTrigger value="progresso" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none gap-2">
              <TrendingUp className="w-4 h-4" />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="lista" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none gap-2">
              <ShoppingCart className="w-4 h-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dieta" className="mt-0 px-4 py-4 space-y-4">
            {!mealPlan ? (
              <GlassCard className="p-8 text-center border-dashed border-border/50">
                <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum cardápio disponível ainda</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Aguarde seu nutricionista criar seu plano alimentar.
                </p>
              </GlassCard>
            ) : (
              <>
                {/* Summary */}
                <GlassCard glow="lime" className="p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-foreground">{mealPlan.title}</h2>
                      <p className="text-xs text-muted-foreground">
                        Atualizado em {format(new Date(mealPlan.created_at), "d 'de' MMM", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono text-primary">
                        {mealPlan.total_calories || mealPlan.plan_data.totalCalories || '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">kcal/dia</p>
                    </div>
                  </div>
                </GlassCard>

                {/* Meals */}
                {mealPlan.plan_data.meals?.map((meal, index) => (
                  <GlassCard key={index} className="overflow-hidden">
                    <div className={`py-3 px-4 bg-gradient-to-r ${mealColors[meal.name] || 'from-muted/50 to-muted/20'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center">
                          {mealIcons[meal.name] || <UtensilsCrossed className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{meal.name}</h3>
                          {meal.time && (
                            <p className="text-xs text-muted-foreground">{meal.time}</p>
                          )}
                        </div>
                        {meal.totalCalories && (
                          <Badge className="bg-background/50 text-foreground border-0 text-xs font-mono">
                            {meal.totalCalories} kcal
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="py-3 px-4 space-y-2">
                      {meal.items?.map((item, itemIndex) => (
                        <div 
                          key={itemIndex} 
                          className="flex items-center justify-between py-1.5 border-b last:border-0 border-dashed border-border/30"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">{item.food}</p>
                            <p className="text-xs text-muted-foreground">{item.portion}</p>
                          </div>
                          {item.calories && (
                            <span className="text-xs text-muted-foreground font-mono">{item.calories} kcal</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                ))}

                {/* Notes */}
                {mealPlan.plan_data.notes && (
                  <GlassCard className="p-4">
                    <h3 className="font-semibold text-sm text-foreground mb-2">Observações</h3>
                    <p className="text-sm text-muted-foreground">{mealPlan.plan_data.notes}</p>
                  </GlassCard>
                )}
              </>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progresso" className="mt-0 px-4 py-4">
            {patientId && <PatientProgressTab patientId={patientId} />}
          </TabsContent>

          <TabsContent value="lista" className="mt-0 px-4 py-4 space-y-4">
            {!mealPlan ? (
              <GlassCard className="p-8 text-center border-dashed border-border/50">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Lista indisponível</p>
                <p className="text-sm text-muted-foreground mt-2">
                  É necessário ter um cardápio para gerar a lista de compras.
                </p>
              </GlassCard>
            ) : groceryList.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Lista de compras não gerada</p>
                <Button onClick={generateGroceryList} disabled={loadingGrocery} className="bg-primary hover:bg-primary/90">
                  {loadingGrocery ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    'Gerar Lista de Compras'
                  )}
                </Button>
              </GlassCard>
            ) : (
              <>
                {/* Progress */}
                <GlassCard className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Progresso</span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {checkedItems.size} / {groceryList.reduce((acc, cat) => acc + cat.items.length, 0)} itens
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-2 transition-all"
                      style={{ 
                        width: `${(checkedItems.size / groceryList.reduce((acc, cat) => acc + cat.items.length, 0)) * 100}%` 
                      }}
                    />
                  </div>
                </GlassCard>

                {/* Categories */}
                {groceryList.map((category, catIndex) => (
                  <GlassCard key={catIndex} className="overflow-hidden">
                    <div className="py-3 px-4 border-b border-border/30">
                      <h3 className="font-semibold flex items-center gap-2 text-foreground">
                        <span>{category.emoji}</span>
                        {category.category}
                      </h3>
                    </div>
                    <div className="p-2 space-y-1">
                      {category.items.map((item, itemIndex) => {
                        const key = `${catIndex}-${itemIndex}`;
                        const isChecked = checkedItems.has(key);
                        return (
                          <button
                            key={itemIndex}
                            onClick={() => toggleItem(catIndex, itemIndex)}
                            className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                              isChecked ? 'bg-primary/10' : 'hover:bg-muted/50'
                            }`}
                          >
                            {isChecked ? (
                              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className={`flex-1 text-left text-sm ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.name}
                            </span>
                            <span className={`text-xs font-mono ${isChecked ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                              {item.quantity}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </GlassCard>
                ))}

                <Button 
                  variant="outline" 
                  className="w-full border-border/50"
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
