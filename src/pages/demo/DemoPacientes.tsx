import { motion } from 'framer-motion';
import { ModernLayout } from '@/components/layout/ModernLayout';
import {
  Users, Search, Plus, TrendingUp, TrendingDown,
  ChevronRight, Filter, MoreVertical, Mail, Phone, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const mockPatients = [
  { id: 1, name: 'Andrea Silva', email: 'andrea@email.com', goal: 'Emagrecimento', progress: '+5kg', trend: 'up', status: 'active', avatar: 'A' },
  { id: 2, name: 'Bruno Costa', email: 'bruno@email.com', goal: 'Hipertrofia', progress: '+3kg', trend: 'up', status: 'active', avatar: 'B' },
  { id: 3, name: 'Carlos Lima', email: 'carlos@email.com', goal: 'Manutenção', progress: '0kg', trend: 'stable', status: 'active', avatar: 'C' },
  { id: 4, name: 'Diana Souza', email: 'diana@email.com', goal: 'Emagrecimento', progress: '-2kg', trend: 'down', status: 'active', avatar: 'D' },
  { id: 5, name: 'Eduardo Santos', email: 'eduardo@email.com', goal: 'Performance', progress: '+1kg', trend: 'up', status: 'inactive', avatar: 'E' },
];

const stats = [
  { label: 'Total Pacientes', value: '156', change: '+12%', icon: Users, color: 'emerald' },
  { label: 'Ativos', value: '142', change: '+8%', icon: TrendingUp, color: 'blue' },
  { label: 'Novos (30d)', value: '23', change: '+15%', icon: Plus, color: 'purple' },
  { label: 'Taxa Adesão', value: '91%', change: '+3%', icon: TrendingUp, color: 'teal' },
];

export default function DemoPacientes() {
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
              Pacientes
            </motion.h1>
            <p className="text-muted-foreground mt-1">Gerencie sua base de pacientes</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 gap-2">
              <Plus className="w-4 h-4" />
              Novo Paciente
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.1)'
              }}
              className="bg-white rounded-3xl p-6 border border-border/40"
            >
              <div className="flex items-start justify-between mb-4">
                <motion.div
                  className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center`}
                  whileHover={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </motion.div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0">
                  {stat.change}
                </Badge>
              </div>
              <motion.p
                className="text-3xl font-bold mb-1"
                whileHover={{ scale: 1.05, x: 5 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.div
            className="flex-1 relative"
            whileHover={{ scale: 1.01 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou objetivo..."
              className="pl-10 h-11 rounded-xl bg-white border-border/60"
            />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" className="h-11 rounded-xl gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </motion.div>
        </motion.div>

        {/* Patients List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl border border-border/40 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/40 bg-muted/30">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold">Paciente</th>
                  <th className="text-left p-4 text-sm font-semibold">Contato</th>
                  <th className="text-left p-4 text-sm font-semibold">Objetivo</th>
                  <th className="text-left p-4 text-sm font-semibold">Progresso</th>
                  <th className="text-left p-4 text-sm font-semibold">Status</th>
                  <th className="text-right p-4 text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockPatients.map((patient, index) => (
                  <motion.tr
                    key={patient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{
                      backgroundColor: 'rgba(16, 185, 129, 0.02)',
                      scale: 1.01,
                      x: 5
                    }}
                    className="border-b border-border/40 last:border-0 cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold"
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {patient.avatar}
                        </motion.div>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {patient.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {patient.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          (11) 99999-9999
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="rounded-lg">
                        {patient.goal}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {patient.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                        {patient.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                        <span className="font-medium">{patient.progress}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                      >
                        <Badge
                          variant={patient.status === 'active' ? 'default' : 'secondary'}
                          className={patient.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-0' : ''}
                        >
                          {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </motion.div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button variant="ghost" size="icon" className="rounded-xl">
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button variant="ghost" size="icon" className="rounded-xl">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="p-4 border-t border-border/40 flex items-center justify-between"
          >
            <p className="text-sm text-muted-foreground">Mostrando 5 de 156 pacientes</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl">Anterior</Button>
              <Button variant="outline" size="sm" className="rounded-xl">Próximo</Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </ModernLayout>
  );
}
