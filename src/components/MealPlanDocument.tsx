import { forwardRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logo from '@/assets/logo.png';

// ═══════════════════════════════════════════════════════════════
// TEXT SANITIZATION FUNCTION - Removes LaTeX, non-UTF8, fixes encoding
// ═══════════════════════════════════════════════════════════════
function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    // Remove LaTeX-style formatting
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
    .replace(/\$[^$]*\$/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
    // Fix common encoding issues
    .replace(/â€"/g, '–')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã£/g, 'ã')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã‚/g, 'Â')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã´/g, 'ô')
    // Remove any remaining non-printable characters except common ones
    .replace(/[^\x20-\x7E\u00C0-\u00FF\u0100-\u017F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Fixed column widths - HARDCODED
const COLUMN_WIDTHS = {
  food: '55%',      // Alimento: 55%
  portion: '25%',   // Porção: 25%
  calories: '20%',  // Calorias: 20%
};

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
  theme?: 'dark' | 'light';
}

// Theme color palettes
const themes = {
  dark: {
    background: '#1a1a1f',
    cardBg: '#2a2a32',
    cardBgLight: '#3a3a44',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.5)',
    textSubtle: 'rgba(255,255,255,0.3)',
    accent: '#DFFF00', // Neon Green
    accentDark: '#A3E635',
    border: 'rgba(255,255,255,0.08)',
  },
  light: {
    background: '#F8F9FA',
    cardBg: '#FFFFFF',
    cardBgLight: '#F0F0F5',
    text: '#111827',
    textMuted: 'rgba(17,24,39,0.6)',
    textSubtle: 'rgba(17,24,39,0.4)',
    accent: '#65A30D', // Darker green for readability
    accentDark: '#4D7C0F',
    border: 'rgba(0,0,0,0.08)',
  },
};

const MealPlanDocument = forwardRef<HTMLDivElement, MealPlanDocumentProps>(
  ({ mealPlan, patientName, nutritionist, theme = 'dark' }, ref) => {
    const colors = themes[theme];
    const secondaryColor = nutritionist.secondary_color || '#8b5cf6';
    const planData = mealPlan.plan_data;

    return (
      <div 
        ref={ref}
        className="min-w-[800px] max-w-[800px]"
        style={{ 
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {/* ═══════════════════════════════════════════════════════════════
            CAPA - FULL PAGE MAGAZINE STYLE
        ═══════════════════════════════════════════════════════════════ */}
        <div 
          style={{ 
            background: colors.background,
            height: '1100px',
            position: 'relative',
            overflow: 'hidden',
            pageBreakAfter: 'always',
          }}
        >
          {/* Background Pattern */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: theme === 'dark' 
                ? `radial-gradient(circle at 20% 30%, ${colors.accent}08 0%, transparent 40%),
                   radial-gradient(circle at 80% 70%, ${secondaryColor}08 0%, transparent 40%)`
                : `radial-gradient(circle at 20% 30%, ${colors.accent}15 0%, transparent 40%),
                   radial-gradient(circle at 80% 70%, ${secondaryColor}10 0%, transparent 40%)`,
              opacity: 0.5,
            }}
          />
          
          {/* Accent lines */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
            }}
          />
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, transparent, ${colors.accent}60, transparent)`,
            }}
          />

          {/* Content */}
          <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
            
            {/* Logo */}
            <div style={{ marginBottom: '60px' }}>
              <img 
                src={nutritionist.logo_url || logo} 
                alt="NutriFlow" 
                style={{ 
                  height: '120px', 
                  objectFit: 'contain',
                  filter: theme === 'dark' ? 'drop-shadow(0 0 30px rgba(223, 255, 0, 0.3))' : 'none'
                }}
              />
            </div>

            {/* Decorative line */}
            <div style={{ 
              width: '200px', 
              height: '2px', 
              background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
              marginBottom: '60px'
            }} />

            {/* Patient Name - GIANT */}
            <h1 
              style={{ 
                fontSize: '72px',
                fontWeight: 800,
                color: colors.accent,
                textAlign: 'center',
                letterSpacing: '-2px',
                textShadow: theme === 'dark' ? `0 0 60px ${colors.accent}60, 0 0 120px ${colors.accent}30` : 'none',
                lineHeight: 1.1,
                marginBottom: '30px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                wordBreak: 'keep-all',
                overflowWrap: 'normal',
                hyphens: 'none',
              }}
            >
              {sanitizeText(patientName)}
            </h1>

            {/* Plan Title */}
            <p style={{ 
              fontSize: '24px',
              color: colors.textMuted,
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
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              borderRadius: '20px',
              border: `1px solid ${colors.border}`,
            }}>
              <p style={{ color: colors.accent, fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                {nutritionist.full_name}
              </p>
              {nutritionist.crn && (
                <p style={{ color: colors.textMuted, fontSize: '14px' }}>{nutritionist.crn}</p>
              )}
              {nutritionist.phone && (
                <p style={{ color: colors.textSubtle, fontSize: '13px', marginTop: '4px' }}>{nutritionist.phone}</p>
              )}
            </div>

            {/* Date */}
            <p style={{ 
              position: 'absolute',
              bottom: '60px',
              color: colors.textSubtle,
              fontSize: '14px',
              letterSpacing: '2px',
            }}>
              {format(new Date(mealPlan.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            INTERIOR - MAGAZINE LAYOUT
        ═══════════════════════════════════════════════════════════════ */}
        <div style={{ background: colors.background, padding: '50px', color: colors.text }}>
          
          {/* Section Title */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ 
              color: colors.accent, 
              fontSize: '14px', 
              letterSpacing: '6px', 
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              ◆ {mealPlan.title} ◆
            </h2>
            {mealPlan.description && (
              <p style={{ color: colors.textMuted, fontSize: '16px' }}>{mealPlan.description}</p>
            )}
          </div>

          {/* Macro Summary */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '16px',
            marginBottom: '50px',
          }}>
            <div style={{
              background: colors.cardBg,
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            }}>
              <p style={{ fontSize: '36px', fontWeight: 700, color: colors.accent, fontFamily: 'monospace' }}>
                {mealPlan.total_calories || planData.totalCalories || '—'}
              </p>
              <p style={{ color: colors.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Calorias</p>
            </div>
            
            {planData.macros && (
              <>
                <div style={{
                  background: colors.cardBg,
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                }}>
                  <p style={{ fontSize: '36px', fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>
                    {planData.macros.protein}g
                  </p>
                  <p style={{ color: colors.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Proteínas</p>
                </div>
                <div style={{
                  background: colors.cardBg,
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                }}>
                  <p style={{ fontSize: '36px', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                    {planData.macros.carbs}g
                  </p>
                  <p style={{ color: colors.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Carboidratos</p>
                </div>
                <div style={{
                  background: colors.cardBg,
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                }}>
                  <p style={{ fontSize: '36px', fontWeight: 700, color: '#f472b6', fontFamily: 'monospace' }}>
                    {planData.macros.fat}g
                  </p>
                  <p style={{ color: colors.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Gorduras</p>
                </div>
              </>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              MEALS - CARD LAYOUT (Wide food column, no word breaking)
          ═══════════════════════════════════════════════════════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {planData.meals?.map((meal, index) => (
              <div 
                key={index}
                style={{
                  background: colors.cardBg,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: theme === 'light' ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {/* Meal Header */}
                <div style={{
                  padding: '20px 24px',
                  background: theme === 'dark' 
                    ? `linear-gradient(135deg, ${colors.cardBgLight}, ${colors.cardBg})`
                    : colors.cardBgLight,
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: colors.accent,
                      color: theme === 'dark' ? colors.background : '#ffffff',
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
                        color: colors.accent, 
                        fontSize: '18px', 
                        fontWeight: 600,
                        margin: 0,
                      }}>
                        {meal.name}
                      </h3>
                      {meal.time && (
                        <p style={{ color: colors.textMuted, fontSize: '12px', margin: 0 }}>{meal.time}</p>
                      )}
                    </div>
                  </div>
                  {meal.totalCalories && (
                    <span style={{
                      color: colors.accent,
                      fontSize: '16px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}>
                      {meal.totalCalories} kcal
                    </span>
                  )}
                </div>

                {/* Food Items - TABLE LAYOUT with HARDCODED widths */}
                <div style={{ padding: '16px 24px' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed', // CRITICAL: Forces fixed column widths
                  }}>
                    <colgroup>
                      <col style={{ width: COLUMN_WIDTHS.food }} />
                      <col style={{ width: COLUMN_WIDTHS.portion }} />
                      <col style={{ width: COLUMN_WIDTHS.calories }} />
                    </colgroup>
                    <tbody>
                      {meal.items?.map((item, itemIndex) => (
                        <tr key={itemIndex}>
                          {/* ALIMENTO - 55% - NO WORD BREAK */}
                          <td style={{ 
                            padding: '10px 8px 10px 0',
                            verticalAlign: 'top',
                            color: colors.text, 
                            fontSize: '14px', 
                            fontWeight: 500,
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            // CRITICAL: Prevent word breaking
                            wordBreak: 'keep-all',
                            overflowWrap: 'normal',
                            whiteSpace: 'normal',
                            hyphens: 'none',
                            WebkitHyphens: 'none',
                            MozHyphens: 'none',
                            msHyphens: 'none',
                          }}>
                            {sanitizeText(item.food)}
                          </td>
                          {/* PORÇÃO - 25% */}
                          <td style={{ 
                            padding: '10px 8px',
                            verticalAlign: 'top',
                            color: colors.textMuted, 
                            fontSize: '13px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            wordBreak: 'keep-all',
                            overflowWrap: 'normal',
                            whiteSpace: 'normal',
                            hyphens: 'none',
                          }}>
                            {sanitizeText(item.portion)}
                          </td>
                          {/* CALORIAS - 20% */}
                          <td style={{ 
                            padding: '10px 0 10px 8px',
                            verticalAlign: 'top',
                            color: colors.textMuted, 
                            fontSize: '13px',
                            fontFamily: 'Helvetica, Arial, monospace',
                            textAlign: 'right',
                            whiteSpace: 'nowrap',
                          }}>
                            {item.calories ? `${item.calories} kcal` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          {planData.notes && (
            <div style={{
              marginTop: '40px',
              padding: '30px',
              background: colors.cardBg,
              borderRadius: '20px',
              borderLeft: `4px solid ${secondaryColor}`,
              boxShadow: theme === 'light' ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
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
                color: colors.textMuted, 
                fontSize: '15px', 
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                margin: 0,
                fontFamily: 'Helvetica, Arial, sans-serif',
                wordBreak: 'keep-all',
                overflowWrap: 'normal',
                hyphens: 'none',
              }}>
                {sanitizeText(planData.notes)}
              </p>
            </div>
          )}

          {/* Footer */}
          <div style={{ 
            marginTop: '60px', 
            paddingTop: '30px', 
            borderTop: `1px solid ${colors.border}`,
            textAlign: 'center',
          }}>
            <p style={{ color: colors.textSubtle, fontSize: '12px', margin: 0 }}>
              Documento gerado por <span style={{ color: colors.accent }}>NutriFlow</span> • Plano exclusivo e personalizado
            </p>
          </div>
        </div>
      </div>
    );
  }
);

MealPlanDocument.displayName = 'MealPlanDocument';

export default MealPlanDocument;
