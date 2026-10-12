import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { PlanLibrary, MealPlan } from '@/components/nutritionist/plans/PlanLibrary';
import { PlanCard } from '@/components/nutritionist/plans/PlanCard';
import { PlanEditor } from '@/components/nutritionist/plans/PlanEditor';
import { Loader2 } from 'lucide-react';

export default function Biblioteca() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch meal plans on component mount
  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        if (!user?.id) {
          setIsLoading(false);
          return;
        }

        // Simulate API call to fetch plans from Supabase
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data for demonstration
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
            description: 'Plano de hipercalórico para ganho de massa muscular',
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
      // Update existing plan
      setPlans(plans.map((p) => (p.id === plan.id ? plan : p)));
    } else {
      // Add new plan
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

  const handleDuplicatePlan = (plan: MealPlan) => {
    const duplicatedPlan: MealPlan = {
      ...plan,
      id: Date.now().toString(),
      name: `${plan.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlans([...plans, duplicatedPlan]);
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(plans.filter((p) => p.id !== planId));
  };

  return (
    <ModernLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Planos</h1>
          <p className="text-gray-600 mt-2">
            Gerencie e organize seus planos de refeição predefinidos
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Carregando planos...</p>
            </div>
          </div>
        ) : (
          <PlanLibrary
            plans={plans}
            onSelectPlan={handleSelectPlan}
            onCreateNew={handleCreateNew}
            isLoading={isLoading}
          />
        )}

        {/* Editor Modal */}
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
