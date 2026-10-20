import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { DashboardHero } from '@/components/nutritionist/dashboard/DashboardHero';
import { ProfileCard } from '@/components/nutritionist/dashboard/ProfileCard';
import { MiniCalendar } from '@/components/nutritionist/dashboard/MiniCalendar';
import { WorkStatCard } from '@/components/nutritionist/dashboard/WorkStatCard';
import { BusynessChart } from '@/components/nutritionist/dashboard/BusynessChart';
import { PlansProgress } from '@/components/nutritionist/dashboard/PlansProgress';
import { Search, Bell, Settings, UserPlus, CalendarPlus, FileText, Utensils } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth } from 'date-fns';
import { QuickActions } from '@/components/shared/QuickActions';

interface NutritionistProfile {
  id: string;
  full_name: string;
  crn: string | null;
  logo_url: string | null;
}

interface Appointment {
  id: string;
  scheduled_at: string;
  patient: { id: string; full_name: string };
  status: string;
}

interface CalendarEvent {
  time: string;
  title: string;
  color: string;
}

export default function ModernDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineWork, setOfflineWork] = useState(0);
  const [onlineWork, setOnlineWork] = useState(0);
  const [labWork, setLabWork] = useState(0);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [monthAppointments, setMonthAppointments] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, crn, logo_url')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      let currentProfile = profileData;
      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user!.id,
            full_name: user!.user_metadata?.full_name || 'Nutricionista'
          })
          .select('id, full_name, crn')
          .maybeSingle();
        if (createError) throw createError;
        currentProfile = newProfile;
      }
      setProfile(currentProfile);

      const nutritionistId = currentProfile?.id;
      if (!nutritionistId) return;

      // Fetch today's appointments
      const today = new Date();
      const dayStart = new Date(today);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(today);
      dayEnd.setHours(23, 59, 59, 999);

      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select(`id, scheduled_at, patient:patients(id, full_name), status, appointment_type`)
        .eq('nutritionist_id', nutritionistId)
        .gte('scheduled_at', dayStart.toISOString())
        .lte('scheduled_at', dayEnd.toISOString())
        .order('scheduled_at');

      const formattedToday = (todayAppointments || []).map((item: any) => ({
        ...item,
        patient: Array.isArray(item.patient) ? item.patient[0] : item.patient
      }));

      // Count offline vs online
      const offline = formattedToday.filter((a: any) => a.appointment_type !== 'online').length;
      const online = formattedToday.filter((a: any) => a.appointment_type === 'online').length;
      setOfflineWork(offline);
      setOnlineWork(online);

      // Build calendar events from today's appointments
      const events: CalendarEvent[] = formattedToday.map((apt: any, i: number) => {
        const colors = ['bg-pink-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'];
        const time = new Date(apt.scheduled_at);
        return {
          time: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`,
          title: `Consulta com ${apt.patient?.full_name || 'Paciente'}`,
          color: colors[i % colors.length]
        };
      });

      setCalendarEvents(events);

      // Monthly stats for lab work (meal plans generated)
      const monthStart = startOfMonth(today).toISOString();
      const monthEnd = endOfMonth(today).toISOString();

      const { count: plansCount } = await supabase
        .from('meal_plans')
        .select('*', { count: 'exact', head: true })
        .eq('nutritionist_id', nutritionistId)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd);

      setLabWork(plansCount || 0);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data on error
      setOfflineWork(0);
      setOnlineWork(0);
      setLabWork(0);
      setCalendarEvents([]);
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
            <div className="w-16 h-16 bg-gradient-to-br from-[#518C5B] to-[#3d7047] rounded-3xl animate-pulse mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
          </motion.div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-8">
        {/* Top Bar - Search & Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4"
        >
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos, pacientes etc."
              className="pl-12 h-12 rounded-2xl bg-white border-slate-200/60 shadow-soft text-base"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/mensagens')}
              className="w-12 h-12 rounded-2xl bg-white border border-slate-200/60 shadow-soft flex items-center justify-center hover:bg-slate-50 transition-colors relative"
              title="Notificações / Mensagens"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/perfil')}
              className="w-12 h-12 rounded-2xl bg-white border border-slate-200/60 shadow-soft flex items-center justify-center hover:bg-slate-50 transition-colors"
              title="Configurações do Perfil"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Banner */}
            <DashboardHero name={profile?.full_name || 'Nutricionista'} />

            {/* Quick Actions */}
            <QuickActions actions={[
              { id: 'new-patient', label: 'Novo Paciente', icon: <UserPlus className="w-4 h-4" />, onClick: () => navigate('/novo-paciente'), color: 'sage' },
              { id: 'new-appointment', label: 'Agendar Consulta', icon: <CalendarPlus className="w-4 h-4" />, onClick: () => navigate('/agenda'), color: 'terracotta' },
              { id: 'new-plan', label: 'Criar Plano', icon: <Utensils className="w-4 h-4" />, onClick: () => navigate('/biblioteca'), color: 'indigo' },
              { id: 'generate-meal', label: 'Gerar Cardápio', icon: <FileText className="w-4 h-4" />, onClick: () => navigate('/biblioteca'), color: 'amber' },
            ]} />

            {/* Work Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <WorkStatCard
                title="TRABALHO PRESENCIAL"
                value={offlineWork}
                label="pacientes atendidos"
                trend={-6}
                variant="offline"
                delay={0.3}
              />
              <WorkStatCard
                title="TELECONSULTAS"
                value={onlineWork}
                label="consultas online"
                trend={12}
                variant="online"
                delay={0.4}
              />
              <WorkStatCard
                title="PLANOS GERADOS"
                value={labWork}
                label="planos alimentares"
                trend={0}
                variant="lab"
                delay={0.5}
              />
            </div>

            {/* Bottom Row - Events & Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <BusynessChart
                consultations={offlineWork + onlineWork}
                analyzes={labWork}
                meetings={0}
                busynessPercent={Math.min(100, Math.round(((offlineWork + onlineWork) / 8) * 100))}
              />
              <PlansProgress plans={[
                { label: 'Consultas', percent: monthAppointments > 0 ? Math.min(100, Math.round((monthAppointments / 30) * 100)) : 0, color: 'bg-[#518C5B]' },
                { label: 'Pacientes', percent: totalPatients > 0 ? Math.min(100, Math.round((totalPatients / 50) * 100)) : 0, color: 'bg-[#C4764A]' },
                { label: 'Planos', percent: labWork > 0 ? Math.min(100, Math.round((labWork / 20) * 100)) : 0, color: 'bg-pink-500' },
              ]} />
            </div>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-8">
            <ProfileCard
              name={profile?.full_name || 'Nutricionista'}
              specialty="NUTRICIONISTA"
              location="Brasil"
              crn={profile?.crn || '—'}
              workingHours="9h - 18h"
              logoUrl={profile?.logo_url}
            />
            <MiniCalendar events={calendarEvents} />
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}