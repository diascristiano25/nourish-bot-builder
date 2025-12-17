import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  ArrowLeft,
  Apple,
  ChefHat,
  Trash2,
  Pencil,
  Loader2,
  Search
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomFood {
  id: string;
  name: string;
  unit_type: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
}

interface CustomRecipe {
  id: string;
  name: string;
  notes: string | null;
  estimated_macros: {
    kcal: number;
    protein: number;
    carb: number;
    fat: number;
  };
  ingredients: any[];
}

export default function Biblioteca() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [foods, setFoods] = useState<CustomFood[]>([]);
  const [recipes, setRecipes] = useState<CustomRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [nutritionistId, setNutritionistId] = useState<string | null>(null);
  
  // Food modal state
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [savingFood, setSavingFood] = useState(false);
  const [editingFood, setEditingFood] = useState<CustomFood | null>(null);
  const [foodForm, setFoodForm] = useState({
    name: '',
    unit_type: 'g',
    kcal: '',
    protein: '',
    carb: '',
    fat: ''
  });
  
  // Recipe modal state
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<CustomRecipe | null>(null);
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    notes: '',
    kcal: '',
    protein: '',
    carb: '',
    fat: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNutritionistAndData();
  }, [user]);

  const fetchNutritionistAndData = async () => {
    if (!user) return;
    
    try {
      // Get nutritionist ID
      const { data: nutritionist, error: nutritionistError } = await supabase
        .from('nutritionists')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (nutritionistError) throw nutritionistError;
      if (!nutritionist) {
        setLoading(false);
        return;
      }
      
      setNutritionistId(nutritionist.id);
      
      // Fetch foods and recipes in parallel
      const [foodsResult, recipesResult] = await Promise.all([
        supabase
          .from('custom_foods')
          .select('*')
          .eq('nutritionist_id', nutritionist.id)
          .order('name'),
        supabase
          .from('custom_recipes')
          .select('*')
          .eq('nutritionist_id', nutritionist.id)
          .order('name')
      ]);
      
      if (foodsResult.error) throw foodsResult.error;
      if (recipesResult.error) throw recipesResult.error;
      
      setFoods(foodsResult.data || []);
      setRecipes(recipesResult.data?.map(r => ({
        ...r,
        estimated_macros: r.estimated_macros as CustomRecipe['estimated_macros'],
        ingredients: r.ingredients as any[]
      })) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a biblioteca.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFood = async () => {
    if (!nutritionistId || !foodForm.name.trim()) return;
    
    setSavingFood(true);
    try {
      const foodData = {
        nutritionist_id: nutritionistId,
        name: foodForm.name.trim(),
        unit_type: foodForm.unit_type,
        kcal: parseFloat(foodForm.kcal) || 0,
        protein: parseFloat(foodForm.protein) || 0,
        carb: parseFloat(foodForm.carb) || 0,
        fat: parseFloat(foodForm.fat) || 0
      };
      
      if (editingFood) {
        const { error } = await supabase
          .from('custom_foods')
          .update(foodData)
          .eq('id', editingFood.id);
        if (error) throw error;
        toast({ title: 'Alimento atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('custom_foods')
          .insert(foodData);
        if (error) throw error;
        toast({ title: 'Alimento cadastrado com sucesso!' });
      }
      
      resetFoodForm();
      setFoodModalOpen(false);
      fetchNutritionistAndData();
    } catch (error) {
      console.error('Error saving food:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o alimento.',
        variant: 'destructive'
      });
    } finally {
      setSavingFood(false);
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_foods')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Alimento excluído!' });
      fetchNutritionistAndData();
    } catch (error) {
      console.error('Error deleting food:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o alimento.',
        variant: 'destructive'
      });
    }
  };

  const handleSaveRecipe = async () => {
    if (!nutritionistId || !recipeForm.name.trim()) return;
    
    setSavingRecipe(true);
    try {
      const recipeData = {
        nutritionist_id: nutritionistId,
        name: recipeForm.name.trim(),
        notes: recipeForm.notes.trim() || null,
        estimated_macros: {
          kcal: parseFloat(recipeForm.kcal) || 0,
          protein: parseFloat(recipeForm.protein) || 0,
          carb: parseFloat(recipeForm.carb) || 0,
          fat: parseFloat(recipeForm.fat) || 0
        }
      };
      
      if (editingRecipe) {
        const { error } = await supabase
          .from('custom_recipes')
          .update(recipeData)
          .eq('id', editingRecipe.id);
        if (error) throw error;
        toast({ title: 'Receita atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('custom_recipes')
          .insert(recipeData);
        if (error) throw error;
        toast({ title: 'Receita cadastrada com sucesso!' });
      }
      
      resetRecipeForm();
      setRecipeModalOpen(false);
      fetchNutritionistAndData();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a receita.',
        variant: 'destructive'
      });
    } finally {
      setSavingRecipe(false);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_recipes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Receita excluída!' });
      fetchNutritionistAndData();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a receita.',
        variant: 'destructive'
      });
    }
  };

  const resetFoodForm = () => {
    setFoodForm({ name: '', unit_type: 'g', kcal: '', protein: '', carb: '', fat: '' });
    setEditingFood(null);
  };

  const resetRecipeForm = () => {
    setRecipeForm({ name: '', notes: '', kcal: '', protein: '', carb: '', fat: '' });
    setEditingRecipe(null);
  };

  const openEditFood = (food: CustomFood) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      unit_type: food.unit_type,
      kcal: String(food.kcal),
      protein: String(food.protein),
      carb: String(food.carb),
      fat: String(food.fat)
    });
    setFoodModalOpen(true);
  };

  const openEditRecipe = (recipe: CustomRecipe) => {
    setEditingRecipe(recipe);
    setRecipeForm({
      name: recipe.name,
      notes: recipe.notes || '',
      kcal: String(recipe.estimated_macros.kcal),
      protein: String(recipe.estimated_macros.protein),
      carb: String(recipe.estimated_macros.carb),
      fat: String(recipe.estimated_macros.fat)
    });
    setRecipeModalOpen(true);
  };

  const filteredFoods = foods.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50">
          <div className="px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-lg"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Minha Biblioteca</h1>
                <p className="text-xs text-muted-foreground">Alimentos e receitas personalizados</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-6xl mx-auto">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alimentos ou receitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>

          <Tabs defaultValue="foods" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 rounded-xl h-auto">
              <TabsTrigger 
                value="foods" 
                className="rounded-lg px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm gap-2"
              >
                <Apple className="w-4 h-4" />
                Alimentos Personalizados
                <Badge variant="secondary" className="ml-1">{foods.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="recipes" 
                className="rounded-lg px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm gap-2"
              >
                <ChefHat className="w-4 h-4" />
                Minhas Receitas
                <Badge variant="secondary" className="ml-1">{recipes.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Foods Tab */}
            <TabsContent value="foods" className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Cadastre alimentos personalizados para usar em suas prescrições
                </p>
                <Dialog open={foodModalOpen} onOpenChange={(open) => {
                  setFoodModalOpen(open);
                  if (!open) resetFoodForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Novo Alimento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingFood ? 'Editar Alimento' : 'Novo Alimento'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Nome do Alimento</Label>
                        <Input
                          placeholder="Ex: Pão de queijo fit"
                          value={foodForm.name}
                          onChange={(e) => setFoodForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unidade de Medida</Label>
                        <Select 
                          value={foodForm.unit_type}
                          onValueChange={(v) => setFoodForm(prev => ({ ...prev, unit_type: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">Gramas (g)</SelectItem>
                            <SelectItem value="ml">Mililitros (ml)</SelectItem>
                            <SelectItem value="unidade">Unidade</SelectItem>
                            <SelectItem value="colher">Colher</SelectItem>
                            <SelectItem value="xicara">Xícara</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Calorias (kcal)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={foodForm.kcal}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, kcal: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Proteínas (g)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={foodForm.protein}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, protein: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Carboidratos (g)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={foodForm.carb}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, carb: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Gorduras (g)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={foodForm.fat}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, fat: e.target.value }))}
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleSaveFood}
                        disabled={savingFood || !foodForm.name.trim()}
                      >
                        {savingFood ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                        ) : (
                          editingFood ? 'Atualizar Alimento' : 'Cadastrar Alimento'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {filteredFoods.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Apple className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Nenhum alimento encontrado' : 'Nenhum alimento cadastrado ainda'}
                    </p>
                    {!searchTerm && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Clique em "Novo Alimento" para começar
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="text-center">Unidade</TableHead>
                        <TableHead className="text-center">Kcal</TableHead>
                        <TableHead className="text-center">Prot (g)</TableHead>
                        <TableHead className="text-center">Carb (g)</TableHead>
                        <TableHead className="text-center">Gord (g)</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFoods.map((food) => (
                        <TableRow key={food.id}>
                          <TableCell className="font-medium">{food.name}</TableCell>
                          <TableCell className="text-center text-muted-foreground">{food.unit_type}</TableCell>
                          <TableCell className="text-center">{food.kcal}</TableCell>
                          <TableCell className="text-center">{food.protein}</TableCell>
                          <TableCell className="text-center">{food.carb}</TableCell>
                          <TableCell className="text-center">{food.fat}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditFood(food)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteFood(food.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </TabsContent>

            {/* Recipes Tab */}
            <TabsContent value="recipes" className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Crie receitas completas para agilizar suas prescrições
                </p>
                <Dialog open={recipeModalOpen} onOpenChange={(open) => {
                  setRecipeModalOpen(open);
                  if (!open) resetRecipeForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Nova Receita
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingRecipe ? 'Editar Receita' : 'Nova Receita'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Nome da Receita</Label>
                        <Input
                          placeholder="Ex: Smoothie proteico de banana"
                          value={recipeForm.name}
                          onChange={(e) => setRecipeForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Modo de Preparo / Notas</Label>
                        <Textarea
                          placeholder="Descreva o modo de preparo ou adicione observações..."
                          value={recipeForm.notes}
                          onChange={(e) => setRecipeForm(prev => ({ ...prev, notes: e.target.value }))}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Macros Estimados (por porção)</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="space-y-2">
                            <Label>Calorias (kcal)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={recipeForm.kcal}
                              onChange={(e) => setRecipeForm(prev => ({ ...prev, kcal: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Proteínas (g)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={recipeForm.protein}
                              onChange={(e) => setRecipeForm(prev => ({ ...prev, protein: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Carboidratos (g)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={recipeForm.carb}
                              onChange={(e) => setRecipeForm(prev => ({ ...prev, carb: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Gorduras (g)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={recipeForm.fat}
                              onChange={(e) => setRecipeForm(prev => ({ ...prev, fat: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleSaveRecipe}
                        disabled={savingRecipe || !recipeForm.name.trim()}
                      >
                        {savingRecipe ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                        ) : (
                          editingRecipe ? 'Atualizar Receita' : 'Cadastrar Receita'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {filteredRecipes.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <ChefHat className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Nenhuma receita encontrada' : 'Nenhuma receita cadastrada ainda'}
                    </p>
                    {!searchTerm && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Clique em "Nova Receita" para começar
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecipes.map((recipe) => (
                    <Card key={recipe.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ChefHat className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditRecipe(recipe)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteRecipe(recipe.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{recipe.name}</h3>
                        {recipe.notes && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {recipe.notes}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {recipe.estimated_macros.kcal} kcal
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            P: {recipe.estimated_macros.protein}g
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            C: {recipe.estimated_macros.carb}g
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            G: {recipe.estimated_macros.fat}g
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AppLayout>
  );
}
