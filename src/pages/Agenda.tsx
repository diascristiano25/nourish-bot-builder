import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { NewAppointmentDialog } from '@/components/NewAppointmentDialog';
import { Calendar as CalendarIcon, Clock, User, Plus, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { PageTour, agendaTourSteps } from '@/components/PageTour';

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

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  scheduled: { label: 'Agendado', variant: 'default' },
  completed: { label: 'Realizado', variant: 'secondary' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Agenda</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2" data-tour="agenda-new-btn">
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </Button>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Calendar */}
          <Card className="h-fit">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                className="pointer-events-auto"
              />
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">
                Consultas do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : dayAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum agendamento
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Você não tem consultas marcadas para este dia.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agendar Paciente
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {appointment.patient?.full_name || 'Paciente'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{format(new Date(appointment.date_time), 'HH:mm')}</span>
                            {appointment.notes && (() => {
                              try {
                                const parsed = JSON.parse(appointment.notes);
                                const description = parsed?.anamnese?.freeText || parsed?.orientacoes || 'Consulta';
                                return (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[200px]">{description}</span>
                                  </>
                                );
                              } catch {
                                return (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[200px]">{appointment.notes}</span>
                                  </>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={statusConfig[appointment.status]?.variant || 'default'}>
                          {statusConfig[appointment.status]?.label || appointment.status}
                        </Badge>
                        
                        {appointment.status === 'scheduled' && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => updateStatus(appointment.id, 'completed')}
                              title="Marcar como realizado"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => updateStatus(appointment.id, 'cancelled')}
                              title="Cancelar"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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