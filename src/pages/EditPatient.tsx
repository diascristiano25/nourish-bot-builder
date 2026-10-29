import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { CriticalTagsBadges } from '@/components/CriticalTagsBadges';
import { ArrowLeft, Loader2, Plus, X, User, Activity, Heart, Scale, Save, AlertTriangle, Calculator, FlaskConical, TrendingUp } from 'lucide-react';
import { differenceInYears, parseISO } from 'date-fns';
import { calculateNutritionalNeeds, classifyBMI, calculateBodyFatFromSkinfolds } from '@/lib/nutritional-calculations';
import { LabResultsPanel } from '@/components/LabResultsPanel';

/**
 * CUN-BAE formula: estimates body fat % from BMI, age and sex.
 * Source: Gómez-Ambrosi et al., Obesity (2012). Widely used in clinical nutrition
 * when skinfold / BIA measurements are unavailable.
 *   BF% = -44.988 + 0.503*age + 10.689*sex + 3.172*BMI - 0.026*BMI^2 + 0.181*BMI*sex - 0.02*BMI*age - 0.005*BMI^2*sex + 0.00021*BMI^2*age
 *   sex: male = 0, female = 1
 */
function estimateBodyFatCunBae(weightKg: number, heightCm: number, ageYears: number, gender: string): number | null {
  if (!weightKg || !heightCm || !ageYears || ageYears < 1) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!isFinite(bmi) || bmi < 10 || bmi > 80) return null;
  const sex = (gender === 'female' || gender === 'feminino') ? 1 : 0;
  const bf = -44.988
    + 0.503 * ageYears
    + 10.689 * sex
    + 3.172 * bmi
    - 0.026 * bmi * bmi
    + 0.181 * bmi * sex
    - 0.02 * bmi * ageYears
    - 0.005 * bmi * bmi * sex
    + 0.00021 * bmi * bmi * ageYears;
  const clamped = Math.max(3, Math.min(60, bf));
  return Math.round(clamped * 10) / 10;
}

const commonAllergies = ['Glúten', 'Lactose', 'Amendoim', 'Nozes', 'Soja', 'Ovos', 'Frutos do mar', 'Mariscos'];
const commonRestrictions = ['Vegetariano', 'Vegano', 'Sem carne vermelha', 'Kosher', 'Halal', 'Low carb', 'Cetogênica'];
const criticalTagOptions = ['Gestante', 'Diabético', 'Cardiopata', 'Renal Crônico', 'Oncológico', 'Alérgico Grave', 'Idoso +80', 'Transtorno Alimentar'];

