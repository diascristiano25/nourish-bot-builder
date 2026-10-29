import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Camera,
  UtensilsCrossed,
  Smile,
  Frown,
  Meh,
  Loader2,
  Search,
  X,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const mealOptions = [
  { id: 'cafe', name: 'Café da Manhã', icon: '☕', dbValue: 'breakfast' },
  { id: 'lanche-manha', name: 'Lanche da Manhã', icon: '🍎', dbValue: 'snack' },
  { id: 'almoco', name: 'Almoço', icon: '🍽️', dbValue: 'lunch' },
  { id: 'lanche-tarde', name: 'Lanche da Tarde', icon: '🥤', dbValue: 'snack' },
  { id: 'jantar', name: 'Jantar', icon: '🌙', dbValue: 'dinner' },
  { id: 'ceia', name: 'Ceia', icon: '🫖', dbValue: 'snack' },
];

const hungerLevels = [
  { value: 1, label: 'Nenhuma', icon: Frown },
  { value: 2, label: 'Pouca', icon: Meh },
  { value: 3, label: 'Moderada', icon: Meh },
  { value: 4, label: 'Muita', icon: Smile },
  { value: 5, label: 'Extrema', icon: Smile },
];

interface FoodDBItem {
  id: string;
  name: string;
  category: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  portion_grams: number | null;
  portion_description: string | null;
  is_supplement: boolean;
}

interface SelectedFood {
  id: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function PatientRegistro() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [hungerBefore, setHungerBefore] = useState([3]);
  const [satietyAfter, setSatietyAfter] = useState([3]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Food search state
  const [foodSearch, setFoodSearch] = useState('');
  const [foodResults, setFoodResults] = useState<FoodDBItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Macro totals
  const macroTotals = selectedFoods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Debounced food search against the real food_database (546 items)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (foodSearch.trim().length < 2) {
      setFoodResults([]);
      return;
    }
    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('food_database')
          .select('id, name, category, calories, protein, carbs, fat, portion_grams, portion_description, is_supplement')
          .ilike('name', `%${foodSearch.trim()}%`)
          .order('name')
          .limit(20);
        if (error) throw error;
        setFoodResults(data || []);
      } catch (err) {
        console.error('Food search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [foodSearch]);

  const handleAddFood = (food: FoodDBItem) => {
    const grams = food.portion_grams || 100;
    const ratio = grams / 100;
    setSelectedFoods(prev => [
      ...prev,
      {
        id: food.id,
        name: food.name,
        grams,
        calories: Math.round((food.calories || 0) * ratio),
        protein: Math.round((food.protein || 0) * ratio * 10) / 10,
        carbs: Math.round((food.carbs || 0) * ratio * 10) / 10,
        fat: Math.round((food.fat || 0) * ratio * 10) / 10,
      },
    ]);
    setFoodSearch('');
    setFoodResults([]);
    setShowSearch(false);
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

      // Build notes with food details + hunger/satiety + macros
      const foodList = selectedFoods.length > 0
        ? selectedFoods.map(f => `${f.name} (${f.grams}g)`).join(', ')
        : 'Nenhum alimento especificado';
      const notesText = [
        `Alimentos: ${foodList}`,
        `Fome antes: ${hungerBefore[0]}/5`,
        `Saciedade após: ${satietyAfter[0]}/5`,
        selectedFoods.length > 0
          ? `Totais: ${Math.round(macroTotals.calories)}kcal | P:${Math.round(macroTotals.protein)}g C:${Math.round(macroTotals.carbs)}g G:${Math.round(macroTotals.fat)}g`
          : '',
        photoUrl ? 'Foto registrada' : '',
      ].filter(Boolean).join(' | ');

      // Persist to food_intake_logs — REAL schema columns only:
      // id, patient_id, meal_type, hunger_before, satiety_after,
      // photo_url, notes, logged_at, created_at
      // NO food_name, quantity, unit, calories columns exist!
      const { error: logErr } = await supabase.from('food_intake_logs').insert({
        patient_id: patientRow.id,
        meal_type: mealTypeMap[selectedMeal] || 'snack',
        hunger_before: hungerBefore[0],
        satiety_after: satietyAfter[0],
        photo_url: photoUrl,
        notes: notesText,
        logged_at: new Date().toISOString(),
      });
      if (logErr) throw logErr;

      toast({ title: 'Refeição registrada!', description: 'Seu nutricionista foi notificado.' });
      setSelectedMeal(null);
      setHungerBefore([3]);
      setSatietyAfter([3]);
      setImagePreview(null);
      setImageFile(null);
      setSelectedFoods([]);
      setFoodSearch('');
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

      {/* Food Selector — uses real food_database (546 items) */}
      <Card className="border-border/50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Adicionar alimentos
            </h2>
            {!showSearch && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => setShowSearch(true)}
              >
                <Search className="w-3 h-3" />
                Buscar
              </Button>
            )}
          </div>

          {showSearch && (
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  placeholder="Digite o nome do alimento..."
                  className="pl-9 h-10"
                  autoFocus
                />
                {foodSearch && (
                  <button
                    onClick={() => { setFoodSearch(''); setFoodResults([]); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {searching && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {!searching && foodSearch.length >= 2 && foodResults.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Nenhum alimento encontrado
                </p>
              )}

              {foodResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1 border border-border/50 rounded-lg p-1">
                  {foodResults.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleAddFood(food)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{food.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.portion_description || `${food.portion_grams || 100}g`} · {food.calories || 0} kcal
                          {food.is_supplement && ' · Suplemento'}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={() => { setShowSearch(false); setFoodSearch(''); setFoodResults([]); }}
              >
                Fechar busca
              </Button>
            </div>
          )}

          {/* Selected foods list */}
          {selectedFoods.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Alimentos selecionados:</p>
              {selectedFoods.map((food, index) => (
                <div key={`${food.id}-${index}`} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0">
                  <span className="text-foreground">
                    {food.name} ({food.grams}g) · {food.calories}kcal
                  </span>
                  <button
                    onClick={() => handleRemoveFood(index)}
                    className="text-destructive hover:text-destructive/80 ml-2 flex-shrink-0"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedFoods.length === 0 && !showSearch && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Toque em "Buscar" para adicionar alimentos da base completa
            </p>
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
                <p className="text-lg font-bold text-primary">{Math.round(macroTotals.calories)}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{Math.round(macroTotals.protein)}g</p>
                <p className="text-xs text-muted-foreground">Proteína</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{Math.round(macroTotals.carbs)}g</p>
                <p className="text-xs text-muted-foreground">Carbos</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{Math.round(macroTotals.fat)}g</p>
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