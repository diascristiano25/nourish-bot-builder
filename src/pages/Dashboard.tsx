import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from '@/components/AppLayout';
import { SupportDialog } from '@/components/SupportDialog';
import { OnboardingTour } from '@/components/OnboardingTour';
import { TrialAlert } from '@/components/TrialAlert';
import { 
  Plus, Users, Calendar, Clock, ChevronRight, Loader2, Settings2,
  Eye, EyeOff, User, TrendingUp, DollarSign, Activity, Sparkles, Zap, Leaf
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useWidgetPreferences, WidgetPreferences } from '@/hooks/useWidgetPreferences';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';

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
  patient: { id: string; full_name: string };
}

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde',
  performance: 'Performance',
};

function getGreeting(): string {
  const brasiliaHour = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', hour12: false });
  const hour = parseInt(brasiliaHour, 10);
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}

interface ChartDataPoint { month: string; atendimentos: number; }

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthlyAppointments, setMonthlyAppointments] = useState(0);
  const [estimatedRevenue, setEstimatedRevenue] = useState(0);
  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const { preferences, updatePreference, loaded: prefsLoaded } = useWidgetPreferences();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => { if (!authLoading && !user) navigate('/auth'); }, [user, authLoading, navigate]);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles').select('id, full_name, crn').eq('user_id', user!.id).maybeSingle();
      if (profileError) throw profileError;
      
      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles').insert({ user_id: user!.id, full_name: user!.user_metadata?.full_name || 'Nutricionista' })
          .select('id, full_name, crn').single();
        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(profileData);
      }

      if (profileData || profile) {
        const nutritionistId = profileData?.id || profile?.id;
        
        const { data: patientsData } = await supabase
          .from('patients').select('id, full_name, email, goal, created_at')
          .eq('nutritionist_id', nutritionistId).order('created_at', { ascending: false });
        setPatients(patientsData || []);

        const { data: appointmentsData } = await supabase
          .from('appointments').select(`id, date_time, patient:patients(id, full_name)`)
          .eq('nutritionist_id', nutritionistId).eq('status', 'scheduled')
          .gte('date_time', new Date().toISOString()).order('date_time').limit(5);
        
        const formattedAppointments = (appointmentsData || []).map(item => ({
          ...item, patient: Array.isArray(item.patient) ? item.patient[0] : item.patient
        }));
        setAppointments(formattedAppointments as Appointment[]);

        const now = new Date();
        const monthStart = startOfMonth(now).toISOString();
        const monthEnd = endOfMonth(now).toISOString();
        
        const { count: monthlyCount } = await supabase
          .from('appointments').select('*', { count: 'exact', head: true })
          .eq('nutritionist_id', nutritionistId).gte('date_time', monthStart).lte('date_time', monthEnd);
        setMonthlyAppointments(monthlyCount || 0);

        const { data: revenueData } = await supabase
          .from('financial_records').select('amount')
          .eq('nutritionist_id', nutritionistId).eq('record_type', 'Receita')
          .gte('record_date', monthStart).lte('record_date', monthEnd);
        setEstimatedRevenue(revenueData?.reduce((sum, r) => sum + r.amount, 0) || 0);

        const chartMonths: ChartDataPoint[] = [];
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        for (let i = 5; i >= 0; i--) {
          const targetMonth = subMonths(now, i);
          const mStart = startOfMonth(targetMonth).toISOString();
          const mEnd = endOfMonth(targetMonth).toISOString();
          const { count } = await supabase
            .from('appointments').select('*', { count: 'exact', head: true })
            .eq('nutritionist_id', nutritionistId).gte('date_time', mStart).lte('date_time', mEnd);
          chartMonths.push({ month: monthNames[targetMonth.getMonth()], atendimentos: count || 0 });
        }
        setChartData(chartMonths);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const recentPatients = patients.slice(0, 5);

  if (authLoading || loading || !prefsLoaded) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-medium">Carregando...</p>
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

  const chartConfig = {
    atendimentos: { label: "Atendimentos", color: "hsl(var(--primary))" },
  };

  return (
    <AppLayout>
      {profile && <OnboardingTour nutritionistId={profile.id} />}
      
      <div className="min-h-screen bg-background relative">
        {/* Subtle organic background */}
        <div className="absolute inset-0 bg-organic-pattern pointer-events-none" />

        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-xl border-b border-border">
          <div className="px-6 lg:px-8 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-sans font-semibold text-foreground tracking-tight flex items-center gap-2">
                {getGreeting()}, <span className="text-primary">{profile ? getFirstName(profile.full_name) : 'Nutricionista'}</span>
                <Leaf className="w-5 h-5 text-primary/60" />
              </h1>
              <p className="text-sm text-muted-foreground">Vamos transformar vidas hoje.</p>
            </div>
            <div className="flex items-center gap-2">
              {profile && <SupportDialog nutritionistId={profile.id} />}
              
              <Button
                variant={zenMode ? "default" : "outline"}
                size="sm"
                onClick={() => setZenMode(!zenMode)}
                className="rounded-xl gap-2 h-9 px-4 text-sm font-medium"
                data-tour="zen-mode"
              >
                {zenMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline">Modo Zen</span>
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 h-9 px-4 text-sm font-medium" data-tour="customize-dashboard">
                    <Settings2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Personalizar</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-card border-border">
                  <SheetHeader>
                    <SheetTitle className="font-serif">Personalizar Dashboard</SheetTitle>
                    <SheetDescription>Escolha quais widgets exibir</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {(Object.keys(preferences) as Array<keyof WidgetPreferences>).map((key) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-border/50">
                        <span className="text-sm font-medium">{widgetLabels[key]}</span>
                        <Switch checked={preferences[key]} onCheckedChange={(checked) => updatePreference(key, checked)} />
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 relative z-10">
          {/* Trial Alert */}
          {user && <TrialAlert userId={user.id} />}

          {/* Stat Cards */}
          {!zenMode && preferences.stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
              {[
                { icon: Users, label: 'Total de Pacientes', value: patients.length, color: 'text-primary', bg: 'bg-primary/10' },
                { icon: Calendar, label: 'Consultas do Mês', value: monthlyAppointments, color: 'text-secondary', bg: 'bg-secondary/10' },
                { icon: Activity, label: 'Taxa de Adesão', value: '78%', color: 'text-info', bg: 'bg-info/10' },
                { icon: DollarSign, label: 'Faturamento', value: `R$ ${estimatedRevenue.toLocaleString('pt-BR')}`, color: 'text-warning', bg: 'bg-warning/10', trend: true },
              ].map((stat, i) => (
                <div key={i} className="organic-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    {stat.trend && <TrendingUp className="w-4 h-4 text-success" />}
                  </div>
                  <p className="text-2xl lg:text-3xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          {!zenMode && preferences.stats && (
            <div className="organic-card mb-8 animate-fade-in overflow-hidden" style={{ animationDelay: '0.1s' }}>
              <div className="p-6 pb-2">
                <h3 className="text-base font-sans font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Evolução de Atendimentos
                </h3>
              </div>
              <div className="px-2 pb-6 pt-4 overflow-hidden">
                <div className="h-[280px] lg:h-[320px] w-full overflow-hidden">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAtendimentos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(143, 25%, 42%)" stopOpacity={0.3}/>
                            <stop offset="100%" stopColor="hsl(143, 25%, 42%)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="atendimentos" stroke="hsl(143, 25%, 42%)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAtendimentos)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className={zenMode ? "max-w-2xl mx-auto" : "grid lg:grid-cols-3 gap-6"}>
            {/* Quick Actions */}
            {preferences.quickActions && (
              <div className="organic-card animate-slide-up lg:col-span-1">
                <div className="p-6 pb-4">
                  <h3 className="text-base font-sans font-semibold text-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-secondary" />
                    Atalhos Rápidos
                  </h3>
                </div>
                <div className="px-6 pb-6 space-y-2">
                  <Button className="w-full justify-start h-12 rounded-xl text-sm font-medium" onClick={() => navigate('/pacientes')} data-tour="ai-consultation">
                    <Sparkles className="w-4 h-4 mr-3" /> Selecionar Paciente
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 rounded-xl text-sm font-medium" onClick={() => navigate('/novo-paciente')} data-tour="new-patient">
                    <Users className="w-4 h-4 mr-3 text-primary" /> Cadastrar Paciente
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-12 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => navigate('/perfil')} data-tour="profile-settings">
                    <User className="w-4 h-4 mr-3" /> Configurar Perfil
                  </Button>
                </div>
              </div>
            )}

            {/* Upcoming Appointments */}
            {preferences.agenda && (
              <div className="organic-card animate-slide-up lg:col-span-1" style={{ animationDelay: '0.05s' }}>
                <div className="p-6 pb-4 flex items-center justify-between">
                  <h3 className="text-base font-sans font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    Próximos Pacientes
                  </h3>
                  {appointments.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate('/agenda')}>
                      Ver agenda <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
                <div className="px-6 pb-6">
                  {appointments.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">Agenda livre</p>
                      <p className="text-xs text-muted-foreground mb-4">Nenhuma consulta agendada</p>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate('/agenda')}>
                        Agendar consulta
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {appointments.map((apt) => (
                        <div key={apt.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => navigate('/agenda')}>
                          <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{apt.patient?.full_name || 'Paciente'}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(apt.date_time), "d 'de' MMM, HH:mm", { locale: ptBR })}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Patients */}
            {preferences.recentPatients && (
              <div className="organic-card animate-slide-up lg:col-span-1" style={{ animationDelay: '0.1s' }}>
                <div className="p-6 pb-4 flex items-center justify-between">
                  <h3 className="text-base font-sans font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Pacientes Recentes
                  </h3>
                  {patients.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate('/pacientes')}>
                      Ver todos <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
                <div className="px-6 pb-6">
                  {recentPatients.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">Comece agora</p>
                      <p className="text-xs text-muted-foreground mb-4">Cadastre seu primeiro paciente</p>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate('/novo-paciente')}>
                        Adicionar paciente
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recentPatients.map((patient) => (
                        <div key={patient.id} onClick={() => navigate(`/pacientes/${patient.id}`)} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 cursor-pointer transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">{patient.full_name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{patient.full_name}</p>
                              <p className="text-xs text-muted-foreground">{patient.goal ? goalLabels[patient.goal] || patient.goal : 'Sem objetivo'}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
