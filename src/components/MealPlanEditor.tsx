import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FoodSearchAutocomplete } from '@/components/FoodSearchAutocomplete';
import { PatientNotesDrawer } from '@/components/PatientNotesDrawer';
import { CriticalTagsBadges } from '@/components/CriticalTagsBadges';
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
  Search
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
  'Café da Manhã': 'bg-warning/10 text-warning',
  'Lanche da Manhã': 'bg-info/10 text-info',
  'Almoço': 'bg-success/10 text-success',
  'Lanche da Tarde': 'bg-info/10 text-info',
  'Jantar': 'bg-primary/10 text-primary',
  'Ceia': 'bg-muted text-muted-foreground',
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
    
    // Recalculate meal total calories
    newData.meals[mealIndex].totalCalories = newData.meals[mealIndex].items.reduce(
      (sum, item) => sum + (item.calories || 0), 0
    );
    
    // Recalculate total calories
    newData.totalCalories = newData.meals.reduce(
      (sum, meal) => sum + (meal.totalCalories || 0), 0
    );
    
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
    
    // Recalculate totals
    newData.meals[mealIndex].totalCalories = newData.meals[mealIndex].items.reduce(
      (sum, item) => sum + (item.calories || 0), 0
    );
    newData.totalCalories = newData.meals.reduce(
      (sum, meal) => sum + (meal.totalCalories || 0), 0
    );
    
    setEditedData(newData);
    setSearchingMealIndex(null);
  };

  const removeMealItem = (mealIndex: number, itemIndex: number) => {
    const newData = { ...editedData };
    newData.meals[mealIndex].items.splice(itemIndex, 1);
    
    // Recalculate totals
    newData.meals[mealIndex].totalCalories = newData.meals[mealIndex].items.reduce(
      (sum, item) => sum + (item.calories || 0), 0
    );
    newData.totalCalories = newData.meals.reduce(
      (sum, meal) => sum + (meal.totalCalories || 0), 0
    );
    
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
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 animate-pulse-slow">
          <CriticalTagsBadges tags={patient.critical_tags} size="md" />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-center sticky top-16 z-40 bg-background py-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-warning/10 text-warning">
            Modo Edição
          </Badge>
          {patient && (
            <PatientNotesDrawer patient={patient} open={notesDrawerOpen} onOpenChange={setNotesDrawerOpen}>
              <Button variant="outline" size="sm" className="gap-2">
                <StickyNote className="w-4 h-4" />
                Lembretes
              </Button>
            </PatientNotesDrawer>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Total Calories Summary */}
      <Card className="border-warning/50 bg-warning/5">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total de Calorias</span>
            <span className="text-2xl font-bold text-primary">{editedData.totalCalories || 0} kcal</span>
          </div>
        </CardContent>
      </Card>

      {/* Meals */}
      {editedData.meals?.map((meal, mealIndex) => (
        <Card key={mealIndex} className="border-0 shadow-md overflow-hidden">
          <CardHeader className={`${mealColors[meal.name] || 'bg-muted'} py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center">
                  {mealIcons[meal.name] || <UtensilsCrossed className="w-5 h-5" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{meal.name}</CardTitle>
                  <Input
                    type="text"
                    value={meal.time || ''}
                    onChange={(e) => updateMealTime(mealIndex, e.target.value)}
                    placeholder="ex: 07:00"
                    className="h-7 w-24 mt-1 bg-background/50 border-0 text-xs"
                  />
                </div>
              </div>
              <Badge variant="secondary" className="bg-background/50">
                {meal.totalCalories || 0} kcal
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {meal.items?.map((item, itemIndex) => (
                <div 
                  key={itemIndex} 
                  className="grid grid-cols-12 gap-2 items-center py-2 border-b last:border-0"
                >
                  <div className="col-span-1 flex items-center justify-center text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="col-span-4">
                    <Input
                      value={item.food}
                      onChange={(e) => updateMealItem(mealIndex, itemIndex, 'food', e.target.value)}
                      placeholder="Alimento"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      value={item.portion}
                      onChange={(e) => updateMealItem(mealIndex, itemIndex, 'portion', e.target.value)}
                      placeholder="Porção"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={item.calories || ''}
                      onChange={(e) => updateMealItem(mealIndex, itemIndex, 'calories', e.target.value)}
                      placeholder="kcal"
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
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
              <div className="mt-3 p-3 border rounded-lg bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Buscar Alimento/Suplemento</span>
                  <Button variant="ghost" size="sm" onClick={() => setSearchingMealIndex(null)}>
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
                  className="flex-1 gap-2"
                  onClick={() => setSearchingMealIndex(mealIndex)}
                >
                  <Search className="w-4 h-4" />
                  Buscar Alimento
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="border-dashed border"
                  onClick={() => addMealItem(mealIndex)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Manual
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Notes */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedData.notes || ''}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Adicione observações para o paciente..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
