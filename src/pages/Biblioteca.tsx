import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { PlanLibrary, MealPlan } from '@/components/nutritionist/plans/PlanLibrary';
import { PlanEditor } from '@/components/nutritionist/plans/PlanEditor';
import { Loader2, BookOpen, Plus, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Biblioteca() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        if (!user?.id) {
          setIsLoading(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockPlans: MealPlan[] = [
          {
            id: '1',
            name: 'Plano 2000 Calorias',
            description: 'Plano para perda de peso moderada com exercícios leves',
            calories: 2000,
            protein: 150,
            carbs: 250,
            fats: 65,
            meals: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Plano Ganho de Massa',
            description: 'Plano hipercalórico para ganho de massa muscular',
            calories: 3500,
            protein: 200,
            carbs: 450,
            fats: 100,
            meals: 4,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Plano Manutenção',
            description: 'Plano de manutenção de peso com nutrição balanceada',
            calories: 2500,
            protein: 170,
            carbs: 300,
            fats: 80,
            meals: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setPlans(mockPlans);
      } catch (error) {
        console.error('Error fetching meal plans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMealPlans();
  }, [user?.id]);

  const handleSavePlan = (plan: MealPlan) => {
    if (selectedPlan) {
      setPlans(plans.map((p) => (p.id === plan.id ? plan : p)));
    } else {
      setPlans([...plans, plan]);
    }
    setIsEditorOpen(false);
    setSelectedPlan(null);
  };

  const handleCreateNew = () => {
    setSelectedPlan(null);
    setIsEditorOpen(true);
  };

  const handleSelectPlan = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setIsEditorOpen(true);
  };

  const totalCaloriesAvg = plans.length > 0
    ? Math.round(plans.reduce((s, p) => s + p.calories, 0) / plans.length)
    : 0;

  return (
    <ModernLayout>
      <div className="space-y-6">
        <PageHeader
          title="Biblioteca de Planos"
          subtitle="Gerencie e organize seus planos de refeição predefinidos"
          icon={<BookOpen className="w-7 h-7 text-white" />}
          actions={
            <Button
              onClick={handleCreateNew}
              className="gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/20 rounded-2xl font-semibold px-5 h-11 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Novo Plano
            </Button>
          }
        />

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RichCard delay={0.1}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#518C5B]/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#518C5B]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Planos</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  {plans.length}
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.2}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C4764A]/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#C4764A]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calorias Médias</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  {totalCaloriesAvg} kcal
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.3}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prontos para Uso</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  {plans.length}
                </motion.p>
              </div>
            </div>
          </RichCard>
        </div>

        {/* Plans library in rich card */}
        {isLoading ? (
          <RichCard delay={0.4} padding="lg">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#518C5B] mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Carregando planos...</p>
              </div>
            </div>
          </RichCard>
        ) : (
          <RichCard delay={0.4} padding="lg">
            <PlanLibrary
              plans={plans}
              onSelectPlan={handleSelectPlan}
              onCreateNew={handleCreateNew}
              isLoading={isLoading}
            />
          </RichCard>
        )}

        {isEditorOpen && (
          <PlanEditor
            plan={selectedPlan}
            onSave={handleSavePlan}
            onClose={() => {
              setIsEditorOpen(false);
              setSelectedPlan(null);
            }}
          />
        )}
      </div>
    </ModernLayout>
  );
}