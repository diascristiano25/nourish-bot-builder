/**
 * RevenueChart - Revenue data visualization with Recharts AreaChart
 * Shows 12 months of revenue data with smooth curve and animations
 */

import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion-variants';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export interface RevenueChartProps {
  data?: Array<{
    month: string;
    revenue: number;
  }>;
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading = false }: RevenueChartProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm h-96 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-2" />
          <p className="text-sm text-slate-600">Carregando dados...</p>
        </div>
      </motion.div>
    );
  }

  const chartData = data || [
    { month: 'Jan', revenue: 0 },
    { month: 'Fev', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Abr', revenue: 0 },
    { month: 'Mai', revenue: 0 },
    { month: 'Jun', revenue: 0 },
    { month: 'Jul', revenue: 0 },
    { month: 'Ago', revenue: 0 },
    { month: 'Set', revenue: 0 },
    { month: 'Out', revenue: 0 },
    { month: 'Nov', revenue: 0 },
    { month: 'Dez', revenue: 0 },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        <h3 className="text-base font-semibold text-slate-900">Faturamento</h3>
        <span className="text-xs font-medium text-slate-500 ml-auto">
          Últimos 12 meses
        </span>
      </div>

      {chartData && chartData.length > 0 && chartData.some(d => d.revenue > 0) ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                formatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) =>
                  `R$ ${value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                isAnimationActive={true}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center text-slate-500">
          <p className="text-sm">Nenhum dado de faturamento disponível</p>
        </div>
      )}
    </motion.div>
  );
}
