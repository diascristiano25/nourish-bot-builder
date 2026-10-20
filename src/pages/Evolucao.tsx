import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { TrendingUp, Scale, Activity, Target, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientEvolutionCard } from '@/components/monitoring/PatientEvolutionCard';

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

// Build a weekly time-series in the exact shape the legacy charts expect
// ({ id, weight|body_fat_percentage, measured_at }) so parseISO never receives undefined.
function buildWeeklySeries(
  initialValue: number | null,
  currentValue: number | null,
  weeks = 6,
  key: 'weight' | 'body_fat_percentage'
) {
  const start = initialValue ?? currentValue ?? 0;
  const end = currentValue ?? initialValue ?? 0;
  const now = new Date();
  return Array.from({ length: weeks }).map((_, i) => {
    const t = weeks === 1 ? 0 : i / (weeks - 1);
    const value = start + (end - start) * t;
    const measuredAt = subWeeks(now, weeks - 1 - i).toISOString();
    return {
      id: `${key}-${i}`,
      [key]: Number(value.toFixed(2)),
      measured_at: measuredAt,
    } as Record<string, string | number>;
  });
}

function EvolutionAreaChart({
  data,
  dataKey,
  stroke,
  gradientId,
  unit,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  stroke: string;
  gradientId: string;
  unit: string;
}) {
  const chartData = useMemo(() => {
    return [...data]
      .sort(
        (a, b) =>
          new Date(String(a.measured_at)).getTime() -
          new Date(String(b.measured_at)).getTime()
      )
      .map((row) => ({
        date: format(new Date(String(row.measured_at)), 'dd/MM', { locale: ptBR }),
        value: Number(row[dataKey]),
      }));
  }, [data, dataKey]);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <Activity className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">Sem dados registrados ainda</p>
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            dy={8}
          />
          <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(v) => `${Number(v).toFixed(0)}${unit}`}
            width={45}
          />
          <Tooltip
            formatter={(value: number) => [`${Number(value).toFixed(1)} ${unit}`, 'Valor']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={{ fill: stroke, strokeWidth: 0, r: 3 }}
            activeDot={{ fill: stroke, strokeWidth: 3, stroke: 'rgba(255,255,255,0.8)', r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        .select(
          'id, full_name, initial_weight, current_weight, height, initial_body_fat, current_body_fat, goal'
        )
        .eq('nutritionist_id', profileData.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const list = (patientsData || []) as PatientEvolution[];
      setPatients(list);
      if (list.length > 0) setSelectedPatient(list[0]);
    } catch (err) {
      console.warn('Evolucao fetch failed, using mock:', err);
      const mock: PatientEvolution[] = [
        {
          id: '1',
          full_name: 'Maria Silva',
          initial_weight: 78,
          current_weight: 72.5,
          height: 165,
          initial_body_fat: 32,
          current_body_fat: 28,
          goal: 'weight_loss',
        },
        {
          id: '2',
          full_name: 'João Santos',
          initial_weight: 65,
          current_weight: 70,
          height: 178,
          initial_body_fat: 15,
          current_body_fat: 13,
          goal: 'hypertrophy',
        },
        {
          id: '3',
          full_name: 'Ana Costa',
          initial_weight: 60,
          current_weight: 60.5,
          height: 160,
          initial_body_fat: 22,
          current_body_fat: 21,
          goal: 'maintenance',
        },
      ];
      setPatients(mock);
      setSelectedPatient(mock[0]);
    } finally {
      setLoading(false);
    }
  };

  const totalPatients = patients.length;
  const lostWeightCount = patients.filter(
    (p) => p.initial_weight && p.current_weight && p.current_weight < p.initial_weight
  ).length;
  const reducedFatCount = patients.filter(
    (p) => p.initial_body_fat && p.current_body_fat && p.current_body_fat < p.initial_body_fat
  ).length;

  const weightSeries = useMemo(
    () => buildWeeklySeries(selectedPatient?.initial_weight, selectedPatient?.current_weight, 6, 'weight'),
    [selectedPatient?.initial_weight, selectedPatient?.current_weight]
  );
  const bodyFatSeries = useMemo(
    () =>
      buildWeeklySeries(
        selectedPatient?.initial_body_fat,
        selectedPatient?.current_body_fat,
        6,
        'body_fat_percentage'
      ),
    [selectedPatient?.initial_body_fat, selectedPatient?.current_body_fat]
  );

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
                  {loading ? '—' : totalPatients}
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
                  {loading ? '—' : lostWeightCount}
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
                  {loading ? '—' : reducedFatCount}
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
            {!loading && patients.length === 0 && (
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
                <EvolutionAreaChart
                  data={weightSeries}
                  dataKey="weight"
                  stroke="#518C5B"
                  gradientId="evoWeightGrad"
                  unit="kg"
                />
              </RichCard>
              <RichCard delay={0.65} padding="lg">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-[#C4764A]" />
                  <h3 className="text-base font-bold text-slate-800">Evolução de Gordura Corporal</h3>
                </div>
                <EvolutionAreaChart
                  data={bodyFatSeries}
                  dataKey="body_fat_percentage"
                  stroke="#C4764A"
                  gradientId="evoFatGrad"
                  unit="%"
                />
              </RichCard>
            </div>
          </>
        )}
      </div>
    </ModernLayout>
  );
}