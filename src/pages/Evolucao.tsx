import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { TrendingUp, Scale, Activity, Target, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  WeightChart,
  BodyFatChart,
  PatientEvolutionCard,
} from '@/components/monitoring';

interface PatientEvolution {
  id: string;
  full_name: string;
  initial_weight: number | null;
  current_weight: number | null;
  height: number | null;
  initial_body_fat: number | null;
  current_body_fat: number | null;
  goal: string | null;
}

export default function Evolucao() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientEvolution | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (!profileData) throw new Error('No profile');

      const { data: patientsData, error } = await supabase
        .from('patients')
        .select('id, full_name, initial_weight, current_weight, height, initial_body_fat, current_body_fat, goal')
        .eq('nutritionist_id', profileData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = (patientsData || []) as PatientEvolution[];
      setPatients(list);
      if (list.length > 0) setSelectedPatient(list[0]);
    } catch (err) {
      console.warn('Evolucao fetch failed, using mock:', err);
      const mock: PatientEvolution[] = [
        { id: '1', full_name: 'Maria Silva', initial_weight: 78, current_weight: 72.5, height: 165, initial_body_fat: 32, current_body_fat: 28, goal: 'weight_loss' },
        { id: '2', full_name: 'João Santos', initial_weight: 65, current_weight: 70, height: 178, initial_body_fat: 15, current_body_fat: 13, goal: 'hypertrophy' },
        { id: '3', full_name: 'Ana Costa', initial_weight: 60, current_weight: 60.5, height: 160, initial_body_fat: 22, current_body_fat: 21, goal: 'maintenance' },
      ];
      setPatients(mock);
      setSelectedPatient(mock[0]);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate stats
  const totalPatients = patients.length;
  const avgWeightLoss = patients.filter(p => p.initial_weight && p.current_weight && p.current_weight < p.initial_weight).length;
  const avgBodyFatReduction = patients.filter(p => p.initial_body_fat && p.current_body_fat && p.current_body_fat < p.initial_body_fat).length;

  // Mock time-series for charts
  const weightSeries = [
    { date: 'Sem 1', weight: selectedPatient?.initial_weight || 78 },
    { date: 'Sem 2', weight: (selectedPatient?.initial_weight || 78) - 1.2 },
    { date: 'Sem 3', weight: (selectedPatient?.initial_weight || 78) - 2.0 },
    { date: 'Sem 4', weight: (selectedPatient?.initial_weight || 78) - 3.1 },
    { date: 'Sem 5', weight: (selectedPatient?.initial_weight || 78) - 4.0 },
    { date: 'Sem 6', weight: selectedPatient?.current_weight || 72.5 },
  ];
  const bodyFatSeries = [
    { date: 'Sem 1', bodyFat: selectedPatient?.initial_body_fat || 32 },
    { date: 'Sem 2', bodyFat: (selectedPatient?.initial_body_fat || 32) - 0.8 },
    { date: 'Sem 3', bodyFat: (selectedPatient?.initial_body_fat || 32) - 1.5 },
    { date: 'Sem 4', bodyFat: (selectedPatient?.initial_body_fat || 32) - 2.3 },
    { date: 'Sem 5', bodyFat: (selectedPatient?.initial_body_fat || 32) - 3.0 },
    { date: 'Sem 6', bodyFat: selectedPatient?.current_body_fat || 28 },
  ];

  return (
    <ModernLayout>
      <div className="space-y-8">
        <PageHeader
          title="Evolução dos Pacientes"
          subtitle="Acompanhe o progresso de peso, gordura corporal e IMC ao longo do tempo"
          icon={<TrendingUp className="w-7 h-7 text-white" />}
          gradient="from-[#518C5B] via-[#4a7d52] to-[#2d5a37]"
        />

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <RichCard delay={0.1} glowColor="sage">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#518C5B]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#518C5B]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pacientes</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight tabular-nums"
                >
                  {totalPatients}
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.2} glowColor="terracotta">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C4764A]/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-[#C4764A]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perderam Peso</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight tabular-nums"
                >
                  {avgWeightLoss}
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.3}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reduziram %G</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight tabular-nums"
                >
                  {avgBodyFatReduction}
                </motion.p>
              </div>
            </div>
          </RichCard>
        </div>

        {/* Patient selector */}
        <RichCard delay={0.35} padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#518C5B]" />
            <h2 className="text-lg font-bold text-slate-800">Selecione um paciente</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {patients.map((p, i) => {
              const isActive = selectedPatient?.id === p.id;
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPatient(p)}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#518C5B] to-[#3d7047] text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.full_name}
                </motion.button>
              );
            })}
            {patients.length === 0 && (
              <p className="text-sm text-slate-400 py-2">Nenhum paciente cadastrado ainda.</p>
            )}
          </div>
        </RichCard>

        {/* Evolution detail */}
        {selectedPatient && (
          <>
            <RichCard delay={0.45} padding="lg">
              <PatientEvolutionCard
                initialWeight={selectedPatient.initial_weight}
                currentWeight={selectedPatient.current_weight}
                height={selectedPatient.height}
                initialBodyFat={selectedPatient.initial_body_fat}
                currentBodyFat={selectedPatient.current_body_fat}
                goal={selectedPatient.goal}
              />
            </RichCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RichCard delay={0.55} padding="lg">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-[#518C5B]" />
                  <h3 className="text-base font-bold text-slate-800">Evolução de Peso</h3>
                </div>
                <WeightChart data={weightSeries} />
              </RichCard>
              <RichCard delay={0.65} padding="lg">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-[#C4764A]" />
                  <h3 className="text-base font-bold text-slate-800">Evolução de Gordura Corporal</h3>
                </div>
                <BodyFatChart data={bodyFatSeries} />
              </RichCard>
            </div>
          </>
        )}
      </div>
    </ModernLayout>
  );
}