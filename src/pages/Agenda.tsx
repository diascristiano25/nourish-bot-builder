import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { NewAppointmentDialog } from '@/components/NewAppointmentDialog';
import { Calendar as CalendarIcon, Clock, User, Plus, Loader2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { PageTour, agendaTourSteps } from '@/components/PageTour';
import { GlassCard } from '@/components/ui/GlassCard';

interface Appointment {
  id: string;
  date_time: string;
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
          date_time,
          notes,
          status,
          patient:patients(id, full_name)
        `)
        .eq('nutritionist_id', nutritionistId)
        .gte('date_time', start)
        .lte('date_time', end)
        .order('date_time');

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
    isSameDay(new Date(apt.date_time), selectedDate)
  );

  return (
    <AppLayout>
      <PageTour tourKey="agenda" steps={agendaTourSteps} run />
      <div className="p-6 md:p-8">
        {/* Cyber Header */}
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

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Calendar */}
          <GlassCard className="h-fit p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="pointer-events-auto"
              classNames={{
                day_selected: "bg-cyber-lime text-background hover:bg-cyber-lime/90",
                day_today: "bg-electric-violet/20 text-electric-violet",
              }}
            />
          </GlassCard>

          {/* Appointments List */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyber-lime" />
                Consultas do Dia
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                {dayAppointments.length} AGENDAMENTOS
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-cyber-lime" />
              </div>
            ) : dayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum agendamento
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você não tem consultas marcadas para este dia.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(true)}
                  className="gap-2 glass border-white/10 hover:border-cyber-lime/50 hover:text-cyber-lime"
                >
                  <Plus className="w-4 h-4" />
                  Agendar Paciente
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {dayAppointments.map((appointment, index) => {
                  const status = statusConfig[appointment.status] || statusConfig.scheduled;
                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 rounded-xl glass border border-white/10 hover:border-cyber-lime/30 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyber-lime/10 border border-cyber-lime/30">
                          <Clock className="w-5 h-5 text-cyber-lime" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {appointment.patient?.full_name || 'Paciente'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                            <span>{format(new Date(appointment.date_time), 'HH:mm')}</span>
                            {appointment.notes && (() => {
                              try {
                                const parsed = JSON.parse(appointment.notes);
                                const description = parsed?.anamnese?.freeText || parsed?.orientacoes || 'Consulta';
                                return (
                                  <>
                                    <span className="text-cyber-lime">•</span>
                                    <span className="truncate max-w-[200px]">{description}</span>
                                  </>
                                );
                              } catch {
                                return (
                                  <>
                                    <span className="text-cyber-lime">•</span>
                                    <span className="truncate max-w-[200px]">{appointment.notes}</span>
                                  </>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
                          {status.label}
                        </span>
                        
                        {appointment.status === 'scheduled' && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-cyber-lime hover:text-cyber-lime hover:bg-cyber-lime/10"
                              onClick={() => updateStatus(appointment.id, 'completed')}
                              title="Marcar como realizado"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => updateStatus(appointment.id, 'cancelled')}
                              title="Cancelar"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      <NewAppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={selectedDate}
        onSuccess={fetchAppointments}
      />
    </AppLayout>
  );
}
