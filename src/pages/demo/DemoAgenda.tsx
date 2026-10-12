import { motion } from 'framer-motion';
import { ModernLayout } from '@/components/layout/ModernLayout';
import {
  Calendar, Clock, ChevronLeft, ChevronRight, Plus,
  Video, MapPin, Phone, User, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockAppointments = [
  { id: 1, time: '09:00', patient: 'Andrea Silva', type: 'Consulta', status: 'confirmed', color: 'bg-emerald-500' },
  { id: 2, time: '10:30', patient: 'Bruno Costa', type: 'Retorno', status: 'confirmed', color: 'bg-blue-500' },
  { id: 3, time: '14:00', patient: 'Carlos Lima', type: 'Avaliação', status: 'pending', color: 'bg-amber-500' },
  { id: 4, time: '15:30', patient: 'Diana Souza', type: 'Consulta', status: 'confirmed', color: 'bg-emerald-500' },
  { id: 5, time: '16:30', patient: 'Eduardo Santos', type: 'Retorno', status: 'pending', color: 'bg-blue-500' },
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

export default function DemoAgenda() {
  return (
    <ModernLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <motion.h1
              className="text-3xl font-bold text-foreground"
              whileHover={{ scale: 1.02, x: 5 }}
            >
              Agenda
            </motion.h1>
            <p className="text-muted-foreground mt-1">Gerencie seus agendamentos</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 gap-2">
              <Plus className="w-4 h-4" />
              Nova Consulta
            </Button>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.01 }}
            className="lg:col-span-2 bg-white rounded-3xl p-6 border border-border/40"
          >
            <div className="flex items-center justify-between mb-6">
              <motion.h2
                className="text-xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Janeiro 2026
              </motion.h2>
              <div className="flex gap-2">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="outline" size="icon" className="rounded-xl">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="outline" size="icon" className="rounded-xl">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day, i) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </motion.div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((day, i) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.01 }}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    transition: { duration: 0.2 }
                  }}
                  className={`
                    aspect-square flex items-center justify-center rounded-xl cursor-pointer
                    ${day === 10 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold' : 'hover:bg-muted/50'}
                  `}
                >
                  <span className="text-sm">{day}</span>
                  {[5, 10, 15, 20, 25].includes(day) && (
                    <motion.div
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Today's appointments */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-border/40"
          >
            <motion.h3
              className="font-bold mb-4 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Calendar className="w-5 h-5 text-emerald-600" />
              Hoje - 10 Jan
            </motion.h3>

            <div className="space-y-3">
              {mockAppointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{
                    scale: 1.03,
                    x: 5,
                    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1)'
                  }}
                  className="p-3 rounded-2xl border border-border/40 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      className={`w-1 h-full ${apt.color} rounded-full`}
                      animate={{ scaleY: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium">{apt.time}</span>
                        {apt.status === 'confirmed' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                      <p className="font-medium text-sm truncate">{apt.patient}</p>
                      <p className="text-xs text-muted-foreground">{apt.type}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-4 pt-4 border-t border-border/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <motion.span
                  className="font-bold text-emerald-600"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {mockAppointments.length} consultas
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Confirmadas', value: '3', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pendentes', value: '2', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Presencial', value: '4', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Online', value: '1', icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              className="bg-white rounded-2xl p-4 border border-border/40"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
                <motion.div
                  className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ModernLayout>
  );
}
