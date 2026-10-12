/**
 * ProgressChart - Weight and measurement tracking chart
 * Displays progress over time using recharts
 */

import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion-variants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProgressEntry {
  weight: number;
  measured_at: string;
  body_fat_percentage?: number;
  muscle_mass?: number;
}

interface ProgressChartProps {
  data: {
    data?: ProgressEntry[];
  };
}

export function ProgressChart({ data }: ProgressChartProps) {
  const progressData = data?.data || [];

  // Transform data for chart
  const chartData = progressData
    .map((entry) => ({
      date: new Date(entry.measured_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      }),
      peso: entry.weight,
      gordura: entry.body_fat_percentage || null,
      musculo: entry.muscle_mass || null,
    }))
    .reverse(); // Show oldest to newest

  if (chartData.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-4">Histórico de Peso</h3>
        <div className="text-center py-12">
          <p className="text-slate-500">Nenhum registro de progresso ainda</p>
          <p className="text-sm text-slate-400 mt-2">
            Registre suas medições para acompanhar seu progresso
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm"
    >
      <h3 className="text-lg font-bold text-slate-900 mb-6">Histórico de Peso</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
            }}
            labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="peso"
            stroke="#14b8a6"
            strokeWidth={3}
            name="Peso (kg)"
            dot={{ fill: '#14b8a6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          {chartData.some(d => d.gordura !== null) && (
            <Line
              type="monotone"
              dataKey="gordura"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Gordura (%)"
              dot={{ fill: '#3b82f6', r: 3 }}
              strokeDasharray="5 5"
            />
          )}
          {chartData.some(d => d.musculo !== null) && (
            <Line
              type="monotone"
              dataKey="musculo"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Músculo (kg)"
              dot={{ fill: '#8b5cf6', r: 3 }}
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-teal-50 rounded-lg">
          <p className="text-sm text-slate-600">Peso Atual</p>
          <p className="text-2xl font-bold text-teal-600">
            {chartData[chartData.length - 1]?.peso.toFixed(1)} kg
          </p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-slate-600">Peso Inicial</p>
          <p className="text-2xl font-bold text-blue-600">
            {chartData[0]?.peso.toFixed(1)} kg
          </p>
        </div>
        <div className="text-center p-3 bg-emerald-50 rounded-lg">
          <p className="text-sm text-slate-600">Perdido</p>
          <p className="text-2xl font-bold text-emerald-600">
            {(chartData[0]?.peso - chartData[chartData.length - 1]?.peso).toFixed(1)} kg
          </p>
        </div>
      </div>
    </motion.div>
  );
}
