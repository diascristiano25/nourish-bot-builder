import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: 'consulta' | 'retorno' | 'avaliacao';
  status: 'confirmado' | 'pendente';
}

const mockAppointments: Appointment[] = [
  { id: '1', patientName: 'Maria Silva', time: '09:00', type: 'consulta', status: 'confirmado' },
  { id: '2', patientName: 'João Santos', time: '10:30', type: 'retorno', status: 'confirmado' },
  { id: '3', patientName: 'Ana Oliveira', time: '14:00', type: 'avaliacao', status: 'pendente' },
];

const typeLabels = {
  consulta: 'Consulta',
  retorno: 'Retorno',
  avaliacao: 'Avaliação',
};

const Agenda = () => {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Agenda</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {today}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Compromissos de Hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum compromisso para hoje.</p>
              </div>
            ) : (
              mockAppointments.map((appointment) => (
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
                        <span className="font-medium text-foreground">{appointment.patientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{appointment.time}</span>
                        <span>•</span>
                        <span>{typeLabels[appointment.type]}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={appointment.status === 'confirmado' ? 'default' : 'secondary'}
                    className={appointment.status === 'confirmado' ? 'bg-primary/20 text-primary hover:bg-primary/30' : ''}
                  >
                    {appointment.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Agenda;
