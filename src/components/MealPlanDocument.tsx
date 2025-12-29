import { forwardRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logo from '@/assets/logo.png';

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

// Neon Green as specified
const NEON_GREEN = '#DFFF00';
const DEEP_ANTHRACITE = '#1a1a1f';
const CARD_GRAY = '#2a2a32';
const CARD_GRAY_LIGHT = '#3a3a44';

const MealPlanDocument = forwardRef<HTMLDivElement, MealPlanDocumentProps>(
  ({ mealPlan, patientName, nutritionist }, ref) => {
    const primaryColor = NEON_GREEN;
    const secondaryColor = nutritionist.secondary_color || '#8b5cf6';
    const planData = mealPlan.plan_data;

    return (
      <div 
        ref={ref}
        className="min-w-[800px] max-w-[800px]"
        style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
      >
        {/* ═══════════════════════════════════════════════════════════════
            CAPA - FULL PAGE MAGAZINE STYLE
        ═══════════════════════════════════════════════════════════════ */}
        <div 
          style={{ 
            background: DEEP_ANTHRACITE,
            height: '1100px',
            position: 'relative',
            overflow: 'hidden',
            pageBreakAfter: 'always',
          }}
        >
          {/* Background Pattern - Subtle grid */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                radial-gradient(circle at 20% 30%, ${primaryColor}08 0%, transparent 40%),
                radial-gradient(circle at 80% 70%, ${secondaryColor}08 0%, transparent 40%),
                linear-gradient(${DEEP_ANTHRACITE} 1px, transparent 1px),
                linear-gradient(90deg, ${DEEP_ANTHRACITE} 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 100% 100%, 60px 60px, 60px 60px',
              opacity: 0.5,
            }}
          />
          
          {/* Glowing accent lines */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
            }}
          />
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, transparent, ${primaryColor}60, transparent)`,
            }}
          />

          {/* Content Container */}
          <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
            
            {/* Logo NutriFlow */}
            <div style={{ marginBottom: '60px' }}>
              <img 
                src={nutritionist.logo_url || logo} 
                alt="NutriFlow" 
                style={{ 
                  height: '120px', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 30px rgba(223, 255, 0, 0.3))'
                }}
              />
            </div>

            {/* Decorative line */}
            <div style={{ 
              width: '200px', 
              height: '2px', 
              background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
              marginBottom: '60px'
            }} />

            {/* Patient Name - GIANT NEON */}
            <h1 
              style={{ 
                fontSize: '72px',
                fontWeight: 800,
                color: primaryColor,
                textAlign: 'center',
                letterSpacing: '-2px',
                textShadow: `0 0 60px ${primaryColor}60, 0 0 120px ${primaryColor}30`,
                lineHeight: 1.1,
                marginBottom: '30px',
              }}
            >
              {patientName}
            </h1>

            {/* Plan Title */}
            <p style={{ 
              fontSize: '24px',
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
              fontWeight: 300,
              letterSpacing: '8px',
              textTransform: 'uppercase',
              marginBottom: '80px',
            }}>
              Plano Alimentar
            </p>

            {/* Nutritionist Info */}
            <div style={{ 
              textAlign: 'center',
              padding: '30px 50px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{ color: primaryColor, fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                {nutritionist.full_name}
              </p>
              {nutritionist.crn && (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{nutritionist.crn}</p>
              )}
              {nutritionist.phone && (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginTop: '4px' }}>{nutritionist.phone}</p>
              )}
            </div>

            {/* Date */}
            <p style={{ 
              position: 'absolute',
              bottom: '60px',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '14px',
              letterSpacing: '2px',
            }}>
              {format(new Date(mealPlan.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            INTERIOR - MAGAZINE LAYOUT (Sem tabelas, só Cards)
        ═══════════════════════════════════════════════════════════════ */}
        <div style={{ background: DEEP_ANTHRACITE, padding: '50px', color: 'white' }}>
          
          {/* Section Title */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ 
              color: primaryColor, 
              fontSize: '14px', 
              letterSpacing: '6px', 
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              ◆ {mealPlan.title} ◆
            </h2>
            {mealPlan.description && (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>{mealPlan.description}</p>
            )}
          </div>

          {/* Macro Summary - Horizontal Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '16px',
            marginBottom: '50px',
          }}>
            <div style={{
              background: CARD_GRAY,
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '36px', fontWeight: 700, color: primaryColor, fontFamily: 'monospace' }}>
                {mealPlan.total_calories || planData.totalCalories || '—'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Calorias</p>
            </div>
            
            {planData.macros && (
              <>
                <div style={{
                  background: CARD_GRAY,
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '36px', fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>
                    {planData.macros.protein}g
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Proteínas</p>
                </div>
                <div style={{
                  background: CARD_GRAY,
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '36px', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                    {planData.macros.carbs}g
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Carboidratos</p>
                </div>
                <div style={{
                  background: CARD_GRAY,
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '36px', fontWeight: 700, color: '#f472b6', fontFamily: 'monospace' }}>
                    {planData.macros.fat}g
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Gorduras</p>
                </div>
              </>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              MEALS - CARD LAYOUT (Sem tabelas, sem bordas pretas)
          ═══════════════════════════════════════════════════════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {planData.meals?.map((meal, index) => (
              <div 
                key={index}
                style={{
                  background: CARD_GRAY,
                  borderRadius: '20px',
                  overflow: 'hidden',
                }}
              >
                {/* Meal Header - Neon Title */}
                <div style={{
                  padding: '20px 24px',
                  background: `linear-gradient(135deg, ${CARD_GRAY_LIGHT}, ${CARD_GRAY})`,
                  borderBottom: `1px solid rgba(255,255,255,0.05)`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: primaryColor,
                      color: DEEP_ANTHRACITE,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}>
                      {index + 1}
                    </span>
                    <div>
                      <h3 style={{ 
                        color: primaryColor, 
                        fontSize: '18px', 
                        fontWeight: 600,
                        margin: 0,
                      }}>
                        {meal.name}
                      </h3>
                      {meal.time && (
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{meal.time}</p>
                      )}
                    </div>
                  </div>
                  {meal.totalCalories && (
                    <span style={{
                      color: primaryColor,
                      fontSize: '16px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}>
                      {meal.totalCalories} kcal
                    </span>
                  )}
                </div>

                {/* Food Items - Sem linhas divisórias */}
                <div style={{ padding: '16px 24px' }}>
                  {meal.items?.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      style={{
                        padding: '12px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <p style={{ color: 'white', fontSize: '15px', margin: 0, fontWeight: 500 }}>
                          {item.food}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
                          {item.portion}
                        </p>
                      </div>
                      {item.calories && (
                        <span style={{ 
                          color: 'rgba(255,255,255,0.6)', 
                          fontSize: '14px',
                          fontFamily: 'monospace',
                        }}>
                          {item.calories} kcal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Notes Section */}
          {planData.notes && (
            <div style={{
              marginTop: '40px',
              padding: '30px',
              background: CARD_GRAY,
              borderRadius: '20px',
              borderLeft: `4px solid ${secondaryColor}`,
            }}>
              <h3 style={{ 
                color: secondaryColor, 
                fontSize: '14px', 
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                ◆ Observações
              </h3>
              <p style={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '15px', 
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                margin: 0,
              }}>
                {planData.notes}
              </p>
            </div>
          )}

          {/* Footer */}
          <div style={{ 
            marginTop: '60px', 
            paddingTop: '30px', 
            borderTop: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>
              Documento gerado por <span style={{ color: primaryColor }}>NutriFlow</span> • Plano exclusivo e personalizado
            </p>
          </div>
        </div>
      </div>
    );
  }
);

MealPlanDocument.displayName = 'MealPlanDocument';

export default MealPlanDocument;
