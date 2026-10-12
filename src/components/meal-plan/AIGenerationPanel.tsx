import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AIGenerationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (preferences: any) => Promise<void>;
}

export function AIGenerationPanel({ open, onOpenChange, onGenerate }: AIGenerationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    goal: 'weight_loss',
    calories: 2000,
    mealsPerDay: 4,
    dietaryRestrictions: '',
    allergies: '',
    preferences: ''
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await onGenerate(preferences);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Gerar Cardápio com IA
          </DialogTitle>
          <DialogDescription>
            Configure as preferências e deixe a IA criar um plano alimentar personalizado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Goal */}
          <div className="space-y-2">
            <Label>Objetivo do Paciente</Label>
            <Select
              value={preferences.goal}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, goal: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Perda de Peso</SelectItem>
                <SelectItem value="muscle_gain">Ganho de Massa Muscular</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="health_improvement">Melhora da Saúde</SelectItem>
                <SelectItem value="sports_performance">Performance Esportiva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calories */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meta de Calorias (kcal/dia)</Label>
              <Input
                type="number"
                value={preferences.calories}
                onChange={(e) => setPreferences(prev => ({ ...prev, calories: Number(e.target.value) }))}
                min={1000}
                max={5000}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Refeições por Dia</Label>
              <Select
                value={String(preferences.mealsPerDay)}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, mealsPerDay: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 refeições</SelectItem>
                  <SelectItem value="4">4 refeições</SelectItem>
                  <SelectItem value="5">5 refeições</SelectItem>
                  <SelectItem value="6">6 refeições</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-2">
            <Label>Restrições Alimentares</Label>
            <Input
              placeholder="Ex: vegetariano, sem lactose, sem glúten..."
              value={preferences.dietaryRestrictions}
              onChange={(e) => setPreferences(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
            />
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <Label>Alergias</Label>
            <Input
              placeholder="Ex: amendoim, frutos do mar, soja..."
              value={preferences.allergies}
              onChange={(e) => setPreferences(prev => ({ ...prev, allergies: e.target.value }))}
            />
          </div>

          {/* Additional Preferences */}
          <div className="space-y-2">
            <Label>Preferências Adicionais</Label>
            <Textarea
              placeholder="Ex: gosta de batata doce, não gosta de brócolis, prefere refeições rápidas..."
              value={preferences.preferences}
              onChange={(e) => setPreferences(prev => ({ ...prev, preferences: e.target.value }))}
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar Cardápio
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
