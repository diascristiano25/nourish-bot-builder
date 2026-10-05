import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Loader2, Utensils, Apple, Clock, FileText, Flame, Beef, Wheat, Droplet, LogIn, Zap } from 'lucide-react';
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
  created_at: string;
}

interface NutritionistProfile {
  full_name: string;
  crn: string | null;
  phone: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  email_signature: string | null;
}

interface Patient {
  id: string;
  full_name: string;
  goal: string | null;
}

const mealIcons: Record<string, React.ReactNode> = {
  'Café da Manhã': <Apple className="w-5 h-5" />,
  'Lanche da Manhã': <Apple className="w-4 h-4" />,
  'Almoço': <Utensils className="w-5 h-5" />,
  'Lanche da Tarde': <Apple className="w-4 h-4" />,
  'Jantar': <Utensils className="w-5 h-5" />,
  'Ceia': <Apple className="w-4 h-4" />,
};

export default function PublicPatientPortal() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [nutritionist, setNutritionist] = useState<NutritionistProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, [patientId]);

  const checkAuthAndFetch = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      setIsAuthenticated(true);
      
      if (patientId) {
        await fetchData();
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('public-patient-portal', {
        body: { patientId }
      });

      if (fnError) {
        console.error('Function error:', fnError);
        if (fnError.message?.includes('401') || fnError.message?.includes('Unauthorized')) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        throw new Error('Erro ao carregar dados');
      }
      if (data.error) {
        if (data.error.includes('Unauthorized') || data.error.includes('Access denied')) {
          setError('Você não tem permissão para visualizar este portal.');
        } else {
          throw new Error(data.error);
        }
        setLoading(false);
        return;
      }

      setPatient(data.patient);
      setNutritionist(data.nutritionist);
      
      if (data.mealPlan) {
        setMealPlan({
          ...data.mealPlan,
          plan_data: data.mealPlan.plan_data as MealPlanData
        });
      }

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = nutritionist?.primary_color || '#06b6d4';
  const secondaryColor = nutritionist?.secondary_color || '#8b5cf6';

  // Show login prompt if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        {/* Cyber Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <GlassCard className="max-w-md w-full text-center border-cyan-500/30">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-6">
              Você precisa estar logado para acessar seu portal de paciente.
            </p>
            <Button 
              onClick={() => navigate('/patient-auth', { state: { returnTo: `/portal/${patientId}` } })}
              className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white border-0"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Fazer Login
            </Button>
          </CardContent>
        </GlassCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center border-red-500/30">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <FileText className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground">Portal não disponível</h2>
            <p className="text-muted-foreground">
              {error || 'Não foi possível carregar os dados do paciente.'}
            </p>
          </CardContent>
        </GlassCard>
      </div>
    );
  }

  const planData = mealPlan?.plan_data;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Cyber Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header with Nutritionist Branding */}
      <header 
        className="relative overflow-hidden py-8"
        style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)` }}
      >
        <div className="absolute inset-0 bg-[#0a0a0f]/80" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {nutritionist?.logo_url && (
                <img 
                  src={nutritionist.logo_url} 
                  alt="Logo" 
                  className="h-14 object-contain bg-white/10 p-2 rounded-xl border border-white/10"
                />
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{nutritionist?.full_name || 'Nutricionista'}</h1>
                {nutritionist?.crn && (
                  <p className="text-sm text-cyan-400 font-mono">{nutritionist.crn}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6 relative z-10">
        {/* Welcome Card */}
        <GlassCard className="border-cyan-500/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />
          <CardContent className="relative pt-6">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold border-2"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
                  borderColor: primaryColor,
                  color: primaryColor
                }}
              >
                {patient.full_name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold mb-1 text-foreground">Olá, {patient.full_name.split(' ')[0]}!</h2>
              <p className="text-muted-foreground">
                Aqui está seu plano alimentar personalizado
              </p>
            </div>
          </CardContent>
        </GlassCard>

        {!mealPlan ? (
          <GlassCard className="border-cyan-500/20">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 border border-cyan-500/20 flex items-center justify-center">
                <Utensils className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Nenhum plano alimentar ainda</h3>
              <p className="text-muted-foreground">
                Seu nutricionista ainda não gerou um plano alimentar para você.
              </p>
            </CardContent>
          </GlassCard>
        ) : (
          <>
            {/* Macros Summary */}
            <GlassCard className="border-cyan-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-cyan-400" />
                  <span className="text-foreground">Resumo Nutricional Diário</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Flame className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                    <p className="text-2xl font-bold font-mono text-cyan-400">
                      {mealPlan.total_calories || planData?.totalCalories || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Beef className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                    <p className="text-2xl font-bold font-mono text-blue-400">
                      {planData?.macros?.protein || '-'}g
                    </p>
                    <p className="text-xs text-muted-foreground">Proteínas</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <Wheat className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                    <p className="text-2xl font-bold font-mono text-orange-400">
                      {planData?.macros?.carbs || '-'}g
                    </p>
                    <p className="text-xs text-muted-foreground">Carboidratos</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Droplet className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                    <p className="text-2xl font-bold font-mono text-emerald-400">
                      {planData?.macros?.fat || '-'}g
                    </p>
                    <p className="text-xs text-muted-foreground">Gorduras</p>
                  </div>
                </div>
              </CardContent>
            </GlassCard>

            {/* Meals List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Utensils className="w-5 h-5 text-cyan-400" />
                <span className="text-foreground">Suas Refeições</span>
              </h3>
              
              {planData?.meals?.map((meal, index) => (
                <GlassCard key={index} className="border-cyan-500/20 overflow-hidden">
                  <div 
                    className="px-4 py-3 flex items-center justify-between border-b border-cyan-500/20"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }}
                  >
                    <div className="flex items-center gap-2 text-foreground">
                      {mealIcons[meal.name] || <Utensils className="w-5 h-5" />}
                      <span className="font-semibold">{meal.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {meal.time && (
                        <span className="flex items-center gap-1 text-muted-foreground font-mono">
                          <Clock className="w-4 h-4" />
                          {meal.time}
                        </span>
                      )}
                      {meal.totalCalories && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          {meal.totalCalories} kcal
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {meal.items?.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex justify-between items-center py-2 border-b border-cyan-500/10 last:border-0">
                          <div>
                            <p className="font-medium text-foreground">{item.food}</p>
                            <p className="text-sm text-muted-foreground">{item.portion}</p>
                          </div>
                          {item.calories && (
                            <span className="text-sm font-mono text-cyan-400">{item.calories} kcal</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </GlassCard>
              ))}
            </div>

            {/* Notes/Observations */}
            {planData?.notes && (
              <GlassCard className="border-cyan-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span className="text-foreground">Observações e Orientações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-sm whitespace-pre-line text-muted-foreground">
                    {planData.notes}
                  </div>
                </CardContent>
              </GlassCard>
            )}

            {/* Plan Info */}
            <div className="text-center text-sm text-muted-foreground pt-4 font-mono">
              <p>
                Plano: <span className="font-medium text-foreground">{mealPlan.title}</span>
              </p>
              <p>
                Atualizado em {format(new Date(mealPlan.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </>
        )}

        {/* Footer with Email Signature */}
        <footer className="text-center pt-8 pb-6 border-t border-cyan-500/20 space-y-3">
          {nutritionist?.email_signature && (
            <div 
              className="text-sm text-muted-foreground whitespace-pre-line italic border-l-2 pl-4 mx-auto max-w-md text-left"
              style={{ borderColor: primaryColor }}
            >
              {nutritionist.email_signature}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Plano alimentar elaborado por {nutritionist?.full_name || 'seu nutricionista'}
          </p>
          {nutritionist?.phone && (
            <p className="text-sm text-cyan-400 font-mono">
              Contato: {nutritionist.phone}
            </p>
          )}
        </footer>

        {/* Authority Footer */}
        <div className="text-center pb-8">
          <p className="text-xs text-muted-foreground/60 font-mono">
            Desenvolvido por FlowTech Group sob licença de {nutritionist?.full_name || 'Nutricionista'}
          </p>
        </div>
      </main>
    </div>
  );
}
