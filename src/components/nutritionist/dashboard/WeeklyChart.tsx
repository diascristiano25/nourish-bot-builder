/**
 * WeeklyChart - Weekly consultations visualization with Recharts BarChart
 * Shows consultation counts for each day of the week
 */

import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion-variants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calendar } from 'lucide-react';

export interface WeeklyChartProps {
  data: Array<{
    day: string;
    consultations: number;
  }>;
  isLoading?: boolean;
}

export function WeeklyChart({ data, isLoading = false }: WeeklyChartProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm h-80 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-2" />
          <p className="text-sm text-slate-600">Carregando dados...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-amber-600" />
        <h3 className="text-base font-semibold text-slate-900">
          Consultas da Semana
        </h3>
      </div>

      {data && data.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [`${value} consultas`, 'Dia']}
              />
              <Bar
                dataKey="consultations"
                fill="#d97706"
                radius={[8, 8, 0, 0]}
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center text-slate-500">
          <p className="text-sm">Nenhum dado de consultas disponível</p>
        </div>
      )}
    </motion.div>
  );
}
