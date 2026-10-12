import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import {
  Calendar, TrendingUp, Users, DollarSign, Clock,
  ChevronRight, Sparkles, Search, Bell, User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

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
  scheduled_at: string;
  patient: { id: string; full_name: string };
}

interface ChartDataPoint {
  month: string;
  atendimentos: number;
  day?: string;
}

const statCards = [
  {
    title: 'Pacientes Hoje',
    value: '10',
    subtitle: 'Agendados',
    icon: Calendar,
    gradient: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600'
  },
  {
    title: 'Total Consultas',
    value: '65',
    subtitle: 'Este mês',
    icon: Users,
    gradient: 'from-[#518C5B] to-[#3d7047]',
    bgColor: 'bg-[#518C5B]/10',
    iconColor: 'text-[#518C5B]'
  },
  {
    title: 'Receita',
    value: '1250',
    subtitle: '+18%',
    icon: DollarSign,
    gradient: 'from-[#C4764A] to-[#a8573a]',
    bgColor: 'bg-[#C4764A]/10',
    iconColor: 'text-[#C4764A]'
  },
  {
    title: 'Pacientes Ativos',
    value: '156',
    subtitle: 'Total',
    icon: TrendingUp,
    gradient: 'from-emerald-600 to-[#518C5B]',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-700'
  }
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function ModernDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthlyAppointments, setMonthlyAppointments] = useState(0);
  const [estimatedRevenue, setEstimatedRevenue] = useState(0);
  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [weeklyData, setWeeklyData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, crn')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
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

      const nutritionistId = profileData?.id || profile?.id;
      if (!nutritionistId) return;

      // Fetch patients
      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, full_name, email, goal, created_at')
        .eq('nutritionist_id', nutritionistId)
        .order('created_at', { ascending: false });
      setPatients(patientsData || []);

      // Fetch appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`id, scheduled_at, patient:patients(id, full_name)`)
        .eq('nutritionist_id', nutritionistId)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at')
        .limit(5);

      const formattedAppointments = (appointmentsData || []).map(item => ({
        ...item,
        patient: Array.isArray(item.patient) ? item.patient[0] : item.patient
      }));
      setAppointments(formattedAppointments as Appointment[]);

      // Monthly stats
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();

      const { count: monthlyCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('nutritionist_id', nutritionistId)
        .gte('scheduled_at', monthStart)
        .lte('scheduled_at', monthEnd);
      setMonthlyAppointments(monthlyCount || 0);

      const { data: revenueData } = await supabase
        .from('financial_records')
        .select('amount')
        .eq('nutritionist_id', nutritionistId)
        .eq('record_type', 'Receita')
        .gte('record_date', monthStart)
        .lte('record_date', monthEnd);
      setEstimatedRevenue(revenueData?.reduce((sum, r) => sum + r.amount, 0) || 0);

      // Chart data (6 months)
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
          .gte('scheduled_at', mStart)
          .lte('scheduled_at', mEnd);
        chartMonths.push({ month: monthNames[targetMonth.getMonth()], atendimentos: count || 0 });
      }
      setChartData(chartMonths);

      // Weekly data for bar chart
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      setWeeklyData(days.map((day, i) => ({
        day,
        atendimentos: Math.floor(Math.random() * 15) + 5
      })));

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ModernLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl animate-pulse mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </motion.div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF8F5]/80 backdrop-blur-xl border-b border-border/40">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-foreground"
            >
              {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Nutricionista'}
            </motion.h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                className="pl-10 w-[280px] h-10 rounded-xl bg-white border-border/60"
              />
            </div>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl">
              <Bell className="w-5 h-5" />
            </Button>
            <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-emerald-500/20">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                {profile?.full_name?.charAt(0) || 'N'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity" />
              <div className="relative bg-white rounded-3xl p-6 border border-border/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">{stat.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart Area - 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-3xl p-6 border border-border/40"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Evolução</h3>
                <p className="text-sm text-muted-foreground">Total por mês</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Dia
                </Button>
                <Button variant="default" size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                  Semana
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Mês
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Ano
                </Button>
              </div>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '8px 12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="atendimentos"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#colorGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/40">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Taxa de Crescimento</p>
                <p className="text-2xl font-bold text-emerald-600">+18%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Média Semanal</p>
                <p className="text-2xl font-bold text-foreground">23</p>
              </div>
            </div>
          </motion.div>

          {/* Appointments Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Próximos Pacientes</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 h-8 rounded-xl"
                onClick={() => navigate('/agenda')}
              >
                Ver todos
              </Button>
            </div>

            <div className="space-y-3">
              {appointments.slice(0, 4).map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {apt.patient?.full_name || 'Paciente'}
                      </p>
                      <p className="text-xs text-white/70">
                        {format(new Date(apt.scheduled_at), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Clock className="w-4 h-4 text-white/70" />
                  </div>
                </motion.div>
              ))}

              {appointments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-white/70">Nenhuma consulta agendada</p>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              className="w-full mt-6 bg-white text-emerald-600 hover:bg-white/90 rounded-xl h-11 font-medium"
              onClick={() => navigate('/agenda')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Agendar Consulta
            </Button>
          </motion.div>
        </div>

        {/* Weekly Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl p-6 border border-border/40"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Atendimentos por Dia</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '8px 12px'
                  }}
                />
                <Bar
                  dataKey="atendimentos"
                  fill="#10b981"
                  radius={[12, 12, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </ModernLayout>
  );
}
