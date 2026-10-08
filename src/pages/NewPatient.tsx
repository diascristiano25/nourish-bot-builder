import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ArrowLeft, Loader2, Plus, X, User, Activity, Heart, Scale, Save } from 'lucide-react';

const commonAllergies = ['Glúten', 'Lactose', 'Amendoim', 'Nozes', 'Soja', 'Ovos', 'Frutos do mar', 'Mariscos'];
const commonRestrictions = ['Vegetariano', 'Vegano', 'Sem carne vermelha', 'Kosher', 'Halal', 'Low carb', 'Cetogênica'];

export default function NewPatient() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nutritionistId, setNutritionistId] = useState<string | null>(null);

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
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const [customAllergy, setCustomAllergy] = useState('');
  const [customRestriction, setCustomRestriction] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchNutritionistId = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setNutritionistId(data.id);
        }
      }
    };
    fetchNutritionistId();
  }, [user]);

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
    
    if (!nutritionistId) {
      toast({
        title: "Erro",
        description: "Perfil de nutricionista não encontrado",
        variant: "destructive",
      });
      return;
    }

    const missingFields: string[] = [];
    if (!fullName.trim()) missingFields.push('Nome completo');
    if (!email.trim()) missingFields.push('E-mail');
    if (!birthDate) missingFields.push('Data de Nascimento');
    if (!weight) missingFields.push('Peso (kg)');
    if (!height) missingFields.push('Altura (cm)');

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Preencha: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const patientInsert = {
        nutritionist_id: nutritionistId,
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
      };

      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert(patientInsert)
        .select('id')
        .single();

      if (patientError) throw patientError;

      if (weight || height) {
        const { error: anthropError } = await supabase
          .from('anthropometrics')
          .insert({
            patient_id: patient.id,
            weight_kg: weight ? parseFloat(weight) : null,
            height_cm: height ? parseFloat(height) : null,
          });

        if (anthropError) {
          console.error('Error creating anthropometric record:', anthropError);
        }
      }

      toast({
        title: "Paciente cadastrado!",
        description: `${fullName} foi adicionado com sucesso.`,
      });

      navigate(`/pacientes/${patient.id}`);
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cyber Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard')}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <NeonText as="h1" color="primary" className="font-bold text-lg">
              Novo Paciente
            </NeonText>
            <p className="text-xs text-muted-foreground">Preencha a anamnese inicial</p>
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="paciente@email.com"
                    className="bg-background/50 border-border/50 focus:border-primary"
                    required
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
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50">
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Physical Data */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-success" />
              </div>
              <div>
                <NeonText as="h2" color="primary" className="font-semibold">
                  Medidas Atuais
                </NeonText>
                <p className="text-xs text-muted-foreground">Dados antropométricos iniciais</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70.5"
                  className="bg-background/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  className="bg-background/50 border-border/50 focus:border-primary"
                  required
                />
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
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
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
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
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
                {allergies.filter(a => !commonAllergies.includes(a)).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {allergies.filter(a => !commonAllergies.includes(a)).map((allergy) => (
                      <Badge
                        key={allergy}
                        className="cursor-pointer bg-destructive/20 text-destructive border-destructive/30"
                        onClick={() => toggleAllergy(allergy)}
                      >
                        {allergy}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
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
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Cadastrar Paciente
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
