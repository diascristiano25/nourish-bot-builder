import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Camera,
  UtensilsCrossed,
  Smile,
  Frown,
  Meh,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { calculateMealMacros, FoodItem } from '@/lib/nutrition-calculator';

const mealOptions = [
  { id: 'cafe', name: 'Café da Manhã', icon: '☕' },
  { id: 'lanche-manha', name: 'Lanche da Manhã', icon: '🍎' },
  { id: 'almoco', name: 'Almoço', icon: '🍽️' },
  { id: 'lanche-tarde', name: 'Lanche da Tarde', icon: '🥤' },
  { id: 'jantar', name: 'Jantar', icon: '🌙' },
  { id: 'ceia', name: 'Ceia', icon: '🫖' },
];

const hungerLevels = [
  { value: 1, label: 'Nenhuma', icon: Frown },
  { value: 2, label: 'Pouca', icon: Meh },
  { value: 3, label: 'Moderada', icon: Meh },
  { value: 4, label: 'Muita', icon: Smile },
  { value: 5, label: 'Extrema', icon: Smile },
];

// Mock food database for demonstration (in production, this would come from Supabase)
const mockFoodDatabase: FoodItem[] = [
  { food_id: '1', quantity_g: 100, calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2 }, // Apple
  { food_id: '2', quantity_g: 150, calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6 }, // Chicken breast
  { food_id: '3', quantity_g: 200, calories_per_100g: 130, protein_per_100g: 5, carbs_per_100g: 28, fat_per_100g: 1 }, // Rice
  { food_id: '4', quantity_g: 100, calories_per_100g: 116, protein_per_100g: 3, carbs_per_100g: 23, fat_per_100g: 1.2 }, // Potato
];

const mockFoodNames = ['Maçã', 'Peito de Frango', 'Arroz', 'Batata'];

