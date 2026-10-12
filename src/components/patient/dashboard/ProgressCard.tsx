/**
 * ProgressCard - Patient progress summary card
 * Displays weight loss progress and goal tracking
 */

import { motion } from 'framer-motion';
import { fadeInScale } from '@/lib/motion-variants';
import { TrendingDown, Target } from 'lucide-react';

interface ProgressCardProps {
  progress: {
    data?: Array<{
      weight: number;
      measured_at: string;
    }>;
  };
}

export function ProgressCard({ progress }: ProgressCardProps) {
  const progressData = progress?.data || [];

  // Calculate progress
  const latestWeight = progressData[0]?.weight || 0;
  const initialWeight = progressData[progressData.length - 1]?.weight || 0;
  const weightLost = initialWeight - latestWeight;
  const progressPercent = initialWeight > 0
    ? Math.round((weightLost / initialWeight) * 100)
    : 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInScale}
      className="rounded-lg border border-blue-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">Seu Progresso</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900">
              {weightLost > 0 ? `-${weightLost.toFixed(1)}` : '0.0'} kg
            </p>
            {weightLost > 0 && (
              <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-500">
                  {progressPercent}%
                </span>
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Peso atual: {latestWeight > 0 ? `${latestWeight.toFixed(1)} kg` : 'Não registrado'}
          </p>
        </div>
        <div className="text-teal-400">
          <Target className="w-8 h-8" />
        </div>
      </div>
    </motion.div>
  );
}
