import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WeightChart } from './WeightChart';
import { WaterTracker } from './WaterTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, Loader2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PatientProgressTabProps {
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

export function PatientProgressTab({ patientId }: PatientProgressTabProps) {
  const { toast } = useToast();
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [waterLog, setWaterLog] = useState<WaterLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingWeight, setAddingWeight] = useState(false);
  const [addingWater, setAddingWater] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      // Fetch weight logs
      const { data: weights, error: weightsError } = await supabase
        .from('weight_logs')
        .select('id, weight, recorded_at')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(30);

      if (weightsError) throw weightsError;
      setWeightLogs(weights?.map(w => ({
        ...w,
        weight: Number(w.weight)
      })) || []);

      // Fetch today's water log
      const today = new Date().toISOString().split('T')[0];
      const { data: water, error: waterError } = await supabase
        .from('water_logs')
        .select('id, quantity_ml, goal_ml, date')
        .eq('patient_id', patientId)
        .eq('date', today)
        .maybeSingle();

      if (waterError) throw waterError;
      setWaterLog(water);
    } catch (error: any) {
      console.error('Error fetching progress data:', error);
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
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('weight_logs')
        .upsert({
          patient_id: patientId,
          weight: Number(newWeight),
          recorded_at: today,
        }, {
          onConflict: 'patient_id,recorded_at',
        });

      if (error) throw error;

      toast({
        title: "Peso registrado!",
        description: `${newWeight} kg registrado com sucesso.`,
      });
      
      setNewWeight('');
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

  const handleAddWater = async (amount: number) => {
    setAddingWater(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const newQuantity = (waterLog?.quantity_ml || 0) + amount;

      const { error } = await supabase
        .from('water_logs')
        .upsert({
          patient_id: patientId,
          quantity_ml: newQuantity,
          goal_ml: waterLog?.goal_ml || 2000,
          date: today,
        }, {
          onConflict: 'patient_id,date',
        });

      if (error) throw error;

      setWaterLog(prev => ({
        id: prev?.id || '',
        quantity_ml: newQuantity,
        goal_ml: prev?.goal_ml || 2000,
        date: today,
      }));

      toast({
        title: `+${amount}ml registrado!`,
        description: `Total: ${(newQuantity / 1000).toFixed(1)}L`,
      });
    } catch (error: any) {
      console.error('Error adding water:', error);
      toast({
        title: "Erro ao registrar água",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingWater(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Water Tracker */}
      <WaterTracker
        currentMl={waterLog?.quantity_ml || 0}
        goalMl={waterLog?.goal_ml || 2000}
        onAddWater={handleAddWater}
        loading={addingWater}
      />

      {/* Weight Chart with Add Button */}
      <div className="relative">
        <WeightChart data={weightLogs} />
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="absolute top-4 right-4 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-1" />
              Registrar Peso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Registrar Peso
              </DialogTitle>
              <DialogDescription>
                Registre seu peso de hoje. Se já houver um registro, ele será atualizado.
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
  );
}