export function PatientRegistro() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [hungerBefore, setHungerBefore] = useState([3]);
  const [satietyAfter, setSatietyAfter] = useState([3]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // State for food items and macro calculation
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [macroTotals, setMacroTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Calculate macros whenever selected foods change
  useEffect(() => {
    const totals = calculateMealMacros(selectedFoods);
    setMacroTotals(totals);
  }, [selectedFoods]);

  const handleAddFood = (foodIndex: number) => {
    const newFood = { ...mockFoodDatabase[foodIndex] };
    setSelectedFoods(prev => [...prev, newFood]);
  };

  const handleRemoveFood = (index: number) => {
    setSelectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMeal || submitting) return;
    setSubmitting(true);
    try {
      // Resolve the patient row for the logged-in user
      const { data: patientRow, error: patientErr } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (patientErr) throw patientErr;
      if (!patientRow) throw new Error('Paciente não encontrado para este usuário');

      let photoUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `${patientRow.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('food-photos')
          .upload(fileName, imageFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: publicData } = supabase.storage
          .from('food-photos')
          .getPublicUrl(fileName);
        photoUrl = publicData?.publicUrl || null;
      }

      // Map UI meal ids to food_intake_logs CHECK constraint values
      const mealTypeMap: Record<string, string> = {
        'cafe': 'breakfast',
        'lanche-manha': 'snack',
        'almoco': 'lunch',
        'lanche-tarde': 'snack',
        'jantar': 'dinner',
        'ceia': 'snack',
      };

      // Persist to food_intake_logs (schema: patient_id, meal_type, food_name,
      // quantity, unit, calories, protein, carbs, fats, logged_at, notes)
      const { error: logErr } = await supabase.from('food_intake_logs').insert({
        patient_id: patientRow.id,
        meal_type: mealTypeMap[selectedMeal] || 'snack',
        food_name: mealOptions.find(m => m.id === selectedMeal)?.name || selectedMeal,
        quantity: 1,
        unit: 'porção',
        notes: `Fome antes: ${hungerBefore[0]}/5 | Saciedade após: ${satietyAfter[0]}/5${photoUrl ? ' | Foto registrada' : ''}`,
        logged_at: new Date().toISOString(),
      });
      if (logErr) throw logErr;

      toast({ title: 'Refeição registrada!', description: 'Seu nutricionista foi notificado.' });
      setSelectedMeal(null);
      setHungerBefore([3]);
      setSatietyAfter([3]);
      setImagePreview(null);
      setImageFile(null);
    } catch (error: any) {
      console.error('Error registering meal:', error);
      toast({
        title: 'Erro ao registrar refeição',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-4 animate-fade-in">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Registrar Refeição</h1>
        <p className="text-sm text-muted-foreground">
          Tire uma foto e registre como você se sentiu
        </p>
      </header>

      {/* Select Meal */}
      <Card className="border-border/50 mb-4">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Qual refeição você está registrando?
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {mealOptions.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal.id)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl border transition-all',
                  selectedMeal === meal.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/50 text-foreground hover:border-primary/30'
                )}
              >
                <span className="text-lg">{meal.icon}</span>
                <span className="text-sm font-medium">{meal.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Photo Upload */}
      <Card className="border-border/50 mb-4">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Foto do prato
          </h2>

          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
              >
                Alterar
              </Button>
            </div>
          ) : (
            <label className="block">
              <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/30 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Toque para tirar foto
                </p>
                <p className="text-xs text-muted-foreground">
                  ou selecione da galeria
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </CardContent>
      </Card>

      {/* Hunger Level Before */}
      <Card className="border-border/50 mb-4">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Nível de fome antes de comer
          </h2>
          <Slider
            value={hungerBefore}
            onValueChange={setHungerBefore}
            min={1}
            max={5}
            step={1}
            className="mb-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Sem fome</span>
            <span className="font-medium text-foreground">
              {hungerLevels[hungerBefore[0] - 1]?.label}
            </span>
            <span>Muita fome</span>
          </div>
        </CardContent>
      </Card>

      {/* Satiety Level After */}
      <Card className="border-border/50 mb-4">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Nível de saciedade após comer
          </h2>
          <Slider
            value={satietyAfter}
            onValueChange={setSatietyAfter}
            min={1}
            max={5}
            step={1}
            className="mb-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Insatisfeito</span>
            <span className="font-medium text-foreground">
              {hungerLevels[satietyAfter[0] - 1]?.label}
            </span>
            <span>Muito satisfeito</span>
          </div>
        </CardContent>
      </Card>

      {/* Food Selector */}
      <Card className="border-border/50 mb-4">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Adicionar alimentos
          </h2>
          <div className="space-y-2">
            {mockFoodNames.map((name, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleAddFood(index)}
              >
                + {name}
              </Button>
            ))}
          </div>
          {selectedFoods.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Alimentos selecionados:</p>
              {selectedFoods.map((food, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span>{mockFoodNames[parseInt(food.food_id) - 1]} ({food.quantity_g}g)</span>
                  <button
                    onClick={() => handleRemoveFood(index)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Macro Summary Bar */}
      {selectedFoods.length > 0 && (
        <Card className="border-primary/30 bg-primary/5 mb-4">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-foreground mb-2">
              Totais da Refeição
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-primary">{macroTotals.calories}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{macroTotals.protein}g</p>
                <p className="text-xs text-muted-foreground">Proteína</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{macroTotals.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbos</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{macroTotals.fat}g</p>
                <p className="text-xs text-muted-foreground">Gordura</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button
        className="w-full h-12 rounded-xl text-base font-semibold"
        disabled={!selectedMeal || submitting}
        onClick={handleSubmit}
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <UtensilsCrossed className="w-5 h-5 mr-2" />
        )}
        {submitting ? 'Registrando...' : 'Registrar Refeição'}
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Seus registros ajudam seu nutricionista a acompanhar seu progresso
      </p>
    </div>
  );
}