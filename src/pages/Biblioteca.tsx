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
  Search,
  Sparkles,
  PenLine,
  BookOpen,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PageTour, bibliotecaTourSteps } from '@/components/PageTour';
import { GlassCard } from '@/components/ui/GlassCard';
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
      <PageTour tourKey="biblioteca" steps={bibliotecaTourSteps} run />
      <div className="min-h-screen bg-background">
        {/* Cyber Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-border/30">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl glass hover:bg-primary/10"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
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

        <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
          {/* Search */}
          <GlassCard variant="subtle" className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alimentos ou receitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </GlassCard>

          <Tabs defaultValue="foods" className="space-y-6">
            <TabsList className="glass p-1 rounded-xl h-auto border border-border/30">
              <TabsTrigger 
                value="foods" 
                className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2 font-medium"
                data-tour="biblioteca-foods-tab"
              >
                <Apple className="w-4 h-4" />
                Alimentos
                <Badge className="ml-1 bg-primary/20 text-primary border-0">{foods.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="recipes" 
                className="rounded-lg px-6 py-2.5 data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary gap-2 font-medium"
                data-tour="biblioteca-recipes-tab"
              >
                <ChefHat className="w-4 h-4" />
                Receitas
                <Badge className="ml-1 bg-secondary/20 text-secondary border-0">{recipes.length}</Badge>
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
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" data-tour="biblioteca-new-food">
                      <Plus className="w-4 h-4" />
                      Novo Alimento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-strong border-border/50">
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
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Unidade de Medida</Label>
                        <Select 
                          value={foodForm.unit_type}
                          onValueChange={(v) => setFoodForm(prev => ({ ...prev, unit_type: v }))}
                        >
                          <SelectTrigger className="bg-background/50 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-strong border-border/50">
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
                            className="bg-background/50 border-border/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Proteínas (g)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={foodForm.protein}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, protein: e.target.value }))}
                            className="bg-background/50 border-border/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Carboidratos (g)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={foodForm.carb}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, carb: e.target.value }))}
                            className="bg-background/50 border-border/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Gorduras (g)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={foodForm.fat}
                            onChange={(e) => setFoodForm(prev => ({ ...prev, fat: e.target.value }))}
                            className="bg-background/50 border-border/50"
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90" 
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
                <GlassCard className="border-dashed border-border/50 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Apple className="w-8 h-8 text-primary/50" />
                  </div>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Nenhum alimento encontrado' : 'Nenhum alimento cadastrado ainda'}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Clique em "Novo Alimento" para começar
                    </p>
                  )}
                </GlassCard>
              ) : (
                <GlassCard className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30 hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Nome</TableHead>
                        <TableHead className="text-center text-muted-foreground">Unidade</TableHead>
                        <TableHead className="text-center text-primary">Kcal</TableHead>
                        <TableHead className="text-center text-blue-400">Prot (g)</TableHead>
                        <TableHead className="text-center text-amber-400">Carb (g)</TableHead>
                        <TableHead className="text-center text-rose-400">Gord (g)</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFoods.map((food, index) => (
                        <TableRow 
                          key={food.id} 
                          className="border-border/30 hover:bg-primary/5 transition-colors"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium text-foreground">{food.name}</TableCell>
                          <TableCell className="text-center text-muted-foreground">{food.unit_type}</TableCell>
                          <TableCell className="text-center font-mono text-primary">{food.kcal}</TableCell>
                          <TableCell className="text-center font-mono text-blue-400">{food.protein}</TableCell>
                          <TableCell className="text-center font-mono text-amber-400">{food.carb}</TableCell>
                          <TableCell className="text-center font-mono text-rose-400">{food.fat}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10"
                                onClick={() => openEditFood(food)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                </GlassCard>
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
                    <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground" data-tour="biblioteca-new-recipe">
                      <Plus className="w-4 h-4" />
                      Nova Receita
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-strong border-border/50 max-w-lg max-h-[90vh] overflow-y-auto">
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
                          className={`flex-1 gap-2 ${recipeMode === 'manual' ? 'bg-secondary' : 'border-border/50'}`}
                          onClick={() => setRecipeMode('manual')}
                        >
                          <PenLine className="w-4 h-4" />
                          Manual
                        </Button>
                        <Button
                          variant={recipeMode === 'ai' ? 'default' : 'outline'}
                          size="sm"
                          className={`flex-1 gap-2 ${recipeMode === 'ai' ? 'bg-gradient-to-r from-primary to-secondary' : 'border-border/50'}`}
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
                        <GlassCard variant="subtle" className="p-4 border-primary/30">
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <Zap className="w-4 h-4" />
                            A IA vai criar uma receita completa com ingredientes, modo de preparo e macros.
                          </div>
                        </GlassCard>
                        
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Ingredientes Principais *</Label>
                          <Textarea
                            placeholder="Ex: frango, batata doce, brócolis, azeite..."
                            value={aiRecipeForm.ingredients}
                            onChange={(e) => setAiRecipeForm(prev => ({ ...prev, ingredients: e.target.value }))}
                            className="min-h-[80px] bg-background/50 border-border/50"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Porções</Label>
                            <Select 
                              value={aiRecipeForm.servings}
                              onValueChange={(v) => setAiRecipeForm(prev => ({ ...prev, servings: v }))}
                            >
                              <SelectTrigger className="bg-background/50 border-border/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass-strong border-border/50">
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
                              <SelectTrigger className="bg-background/50 border-border/50">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent className="glass-strong border-border/50">
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
                            className="bg-background/50 border-border/50"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Observações (opcional)</Label>
                          <Input
                            placeholder="Ex: receita rápida, para pré-treino, sabor suave..."
                            value={aiRecipeForm.notes}
                            onChange={(e) => setAiRecipeForm(prev => ({ ...prev, notes: e.target.value }))}
                            className="bg-background/50 border-border/50"
                          />
                        </div>
                        
                        <Button 
                          className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                          onClick={generateRecipeWithAI}
                          disabled={generatingRecipe || !aiRecipeForm.ingredients.trim()}
                        >
                          {generatingRecipe ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando receita...</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> Gerar Receita com IA</>
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
                            placeholder="Ex: Smoothie proteico de banana"
                            value={recipeForm.name}
                            onChange={(e) => setRecipeForm(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-background/50 border-border/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-sm">Ingredientes e Modo de Preparo</Label>
                          <Textarea
                            placeholder="Descreva os ingredientes e o modo de preparo..."
                            value={recipeForm.notes}
                            onChange={(e) => setRecipeForm(prev => ({ ...prev, notes: e.target.value }))}
                            className="min-h-[150px] bg-background/50 border-border/50"
                          />
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Macros Estimados (por porção)</Label>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-sm">Calorias (kcal)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={recipeForm.kcal}
                                onChange={(e) => setRecipeForm(prev => ({ ...prev, kcal: e.target.value }))}
                                className="bg-background/50 border-border/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-sm">Proteínas (g)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={recipeForm.protein}
                                onChange={(e) => setRecipeForm(prev => ({ ...prev, protein: e.target.value }))}
                                className="bg-background/50 border-border/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-sm">Carboidratos (g)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={recipeForm.carb}
                                onChange={(e) => setRecipeForm(prev => ({ ...prev, carb: e.target.value }))}
                                className="bg-background/50 border-border/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-sm">Gorduras (g)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={recipeForm.fat}
                                onChange={(e) => setRecipeForm(prev => ({ ...prev, fat: e.target.value }))}
                                className="bg-background/50 border-border/50"
                              />
                            </div>
                          </div>
                        </div>
                        <Button 
                          className="w-full bg-secondary hover:bg-secondary/90" 
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
                <GlassCard className="border-dashed border-border/50 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <ChefHat className="w-8 h-8 text-secondary/50" />
                  </div>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Nenhuma receita encontrada' : 'Nenhuma receita cadastrada ainda'}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Clique em "Nova Receita" para começar
                    </p>
                  )}
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRecipes.map((recipe, index) => (
                    <GlassCard 
                      key={recipe.id} 
                      glow="violet"
                      className="p-5 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                            <ChefHat className="w-5 h-5 text-secondary" />
                          </div>
                          <h3 className="font-semibold text-foreground">{recipe.name}</h3>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-secondary/10"
                            onClick={() => openEditRecipe(recipe)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteRecipe(recipe.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Macros Grid */}
                      <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-background/50">
                        <div className="text-center">
                          <p className="text-lg font-bold font-mono text-primary">{recipe.estimated_macros.kcal}</p>
                          <p className="text-xs text-muted-foreground">kcal</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold font-mono text-blue-400">{recipe.estimated_macros.protein}g</p>
                          <p className="text-xs text-muted-foreground">prot</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold font-mono text-amber-400">{recipe.estimated_macros.carb}g</p>
                          <p className="text-xs text-muted-foreground">carb</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold font-mono text-rose-400">{recipe.estimated_macros.fat}g</p>
                          <p className="text-xs text-muted-foreground">gord</p>
                        </div>
                      </div>
                      
                      {recipe.notes && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{recipe.notes}</p>
                      )}
                    </GlassCard>
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
