import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Pill, Apple, Loader2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FoodItem {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  portion_description: string;
  portion_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_supplement: boolean;
  supplement_type: string | null;
}

interface FoodSearchAutocompleteProps {
  onSelect: (food: FoodItem) => void;
  placeholder?: string;
  className?: string;
}

const categoryColors: Record<string, string> = {
  'Carnes': 'bg-red-100 text-red-800',
  'Peixes': 'bg-blue-100 text-blue-800',
  'Frutos do Mar': 'bg-cyan-100 text-cyan-800',
  'Ovos': 'bg-amber-100 text-amber-800',
  'Laticínios': 'bg-sky-100 text-sky-800',
  'Cereais': 'bg-yellow-100 text-yellow-800',
  'Leguminosas': 'bg-orange-100 text-orange-800',
  'Tubérculos': 'bg-stone-100 text-stone-800',
  'Massas': 'bg-amber-100 text-amber-800',
  'Pães': 'bg-yellow-100 text-yellow-800',
  'Frutas': 'bg-pink-100 text-pink-800',
  'Verduras': 'bg-emerald-100 text-emerald-800',
  'Legumes': 'bg-green-100 text-green-800',
  'Óleos': 'bg-lime-100 text-lime-800',
  'Oleaginosas': 'bg-amber-100 text-amber-800',
  'Sementes': 'bg-teal-100 text-teal-800',
  'Suplementos': 'bg-purple-100 text-purple-800',
};

const supplementTypeColors: Record<string, string> = {
  'Proteína': 'bg-violet-500',
  'Creatina': 'bg-blue-500',
  'Aminoácidos': 'bg-indigo-500',
  'Carboidrato': 'bg-amber-500',
  'Hipercalórico': 'bg-orange-500',
  'Pré-treino': 'bg-red-500',
  'Vitaminas': 'bg-emerald-500',
  'Minerais': 'bg-teal-500',
  'Ômega': 'bg-cyan-500',
  'Colágeno': 'bg-pink-500',
  'Sono': 'bg-purple-500',
};

export function FoodSearchAutocomplete({ onSelect, placeholder = "Buscar alimento ou suplemento...", className }: FoodSearchAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'food' | 'supplement'>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [brands, setBrands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch available brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      const { data } = await supabase
        .from('food_database')
        .select('brand')
        .eq('is_supplement', true)
        .not('brand', 'is', null);
      
      if (data) {
        const uniqueBrands = [...new Set(data.map(d => d.brand).filter(Boolean))] as string[];
        setBrands(uniqueBrands.sort());
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (search.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('food_database')
          .select('*')
          .ilike('name', `%${search}%`)
          .order('name')
          .limit(30);

        if (filter === 'food') {
          query = query.eq('is_supplement', false);
        } else if (filter === 'supplement') {
          query = query.eq('is_supplement', true);
        }

        if (brandFilter !== 'all') {
          query = query.eq('brand', brandFilter);
        }

        const { data, error } = await query;

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error('Error searching foods:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, filter, brandFilter]);

  const handleSelect = (food: FoodItem) => {
    onSelect(food);
    setSearch('');
    setOpen(false);
  };

  const groupedResults = results.reduce((acc, food) => {
    const category = food.is_supplement ? 'Suplementos' : food.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(food);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              onFocus={() => search.length >= 2 && setOpen(true)}
              placeholder={placeholder}
              className="pl-10 pr-4"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[400px] p-0 z-50 bg-background border shadow-xl" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Filters */}
          <div className="p-3 border-b bg-muted/30 space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Filtros</span>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="food">Alimentos</SelectItem>
                  <SelectItem value="supplement">Suplementos</SelectItem>
                </SelectContent>
              </Select>
              {filter !== 'food' && (
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas marcas</SelectItem>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Command>
            <CommandList>
              {results.length === 0 && search.length >= 2 && !loading && (
                <CommandEmpty className="py-6 text-center text-sm">
                  Nenhum resultado encontrado
                </CommandEmpty>
              )}
              {search.length < 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Digite pelo menos 2 caracteres
                </div>
              )}
              <ScrollArea className="max-h-[350px]">
                {Object.entries(groupedResults).map(([category, foods]) => (
                  <CommandGroup key={category} heading={category} className="px-2">
                    {foods.map((food) => (
                      <CommandItem
                        key={food.id}
                        value={food.name}
                        onSelect={() => handleSelect(food)}
                        className="flex items-center justify-between py-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            food.is_supplement ? 'bg-purple-100' : 'bg-emerald-100'
                          )}>
                            {food.is_supplement ? (
                              <Pill className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Apple className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{food.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {food.brand && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1">
                                  {food.brand}
                                </Badge>
                              )}
                              {food.is_supplement && food.supplement_type && (
                                <span className={cn(
                                  "text-[10px] text-white px-1.5 py-0.5 rounded",
                                  supplementTypeColors[food.supplement_type] || 'bg-gray-500'
                                )}>
                                  {food.supplement_type}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {food.portion_description}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-bold text-sm text-primary">{food.calories}</div>
                          <div className="text-[10px] text-muted-foreground">kcal</div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
