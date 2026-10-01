import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Activity,
  Target,
  Sparkles
} from 'lucide-react';

interface PatientEvolutionCardProps {
  initialWeight: number | null;
  currentWeight: number | null;
  height: number | null; // in cm
  initialBodyFat?: number | null;
  currentBodyFat?: number | null;
  goal?: string | null;
}

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde Geral',
  performance: 'Performance',
};

export function PatientEvolutionCard({
  initialWeight,
  currentWeight,
  height,
  initialBodyFat,
  currentBodyFat,
  goal
}: PatientEvolutionCardProps) {
  
  // Calculate BMI
  const bmi = useMemo(() => {
    if (!currentWeight || !height) return null;
    const heightM = height / 100;
    return currentWeight / (heightM * heightM);
  }, [currentWeight, height]);

  // BMI Classification
  const bmiClassification = useMemo(() => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-info', bg: 'bg-info/10' };
    if (bmi < 25) return { label: 'Peso normal', color: 'text-success', bg: 'bg-success/10' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'Obesidade', color: 'text-destructive', bg: 'bg-destructive/10' };
  }, [bmi]);

  // Weight difference
  const weightDiff = useMemo(() => {
    if (!initialWeight || !currentWeight) return null;
    return currentWeight - initialWeight;
  }, [initialWeight, currentWeight]);

  // Body fat difference
  const bodyFatDiff = useMemo(() => {
    if (!initialBodyFat || !currentBodyFat) return null;
    return currentBodyFat - initialBodyFat;
  }, [initialBodyFat, currentBodyFat]);

  // Check if goal is being achieved
  const isGoalPositive = useMemo(() => {
    if (!weightDiff || !goal) return null;
    if (goal === 'weight_loss' && weightDiff < 0) return true;
    if (goal === 'hypertrophy' && weightDiff > 0) return true;
    if (goal === 'maintenance' && Math.abs(weightDiff) < 1) return true;
    return false;
  }, [weightDiff, goal]);

  return (
    <div className="space-y-4">
      {/* IMC Card with Classification */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className={`h-1 ${bmiClassification?.bg || 'bg-muted'}`} style={{ 
          background: bmiClassification 
            ? `linear-gradient(90deg, hsl(var(--${bmiClassification.color.replace('text-', '')})) 0%, hsl(var(--${bmiClassification.color.replace('text-', '')}) / 0.5) 100%)`
            : undefined 
        }} />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Índice de Massa Corporal (IMC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">
                {bmi ? bmi.toFixed(1) : '-'}
              </span>
              <span className="text-sm text-muted-foreground">kg/m²</span>
            </div>
            {bmiClassification && (
              <Badge className={`${bmiClassification.bg} ${bmiClassification.color} border-0`}>
                {bmiClassification.label}
              </Badge>
            )}
          </div>
          {height && currentWeight && (
            <p className="text-xs text-muted-foreground mt-2">
              Baseado em {currentWeight}kg e {height}cm
            </p>
          )}
        </CardContent>
      </Card>

      {/* Before vs After Comparison */}
      {initialWeight && currentWeight && (
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Comparativo de Evolução
              {goal && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {goalLabels[goal] || goal}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Initial Weight */}
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Inicial</p>
                <p className="text-2xl font-bold text-foreground">{initialWeight.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg</p>
              </div>

              {/* Difference */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${
                  isGoalPositive 
                    ? 'bg-success/10' 
                    : weightDiff && weightDiff !== 0 
                      ? 'bg-warning/10' 
                      : 'bg-muted/50'
                }`}>
                  {weightDiff && weightDiff < 0 ? (
                    <TrendingDown className={`w-6 h-6 ${isGoalPositive ? 'text-success' : 'text-warning'}`} />
                  ) : weightDiff && weightDiff > 0 ? (
                    <TrendingUp className={`w-6 h-6 ${isGoalPositive ? 'text-success' : 'text-warning'}`} />
                  ) : (
                    <Minus className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <p className={`text-lg font-bold mt-2 ${
                  isGoalPositive ? 'text-success' : 'text-foreground'
                }`}>
                  {weightDiff && weightDiff > 0 ? '+' : ''}{weightDiff?.toFixed(1) || '0'} kg
                </p>
                {isGoalPositive && (
                  <div className="flex items-center justify-center gap-1 text-xs text-success mt-1">
                    <Sparkles className="w-3 h-3" />
                    No caminho certo!
                  </div>
                )}
              </div>

              {/* Current Weight */}
              <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary uppercase tracking-wider mb-1">Atual</p>
                <p className="text-2xl font-bold text-primary">{currentWeight.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg</p>
              </div>
            </div>

            {/* Body Fat Comparison */}
            {initialBodyFat && currentBodyFat && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Gordura Corporal</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{initialBodyFat.toFixed(1)}%</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{currentBodyFat.toFixed(1)}%</span>
                    {bodyFatDiff && (
                      <Badge variant={bodyFatDiff < 0 ? 'default' : 'secondary'} className={`text-xs ${
                        bodyFatDiff < 0 ? 'bg-success text-success-foreground' : ''
                      }`}>
                        {bodyFatDiff > 0 ? '+' : ''}{bodyFatDiff.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
