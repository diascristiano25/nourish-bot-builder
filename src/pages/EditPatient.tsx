import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Plus, X, User, Activity, Heart, Scale, Save, AlertTriangle } from 'lucide-react';
import { CriticalTagsBadges } from '@/components/CriticalTagsBadges';

const commonAllergies = ['Glúten', 'Lactose', 'Amendoim', 'Nozes', 'Soja', 'Ovos', 'Frutos do mar', 'Mariscos'];
const commonRestrictions = ['Vegetariano', 'Vegano', 'Sem carne vermelha', 'Kosher', 'Halal', 'Low carb', 'Cetogênica'];

export default function EditPatient() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">Editar Paciente</h1>
            <p className="text-xs text-muted-foreground">Atualizar dados da anamnese</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                  <CardDescription>Informações básicas do paciente</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Maria da Silva"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals & Activity */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-info" />
                </div>
                <div>
                  <CardTitle className="text-lg">Objetivo & Atividade</CardTitle>
                  <CardDescription>Metas e nível de atividade física</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentário</SelectItem>
                    <SelectItem value="light">Leve (1-2x/semana)</SelectItem>
                    <SelectItem value="moderate">Moderado (3-4x/semana)</SelectItem>
                    <SelectItem value="active">Ativo (5-6x/semana)</SelectItem>
                    <SelectItem value="very_active">Muito Ativo (atleta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Critical Tags */}
          <Card className="border-0 shadow-md border-l-4 border-l-warning">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-lg">Tags Críticas</CardTitle>
                  <CardDescription>Alertas importantes que aparecem no cardápio</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CriticalTagsBadges 
                tags={criticalTags} 
                onChange={setCriticalTags} 
                editable={true}
                showLabel={false}
              />
            </CardContent>
          </Card>

          {/* Health Info */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-lg">Informações de Saúde</CardTitle>
                  <CardDescription>Alergias, restrições e condições médicas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Allergies */}
              <div className="space-y-3">
                <Label>Alergias Alimentares</Label>
                <div className="flex flex-wrap gap-2">
                  {commonAllergies.map((allergy) => (
                    <Badge
                      key={allergy}
                      variant={allergies.includes(allergy) ? "default" : "outline"}
                      className="cursor-pointer transition-all"
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
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCustomAllergy}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {allergies.filter(a => !commonAllergies.includes(a)).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {allergies.filter(a => !commonAllergies.includes(a)).map((allergy) => (
                      <Badge
                        key={allergy}
                        variant="default"
                        className="cursor-pointer"
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
                      className="cursor-pointer transition-all"
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
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCustomRestriction}>
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
                  placeholder="Diabetes, hipertensão, etc."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotações gerais sobre o paciente..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="hero" 
            size="xl" 
            className="w-full"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Salvar Alterações
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
