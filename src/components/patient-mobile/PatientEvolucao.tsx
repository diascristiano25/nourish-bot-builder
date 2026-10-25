import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Plus, Scale, Camera } from 'lucide-react';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientEvolucaoProps {
  patientId: string;
}

interface WeightLog {
  id: string;
  weight: number;
  measured_at: string;
}

export function PatientEvolucao({ patientId }: PatientEvolucaoProps) {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) fetchWeightLogs();
  }, [patientId]);

  const fetchWeightLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('id, weight, measured_at')
        .eq('patient_id', patientId)
        .order('measured_at', { ascending: true })
        .limit(30);
      if (error) throw error;
      setWeightLogs(data || []);
    } catch (error) {
      console.error('Error fetching weight logs:', error);
      setWeightLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = weightLogs.map(log => ({
    date: format(new Date(log.measured_at), 'dd/MM', { locale: ptBR }),
    weight: Number(log.weight),
  }));

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 0;
  const firstWeight = weightLogs.length > 0 ? weightLogs[0].weight : currentWeight;
  const totalDiff = currentWeight - firstWeight;
  const isLosing = totalDiff < 0;

  const handleAddWeight = () => {
    const weight = prompt('Digite seu peso atual (kg):');
    if (weight && !isNaN(Number(weight))) {
      supabase
        .from('weight_logs')
        .insert({ patient_id: patientId, weight: Number(weight), measured_at: new Date().toISOString() })
        .then(() => fetchWeightLogs());
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border/60 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-semibold text-foreground tabular-nums">{payload[0].value} kg</p>
          <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="px-4 pt-4">
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4">
      <header className="mb-5">
        <h1 className="text-xl font-semibold text-foreground">Evolução</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Acompanhe seu progresso</p>
      </header>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#518C5B]/10 flex items-center justify-center">
                <Scale className="w-4 h-4 text-[#518C5B]" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Peso atual</span>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-none tabular-nums">
              {currentWeight > 0 ? currentWeight.toFixed(1) : '—'}
              <span className="text-sm font-normal text-muted-foreground"> kg</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                totalDiff === 0 ? 'bg-muted' : isLosing ? 'bg-[#518C5B]/10' : 'bg-[#C4764A]/10'
              }`}>
                {totalDiff === 0 ? (
                  <Scale className="w-4 h-4 text-muted-foreground" />
                ) : isLosing ? (
                  <TrendingDown className="w-4 h-4 text-[#518C5B]" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-[#C4764A]" />
                )}
              </div>
              <span className="text-xs font-medium text-muted-foreground">Variação</span>
            </div>
            <p className={`text-2xl font-semibold leading-none tabular-nums ${
              totalDiff === 0 ? 'text-foreground' : isLosing ? 'text-[#518C5B]' : 'text-[#C4764A]'
            }`}>
              {totalDiff === 0 ? '0.0' : `${totalDiff > 0 ? '+' : ''}${totalDiff.toFixed(1)}`}
              <span className="text-sm font-normal text-muted-foreground"> kg</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weight Chart */}
      <Card className="border-border/60 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Curva de Peso</h2>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs rounded-lg border-border/70"
              onClick={handleAddWeight}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Registrar
            </Button>
          </div>
          {chartData.length > 1 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#518C5B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#518C5B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#518C5B"
                    strokeWidth={2}
                    fill="url(#weightGradient)"
                    dot={{ r: 3, fill: '#518C5B' }}
                    activeDot={{ r: 5, fill: '#518C5B' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <Scale className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {chartData.length === 1 ? 'Registre mais pesos para ver sua curva' : 'Nenhum registro de peso ainda'}
              </p>
              <Button variant="outline" size="sm" className="mt-3 rounded-lg border-border/70" onClick={handleAddWeight}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Registrar primeiro peso
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos placeholder — honest empty state instead of dummy data */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Fotos de Evolução</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-muted/40 border border-dashed border-border/60 flex flex-col items-center justify-center"
              >
                <Camera className="w-5 h-5 text-muted-foreground/40 mb-1" />
                <span className="text-[10px] text-muted-foreground/70">Em breve</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/70 mt-3 text-center">
            O upload de fotos estará disponível em uma próxima atualização.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}