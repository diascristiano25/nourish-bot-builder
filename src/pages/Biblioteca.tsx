import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
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
  Plus, 
  ArrowLeft,
  Apple,
  ChefHat,
  Trash2,
  Pencil,
  Loader2,
  Search,
  Sparkles,
  PenLine,
  BookOpen,
  Zap,
  Flame,
  Beef,
  Wheat,
  Droplet
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client-custom';
import { useToast } from '@/hooks/use-toast';
import { PageTour, bibliotecaTourSteps } from '@/components/PageTour';
import { BentoCard } from '@/components/ui/BentoCard';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { NeonText } from '@/components/ui/NeonText';

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
  const [recipeMode, setRecipeMode] = useState<'manual' | 'ai'>('manual');
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    notes: '',
    kcal: '',
    protein: '',
    carb: '',
    fat: ''
  });
  const [aiRecipeForm, setAiRecipeForm] = useState({
    ingredients: '',
    servings: '2',
    dietary_restrictions: '',
    goal: '',
    notes: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNutritionistAndData();
  }, [user]);

  const fetchNutritionistAndData = async () => {
    if (!user) return;
    
    try {
      const { data: nutritionist, error: nutritionistError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (nutritionistError) throw nutritionistError;
      if (!nutritionist) {
        setLoading(false);
        return;
      }
      
      setNutritionistId(nutritionist.id);
      
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

  const handleDeleteFood = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleDeleteRecipe = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
    setAiRecipeForm({ ingredients: '', servings: '2', dietary_restrictions: '', goal: '', notes: '' });
    setEditingRecipe(null);
    setRecipeMode('manual');
  };

  const generateRecipeWithAI = async () => {
    if (!aiRecipeForm.ingredients.trim()) {
      toast({
        title: 'Erro',
        description: 'Informe pelo menos os ingredientes principais.',
        variant: 'destructive'
      });
      return;
    }

    setGeneratingRecipe(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: {
          ingredients: aiRecipeForm.ingredients,
          servings: aiRecipeForm.servings,
          dietary_restrictions: aiRecipeForm.dietary_restrictions,
          goal: aiRecipeForm.goal,
          notes: aiRecipeForm.notes
        }
      });

      if (error) throw error;

      if (data?.recipe) {
        const recipe = data.recipe;
        
        const notesContent = [
          recipe.ingredients?.length ? `**Ingredientes:**\n${recipe.ingredients.join('\n')}` : '',
          recipe.instructions ? `\n**Modo de Preparo:**\n${recipe.instructions}` : '',
          recipe.prep_time ? `\n**Tempo de preparo:** ${recipe.prep_time}` : '',
          recipe.servings ? `\n**Porções:** ${recipe.servings}` : '',
          recipe.tips ? `\n**Dicas:** ${recipe.tips}` : ''
        ].filter(Boolean).join('\n');

        setRecipeForm({
          name: recipe.name || '',
          notes: notesContent,
          kcal: String(recipe.macros?.kcal || 0),
          protein: String(recipe.macros?.protein || 0),
          carb: String(recipe.macros?.carb || 0),
          fat: String(recipe.macros?.fat || 0)
        });

        setRecipeMode('manual');
        toast({ title: 'Receita gerada com sucesso!', description: 'Revise e salve a receita.' });
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: 'Erro ao gerar receita',
        description: 'Tente novamente ou crie manualmente.',
        variant: 'destructive'
      });
    } finally {
      setGeneratingRecipe(false);
    }
  };

  const openEditFood = (food: CustomFood, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const openEditRecipe = (recipe: CustomRecipe, e: React.MouseEvent) => {
    e.stopPropagation();
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
      <PageTour tourKey="biblioteca" steps={bibliotecaTourSteps} run />
      <div className="min-h-screen bg-background">
        {/* Glassmorphism Header */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-[40px] border-b border-border">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-xl bg-muted/50 border border-border hover:bg-primary/10 hover:border-primary/30"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Minha <NeonText variant="lime">Biblioteca</NeonText>
                  </h1>
                  <p className="text-xs text-muted-foreground">Alimentos e receitas personalizados</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
          {/* Search */}
          <BentoCard size="sm" interactive={false} glow="none" className="max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar alimentos ou receitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 rounded-xl bg-muted/50 border-border focus:border-primary/50"
              />
            </div>
          </BentoCard>

          <Tabs defaultValue="foods" className="space-y-6">
            <TabsList className="bg-muted/70 backdrop-blur-[20px] border border-border p-1.5 rounded-2xl h-auto">
              <TabsTrigger 
                value="foods" 
                className="rounded-xl px-6 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2 font-medium transition-all"
                data-tour="biblioteca-foods-tab"
              >
                <Apple className="w-4 h-4" />
                Alimentos
                <Badge className="ml-1 bg-primary/20 text-primary border-0">{foods.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="recipes" 
                className="rounded-xl px-6 py-3 data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary gap-2 font-medium transition-all"
                data-tour="biblioteca-recipes-tab"
              >
                <ChefHat className="w-4 h-4" />
                Receitas
                <Badge className="ml-1 bg-secondary/20 text-secondary border-0">{recipes.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Foods Tab - BENTO GRID */}
            <TabsContent value="foods" className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Cadastre alimentos personalizados para usar em suas prescrições
                </p>
                <Dialog open={foodModalOpen} onOpenChange={(open) => {
                  setFoodModalOpen(open);
                  if (!open) resetFoodForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-primary-foreground rounded-xl h-11 px-5 font-medium shadow-lg shadow-primary/20" data-tour="biblioteca-new-food">
                      <Plus className="w-4 h-4" />
                      Novo Alimento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card/95 backdrop-blur-[40px] border-border">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Apple className="w-5 h-5 text-primary" />
                        {editingFood ? 'Editar Alimento' : 'Novo Alimento'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Nome do Alimento</Label>
                        <Input
                          placeholder="Ex: Pão de queijo fit"
                          value={foodForm.name}
                          onChange={(e) => setFoodForm(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-muted/50 border-border h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Unidade de Medida</Label>
                        <Select 
                          value={foodForm.unit_type}
                          onValueChange={(v) => setFoodForm(prev => ({ ...prev, unit_type: v }))}
                        >
                          <SelectTrigger className="bg-muted/50 border-border h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card/95 backdrop-blur-[40px] border-border">
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
                          <Label className="text-muted-foreground text-sm">Calorias (kcal)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={foodForm.kcal}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, kcal: e.target.value }))}
                            className="bg-muted/50 border-border h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Proteínas (g)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={foodForm.protein}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, protein: e.target.value }))}
                            className="bg-muted/50 border-border h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Carboidratos (g)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={foodForm.carb}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, carb: e.target.value }))}
                            className="bg-muted/50 border-border h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Gorduras (g)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={foodForm.fat}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, fat: e.target.value }))}
                            className="bg-muted/50 border-border h-11 rounded-xl"
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 h-11 rounded-xl font-medium" 
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
                <BentoCard className="py-16 text-center max-w-lg mx-auto" interactive={false}>
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Apple className="w-10 h-10 text-primary/50" />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    {searchTerm ? 'Nenhum alimento encontrado' : 'Nenhum alimento cadastrado ainda'}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Clique em "Novo Alimento" para começar
                    </p>
                  )}
                </BentoCard>
              ) : (
                <BentoGrid columns={4} gap="md">
                  {filteredFoods.map((food, index) => (
                    <BentoCard 
                      key={food.id} 
                      className="group"
                      glow="lime"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                          <Apple className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-primary/10"
                            onClick={(e) => openEditFood(food, e)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDeleteFood(food.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{food.name}</h3>
                      <p className="text-xs text-muted-foreground mb-4">por {food.unit_type}</p>
                      
                      {/* Macro Pills */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                          <Flame className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-mono font-medium text-primary">{food.kcal}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <Beef className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs font-mono font-medium text-blue-400">{food.protein}g</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <Wheat className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-mono font-medium text-amber-400">{food.carb}g</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                          <Droplet className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-xs font-mono font-medium text-rose-400">{food.fat}g</span>
                        </div>
                      </div>
                    </BentoCard>
                  ))}
                </BentoGrid>
              )}
            </TabsContent>

            {/* Recipes Tab - BENTO GRID */}
            <TabsContent value="recipes" className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Crie receitas completas para agilizar suas prescrições
                </p>
                <Dialog open={recipeModalOpen} onOpenChange={(open) => {
                  setRecipeModalOpen(open);
                  if (!open) resetRecipeForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-gradient-to-r from-secondary to-secondary/80 hover:opacity-90 text-secondary-foreground rounded-xl h-11 px-5 font-medium shadow-lg shadow-secondary/20" data-tour="biblioteca-new-recipe">
                      <Plus className="w-4 h-4" />
                      Nova Receita
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card/95 backdrop-blur-[40px] border-border max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <ChefHat className="w-5 h-5 text-secondary" />
                        {editingRecipe ? 'Editar Receita' : 'Nova Receita'}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {/* Mode Toggle */}
                    {!editingRecipe && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant={recipeMode === 'manual' ? 'default' : 'outline'}
                          size="sm"
                          className={`flex-1 gap-2 rounded-xl ${recipeMode === 'manual' ? 'bg-secondary hover:bg-secondary/90' : 'border-border'}`}
                          onClick={() => setRecipeMode('manual')}
                        >
                          <PenLine className="w-4 h-4" />
                          Manual
                        </Button>
                        <Button
                          variant={recipeMode === 'ai' ? 'default' : 'outline'}
                          size="sm"
                          className={`flex-1 gap-2 rounded-xl ${recipeMode === 'ai' ? 'bg-gradient-to-r from-primary to-secondary' : 'border-border'}`}
                          onClick={() => setRecipeMode('ai')}
                        >
                          <Sparkles className="w-4 h-4" />
                          Gerar com IA
                        </Button>
                      </div>
                    )}

                    {/* AI Mode */}
                    {recipeMode === 'ai' && !editingRecipe && (
                      <div className="space-y-4 pt-4">
                        <BentoCard size="sm" interactive={false} className="border-primary/30">
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <Zap className="w-4 h-4" />
                            A IA vai criar uma receita completa com ingredientes, modo de preparo e macros.
                          </div>
                        </BentoCard>
                        
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Ingredientes Principais *</Label>
                          <Textarea
                            placeholder="Ex: frango, batata doce, brócolis, azeite..."
                            value={aiRecipeForm.ingredients}
                            onChange={(e) => setAiRecipeForm(prev => ({ ...prev, ingredients: e.target.value }))}
                            className="min-h-[80px] bg-muted/50 border-border rounded-xl"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Porções</Label>
                            <Select 
                              value={aiRecipeForm.servings}
                              onValueChange={(v) => setAiRecipeForm(prev => ({ ...prev, servings: v }))}
                            >
                              <SelectTrigger className="bg-muted/50 border-border h-11 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card/95 backdrop-blur-[40px] border-border">
                                <SelectItem value="1">1 porção</SelectItem>
                                <SelectItem value="2">2 porções</SelectItem>
                                <SelectItem value="4">4 porções</SelectItem>
                                <SelectItem value="6">6 porções</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Objetivo</Label>
                            <Select 
                              value={aiRecipeForm.goal}
                              onValueChange={(v) => setAiRecipeForm(prev => ({ ...prev, goal: v }))}
                            >
                              <SelectTrigger className="bg-muted/50 border-border h-11 rounded-xl">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent className="bg-card/95 backdrop-blur-[40px] border-border">
                                <SelectItem value="none">Nenhum específico</SelectItem>
                                <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                                <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                                <SelectItem value="low_carb">Low Carb</SelectItem>
                                <SelectItem value="alto_proteico">Alto Proteico</SelectItem>
                                <SelectItem value="vegetariano">Vegetariano</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Restrições Alimentares</Label>
                          <Input
                            placeholder="Ex: sem lactose, sem glúten, sem amendoim..."
                            value={aiRecipeForm.dietary_restrictions}
                            onChange={(e) => setAiRecipeForm(prev => ({ ...prev, dietary_restrictions: e.target.value }))}
                            className="bg-muted/50 border-border h-11 rounded-xl"
                          />
                        </div>
                        
                        <Button 
                          className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-11 rounded-xl font-medium" 
                          onClick={generateRecipeWithAI}
                          disabled={generatingRecipe || !aiRecipeForm.ingredients.trim()}
                        >
                          {generatingRecipe ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> Gerar Receita</>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Manual Mode */}
                    {(recipeMode === 'manual' || editingRecipe) && (
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Nome da Receita</Label>
                          <Input
                            placeholder="Ex: Frango grelhado com legumes"
                            value={recipeForm.name}
                            onChange={(e) => setRecipeForm(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-muted/50 border-border h-11 rounded-xl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Notas / Modo de Preparo</Label>
                          <Textarea
                            placeholder="Ingredientes, instruções..."
                            value={recipeForm.notes}
                            onChange={(e) => setRecipeForm(prev => ({ ...prev, notes: e.target.value }))}
                            className="min-h-[100px] bg-muted/50 border-border rounded-xl"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Calorias (kcal)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={recipeForm.kcal}
                              onChange={(e) => setRecipeForm(prev => ({ ...prev, kcal: e.target.value }))}
                              className="bg-muted/50 border-border h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Proteínas (g)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={recipeForm.protein}
                              onChange={(e) => setRecipeForm(prev => ({ ...prev, protein: e.target.value }))}
                              className="bg-muted/50 border-border h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Carboidratos (g)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={recipeForm.carb}
                              onChange={(e) => setRecipeForm(prev => ({ ...prev, carb: e.target.value }))}
                              className="bg-muted/50 border-border h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Gorduras (g)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={recipeForm.fat}
                              onChange={(e) => setRecipeForm(prev => ({ ...prev, fat: e.target.value }))}
                              className="bg-muted/50 border-border h-11 rounded-xl"
                            />
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:opacity-90 h-11 rounded-xl font-medium" 
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
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {filteredRecipes.length === 0 ? (
                <BentoCard className="py-16 text-center max-w-lg mx-auto" interactive={false}>
                  <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                    <ChefHat className="w-10 h-10 text-secondary/50" />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    {searchTerm ? 'Nenhuma receita encontrada' : 'Nenhuma receita cadastrada ainda'}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Clique em "Nova Receita" para começar
                    </p>
                  )}
                </BentoCard>
              ) : (
                <BentoGrid columns={3} gap="md">
                  {filteredRecipes.map((recipe, index) => (
                    <BentoCard 
                      key={recipe.id} 
                      className="group"
                      glow="violet"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center border border-secondary/20">
                          <ChefHat className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-secondary/10"
                            onClick={(e) => openEditRecipe(recipe, e)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{recipe.name}</h3>
                      {recipe.notes && (
                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{recipe.notes}</p>
                      )}
                      
                      {/* Macro Summary */}
                      <div className="flex items-center gap-3 pt-4 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-secondary" />
                          <span className="text-xs font-mono font-medium text-secondary">{recipe.estimated_macros.kcal}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Beef className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs font-mono text-muted-foreground">{recipe.estimated_macros.protein}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wheat className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-mono text-muted-foreground">{recipe.estimated_macros.carb}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplet className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-xs font-mono text-muted-foreground">{recipe.estimated_macros.fat}g</span>
                        </div>
                      </div>
                    </BentoCard>
                  ))}
                </BentoGrid>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AppLayout>
  );
}
