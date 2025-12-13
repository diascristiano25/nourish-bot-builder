import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Coffee, 
  Sun, 
  Cookie, 
  Moon,
  UtensilsCrossed,
  Download,
  Share2,
  Edit,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealItem {
  food: string;
  portion: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
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
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  notes?: string;
}

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  total_calories: number | null;
  plan_data: MealPlanData;
  is_active: boolean;
  created_at: string;
  patient_id: string;
}

interface Patient {
  full_name: string;
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

export default function MealPlanView() {
  const { id, planId } = useParams<{ id: string; planId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && planId) {
      fetchMealPlan();
    }
  }, [user, planId]);

  const fetchMealPlan = async () => {
    try {
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;
      
      // Transform the data to match our interface
      const transformedPlan: MealPlan = {
        ...planData,
        plan_data: planData.plan_data as unknown as MealPlanData,
      };
      setMealPlan(transformedPlan);

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('full_name')
        .eq('id', planData.patient_id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar cardápio",
        description: error.message,
        variant: "destructive",
      });
      navigate(`/patients/${id}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mealPlan || !patient) {
    return null;
  }

  const planData = mealPlan.plan_data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">{mealPlan.title}</h1>
              <p className="text-xs text-muted-foreground">{patient.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {/* Summary Card */}
        <Card className="border-0 shadow-md gradient-card">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(mealPlan.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                {mealPlan.is_active && (
                  <Badge variant="default">Cardápio Ativo</Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {mealPlan.total_calories || planData.totalCalories || '-'}
                </p>
                <p className="text-sm text-muted-foreground">kcal/dia</p>
              </div>
            </div>

            {planData.macros && (
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-xl font-semibold text-info">{planData.macros.protein}g</p>
                  <p className="text-xs text-muted-foreground">Proteínas</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-warning">{planData.macros.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carboidratos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-success">{planData.macros.fat}g</p>
                  <p className="text-xs text-muted-foreground">Gorduras</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meals */}
        <div className="space-y-4">
          {planData.meals?.map((meal, index) => (
            <Card key={index} className="border-0 shadow-md overflow-hidden">
              <CardHeader className={`${mealColors[meal.name] || 'bg-muted'} py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center">
                      {mealIcons[meal.name] || <UtensilsCrossed className="w-5 h-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{meal.name}</CardTitle>
                      {meal.time && (
                        <CardDescription className="text-current/70">{meal.time}</CardDescription>
                      )}
                    </div>
                  </div>
                  {meal.totalCalories && (
                    <Badge variant="secondary" className="bg-background/50">
                      {meal.totalCalories} kcal
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {meal.items?.map((item, itemIndex) => (
                    <div 
                      key={itemIndex} 
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.food}</p>
                        <p className="text-sm text-muted-foreground">{item.portion}</p>
                      </div>
                      {item.calories && (
                        <div className="text-right">
                          <p className="font-semibold">{item.calories} kcal</p>
                          {(item.protein || item.carbs || item.fat) && (
                            <p className="text-xs text-muted-foreground">
                              {item.protein && `P:${item.protein}g `}
                              {item.carbs && `C:${item.carbs}g `}
                              {item.fat && `G:${item.fat}g`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notes */}
        {planData.notes && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{planData.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate(`/patients/${id}`)}
          >
            Voltar ao Paciente
          </Button>
          <Button 
            className="flex-1"
            onClick={() => navigate(`/patients/${id}/meal-plan/generate`)}
          >
            <Edit className="mr-2 w-4 h-4" />
            Gerar Novo
          </Button>
        </div>
      </main>
    </div>
  );
}
