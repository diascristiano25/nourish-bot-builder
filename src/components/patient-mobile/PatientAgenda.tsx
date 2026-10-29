import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VideoCallModal } from '@/components/appointments/VideoCallModal';

interface Appointment {
  id: string;
  scheduled_at: string;
  notes: string | null;
  status: string;
  type?: string;
  is_video_enabled?: boolean;
}

interface PatientAgendaProps {
  patientId: string;
}

export function PatientAgenda({ patientId }: PatientAgendaProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoOpen, setVideoOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, scheduled_at, notes, status, type, is_video_enabled')
        .eq('patient_id', patientId)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      scheduled: { label: 'Agendado', variant: 'default' },
      completed: { label: 'Realizado', variant: 'secondary' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };
    const s = config[status] || config.scheduled;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const handleVideoClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setVideoOpen(true);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Carregando agenda...
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const pastAppointments = appointments.filter(a => a.status !== 'scheduled');

  return (
    <div className="p-4 space-y-6">
      {/* Próximas Consultas */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#518C5B]" />
          Próximas Consultas
        </h2>
        {upcomingAppointments.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma consulta agendada
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(appointment.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground mb-2">{appointment.notes}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {getStatusBadge(appointment.status)}
                        {appointment.type === 'online' && (
                          <Badge variant="outline" className="text-xs">
                            <Video className="w-3 h-3 mr-1" />
                            Online
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleVideoClick(appointment.id)}
                      className="bg-[#518C5B] hover:bg-[#3d7047] text-white"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Entrar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Consultas Anteriores */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            Consultas Anteriores
          </h2>
          <div className="space-y-2">
            {pastAppointments.slice(0, 5).map((appointment) => (
              <Card key={appointment.id} className="border-border/50 opacity-70">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(appointment.scheduled_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      <VideoCallModal
        appointmentId={selectedAppointmentId}
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
      />
    </div>
  );
}