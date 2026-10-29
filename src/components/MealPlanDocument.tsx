import { forwardRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logo from '@/assets/logo.png';

// ═══════════════════════════════════════════════════════════════
// NutriFlow Editorial Clinical PDF — aligned with the system rebrand
// Palette: paper #f7f6f2 · ink #1c1f24 · green #518C5B · deep #3d704A · coral #C4764A
// Type: Playfair Display (serif display) + system sans (body) · tabular numerals
// Layout: asymmetric editorial, hairline borders, no gradients, no neon
// ═══════════════════════════════════════════════════════════════

function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
    .replace(/\$[^$]*\$/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
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
    .replace(/[^\x20-\x7EÀ-ÿĀ-ſ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// NutriFlow brand tokens
const C = {
  paper: '#f7f6f2',
  raised: '#ffffff',
  ink: '#1c1f24',
  inkSoft: '#4a4f57',
  inkMuted: '#8a8f98',
  hairline: '#e3e1da',
  hairlineStrong: '#cfccc2',
  green: '#518C5B',
  greenDeep: '#3d704A',
  coral: '#C4764A',
};

const SERIF = "'Playfair Display', 'Georgia', 'Times New Roman', serif";
const SANS = "'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif";
const TABULAR = { fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum" 1' } as const;

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
  macros?: { protein: number; carbs: number; fat: number };
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

const MealPlanDocument = forwardRef<HTMLDivElement, MealPlanDocumentProps>(
  ({ mealPlan, patientName, nutritionist }, ref) => {
    const planData = mealPlan.plan_data;
    const dateLabel = format(new Date(mealPlan.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    const totalKcal = mealPlan.total_calories || planData.totalCalories;

    return (
      <div
        ref={ref}
        style={{
          width: '794px',
          background: C.paper,
          color: C.ink,
          fontFamily: SANS,
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {/* ═══════════════════════════════════════════════════════════
            COVER — editorial masthead
        ═══════════════════════════════════════════════════════════ */}
        <div
          style={{
            height: '1123px',
            padding: '72px 64px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            pageBreakAfter: 'always',
            boxSizing: 'border-box',
          }}
        >
          {/* Top rule + brand lockup */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.hairlineStrong}`, paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src={nutritionist.logo_url || logo} alt="NutriFlow" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 600, color: C.ink, letterSpacing: '-0.2px' }}>
                Nutri<span style={{ color: C.green }}>Flow</span>
              </span>
            </div>
            <span style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.inkMuted, ...TABULAR }}>
              Plano Alimentar
            </span>
          </div>

          {/* Eyebrow */}
          <div style={{ marginTop: 'auto' }}>
            <p style={{ fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', color: C.coral, fontWeight: 600, marginBottom: '28px' }}>
              Prescrição nutricional personalizada
            </p>

            {/* Patient name — oversized serif */}
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: '84px',
                lineHeight: 0.98,
                fontWeight: 700,
                color: C.ink,
                letterSpacing: '-2px',
                margin: 0,
                wordBreak: 'keep-all',
                overflowWrap: 'normal',
                hyphens: 'none',
              }}
            >
              {sanitizeText(patientName)}
            </h1>

            {/* Hairline divider */}
            <div style={{ width: '120px', height: '3px', background: C.green, margin: '40px 0' }} />

            {/* Plan title + meta */}
            <p style={{ fontFamily: SERIF, fontSize: '30px', fontStyle: 'italic', color: C.greenDeep, margin: '0 0 12px 0', fontWeight: 500 }}>
              {sanitizeText(mealPlan.title) || 'Plano alimentar'}
            </p>
            <p style={{ fontSize: '14px', color: C.inkSoft, margin: 0, ...TABULAR }}>
              Emitido em {dateLabel}
            </p>
          </div>

          {/* Bottom band — nutritionist + headline kcal */}
          <div style={{ marginTop: 'auto', paddingTop: '40px', borderTop: `1px solid ${C.hairlineStrong}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: C.inkMuted, marginBottom: '8px' }}>
                Responsável técnico
              </p>
              <p style={{ fontFamily: SERIF, fontSize: '22px', color: C.ink, margin: '0 0 4px 0', fontWeight: 600 }}>
                {nutritionist.full_name}
              </p>
              {nutritionist.crn && (
                <p style={{ fontSize: '13px', color: C.inkSoft, margin: 0, ...TABULAR }}>{nutritionist.crn}</p>
              )}
              {nutritionist.phone && (
                <p style={{ fontSize: '13px', color: C.inkMuted, margin: '2px 0 0 0', ...TABULAR }}>{nutritionist.phone}</p>
              )}
            </div>

            {totalKcal != null && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: C.inkMuted, marginBottom: '6px' }}>
                  Meta diária
                </p>
                <p style={{ fontFamily: SERIF, fontSize: '64px', lineHeight: 1, color: C.green, margin: 0, fontWeight: 700, ...TABULAR }}>
                  {totalKcal}
                </p>
                <p style={{ fontSize: '13px', color: C.inkSoft, margin: '4px 0 0 0', letterSpacing: '1px' }}>kcal / dia</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            INTERIOR — macro summary + meals
        ═══════════════════════════════════════════════ */}
        <div style={{ padding: '56px 64px', background: C.paper }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `2px solid ${C.ink}`, paddingBottom: '14px', marginBottom: '36px' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: '32px', fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.5px' }}>
              Composição do plano
            </h2>
            <span style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.inkMuted }}>
              Distribuição diária
            </span>
          </div>

          {/* Macro strip — asymmetric: big kcal left, three macros right */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: '32px', marginBottom: '48px', alignItems: 'stretch' }}>
            <div style={{ background: C.green, color: '#fff', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.85, marginBottom: '12px' }}>
                Energia total
              </p>
              <p style={{ fontFamily: SERIF, fontSize: '56px', lineHeight: 1, margin: 0, fontWeight: 700, ...TABULAR }}>
                {totalKcal ?? '—'}
              </p>
              <p style={{ fontSize: '13px', opacity: 0.85, margin: '6px 0 0 0', letterSpacing: '1px' }}>kcal / dia</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: C.hairline, border: `1px solid ${C.hairline}` }}>
              {[
                { label: 'Proteínas', value: planData.macros?.protein, unit: 'g', accent: C.greenDeep },
                { label: 'Carboidratos', value: planData.macros?.carbs, unit: 'g', accent: C.coral },
                { label: 'Gorduras', value: planData.macros?.fat, unit: 'g', accent: C.ink },
              ].map((m) => (
                <div key={m.label} style={{ background: C.raised, padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: C.inkMuted, marginBottom: '10px' }}>
                    {m.label}
                  </p>
                  <p style={{ fontFamily: SERIF, fontSize: '38px', lineHeight: 1, color: m.accent, margin: 0, fontWeight: 700, ...TABULAR }}>
                    {m.value != null ? `${m.value}${m.unit}` : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Meals — editorial list, full-width rows with hairline separators */}
          <div style={{ marginBottom: '24px' }}>
            {planData.meals?.map((meal, index) => (
              <div key={index} style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                {/* Meal header row */}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${C.ink}`, paddingBottom: '10px', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '18px' }}>
                    <span style={{ fontFamily: SERIF, fontSize: '15px', color: C.coral, fontWeight: 700, ...TABULAR }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 style={{ fontFamily: SERIF, fontSize: '24px', fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.3px' }}>
                      {sanitizeText(meal.name)}
                    </h3>
                    {meal.time && (
                      <span style={{ fontSize: '13px', color: C.inkMuted, ...TABULAR }}>{meal.time}</span>
                    )}
                  </div>
                  {meal.totalCalories != null && (
                    <span style={{ fontFamily: SERIF, fontSize: '20px', color: C.greenDeep, fontWeight: 700, ...TABULAR }}>
                      {meal.totalCalories} <span style={{ fontSize: '12px', color: C.inkMuted, fontFamily: SANS, letterSpacing: '1px' }}>kcal</span>
                    </span>
                  )}
                </div>

                {/* Items table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '52%' }} />
                    <col style={{ width: '26%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '11%' }} />
                  </colgroup>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.hairlineStrong}` }}>
                      {['Alimento', 'Porção', 'kcal', 'P · C · G'].map((h) => (
                        <th key={h} style={{ textAlign: h === 'Alimento' || h === 'Porção' ? 'left' : 'right', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.inkMuted, fontWeight: 600, padding: '10px 8px 10px 0' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {meal.items?.map((item, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.hairline}` }}>
                        <td style={{ padding: '12px 8px 12px 0', fontSize: '13px', color: C.ink, fontWeight: 500, lineHeight: 1.4, wordBreak: 'keep-all', overflowWrap: 'normal', hyphens: 'none' }}>
                          {sanitizeText(item.food)}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '12px', color: C.inkSoft, lineHeight: 1.4, wordBreak: 'keep-all', overflowWrap: 'normal', hyphens: 'none' }}>
                          {sanitizeText(item.portion)}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '13px', color: C.ink, textAlign: 'right', fontWeight: 600, ...TABULAR }}>
                          {item.calories ?? '—'}
                        </td>
                        <td style={{ padding: '12px 0 12px 8px', fontSize: '11px', color: C.inkMuted, textAlign: 'right', ...TABULAR }}>
                          {item.protein != null || item.carbs != null || item.fat != null
                            ? `${item.protein ?? 0}·${item.carbs ?? 0}·${item.fat ?? 0}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Notes — quiet panel with subtle coral top-tab accent (no side-rule AI tell) */}
          {planData.notes && (
            <div style={{ marginTop: '48px', padding: '28px 32px', background: C.raised, border: `1px solid ${C.hairline}`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '32px', width: '40px', height: '3px', background: C.coral }} />
              <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.coral, fontWeight: 600, marginBottom: '14px' }}>
                Observações clínicas
              </p>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: C.inkSoft, margin: 0, whiteSpace: 'pre-line', wordBreak: 'keep-all', overflowWrap: 'normal', hyphens: 'none' }}>
                {sanitizeText(planData.notes)}
              </p>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '56px', paddingTop: '24px', borderTop: `1px solid ${C.hairlineStrong}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '11px', color: C.inkMuted, margin: 0, letterSpacing: '0.5px' }}>
              Documento gerado por <span style={{ color: C.green, fontWeight: 600 }}>NutriFlow</span> · Plano exclusivo e personalizado
            </p>
            <p style={{ fontSize: '11px', color: C.inkMuted, margin: 0, letterSpacing: '2px', textTransform: 'uppercase', ...TABULAR }}>
              {dateLabel}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

MealPlanDocument.displayName = 'MealPlanDocument';

export default MealPlanDocument;