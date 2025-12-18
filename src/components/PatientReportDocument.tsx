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
    const primaryColor = nutritionist.primary_color || '#10B981';
    
    const calculateBMI = () => {
      if (currentWeight && height) {
        const heightM = height / 100;
        return (currentWeight / (heightM * heightM)).toFixed(1);
      }
      return null;
    };

    const getBMIClassification = (bmi: number) => {
      if (bmi < 18.5) return { label: 'Abaixo do peso', color: '#3B82F6' };
      if (bmi < 25) return { label: 'Peso normal', color: '#10B981' };
      if (bmi < 30) return { label: 'Sobrepeso', color: '#F59E0B' };
      return { label: 'Obesidade', color: '#EF4444' };
    };

    const bmi = calculateBMI();
    const bmiInfo = bmi ? getBMIClassification(parseFloat(bmi)) : null;
    const weightDiff = currentWeight && initialWeight ? currentWeight - initialWeight : null;

    return (
      <div 
        ref={ref}
        className="bg-white text-black p-8 min-w-[800px] max-w-[800px]"
        style={{ fontFamily: 'Inter, Arial, sans-serif' }}
      >
        {/* Header */}
        <div 
          className="p-6 rounded-lg mb-6 text-white"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
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
              <p className="text-sm opacity-80">Relatório de Evolução</p>
              <p className="font-semibold">
                {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mb-6 pb-4 border-b-2" style={{ borderColor: primaryColor }}>
          <h2 className="text-xl font-bold mb-3" style={{ color: primaryColor }}>
            Dados do Paciente
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="font-semibold">{patient.full_name}</p>
            </div>
            {patient.email && (
              <div>
                <p className="text-sm text-gray-500">E-mail</p>
                <p>{patient.email}</p>
              </div>
            )}
            {patient.birth_date && (
              <div>
                <p className="text-sm text-gray-500">Data de Nascimento</p>
                <p>{format(new Date(patient.birth_date), "d/MM/yyyy", { locale: ptBR })}</p>
              </div>
            )}
            {patient.gender && (
              <div>
                <p className="text-sm text-gray-500">Sexo</p>
                <p>{genderLabels[patient.gender] || patient.gender}</p>
              </div>
            )}
            {patient.goal && (
              <div>
                <p className="text-sm text-gray-500">Objetivo</p>
                <p>{goalLabels[patient.goal] || patient.goal}</p>
              </div>
            )}
          </div>
        </div>

        {/* Evolution Summary */}
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}15` }}>
          <h3 className="font-bold mb-4" style={{ color: primaryColor }}>
            📊 Resumo da Evolução
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {currentWeight || '-'}
              </p>
              <p className="text-sm text-gray-600">Peso Atual (kg)</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-2xl font-bold">{height || '-'}</p>
              <p className="text-sm text-gray-600">Altura (cm)</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p className="text-2xl font-bold" style={{ color: bmiInfo?.color }}>
                {bmi || '-'}
              </p>
              <p className="text-sm text-gray-600">IMC {bmiInfo?.label && `(${bmiInfo.label})`}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <p 
                className="text-2xl font-bold"
                style={{ color: weightDiff && weightDiff < 0 ? '#10B981' : weightDiff && weightDiff > 0 ? '#EF4444' : '#6B7280' }}
              >
                {weightDiff !== null ? (weightDiff > 0 ? '+' : '') + weightDiff.toFixed(1) : '-'}
              </p>
              <p className="text-sm text-gray-600">Variação (kg)</p>
            </div>
          </div>
        </div>

        {/* Before/After Comparison */}
        {initialWeight && currentWeight && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-3" style={{ color: primaryColor }}>
              🎯 Comparativo Antes e Depois
            </h3>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-sm text-gray-500">Peso Inicial</p>
                <p className="text-3xl font-bold text-gray-600">{initialWeight} kg</p>
              </div>
              <div className="text-4xl">→</div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Peso Atual</p>
                <p className="text-3xl font-bold" style={{ color: primaryColor }}>{currentWeight} kg</p>
              </div>
              <div 
                className="text-center p-4 rounded-lg"
                style={{ 
                  backgroundColor: weightDiff && weightDiff < 0 ? '#10B98120' : '#EF444420',
                  color: weightDiff && weightDiff < 0 ? '#10B981' : '#EF4444'
                }}
              >
                <p className="text-sm">Resultado</p>
                <p className="text-3xl font-bold">
                  {weightDiff && weightDiff < 0 ? '' : '+'}{weightDiff?.toFixed(1)} kg
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Body Fat Evolution */}
        {initialBodyFat !== undefined && currentBodyFat !== undefined && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-3" style={{ color: primaryColor }}>
              📉 Evolução do Percentual de Gordura
            </h3>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-sm text-gray-500">% Gordura Inicial</p>
                <p className="text-2xl font-bold text-gray-600">{initialBodyFat}%</p>
              </div>
              <div className="text-3xl">→</div>
              <div className="text-center">
                <p className="text-sm text-gray-500">% Gordura Atual</p>
                <p className="text-2xl font-bold" style={{ color: primaryColor }}>{currentBodyFat}%</p>
              </div>
              <div 
                className="text-center p-3 rounded-lg"
                style={{ 
                  backgroundColor: (currentBodyFat - initialBodyFat) < 0 ? '#10B98120' : '#EF444420',
                  color: (currentBodyFat - initialBodyFat) < 0 ? '#10B981' : '#EF4444'
                }}
              >
                <p className="text-sm">Diferença</p>
                <p className="text-2xl font-bold">
                  {(currentBodyFat - initialBodyFat) < 0 ? '' : '+'}
                  {(currentBodyFat - initialBodyFat).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Weight History Table */}
        {weightRecords.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-3" style={{ color: primaryColor }}>
              📋 Histórico de Pesagens
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: `${primaryColor}20` }}>
                  <th className="p-2 text-left text-sm font-semibold">Data</th>
                  <th className="p-2 text-right text-sm font-semibold">Peso (kg)</th>
                  <th className="p-2 text-right text-sm font-semibold">Variação</th>
                </tr>
              </thead>
              <tbody>
                {weightRecords.slice(0, 10).map((record, index) => {
                  const prevWeight = weightRecords[index + 1]?.weight;
                  const variation = prevWeight ? record.weight - prevWeight : null;
                  return (
                    <tr key={index} className="border-b">
                      <td className="p-2 text-sm">
                        {format(new Date(record.recorded_at), "d/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="p-2 text-right font-medium">{record.weight}</td>
                      <td 
                        className="p-2 text-right text-sm font-medium"
                        style={{ color: variation && variation < 0 ? '#10B981' : variation && variation > 0 ? '#EF4444' : '#6B7280' }}
                      >
                        {variation !== null ? (variation > 0 ? '+' : '') + variation.toFixed(1) : '-'}
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
          <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: primaryColor }}>
            <h3 className="font-bold mb-3" style={{ color: primaryColor }}>
              🍽️ Último Cardápio: {latestMealPlan.title}
            </h3>
            {latestMealPlan.total_calories && (
              <p className="text-sm mb-2">
                <strong>Meta calórica:</strong> {latestMealPlan.total_calories} kcal/dia
              </p>
            )}
            {latestMealPlan.plan_data?.meals && (
              <div className="space-y-2">
                {latestMealPlan.plan_data.meals.map((meal: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                    <span className="font-medium">{meal.name}</span>
                    <span className="text-sm text-gray-600">{meal.totalCalories || 0} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
          <p>Relatório gerado automaticamente por NutriFlow</p>
          <p className="mt-1">
            Este documento é de uso profissional e não substitui avaliação presencial.
          </p>
        </div>
      </div>
    );
  }
);

PatientReportDocument.displayName = 'PatientReportDocument';

export default PatientReportDocument;
