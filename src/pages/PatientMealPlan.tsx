/**
 * PatientMealPlan - Current meal plan view
 * Displays full meal plan with nutrition details and completion tracking
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { MealPlanViewer } from '@/components/patient/mealplan/MealPlanViewer';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion-variants';
import { supabase } from '@/integrations/supabase/client';

export default function PatientMealPlan() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { mealPlan, isLoading, error } = usePatientData(user?.id || '');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleMarkMealDone = async (mealId: string) => {
    if (!user) return;

    try {
      // Update meal completion in Supabase
      const { error } = await supabase
        .from('meal_completions')
        .insert({
          patient_id: user.id,
          meal_id: mealId,
          completed_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error marking meal as done:', error);
      }
    } catch (err) {
      console.error('Error marking meal as done:', err);
    }
  };

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

  return (
    <PatientLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="space-y-6 p-6 max-w-7xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-foreground">Meu Plano Alimentar</h1>

        <MealPlanViewer
          mealPlan={mealPlan}
          onMarkMealDone={handleMarkMealDone}
        />
      </motion.div>
    </PatientLayout>
  );
}
