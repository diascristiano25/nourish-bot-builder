import { forwardRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const PatientReportDocument = forwardRef<HTMLDivElement, PatientReportDocumentProps>(
  ({ patient, nutritionist, weightRecords, bodyFatRecords, latestMealPlan, currentWeight, initialWeight, currentBodyFat, initialBodyFat, height }, ref) => {
    const primaryColor = nutritionist.primary_color || '#a3e635';
    const secondaryColor = '#8b5cf6';
    
    const calculateBMI = () => {
      if (currentWeight && height) {
        const heightM = height / 100;
        return (currentWeight / (heightM * heightM)).toFixed(1);
      }
      return null;
    };

    const getBMIClassification = (bmi: number) => {
      if (bmi < 18.5) return { label: 'Abaixo do peso', color: '#3B82F6' };
      if (bmi < 25) return { label: 'Peso normal', color: '#a3e635' };
      if (bmi < 30) return { label: 'Sobrepeso', color: '#F59E0B' };
      return { label: 'Obesidade', color: '#EF4444' };
    };

    const bmi = calculateBMI();
    const bmiInfo = bmi ? getBMIClassification(parseFloat(bmi)) : null;
    const weightDiff = currentWeight && initialWeight ? currentWeight - initialWeight : null;

    return (
      <div 
        ref={ref}
        className="bg-[#0a0a0f] text-white p-8 min-w-[800px] max-w-[800px]"
        style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
      >
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl mb-8">
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
            }}
          />
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
                  style={{ background: `${secondaryColor}20`, color: secondaryColor }}
                >
                  RELATÓRIO BIOLÓGICO
                </div>
                <p className="text-white/40 text-sm mt-2">
                  {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div 
          className="mb-8 pb-6"
          style={{ borderBottom: `2px solid ${primaryColor}30` }}
        >
          <h2 
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: primaryColor }}
          >
            ◆ Dados do Paciente
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Nome</p>
              <p className="text-xl font-semibold text-white">{patient.full_name}</p>
            </div>
            {patient.email && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">E-mail</p>
                <p className="text-white/80">{patient.email}</p>
              </div>
            )}
            {patient.birth_date && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Data de Nascimento</p>
                <p className="text-white/80">{format(new Date(patient.birth_date), "d/MM/yyyy", { locale: ptBR })}</p>
              </div>
            )}
            {patient.gender && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Sexo</p>
                <p className="text-white/80">{genderLabels[patient.gender] || patient.gender}</p>
              </div>
            )}
            {patient.goal && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Objetivo</p>
                <p style={{ color: primaryColor }} className="font-medium">
                  {goalLabels[patient.goal] || patient.goal}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Evolution Summary - Bio-Metrics */}
        <div 
          className="rounded-2xl p-6 mb-8"
          style={{ 
            background: 'linear-gradient(135deg, rgba(163, 230, 53, 0.05), rgba(139, 92, 246, 0.05))',
            border: `1px solid ${primaryColor}20`
          }}
        >
          <h3 
            className="text-sm font-semibold uppercase tracking-wider mb-6"
            style={{ color: primaryColor }}
          >
            ◆ Métricas Biológicas
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div 
              className="text-center p-4 rounded-xl"
              style={{ background: `${primaryColor}10`, border: `1px solid ${primaryColor}20` }}
            >
              <div 
                className="text-3xl font-bold font-mono"
                style={{ color: primaryColor }}
              >
                {currentWeight || '—'}
              </div>
              <p className="text-white/50 text-xs mt-1 uppercase tracking-wider">Peso (kg)</p>
            </div>
            <div 
              className="text-center p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="text-3xl font-bold font-mono text-white/80">{height || '—'}</div>
              <p className="text-white/50 text-xs mt-1 uppercase tracking-wider">Altura (cm)</p>
            </div>
            <div 
              className="text-center p-4 rounded-xl"
              style={{ 
                background: bmiInfo ? `${bmiInfo.color}10` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${bmiInfo?.color || 'rgba(255,255,255,0.05)'}20`
              }}
            >
              <div 
                className="text-3xl font-bold font-mono"
                style={{ color: bmiInfo?.color || 'rgba(255,255,255,0.8)' }}
              >
                {bmi || '—'}
              </div>
              <p className="text-white/50 text-xs mt-1 uppercase tracking-wider">
                IMC {bmiInfo?.label && <span className="normal-case">({bmiInfo.label})</span>}
              </p>
            </div>
            <div 
              className="text-center p-4 rounded-xl"
              style={{ 
                background: weightDiff && weightDiff < 0 ? 'rgba(163, 230, 53, 0.1)' : weightDiff && weightDiff > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${weightDiff && weightDiff < 0 ? 'rgba(163, 230, 53, 0.2)' : weightDiff && weightDiff > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)'}`
              }}
            >
              <div 
                className="text-3xl font-bold font-mono"
                style={{ color: weightDiff && weightDiff < 0 ? '#a3e635' : weightDiff && weightDiff > 0 ? '#EF4444' : 'rgba(255,255,255,0.6)' }}
              >
                {weightDiff !== null ? (weightDiff > 0 ? '+' : '') + weightDiff.toFixed(1) : '—'}
              </div>
              <p className="text-white/50 text-xs mt-1 uppercase tracking-wider">Variação (kg)</p>
            </div>
          </div>
        </div>

        {/* Before/After Comparison */}
        {initialWeight && currentWeight && (
          <div 
            className="mb-8 p-6 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <h3 
              className="text-sm font-semibold uppercase tracking-wider mb-6"
              style={{ color: secondaryColor }}
            >
              ◆ Evolução de Peso
            </h3>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Peso Inicial</p>
                <p className="text-4xl font-bold font-mono text-white/60">{initialWeight} kg</p>
              </div>
              <div 
                className="text-4xl px-6"
                style={{ color: primaryColor }}
              >
                →
              </div>
              <div className="text-center">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Peso Atual</p>
                <p 
                  className="text-4xl font-bold font-mono"
                  style={{ color: primaryColor }}
                >
                  {currentWeight} kg
                </p>
              </div>
              <div 
                className="text-center p-5 rounded-xl"
                style={{ 
                  background: weightDiff && weightDiff < 0 ? 'rgba(163, 230, 53, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                }}
              >
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Resultado</p>
                <p 
                  className="text-3xl font-bold font-mono"
                  style={{ color: weightDiff && weightDiff < 0 ? '#a3e635' : '#EF4444' }}
                >
                  {weightDiff && weightDiff < 0 ? '' : '+'}{weightDiff?.toFixed(1)} kg
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Body Fat Evolution */}
        {initialBodyFat !== undefined && currentBodyFat !== undefined && (
          <div 
            className="mb-8 p-6 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <h3 
              className="text-sm font-semibold uppercase tracking-wider mb-6"
              style={{ color: secondaryColor }}
            >
              ◆ Evolução do Percentual de Gordura
            </h3>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">% Inicial</p>
                <p className="text-3xl font-bold font-mono text-white/60">{initialBodyFat}%</p>
              </div>
              <div 
                className="text-3xl px-6"
                style={{ color: primaryColor }}
              >
                →
              </div>
              <div className="text-center">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">% Atual</p>
                <p 
                  className="text-3xl font-bold font-mono"
                  style={{ color: primaryColor }}
                >
                  {currentBodyFat}%
                </p>
              </div>
              <div 
                className="text-center p-4 rounded-xl"
                style={{ 
                  background: (currentBodyFat - initialBodyFat) < 0 ? 'rgba(163, 230, 53, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                }}
              >
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Diferença</p>
                <p 
                  className="text-2xl font-bold font-mono"
                  style={{ color: (currentBodyFat - initialBodyFat) < 0 ? '#a3e635' : '#EF4444' }}
                >
                  {(currentBodyFat - initialBodyFat) < 0 ? '' : '+'}
                  {(currentBodyFat - initialBodyFat).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Weight History Table */}
        {weightRecords.length > 0 && (
          <div className="mb-8">
            <h3 
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: primaryColor }}
            >
              ◆ Histórico de Pesagens
            </h3>
            <table className="w-full">
              <thead>
                <tr 
                  className="text-xs uppercase tracking-wider"
                  style={{ background: `${primaryColor}10` }}
                >
                  <th className="p-3 text-left text-white/60 font-medium rounded-tl-xl">Data</th>
                  <th className="p-3 text-right text-white/60 font-medium">Peso (kg)</th>
                  <th className="p-3 text-right text-white/60 font-medium rounded-tr-xl">Variação</th>
                </tr>
              </thead>
              <tbody>
                {weightRecords.slice(0, 10).map((record, index) => {
                  const prevWeight = weightRecords[index + 1]?.weight;
                  const variation = prevWeight ? record.weight - prevWeight : null;
                  return (
                    <tr 
                      key={index} 
                      style={{ borderBottom: `1px solid ${primaryColor}10` }}
                    >
                      <td className="p-3 text-white/80">
                        {format(new Date(record.recorded_at), "d/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-white">{record.weight}</td>
                      <td 
                        className="p-3 text-right font-mono font-medium"
                        style={{ color: variation && variation < 0 ? '#a3e635' : variation && variation > 0 ? '#EF4444' : 'rgba(255,255,255,0.4)' }}
                      >
                        {variation !== null ? (variation > 0 ? '+' : '') + variation.toFixed(1) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Latest Meal Plan Summary */}
        {latestMealPlan && (
          <div 
            className="mb-8 p-6 rounded-xl"
            style={{ border: `1px solid ${secondaryColor}30`, background: `${secondaryColor}05` }}
          >
            <h3 
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: secondaryColor }}
            >
              ◆ Último Plano: {latestMealPlan.title}
            </h3>
            {latestMealPlan.total_calories && (
              <p className="text-white/70 mb-3">
                <span className="text-white/40">Meta calórica:</span>{' '}
                <span className="font-mono font-bold" style={{ color: primaryColor }}>
                  {latestMealPlan.total_calories} kcal/dia
                </span>
              </p>
            )}
            {latestMealPlan.plan_data?.meals && (
              <div className="space-y-2">
                {latestMealPlan.plan_data.meals.map((meal: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center py-2"
                    style={{ borderBottom: `1px solid ${secondaryColor}10` }}
                  >
                    <span className="text-white/80">{meal.name}</span>
                    <span className="font-mono text-sm" style={{ color: primaryColor }}>
                      {meal.totalCalories || 0} kcal
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 text-center" style={{ borderTop: `1px solid ${primaryColor}10` }}>
          <p className="text-white/30 text-xs">
            Relatório gerado automaticamente por <span style={{ color: primaryColor }}>NutriFlow</span>
          </p>
          <p className="text-white/20 text-xs mt-1">
            Este documento é de uso profissional e não substitui avaliação presencial.
          </p>
        </div>
      </div>
    );
  }
);

PatientReportDocument.displayName = 'PatientReportDocument';

export default PatientReportDocument;
