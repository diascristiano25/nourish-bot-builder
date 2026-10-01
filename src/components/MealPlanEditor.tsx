import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FoodSearchAutocomplete } from '@/components/FoodSearchAutocomplete';
import { PatientNotesDrawer } from '@/components/PatientNotesDrawer';
import { CriticalTagsBadges } from '@/components/CriticalTagsBadges';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  Coffee, 
  Sun, 
  Cookie, 
  Moon, 
  UtensilsCrossed,
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  StickyNote,
  Search,
  Zap
} from 'lucide-react';

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

interface PatientInfo {
  full_name: string;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  goal?: string | null;
  allergies?: string[] | null;
  dietary_restrictions?: string[] | null;
  medical_conditions?: string | null;
  notes?: string | null;
  critical_tags?: string[] | null;
}

interface MealPlanEditorProps {
  planData: MealPlanData;
  onSave: (data: MealPlanData) => void;
  onCancel: () => void;
  saving?: boolean;
  patient?: PatientInfo;
}

const mealIcons: Record<string, React.ReactNode> = {
  'Café da Manhã': <Coffee className="w-5 h-5" />,
  'Lanche da Manhã': <Cookie className="w-5 h-5" />,
  'Almoço': <Sun className="w-5 h-5" />,
  'Lanche da Tarde': <Cookie className="w-5 h-5" />,
  'Jantar': <Moon className="w-5 h-5" />,
  'Ceia': <UtensilsCrossed className="w-5 h-5" />,
};

const mealColors: Record<string, string> = {
  'Café da Manhã': 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  'Lanche da Manhã': 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
  'Almoço': 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
  'Lanche da Tarde': 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
  'Jantar': 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
  'Ceia': 'from-slate-500/20 to-gray-500/20 border-slate-500/30',
};

