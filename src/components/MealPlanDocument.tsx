import { forwardRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealItem {
  food: string;
  portion: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface Meal {
  name: string;
  time?: string;
  items: MealItem[];
  totalCalories?: number;
}

interface MealPlanData {
  meals: Meal[];
  totalCalories?: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  notes?: string;
}

interface NutritionistProfile {
  full_name: string;
  crn: string | null;
  phone: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
}

interface MealPlanDocumentProps {
  mealPlan: {
    title: string;
    description: string | null;
    total_calories: number | null;
    plan_data: MealPlanData;
    created_at: string;
  };
  patientName: string;
  nutritionist: NutritionistProfile;
}

const MealPlanDocument = forwardRef<HTMLDivElement, MealPlanDocumentProps>(
  ({ mealPlan, patientName, nutritionist }, ref) => {
    const primaryColor = nutritionist.primary_color || '#4a7c59';
    const secondaryColor = nutritionist.secondary_color || '#2d5a3d';
    const planData = mealPlan.plan_data;

    return (
      <div 
        ref={ref}
        className="bg-white text-black p-8 min-w-[800px] max-w-[800px]"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header com branding */}
        <div 
          className="p-6 rounded-lg mb-6 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {nutritionist.logo_url && (
                <img 
                  src={nutritionist.logo_url} 
                  alt="Logo" 
                  className="h-16 object-contain bg-white/20 p-2 rounded"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{nutritionist.full_name}</h1>
                {nutritionist.crn && (
                  <p className="text-sm opacity-90">{nutritionist.crn}</p>
                )}
                {nutritionist.phone && (
                  <p className="text-sm opacity-90">{nutritionist.phone}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Data de emissão:</p>
              <p className="font-semibold">
                {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* Título e Paciente */}
        <div className="mb-6 pb-4 border-b-2" style={{ borderColor: primaryColor }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>
            {mealPlan.title}
          </h2>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              <strong>Paciente:</strong> {patientName}
            </p>
            <p className="text-gray-600">
              <strong>Criado em:</strong> {format(new Date(mealPlan.created_at), "d/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Resumo Nutricional */}
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}15` }}>
          <h3 className="font-bold mb-3" style={{ color: primaryColor }}>
            Resumo Nutricional Diário
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {mealPlan.total_calories || planData.totalCalories || '-'}
              </p>
              <p className="text-sm text-gray-600">kcal</p>
            </div>
            {planData.macros && (
              <>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{planData.macros.protein}g</p>
                  <p className="text-sm text-gray-600">Proteínas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{planData.macros.carbs}g</p>
                  <p className="text-sm text-gray-600">Carboidratos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{planData.macros.fat}g</p>
                  <p className="text-sm text-gray-600">Gorduras</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Refeições */}
        <div className="space-y-4">
          {planData.meals?.map((meal, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div 
                className="p-3 text-white font-bold flex justify-between items-center"
                style={{ backgroundColor: primaryColor }}
              >
                <span>{meal.name} {meal.time && `- ${meal.time}`}</span>
                {meal.totalCalories && (
                  <span className="text-sm font-normal opacity-90">
                    {meal.totalCalories} kcal
                  </span>
                )}
              </div>
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2 text-sm font-semibold">Alimento</th>
                    <th className="text-left p-2 text-sm font-semibold">Porção</th>
                    <th className="text-right p-2 text-sm font-semibold">Calorias</th>
                  </tr>
                </thead>
                <tbody>
                  {meal.items?.map((item, itemIndex) => (
                    <tr key={itemIndex} className="border-t">
                      <td className="p-2">{item.food}</td>
                      <td className="p-2 text-gray-600">{item.portion}</td>
                      <td className="p-2 text-right">{item.calories ? `${item.calories} kcal` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Observações */}
        {planData.notes && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2" style={{ color: primaryColor }}>
              Observações
            </h3>
            <p className="text-gray-700 text-sm whitespace-pre-line">{planData.notes}</p>
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
          <p>Plano alimentar gerado por NutriFlow</p>
          <p className="mt-1">
            Este documento é de uso pessoal e não substitui orientação profissional presencial.
          </p>
        </div>
      </div>
    );
  }
);

MealPlanDocument.displayName = 'MealPlanDocument';

export default MealPlanDocument;
