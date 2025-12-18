import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Utensils, Apple, Clock, FileText, Flame, Beef, Wheat, Droplet, LogIn } from 'lucide-react';
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
      // Use secure edge function to fetch portal data (requires auth)
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

  const primaryColor = nutritionist?.primary_color || '#4a7c59';
  const secondaryColor = nutritionist?.secondary_color || '#2d5a3d';

  // Show login prompt if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <LogIn className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-6">
              Você precisa estar logado para acessar seu portal de paciente.
            </p>
            <Button 
              onClick={() => navigate('/patient-auth', { state: { returnTo: `/portal/${patientId}` } })}
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Portal não disponível</h2>
            <p className="text-muted-foreground">
              {error || 'Não foi possível carregar os dados do paciente.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planData = mealPlan?.plan_data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header with Nutritionist Branding */}
      <header 
        className="text-white py-8"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {nutritionist?.logo_url && (
                <img 
                  src={nutritionist.logo_url} 
                  alt="Logo" 
                  className="h-14 object-contain bg-white/20 p-2 rounded-lg"
                />
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{nutritionist?.full_name || 'Nutricionista'}</h1>
                {nutritionist?.crn && (
                  <p className="text-sm opacity-90">{nutritionist.crn}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {/* Welcome Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div 
            className="h-2" 
            style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}
          />
          <CardContent className="pt-6">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {patient.full_name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold mb-1">Olá, {patient.full_name.split(' ')[0]}!</h2>
              <p className="text-muted-foreground">
                Aqui está seu plano alimentar personalizado
              </p>
            </div>
          </CardContent>
        </Card>

        {!mealPlan ? (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 text-center">
              <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum plano alimentar ainda</h3>
              <p className="text-muted-foreground">
                Seu nutricionista ainda não gerou um plano alimentar para você.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Macros Summary */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5" style={{ color: primaryColor }} />
                  Resumo Nutricional Diário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div 
                    className="text-center p-4 rounded-xl"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Flame className="w-6 h-6 mx-auto mb-2" style={{ color: primaryColor }} />
                    <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                      {mealPlan.total_calories || planData?.totalCalories || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                    <Beef className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-600">
                      {planData?.macros?.protein || '-'}g
                    </p>
                    <p className="text-xs text-muted-foreground">Proteínas</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30">
                    <Wheat className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-2xl font-bold text-orange-600">
                      {planData?.macros?.carbs || '-'}g
                    </p>
                    <p className="text-xs text-muted-foreground">Carboidratos</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-950/30">
                    <Droplet className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">
                      {planData?.macros?.fat || '-'}g
                    </p>
                    <p className="text-xs text-muted-foreground">Gorduras</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meals List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Utensils className="w-5 h-5" style={{ color: primaryColor }} />
                Suas Refeições
              </h3>
              
              {planData?.meals?.map((meal, index) => (
                <Card key={index} className="border-0 shadow-md overflow-hidden">
                  <div 
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ backgroundColor: primaryColor, color: 'white' }}
                  >
                    <div className="flex items-center gap-2">
                      {mealIcons[meal.name] || <Utensils className="w-5 h-5" />}
                      <span className="font-semibold">{meal.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {meal.time && (
                        <span className="flex items-center gap-1 opacity-90">
                          <Clock className="w-4 h-4" />
                          {meal.time}
                        </span>
                      )}
                      {meal.totalCalories && (
                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                          {meal.totalCalories} kcal
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {meal.items?.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{item.food}</p>
                            <p className="text-sm text-muted-foreground">{item.portion}</p>
                          </div>
                          {item.calories && (
                            <span className="text-sm text-muted-foreground">{item.calories} kcal</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Notes/Observations */}
            {planData?.notes && (
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: primaryColor }} />
                    Observações e Orientações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="p-4 rounded-lg text-sm whitespace-pre-line"
                    style={{ backgroundColor: `${primaryColor}10` }}
                  >
                    {planData.notes}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Plan Info */}
            <div className="text-center text-sm text-muted-foreground pt-4">
              <p>
                Plano: <span className="font-medium">{mealPlan.title}</span>
              </p>
              <p>
                Atualizado em {format(new Date(mealPlan.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </>
        )}

        {/* Footer with Email Signature */}
        <footer className="text-center pt-8 pb-6 border-t space-y-3">
          {nutritionist?.email_signature && (
            <div className="text-sm text-muted-foreground whitespace-pre-line italic border-l-2 pl-4 mx-auto max-w-md text-left" style={{ borderColor: primaryColor }}>
              {nutritionist.email_signature}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Plano alimentar elaborado por {nutritionist?.full_name || 'seu nutricionista'}
          </p>
          {nutritionist?.phone && (
            <p className="text-sm text-muted-foreground">
              Contato: {nutritionist.phone}
            </p>
          )}
        </footer>

        {/* Authority Footer */}
        <div className="text-center pb-8">
          <p className="text-xs text-muted-foreground/60">
            Desenvolvido por FlowTech Group sob licença de {nutritionist?.full_name || 'Nutricionista'}
          </p>
        </div>
      </main>
    </div>
  );
}
