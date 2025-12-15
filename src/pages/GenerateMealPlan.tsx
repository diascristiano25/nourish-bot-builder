import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Sparkles, User, Scale, Target, AlertCircle } from 'lucide-react';
import { differenceInYears } from 'date-fns';

interface Patient {
  id: string;
  full_name: string;
  birth_date: string | null;
  gender: string | null;
  goal: string | null;
  activity_level: string | null;
  allergies: string[] | null;
  dietary_restrictions: string[] | null;
  medical_conditions: string | null;
  nutritionist_id: string;
}

interface Anthropometric {
  weight_kg: number | null;
  height_cm: number | null;
}

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde Geral',
  performance: 'Performance Esportiva',
};

const activityLabels: Record<string, string> = {
  sedentary: 'Sedentário',
  light: 'Leve (1-2x/semana)',
  moderate: 'Moderado (3-4x/semana)',
  active: 'Ativo (5-6x/semana)',
  very_active: 'Muito Ativo (atleta)',
};

export default function GenerateMealPlan() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [anthropometric, setAnthropometric] = useState<Anthropometric | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [planTitle, setPlanTitle] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [targetCalories, setTargetCalories] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchPatientData();
    }
  }, [user, id]);

  const fetchPatientData = async () => {
    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);
      setPlanTitle(`Cardápio - ${patientData.full_name}`);

      // Fetch latest anthropometric
      const { data: anthropData } = await supabase
        .from('anthropometrics')
        .select('weight_kg, height_cm')
        .eq('patient_id', id)
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setAnthropometric(anthropData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateBMR = () => {
    if (!anthropometric?.weight_kg || !anthropometric?.height_cm || !patient?.birth_date) {
      return null;
    }
    
    const age = differenceInYears(new Date(), new Date(patient.birth_date));
    const weight = anthropometric.weight_kg;
    const height = anthropometric.height_cm;
    
    // Mifflin-St Jeor Equation
    if (patient.gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    if (!bmr) return null;

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const multiplier = activityMultipliers[patient?.activity_level || 'moderate'] || 1.55;
    return Math.round(bmr * multiplier);
  };

  const handleGenerate = async () => {
    if (!patient) return;

    setGenerating(true);

    try {
      const age = patient.birth_date 
        ? differenceInYears(new Date(), new Date(patient.birth_date))
        : null;

      // Calculate target calories - ensure it's a valid number or null
      let calculatedCalories: number | null = null;
      if (targetCalories && targetCalories.trim() !== '') {
        const parsed = parseInt(targetCalories, 10);
        if (!isNaN(parsed) && parsed >= 500 && parsed <= 10000) {
          calculatedCalories = parsed;
        }
      } else {
        calculatedCalories = calculateTDEE();
      }

      const patientData = {
        name: patient.full_name,
        age: age !== null && age >= 0 ? age : null,
        gender: patient.gender || null,
        weight: anthropometric?.weight_kg ?? null,
        height: anthropometric?.height_cm ?? null,
        goal: patient.goal ? goalLabels[patient.goal] : null,
        activityLevel: patient.activity_level ? activityLabels[patient.activity_level] : null,
        allergies: patient.allergies || [],
        dietaryRestrictions: patient.dietary_restrictions || [],
        medicalConditions: patient.medical_conditions || null,
        targetCalories: calculatedCalories,
        additionalNotes: additionalNotes || '',
      };

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: { patientData }
      });

      if (error) throw error;

      // Save the meal plan
      const { data: savedPlan, error: saveError } = await supabase
        .from('meal_plans')
        .insert({
          patient_id: patient.id,
          nutritionist_id: patient.nutritionist_id,
          title: planTitle || `Cardápio - ${patient.full_name}`,
          description: additionalNotes || null,
          total_calories: data.totalCalories || parseInt(targetCalories) || calculateTDEE(),
          plan_data: data.mealPlan,
          is_active: true,
        })
        .select('id')
        .single();

      if (saveError) throw saveError;

      toast({
        title: "Cardápio gerado!",
        description: "O plano alimentar foi criado com sucesso.",
      });

      navigate(`/patients/${id}/meal-plan/${savedPlan.id}`);
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Erro ao gerar cardápio",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const age = patient.birth_date 
    ? differenceInYears(new Date(), new Date(patient.birth_date))
    : null;
  const bmr = calculateBMR();
  const tdee = calculateTDEE();
  const hasBasicData = anthropometric?.weight_kg && anthropometric?.height_cm;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">Gerar Cardápio</h1>
            <p className="text-xs text-muted-foreground">{patient.full_name}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Warning if missing data */}
        {!hasBasicData && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium">Dados incompletos</p>
                  <p className="text-sm text-muted-foreground">
                    Para um cardápio mais preciso, cadastre peso e altura do paciente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Summary */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Resumo do Paciente</CardTitle>
                <CardDescription>Dados que serão usados pela IA</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="font-semibold">{age || '-'} anos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Peso</p>
                <p className="font-semibold">{anthropometric?.weight_kg || '-'} kg</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Altura</p>
                <p className="font-semibold">{anthropometric?.height_cm || '-'} cm</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">TMB</p>
                <p className="font-semibold">{bmr || '-'} kcal</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {patient.goal && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Objetivo:</span>
                  <Badge variant="secondary">{goalLabels[patient.goal]}</Badge>
                </div>
              )}
              {patient.activity_level && (
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Atividade:</span>
                  <Badge variant="outline">{activityLabels[patient.activity_level]}</Badge>
                </div>
              )}
              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Alergias:</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((a, i) => (
                      <Badge key={i} variant="destructive" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {patient.dietary_restrictions && patient.dietary_restrictions.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Restrições:</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.dietary_restrictions.map((r, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{r}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Configurações do Cardápio</CardTitle>
                <CardDescription>Personalize a geração</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Cardápio</Label>
              <Input
                id="title"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="Ex: Cardápio Semanal - Emagrecimento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Meta de Calorias (opcional)</Label>
              <Input
                id="calories"
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                placeholder={tdee ? `Sugestão: ${tdee} kcal (TDEE calculado)` : "Ex: 2000"}
              />
              {tdee && !targetCalories && (
                <p className="text-xs text-muted-foreground">
                  Gasto calórico diário estimado: {tdee} kcal
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Instruções Adicionais</Label>
              <Textarea
                id="notes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Ex: Preferência por refeições rápidas, evitar frituras..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button 
          variant="hero" 
          size="xl" 
          className="w-full"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Gerando cardápio com IA...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Gerar Cardápio
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          O cardápio será gerado usando a Tabela TACO como referência nutricional
        </p>
      </main>
    </div>
  );
}
