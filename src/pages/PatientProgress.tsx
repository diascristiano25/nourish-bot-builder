/**
 * PatientProgress - Progress tracking page
 * Shows weight/measurement tracking chart and progress summary
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProgressChart } from '@/components/patient/progress/ProgressChart';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';
import { TrendingDown, Target, Calendar } from 'lucide-react';

export default function PatientProgress() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { progress, patient, isLoading, error } = usePatientData(user?.id || '');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <PatientLayout>
        <LoadingState />
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <PatientLayout>
        <ErrorBoundary error={error} />
      </PatientLayout>
    );
  }

  const progressData = progress?.data || [];
  const latestWeight = progressData[0]?.weight || 0;
  const initialWeight = progressData[progressData.length - 1]?.weight || 0;
  const totalWeightLost = initialWeight - latestWeight;
  const daysTracking = progressData.length > 0
    ? Math.ceil(
        (new Date().getTime() - new Date(progressData[progressData.length - 1].measured_at).getTime()) /
        (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <PatientLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 p-6 max-w-7xl mx-auto"
      >
        <motion.h1 variants={staggerItem} className="text-3xl font-bold text-slate-900">
          Meu Progresso
        </motion.h1>

        <motion.div variants={staggerItem}>
          <ProgressChart data={progress} />
        </motion.div>

        {totalWeightLost > 0 && (
          <motion.div
            variants={staggerItem}
            className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg border border-blue-200 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="bg-teal-500 text-white p-3 rounded-full">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Parabéns pelo seu progresso!</h3>
                <p className="text-slate-700">
                  Você perdeu <strong className="text-teal-600">{totalWeightLost.toFixed(1)} kg</strong> desde o início.
                </p>
                <div className="flex gap-6 mt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{daysTracking} dias acompanhando</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>Meta: {patient.data?.goal || 'Não definida'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={staggerItem}
          className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">Dicas para Manter o Progresso</h3>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-teal-500 mt-1">✓</span>
              <span>Registre suas medições semanalmente para acompanhar melhor seu progresso</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-500 mt-1">✓</span>
              <span>Siga seu plano alimentar e marque as refeições conforme as completa</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-500 mt-1">✓</span>
              <span>Entre em contato com seu nutricionista sempre que tiver dúvidas</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-500 mt-1">✓</span>
              <span>Mantenha-se hidratado e pratique atividades físicas regularmente</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </PatientLayout>
  );
}
