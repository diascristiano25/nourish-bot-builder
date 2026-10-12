import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Food {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface FoodSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFood: (food: Food) => void;
}

export function FoodSearchDialog({ open, onOpenChange, onSelectFood }: FoodSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadFoods();
    }
  }, [open]);

  const loadFoods = async (query = '') => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('food_database')
        .select('*')
        .order('name');

      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }

      const { data, error } = await queryBuilder.limit(50);

      if (error) throw error;

      setFoods(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar alimentos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadFoods(searchQuery);
  };

  const handleSelectFood = (food: any) => {
    onSelectFood({
      id: `food-${Date.now()}-${Math.random()}`,
      name: food.name,
      quantity: 100,
      unit: 'g',
      calories: food.calories,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fats: food.fats || 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buscar Alimento</DialogTitle>
          <DialogDescription>
            Pesquise na base TACO ou nos seus alimentos customizados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Digite o nome do alimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              Buscar
            </Button>
          </div>

          {/* Results */}
          <ScrollArea className="h-[400px] rounded-lg border border-border/40">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Carregando...
              </div>
            ) : foods.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum alimento encontrado
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {foods.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{food.name}</h4>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{food.calories} kcal</span>
                        <span>•</span>
                        <span>P: {food.protein?.toFixed(1) || 0}g</span>
                        <span>C: {food.carbs?.toFixed(1) || 0}g</span>
                        <span>G: {food.fats?.toFixed(1) || 0}g</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Por 100g
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectFood(food)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
