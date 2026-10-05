import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client-custom';
import { Loader2, Utensils, Droplets, TrendingUp, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
}

interface MealPlan {
  id: string;
  title: string;
  plan_data: any;
  total_calories: number | null;
  is_active: boolean;
}

interface WaterLog {
  quantity_ml: number;
  goal_ml: number;
  date: string;
}

interface WeightLog {
  weight: number;
  recorded_at: string;
}

export function PatientPreviewModal({ open, onOpenChange, patientId, patientName }: PatientPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [waterLog, setWaterLog] = useState<WaterLog | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);

  useEffect(() => {
    if (open && patientId) {
      fetchPatientData();
    }
  }, [open, patientId]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // Fetch active meal plan
      const { data: mealData } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setMealPlan(mealData);

      // Fetch today's water log
      const today = new Date().toISOString().split('T')[0];
      const { data: waterData } = await supabase
        .from('water_logs')
        .select('*')
        .eq('patient_id', patientId)
        .eq('date', today)
        .maybeSingle();

      setWaterLog(waterData);

      // Fetch weight logs
      const { data: weightData } = await supabase
        .from('weight_logs')
        .select('weight, recorded_at')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(10);

      setWeightLogs(weightData || []);
    } catch (error) {
      console.error('Error fetching patient preview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const waterPercentage = waterLog ? Math.min(100, (waterLog.quantity_ml / waterLog.goal_ml) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {patientName.charAt(0).toUpperCase()}
            </span>
            Visualização do Paciente: {patientName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="mealplan" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mealplan" className="gap-2">
                <Utensils className="w-4 h-4" />
                Cardápio
              </TabsTrigger>
              <TabsTrigger value="water" className="gap-2">
                <Droplets className="w-4 h-4" />
                Água
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Evolução
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mealplan" className="mt-4">
              {mealPlan ? (
                <div className="space-y-4">
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <h3 className="font-semibold text-lg">{mealPlan.title}</h3>
                    {mealPlan.total_calories && (
                      <p className="text-sm text-muted-foreground">
                        {mealPlan.total_calories} kcal/dia
                      </p>
                    )}
                  </div>
                  
                  {mealPlan.plan_data?.meals ? (
                    <div className="space-y-3">
                      {mealPlan.plan_data.meals.map((meal: any, index: number) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{meal.name || meal.meal_name}</h4>
                            <span className="text-xs text-muted-foreground">{meal.time || meal.horario}</span>
                          </div>
                          <div className="space-y-1">
                            {(meal.foods || meal.items || []).slice(0, 3).map((food: any, i: number) => (
                              <p key={i} className="text-sm text-muted-foreground">
                                • {food.name || food.food_name} {food.quantity && `- ${food.quantity}`}
                              </p>
                            ))}
                            {(meal.foods || meal.items || []).length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{(meal.foods || meal.items).length - 3} mais itens...
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Dados do cardápio não disponíveis
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Utensils className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum cardápio ativo</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="water" className="mt-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    Consumo de Água Hoje
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>

                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-blue-100 dark:text-blue-900"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${waterPercentage * 2.83} 283`}
                      strokeLinecap="round"
                      className="text-blue-500 transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {Math.round(waterPercentage)}%
                    </span>
                    <span className="text-xs text-muted-foreground">da meta</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg font-medium">
                    {waterLog?.quantity_ml || 0} ml / {waterLog?.goal_ml || 2000} ml
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {waterLog ? `Faltam ${Math.max(0, (waterLog.goal_ml - waterLog.quantity_ml))} ml` : 'Sem registro hoje'}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="mt-4">
              {weightLogs.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <h3 className="font-semibold mb-1">Peso Atual</h3>
                    <p className="text-3xl font-bold text-primary">
                      {weightLogs[0].weight} kg
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Registrado em {format(parseISO(weightLogs[0].recorded_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Histórico de Peso</h4>
                    <div className="space-y-2">
                      {weightLogs.slice(0, 5).map((log, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                        >
                          <span className="text-sm text-muted-foreground">
                            {format(parseISO(log.recorded_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <span className="font-medium">{log.weight} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum registro de peso</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
