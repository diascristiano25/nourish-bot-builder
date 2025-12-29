import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Percent, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GlassCard } from '@/components/ui/GlassCard';

interface BodyFatRecord {
  id: string;
  body_fat_percentage: number | null;
  measured_at: string;
}

interface BodyFatChartProps {
  data: BodyFatRecord[];
  showHeader?: boolean;
  className?: string;
}

export function BodyFatChart({ data, showHeader = true, className }: BodyFatChartProps) {
  const chartData = useMemo(() => {
    return data
      .filter(record => record.body_fat_percentage !== null)
      .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
      .map(record => ({
        date: format(parseISO(record.measured_at), 'dd/MM', { locale: ptBR }),
        fullDate: format(parseISO(record.measured_at), "d 'de' MMM", { locale: ptBR }),
        bodyFat: Number(record.body_fat_percentage),
      }));
  }, [data]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return { type: 'neutral' as const, diff: 0 };
    const first = chartData[0].bodyFat;
    const last = chartData[chartData.length - 1].bodyFat;
    const diff = last - first;
    return {
      type: diff < 0 ? 'down' as const : diff > 0 ? 'up' as const : 'neutral' as const,
      diff: Math.abs(diff).toFixed(1),
    };
  }, [chartData]);

  const currentBodyFat = chartData.length > 0 ? chartData[chartData.length - 1].bodyFat : null;

  // Generate radar data for body composition visualization
  const radarData = useMemo(() => {
    if (!currentBodyFat) return [];
    const leanMass = 100 - currentBodyFat;
    return [
      { metric: 'Gordura', value: currentBodyFat, fullMark: 100 },
      { metric: 'Massa Magra', value: leanMass, fullMark: 100 },
      { metric: 'Hidratação', value: Math.min(75 + Math.random() * 15, 100), fullMark: 100 },
      { metric: 'Metabolismo', value: Math.min(60 + Math.random() * 25, 100), fullMark: 100 },
      { metric: 'Energia', value: Math.min(55 + Math.random() * 30, 100), fullMark: 100 },
    ];
  }, [currentBodyFat]);

  if (chartData.length === 0) {
    return (
      <GlassCard variant="default" className={className}>
        {showHeader && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-electric-violet/10 flex items-center justify-center border border-electric-violet/30">
              <Percent className="w-5 h-5 text-electric-violet" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Gordura Corporal</h3>
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
            <Percent className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground text-sm">Nenhum registro de gordura corporal</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="default" className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric-violet/10 flex items-center justify-center border border-electric-violet/30">
              <Zap className="w-5 h-5 text-electric-violet" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Bioimpedância</h3>
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
              <span>{trend.diff}%</span>
            </div>
          )}
        </div>
      )}

      {/* Current Body Fat Display */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold bg-gradient-to-r from-electric-violet to-cyber-lime bg-clip-text text-transparent">
          {currentBodyFat}
        </span>
        <span className="text-lg text-muted-foreground font-mono">%</span>
        <span className="text-xs text-muted-foreground ml-2">gordura corporal</span>
      </div>

      {/* Radar Chart for Bio Metrics */}
      <div className="h-44 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid 
              stroke="rgba(255,255,255,0.1)" 
              strokeDasharray="3 3"
            />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Radar
              name="Composição"
              dataKey="value"
              stroke="#8B5CF6"
              fill="url(#radarGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#DFFF00" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Area Chart */}
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="bodyFatGradientNeon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              dy={8}
            />
            <YAxis 
              domain={['dataMin - 2', 'dataMax + 2']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}%`}
              width={40}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-strong rounded-xl px-4 py-3 border border-white/10 shadow-lg shadow-electric-violet/10">
                      <p className="text-xs text-muted-foreground font-mono">{payload[0].payload.fullDate}</p>
                      <p className="text-lg font-bold text-electric-violet">{payload[0].value}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="bodyFat"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#bodyFatGradientNeon)"
              dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 2.5 }}
              activeDot={{ fill: '#8B5CF6', strokeWidth: 3, stroke: 'rgba(139, 92, 246, 0.3)', r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
