import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { NewAppointmentDialog } from '@/components/NewAppointmentDialog';
import { Calendar as CalendarIcon, Plus, Clock, Users } from 'lucide-react';
import { format, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { PageTour, agendaTourSteps } from '@/components/PageTour';
import { Calendar, AppointmentList } from '@/components/nutritionist/agenda';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { motion } from 'framer-motion';

interface Appointment {
  id: string;
  scheduled_at: string;
  notes: string | null;
  status: string;
  patient: {
    id: string;
    full_name: string;
  };
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  scheduled: { label: 'Agendado', bg: 'bg-[#518C5B]/10', text: 'text-[#518C5B]', border: 'border-[#518C5B]/30' },
  completed: { label: 'Realizado', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelado', bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200' },
};

export default function Agenda() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nutritionistId, setNutritionistId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNutritionistId();
    }
  }, [user]);

  useEffect(() => {
    if (nutritionistId && selectedDate) {
      fetchAppointments();
    }
  }, [nutritionistId, selectedDate]);

  const fetchNutritionistId = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user!.id)
      .single();
    if (data) {
      setNutritionistId(data.id);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const start = startOfDay(selectedDate).toISOString();
      const end = endOfDay(selectedDate).toISOString();
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          notes,
          status,
          patient:patients(id, full_name)
        `)
        .eq('nutritionist_id', nutritionistId)
        .gte('scheduled_at', start)
        .lte('scheduled_at', end)
        .order('scheduled_at');
      if (error) throw error;
      const formattedData = (data || []).map(item => ({
        ...item,
        patient: Array.isArray(item.patient) ? item.patient[0] : item.patient
      }));
      setAppointments(formattedData as Appointment[]);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);
      if (error) throw error;
      toast({
        title: 'Status atualizado',
        description: `Consulta marcada como ${statusConfig[newStatus]?.label.toLowerCase() || newStatus}.`,
      });
      fetchAppointments();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const dayAppointments = appointments.filter(apt =>
    isSameDay(new Date(apt.scheduled_at), selectedDate)
  );
  const appointmentDates = appointments.map(apt => new Date(apt.scheduled_at));

  const confirmedCount = dayAppointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
  const completedCount = dayAppointments.filter(a => a.status === 'completed').length;

  return (
    <ModernLayout>
      <PageTour tourKey="agenda" steps={agendaTourSteps} run />
      <div className="space-y-6">
        <PageHeader
          title="Agenda"
          subtitle={format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          icon={<CalendarIcon className="w-7 h-7 text-white" />}
          actions={
            <Button
              onClick={() => setDialogOpen(true)}
              className="gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/20 rounded-2xl font-semibold px-5 h-11 shadow-lg"
              data-tour="agenda-new-btn"
            >
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </Button>
          }
        />

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RichCard delay={0.1}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#518C5B]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#518C5B]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoje</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  {dayAppointments.length}
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.2}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmadas</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  {confirmedCount}
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.3}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Realizadas</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  {completedCount}
                </motion.p>
              </div>
            </div>
          </RichCard>
        </div>

        {/* Calendar + Appointments in rich cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RichCard delay={0.4} padding="lg">
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              appointmentDates={appointmentDates}
              isLoading={loading}
            />
          </RichCard>
          <div className="lg:col-span-2">
            <RichCard delay={0.5} padding="lg">
              <AppointmentList
                appointments={dayAppointments}
                selectedDate={selectedDate}
                isLoading={loading}
                onUpdateStatus={updateStatus}
                onCreateNew={() => setDialogOpen(true)}
              />
            </RichCard>
          </div>
        </div>
      </div>
      <NewAppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={selectedDate}
        onSuccess={fetchAppointments}
      />
    </ModernLayout>
  );
}