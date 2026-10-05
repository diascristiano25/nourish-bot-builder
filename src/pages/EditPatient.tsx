import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client-custom';
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
import { ArrowLeft, Loader2, Plus, X, User, Activity, Heart, Scale, Save, AlertTriangle } from 'lucide-react';

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
          goal: goal as "hypertrophy" | "weight_loss" | "maintenance" | "health" | "performance" | null || null,
          activity_level: activityLevel as "sedentary" | "light" | "moderate" | "active" | "very_active" | null || null,
          allergies: allergies.length > 0 ? allergies : null,
          dietary_restrictions: restrictions.length > 0 ? restrictions : null,
          medical_conditions: medicalConditions.trim() || null,
          notes: notes.trim() || null,
          critical_tags: criticalTags.length > 0 ? criticalTags : [],
        })
        .eq('id', id);

      if (error) throw error;

      const hasAnyMeasurement = weight || height || waist || hip || bodyFat;
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
            notes: 'Atualizado via edição de perfil',
          });

        if (weight) {
          const today = new Date().toISOString().split('T')[0];
          const weightValue = parseFloat(weight);
          
          const { data: existingLog } = await supabase
            .from('weight_logs')
            .select('id')
            .eq('patient_id', id)
            .eq('recorded_at', today)
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
                recorded_at: today,
              });
          }
        }
      }

      toast({
        title: "Paciente atualizado!",
        description: `${fullName} foi atualizado com sucesso.`,
      });

      navigate(`/patients/${id}`);
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
            onClick={() => navigate(`/patients/${id}`)}
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
                  <Label htmlFor="bodyFat">Gordura Corporal (%)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    placeholder="20"
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
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
