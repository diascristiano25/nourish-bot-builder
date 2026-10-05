import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  Camera, 
  Plus,
  Scale,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientEvolucaoProps {
  patientId: string;
}

interface WeightLog {
  id: string;
  weight: number;
  recorded_at: string;
}

// Dummy before/after photos
const dummyPhotos = [
  { id: 1, date: '2024-01-15', type: 'before' as const },
  { id: 2, date: '2024-02-15', type: 'progress' as const },
  { id: 3, date: '2024-03-15', type: 'progress' as const },
];

export function PatientEvolucao({ patientId }: PatientEvolucaoProps) {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchWeightLogs();
    }
  }, [patientId]);

  const fetchWeightLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('id, weight, recorded_at')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: true })
        .limit(30);

      if (error) throw error;
      setWeightLogs(data || []);
    } catch (error) {
      console.error('Error fetching weight logs:', error);
      // Use dummy data if no real data
      setWeightLogs([
        { id: '1', weight: 78.5, recorded_at: '2024-01-01' },
        { id: '2', weight: 77.8, recorded_at: '2024-01-15' },
        { id: '3', weight: 77.2, recorded_at: '2024-02-01' },
        { id: '4', weight: 76.5, recorded_at: '2024-02-15' },
        { id: '5', weight: 76.0, recorded_at: '2024-03-01' },
        { id: '6', weight: 75.3, recorded_at: '2024-03-15' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = weightLogs.map(log => ({
    date: format(new Date(log.recorded_at), 'dd/MM', { locale: ptBR }),
    weight: Number(log.weight),
  }));

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 0;
  const previousWeight = weightLogs.length > 1 ? weightLogs[weightLogs.length - 2].weight : currentWeight;
  const weightDiff = currentWeight - previousWeight;
  const isLosing = weightDiff < 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-semibold text-foreground">{payload[0].value} kg</p>
          <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-4 pt-4 animate-fade-in">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Evolução</h1>
        <p className="text-sm text-muted-foreground">Acompanhe seu progresso</p>
      </header>

      {/* Current Weight Card */}
      <Card className="border-border/50 mb-4 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso atual</p>
                <p className="text-2xl font-bold text-foreground">
                  {currentWeight.toFixed(1)} kg
                </p>
              </div>
            </div>
            {weightDiff !== 0 && (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                isLosing 
                  ? 'bg-success/20 text-success' 
                  : 'bg-warning/20 text-warning'
              }`}>
                {isLosing ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {Math.abs(weightDiff).toFixed(1)} kg
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weight Chart */}
      <Card className="border-border/50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground">Evolução do Peso</h2>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Adicionar
            </Button>
          </div>
          
          {chartData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
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
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#weightGradient)"
                    dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Nenhum registro de peso ainda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Before & After Photos */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground">Antes e Depois</h2>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              <Camera className="w-3.5 h-3.5 mr-1" />
              Nova foto
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {dummyPhotos.map((photo) => (
              <div 
                key={photo.id}
                className="aspect-square rounded-xl bg-muted/30 border border-dashed border-border/50 flex flex-col items-center justify-center"
              >
                <Camera className="w-6 h-6 text-muted-foreground/50 mb-1" />
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(photo.date), 'MMM yyyy', { locale: ptBR })}
                </span>
              </div>
            ))}
            <button className="aspect-square rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center hover:border-primary/30 transition-colors">
              <Plus className="w-6 h-6 text-muted-foreground/50 mb-1" />
              <span className="text-[10px] text-muted-foreground">Adicionar</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
