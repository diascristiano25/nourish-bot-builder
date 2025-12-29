import { forwardRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

// Prevent word break styles
const noWordBreakStyle: React.CSSProperties = {
  wordBreak: 'keep-all',
  overflowWrap: 'normal',
  whiteSpace: 'normal',
  fontFamily: 'Helvetica, Arial, sans-serif',
};

interface PatientData {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  goal?: string | null;
  allergies?: string[] | null;
  dietary_restrictions?: string[] | null;
}

interface WeightRecord {
  weight: number;
  recorded_at: string;
}

interface BodyFatRecord {
  body_fat_percentage: number;
  measured_at: string;
}

interface MealPlan {
  title: string;
  total_calories?: number | null;
  plan_data?: any;
}

interface NutritionistProfile {
  full_name: string;
  crn?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
}

interface PatientReportDocumentProps {
  patient: PatientData;
  nutritionist: NutritionistProfile;
  weightRecords: WeightRecord[];
  bodyFatRecords: BodyFatRecord[];
  latestMealPlan?: MealPlan | null;
  currentWeight?: number | null;
  initialWeight?: number | null;
  currentBodyFat?: number | null;
  initialBodyFat?: number | null;
  height?: number | null;
}

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde Geral',
  performance: 'Performance',
};

const genderLabels: Record<string, string> = {
  female: 'Feminino',
  male: 'Masculino',
  other: 'Outro',
};

// Magazine Style Colors
const NEON_GREEN = '#DFFF00';
const DEEP_ANTHRACITE = '#1a1a1f';
const CARD_GRAY = '#2a2a32';
const CARD_GRAY_LIGHT = '#32323c';
const VIOLET = '#8b5cf6';

