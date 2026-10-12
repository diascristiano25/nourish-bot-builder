import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { NewAppointmentDialog } from '@/components/NewAppointmentDialog';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { PageTour, agendaTourSteps } from '@/components/PageTour';
import { Calendar, AppointmentList } from '@/components/nutritionist/agenda';

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
  scheduled: { label: 'Agendado', bg: 'bg-cyber-lime/10', text: 'text-cyber-lime', border: 'border-cyber-lime/30' },
  completed: { label: 'Realizado', bg: 'bg-electric-violet/10', text: 'text-electric-violet', border: 'border-electric-violet/30' },
  cancelled: { label: 'Cancelado', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
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

  const fetchAllAppointments = async () => {
    setLoading(true);
    try {
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
        description: `Consulta marcada como ${statusConfig[newStatus].label.toLowerCase()}.`,
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

  return (
    <ModernLayout>
      <PageTour tourKey="agenda" steps={agendaTourSteps} run />
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent mb-2">
              Agenda
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 font-mono text-sm">
              <CalendarIcon className="w-4 h-4 text-cyber-lime" />
              {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 bg-gradient-to-r from-cyber-lime to-electric-violet hover:opacity-90 text-background rounded-xl font-semibold"
            data-tour="agenda-new-btn"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            appointmentDates={appointmentDates}
            isLoading={loading}
          />
          <div className="lg:col-span-2">
            <AppointmentList
              appointments={dayAppointments}
              selectedDate={selectedDate}
              isLoading={loading}
              onUpdateStatus={updateStatus}
              onCreateNew={() => setDialogOpen(true)}
            />
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
