import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PatientMonitoringTab } from '@/components/monitoring';
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Scale, 
  Target, 
  Heart, 
  FileText,
  Sparkles,
  Calendar,
  Phone,
  Mail,
  Activity,
  TrendingUp,
  Edit,
  Trash2,
  Send,
  Copy,
  Link,
  LineChart
} from 'lucide-react';
import { format, differenceInYears, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  goal: string | null;
  activity_level: string | null;
  allergies: string[] | null;
  dietary_restrictions: string[] | null;
  medical_conditions: string | null;
  notes: string | null;
  created_at: string;
}

interface Anthropometric {
  id: string;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_percentage: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  measured_at: string;
  notes: string | null;
}

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  total_calories: number | null;
  is_active: boolean;
  created_at: string;
}

interface Consultation {
  id: string;
  date_time: string;
  status: string;
  notes: string | null;
}

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde Geral',
  performance: 'Performance',
};

const activityLabels: Record<string, string> = {
  sedentary: 'Sedentário',
  light: 'Leve',
  moderate: 'Moderado',
  active: 'Ativo',
  very_active: 'Muito Ativo',
};

const genderLabels: Record<string, string> = {
  female: 'Feminino',
  male: 'Masculino',
  other: 'Outro',
};

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [anthropometrics, setAnthropometrics] = useState<Anthropometric[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);

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
      // Fetch patient
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch anthropometrics
      const { data: anthropData, error: anthropError } = await supabase
        .from('anthropometrics')
        .select('*')
        .eq('patient_id', id)
        .order('measured_at', { ascending: false });

      if (anthropError) throw anthropError;
      setAnthropometrics(anthropData || []);

      // Fetch meal plans
      const { data: mealData, error: mealError } = await supabase
        .from('meal_plans')
        .select('id, title, description, total_calories, is_active, created_at')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (mealError) throw mealError;
      setMealPlans(mealData || []);

      // Fetch latest weight from weight_logs (ordered by creation time, not date)
      const { data: weightData } = await supabase
        .from('weight_logs')
        .select('weight')
        .eq('patient_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (weightData) {
        setLatestWeight(Number(weightData.weight));
      }

      // Fetch consultations (completed appointments)
      const { data: consultData, error: consultError } = await supabase
        .from('appointments')
        .select('id, date_time, status, notes')
        .eq('patient_id', id)
        .eq('status', 'completed')
        .order('date_time', { ascending: false });

      if (consultError) throw consultError;
      setConsultations(consultData || []);

    } catch (error: any) {
      console.error('Error fetching patient:', error);
      toast({
        title: "Erro ao carregar paciente",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Paciente removido",
        description: "O paciente foi removido com sucesso.",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerateMealPlan = () => {
    navigate(`/patients/${id}/meal-plan/generate`);
  };

  const handleSendMagicLink = async () => {
    if (!patient?.email) {
      toast({
        title: "Email não cadastrado",
        description: "Cadastre o email do paciente para enviar o link de acesso.",
        variant: "destructive",
      });
      return;
    }

    setSendingMagicLink(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-patient-magic-link', {
        body: {
          patientEmail: patient.email,
          patientId: patient.id,
          redirectUrl: `${window.location.origin}/patient-portal`,
        },
      });

      if (error) throw error;

      toast({
        title: "Link enviado!",
        description: `Um email foi enviado para ${patient.email} com o link de acesso.`,
      });
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      toast({
        title: "Erro ao enviar link",
        description: error.message || "Não foi possível enviar o link. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSendingMagicLink(false);
    }
  };

  const handleCopyAccessLink = () => {
    const link = `${window.location.origin}/app/${patient?.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Envie este link para o paciente visualizar sua dieta.",
    });
  };

  const latestAnthropometric = anthropometrics[0];
  
  // Get the latest non-null height from anthropometrics
  const latestHeight = anthropometrics.find(a => a.height_cm !== null)?.height_cm || null;
  
  // Use weight_logs weight (same as chart) or fall back to anthropometrics
  const displayWeight = latestWeight ?? latestAnthropometric?.weight_kg ?? null;
  
  const age = patient?.birth_date 
    ? differenceInYears(new Date(), new Date(patient.birth_date))
    : null;

  const calculateBMI = () => {
    if (displayWeight && latestHeight) {
      const heightM = latestHeight / 100;
      return (displayWeight / (heightM * heightM)).toFixed(1);
    }
    return null;
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-semibold text-primary text-lg">
                  {patient.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="font-bold text-lg">{patient.full_name}</h1>
                <p className="text-xs text-muted-foreground">
                  {age ? `${age} anos` : 'Idade não informada'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate(`/consulta/${id}`)}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Nova Consulta
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm"
                  disabled={sendingMagicLink || !patient.email}
                >
                  {sendingMagicLink ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Enviar Acesso
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Enviar link de acesso?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Um email será enviado para <strong>{patient.email}</strong> com um link mágico. 
                    Ao clicar, o paciente será autenticado e terá acesso ao portal.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSendMagicLink}>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Email
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleCopyAccessLink}
              title="Copiar link de acesso"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate(`/patients/${id}/edit`)}>
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover paciente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os dados do paciente serão removidos permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 text-center">
              <Scale className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {displayWeight || '-'}
                <span className="text-sm font-normal text-muted-foreground"> kg</span>
              </p>
              <p className="text-xs text-muted-foreground">Peso</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 text-center">
              <TrendingUp className="w-5 h-5 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {latestHeight || '-'}
                <span className="text-sm font-normal text-muted-foreground"> cm</span>
              </p>
              <p className="text-xs text-muted-foreground">Altura</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 text-center">
              <Activity className="w-5 h-5 text-info mx-auto mb-2" />
              <p className="text-2xl font-bold">{calculateBMI() || '-'}</p>
              <p className="text-xs text-muted-foreground">IMC</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 text-center">
              <Target className="w-5 h-5 text-warning mx-auto mb-2" />
              <p className="text-sm font-semibold">
                {patient.goal ? goalLabels[patient.goal] : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Objetivo</p>
            </CardContent>
          </Card>
        </div>

        {/* Generate Meal Plan CTA */}
        <Card className="border-0 shadow-md gradient-card overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Gerar Cardápio com IA</h3>
                  <p className="text-sm text-muted-foreground">
                    Baseado na Tabela TACO e dados do paciente
                  </p>
                </div>
              </div>
              <Button 
                variant="hero" 
                size="lg"
                onClick={handleGenerateMealPlan}
                disabled={generatingPlan}
              >
                {generatingPlan ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Cardápio
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="monitoring">
              <LineChart className="w-4 h-4 mr-1.5" />
              Monitoramento
            </TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="plans">Cardápios</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            {/* Contact Info */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.birth_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(parseISO(patient.birth_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                {patient.gender && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{genderLabels[patient.gender] || patient.gender}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity & Goals */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-info" />
                  Objetivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.goal && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Objetivo</p>
                    <Badge variant="secondary">{goalLabels[patient.goal]}</Badge>
                  </div>
                )}
                {patient.activity_level && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nível de Atividade</p>
                    <Badge variant="outline">{activityLabels[patient.activity_level]}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Info */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-destructive" />
                  Saúde
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.allergies && patient.allergies.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Alergias</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {patient.dietary_restrictions && patient.dietary_restrictions.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Restrições Alimentares</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.dietary_restrictions.map((restriction, index) => (
                        <Badge key={index} variant="secondary">
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {patient.medical_conditions && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Condições Médicas</p>
                    <p className="text-sm">{patient.medical_conditions}</p>
                  </div>
                )}
                {patient.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm">{patient.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="mt-4">
            <PatientMonitoringTab patientId={patient.id} />
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-4">
            {/* Consultation History */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Histórico de Consultas
                </CardTitle>
                <CardDescription>
                  Consultas realizadas com este paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {consultations.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Nenhuma consulta registrada</p>
                    <Button onClick={() => navigate(`/consulta/${id}`)}>
                      Iniciar Primeira Consulta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {consultations.map((consultation) => {
                      let parsedNotes = null;
                      try {
                        parsedNotes = consultation.notes ? JSON.parse(consultation.notes) : null;
                      } catch {}
                      
                      return (
                        <div key={consultation.id} className="p-4 rounded-xl bg-muted/50 border border-border/30">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">
                              {format(new Date(consultation.date_time), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                            </p>
                            <Badge variant="secondary" className="text-xs">Concluída</Badge>
                          </div>
                          {parsedNotes && (
                            <div className="text-sm text-muted-foreground space-y-1">
                              {parsedNotes.anamnese?.freeText && (
                                <p className="line-clamp-2">
                                  <strong>Anamnese:</strong> {parsedNotes.anamnese.freeText}
                                </p>
                              )}
                              {parsedNotes.orientacoes && (
                                <p className="line-clamp-1">
                                  <strong>Orientações:</strong> {parsedNotes.orientacoes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Anthropometric History */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="w-5 h-5 text-success" />
                  Histórico de Medidas
                </CardTitle>
                <CardDescription>
                  Acompanhamento antropométrico
                </CardDescription>
              </CardHeader>
              <CardContent>
                {anthropometrics.length === 0 ? (
                  <div className="text-center py-8">
                    <Scale className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma medida registrada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {anthropometrics.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(record.measured_at), "d 'de' MMM, yyyy", { locale: ptBR })}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            {record.weight_kg && (
                              <span className="font-semibold">{record.weight_kg} kg</span>
                            )}
                            {record.height_cm && (
                              <span className="text-muted-foreground">{record.height_cm} cm</span>
                            )}
                            {record.body_fat_percentage && (
                              <span className="text-muted-foreground">{record.body_fat_percentage}% gordura</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="mt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Cardápios
                </CardTitle>
                <CardDescription>
                  Planos alimentares gerados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mealPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Nenhum cardápio gerado ainda</p>
                    <Button onClick={handleGenerateMealPlan}>
                      <Sparkles className="mr-2 w-4 h-4" />
                      Gerar Primeiro Cardápio
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mealPlans.map((plan) => (
                      <div 
                        key={plan.id} 
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => navigate(`/patients/${id}/meal-plan/${plan.id}`)}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{plan.title}</h4>
                            {plan.is_active && (
                              <Badge variant="default" className="text-xs">Ativo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(plan.created_at), "d 'de' MMM, yyyy", { locale: ptBR })}
                            {plan.total_calories && ` • ${plan.total_calories} kcal`}
                          </p>
                        </div>
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
