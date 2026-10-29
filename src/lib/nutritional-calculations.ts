/**
 * Cálculos Nutricionais: TMB, GET, VET
 *
 * TMB = Taxa Metabólica Basal (energia gasta em repouso)
 * GET = Gasto Energético Total (TMB × fator de atividade)
 * VET = Valor Energético Total (GET ajustado pelo objetivo)
 */

export type Gender = 'male' | 'female' | 'masculino' | 'feminino';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type Goal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'health_improvement' | 'sports_performance';

export interface NutritionalParams {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal?: Goal;
}

export interface NutritionalResults {
  tmb: number; // Taxa Metabólica Basal (kcal/dia)
  get: number; // Gasto Energético Total (kcal/dia)
  vet: number; // Valor Energético Total (kcal/dia)
  imc: number; // Índice de Massa Corporal
  bodyFatEstimate?: number; // % gordura estimado (CUN-BAE)
  method: string; // Método usado
}

/**
 * Fatores de atividade física (PAL - Physical Activity Level)
 */
const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,        // Pouco ou nenhum exercício
  lightly_active: 1.375, // Exercício leve 1-3 dias/semana
  moderately_active: 1.55, // Exercício moderado 3-5 dias/semana
  very_active: 1.725,    // Exercício intenso 6-7 dias/semana
  extremely_active: 1.9  // Exercício muito intenso, trabalho físico
};

/**
 * Ajustes calóricos por objetivo
 */
const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  weight_loss: -500,        // Déficit de 500 kcal/dia (~0.5kg/semana)
  muscle_gain: 300,         // Superávit de 300 kcal/dia
  maintenance: 0,           // Manutenção
  health_improvement: -200, // Déficit leve
  sports_performance: 200   // Superávit leve para performance
};

/**
 * Calcula TMB usando a fórmula de Mifflin-St Jeor (mais precisa atualmente)
 * Fonte: Mifflin MD, St Jeor ST, et al. Am J Clin Nutr. 1990
 */
function calculateTMB_MifflinStJeor(weightKg: number, heightCm: number, ageYears: number, isMale: boolean): number {
  if (isMale) {
    // Homens: (10 × peso) + (6.25 × altura) - (5 × idade) + 5
    return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
  } else {
    // Mulheres: (10 × peso) + (6.25 × altura) - (5 × idade) - 161
    return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
  }
}

/**
 * Calcula TMB usando a fórmula de Harris-Benedict revisada (1984)
 * Fonte: Roza AM, Shizgal HM. Am J Clin Nutr. 1984
 */
function calculateTMB_HarrisBenedict(weightKg: number, heightCm: number, ageYears: number, isMale: boolean): number {
  if (isMale) {
    // Homens: 88.362 + (13.397 × peso) + (4.799 × altura) - (5.677 × idade)
    return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * ageYears);
  } else {
    // Mulheres: 447.593 + (9.247 × peso) + (3.098 × altura) - (4.330 × idade)
    return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * ageYears);
  }
}

/**
 * Calcula IMC (Índice de Massa Corporal)
 */
function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Estima % de gordura corporal usando fórmula CUN-BAE
 * Fonte: Gómez-Ambrosi et al., Obesity (2012)
 */
function estimateBodyFatCunBae(weightKg: number, heightCm: number, ageYears: number, isMale: boolean): number | null {
  if (!weightKg || !heightCm || !ageYears || ageYears < 1) return null;

  const bmi = calculateBMI(weightKg, heightCm);
  if (!isFinite(bmi) || bmi < 10 || bmi > 80) return null;

  const sex = isMale ? 0 : 1;
  const bf = -44.988
    + 0.503 * ageYears
    + 10.689 * sex
    + 3.172 * bmi
    - 0.026 * bmi * bmi
    + 0.181 * bmi * sex
    - 0.02 * bmi * ageYears
    - 0.005 * bmi * bmi * sex
    + 0.00021 * bmi * bmi * ageYears;

  const clamped = Math.max(3, Math.min(60, bf));
  return Math.round(clamped * 10) / 10;
}

/**
 * Calcula todos os valores nutricionais
 */
export function calculateNutritionalNeeds(params: NutritionalParams): NutritionalResults {
  const { weightKg, heightCm, ageYears, gender, activityLevel, goal = 'maintenance' } = params;

  const isMale = gender === 'male' || gender === 'masculino';

  // Calcular TMB usando Mifflin-St Jeor (padrão ouro atual)
  const tmb = calculateTMB_MifflinStJeor(weightKg, heightCm, ageYears, isMale);

  // Calcular GET (TMB × fator de atividade)
  const activityFactor = ACTIVITY_FACTORS[activityLevel] || 1.2;
  const get = tmb * activityFactor;

  // Calcular VET (GET + ajuste por objetivo)
  const goalAdjustment = GOAL_ADJUSTMENTS[goal] || 0;
  const vet = get + goalAdjustment;

  // Calcular IMC
  const imc = calculateBMI(weightKg, heightCm);

  // Estimar % gordura
  const bodyFatEstimate = estimateBodyFatCunBae(weightKg, heightCm, ageYears, isMale);

  return {
    tmb: Math.round(tmb),
    get: Math.round(get),
    vet: Math.round(vet),
    imc: Math.round(imc * 10) / 10,
    bodyFatEstimate: bodyFatEstimate || undefined,
    method: 'Mifflin-St Jeor'
  };
}

/**
 * Classifica o IMC segundo OMS
 */
export function classifyBMI(bmi: number): { category: string; color: string } {
  if (bmi < 18.5) return { category: 'Abaixo do peso', color: '#3b82f6' };
  if (bmi < 25) return { category: 'Peso normal', color: '#22c55e' };
  if (bmi < 30) return { category: 'Sobrepeso', color: '#eab308' };
  if (bmi < 35) return { category: 'Obesidade I', color: '#f97316' };
  if (bmi < 40) return { category: 'Obesidade II', color: '#ef4444' };
  return { category: 'Obesidade III', color: '#dc2626' };
}

/**
 * Calcula % gordura por dobras cutâneas (protocolo Jackson-Pollock 3 dobras)
 * Dobras: tríceps, supra-ilíaca, coxa (mulheres) ou peito, abdominal, coxa (homens)
 */
export function calculateBodyFatFromSkinfolds(
  skinfolds: { triceps?: number; suprailiac?: number; thigh?: number; chest?: number; abdominal?: number },
  ageYears: number,
  isMale: boolean
): number | null {
  const sum = (skinfolds.triceps || 0) + (skinfolds.suprailiac || 0) + (skinfolds.thigh || 0);

  if (sum === 0 || ageYears < 1) return null;

  let density: number;

  if (isMale) {
    // Jackson-Pollock 3 dobras (homens): peito, abdominal, coxa
    const sumMale = (skinfolds.chest || 0) + (skinfolds.abdominal || 0) + (skinfolds.thigh || 0);
    if (sumMale === 0) return null;
    density = 1.10938 - (0.0008267 * sumMale) + (0.0000016 * sumMale * sumMale) - (0.0002574 * ageYears);
  } else {
    // Jackson-Pollock 3 dobras (mulheres): tríceps, supra-ilíaca, coxa
    density = 1.0994921 - (0.0009929 * sum) + (0.0000023 * sum * sum) - (0.0001392 * ageYears);
  }

  if (density <= 0) return null;

  // Siri equation: %BF = (495 / density) - 450
  const bodyFat = (495 / density) - 450;
  return Math.round(Math.max(3, Math.min(60, bodyFat)) * 10) / 10;
}