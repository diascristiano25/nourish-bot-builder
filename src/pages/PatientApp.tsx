import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { WeightChart } from '@/components/monitoring';
import { GlassCard } from '@/components/ui/GlassCard';
import { Loader2, User, Utensils, Droplets, Coffee, Sun, Moon, Apple, Zap } from 'lucide-react';
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
  measured_at: string;
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
        if (typeof item === 'string') {
          return (
            <li key={index} className="flex justify-between py-2 border-b border-cyan-500/10 last:border-0">
              <span className="text-sm text-foreground">{item}</span>
            </li>
          );
        }

        const name = item?.nome || item?.name || item?.descricao || 'Item';
        const portion = item?.porcao || item?.portion || item?.quantidade || '';
        const calories = item?.calorias || item?.calories;

        return (
          <li key={index} className="flex items-center justify-between py-2 border-b border-cyan-500/10 last:border-0">
            <div>
              <p className="text-sm text-foreground">{name}</p>
              {portion && <p className="text-xs text-muted-foreground">{portion}</p>}
            </div>
            {calories && (
              <span className="text-xs font-mono text-cyan-400">{calories} kcal</span>
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-3" />
            <div className="absolute inset-0 w-12 h-12 mx-auto rounded-full bg-cyan-400/20 blur-xl animate-pulse" />
          </div>
          <p className="text-sm text-cyan-400/70 font-mono">Carregando sua dieta...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full border-red-500/30">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">Link Inválido</h2>
            <p className="text-sm text-muted-foreground">
              {error || 'O link que você acessou não é válido. Solicite um novo link ao seu nutricionista.'}
            </p>
          </CardContent>
        </GlassCard>
      </div>
    );
  }

  const planData = mealPlan?.plan_data as any;
  const meals = planData?.meals || planData?.refeicoes || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Cyber Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={logoImg} alt="NutriFlow" className="w-8 h-8 object-contain" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-lg" />
            </div>
            <span className="font-semibold text-foreground">NutriFlow</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 p-4 pb-8 max-w-lg mx-auto space-y-6">
        {/* Welcome Card */}
        <GlassCard className="border-cyan-500/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />
          <CardContent className="relative py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center">
                <span className="text-2xl font-semibold text-cyan-400">
                  {patient.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Olá, {patient.full_name.split(' ')[0]}!
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    {goalLabels[patient.goal || ''] || 'Saúde'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Weight Chart */}
        <WeightChart data={weightLogs} showHeader={true} />

        {/* Current Meal Plan */}
        <GlassCard className="border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Utensils className="w-4 h-4 text-cyan-400" />
              <span className="text-foreground">Sua Dieta Atual</span>
            </CardTitle>
            {mealPlan?.total_calories && (
              <p className="text-xs text-cyan-400 font-mono">
                {mealPlan.total_calories} kcal/dia
              </p>
            )}
          </CardHeader>
          <CardContent>
            {!mealPlan || meals.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 border border-cyan-500/20 flex items-center justify-center">
                  <Utensils className="w-8 h-8 text-muted-foreground/50" />
                </div>
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
                      className="border border-cyan-500/20 rounded-xl px-4 bg-white/[0.02]"
                    >
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center">
                            <MealIcon className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground">
                              {meal.nome || meal.name || meal.tipo || 'Refeição'}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
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
        </GlassCard>

        {/* Water Reminder */}
        <GlassCard className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Lembre-se de beber água!</p>
                <p className="text-xs text-blue-400 font-mono">Meta: 2L por dia</p>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p className="font-mono">Desenvolvido com ❤️ por NutriFlow</p>
        </div>
      </main>
    </div>
  );
}
