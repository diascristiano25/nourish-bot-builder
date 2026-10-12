import { ModernLayout } from '@/components/layout/ModernLayout';
import { MealPlanBuilder } from '@/components/meal-plan/MealPlanBuilder';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function MealPlanBuilderPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <ModernLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl animate-pulse mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <MealPlanBuilder />
    </ModernLayout>
  );
}
