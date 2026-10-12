import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MealPlan } from './PlanLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';

interface PlanEditorProps {
  plan: MealPlan | null;
  onSave: (plan: MealPlan) => void;
  onClose: () => void;
}

export function PlanEditor({ plan, onSave, onClose }: PlanEditorProps) {
  const [formData, setFormData] = useState<Partial<MealPlan>>({
    name: plan?.name || '',
    description: plan?.description || '',
    calories: plan?.calories || 2000,
    protein: plan?.protein || 150,
    carbs: plan?.carbs || 250,
    fats: plan?.fats || 65,
    meals: plan?.meals || 3,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.calories || formData.calories < 500) {
      newErrors.calories = 'Calorias devem ser no mínimo 500';
    }

    if (!formData.protein || formData.protein < 10) {
      newErrors.protein = 'Proteína devem ser no mínimo 10g';
    }

    if (!formData.carbs || formData.carbs < 10) {
      newErrors.carbs = 'Carbos devem ser no mínimo 10g';
    }

    if (!formData.fats || formData.fats < 10) {
      newErrors.fats = 'Gorduras devem ser no mínimo 10g';
    }

    if (!formData.meals || formData.meals < 1 || formData.meals > 6) {
      newErrors.meals = 'Refeições devem estar entre 1 e 6';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newPlan: MealPlan = {
        id: plan?.id || Date.now().toString(),
        name: formData.name || '',
        description: formData.description || '',
        calories: formData.calories || 0,
        protein: formData.protein || 0,
        carbs: formData.carbs || 0,
        fats: formData.fats || 0,
        meals: formData.meals || 0,
        createdAt: plan?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSave(newPlan);
    } catch (error) {
      console.error('Error saving plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Editar Plano' : 'Criar Novo Plano'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Plano *</Label>
            <Input
              id="name"
              placeholder="Ex: Plano 2000 Calorias"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva o objetivo e características deste plano..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </div>
            )}
          </div>

          {/* Nutrition Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Calories */}
            <div className="space-y-2">
              <Label htmlFor="calories">Calorias *</Label>
              <Input
                id="calories"
                type="number"
                min="500"
                value={formData.calories || ''}
                onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                className={errors.calories ? 'border-red-500' : ''}
              />
              {errors.calories && (
                <div className="text-xs text-red-600">{errors.calories}</div>
              )}
            </div>

            {/* Protein */}
            <div className="space-y-2">
              <Label htmlFor="protein">Proteína (g) *</Label>
              <Input
                id="protein"
                type="number"
                min="10"
                value={formData.protein || ''}
                onChange={(e) => setFormData({ ...formData, protein: parseInt(e.target.value) })}
                className={errors.protein ? 'border-red-500' : ''}
              />
              {errors.protein && (
                <div className="text-xs text-red-600">{errors.protein}</div>
              )}
            </div>

            {/* Carbs */}
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbos (g) *</Label>
              <Input
                id="carbs"
                type="number"
                min="10"
                value={formData.carbs || ''}
                onChange={(e) => setFormData({ ...formData, carbs: parseInt(e.target.value) })}
                className={errors.carbs ? 'border-red-500' : ''}
              />
              {errors.carbs && (
                <div className="text-xs text-red-600">{errors.carbs}</div>
              )}
            </div>

            {/* Fats */}
            <div className="space-y-2">
              <Label htmlFor="fats">Gorduras (g) *</Label>
              <Input
                id="fats"
                type="number"
                min="10"
                value={formData.fats || ''}
                onChange={(e) => setFormData({ ...formData, fats: parseInt(e.target.value) })}
                className={errors.fats ? 'border-red-500' : ''}
              />
              {errors.fats && (
                <div className="text-xs text-red-600">{errors.fats}</div>
              )}
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-2">
            <Label htmlFor="meals">Refeições por Dia *</Label>
            <Input
              id="meals"
              type="number"
              min="1"
              max="6"
              value={formData.meals || ''}
              onChange={(e) => setFormData({ ...formData, meals: parseInt(e.target.value) })}
              className={errors.meals ? 'border-red-500' : ''}
            />
            {errors.meals && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.meals}
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="gap-2 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="gap-2 bg-orange-500 hover:bg-orange-600"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {plan ? 'Salvar Alterações' : 'Criar Plano'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
