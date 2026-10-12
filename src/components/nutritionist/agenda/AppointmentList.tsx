import { Loader2, CalendarIcon, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentCard, Appointment } from './AppointmentCard';

interface AppointmentListProps {
  appointments: Appointment[];
  selectedDate: Date;
  isLoading?: boolean;
  onUpdateStatus?: (appointmentId: string, newStatus: string) => void;
  onCreateNew?: () => void;
}

export function AppointmentList({
  appointments = [],
  selectedDate,
  isLoading = false,
  onUpdateStatus = () => {},
  onCreateNew = () => {}
}: AppointmentListProps) {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyber-lime" />
          Consultas do Dia
        </h2>
        <span className="text-xs font-mono text-muted-foreground">
          {appointments.length} AGENDAMENTOS
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-cyber-lime" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum agendamento
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Você não tem consultas marcadas para {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}.
          </p>
          <Button
            variant="outline"
            onClick={onCreateNew}
            className="gap-2 glass border-border hover:border-cyber-lime/50 hover:text-cyber-lime"
          >
            <Plus className="w-4 h-4" />
            Agendar Paciente
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              index={index}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
