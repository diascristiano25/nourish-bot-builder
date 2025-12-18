import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, TrendingDown, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  if (chartData.length === 0) {
    return (
      <Card className={`border-border/50 ${className}`}>
        {showHeader && (
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Percent className="w-4 h-4 text-info" />
              Gordura Corporal
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="pt-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Percent className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm">Nenhum registro de gordura corporal</p>
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
              <Percent className="w-4 h-4 text-info" />
              Gordura Corporal
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
                <span>{trend.diff}%</span>
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="pt-4">
        {/* Current Body Fat Display */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-foreground">{currentBodyFat}</span>
          <span className="text-lg text-muted-foreground">%</span>
        </div>

        {/* Chart */}
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="bodyFatGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(200, 98%, 39%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(200, 98%, 39%)" stopOpacity={0} />
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
                      <div className="bg-card border border-border/50 rounded-lg shadow-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground">{payload[0].payload.fullDate}</p>
                        <p className="font-semibold text-foreground">{payload[0].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="bodyFat"
                stroke="hsl(200, 98%, 39%)"
                strokeWidth={2}
                fill="url(#bodyFatGradient)"
                dot={{ fill: 'hsl(200, 98%, 39%)', strokeWidth: 0, r: 2.5 }}
                activeDot={{ fill: 'hsl(200, 98%, 39%)', strokeWidth: 2, stroke: 'white', r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