export default function EditPatient() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [medicalConditions, setMedicalConditions] = useState('');
  const [notes, setNotes] = useState('');
  const [criticalTags, setCriticalTags] = useState<string[]>([]);
  
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [bodyFat, setBodyFat] = useState('');

  // Dobras cutâneas
  const [tricepsSkinfold, setTricepsSkinfold] = useState('');
  const [bicepsSkinfold, setBicepsSkinfold] = useState('');
  const [subscapularSkinfold, setSubscapularSkinfold] = useState('');
  const [suprailiacSkinfold, setSuprailiacSkinfold] = useState('');
  const [abdominalSkinfold, setAbdominalSkinfold] = useState('');
  const [thighSkinfold, setThighSkinfold] = useState('');
  const [chestSkinfold, setChestSkinfold] = useState('');

  const [customAllergy, setCustomAllergy] = useState('');
  const [customRestriction, setCustomRestriction] = useState('');

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
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFullName(data.full_name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setBirthDate(data.birth_date || '');
      setGender(data.gender || '');
      setGoal(data.goal || '');
      setActivityLevel(data.activity_level || '');
      setAllergies(data.allergies || []);
      setRestrictions(data.dietary_restrictions || []);
      setMedicalConditions(data.medical_conditions || '');
      setNotes(data.notes || '');
      setCriticalTags(data.critical_tags || []);

      const { data: anthroData } = await supabase
        .from('anthropometrics')
        .select('*')
        .eq('patient_id', id)
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (anthroData) {
        setWeight(anthroData.weight_kg?.toString() || '');
        setHeight(anthroData.height_cm?.toString() || '');
        setWaist(anthroData.waist_cm?.toString() || '');
        setHip(anthroData.hip_cm?.toString() || '');
        setBodyFat(anthroData.body_fat_percentage?.toString() || '');
        // Dobras cutâneas
        setTricepsSkinfold(anthroData.triceps_skinfold_mm?.toString() || '');
        setBicepsSkinfold(anthroData.biceps_skinfold_mm?.toString() || '');
        setSubscapularSkinfold(anthroData.subscapular_skinfold_mm?.toString() || '');
        setSuprailiacSkinfold(anthroData.suprailiac_skinfold_mm?.toString() || '');
        setAbdominalSkinfold(anthroData.abdominal_skinfold_mm?.toString() || '');
        setThighSkinfold(anthroData.thigh_skinfold_mm?.toString() || '');
        setChestSkinfold(anthroData.chest_skinfold_mm?.toString() || '');
      }
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

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const toggleRestriction = (restriction: string) => {
    setRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const toggleCriticalTag = (tag: string) => {
    setCriticalTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies(prev => [...prev, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const addCustomRestriction = () => {
    if (customRestriction.trim() && !restrictions.includes(customRestriction.trim())) {
      setRestrictions(prev => [...prev, customRestriction.trim()]);
      setCustomRestriction('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o nome do paciente",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('patients')
        .update({
          full_name: fullName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          birth_date: birthDate || null,
          gender: gender || null,
          goal: goal as "weight_loss" | "muscle_gain" | "maintenance" | "health_improvement" | "sports_performance" | null || null,
          activity_level: activityLevel as "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active" | null || null,
          allergies: allergies.length > 0 ? allergies : null,
          dietary_restrictions: restrictions.length > 0 ? restrictions : null,
          medical_conditions: medicalConditions.trim() || null,
          notes: notes.trim() || null,
          critical_tags: criticalTags.length > 0 ? criticalTags : [],
        })
        .eq('id', id);

      if (error) throw error;

      const hasAnyMeasurement = weight || height || waist || hip || bodyFat || tricepsSkinfold || bicepsSkinfold || subscapularSkinfold || suprailiacSkinfold || abdominalSkinfold || thighSkinfold || chestSkinfold;
      if (hasAnyMeasurement) {
        await supabase
          .from('anthropometrics')
          .insert({
            patient_id: id,
            weight_kg: weight ? parseFloat(weight) : null,
            height_cm: height ? parseFloat(height) : null,
            waist_cm: waist ? parseFloat(waist) : null,
            hip_cm: hip ? parseFloat(hip) : null,
            body_fat_percentage: bodyFat ? parseFloat(bodyFat) : null,
            triceps_skinfold_mm: tricepsSkinfold ? parseFloat(tricepsSkinfold) : null,
            biceps_skinfold_mm: bicepsSkinfold ? parseFloat(bicepsSkinfold) : null,
            subscapular_skinfold_mm: subscapularSkinfold ? parseFloat(subscapularSkinfold) : null,
            suprailiac_skinfold_mm: suprailiacSkinfold ? parseFloat(suprailiacSkinfold) : null,
            abdominal_skinfold_mm: abdominalSkinfold ? parseFloat(abdominalSkinfold) : null,
            thigh_skinfold_mm: thighSkinfold ? parseFloat(thighSkinfold) : null,
            chest_skinfold_mm: chestSkinfold ? parseFloat(chestSkinfold) : null,
            notes: 'Atualizado via edição de perfil',
          });

        if (weight) {
          const today = new Date().toISOString().split('T')[0];
          const weightValue = parseFloat(weight);
          
          const { data: existingLog } = await supabase
            .from('weight_logs')
            .select('id')
            .eq('patient_id', id)
            .eq('measured_at', today)
            .maybeSingle();
          
          if (existingLog) {
            await supabase
              .from('weight_logs')
              .update({ weight: weightValue })
              .eq('id', existingLog.id);
          } else {
            await supabase
              .from('weight_logs')
              .insert({
                patient_id: id,
                weight: weightValue,
                measured_at: today,
              });
          }
        }
      }

      toast({
        title: "Paciente atualizado!",
        description: `${fullName} foi atualizado com sucesso.`,
      });

      navigate(`/pacientes/${id}`);
    } catch (error: any) {
      console.error('Error updating patient:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cyber Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/pacientes/${id}`)}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <NeonText as="h1" color="primary" className="font-bold text-lg">
              Editar Paciente
            </NeonText>
            <p className="text-xs text-muted-foreground">Atualizar dados da anamnese</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <NeonText as="h2" color="primary" className="font-semibold">
                  Dados Pessoais
                </NeonText>
                <p className="text-xs text-muted-foreground">Informações básicas do paciente</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Maria da Silva"
                  className="bg-background/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="paciente@email.com"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select value={gender || undefined} onValueChange={setGender}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="glass border-border/50">
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Anthropometric Measurements */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-success" />
              </div>
              <div>
                <NeonText as="h2" color="primary" className="font-semibold">
                  Medidas Atuais
                </NeonText>
                <p className="text-xs text-muted-foreground">Atualiza o histórico automaticamente</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70.5"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waist">Cintura (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    placeholder="80"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hip">Quadril (cm)</Label>
                  <Input
                    id="hip"
                    type="number"
                    step="0.1"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    placeholder="95"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="bodyFat">Gordura Corporal (%)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const w = parseFloat(weight);
                        const h = parseFloat(height);
                        if (!w || !h || !birthDate || !gender) {
                          toast({
                            title: "Dados insuficientes",
                            description: "Preencha Peso, Altura, Data de Nascimento e Sexo para calcular automaticamente.",
                            variant: "destructive",
                          });
                          return;
                        }
                        const age = differenceInYears(new Date(), parseISO(birthDate));
                        const estimated = estimateBodyFatCunBae(w, h, age, gender);
                        if (estimated == null) {
                          toast({
                            title: "Não foi possível calcular",
                            description: "Verifique os valores de peso e altura.",
                            variant: "destructive",
                          });
                          return;
                        }
                        setBodyFat(estimated.toString());
                        toast({
                          title: "% Gordura estimado",
                          description: `Valor calculado pela fórmula CUN-BAE: ${estimated}%. Ajuste se tiver medida direta (dobras/bioimpedância).`,
                        });
                      }}
                      className="h-7 px-2 text-xs gap-1 text-primary hover:bg-primary/10"
                    >
                      <Calculator className="w-3 h-3" />
                      Calcular
                    </Button>
                  </div>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    placeholder="20"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Sem medida direta? Use "Calcular" — estima via IMC, idade e sexo (CUN-BAE).
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Goals & Activity */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-info" />
              </div>
              <div>
                <NeonText as="h2" color="primary" className="font-semibold">
                  Objetivo & Atividade
                </NeonText>
                <p className="text-xs text-muted-foreground">Metas e nível de atividade física</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Select value={goal || undefined} onValueChange={setGoal}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                    <SelectItem value="weight_loss">Emagrecimento</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="health">Saúde Geral</SelectItem>
                    <SelectItem value="performance">Performance Esportiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nível de Atividade Física</Label>
                <Select value={activityLevel || undefined} onValueChange={setActivityLevel}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="sedentary">Sedentário</SelectItem>
                    <SelectItem value="light">Leve (1-2x/semana)</SelectItem>
                    <SelectItem value="moderate">Moderado (3-4x/semana)</SelectItem>
                    <SelectItem value="active">Ativo (5-6x/semana)</SelectItem>
                    <SelectItem value="very_active">Muito Ativo (atleta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>

          {/* Nutritional Calculations (TMB/GET/VET) */}
          {weight && height && birthDate && gender && activityLevel && (() => {
            const age = differenceInYears(new Date(), parseISO(birthDate));
            const w = parseFloat(weight);
            const h = parseFloat(height);
            if (!w || !h || age < 1) return null;

            // Mapear valores do Select para o formato esperado pela função
            const genderMap: Record<string, 'male' | 'female'> = { male: 'male', female: 'female', masculino: 'male', feminino: 'female' };
            const activityMap: Record<string, 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'> = {
              sedentary: 'sedentary', light: 'lightly_active', moderate: 'moderately_active', active: 'very_active', very_active: 'extremely_active',
              lightly_active: 'lightly_active', moderately_active: 'moderately_active', extremely_active: 'extremely_active'
            };
            const goalMap: Record<string, 'weight_loss' | 'muscle_gain' | 'maintenance' | 'health_improvement' | 'sports_performance'> = {
              weight_loss: 'weight_loss', hypertrophy: 'muscle_gain', maintenance: 'maintenance', health: 'health_improvement', performance: 'sports_performance',
              muscle_gain: 'muscle_gain', health_improvement: 'health_improvement', sports_performance: 'sports_performance'
            };

            const results = calculateNutritionalNeeds({
              weightKg: w,
              heightCm: h,
              ageYears: age,
              gender: genderMap[gender] || 'female',
              activityLevel: activityMap[activityLevel] || 'sedentary',
              goal: goalMap[goal] || 'maintenance'
            });

            const bmiClass = classifyBMI(results.imc);

            return (
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-cyber-lime/10 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-cyber-lime" />
                  </div>
                  <div>
                    <NeonText as="h2" color="primary" className="font-semibold">
                      Cálculos Nutricionais
                    </NeonText>
                    <p className="text-xs text-muted-foreground">TMB, GET e VET calculados automaticamente</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1">TMB (Basal)</p>
                    <p className="text-2xl font-bold text-cyber-lime">{results.tmb}</p>
                    <p className="text-[10px] text-muted-foreground">kcal/dia</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1">GET (Total)</p>
                    <p className="text-2xl font-bold text-cyber-lime">{results.get}</p>
                    <p className="text-[10px] text-muted-foreground">kcal/dia</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1">VET (Meta)</p>
                    <p className="text-2xl font-bold" style={{ color: '#C4764A' }}>{results.vet}</p>
                    <p className="text-[10px] text-muted-foreground">kcal/dia</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50 text-sm">
                  <div className="flex items-center gap-4">
                    <span><strong>IMC:</strong> {results.imc}</span>
                    <Badge variant="outline" style={{ borderColor: bmiClass.color, color: bmiClass.color }}>
                      {bmiClass.category}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">Método: {results.method}</span>
                </div>
              </GlassCard>
            );
          })()}

          {/* Skinfold Measurements (Dobras Cutâneas) */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-electric-violet/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-electric-violet" />
              </div>
              <div>
                <NeonText as="h2" color="primary" className="font-semibold">
                  Dobras Cutâneas
                </NeonText>
                <p className="text-xs text-muted-foreground">Medidas em milímetros (mm) para cálculo de % gordura</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="triceps" className="text-xs">Tríceps</Label>
                <Input id="triceps" type="number" step="0.1" value={tricepsSkinfold} onChange={(e) => setTricepsSkinfold(e.target.value)} placeholder="mm" className="h-9 text-sm bg-background/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biceps" className="text-xs">Bíceps</Label>
                <Input id="biceps" type="number" step="0.1" value={bicepsSkinfold} onChange={(e) => setBicepsSkinfold(e.target.value)} placeholder="mm" className="h-9 text-sm bg-background/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscapular" className="text-xs">Subescapular</Label>
                <Input id="subscapular" type="number" step="0.1" value={subscapularSkinfold} onChange={(e) => setSubscapularSkinfold(e.target.value)} placeholder="mm" className="h-9 text-sm bg-background/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suprailiac" className="text-xs">Supra-ilíaca</Label>
                <Input id="suprailiac" type="number" step="0.1" value={suprailiacSkinfold} onChange={(e) => setSuprailiacSkinfold(e.target.value)} placeholder="mm" className="h-9 text-sm bg-background/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="abdominal" className="text-xs">Abdominal</Label>
                <Input id="abdominal" type="number" step="0.1" value={abdominalSkinfold} onChange={(e) => setAbdominalSkinfold(e.target.value)} placeholder="mm" className="h-9 text-sm bg-background/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thigh" className="text-xs">Coxa</Label>
                <Input id="thigh" type="number" step="0.1" value={thighSkinfold} onChange={(e) => setThighSkinfold(e.target.value)} placeholder="mm" className="h-9 text-sm bg-background/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chest" className="text-xs">Peitoral</Label>
                <Input id="chest" type="number" step="0.1" value={chestSkinfold} onChange={(e) => setChestSkinfold(e.target.value)} placeholder="mm" className="h-9 text-sm bg-background/50 border-border/50" />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!birthDate || !gender) {
                      toast({ title: "Dados insuficientes", description: "Preencha Data de Nascimento e Sexo.", variant: "destructive" });
                      return;
                    }
                    const age = differenceInYears(new Date(), parseISO(birthDate));
                    const isMale = gender === 'male' || gender === 'masculino';
                    const bf = calculateBodyFatFromSkinfolds({
                      triceps: parseFloat(tricepsSkinfold) || undefined,
                      suprailiac: parseFloat(suprailiacSkinfold) || undefined,
                      thigh: parseFloat(thighSkinfold) || undefined,
                      chest: parseFloat(chestSkinfold) || undefined,
                      abdominal: parseFloat(abdominalSkinfold) || undefined
                    }, age, isMale);

                    if (bf) {
                      setBodyFat(bf.toString());
                      toast({ title: "% Gordura calculado", description: `Protocolo Jackson-Pollock: ${bf}%` });
                    } else {
                      toast({ title: "Não foi possível calcular", description: "Preencha as dobras necessárias (Tríceps+Supra+Coxa ou Peito+Abdominal+Coxa).", variant: "destructive" });
                    }
                  }}
                  className="w-full h-9 text-xs gap-1"
                >
                  <Calculator className="w-3 h-3" />
                  Calcular %G
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Lab Results */}
          {id && <LabResultsPanel patientId={id} />}

          {/* Critical Tags */}
          <GlassCard className="p-6 border-destructive/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <NeonText as="h2" color="primary" className="font-semibold">
                  Tags Críticas
                </NeonText>
                <p className="text-xs text-muted-foreground">Condições que requerem atenção especial</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {criticalTagOptions.map((tag) => (
                <Badge
                  key={tag}
                  variant={criticalTags.includes(tag) ? "destructive" : "outline"}
                  className={`cursor-pointer transition-all ${
                    criticalTags.includes(tag) 
                      ? 'bg-destructive text-destructive-foreground' 
                      : 'hover:border-destructive/50'
                  }`}
                  onClick={() => toggleCriticalTag(tag)}
                >
                  {tag}
                  {criticalTags.includes(tag) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </GlassCard>

          {/* Health Info */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <NeonText as="h2" color="primary" className="font-semibold">
                  Informações de Saúde
                </NeonText>
                <p className="text-xs text-muted-foreground">Alergias, restrições e condições médicas</p>
              </div>
            </div>
            <div className="space-y-6">
              {/* Allergies */}
              <div className="space-y-3">
                <Label>Alergias Alimentares</Label>
                <div className="flex flex-wrap gap-2">
                  {commonAllergies.map((allergy) => (
                    <Badge
                      key={allergy}
                      variant={allergies.includes(allergy) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        allergies.includes(allergy) 
                          ? 'bg-destructive/20 text-destructive border-destructive/30' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => toggleAllergy(allergy)}
                    >
                      {allergy}
                      {allergies.includes(allergy) && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar outra alergia..."
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCustomAllergy} className="border-border/50">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div className="space-y-3">
                <Label>Restrições Alimentares</Label>
                <div className="flex flex-wrap gap-2">
                  {commonRestrictions.map((restriction) => (
                    <Badge
                      key={restriction}
                      variant={restrictions.includes(restriction) ? "secondary" : "outline"}
                      className={`cursor-pointer transition-all ${
                        restrictions.includes(restriction) 
                          ? 'bg-secondary/50 text-secondary-foreground' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => toggleRestriction(restriction)}
                    >
                      {restriction}
                      {restrictions.includes(restriction) && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar outra restrição..."
                    value={customRestriction}
                    onChange={(e) => setCustomRestriction(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRestriction())}
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCustomRestriction} className="border-border/50">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Condições Médicas</Label>
                <Textarea
                  id="medicalConditions"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="Diabetes, hipertensão, hipotireoidismo..."
                  className="bg-background/50 border-border/50 focus:border-primary min-h-[80px]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações Gerais</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferências alimentares, rotina, observações..."
                  className="bg-background/50 border-border/50 focus:border-primary min-h-[80px]"
                />
              </div>
            </div>
          </GlassCard>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full gap-2 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90" 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Alterações
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
