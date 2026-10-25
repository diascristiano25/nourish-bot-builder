/**
 * FinancialDashboard - Financial overview with stat cards
 * Displays key financial metrics with animations
 */

import { motion } from 'framer-motion';
import { StatCard } from '@/components/shared/StatCard';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';
import { DollarSign, Clock, TrendingUp, Receipt } from 'lucide-react';

export interface FinancialDashboardProps {
  totalRevenue: number;
  pendingPayments: number;
  avgConsultationCost: number;
  totalTransactions: number;
  isLoading?: boolean;
}

export function FinancialDashboard({
  totalRevenue,
  pendingPayments,
  avgConsultationCost,
  totalTransactions,
  isLoading = false,
}: FinancialDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-6 shadow-sm h-32 animate-pulse"
          >
            <div className="h-4 bg-border rounded w-24 mb-4" />
            <div className="h-8 bg-border rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      value: `R$ ${(totalRevenue / 1000).toFixed(1)}k`,
      label: 'Receita do Mês',
      trend: { value: 15, direction: 'up' as const },
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-600" />,
      value: `R$ ${(pendingPayments / 1000).toFixed(1)}k`,
      label: 'Pagamentos Pendentes',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      value: `R$ ${avgConsultationCost.toFixed(0)}`,
      label: 'Ticket Médio',
      trend: { value: 8, direction: 'up' as const },
    },
    {
      icon: <Receipt className="w-6 h-6 text-purple-600" />,
      value: totalTransactions,
      label: 'Total de Transações',
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      role="region"
      aria-label="Financial Statistics"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={staggerItem}>
          <StatCard
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            trend={stat.trend}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
