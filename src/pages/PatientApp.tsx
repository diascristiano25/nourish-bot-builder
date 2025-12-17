import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { WeightChart } from '@/components/monitoring';
import { Loader2, User, Utensils, Droplets, Coffee, Sun, Moon, Apple } from 'lucide-react';
import logoImg from '@/assets/logo.png';

interface Patient {
  id: string;
  full_name: string;
  goal: string | null;
}

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  plan_data: any;
  total_calories: number | null;
}

interface WeightLog {
  id: string;
  weight: number;
  recorded_at: string;
}

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde',
  performance: 'Performance',
};

const mealIcons: Record<string, React.ElementType> = {
  'cafe': Coffee,
  'almoco': Sun,
  'lanche': Apple,
  'jantar': Moon,
};

// Safe component to render meal items
const MealItemsList = ({ items }: { items: any[] }) => {
  // If no items, show placeholder
  if (!items || items.length === 0) {
    return (
      <div className="ml-11 py-2 text-sm text-muted-foreground">
        Nenhum alimento cadastrado para esta refeição.
      </div>
    );
  }

  return (
    <ul className="space-y-2 ml-11">
      {items.map((item, index) => {
        // Handle string items
        if (typeof item === 'string') {
          return (
            <li key={index} className="flex justify-between py-2 border-b border-border/30 last:border-0">
              <span className="text-sm text-foreground">{item}</span>
            </li>
          );
        }

        // Handle object items
        const name = item?.nome || item?.name || item?.descricao || 'Item';
        const portion = item?.porcao || item?.portion || item?.quantidade || '';
        const calories = item?.calorias || item?.calories;

        return (
          <li key={index} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
            <div>
              <p className="text-sm text-foreground">{name}</p>
              {portion && <p className="text-xs text-muted-foreground">{portion}</p>}
            </div>
            {calories && (
              <span className="text-xs text-muted-foreground">{calories} kcal</span>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default function PatientApp() {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      // Use secure edge function to fetch portal data
      const { data, error: fnError } = await supabase.functions.invoke('public-patient-portal', {
        body: { patientId }
      });

      if (fnError) throw new Error('Erro ao carregar dados');
      if (data.error) throw new Error(data.error);

      setPatient(data.patient);
      setMealPlan(data.mealPlan);
      setWeightLogs(data.weightLogs || []);

    } catch (err: any) {
      console.error('Error fetching patient data:', err);
      setError('Não foi possível carregar os dados. Verifique se o link está correto.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Carregando sua dieta...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">Link Inválido</h2>
            <p className="text-sm text-muted-foreground">
              {error || 'O link que você acessou não é válido. Solicite um novo link ao seu nutricionista.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planData = mealPlan?.plan_data as any;
  const meals = planData?.meals || planData?.refeicoes || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-foreground">NutriFlow</span>
          </div>
        </div>
      </header>

      <main className="p-4 pb-8 max-w-lg mx-auto space-y-6">
        {/* Welcome Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {patient.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Olá, {patient.full_name.split(' ')[0]}!
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {goalLabels[patient.goal || ''] || 'Saúde'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight Chart */}
        <WeightChart data={weightLogs} showHeader={true} />

        {/* Current Meal Plan */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Utensils className="w-4 h-4 text-primary" />
              Sua Dieta Atual
            </CardTitle>
            {mealPlan?.total_calories && (
              <p className="text-xs text-muted-foreground">
                {mealPlan.total_calories} kcal/dia
              </p>
            )}
          </CardHeader>
          <CardContent>
            {!mealPlan || meals.length === 0 ? (
              <div className="text-center py-8">
                <Utensils className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma dieta cadastrada ainda.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aguarde seu nutricionista criar seu plano alimentar.
                </p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {meals.map((meal: any, index: number) => {
                  const mealKey = meal.tipo?.toLowerCase() || meal.type?.toLowerCase() || `meal-${index}`;
                  const MealIcon = mealIcons[mealKey] || Utensils;
                  
                  return (
                    <AccordionItem 
                      key={index} 
                      value={`meal-${index}`}
                      className="border border-border/50 rounded-lg px-4"
                    >
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <MealIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground">
                              {meal.nome || meal.name || meal.tipo || 'Refeição'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {meal.horario || meal.time || ''}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <MealItemsList items={meal.alimentos || meal.foods || meal.items || []} />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Water Reminder */}
        <Card className="border-blue-200/50 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-950/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Lembre-se de beber água!</p>
                <p className="text-xs text-muted-foreground">Meta: 2L por dia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Desenvolvido com ❤️ por NutriFlow</p>
        </div>
      </main>
    </div>
  );
}
