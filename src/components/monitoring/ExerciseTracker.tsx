import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, Plus, Sparkles } from 'lucide-react';
import metValuesData from '@/data/met-values.json';
import { calculateCaloriesBurned } from '@/lib/exercise-calculator';

interface ExerciseTrackerProps {
  patientId: string;
  weightKg: number;
  onSave?: (exercise: { type: string; durationMin: number; caloriesBurned: number }) => void;
  loading?: boolean;
}

export function ExerciseTracker({ patientId, weightKg, onSave, loading }: ExerciseTrackerProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [estimatedCalories, setEstimatedCalories] = useState<number>(0);

  const handleDurationChange = (value: string) => {
    setDuration(value);
    const durationNum = parseInt(value, 10);
    if (selectedType && durationNum > 0) {
      const metValue = metValuesData.find((e) => e.type === selectedType)?.met || 0;
      const calories = calculateCaloriesBurned(metValue, weightKg, durationNum);
      setEstimatedCalories(calories);
    } else {
      setEstimatedCalories(0);
    }
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    const durationNum = parseInt(duration, 10);
    if (durationNum > 0) {
      const metValue = metValuesData.find((e) => e.type === value)?.met || 0;
      const calories = calculateCaloriesBurned(metValue, weightKg, durationNum);
      setEstimatedCalories(calories);
    } else {
      setEstimatedCalories(0);
    }
  };

  const handleSave = () => {
    if (selectedType && duration) {
      onSave?.({
        type: selectedType,
        durationMin: parseInt(duration, 10),
        caloriesBurned: estimatedCalories,
      });
      setSelectedType('');
      setDuration('');
      setEstimatedCalories(0);
    }
  };

  const selectedExercise = metValuesData.find((e) => e.type === selectedType);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Dumbbell className="w-4 h-4" style={{ color: '#C4764A' }} />
          Exercício do Dia
          {estimatedCalories > 0 && (
            <span className="ml-auto flex items-center gap-1 text-xs font-normal" style={{ color: '#518C5B' }}>
              <Sparkles className="w-3 h-3" />
              ~{estimatedCalories} kcal
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exercise Type Selector */}
        <div className="space-y-2">
          <Label htmlFor="exercise-type">Tipo de Exercício</Label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger id="exercise-type" className="rounded-xl border-border/50">
              <SelectValue placeholder="Selecione o exercício" />
            </SelectTrigger>
            <SelectContent>
              {metValuesData.map((exercise) => (
                <SelectItem key={exercise.type} value={exercise.type}>
                  {exercise.label} (MET: {exercise.met})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration Input */}
        <div className="space-y-2">
          <Label htmlFor="duration">Duração (minutos)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            placeholder="Ex: 30"
            value={duration}
            onChange={(e) => handleDurationChange(e.target.value)}
            className="rounded-xl border-border/50"
          />
        </div>

        {/* Estimated Calories Display */}
        {estimatedCalories > 0 && (
          <div className="p-3 rounded-xl bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground">Calorias estimadas</p>
            <p className="text-2xl font-bold" style={{ color: '#C4764A' }}>
              {estimatedCalories} kcal
            </p>
          </div>
        )}

        {/* Save Button */}
        <Button
          className="w-full h-12 rounded-xl transition-colors"
          style={{
            backgroundColor: '#518C5B',
            color: 'white',
          }}
          onClick={handleSave}
          disabled={!selectedType || !duration || loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Exercício
        </Button>
      </CardContent>
    </Card>
  );
}