export default function MealPlanEditor({ planData, onSave, onCancel, saving, patient }: MealPlanEditorProps) {
  const [editedData, setEditedData] = useState<MealPlanData>(JSON.parse(JSON.stringify(planData)));
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [searchingMealIndex, setSearchingMealIndex] = useState<number | null>(null);

  const updateMealItem = (mealIndex: number, itemIndex: number, field: keyof MealItem, value: string | number) => {
    const newData = { ...editedData };
    const item = newData.meals[mealIndex].items[itemIndex];
    
    if (field === 'calories' || field === 'protein' || field === 'carbs' || field === 'fat') {
      item[field] = value === '' ? undefined : Number(value);
    } else {
      (item as any)[field] = value;
    }
    
    newData.meals[mealIndex].totalCalories = newData.meals[mealIndex].items.reduce(
      (sum, item) => sum + (item.calories || 0), 0
    );
    
    newData.totalCalories = newData.meals.reduce(
      (sum, meal) => sum + (meal.totalCalories || 0), 0
    );

    const totalMacros = newData.meals.reduce(
      (acc, meal) => {
        meal.items.forEach(item => {
          acc.protein += item.protein || 0;
          acc.carbs += item.carbs || 0;
          acc.fat += item.fat || 0;
        });
        return acc;
      },
      { protein: 0, carbs: 0, fat: 0 }
    );
    newData.macros = totalMacros;
    
    setEditedData(newData);
  };

  const updateMealTime = (mealIndex: number, time: string) => {
    const newData = { ...editedData };
    newData.meals[mealIndex].time = time;
    setEditedData(newData);
  };

  const addMealItem = (mealIndex: number) => {
    const newData = { ...editedData };
    newData.meals[mealIndex].items.push({
      food: 'Novo alimento',
      portion: '1 porção',
      calories: 0,
    });
    setEditedData(newData);
  };

  const addFoodFromSearch = (mealIndex: number, food: { name: string; portion_description: string; calories: number; protein: number; carbs: number; fat: number }) => {
    const newData = { ...editedData };
    newData.meals[mealIndex].items.push({
      food: food.name,
      portion: food.portion_description,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });
    
    newData.meals[mealIndex].totalCalories = newData.meals[mealIndex].items.reduce(
      (sum, item) => sum + (item.calories || 0), 0
    );
    newData.totalCalories = newData.meals.reduce(
      (sum, meal) => sum + (meal.totalCalories || 0), 0
    );

    const totalMacros = newData.meals.reduce(
      (acc, meal) => {
        meal.items.forEach(item => {
          acc.protein += item.protein || 0;
          acc.carbs += item.carbs || 0;
          acc.fat += item.fat || 0;
        });
        return acc;
      },
      { protein: 0, carbs: 0, fat: 0 }
    );
    newData.macros = totalMacros;
    
    setEditedData(newData);
    setSearchingMealIndex(null);
  };

  const removeMealItem = (mealIndex: number, itemIndex: number) => {
    const newData = { ...editedData };
    newData.meals[mealIndex].items.splice(itemIndex, 1);
    
    newData.meals[mealIndex].totalCalories = newData.meals[mealIndex].items.reduce(
      (sum, item) => sum + (item.calories || 0), 0
    );
    newData.totalCalories = newData.meals.reduce(
      (sum, meal) => sum + (meal.totalCalories || 0), 0
    );

    const totalMacros = newData.meals.reduce(
      (acc, meal) => {
        meal.items.forEach(item => {
          acc.protein += item.protein || 0;
          acc.carbs += item.carbs || 0;
          acc.fat += item.fat || 0;
        });
        return acc;
      },
      { protein: 0, carbs: 0, fat: 0 }
    );
    newData.macros = totalMacros;
    
    setEditedData(newData);
  };

  const updateNotes = (notes: string) => {
    setEditedData({ ...editedData, notes });
  };

  const handleSave = () => {
    onSave(editedData);
  };

  return (
    <div className="space-y-4">
      {/* Critical Tags Alert */}
      {patient?.critical_tags && patient.critical_tags.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-pulse">
          <CriticalTagsBadges tags={patient.critical_tags} size="md" />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-center sticky top-16 z-40 bg-background/80 backdrop-blur-xl py-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Zap className="w-3 h-3 mr-1" />
            Modo Edição
          </Badge>
          {patient && (
            <PatientNotesDrawer patient={patient} open={notesDrawerOpen} onOpenChange={setNotesDrawerOpen}>
              <Button variant="outline" size="sm" className="gap-2 border-cyan-500/30 hover:bg-cyan-500/10">
                <StickyNote className="w-4 h-4 text-cyan-400" />
                Lembretes
              </Button>
            </PatientNotesDrawer>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={saving} className="border-cyan-500/30">
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 border-0">
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Nutritional Summary */}
      <GlassCard className="border-cyan-500/30">
        <CardContent className="pt-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold font-mono text-cyan-400">{editedData.totalCalories || 0}</p>
              <p className="text-xs text-muted-foreground">kcal</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-blue-400">{Math.round(editedData.macros?.protein || 0)}g</p>
              <p className="text-xs text-muted-foreground">Proteína</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-orange-400">{Math.round(editedData.macros?.carbs || 0)}g</p>
              <p className="text-xs text-muted-foreground">Carboidrato</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-yellow-400">{Math.round(editedData.macros?.fat || 0)}g</p>
              <p className="text-xs text-muted-foreground">Gordura</p>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Meals */}
      {editedData.meals?.map((meal, mealIndex) => (
        <GlassCard key={mealIndex} className={`border bg-gradient-to-br ${mealColors[meal.name] || 'from-slate-500/20 to-gray-500/20 border-slate-500/30'} overflow-hidden`}>
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-foreground">
                  {mealIcons[meal.name] || <UtensilsCrossed className="w-5 h-5" />}
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">{meal.name}</CardTitle>
                  <Input
                    type="text"
                    value={meal.time || ''}
                    onChange={(e) => updateMealTime(mealIndex, e.target.value)}
                    placeholder="ex: 07:00"
                    className="h-7 w-24 mt-1 bg-white/10 border-white/20 text-xs font-mono"
                  />
                </div>
              </div>
              <Badge className="bg-white/10 text-foreground border-white/20 font-mono">
                {meal.totalCalories || 0} kcal
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {meal.items?.map((item, itemIndex) => (
                <div 
                  key={itemIndex} 
                  className="grid grid-cols-12 gap-2 items-center py-2 border-b border-white/10 last:border-0"
                >
                  <div className="col-span-1 flex items-center justify-center text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="col-span-4">
                    <Input
                      value={item.food}
                      onChange={(e) => updateMealItem(mealIndex, itemIndex, 'food', e.target.value)}
                      placeholder="Alimento"
                      className="h-9 bg-input border-border"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      value={item.portion}
                      onChange={(e) => updateMealItem(mealIndex, itemIndex, 'portion', e.target.value)}
                      placeholder="Porção"
                      className="h-9 bg-input border-border"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={item.calories || ''}
                      onChange={(e) => updateMealItem(mealIndex, itemIndex, 'calories', e.target.value)}
                      placeholder="kcal"
                      className="h-9 bg-input border-border font-mono"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => removeMealItem(mealIndex, itemIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Food Search */}
            {searchingMealIndex === mealIndex ? (
              <div className="mt-3 p-3 border border-cyan-500/30 rounded-xl bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Buscar Alimento/Suplemento</span>
                  <Button variant="ghost" size="sm" onClick={() => setSearchingMealIndex(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <FoodSearchAutocomplete 
                  onSelect={(food) => addFoodFromSearch(mealIndex, food)}
                  placeholder="Digite o nome do alimento..."
                />
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2 border-cyan-500/30 hover:bg-cyan-500/10"
                  onClick={() => setSearchingMealIndex(mealIndex)}
                >
                  <Search className="w-4 h-4 text-cyan-400" />
                  Buscar Alimento
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="border border-dashed border-border hover:bg-muted/50"
                  onClick={() => addMealItem(mealIndex)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Manual
                </Button>
              </div>
            )}
          </CardContent>
        </GlassCard>
      ))}

      {/* Notes */}
      <GlassCard className="border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedData.notes || ''}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Adicione observações para o paciente..."
            rows={4}
            className="bg-white/5 border-cyan-500/20 focus:border-cyan-500/50"
          />
        </CardContent>
      </GlassCard>
    </div>
  );
}
