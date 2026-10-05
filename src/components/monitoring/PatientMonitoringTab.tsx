import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WeightChart } from './WeightChart';
import { BodyFatChart } from './BodyFatChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, Loader2, Plus, Droplets, TrendingDown, TrendingUp } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PatientMonitoringTabProps {
  patientId: string;
}

interface WeightLog {
  id: string;
  weight: number;
  recorded_at: string;
}

interface WaterLog {
  id: string;
  quantity_ml: number;
  goal_ml: number;
  date: string;
}

interface BodyFatRecord {
  id: string;
  body_fat_percentage: number | null;
  measured_at: string;
}

type PeriodFilter = '7d' | '30d' | 'all';

export function PatientMonitoringTab({ patientId }: PatientMonitoringTabProps) {
  const { toast } = useToast();
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [bodyFatRecords, setBodyFatRecords] = useState<BodyFatRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingWeight, setAddingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d');

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      // Fetch all weight logs (ordered by creation time for accuracy)
      const { data: weights, error: weightsError } = await supabase
        .from('weight_logs')
        .select('id, weight, recorded_at, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (weightsError) throw weightsError;
      setWeightLogs(weights?.map(w => ({
        ...w,
        weight: Number(w.weight)
      })) || []);

      // Fetch recent water logs
      const { data: water, error: waterError } = await supabase
        .from('water_logs')
        .select('id, quantity_ml, goal_ml, date')
        .eq('patient_id', patientId)
        .order('date', { ascending: false })
        .limit(7);

      if (waterError) throw waterError;
      setWaterLogs(water || []);

      // Fetch body fat records from anthropometrics
      const { data: bodyFat, error: bodyFatError } = await supabase
        .from('anthropometrics')
        .select('id, body_fat_percentage, measured_at')
        .eq('patient_id', patientId)
        .not('body_fat_percentage', 'is', null)
        .order('measured_at', { ascending: false });

      if (bodyFatError) throw bodyFatError;
      setBodyFatRecords(bodyFat || []);
    } catch (error: any) {
      console.error('Error fetching monitoring data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight || isNaN(Number(newWeight))) {
      toast({
        title: "Peso inválido",
        description: "Digite um valor numérico válido.",
        variant: "destructive",
      });
      return;
    }

    setAddingWeight(true);
    try {
      const { error } = await supabase
        .from('weight_logs')
        .upsert({
          patient_id: patientId,
          weight: Number(newWeight),
          recorded_at: newWeightDate,
        }, {
          onConflict: 'patient_id,recorded_at',
        });

      if (error) throw error;

      toast({
        title: "Peso registrado!",
        description: `${newWeight} kg em ${format(parseISO(newWeightDate), "d 'de' MMM", { locale: ptBR })}.`,
      });
      
      setNewWeight('');
      setNewWeightDate(new Date().toISOString().split('T')[0]);
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error adding weight:', error);
      toast({
        title: "Erro ao registrar peso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingWeight(false);
    }
  };

  const filteredWeightLogs = weightLogs.filter(log => {
    if (periodFilter === 'all') return true;
    const days = periodFilter === '7d' ? 7 : 30;
    const cutoff = subDays(new Date(), days);
    return new Date(log.recorded_at) >= cutoff;
  });

  // Calculate stats
  const latestWeight = weightLogs[0]?.weight || null;
  const oldestInRange = filteredWeightLogs[filteredWeightLogs.length - 1]?.weight || null;
  const weightChange = latestWeight && oldestInRange ? (latestWeight - oldestInRange).toFixed(1) : null;
  
  const avgWaterIntake = waterLogs.length > 0 
    ? Math.round(waterLogs.reduce((sum, log) => sum + log.quantity_ml, 0) / waterLogs.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <Scale className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {latestWeight || '-'}
              <span className="text-sm font-normal text-muted-foreground"> kg</span>
            </p>
            <p className="text-xs text-muted-foreground">Peso Atual</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            {weightChange && Number(weightChange) < 0 ? (
              <TrendingDown className="w-5 h-5 text-success mx-auto mb-2" />
            ) : (
              <TrendingUp className="w-5 h-5 text-warning mx-auto mb-2" />
            )}
            <p className="text-2xl font-bold text-foreground">
              {weightChange ? `${Number(weightChange) > 0 ? '+' : ''}${weightChange}` : '-'}
              <span className="text-sm font-normal text-muted-foreground"> kg</span>
            </p>
            <p className="text-xs text-muted-foreground">Variação ({periodFilter === '7d' ? '7 dias' : periodFilter === '30d' ? '30 dias' : 'Total'})</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <Droplets className="w-5 h-5 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {(avgWaterIntake / 1000).toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground"> L</span>
            </p>
            <p className="text-xs text-muted-foreground">Média Água/Dia</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <Scale className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{filteredWeightLogs.length}</p>
            <p className="text-xs text-muted-foreground">Registros</p>
          </CardContent>
        </Card>
      </div>

      {/* Weight Chart with Period Filter */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              Evolução do Peso
            </CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
                <TabsList className="h-8">
                  <TabsTrigger value="7d" className="text-xs px-3 h-7">7 dias</TabsTrigger>
                  <TabsTrigger value="30d" className="text-xs px-3 h-7">30 dias</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs px-3 h-7">Tudo</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg">
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-primary" />
                      Registrar Peso
                    </DialogTitle>
                    <DialogDescription>
                      Adicione um registro de peso para o paciente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="Ex: 72.5"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="text-lg h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newWeightDate}
                        onChange={(e) => setNewWeightDate(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddWeight} 
                      disabled={addingWeight}
                      className="w-full"
                    >
                      {addingWeight ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <WeightChart data={filteredWeightLogs} showHeader={false} />
        </CardContent>
      </Card>

      {/* Body Fat Chart */}
      {bodyFatRecords.length > 0 && (
        <BodyFatChart data={bodyFatRecords} />
      )}

      {/* Water History */}
      {waterLogs.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Droplets className="w-4 h-4 text-info" />
              Histórico de Água (Últimos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {waterLogs.map((log) => {
                const percentage = Math.min((log.quantity_ml / log.goal_ml) * 100, 100);
                return (
                  <div key={log.id} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-20">
                      {format(parseISO(log.date), 'dd/MM', { locale: ptBR })}
                    </span>
                    <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          percentage >= 100 ? 'bg-success' : 'bg-info/70'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {(log.quantity_ml / 1000).toFixed(1)}L
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
