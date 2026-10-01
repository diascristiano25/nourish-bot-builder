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

interface MealPlanDocumentEliteProps {
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

// Meal background colors for magazine style
const mealBackgrounds = [
  { bg: 'rgba(163, 230, 53, 0.08)', border: 'rgba(163, 230, 53, 0.2)' }, // Lime
  { bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.2)' }, // Violet
  { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)' }, // Blue
  { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)' }, // Amber
  { bg: 'rgba(236, 72, 153, 0.08)', border: 'rgba(236, 72, 153, 0.2)' }, // Pink
  { bg: 'rgba(20, 184, 166, 0.08)', border: 'rgba(20, 184, 166, 0.2)' }, // Teal
];

const MealPlanDocumentElite = forwardRef<HTMLDivElement, MealPlanDocumentEliteProps>(
  ({ mealPlan, patientName, nutritionist }, ref) => {
    const primaryColor = nutritionist.primary_color || '#a3e635';
    const secondaryColor = nutritionist.secondary_color || '#8b5cf6';
    const planData = mealPlan.plan_data;

    return (
      <div 
        ref={ref}
        className="bg-[#0a0a0f] text-white min-w-[800px] max-w-[800px]"
        style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
      >
        {/* ===== COVER PAGE ===== */}
        <div 
          className="relative h-[1000px] flex flex-col justify-between overflow-hidden"
          style={{ pageBreakAfter: 'always' }}
        >
          {/* Background Pattern */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 20% 20%, ${primaryColor}15 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, ${secondaryColor}15 0%, transparent 50%),
                linear-gradient(135deg, #0a0a0f 0%, #12141a 100%)
              `,
            }}
          />
          
          {/* Geometric Lines */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }}
            />
            <div 
              className="absolute bottom-0 left-0 w-full h-1"
              style={{ background: `linear-gradient(90deg, transparent, ${secondaryColor}, transparent)` }}
            />
            <div 
              className="absolute top-0 left-0 h-full w-1"
              style={{ background: `linear-gradient(180deg, ${primaryColor}, transparent)` }}
            />
            <div 
              className="absolute top-0 right-0 h-full w-1"
              style={{ background: `linear-gradient(180deg, ${secondaryColor}, transparent)` }}
            />
          </div>

          {/* Header */}
          <div className="relative z-10 p-12">
            <div className="flex items-center gap-6">
              {nutritionist.logo_url && (
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center p-3"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
                    border: `1px solid ${primaryColor}30`
                  }}
                >
                  <img 
                    src={nutritionist.logo_url} 
                    alt="Logo" 
                    className="max-h-20 object-contain"
                  />
                </div>
              )}
              <div>
                <h2 
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: primaryColor }}
                >
                  {nutritionist.full_name}
                </h2>
                {nutritionist.crn && (
                  <p className="text-white/50 text-sm font-medium mt-1">{nutritionist.crn}</p>
                )}
                {nutritionist.phone && (
                  <p className="text-white/30 text-sm">{nutritionist.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Title - Center */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12">
            <div 
              className="text-sm font-medium uppercase tracking-[0.3em] mb-6"
              style={{ color: primaryColor }}
            >
              Plano Alimentar Personalizado
            </div>
            
            <h1 className="text-6xl font-bold text-center text-white leading-tight mb-8">
              {patientName}
            </h1>
            
            <div 
              className="w-32 h-1 rounded-full"
              style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}
            />
            
            <p 
              className="text-2xl font-light text-center mt-8 max-w-lg"
              style={{ color: secondaryColor }}
            >
              {mealPlan.title}
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 p-12">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Data de Criação</p>
                <p className="text-white/60 font-medium">
                  {format(new Date(mealPlan.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Meta Calórica</p>
                <p 
                  className="text-4xl font-bold font-mono"
                  style={{ color: primaryColor }}
                >
                  {mealPlan.total_calories || planData.totalCalories || '—'}
                  <span className="text-lg text-white/40 ml-2">kcal/dia</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CONTENT PAGES ===== */}
        <div className="p-12">
          {/* Macro Summary - Magazine Style */}
          {planData.macros && (
            <div className="mb-12">
              <h2 
                className="text-sm font-semibold uppercase tracking-[0.2em] mb-6"
                style={{ color: primaryColor }}
              >
                ◆ Distribuição de Macronutrientes
              </h2>
              
              <div className="grid grid-cols-4 gap-4">
                <div 
                  className="text-center p-6 rounded-2xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)`,
                    border: `1px solid ${primaryColor}20`
                  }}
                >
                  <div 
                    className="text-5xl font-bold font-mono mb-2"
                    style={{ color: primaryColor }}
                  >
                    {mealPlan.total_calories || planData.totalCalories || '—'}
                  </div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Calorias</p>
                </div>
                
                <div 
                  className="text-center p-6 rounded-2xl"
                  style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                >
                  <div className="text-5xl font-bold font-mono mb-2 text-blue-400">
                    {planData.macros.protein}g
                  </div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Proteínas</p>
                </div>
                
                <div 
                  className="text-center p-6 rounded-2xl"
                  style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
                >
                  <div className="text-5xl font-bold font-mono mb-2 text-amber-400">
                    {planData.macros.carbs}g
                  </div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Carboidratos</p>
                </div>
                
                <div 
                  className="text-center p-6 rounded-2xl"
                  style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)' }}
                >
                  <div className="text-5xl font-bold font-mono mb-2 text-rose-400">
                    {planData.macros.fat}g
                  </div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Gorduras</p>
                </div>
              </div>
            </div>
          )}

          {/* Meals - Two Column Magazine Layout */}
          <div className="mb-12">
            <h2 
              className="text-sm font-semibold uppercase tracking-[0.2em] mb-8"
              style={{ color: primaryColor }}
            >
              ◆ Suas Refeições
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              {planData.meals?.map((meal, index) => {
                const colorScheme = mealBackgrounds[index % mealBackgrounds.length];
                
                return (
                  <div 
                    key={index} 
                    className="rounded-2xl overflow-hidden"
                    style={{ 
                      background: colorScheme.bg,
                      border: `1px solid ${colorScheme.border}`
                    }}
                  >
                    {/* Meal Header */}
                    <div className="px-6 py-4 flex justify-between items-center border-b" style={{ borderColor: colorScheme.border }}>
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                          style={{ background: primaryColor, color: '#0a0a0f' }}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-white text-lg">{meal.name}</h3>
                          {meal.time && (
                            <p className="text-white/40 text-sm">{meal.time}</p>
                          )}
                        </div>
                      </div>
                      {meal.totalCalories && (
                        <div 
                          className="text-right px-3 py-1 rounded-lg"
                          style={{ background: 'rgba(0,0,0,0.2)' }}
                        >
                          <span className="text-lg font-bold font-mono" style={{ color: primaryColor }}>
                            {meal.totalCalories}
                          </span>
                          <span className="text-white/40 text-xs ml-1">kcal</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Meal Items */}
                    <div className="p-4 space-y-2">
                      {meal.items?.map((item, itemIndex) => (
                        <div 
                          key={itemIndex} 
                          className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.food}</p>
                            <p className="text-white/40 text-sm">{item.portion}</p>
                          </div>
                          {item.calories && (
                            <span className="text-white/60 font-mono text-sm">
                              {item.calories} kcal
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {planData.notes && (
            <div 
              className="p-8 rounded-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${secondaryColor}10, ${secondaryColor}05)`,
                border: `1px solid ${secondaryColor}20`
              }}
            >
              <h3 
                className="font-semibold mb-4 flex items-center gap-2 text-lg"
                style={{ color: secondaryColor }}
              >
                ◆ Observações Importantes
              </h3>
              <p className="text-white/70 leading-relaxed whitespace-pre-line">{planData.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 pt-8 text-center" style={{ borderTop: `1px solid ${primaryColor}10` }}>
            <p className="text-white/20 text-xs">
              Documento gerado por <span style={{ color: primaryColor }}>NutriFlow</span> • Este plano é personalizado e não deve ser compartilhado.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

MealPlanDocumentElite.displayName = 'MealPlanDocumentElite';

export default MealPlanDocumentElite;
