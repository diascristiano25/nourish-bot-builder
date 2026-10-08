import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Sparkles, User, Scale, Target, AlertCircle, Zap } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { AppLayout } from '@/components/AppLayout';

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
  const { patientId } = useParams<{ patientId: string }>();
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
    if (user && patientId) {
      fetchPatientData();
    }
  }, [user, patientId]);

  const fetchPatientData = async () => {
    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);
      setPlanTitle(`Cardápio - ${patientData.full_name}`);

      const { data: anthropData } = await supabase
        .from('anthropometrics')
        .select('weight_kg, height_cm')
        .eq('patient_id', patientId)
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
    if (!Number.isFinite(age) || age < 0 || age > 150) return null;

    const weight = anthropometric.weight_kg;
    const height = anthropometric.height_cm;

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
      const age = patient.birth_date ? differenceInYears(new Date(), new Date(patient.birth_date)) : null;
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

      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: { patientData }
      });

      if (error) throw error;

      const { data: savedPlan, error: saveError } = await supabase
        .from('meal_plans')
        .insert({
          patient_id: patient.id,
          nutritionist_id: patient.nutritionist_id,
          title: planTitle || `Cardápio - ${patient.full_name}`,
          description: additionalNotes || null,
          total_calories: data.totalCalories || calculatedCalories || calculateTDEE() || null,
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

      navigate(`/cardapio/${savedPlan.id}`);
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
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!patient) return null;

  const age = patient.birth_date ? differenceInYears(new Date(), new Date(patient.birth_date)) : null;
  const bmr = calculateBMR();
  const tdee = calculateTDEE();
  const hasBasicData = anthropometric?.weight_kg && anthropometric?.height_cm;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Cyber Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-border/30">
          <div className="px-4 md:px-8 h-16 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/pacientes/${patientId}`)} className="glass hover:bg-primary/10 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Gerar <NeonText variant="lime">Cardápio</NeonText></h1>
                <p className="text-xs text-muted-foreground">{patient.full_name}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
          {/* Warning if missing data */}
          {!hasBasicData && (
            <GlassCard className="p-4 border-amber-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-400">Dados incompletos</p>
                  <p className="text-sm text-muted-foreground">
                    Para um cardápio mais preciso, cadastre peso e altura do paciente.
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Patient Summary */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Resumo do Paciente</h2>
                <p className="text-sm text-muted-foreground">Dados que serão usados pela IA</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl glass">
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="font-semibold font-mono text-primary">{age || '-'} anos</p>
              </div>
              <div className="text-center p-3 rounded-xl glass">
                <p className="text-sm text-muted-foreground">Peso</p>
                <p className="font-semibold font-mono text-primary">{anthropometric?.weight_kg || '-'} kg</p>
              </div>
              <div className="text-center p-3 rounded-xl glass">
                <p className="text-sm text-muted-foreground">Altura</p>
                <p className="font-semibold font-mono text-primary">{anthropometric?.height_cm || '-'} cm</p>
              </div>
              <div className="text-center p-3 rounded-xl glass">
                <p className="text-sm text-muted-foreground">TMB</p>
                <p className="font-semibold font-mono text-primary">{bmr || '-'} kcal</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {patient.goal && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Objetivo:</span>
                  <Badge className="bg-primary/20 text-primary border-0">{goalLabels[patient.goal]}</Badge>
                </div>
              )}
              {patient.activity_level && (
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Atividade:</span>
                  <Badge variant="outline" className="border-border/50">{activityLabels[patient.activity_level]}</Badge>
                </div>
              )}
              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Alergias:</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((a, i) => (
                      <Badge key={i} className="text-xs bg-destructive/20 text-destructive border-0">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {patient.dietary_restrictions && patient.dietary_restrictions.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Restrições:</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.dietary_restrictions.map((r, i) => (
                      <Badge key={i} className="text-xs bg-secondary/20 text-secondary border-0">{r}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Configuration */}
          <GlassCard glow="lime" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Configurações do Cardápio</h2>
                <p className="text-sm text-muted-foreground">Personalize a geração</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Título do Cardápio</Label>
                <Input
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="Ex: Cardápio Semanal - Emagrecimento"
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Meta de Calorias (opcional)</Label>
                <Input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(e.target.value)}
                  placeholder={tdee ? `Sugestão: ${tdee} kcal (TDEE calculado)` : "Ex: 2000"}
                  className="bg-background/50 border-border/50"
                />
                {tdee && !targetCalories && (
                  <p className="text-xs text-muted-foreground">
                    Gasto calórico diário estimado: <span className="text-primary font-mono">{tdee} kcal</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">Instruções Adicionais</Label>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Ex: Preferência por refeições rápidas, evitar frituras..."
                  rows={3}
                  className="bg-background/50 border-border/50"
                />
              </div>
            </div>
          </GlassCard>

          {/* Generate Button */}
          <Button 
            className="w-full h-14 text-lg gap-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando cardápio com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar Cardápio
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            O cardápio será gerado usando a Tabela TACO como referência nutricional
          </p>
        </main>
      </div>
    </AppLayout>
  );
}
