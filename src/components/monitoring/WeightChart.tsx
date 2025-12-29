import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GlassCard } from '@/components/ui/GlassCard';

interface WeightLog {
  id: string;
  weight: number;
  recorded_at: string;
}

interface WeightChartProps {
  data: WeightLog[];
  showHeader?: boolean;
  className?: string;
}

export function WeightChart({ data, showHeader = true, className }: WeightChartProps) {
  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map(log => ({
        date: format(parseISO(log.recorded_at), 'dd/MM', { locale: ptBR }),
        fullDate: format(parseISO(log.recorded_at), "d 'de' MMM", { locale: ptBR }),
        weight: Number(log.weight),
      }));
  }, [data]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return { type: 'neutral' as const, diff: 0 };
    const first = chartData[0].weight;
    const last = chartData[chartData.length - 1].weight;
    const diff = last - first;
    return {
      type: diff < 0 ? 'down' as const : diff > 0 ? 'up' as const : 'neutral' as const,
      diff: Math.abs(diff).toFixed(1),
    };
  }, [chartData]);

  const currentWeight = chartData.length > 0 ? chartData[chartData.length - 1].weight : null;

  if (data.length === 0) {
    return (
      <GlassCard variant="default" className={className}>
        {showHeader && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyber-lime/10 flex items-center justify-center border border-cyber-lime/30">
              <Scale className="w-5 h-5 text-cyber-lime" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Evolução do Peso</h3>
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Scale className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground font-medium">Nenhum peso registrado ainda</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Comece hoje a acompanhar sua evolução!</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="default" className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyber-lime/10 flex items-center justify-center border border-cyber-lime/30">
              <Scale className="w-5 h-5 text-cyber-lime" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Evolução do Peso</h3>
          </div>
          {trend.type !== 'neutral' && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
              trend.type === 'down' 
                ? 'bg-cyber-lime/10 text-cyber-lime border border-cyber-lime/30' 
                : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
            }`}>
              {trend.type === 'down' ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span>{trend.diff} kg</span>
            </div>
          )}
        </div>
      )}

      {/* Current Weight Display */}
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-5xl font-bold bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent">
          {currentWeight}
        </span>
        <span className="text-lg text-muted-foreground font-mono">kg</span>
      </div>

      {/* Chart */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="weightGradientNeon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DFFF00" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#DFFF00" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#DFFF00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              dy={10}
            />
            <YAxis 
              domain={['dataMin - 1', 'dataMax + 1']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}`}
              width={35}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-strong rounded-xl px-4 py-3 border border-white/10 shadow-lg shadow-cyber-lime/10">
                      <p className="text-xs text-muted-foreground font-mono">{payload[0].payload.fullDate}</p>
                      <p className="text-lg font-bold text-cyber-lime">{payload[0].value} kg</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#DFFF00"
              strokeWidth={2.5}
              fill="url(#weightGradientNeon)"
              dot={{ fill: '#DFFF00', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: '#DFFF00', strokeWidth: 3, stroke: 'rgba(223, 255, 0, 0.3)', r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
