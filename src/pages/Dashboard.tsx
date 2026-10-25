import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { LoadingState } from '@/components/shared/LoadingState';
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

// Mock data generator
const getMockData = (userName?: string) => ({
  profile: { id: 'mock-id', full_name: userName || 'Nutricionista' },
  patients: [] as Patient[],
  totalPatients: 0,
  appointments: [] as Appointment[],
  monthlyRevenue: [
    { month: 'Mai', revenue: 3200 },
    { month: 'Jun', revenue: 4100 },
    { month: 'Jul', revenue: 3800 },
    { month: 'Ago', revenue: 4500 },
    { month: 'Set', revenue: 5200 },
    { month: 'Out', revenue: 4800 },
  ],
  weeklyConsultations: [
    { day: 'Seg', consultations: 3 },
    { day: 'Ter', consultations: 5 },
    { day: 'Qua', consultations: 4 },
    { day: 'Qui', consultations: 6 },
    { day: 'Sex', consultations: 4 },
    { day: 'Sab', consultations: 2 },
    { day: 'Dom', consultations: 1 },
  ],
});

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(getMockData(user?.user_metadata?.full_name));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Try to fetch real data from Supabase
      // If ANY step fails, we catch it and use mock data

      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      let nutritionistId = profileData?.id;
      let profile = profileData;

      if (!nutritionistId) {
        // Try to create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ user_id: user!.id, full_name: user!.user_metadata?.full_name || 'Nutricionista' })
          .select('id, full_name')
          .single();

        if (createError) throw createError;
        nutritionistId = newProfile.id;
        profile = newProfile;
      }

      // 2. Fetch Patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, full_name, email')
        .eq('nutritionist_id', nutritionistId)
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;

      // 3. Fetch Appointments
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

      // 4. Fetch Revenue (Last 6 Months)
      const now = new Date();
      const revenueMonths: RevenueData[] = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

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

      // 5. Fetch Weekly Consultations
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

      // If we got here, everything succeeded
      setData({
        profile: profile || { id: 'unknown', full_name: 'Nutricionista' },
        patients: patientsData || [],
        totalPatients: patientsData?.length || 0,
        appointments: formattedAppointments,
        monthlyRevenue: revenueMonths,
        weeklyConsultations: weeklyData,
      });

    } catch (err) {
      console.warn('Supabase fetch failed, using mock data:', err);
      // Fallback to mock data on ANY error
      setData(getMockData(user?.user_metadata?.full_name));
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

  const stats = [
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      value: data.totalPatients,
      label: 'Total Pacientes',
      trend: { value: 12, direction: 'up' as const },
    },
    {
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      value: data.appointments.length,
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
      value: `R$ ${(data.monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0) / 1000).toFixed(1)}k`,
      label: 'Faturamento',
      trend: { value: 15, direction: 'up' as const },
    },
  ];

  const appointmentData = data.appointments.map((apt) => ({
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
            <p className="text-muted-foreground">Bem-vindo de volta, {data.profile?.full_name?.split(' ')[0]}</p>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart data={data.monthlyRevenue} />
            </div>
            <AppointmentsPanel appointments={appointmentData} />
          </div>

          {/* Weekly Chart */}
          <WeeklyChart data={data.weeklyConsultations} />
        </div>
      </div>
    </ModernLayout>
  );
}