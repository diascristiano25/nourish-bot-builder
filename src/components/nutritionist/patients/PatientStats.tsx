/**
 * PatientStats - Display key patient metrics in animated stat cards
 * Shows Total Patients, Active Now, New This Month, and Retention Rate
 */

import { motion } from 'framer-motion';
import { Users, Activity, UserPlus, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';

interface Patient {
  id: string;
  full_name: string;
  email: string;
  status?: 'active' | 'inactive' | 'paused';
  goal?: string;
  created_at: string;
}

interface PatientStatsProps {
  patients: Patient[];
}

export function PatientStats({ patients }: PatientStatsProps) {
  // Calculate stats
  const totalPatients = patients.length;

  const activePatients = patients.filter(p => p.status === 'active' || !p.status).length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const newThisMonth = patients.filter(p => {
    const createdDate = new Date(p.created_at);
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
  }).length;

  const retentionRate = totalPatients > 0
    ? Math.round((activePatients / totalPatients) * 100)
    : 0;

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem}>
        <StatCard
          icon={<Users className="w-6 h-6" />}
          value={totalPatients}
          label="Total de Pacientes"
          className="h-full"
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          value={activePatients}
          label="Ativos Agora"
          trend={{ value: Math.round((activePatients / Math.max(totalPatients, 1)) * 100), direction: 'up' }}
          className="h-full"
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <StatCard
          icon={<UserPlus className="w-6 h-6" />}
          value={newThisMonth}
          label="Novos Este Mês"
          className="h-full"
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          value={`${retentionRate}%`}
          label="Taxa de Retenção"
          trend={{ value: Math.max(0, retentionRate - 80), direction: retentionRate >= 80 ? 'up' : 'down' }}
          className="h-full"
        />
      </motion.div>
    </motion.div>
  );
}
