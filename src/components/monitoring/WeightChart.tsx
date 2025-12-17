import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
      <Card className={`border-border/50 ${className}`}>
        {showHeader && (
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              Evolução do Peso
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="pt-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Scale className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">Nenhum peso registrado ainda</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Comece hoje a acompanhar sua evolução!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-border/50 ${className}`}>
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              Evolução do Peso
            </CardTitle>
            {trend.type !== 'neutral' && (
              <div className={`flex items-center gap-1 text-sm ${
                trend.type === 'down' ? 'text-success' : 'text-warning'
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
        </CardHeader>
      )}
      <CardContent className="pt-4">
        {/* Current Weight Display */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-4xl font-bold text-foreground">{currentWeight}</span>
          <span className="text-lg text-muted-foreground">kg</span>
        </div>

        {/* Chart */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
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
                      <div className="bg-card border border-border/50 rounded-lg shadow-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground">{payload[0].payload.fullDate}</p>
                        <p className="font-semibold text-foreground">{payload[0].value} kg</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={2.5}
                fill="url(#weightGradient)"
                dot={{ fill: 'hsl(160, 84%, 39%)', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: 'hsl(160, 84%, 39%)', strokeWidth: 2, stroke: 'white', r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
