/**
 * PatientPortal - Patient dashboard main entry point
 * Shows progress summary, today's meals, and quick actions
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProgressCard } from '@/components/patient/dashboard/ProgressCard';
import { TodaysMeals } from '@/components/patient/dashboard/TodaysMeals';
import { ChatWidget } from '@/components/patient/dashboard/ChatWidget';
import { StatCard } from '@/components/shared/StatCard';
import { Target, Calendar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';

export default function PatientPortal() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { patient, mealPlan, progress, isLoading, error } = usePatientData(user?.id || '');

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

  const patientData = patient.data;
  const mealPlanData = mealPlan.data;

  return (
    <PatientLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 p-6 max-w-7xl mx-auto"
      >
        <motion.h1 variants={staggerItem} className="text-3xl font-bold text-slate-900">
          Bem-vindo, {patientData?.full_name?.split(' ')[0] || 'Paciente'}!
        </motion.h1>

        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <ProgressCard progress={progress} />

          <StatCard
            icon={<Target className="w-8 h-8" />}
            value={patientData?.goal || 'Não definido'}
            label="Seu Objetivo"
          />

          <StatCard
            icon={<Calendar className="w-8 h-8" />}
            value={mealPlanData?.mealsPerDay || '4'}
            label="Refeições/Dia"
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <TodaysMeals mealPlan={mealPlan} />
        </motion.div>

        <motion.div variants={staggerItem}>
          <ChatWidget />
        </motion.div>
      </motion.div>
    </PatientLayout>
  );
}
