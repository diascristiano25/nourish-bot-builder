import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
  Eye,
  EyeOff,
  User,
  TrendingUp,
  DollarSign,
  Activity,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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

interface ChartDataPoint {
  month: string;
  atendimentos: number;
}

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
          .limit(5);

        if (appointmentsError) throw appointmentsError;
        
        const formattedAppointments = (appointmentsData || []).map(item => ({
          ...item,
          patient: Array.isArray(item.patient) ? item.patient[0] : item.patient
        }));
        setAppointments(formattedAppointments as Appointment[]);

        // Fetch monthly appointments count
        const now = new Date();
        const monthStart = startOfMonth(now).toISOString();
        const monthEnd = endOfMonth(now).toISOString();
        
        const { count: monthlyCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('nutritionist_id', nutritionistId)
          .gte('date_time', monthStart)
          .lte('date_time', monthEnd);

        setMonthlyAppointments(monthlyCount || 0);

        // Fetch estimated revenue from financial_records
        const { data: revenueData } = await supabase
          .from('financial_records')
          .select('amount')
          .eq('nutritionist_id', nutritionistId)
          .eq('record_type', 'Receita')
          .gte('record_date', monthStart)
          .lte('record_date', monthEnd);

        const totalRevenue = revenueData?.reduce((sum, r) => sum + r.amount, 0) || 0;
        setEstimatedRevenue(totalRevenue);

        // Fetch real chart data - appointments for last 6 months
        const chartMonths: ChartDataPoint[] = [];
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        for (let i = 5; i >= 0; i--) {
          const targetMonth = subMonths(now, i);
          const mStart = startOfMonth(targetMonth).toISOString();
          const mEnd = endOfMonth(targetMonth).toISOString();
          
          const { count } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('nutritionist_id', nutritionistId)
            .gte('date_time', mStart)
            .lte('date_time', mEnd);
          
          chartMonths.push({
            month: monthNames[targetMonth.getMonth()],
            atendimentos: count || 0,
          });
        }
        
        setChartData(chartMonths);
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-medium">Carregando...</p>
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
    atendimentos: {
      label: "Atendimentos",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <AppLayout>
      {profile && <OnboardingTour nutritionistId={profile.id} />}
      
      <div className="min-h-screen bg-slate-50">
        {/* Elite Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="px-6 lg:px-8 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
                {getGreeting()}, {profile ? getFirstName(profile.full_name) : 'Nutricionista'}
              </h1>
              <p className="text-sm text-slate-500">Vamos transformar vidas hoje.</p>
            </div>
            <div className="flex items-center gap-2">
              {profile && <SupportDialog nutritionistId={profile.id} />}
              
              <Button
                variant={zenMode ? "default" : "outline"}
                size="sm"
                onClick={() => setZenMode(!zenMode)}
                className="rounded-xl gap-2 h-9 px-4 text-sm font-medium border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                data-tour="zen-mode"
              >
                {zenMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline">Modo Zen</span>
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 h-9 px-4 text-sm font-medium border-slate-200 hover:border-slate-300 hover:bg-slate-50" data-tour="customize-dashboard">
                    <Settings2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Personalizar</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-white border-slate-200">
                  <SheetHeader>
                    <SheetTitle className="text-slate-800">Personalizar Dashboard</SheetTitle>
                    <SheetDescription className="text-slate-500">
                      Escolha quais widgets exibir
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {(Object.keys(preferences) as Array<keyof WidgetPreferences>).map((key) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-slate-100">
                        <span className="text-sm font-medium text-slate-700">{widgetLabels[key]}</span>
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

        <main className="p-6 lg:p-8">
          {/* Elite Stat Cards */}
          {!zenMode && preferences.stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
              <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-800">{patients.length}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Total de Pacientes</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-800">{monthlyAppointments}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Consultas do Mês</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-800">78%</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Taxa de Adesão</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-amber-500" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-800">
                    R$ {estimatedRevenue.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Faturamento Estimado</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chart Section */}
          {!zenMode && preferences.stats && (
            <Card className="bg-white rounded-2xl border-0 shadow-sm mb-8 animate-fade-in overflow-hidden" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Evolução de Atendimentos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 overflow-hidden">
                <div className="h-[200px] lg:h-[280px] w-full overflow-hidden">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAtendimentos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 12 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="atendimentos"
                          stroke="#10B981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorAtendimentos)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Grid */}
          <div className={zenMode ? "max-w-2xl mx-auto" : "grid lg:grid-cols-3 gap-6"}>
            {/* Quick Actions */}
            {preferences.quickActions && (
              <Card className="bg-white rounded-2xl border-0 shadow-sm animate-slide-up lg:col-span-1 hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    Atalhos Rápidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full justify-start h-12 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                    onClick={() => navigate('/consulta')}
                    data-tour="ai-consultation"
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    Nova Consulta
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full justify-start h-12 rounded-xl text-sm font-medium border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    onClick={() => navigate('/patients/new')}
                    data-tour="new-patient"
                  >
                    <Users className="w-4 h-4 mr-3 text-emerald-500" />
                    Cadastrar Paciente
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full justify-start h-12 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                    onClick={() => navigate('/profile')}
                    data-tour="profile-settings"
                  >
                    <User className="w-4 h-4 mr-3 text-slate-400" />
                    Configurar Perfil
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Appointments */}
            {preferences.agenda && (
              <Card className="bg-white rounded-2xl border-0 shadow-sm animate-slide-up lg:col-span-1 hover:shadow-md transition-shadow" style={{ animationDelay: '0.05s' }}>
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    Próximos Pacientes
                  </CardTitle>
                  {appointments.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-slate-500 hover:text-slate-700"
                      onClick={() => navigate('/agenda')}
                    >
                      Ver agenda
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Agenda livre</p>
                      <p className="text-xs text-slate-400 mb-4">Nenhuma consulta agendada</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50"
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
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                          onClick={() => navigate('/agenda')}
                        >
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                            <Clock className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {apt.patient?.full_name || 'Paciente'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {format(new Date(apt.date_time), "d 'de' MMM, HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Patients */}
            {preferences.recentPatients && (
              <Card className="bg-white rounded-2xl border-0 shadow-sm animate-slide-up lg:col-span-1 hover:shadow-md transition-shadow" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-500" />
                    Pacientes Recentes
                  </CardTitle>
                  {patients.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-slate-500 hover:text-slate-700"
                      onClick={() => navigate('/patients')}
                    >
                      Ver todos
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {recentPatients.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Comece agora</p>
                      <p className="text-xs text-slate-400 mb-4">Cadastre seu primeiro paciente</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => navigate('/patients/new')}
                      >
                        Adicionar paciente
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recentPatients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-sm">
                              <span className="text-sm font-semibold text-white">
                                {patient.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800 group-hover:text-emerald-600 transition-colors">
                                {patient.full_name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {patient.goal ? goalLabels[patient.goal] || patient.goal : 'Sem objetivo'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
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
