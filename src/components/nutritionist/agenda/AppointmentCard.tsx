import { Clock, User, CheckCircle2, XCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useState } from 'react';
import { VideoCallModal } from '@/components/appointments/VideoCallModal';

export interface Appointment {
  id: string;
  scheduled_at: string;
  notes: string | null;
  status: string;
  is_video_enabled?: boolean;
  patient: {
    id: string;
    full_name: string;
  };
}

interface AppointmentCardProps {
  appointment: Appointment;
  index: number;
  onUpdateStatus: (appointmentId: string, newStatus: string) => void;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  scheduled: { label: 'Agendado', bg: 'bg-cyber-lime/10', text: 'text-cyber-lime', border: 'border-cyber-lime/30' },
  completed: { label: 'Realizado', bg: 'bg-electric-violet/10', text: 'text-electric-violet', border: 'border-electric-violet/30' },
  cancelled: { label: 'Cancelado', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

export function AppointmentCard({
  appointment,
  index,
  onUpdateStatus
}: AppointmentCardProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const status = statusConfig[appointment.status] || statusConfig.scheduled;

  const getDescription = () => {
    if (!appointment.notes) return 'Consulta';
    try {
      const parsed = JSON.parse(appointment.notes);
      return parsed?.anamnese?.freeText || parsed?.orientacoes || 'Consulta';
    } catch {
      return appointment.notes;
    }
  };

  return (
    <>
      <div
        role="region"
        aria-label={`Consulta com ${appointment.patient?.full_name || 'Paciente'} às ${format(new Date(appointment.scheduled_at), 'HH:mm')}`}
        style={{
          animation: `slideInLeft 0.3s ease-out ${index * 0.05}s both`,
        }}
        className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-cyber-lime/30 transition-all duration-300"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyber-lime/10 border border-cyber-lime/30 flex-shrink-0">
            <Clock className="w-5 h-5 text-cyber-lime" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium text-foreground truncate">
                {appointment.patient?.full_name || 'Paciente'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono whitespace-nowrap overflow-hidden text-ellipsis">
              <span>{format(new Date(appointment.scheduled_at), 'HH:mm')}</span>
              <span className="text-cyber-lime">•</span>
              <span className="truncate">{getDescription()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} border ${status.border} whitespace-nowrap`}>
            {status.label}
          </span>

          {appointment.is_video_enabled && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-cyber-lime hover:text-cyber-lime hover:bg-cyber-lime/10"
              onClick={() => setVideoOpen(true)}
              title="Chamada de vídeo"
              aria-label="Abrir chamada de vídeo"
            >
              <Video className="w-4 h-4" />
            </Button>
          )}

          {appointment.status === 'scheduled' && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-cyber-lime hover:text-cyber-lime hover:bg-cyber-lime/10"
                onClick={() => onUpdateStatus(appointment.id, 'completed')}
                title="Marcar como realizado"
                aria-label="Marcar como realizado"
              >
                <CheckCircle2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                title="Cancelar"
                aria-label="Cancelar consulta"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>

      <VideoCallModal
        appointmentId={appointment.id}
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
      />
    </>
  );
}