const PatientReportDocument = forwardRef<HTMLDivElement, PatientReportDocumentProps>(
  ({ patient, nutritionist, weightRecords, bodyFatRecords, latestMealPlan, currentWeight, initialWeight, currentBodyFat, initialBodyFat, height }, ref) => {
    
    const calculateBMI = () => {
      if (currentWeight && height) {
        const heightM = height / 100;
        return (currentWeight / (heightM * heightM)).toFixed(1);
      }
      return null;
    };

    const getBMIClassification = (bmi: number) => {
      if (bmi < 18.5) return { label: 'Abaixo do peso', color: '#3B82F6' };
      if (bmi < 25) return { label: 'Peso normal', color: NEON_GREEN };
      if (bmi < 30) return { label: 'Sobrepeso', color: '#F59E0B' };
      return { label: 'Obesidade', color: '#EF4444' };
    };

    const bmi = calculateBMI();
    const bmiInfo = bmi ? getBMIClassification(parseFloat(bmi)) : null;
    const weightDiff = currentWeight && initialWeight ? currentWeight - initialWeight : null;

    return (
      <div 
        ref={ref}
        style={{ 
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
          minWidth: '800px',
          maxWidth: '800px',
        }}
      >
        {/* ===== COVER PAGE - FULL PAGE ===== */}
        <div 
          style={{ 
            background: DEEP_ANTHRACITE,
            height: '1000px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
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
              background: `
                radial-gradient(circle at 20% 30%, ${NEON_GREEN}15 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, ${VIOLET}15 0%, transparent 50%)
              `,
            }}
          />
          
          {/* Geometric Lines */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${NEON_GREEN}, transparent)` }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${VIOLET}, transparent)` }} />

          {/* Header with Logo */}
          <div style={{ position: 'relative', zIndex: 10, padding: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {nutritionist.logo_url ? (
                <div 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${NEON_GREEN}30, ${VIOLET}30)`,
                    border: `1px solid ${NEON_GREEN}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                  }}
                >
                  <img 
                    src={nutritionist.logo_url} 
                    alt="Logo" 
                    style={{ maxHeight: '60px', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${NEON_GREEN}30, ${VIOLET}30)`,
                    border: `1px solid ${NEON_GREEN}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: NEON_GREEN,
                  }}
                >
                  NF
                </div>
              )}
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: NEON_GREEN, margin: 0 }}>
                  {nutritionist.full_name}
                </h2>
                {nutritionist.crn && (
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '4px 0 0 0' }}>{nutritionist.crn}</p>
                )}
                {nutritionist.phone && (
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '4px 0 0 0' }}>{nutritionist.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Title - GIANT NEON */}
          <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 48px' }}>
            <p style={{ 
              color: NEON_GREEN, 
              fontSize: '14px', 
              fontWeight: '600', 
              letterSpacing: '0.3em', 
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}>
              Relatório de Evolução
            </p>
            
            <h1 style={{ 
              fontSize: '72px', 
              fontWeight: 'bold', 
              color: 'white', 
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.1,
              textShadow: `0 0 60px ${NEON_GREEN}40`,
              ...noWordBreakStyle,
            }}>
              {sanitizeText(patient.full_name)}
            </h1>
            
            <div style={{ 
              width: '120px', 
              height: '4px', 
              background: `linear-gradient(90deg, ${NEON_GREEN}, ${VIOLET})`,
              borderRadius: '2px',
              marginTop: '32px',
            }} />
            
            {patient.goal && (
              <p style={{ 
                color: VIOLET, 
                fontSize: '24px', 
                fontWeight: '300',
                marginTop: '24px',
              }}>
                {goalLabels[patient.goal] || patient.goal}
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{ position: 'relative', zIndex: 10, padding: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Data do Relatório</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
                {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Peso Atual</p>
              <p style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                fontFamily: 'monospace',
                color: NEON_GREEN,
                margin: 0,
              }}>
                {currentWeight || '—'}
                <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>kg</span>
              </p>
            </div>
          </div>
        </div>

        {/* ===== CONTENT PAGE ===== */}
        <div style={{ background: DEEP_ANTHRACITE, padding: '48px', color: 'white' }}>
          
          {/* Patient Info Card */}
          <div 
            style={{ 
              background: CARD_GRAY, 
              borderRadius: '20px', 
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h3 style={{ color: NEON_GREEN, fontSize: '12px', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 0, marginBottom: '20px' }}>
              ◆ Dados do Paciente
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Nome</p>
                <p style={{ color: 'white', fontSize: '16px', fontWeight: '500', margin: 0, ...noWordBreakStyle }}>{sanitizeText(patient.full_name)}</p>
              </div>
              {patient.email && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>E-mail</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>{patient.email}</p>
                </div>
              )}
              {patient.birth_date && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Nascimento</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>{format(new Date(patient.birth_date), "d/MM/yyyy", { locale: ptBR })}</p>
                </div>
              )}
              {patient.gender && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Sexo</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>{genderLabels[patient.gender] || patient.gender}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bio-Metrics Cards Grid */}
          <h3 style={{ color: NEON_GREEN, fontSize: '12px', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
            ◆ Métricas Biológicas
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: CARD_GRAY, borderRadius: '16px', padding: '20px', textAlign: 'center', border: `1px solid ${NEON_GREEN}30` }}>
              <p style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace', color: NEON_GREEN, margin: 0 }}>{currentWeight || '—'}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginTop: '8px', marginBottom: 0 }}>Peso (kg)</p>
            </div>
            <div style={{ background: CARD_GRAY, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{height || '—'}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginTop: '8px', marginBottom: 0 }}>Altura (cm)</p>
            </div>
            <div style={{ background: CARD_GRAY, borderRadius: '16px', padding: '20px', textAlign: 'center', border: bmiInfo ? `1px solid ${bmiInfo.color}30` : undefined }}>
              <p style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace', color: bmiInfo?.color || 'rgba(255,255,255,0.7)', margin: 0 }}>{bmi || '—'}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginTop: '8px', marginBottom: 0 }}>
                IMC {bmiInfo && <span style={{ textTransform: 'none' }}>({bmiInfo.label})</span>}
              </p>
            </div>
            <div style={{ 
              background: weightDiff && weightDiff < 0 ? `${NEON_GREEN}15` : weightDiff && weightDiff > 0 ? 'rgba(239,68,68,0.15)' : CARD_GRAY, 
              borderRadius: '16px', 
              padding: '20px', 
              textAlign: 'center',
              border: weightDiff ? `1px solid ${weightDiff < 0 ? NEON_GREEN : '#EF4444'}30` : undefined,
            }}>
              <p style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                fontFamily: 'monospace', 
                color: weightDiff && weightDiff < 0 ? NEON_GREEN : weightDiff && weightDiff > 0 ? '#EF4444' : 'rgba(255,255,255,0.5)', 
                margin: 0 
              }}>
                {weightDiff !== null ? (weightDiff > 0 ? '+' : '') + weightDiff.toFixed(1) : '—'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginTop: '8px', marginBottom: 0 }}>Variação (kg)</p>
            </div>
          </div>

          {/* Weight Evolution Card */}
          {initialWeight && currentWeight && (
            <div style={{ background: CARD_GRAY, borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ color: VIOLET, fontSize: '12px', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 0, marginBottom: '24px' }}>
                ◆ Evolução de Peso
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}>Peso Inicial</p>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{initialWeight} kg</p>
                </div>
                <div style={{ fontSize: '36px', color: NEON_GREEN, padding: '0 24px' }}>→</div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}>Peso Atual</p>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: 'monospace', color: NEON_GREEN, margin: 0 }}>{currentWeight} kg</p>
                </div>
                <div style={{ 
                  background: weightDiff && weightDiff < 0 ? `${NEON_GREEN}20` : 'rgba(239,68,68,0.2)',
                  borderRadius: '16px',
                  padding: '16px 24px',
                  textAlign: 'center',
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Resultado</p>
                  <p style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    fontFamily: 'monospace', 
                    color: weightDiff && weightDiff < 0 ? NEON_GREEN : '#EF4444',
                    margin: 0,
                  }}>
                    {weightDiff && weightDiff < 0 ? '' : '+'}{weightDiff?.toFixed(1)} kg
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Body Fat Evolution Card */}
          {initialBodyFat !== undefined && currentBodyFat !== undefined && (
            <div style={{ background: CARD_GRAY, borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ color: VIOLET, fontSize: '12px', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 0, marginBottom: '24px' }}>
                ◆ Evolução do Percentual de Gordura
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}>% Inicial</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{initialBodyFat}%</p>
                </div>
                <div style={{ fontSize: '28px', color: NEON_GREEN, padding: '0 24px' }}>→</div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}>% Atual</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace', color: NEON_GREEN, margin: 0 }}>{currentBodyFat}%</p>
                </div>
                <div style={{ 
                  background: (currentBodyFat - initialBodyFat) < 0 ? `${NEON_GREEN}20` : 'rgba(239,68,68,0.2)',
                  borderRadius: '16px',
                  padding: '12px 20px',
                  textAlign: 'center',
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Diferença</p>
                  <p style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    fontFamily: 'monospace', 
                    color: (currentBodyFat - initialBodyFat) < 0 ? NEON_GREEN : '#EF4444',
                    margin: 0,
                  }}>
                    {(currentBodyFat - initialBodyFat) < 0 ? '' : '+'}
                    {(currentBodyFat - initialBodyFat).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Weight History - Card Style (no black borders) */}
          {weightRecords.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: NEON_GREEN, fontSize: '12px', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
                ◆ Histórico de Pesagens
              </h3>
              <div style={{ background: CARD_GRAY, borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: CARD_GRAY_LIGHT, padding: '12px 20px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Data</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Peso</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Variação</span>
                </div>
                {weightRecords.slice(0, 8).map((record, index) => {
                  const prevWeight = weightRecords[index + 1]?.weight;
                  const variation = prevWeight ? record.weight - prevWeight : null;
                  return (
                    <div 
                      key={index} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        padding: '12px 20px',
                        background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                        {format(new Date(record.recorded_at), "d/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span style={{ color: 'white', fontSize: '14px', fontFamily: 'monospace', fontWeight: '500', textAlign: 'right' }}>
                        {record.weight} kg
                      </span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontFamily: 'monospace', 
                        fontWeight: '500', 
                        textAlign: 'right',
                        color: variation && variation < 0 ? NEON_GREEN : variation && variation > 0 ? '#EF4444' : 'rgba(255,255,255,0.3)',
                      }}>
                        {variation !== null ? (variation > 0 ? '+' : '') + variation.toFixed(1) : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Latest Meal Plan Card */}
          {latestMealPlan && (
            <div style={{ background: CARD_GRAY, borderRadius: '20px', padding: '24px', border: `1px solid ${VIOLET}30` }}>
              <h3 style={{ color: VIOLET, fontSize: '12px', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 0, marginBottom: '16px' }}>
                ◆ Plano Atual: {latestMealPlan.title}
              </h3>
              {latestMealPlan.total_calories && (
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                  Meta calórica:{' '}
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: NEON_GREEN, fontSize: '18px' }}>
                    {latestMealPlan.total_calories} kcal/dia
                  </span>
                </p>
              )}
              {latestMealPlan.plan_data?.meals && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {latestMealPlan.plan_data.meals.map((meal: any, index: number) => (
                    <div 
                      key={index}
                      style={{
                        background: CARD_GRAY_LIGHT,
                        borderRadius: '12px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', ...noWordBreakStyle }}>{sanitizeText(meal.name)}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '600', color: NEON_GREEN }}>
                        {meal.totalCalories || 0} kcal
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: `1px solid ${NEON_GREEN}20`, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
              Relatório gerado por <span style={{ color: NEON_GREEN }}>NutriFlow</span>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', marginTop: '4px' }}>
              Documento de uso profissional • Não substitui avaliação presencial
            </p>
          </div>
        </div>
      </div>
    );
  }
);

PatientReportDocument.displayName = 'PatientReportDocument';

export default PatientReportDocument;
