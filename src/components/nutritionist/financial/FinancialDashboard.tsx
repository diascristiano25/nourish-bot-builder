/**
 * FinancialDashboard - Dashboard layout with 4 stat cards
 * Displays total revenue, pending payments, avg consultation cost, and total transactions
 */

import { motion } from 'framer-motion';
import { StatCard } from '@/components/shared/StatCard';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';
import { Wallet, Clock, DollarSign, PiggyBank } from 'lucide-react';

export interface FinancialDashboardProps {
  data?: {
    monthlyRevenue: number;
    pendingAmount: number;
    avgConsultationCost: number;
    totalTransactions: number;
  };
  isLoading?: boolean;
}

export function FinancialDashboard({ data, isLoading = false }: FinancialDashboardProps) {
  const stats = [
    {
      icon: <Wallet className="w-6 h-6" />,
      value: data ? `R$ ${data.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
      label: 'Receita do Mês',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      value: data ? `R$ ${data.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
      label: 'Pendentes',
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      value: data ? `R$ ${data.avgConsultationCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
      label: 'Custo Médio',
    },
    {
      icon: <PiggyBank className="w-6 h-6" />,
      value: data ? data.totalTransactions : 0,
      label: 'Total de Transações',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm animate-pulse h-32" />
        ))}
      </div>
    );
  }

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
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
