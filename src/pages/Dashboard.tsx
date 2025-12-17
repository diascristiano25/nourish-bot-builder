import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/AppLayout';
import { SupportDialog } from '@/components/SupportDialog';
import { OnboardingTour } from '@/components/OnboardingTour';
import { 
  Plus, 
  Users, 
  Calendar,
  Clock,
  ChevronRight,
  Loader2,
  Settings2,
  Sparkles,
  Eye,
  EyeOff,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useWidgetPreferences, WidgetPreferences } from '@/hooks/useWidgetPreferences';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  goal: string | null;
  created_at: string;
}

interface NutritionistProfile {
  id: string;
  full_name: string;
  crn: string | null;
}

interface Appointment {
  id: string;
  date_time: string;
  patient: {
    id: string;
    full_name: string;
  };
}

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde',
  performance: 'Performance',
};

function getGreeting(): string {
  // Get current hour in Brasilia timezone (America/Sao_Paulo)
  const brasiliaHour = new Date().toLocaleString('en-US', {
    timeZone: 'America/Sao_Paulo',
    hour: 'numeric',
    hour12: false
  });
  const hour = parseInt(brasiliaHour, 10);
  
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const { preferences, updatePreference, loaded: prefsLoaded } = useWidgetPreferences();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('nutritionists')
        .select('id, full_name, crn')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('nutritionists')
          .insert({ 
            user_id: user!.id, 
            full_name: user!.user_metadata?.full_name || 'Nutricionista' 
          })
          .select('id, full_name, crn')
          .single();
        
        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(profileData);
      }

      if (profileData || profile) {
        const nutritionistId = profileData?.id || profile?.id;
        
        // Fetch patients
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, full_name, email, goal, created_at')
          .eq('nutritionist_id', nutritionistId)
          .order('created_at', { ascending: false });

        if (patientsError) throw patientsError;
        setPatients(patientsData || []);

        // Fetch upcoming appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            date_time,
            patient:patients(id, full_name)
          `)
          .eq('nutritionist_id', nutritionistId)
          .eq('status', 'scheduled')
          .gte('date_time', new Date().toISOString())
          .order('date_time')
          .limit(3);

        if (appointmentsError) throw appointmentsError;
        
        const formattedAppointments = (appointmentsData || []).map(item => ({
          ...item,
          patient: Array.isArray(item.patient) ? item.patient[0] : item.patient
        }));
        setAppointments(formattedAppointments as Appointment[]);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const recentPatients = patients.slice(0, 5);

  if (authLoading || loading || !prefsLoaded) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const widgetLabels: Record<keyof WidgetPreferences, string> = {
    agenda: 'Próximos Pacientes',
    recentPatients: 'Pacientes Recentes',
    quickActions: 'Atalhos Rápidos',
    stats: 'Estatísticas',
  };

  return (
    <AppLayout>
      {/* Onboarding Tour */}
      {profile && <OnboardingTour nutritionistId={profile.id} />}
      
      <div className="min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50">
          <div className="px-8 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {getGreeting()}, Dr(a). {profile ? getFirstName(profile.full_name) : 'Nutricionista'}.
              </h1>
              <p className="text-sm text-muted-foreground">Hoje é dia de foco.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Support Dialog */}
              {profile && <SupportDialog nutritionistId={profile.id} />}
              
              {/* Zen Mode Toggle */}
              <Button
                variant={zenMode ? "default" : "outline"}
                size="sm"
                onClick={() => setZenMode(!zenMode)}
                className="rounded-lg gap-2"
              >
                {zenMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                Modo Zen
              </Button>
              
              {/* Customize Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-lg gap-2">
                    <Settings2 className="w-4 h-4" />
                    Personalizar
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Personalizar Dashboard</SheetTitle>
                    <SheetDescription>
                      Escolha quais widgets exibir
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {(Object.keys(preferences) as Array<keyof WidgetPreferences>).map((key) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-border/50">
                        <span className="text-sm font-medium">{widgetLabels[key]}</span>
                        <Switch
                          checked={preferences[key]}
                          onCheckedChange={(checked) => updatePreference(key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* Quick Stats - Only show when not in Zen mode */}
          {!zenMode && preferences.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
              <Card className="bg-card border-border/50">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Pacientes</p>
                  <p className="text-3xl font-semibold mt-2 text-foreground">{patients.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Consultas Hoje</p>
                  <p className="text-3xl font-semibold mt-2 text-foreground">—</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Esta Semana</p>
                  <p className="text-3xl font-semibold mt-2 text-foreground">—</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Cardápios Ativos</p>
                  <p className="text-3xl font-semibold mt-2 text-foreground">—</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Grid */}
          <div className={zenMode ? "max-w-2xl mx-auto" : "grid lg:grid-cols-3 gap-6"}>
            {/* Quick Actions */}
            {preferences.quickActions && (
              <Card className="bg-card border-border/50 animate-slide-up lg:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Atalhos Rápidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start h-12 rounded-lg text-sm font-medium"
                    onClick={() => navigate('/consulta')}
                    data-tour="ai-consultation"
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    Nova Consulta
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full justify-start h-12 rounded-lg text-sm font-medium border-border/50 hover:bg-primary/5 hover:border-primary/30"
                    onClick={() => navigate('/patients/new')}
                    data-tour="new-patient"
                  >
                    <Users className="w-4 h-4 mr-3 text-primary" />
                    Cadastrar Paciente
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full justify-start h-12 rounded-lg text-sm font-medium"
                    onClick={() => navigate('/profile')}
                    data-tour="profile-settings"
                  >
                    <User className="w-4 h-4 mr-3 text-muted-foreground" />
                    Configurar Perfil
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Appointments */}
            {preferences.agenda && (
              <Card className="bg-card border-border/50 animate-slide-up lg:col-span-1" style={{ animationDelay: '0.05s' }}>
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Próximos Pacientes
                  </CardTitle>
                  {appointments.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => navigate('/agenda')}
                    >
                      Ver agenda
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Nenhuma consulta agendada</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="mt-2 h-auto p-0 text-primary"
                        onClick={() => navigate('/agenda')}
                      >
                        Agendar consulta
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate('/agenda')}
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {apt.patient?.full_name || 'Paciente'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(apt.date_time), "d 'de' MMM, HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Patients */}
            {preferences.recentPatients && (
              <Card className="bg-card border-border/50 animate-slide-up lg:col-span-1" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Pacientes Recentes
                  </CardTitle>
                  {patients.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => navigate('/patients')}
                    >
                      Ver todos
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {recentPatients.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Nenhum paciente ainda</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="mt-2 h-auto p-0 text-primary"
                        onClick={() => navigate('/patients/new')}
                      >
                        Adicionar primeiro paciente
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recentPatients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {patient.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{patient.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {goalLabels[patient.goal || ''] || 'Sem objetivo'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
