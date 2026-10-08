import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PatientMonitoringTab, PatientEvolutionCard } from '@/components/monitoring';
import { CriticalTagsBadges } from '@/components/CriticalTagsBadges';
import PatientReportDocument from '@/components/PatientReportDocument';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { NutritionistChat } from '@/components/NutritionistChat';
import { PatientPreviewModal } from '@/components/PatientPreviewModal';
import { useNotifications } from '@/hooks/useNotifications';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
  LineChart,
  Download,
  MessageCircle,
  KeyRound,
  UserCheck,
  Bell,
  BellOff,
  Eye
} from 'lucide-react';
import { format, differenceInYears, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  critical_tags: string[] | null;
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
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [anthropometrics, setAnthropometrics] = useState<Anthropometric[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [initialWeight, setInitialWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [nutritionistName, setNutritionistName] = useState<string>('');
  const [nutritionist, setNutritionist] = useState<any>(null);
  const [nutritionistId, setNutritionistId] = useState<string | null>(null);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [bodyFatLogs, setBodyFatLogs] = useState<any[]>([]);
  const [latestMealPlan, setLatestMealPlan] = useState<any>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const { permission, requestPermission, isSupported } = useNotifications(nutritionistId);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchPatientData();
      fetchUnreadMessages();
    }
  }, [user, id]);

  // Subscribe to new messages for unread count
  useEffect(() => {
    if (!id || !nutritionistId) return;

    const channel = supabase
      .channel(`unread-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `patient_id=eq.${id}`,
        },
        () => {
          fetchUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, nutritionistId]);

  const fetchUnreadMessages = async () => {
    if (!id || !nutritionistId) return;
    
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', id)
      .eq('nutritionist_id', nutritionistId)
      .eq('sender_type', 'patient')
      .eq('is_read', false);

    setUnreadMessages(count || 0);
  };

  const fetchPatientData = async () => {
    try {
      const { data: nutriData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      if (nutriData) {
        setNutritionistName(nutriData.full_name);
        setNutritionist(nutriData);
        setNutritionistId(nutriData.id);
      }

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      const { data: anthropData, error: anthropError } = await supabase
        .from('anthropometrics')
        .select('*')
        .eq('patient_id', id)
        .order('measured_at', { ascending: false });

      if (anthropError) throw anthropError;
      setAnthropometrics(anthropData || []);

      const { data: mealData, error: mealError } = await supabase
        .from('meal_plans')
        .select('id, title, description, total_calories, is_active, created_at, plan_data')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (mealError) throw mealError;
      setMealPlans(mealData || []);
      if (mealData && mealData.length > 0) {
        setLatestMealPlan(mealData[0]);
      }

      const { data: allWeightData } = await supabase
        .from('weight_logs')
        .select('weight, recorded_at')
        .eq('patient_id', id)
        .order('recorded_at', { ascending: false });
      
      if (allWeightData) {
        setWeightLogs(allWeightData);
        if (allWeightData.length > 0) {
          setLatestWeight(Number(allWeightData[0].weight));
        }
        if (allWeightData.length > 1) {
          setInitialWeight(Number(allWeightData[allWeightData.length - 1].weight));
        }
      }

      const { data: bodyFatData } = await supabase
        .from('anthropometrics')
        .select('body_fat_percentage, measured_at')
        .eq('patient_id', id)
        .not('body_fat_percentage', 'is', null)
        .order('measured_at', { ascending: false });
      
      if (bodyFatData) {
        setBodyFatLogs(bodyFatData);
      }

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
    navigate(`/gerar-cardapio/${id}`);
  };

  const handleGenerateAccess = async () => {
    if (!patient?.email) {
      toast({
        title: "Email não cadastrado",
        description: "Cadastre o email do paciente para liberar o acesso.",
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

      const responseData = data as { success?: boolean; message?: string; userCreated?: boolean; emailSent?: boolean };

      if (responseData?.userCreated) {
        toast({
          title: "Acesso liberado! ✨",
          description: `Conta criada para ${patient.email}. ${responseData.emailSent ? 'Um link de acesso foi enviado por email.' : 'O paciente pode fazer login na página de pacientes.'}`,
        });
      } else {
        toast({
          title: "Link enviado!",
          description: `Um email foi enviado para ${patient.email} com o link de acesso.`,
        });
      }
      
      // Refresh patient data to see the updated user_id
      fetchPatientData();
    } catch (error: any) {
      console.error('Error generating access:', error);
      toast({
        title: "Erro ao gerar acesso",
        description: error.message || "Não foi possível liberar o acesso. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSendingMagicLink(false);
    }
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

  const handleCopyPortalLink = () => {
    const portalUrl = `https://nutriflow.inf.br/paciente/${patient?.id}`;
    navigator.clipboard.writeText(portalUrl);
    toast({
      title: "Link copiado!",
      description: "Link de acesso seguro gerado via infraestrutura NutriFlow.",
    });
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !patient) return;
    
    setExportingPDF(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }
      
      pdf.save(`Relatorio_${patient.full_name.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
      
      toast({
        title: "PDF exportado!",
        description: "O relatório foi salvo com sucesso.",
      });
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive",
      });
    } finally {
      setExportingPDF(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!patient) return;
    
    const weightDiff = latestWeight && initialWeight ? latestWeight - initialWeight : null;
    const portalUrl = `https://nutriflow.inf.br/paciente/${patient.id}`;
    
    let message = `🌿 *${nutritionistName || 'Seu Nutricionista'}*\n\n`;
    message += `Olá, ${patient.full_name.split(' ')[0]}! 👋\n\n`;
    message += `📊 *Resumo da sua Evolução:*\n`;
    
    if (latestWeight) {
      message += `• Peso atual: *${latestWeight} kg*\n`;
    }
    
    if (weightDiff !== null) {
      if (weightDiff < 0) {
        message += `🎉 Parabéns! Você eliminou *${Math.abs(weightDiff).toFixed(1)}kg*!\n`;
      } else if (weightDiff > 0) {
        message += `• Ganho de peso: *+${weightDiff.toFixed(1)}kg*\n`;
      } else {
        message += `• Peso mantido! ✨\n`;
      }
    }
    
    if (latestMealPlan) {
      message += `\n📋 Seu cardápio "${latestMealPlan.title}" está disponível no portal.\n`;
    }
    
    message += `\n🔗 Acesse seu portal:\n${portalUrl}\n`;
    message += `\n_Continue firme! Estou aqui para te ajudar._`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const latestAnthropometric = anthropometrics[0];
  const latestHeight = anthropometrics.find(a => a.height_cm !== null)?.height_cm || null;
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">Carregando paciente...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cyber Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center glow-primary">
                <span className="font-bold text-primary text-xl">
                  {patient.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <NeonText as="h1" color="primary" className="text-lg font-bold">
                  {patient.full_name}
                </NeonText>
                <p className="text-xs text-muted-foreground">
                  {age ? `${age} anos` : 'Idade não informada'} • {patient.goal ? goalLabels[patient.goal] : 'Objetivo não definido'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/editar-paciente/${id}`)}
                    className="border-border/50 hover:border-primary/50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar paciente</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button 
              onClick={() => navigate(`/consulta/${id}`)}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <FileText className="w-4 h-4" />
              Nova Consulta
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Critical Tags */}
        {patient.critical_tags && patient.critical_tags.length > 0 && (
          <GlassCard className="p-4 border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive mb-2">Tags Críticas</p>
                <CriticalTagsBadges tags={patient.critical_tags} />
              </div>
            </div>
          </GlassCard>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {displayWeight ? `${displayWeight}kg` : '-'}
                </p>
                <p className="text-xs text-muted-foreground">Peso Atual</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {latestHeight ? `${latestHeight}cm` : '-'}
                </p>
                <p className="text-xs text-muted-foreground">Altura</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {calculateBMI() || '-'}
                </p>
                <p className="text-xs text-muted-foreground">IMC</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {latestAnthropometric?.body_fat_percentage ? `${latestAnthropometric.body_fat_percentage}%` : '-'}
                </p>
                <p className="text-xs text-muted-foreground">% Gordura</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <GlassCard className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Botão principal de gerar acesso - destacado */}
            <Button 
              onClick={handleGenerateAccess}
              disabled={sendingMagicLink || !patient.email}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
            >
              {sendingMagicLink ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              Gerar Acesso ao Portal
            </Button>
            
            <Button 
              onClick={handleGenerateMealPlan}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Cardápio IA
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleCopyPortalLink}
              className="gap-2 border-border/50 hover:border-primary/50"
            >
              <Link className="w-4 h-4" />
              Copiar Link Portal
            </Button>

            <Button 
              variant="outline"
              onClick={handleShareWhatsApp}
              className="gap-2 border-border/50 hover:border-success/50 hover:text-success"
            >
              <MessageCircle className="w-4 h-4" />
              Compartilhar WhatsApp
            </Button>

            <Button 
              variant="outline"
              onClick={() => setPreviewModalOpen(true)}
              className="gap-2 border-border/50 hover:border-info/50 hover:text-info"
            >
              <Eye className="w-4 h-4" />
              Visualizar como Paciente
            </Button>

            <Button 
              variant="outline"
              onClick={handleExportPDF}
              disabled={exportingPDF}
              className="gap-2 border-border/50 hover:border-primary/50"
            >
              {exportingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Exportar PDF
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="icon"
                  className="border-border/50 hover:border-destructive/50 hover:text-destructive ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-border/50">
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover paciente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os dados do paciente serão permanentemente removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border/50">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </GlassCard>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="glass border border-border/50 p-1 flex-wrap">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-primary/20">
              Monitoramento
            </TabsTrigger>
            <TabsTrigger value="mealplans" className="data-[state=active]:bg-primary/20">
              Cardápios
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary/20 gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
              {unreadMessages > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                  {unreadMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary/20">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Patient Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <NeonText as="h3" color="primary" className="font-semibold">
                    Dados Pessoais
                  </NeonText>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-foreground">{patient.email || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Telefone</span>
                    <span className="text-foreground">{patient.phone || '-'}</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-destructive" />
                  </div>
                  <NeonText as="h3" color="primary" className="font-semibold">
                    Saúde & Restrições
                  </NeonText>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-2">Alergias</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies && patient.allergies.length > 0 ? (
                        patient.allergies.map((allergy, i) => (
                          <Badge key={i} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Nenhuma</span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="monitoring">
            <PatientMonitoringTab patientId={id!} />
          </TabsContent>

          <TabsContent value="mealplans" className="space-y-4">
            {mealPlans.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Sparkles className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                <NeonText as="h3" color="primary" className="text-lg font-semibold mb-2">
                  Nenhum cardápio criado
                </NeonText>
                <p className="text-muted-foreground mb-6">
                  Crie o primeiro cardápio personalizado com IA
                </p>
                <Button onClick={handleGenerateMealPlan} className="gap-2 bg-gradient-to-r from-primary to-accent">
                  <Sparkles className="w-4 h-4" />
                  Gerar Cardápio IA
                </Button>
              </GlassCard>
            ) : (
              <div className="grid gap-4">
                {mealPlans.map((plan) => (
                  <GlassCard
                    key={plan.id}
                    className="p-4 cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => navigate(`/cardapio/${plan.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{plan.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(plan.created_at), "d 'de' MMMM", { locale: ptBR })}
                            {plan.total_calories && ` • ${plan.total_calories} kcal`}
                          </p>
                        </div>
                      </div>
                      {plan.is_active && (
                        <Badge className="bg-success/20 text-success border-success/30">
                          Ativo
                        </Badge>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <NeonText as="h3" color="primary" className="font-semibold">
                    Chat com {patient.full_name.split(' ')[0]}
                  </NeonText>
                </div>
                {isSupported && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestPermission}
                    className={cn(
                      "gap-2 border-border/50",
                      permission === 'granted' 
                        ? "text-success border-success/50" 
                        : "hover:border-primary/50"
                    )}
                  >
                    {permission === 'granted' ? (
                      <>
                        <Bell className="w-4 h-4" />
                        Notificações ativas
                      </>
                    ) : (
                      <>
                        <BellOff className="w-4 h-4" />
                        Ativar notificações
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {nutritionistId && (
                <NutritionistChat 
                  patientId={id!}
                  patientName={patient.full_name}
                  nutritionistId={nutritionistId}
                />
              )}
            </GlassCard>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {consultations.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Calendar className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                <NeonText as="h3" color="primary" className="text-lg font-semibold mb-2">
                  Nenhuma consulta realizada
                </NeonText>
                <p className="text-muted-foreground mb-6">
                  Inicie a primeira consulta do paciente
                </p>
                <Button 
                  onClick={() => navigate(`/consulta/${id}`)} 
                  className="gap-2 bg-gradient-to-r from-primary to-accent"
                >
                  <FileText className="w-4 h-4" />
                  Nova Consulta
                </Button>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <GlassCard key={consultation.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          Consulta em {format(new Date(consultation.date_time), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(consultation.date_time), 'HH:mm')}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-success/20 text-success">
                        Concluída
                      </Badge>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Hidden PDF Report */}
      <div className="absolute left-[-9999px] top-0">
        <PatientReportDocument
          ref={reportRef}
          patient={patient}
          nutritionist={nutritionist || { full_name: nutritionistName }}
          weightRecords={weightLogs}
          bodyFatRecords={bodyFatLogs}
          latestMealPlan={latestMealPlan}
          currentWeight={latestWeight}
          initialWeight={initialWeight}
          currentBodyFat={bodyFatLogs[0]?.body_fat_percentage}
          initialBodyFat={bodyFatLogs[bodyFatLogs.length - 1]?.body_fat_percentage}
          height={latestHeight}
        />
      </div>

      {/* Patient Preview Modal */}
      <PatientPreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        patientId={id!}
        patientName={patient.full_name}
      />
    </div>
  );
}
