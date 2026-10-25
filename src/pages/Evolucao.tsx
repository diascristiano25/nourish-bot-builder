import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import {
  TrendingUp,
  Scale,
  Activity,
  Target,
  Users,
  TrendingDown,
  Minus,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientRow {
  id: string;
  full_name: string;
  goal: string | null;
}

interface AnthroPoint {
  id: string;
  weight: number | null;
  height: number | null;
  body_fat_percentage: number | null;
  measured_at: string;
}

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde Geral',
  performance: 'Performance',
};

// Normaliza qualquer registro de medição (anthropometrics ou weight_logs)
// para o formato { id, weight, body_fat_percentage, measured_at } usado pelos gráficos.
function normalizePoint(row: any, index: number): AnthroPoint {
  const measuredAt = row.measured_at || row.date || row.created_at || new Date().toISOString();
  return {
    id: row.id || `point-${index}`,
    weight: row.weight != null ? Number(row.weight) : null,
    height: row.height != null ? Number(row.height) : null,
    body_fat_percentage:
      row.body_fat_percentage != null ? Number(row.body_fat_percentage) : null,
    measured_at: String(measuredAt),
  };
}

function EvolutionAreaChart({
  data,
  stroke,
  gradientId,
  unit,
  emptyLabel,
}: {
  data: { date: string; value: number }[];
  stroke: string;
  gradientId: string;
  unit: string;
  emptyLabel: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
          <Activity className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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

function EvolutionSummaryCard({
  points,
  goal,
}: {
  points: AnthroPoint[];
  goal: string | null;
}) {
  const sorted = useMemo(
    () => [...points].sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()),
    [points]
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const bmi = useMemo(() => {
    if (!last?.weight || !last?.height) return null;
    const heightM = last.height / 100;
    return last.weight / (heightM * heightM);
  }, [last]);

  const bmiInfo = useMemo(() => {
    if (!bmi) return { label: '—', barClass: 'bg-border', textClass: 'text-muted-foreground', bgClass: 'bg-muted' };
    if (bmi < 18.5) return { label: 'Abaixo do peso', barClass: 'bg-blue-400', textClass: 'text-blue-600', bgClass: 'bg-blue-50' };
    if (bmi < 25) return { label: 'Peso normal', barClass: 'bg-[#518C5B]', textClass: 'text-[#518C5B]', bgClass: 'bg-[#518C5B]/10' };
    if (bmi < 30) return { label: 'Sobrepeso', barClass: 'bg-[#C4764A]', textClass: 'text-[#C4764A]', bgClass: 'bg-[#C4764A]/10' };
    return { label: 'Obesidade', barClass: 'bg-red-500', textClass: 'text-red-600', bgClass: 'bg-red-50' };
  }, [bmi]);

  const weightDiff = useMemo(() => {
    if (first?.weight == null || last?.weight == null) return null;
    return last.weight - first.weight;
  }, [first, last]);

  const bodyFatDiff = useMemo(() => {
    if (first?.body_fat_percentage == null || last?.body_fat_percentage == null) return null;
    return last.body_fat_percentage - first.body_fat_percentage;
  }, [first, last]);

  const isGoalPositive = useMemo(() => {
    if (weightDiff == null || !goal) return null;
    if (goal === 'weight_loss' && weightDiff < 0) return true;
    if (goal === 'hypertrophy' && weightDiff > 0) return true;
    if (goal === 'maintenance' && Math.abs(weightDiff) < 1) return true;
    return false;
  }, [weightDiff, goal]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-muted-foreground font-medium">Nenhuma medição registrada para este paciente</p>
        <p className="text-sm text-muted-foreground mt-1">Registre peso e medidas na ficha do paciente para ver a evolução.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className={`h-1.5 rounded-full ${bmiInfo.barClass} mb-4`} />
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#518C5B]" />
          <h3 className="text-base font-bold text-foreground">Índice de Massa Corporal (IMC)</h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground tabular-nums">
              {bmi ? bmi.toFixed(1) : '-'}
            </span>
            <span className="text-sm text-muted-foreground">kg/m²</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bmiInfo.bgClass} ${bmiInfo.textClass}`}>
            {bmiInfo.label}
          </span>
        </div>
        {last?.height && last?.weight && (
          <p className="text-xs text-muted-foreground mt-2">
            Baseado em {last.weight}kg e {last.height}cm
          </p>
        )}
      </div>

      {first?.weight != null && last?.weight != null && (
        <div className="pt-5 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-[#518C5B]" />
            <h3 className="text-base font-bold text-foreground">Comparativo de Evolução</h3>
            {goal && (
              <span className="ml-auto text-xs font-medium text-muted-foreground border border-border px-2.5 py-1 rounded-full">
                {goalLabels[goal] || goal}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center p-4 rounded-2xl bg-secondary">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Inicial</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{first.weight.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">kg</p>
            </div>
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${
                  isGoalPositive ? 'bg-[#518C5B]/10' : weightDiff !== 0 ? 'bg-[#C4764A]/10' : 'bg-secondary'
                }`}
              >
                {weightDiff != null && weightDiff < 0 ? (
                  <TrendingDown className={`w-6 h-6 ${isGoalPositive ? 'text-[#518C5B]' : 'text-[#C4764A]'}`} />
                ) : weightDiff != null && weightDiff > 0 ? (
                  <TrendingUp className={`w-6 h-6 ${isGoalPositive ? 'text-[#518C5B]' : 'text-[#C4764A]'}`} />
                ) : (
                  <Minus className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <p className={`text-lg font-bold mt-2 tabular-nums ${isGoalPositive ? 'text-[#518C5B]' : 'text-foreground'}`}>
                {weightDiff != null && weightDiff > 0 ? '+' : ''}
                {weightDiff != null ? weightDiff.toFixed(1) : '0'} kg
              </p>
              {isGoalPositive && (
                <div className="flex items-center justify-center gap-1 text-xs text-[#518C5B] mt-1">
                  <Sparkles className="w-3 h-3" />
                  No caminho certo!
                </div>
              )}
            </div>
            <div className="text-center p-4 rounded-2xl bg-[#518C5B]/10 border border-[#518C5B]/20">
              <p className="text-xs text-[#518C5B] uppercase tracking-wider mb-1">Atual</p>
              <p className="text-2xl font-bold text-[#518C5B] tabular-nums">{last.weight.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">kg</p>
            </div>
          </div>

          {first.body_fat_percentage != null && last.body_fat_percentage != null && (
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gordura Corporal</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground tabular-nums">{first.body_fat_percentage.toFixed(1)}%</span>
                  <span className="text-slate-300">→</span>
                  <span className="font-medium text-foreground tabular-nums">{last.body_fat_percentage.toFixed(1)}%</span>
                  {bodyFatDiff != null && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                        bodyFatDiff < 0 ? 'bg-[#518C5B]/10 text-[#518C5B]' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {bodyFatDiff > 0 ? '+' : ''}
                      {bodyFatDiff.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Evolucao() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [points, setPoints] = useState<AnthroPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [pointsLoading, setPointsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  // Busca os pacientes reais do nutricionista logado
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (!profileData) throw new Error('No profile');

        const { data: patientsData, error } = await supabase
          .from('patients')
          .select('id, full_name, goal')
          .eq('nutritionist_id', profileData.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (cancelled) return;

        const list = (patientsData || []) as PatientRow[];
        setPatients(list);
        setSelectedId(list[0]?.id ?? null);
      } catch (err) {
        console.warn('Evolucao: falha ao buscar pacientes:', err);
        if (!cancelled) setPatients([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPatients();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedId) ?? null,
    [patients, selectedId]
  );

  // Busca as medições reais (anthropometrics + weight_logs) do paciente selecionado
  useEffect(() => {
    if (!selectedId) {
      setPoints([]);
      return;
    }
    let cancelled = false;
    const fetchPoints = async () => {
      try {
        setPointsLoading(true);
        const [anthroRes, weightRes] = await Promise.all([
          supabase
            .from('anthropometrics')
            .select('id, weight, height, body_fat_percentage, measured_at')
            .eq('patient_id', selectedId)
            .order('measured_at', { ascending: true }),
          supabase
            .from('weight_logs')
            .select('id, weight, date')
            .eq('patient_id', selectedId)
            .order('date', { ascending: true }),
        ]);

        if (cancelled) return;
        const merged: AnthroPoint[] = [
          ...(anthroRes.data || []).map(normalizePoint),
          ...(weightRes.data || []).map((r: any, i: number) =>
            normalizePoint({ ...r, measured_at: r.date }, i + 1000)
          ),
        ]
          .filter((p) => p.weight != null || p.body_fat_percentage != null)
          .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());

        setPoints(merged);
      } catch (err) {
        console.warn('Evolucao: falha ao buscar medições:', err);
        if (!cancelled) setPoints([]);
      } finally {
        if (!cancelled) setPointsLoading(false);
      }
    };
    fetchPoints();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Estatísticas agregadas calculadas sobre os pacientes + suas últimas medições não são
  // viáveis sem N queries; usamos contagens simples de pacientes aqui.
  const totalPatients = patients.length;

  const weightSeries = useMemo(
    () =>
      points
        .filter((p) => p.weight != null)
        .map((p) => ({
          date: format(new Date(p.measured_at), 'dd/MM', { locale: ptBR }),
          value: Number(p.weight),
        })),
    [points]
  );

  const bodyFatSeries = useMemo(
    () =>
      points
        .filter((p) => p.body_fat_percentage != null)
        .map((p) => ({
          date: format(new Date(p.measured_at), 'dd/MM', { locale: ptBR }),
          value: Number(p.body_fat_percentage),
        })),
    [points]
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <RichCard delay={0.1} glowColor="sage">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#518C5B]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#518C5B]" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pacientes</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-2xl font-bold text-foreground leading-tight tabular-nums"
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
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Medições</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-2xl font-bold text-foreground leading-tight tabular-nums"
                >
                  {pointsLoading ? '—' : points.length}
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
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selecionado</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="text-base font-bold text-foreground leading-tight truncate"
                >
                  {selectedPatient?.full_name || '—'}
                </motion.p>
              </div>
            </div>
          </RichCard>
        </div>

        <RichCard delay={0.35} padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#518C5B]" />
            <h2 className="text-lg font-bold text-foreground">Selecione um paciente</h2>
          </div>
          {loading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-28 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Nenhum paciente cadastrado ainda.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {patients.map((p, i) => {
                const isActive = selectedId === p.id;
                return (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedId(p.id)}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#518C5B] to-[#3d7047] text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-muted text-muted-foreground hover:bg-border'
                    }`}
                  >
                    {p.full_name}
                  </motion.button>
                );
              })}
            </div>
          )}
        </RichCard>

        {selectedPatient && (
          <>
            <RichCard delay={0.45} padding="lg">
              {pointsLoading ? (
                <div className="space-y-4">
                  <div className="h-24 bg-muted rounded-2xl animate-pulse" />
                  <div className="h-32 bg-muted rounded-2xl animate-pulse" />
                </div>
              ) : (
                <EvolutionSummaryCard points={points} goal={selectedPatient.goal} />
              )}
            </RichCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RichCard delay={0.55} padding="lg">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-[#518C5B]" />
                  <h3 className="text-base font-bold text-foreground">Evolução de Peso</h3>
                </div>
                {pointsLoading ? (
                  <div className="h-56 bg-muted rounded-2xl animate-pulse" />
                ) : (
                  <EvolutionAreaChart
                    data={weightSeries}
                    stroke="#518C5B"
                    gradientId="evoWeightGrad"
                    unit="kg"
                    emptyLabel="Nenhum peso registrado para este paciente"
                  />
                )}
              </RichCard>
              <RichCard delay={0.65} padding="lg">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-[#C4764A]" />
                  <h3 className="text-base font-bold text-foreground">Evolução de Gordura Corporal</h3>
                </div>
                {pointsLoading ? (
                  <div className="h-56 bg-muted rounded-2xl animate-pulse" />
                ) : (
                  <EvolutionAreaChart
                    data={bodyFatSeries}
                    stroke="#C4764A"
                    gradientId="evoFatGrad"
                    unit="%"
                    emptyLabel="Nenhuma medição de gordura registrada"
                  />
                )}
              </RichCard>
            </div>
          </>
        )}
      </div>
    </ModernLayout>
  );
}