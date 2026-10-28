/**
 * PatientProgress - Progress tracking page
 * Shows weight/measurement tracking chart and progress summary
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProgressChart } from '@/components/patient/progress/ProgressChart';
import { ExerciseTracker } from '@/components/monitoring/ExerciseTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';
import { TrendingDown, Target, Calendar, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import metValuesData from '@/data/met-values.json';

interface ExerciseLog {
  id: string;
  date: string;
  type: string;
  duration_min: number;
  intensity: string | null;
  calories_burned: number | null;
}

export default function PatientProgress() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { progress, patient, isLoading, error } = usePatientData(user?.id || '');
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [totalDiaryCalories, setTotalDiaryCalories] = useState<number>(0);
  const [loadingExercises, setLoadingExercises] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.id) {
      fetchExerciseLogs();
      fetchTodayDiaryCalories();
    }
  }, [user?.id]);

  async function fetchExerciseLogs() {
    try {
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('patient_id', user!.id)
        .order('date', { ascending: false })
        .limit(10);

      if (!error && data) {
        setExerciseLogs(data);
      }
    } catch (err) {
      console.error('Error fetching exercise logs:', err);
    } finally {
      setLoadingExercises(false);
    }
  }

  async function fetchTodayDiaryCalories() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('food_diary')
        .select('calories')
        .eq('patient_id', user!.id)
        .eq('date', today);

      if (!error && data) {
        const total = data.reduce((sum, entry) => sum + (entry.calories || 0), 0);
        setTotalDiaryCalories(total);
      }
    } catch (err) {
      console.error('Error fetching diary calories:', err);
    }
  }

  const handleSaveExercise = async (exercise: { type: string; durationMin: number; caloriesBurned: number }) => {
    try {
      const { error } = await supabase.from('exercise_logs').insert({
        patient_id: user!.id,
        date: new Date().toISOString().split('T')[0],
        type: exercise.type,
        duration_min: exercise.durationMin,
        calories_burned: exercise.caloriesBurned,
      });

      if (!error) {
        fetchExerciseLogs();
      }
    } catch (err) {
      console.error('Error saving exercise:', err);
    }
  };

  const totalExerciseCalories = exerciseLogs
    .filter((log) => log.date === new Date().toISOString().split('T')[0])
    .reduce((sum, log) => sum + (log.calories_burned || 0), 0);

  const netEnergyBalance = totalDiaryCalories - totalExerciseCalories;

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
        <motion.h1 variants={staggerItem} className="text-3xl font-bold text-foreground">
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
                <h3 className="text-xl font-bold text-foreground mb-2">Parabéns pelo seu progresso!</h3>
                <p className="text-foreground">
                  Você perdeu <strong className="text-teal-600">{totalWeightLost.toFixed(1)} kg</strong> desde o início.
                </p>
                <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
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

        {/* Exercise Tracker & Energy Balance */}
        <motion.div variants={staggerItem} className="grid md:grid-cols-2 gap-6">
          {/* Exercise Tracker */}
          <ExerciseTracker
            patientId={user!.id}
            weightKg={latestWeight || patient.data?.weight || 70}
            onSave={handleSaveExercise}
            loading={loadingExercises}
          />

          {/* Energy Balance Card */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: '#C4764A' }} />
                Balanço Energético de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Calorias ingeridas (diário)</span>
                <span className="font-semibold" style={{ color: '#518C5B' }}>{totalDiaryCalories} kcal</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Calorias gastas (exercícios)</span>
                <span className="font-semibold" style={{ color: '#C4764A' }}>{totalExerciseCalories} kcal</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-muted/30 rounded-xl px-4">
                <span className="text-sm font-medium">Balanço líquido</span>
                <span className="text-xl font-bold" style={{ color: netEnergyBalance >= 0 ? '#518C5B' : '#C4764A' }}>
                  {netEnergyBalance >= 0 ? '+' : ''}{netEnergyBalance} kcal
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Exercise History */}
        {exerciseLogs.length > 0 && (
          <motion.div variants={staggerItem} className="bg-card p-6 rounded-lg border border-blue-200 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5" style={{ color: '#C4764A' }} />
              Histórico de Exercícios Recentes
            </h3>
            <div className="space-y-3">
              {exerciseLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{metValuesData.find(e => e.type === log.type)?.label || log.type}</p>
                    <p className="text-sm text-muted-foreground">{new Date(log.date).toLocaleDateString('pt-BR')} • {log.duration_min} min</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: '#C4764A' }}>{log.calories_burned || 0} kcal</p>
                    {log.intensity && (
                      <p className="text-xs text-muted-foreground capitalize">{log.intensity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          variants={staggerItem}
          className="bg-card p-6 rounded-lg border border-blue-200 shadow-sm"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Dicas para Manter o Progresso</h3>
          <ul className="space-y-3 text-foreground">
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
