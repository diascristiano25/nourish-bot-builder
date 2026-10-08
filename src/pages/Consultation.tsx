import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/AppLayout';
import { ConsultationMealPlanEditor } from '@/components/ConsultationMealPlanEditor';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText,
  User,
  Ruler,
  Activity,
  Utensils,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Wand2,
  Heart,
  CheckCircle2,
  Search,
  UserCheck,
  ChevronsUpDown,
  Check,
  UserPlus,
  Stethoscope,
  ClipboardList,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StructuredData {
  name: string;
  age: string;
  weight: string;
  height: string;
  waist: string;
  hip: string;
  bodyFat: string;
  habits: string;
  preferences: string;
  restrictions: string;
  healthConditions: string;
}

interface Patient {
  id: string;
  full_name: string;
}

export default function Consultation() {
  const navigate = useNavigate();
  const { patientId: urlPatientId } = useParams<{ patientId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activePhase, setActivePhase] = useState<string>('anamnese');
  const [viewMode, setViewMode] = useState<'freeflow' | 'structured'>('freeflow');
  const [freeText, setFreeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(urlPatientId || null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>('');
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientSelectorOpen, setPatientSelectorOpen] = useState(false);
  
  const [structuredData, setStructuredData] = useState<StructuredData>({
    name: '',
    age: '',
    weight: '',
    height: '',
    waist: '',
    hip: '',
    bodyFat: '',
    habits: '',
    preferences: '',
    restrictions: '',
    healthConditions: '',
  });

  const [examesText, setExamesText] = useState('');
  const [orientacoesText, setOrientacoesText] = useState('');
  const [mealPlanData, setMealPlanData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      
      try {
        const { data: nutri } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!nutri) return;
        
        const { data, error } = await supabase
          .from('patients')
          .select('id, full_name')
          .eq('nutritionist_id', nutri.id)
          .order('full_name');
        
        if (error) throw error;
        setPatients(data || []);
        
        if (urlPatientId && data) {
          const patient = data.find(p => p.id === urlPatientId);
          if (patient) {
            setSelectedPatientName(patient.full_name);
          }
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoadingPatients(false);
      }
    };
    
    fetchPatients();
  }, [user, urlPatientId]);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatientName(patient.full_name);
      setStructuredData(prev => ({ ...prev, name: patient.full_name }));
    }
  };

  const handleFinalizeConsultation = async () => {
    if (!selectedPatientId) {
      toast({
        title: 'Paciente não selecionado',
        description: 'Selecione um paciente antes de finalizar a consulta.',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Não autenticado',
        description: 'Faça login para salvar a consulta.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const { data: nutri, error: nutriError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (nutriError || !nutri) throw new Error('Nutricionista não encontrado');

      if (structuredData.weight) {
        const weightValue = parseFloat(structuredData.weight.replace(',', '.'));
        const today = new Date().toISOString().split('T')[0];
        
        const { data: existingLog } = await supabase
          .from('weight_logs')
          .select('id')
          .eq('patient_id', selectedPatientId)
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
              patient_id: selectedPatientId,
              weight: weightValue,
              measured_at: today,
            });
        }
      }

      const hasAnyMeasurement = structuredData.weight || structuredData.height || 
                                structuredData.waist || structuredData.hip || structuredData.bodyFat;
      
      if (hasAnyMeasurement) {
        await supabase
          .from('anthropometrics')
          .insert({
            patient_id: selectedPatientId,
            notes: 'Registro via consulta',
            weight_kg: structuredData.weight ? parseFloat(structuredData.weight.replace(',', '.')) : undefined,
            height_cm: structuredData.height ? parseFloat(structuredData.height.replace(',', '.')) : undefined,
            waist_cm: structuredData.waist ? parseFloat(structuredData.waist.replace(',', '.')) : undefined,
            hip_cm: structuredData.hip ? parseFloat(structuredData.hip.replace(',', '.')) : undefined,
            body_fat_percentage: structuredData.bodyFat ? parseFloat(structuredData.bodyFat.replace(',', '.')) : undefined,
          });
      }

      if (structuredData.healthConditions) {
        await supabase
          .from('patients')
          .update({ medical_conditions: structuredData.healthConditions })
          .eq('id', selectedPatientId);
      }

      const consultationNotes = JSON.stringify({
        anamnese: {
          freeText,
          structured: structuredData
        },
        exames: examesText,
        orientacoes: orientacoesText,
        mealPlan: mealPlanData
      });

      await supabase
        .from('appointments')
        .insert({
          patient_id: selectedPatientId,
          nutritionist_id: nutri.id,
          scheduled_at: new Date().toISOString(),
          status: 'completed',
          notes: consultationNotes
        });

      await supabase
        .from('financial_records')
        .insert({
          nutritionist_id: nutri.id,
          record_type: 'Receita',
          amount: 150.00,
          description: `Consulta - ${selectedPatientName}`,
          record_date: new Date().toISOString().split('T')[0],
          status: 'completed'
        });
      
      toast({
        title: '✅ Consulta finalizada!',
        description: `Todos os dados de ${selectedPatientName} foram salvos.`,
      });

      navigate(`/pacientes/${selectedPatientId}`);
      
    } catch (error: any) {
      console.error('Error saving consultation:', error);
      toast({
        title: 'Erro ao salvar consulta',
        description: error.message || 'Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMealPlanSave = (planData: any) => {
    setMealPlanData(planData);
    toast({
      title: 'Plano atualizado',
      description: 'Dados do plano alimentar foram atualizados.',
    });
  };

  const handleStructuredChange = (field: keyof StructuredData, value: string) => {
    setStructuredData(prev => ({ ...prev, [field]: value }));
  };

  const parseTextToData = async () => {
    if (!freeText.trim()) {
      toast({
        title: 'Texto vazio',
        description: 'Digite algo na anamnese livre antes de analisar.',
        variant: 'destructive'
      });
      return;
    }

    setIsParsing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const textUpper = freeText.toUpperCase();
    const newData: Partial<StructuredData> = {};
    
    if (textUpper.includes('DIABETES')) {
      newData.healthConditions = 'Diabetes Tipo 2';
    }
    
    if (textUpper.includes('VEGETARIANO') || textUpper.includes('VEGETARIANA')) {
      newData.habits = 'Dieta Vegetariana';
    }
    
    const weightPatterns = [
      /PESA\s*(\d+(?:[.,]\d+)?)/i,
      /(\d+(?:[.,]\d+)?)\s*KG/i,
      /COM\s*(\d+(?:[.,]\d+)?)\s*(?:KG)?/i,
    ];
    
    for (const pattern of weightPatterns) {
      const weightMatch = freeText.match(pattern);
      if (weightMatch) {
        newData.weight = weightMatch[1].replace(',', '.');
        break;
      }
    }
    
    const ageMatch = textUpper.match(/(\d+)\s*ANOS/);
    if (ageMatch) {
      newData.age = ageMatch[1];
    }
    
    const heightMatch = freeText.match(/1[,.](\d{2})/);
    if (heightMatch) {
      newData.height = `1${heightMatch[1]}`;
    }
    
    setStructuredData(prev => ({
      ...prev,
      ...newData
    }));
    
    setIsParsing(false);
    setHasParsed(true);
    setViewMode('structured');
    
    const fieldsFound = Object.keys(newData).length;
    toast({
      title: '✨ Análise concluída!',
      description: fieldsFound > 0 
        ? `${fieldsFound} campo(s) preenchido(s) automaticamente.`
        : 'Nenhum dado reconhecido. Use palavras-chave como DIABETES, PESA XX.',
    });
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border/50">
          <div className="px-4 md:px-8 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10"
                  onClick={() => navigate(selectedPatientId ? `/pacientes/${selectedPatientId}` : '/dashboard')}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <NeonText as="h1" color="primary" className="text-lg font-semibold">
                    {selectedPatientName ? 'Consulta de Retorno' : 'Nova Consulta'}
                  </NeonText>
                  <p className="text-xs text-muted-foreground">
                    {selectedPatientName || 'Selecione um paciente para começar'}
                  </p>
                </div>
              </div>
              <Button 
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                onClick={handleFinalizeConsultation}
                disabled={isSaving || !selectedPatientId}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Finalizar
                  </>
                )}
              </Button>
            </div>
            
            {/* Patient Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCheck className="w-4 h-4" />
                <span>Paciente:</span>
              </div>
              <Popover open={patientSelectorOpen} onOpenChange={setPatientSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-[280px] justify-between bg-background/50 border-border/50"
                    disabled={loadingPatients}
                  >
                    {loadingPatients 
                      ? "Carregando..." 
                      : selectedPatientName || "Selecione o paciente"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 glass border-border/50" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar paciente..." />
                    <CommandList>
                      <CommandEmpty className="py-4 text-center">
                        <p className="text-sm text-muted-foreground mb-3">Nenhum paciente encontrado.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setPatientSelectorOpen(false);
                            navigate('/novo-paciente');
                          }}
                        >
                          <UserPlus className="w-4 h-4" />
                          Novo Paciente
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {patients.map((patient) => (
                          <CommandItem
                            key={patient.id}
                            value={patient.full_name}
                            onSelect={() => {
                              handlePatientSelect(patient.id);
                              setPatientSelectorOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPatientId === patient.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {patient.full_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          <Tabs value={activePhase} onValueChange={setActivePhase} className="space-y-6">
            <TabsList className="glass border border-border/50 p-1">
              <TabsTrigger value="anamnese" className="gap-2 data-[state=active]:bg-primary/20">
                <Stethoscope className="w-4 h-4" />
                Anamnese
              </TabsTrigger>
              <TabsTrigger value="exames" className="gap-2 data-[state=active]:bg-primary/20">
                <ClipboardList className="w-4 h-4" />
                Exames
              </TabsTrigger>
              <TabsTrigger value="cardapio" className="gap-2 data-[state=active]:bg-primary/20">
                <Utensils className="w-4 h-4" />
                Cardápio
              </TabsTrigger>
              <TabsTrigger value="orientacoes" className="gap-2 data-[state=active]:bg-primary/20">
                <FileText className="w-4 h-4" />
                Orientações
              </TabsTrigger>
            </TabsList>

            {/* Anamnese */}
            <TabsContent value="anamnese" className="space-y-6">
              <div className="flex items-center justify-between">
                <NeonText as="h2" color="primary" className="text-xl font-semibold">
                  Anamnese Nutricional
                </NeonText>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'freeflow' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('freeflow')}
                    className="gap-2"
                  >
                    <ToggleLeft className="w-4 h-4" />
                    Livre
                  </Button>
                  <Button
                    variant={viewMode === 'structured' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('structured')}
                    className="gap-2"
                  >
                    <ToggleRight className="w-4 h-4" />
                    Estruturado
                  </Button>
                </div>
              </div>

              {viewMode === 'freeflow' ? (
                <GlassCard className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Anamnese livre - digite naturalmente</span>
                    </div>
                    <Textarea
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      placeholder="Ex: Maria, 35 anos, pesa 72kg, altura 1,65m. Diabética tipo 2, vegetariana há 3 anos..."
                      className="min-h-[300px] bg-background/50 border-border/50 focus:border-primary"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {freeText.length} caracteres
                      </p>
                      <Button
                        onClick={parseTextToData}
                        disabled={isParsing || freeText.length < 20}
                        className="gap-2 bg-gradient-to-r from-primary to-accent"
                      >
                        {isParsing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analisando...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            Analisar com IA
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <NeonText as="h3" color="primary" className="font-semibold">
                        Dados do Paciente
                      </NeonText>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input
                            value={structuredData.name}
                            onChange={(e) => handleStructuredChange('name', e.target.value)}
                            className="bg-background/50 border-border/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Idade</Label>
                          <Input
                            value={structuredData.age}
                            onChange={(e) => handleStructuredChange('age', e.target.value)}
                            className="bg-background/50 border-border/50"
                          />
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <Ruler className="w-5 h-5 text-success" />
                      </div>
                      <NeonText as="h3" color="primary" className="font-semibold">
                        Medidas Antropométricas
                      </NeonText>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Peso (kg)</Label>
                        <Input
                          value={structuredData.weight}
                          onChange={(e) => handleStructuredChange('weight', e.target.value)}
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Altura (cm)</Label>
                        <Input
                          value={structuredData.height}
                          onChange={(e) => handleStructuredChange('height', e.target.value)}
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cintura (cm)</Label>
                        <Input
                          value={structuredData.waist}
                          onChange={(e) => handleStructuredChange('waist', e.target.value)}
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quadril (cm)</Label>
                        <Input
                          value={structuredData.hip}
                          onChange={(e) => handleStructuredChange('hip', e.target.value)}
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>% Gordura</Label>
                        <Input
                          value={structuredData.bodyFat}
                          onChange={(e) => handleStructuredChange('bodyFat', e.target.value)}
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-destructive" />
                      </div>
                      <NeonText as="h3" color="primary" className="font-semibold">
                        Condições de Saúde
                      </NeonText>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Condições Médicas</Label>
                        <Textarea
                          value={structuredData.healthConditions}
                          onChange={(e) => handleStructuredChange('healthConditions', e.target.value)}
                          placeholder="Diabetes, hipertensão, etc..."
                          className="bg-background/50 border-border/50 min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hábitos Alimentares</Label>
                        <Textarea
                          value={structuredData.habits}
                          onChange={(e) => handleStructuredChange('habits', e.target.value)}
                          placeholder="Vegetariano, come fora frequentemente, etc..."
                          className="bg-background/50 border-border/50 min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Restrições</Label>
                        <Textarea
                          value={structuredData.restrictions}
                          onChange={(e) => handleStructuredChange('restrictions', e.target.value)}
                          placeholder="Alergias, intolerâncias..."
                          className="bg-background/50 border-border/50 min-h-[80px]"
                        />
                      </div>
                    </div>
                  </GlassCard>
                </div>
              )}
            </TabsContent>

            {/* Exames */}
            <TabsContent value="exames">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-info" />
                  </div>
                  <NeonText as="h3" color="primary" className="font-semibold">
                    Exames e Resultados
                  </NeonText>
                </div>
                <Textarea
                  value={examesText}
                  onChange={(e) => setExamesText(e.target.value)}
                  placeholder="Registre os resultados de exames laboratoriais, bioquímicos, etc..."
                  className="min-h-[300px] bg-background/50 border-border/50 focus:border-primary"
                />
              </GlassCard>
            </TabsContent>

            {/* Cardápio */}
            <TabsContent value="cardapio">
              <ConsultationMealPlanEditor 
                patientId={selectedPatientId || undefined}
                patientName={selectedPatientName}
                onSave={handleMealPlanSave}
              />
            </TabsContent>

            {/* Orientações */}
            <TabsContent value="orientacoes">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <NeonText as="h3" color="primary" className="font-semibold">
                    Orientações ao Paciente
                  </NeonText>
                </div>
                <Textarea
                  value={orientacoesText}
                  onChange={(e) => setOrientacoesText(e.target.value)}
                  placeholder="Dicas de alimentação, lembretes, metas semanais, etc..."
                  className="min-h-[300px] bg-background/50 border-border/50 focus:border-primary"
                />
              </GlassCard>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AppLayout>
  );
}
