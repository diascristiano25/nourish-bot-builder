import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { StatsCards } from '@/components/nutritionist/dashboard/StatsCards';
import { AppointmentsPanel } from '@/components/nutritionist/dashboard/AppointmentsPanel';
import { RevenueChart } from '@/components/nutritionist/dashboard/RevenueChart';
import { WeeklyChart } from '@/components/nutritionist/dashboard/WeeklyChart';
import { Users, Calendar, Activity, DollarSign } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
}

interface NutritionistProfile {
  id: string;
  full_name: string;
}

interface Appointment {
  id: string;
  scheduled_at: string;
  patient: { id: string; full_name: string };
  status: string;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface WeeklyData {
  day: string;
  consultations: number;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueData[]>([]);
  const [weeklyConsultations, setWeeklyConsultations] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch nutritionist profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ user_id: user!.id, full_name: user!.user_metadata?.full_name || 'Nutricionista' })
          .select('id, full_name')
          .single();
        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(profileData);
      }

      const nutritionistId = profileData?.id;
      if (!nutritionistId) throw new Error('Nutritionist profile not found');

      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, full_name, email')
        .eq('nutritionist_id', nutritionistId)
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;
      setPatients(patientsData || []);
      setTotalPatients(patientsData?.length || 0);

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`id, scheduled_at, patient:patients(id, full_name), status`)
        .eq('nutritionist_id', nutritionistId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at')
        .limit(5);

      if (appointmentsError) throw appointmentsError;

      const formattedAppointments = (appointmentsData || []).map((item: any) => ({
        ...item,
        patient: Array.isArray(item.patient) ? item.patient[0] : item.patient,
      }));
      setAppointments(formattedAppointments);

      // Fetch monthly revenue (last 6 months)
      const now = new Date();
      const revenueMonths: RevenueData[] = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];

      for (let i = 5; i >= 0; i--) {
        const targetMonth = subMonths(now, i);
        const mStart = startOfMonth(targetMonth).toISOString();
        const mEnd = endOfMonth(targetMonth).toISOString();

        const { data: revenueData, error: revenueError } = await supabase
          .from('financial_records')
          .select('amount')
          .eq('nutritionist_id', nutritionistId)
          .eq('record_type', 'Receita')
          .gte('record_date', mStart)
          .lte('record_date', mEnd);

        if (revenueError) throw revenueError;

        const total = revenueData?.reduce((sum, r) => sum + r.amount, 0) || 0;
        revenueMonths.push({
          month: monthNames[targetMonth.getMonth()],
          revenue: total,
        });
      }
      setMonthlyRevenue(revenueMonths);

      // Fetch weekly consultations
      const weeklyData: WeeklyData[] = [];
      const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const { count, error: countError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('nutritionist_id', nutritionistId)
          .gte('scheduled_at', dayStart.toISOString())
          .lte('scheduled_at', dayEnd.toISOString());

        if (countError) throw countError;

        weeklyData.push({
          day: dayNames[i],
          consultations: count || 0,
        });
      }
      setWeeklyConsultations(weeklyData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ModernLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <LoadingState count={3} height="h-64" />
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (error) {
    return (
      <ModernLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <ErrorBoundary>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 max-w-md">
              <h3 className="font-semibold text-red-900 mb-2">Erro ao carregar dashboard</h3>
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          </ErrorBoundary>
        </div>
      </ModernLayout>
    );
  }

  const stats = [
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      value: totalPatients,
      label: 'Total Pacientes',
      trend: { value: 12, direction: 'up' as const },
    },
    {
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      value: appointments.length,
      label: 'Consultas do Mês',
      trend: { value: 8, direction: 'up' as const },
    },
    {
      icon: <Activity className="w-6 h-6 text-amber-600" />,
      value: '78%',
      label: 'Taxa de Adesão',
      trend: { value: 5, direction: 'down' as const },
    },
    {
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      value: `R$ ${(monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0) / 1000).toFixed(1)}k`,
      label: 'Faturamento',
      trend: { value: 15, direction: 'up' as const },
    },
  ];

  const appointmentData = appointments.map((apt) => ({
    id: apt.id,
    patientName: apt.patient?.full_name || 'Paciente',
    time: format(new Date(apt.scheduled_at), 'HH:mm'),
    type: 'Consulta Nutrição',
    status: (apt.status || 'pending') as 'confirmed' | 'pending' | 'completed',
  }));

  return (
    <ModernLayout>
      <div className="min-h-screen bg-[#FAF8F5] p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Bem-vindo de volta, {profile?.full_name?.split(' ')[0]}</p>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart data={monthlyRevenue} />
            </div>
            <AppointmentsPanel appointments={appointmentData} />
          </div>

          {/* Weekly Chart */}
          <WeeklyChart data={weeklyConsultations} />
        </div>
      </div>
    </ModernLayout>
  );
}
