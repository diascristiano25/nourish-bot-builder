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
    const primaryColor = nutritionist.primary_color || '#a3e635';
    const secondaryColor = nutritionist.secondary_color || '#8b5cf6';
    const planData = mealPlan.plan_data;

    return (
      <div 
        ref={ref}
        className="bg-[#0a0a0f] text-white p-8 min-w-[800px] max-w-[800px]"
        style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
      >
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl mb-8">
          {/* Background gradient */}
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
            }}
          />
          {/* Scanline effect */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
            }}
          />
          
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                {nutritionist.logo_url && (
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center p-2"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}30)` }}
                  >
                    <img 
                      src={nutritionist.logo_url} 
                      alt="Logo" 
                      className="max-h-16 object-contain"
                    />
                  </div>
                )}
                <div>
                  <h1 
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: primaryColor }}
                  >
                    {nutritionist.full_name}
                  </h1>
                  {nutritionist.crn && (
                    <p className="text-white/60 mt-1 font-medium">{nutritionist.crn}</p>
                  )}
                  {nutritionist.phone && (
                    <p className="text-white/40 text-sm">{nutritionist.phone}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div 
                  className="inline-block px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: `${primaryColor}20`, color: primaryColor }}
                >
                  PLANO ALIMENTAR
                </div>
                <p className="text-white/40 text-sm mt-2">
                  {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient & Plan Info */}
        <div 
          className="flex justify-between items-center mb-8 pb-6"
          style={{ borderBottom: `2px solid ${primaryColor}30` }}
        >
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Paciente</p>
            <h2 className="text-2xl font-bold text-white">{patientName}</h2>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Plano</p>
            <h2 
              className="text-xl font-semibold"
              style={{ color: secondaryColor }}
            >
              {mealPlan.title}
            </h2>
          </div>
        </div>

        {/* Nutritional Summary - Bio-Metric Style */}
        <div 
          className="rounded-2xl p-6 mb-8"
          style={{ 
            background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.05), rgba(139, 92, 246, 0.05))',
            border: `1px solid ${primaryColor}20`
          }}
        >
          <h3 
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: primaryColor }}
          >
            ◆ Resumo Nutricional Diário
          </h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div 
                className="text-4xl font-bold font-mono"
                style={{ color: primaryColor }}
              >
                {mealPlan.total_calories || planData.totalCalories || '—'}
              </div>
              <p className="text-white/50 text-sm mt-1">kcal / dia</p>
            </div>
            {planData.macros && (
              <>
                <div className="text-center">
                  <div className="text-4xl font-bold font-mono text-blue-400">
                    {planData.macros.protein}g
                  </div>
                  <p className="text-white/50 text-sm mt-1">Proteínas</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold font-mono text-amber-400">
                    {planData.macros.carbs}g
                  </div>
                  <p className="text-white/50 text-sm mt-1">Carboidratos</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold font-mono text-rose-400">
                    {planData.macros.fat}g
                  </div>
                  <p className="text-white/50 text-sm mt-1">Gorduras</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-4">
          {planData.meals?.map((meal, index) => (
            <div 
              key={index} 
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${primaryColor}20` }}
            >
              {/* Meal Header */}
              <div 
                className="px-5 py-4 flex justify-between items-center"
                style={{ 
                  background: `linear-gradient(90deg, ${primaryColor}15, transparent)`,
                  borderBottom: `1px solid ${primaryColor}20`
                }}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ background: primaryColor, color: '#0a0a0f' }}
                  >
                    {index + 1}
                  </span>
                  <span className="font-semibold text-white">{meal.name}</span>
                  {meal.time && (
                    <span className="text-white/40 text-sm">• {meal.time}</span>
                  )}
                </div>
                {meal.totalCalories && (
                  <span 
                    className="text-sm font-mono px-3 py-1 rounded-lg"
                    style={{ background: `${primaryColor}20`, color: primaryColor }}
                  >
                    {meal.totalCalories} kcal
                  </span>
                )}
              </div>
              
              {/* Meal Items */}
              <table className="w-full">
                <thead>
                  <tr className="text-white/40 text-xs uppercase tracking-wider">
                    <th className="text-left p-4 font-medium">Alimento</th>
                    <th className="text-left p-4 font-medium">Porção</th>
                    <th className="text-right p-4 font-medium">Calorias</th>
                  </tr>
                </thead>
                <tbody>
                  {meal.items?.map((item, itemIndex) => (
                    <tr 
                      key={itemIndex} 
                      className="border-t"
                      style={{ borderColor: `${primaryColor}10` }}
                    >
                      <td className="p-4 text-white">{item.food}</td>
                      <td className="p-4 text-white/60">{item.portion}</td>
                      <td className="p-4 text-right font-mono" style={{ color: primaryColor }}>
                        {item.calories ? `${item.calories}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Notes */}
        {planData.notes && (
          <div 
            className="mt-8 p-6 rounded-xl"
            style={{ 
              background: `${secondaryColor}10`,
              border: `1px solid ${secondaryColor}20`
            }}
          >
            <h3 
              className="font-semibold mb-3 flex items-center gap-2"
              style={{ color: secondaryColor }}
            >
              <span>◆</span> Observações
            </h3>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{planData.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 text-center" style={{ borderTop: `1px solid ${primaryColor}10` }}>
          <p className="text-white/30 text-xs">
            Plano alimentar gerado por <span style={{ color: primaryColor }}>NutriFlow</span>
          </p>
          <p className="text-white/20 text-xs mt-1">
            Este documento é de uso pessoal e não substitui orientação profissional presencial.
          </p>
        </div>
      </div>
    );
  }
);

MealPlanDocument.displayName = 'MealPlanDocument';

export default MealPlanDocument;
