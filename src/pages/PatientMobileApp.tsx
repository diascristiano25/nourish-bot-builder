import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { PatientBottomNav } from '@/components/patient-mobile/PatientBottomNav';
import { PatientDashboard } from '@/components/patient-mobile/PatientDashboard';
import { PatientPlano } from '@/components/patient-mobile/PatientPlano';
import { PatientRegistro } from '@/components/patient-mobile/PatientRegistro';
import { PatientEvolucao } from '@/components/patient-mobile/PatientEvolucao';
import { PatientPerfil } from '@/components/patient-mobile/PatientPerfil';

export interface PatientData {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  goal: string | null;
  nutritionist_id: string;
}

export interface MealItem {
  food: string;
  portion: string;
  calories?: number;
}

export interface Meal {
  name: string;
  time?: string;
  items: MealItem[];
  totalCalories?: number;
}

export interface MealPlanData {
  meals: Meal[];
  totalCalories?: number;
  notes?: string;
}

export interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  total_calories: number | null;
  plan_data: MealPlanData;
  created_at: string;
}

export type TabType = 'inicio' | 'plano' | 'registro' | 'evolucao' | 'perfil';

export default function PatientMobileApp() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [waterLog, setWaterLog] = useState({ currentMl: 0, goalMl: 2000 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/patient-auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPatientData();
    }
  }, [user]);

  const fetchPatientData = async (retryCount = 0) => {
    try {
      let { data: patientData } = await supabase
        .from('patients')
        .select('id, full_name, email, phone, goal, nutritionist_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!patientData && user?.email) {
        const { data: patientByEmail } = await supabase
          .from('patients')
          .select('id, full_name, email, phone, goal, nutritionist_id')
          .eq('email', user.email)
          .maybeSingle();

        if (patientByEmail) {
          patientData = patientByEmail;
          await supabase
            .from('patients')
            .update({ user_id: user.id })
            .eq('id', patientByEmail.id);
        }
      }

      if (!patientData) {
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchPatientData(retryCount + 1);
        }
        
        const { data: nutritionist } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user!.id)
          .maybeSingle();

        if (nutritionist) {
          navigate('/dashboard');
        } else {
          toast({
            title: "Acesso em processamento",
            description: "Seu acesso está sendo configurado. Tente novamente em alguns segundos.",
          });
          navigate('/patient-auth');
        }
        return;
      }

      setPatient(patientData);

      // Fetch meal plan
      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('patient_id', patientData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (mealPlans && mealPlans.length > 0) {
        const plan = mealPlans[0];
        setMealPlan({
          ...plan,
          plan_data: plan.plan_data as unknown as MealPlanData,
        });
      }

      // Fetch today's water log
      const today = new Date().toISOString().split('T')[0];
      const { data: waterData } = await supabase
        .from('water_logs')
        .select('quantity_ml, goal_ml')
        .eq('patient_id', patientData.id)
        .eq('date', today)
        .maybeSingle();

      if (waterData) {
        setWaterLog({ currentMl: waterData.quantity_ml, goalMl: waterData.goal_ml });
      }
    } catch (error: any) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async (amount: number) => {
    if (!patient) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newAmount = waterLog.currentMl + amount;

    try {
      const { data: existing } = await supabase
        .from('water_logs')
        .select('id')
        .eq('patient_id', patient.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('water_logs')
          .update({ quantity_ml: newAmount })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('water_logs')
          .insert({
            patient_id: patient.id,
            quantity_ml: newAmount,
            goal_ml: waterLog.goalMl,
            date: today,
          });
      }

      setWaterLog(prev => ({ ...prev, currentMl: newAmount }));
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar água",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/patient-auth');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {activeTab === 'inicio' && (
        <PatientDashboard 
          patient={patient!}
          mealPlan={mealPlan}
          waterLog={waterLog}
          onAddWater={handleAddWater}
        />
      )}
      {activeTab === 'plano' && (
        <PatientPlano 
          mealPlan={mealPlan}
        />
      )}
      {activeTab === 'registro' && (
        <PatientRegistro />
      )}
      {activeTab === 'evolucao' && (
        <PatientEvolucao patientId={patient?.id || ''} />
      )}
      {activeTab === 'perfil' && (
        <PatientPerfil 
          patient={patient!}
          onSignOut={handleSignOut}
        />
      )}
      
      <PatientBottomNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
