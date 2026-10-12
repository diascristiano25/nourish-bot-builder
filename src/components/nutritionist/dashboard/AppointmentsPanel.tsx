/**
 * AppointmentsPanel - Appointments list with green gradient background
 * Displays next 5 appointments with status indicators
 */

import { motion } from 'framer-motion';
import { slideInLeft, staggerContainer, staggerItem, liftHover } from '@/lib/motion-variants';
import { Calendar, Clock, CheckCircle, AlertCircle, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface AppointmentsPanelProps {
  appointments: Array<{
    id: string;
    patientName: string;
    time: string;
    type: string;
    status: 'confirmed' | 'pending' | 'completed';
  }>;
  isLoading?: boolean;
}

const statusConfig = {
  confirmed: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    label: 'Confirmado',
  },
  pending: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Pendente',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    label: 'Concluído',
  },
};

export function AppointmentsPanel({
  appointments,
  isLoading = false,
}: AppointmentsPanelProps) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Próximas Consultas</h3>
        </div>
        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
          {appointments.length}
        </span>
      </div>

      {appointments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8"
        >
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-60" />
          <p className="text-sm font-medium mb-2">Nenhuma consulta agendada</p>
          <p className="text-xs opacity-75">Adicione consultas para visualizá-las aqui</p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-3"
        >
          {appointments.slice(0, 5).map((appointment) => {
            const status = statusConfig[appointment.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={appointment.id}
                variants={slideInLeft}
                whileHover={liftHover}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {appointment.patientName}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-90">
                      <Clock3 className="w-3 h-3" />
                      <span>{appointment.time}</span>
                    </div>
                    <p className="text-xs opacity-75 mt-1">{appointment.type}</p>
                  </div>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${status.bg} flex items-center justify-center`}>
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <Button
          className="w-full bg-white text-emerald-600 hover:bg-gray-100 font-medium"
          whileHover={liftHover}
        >
          Agendar Consulta
        </Button>
      </motion.div>
    </div>
  );
}
