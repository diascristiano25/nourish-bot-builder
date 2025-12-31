import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Camera, 
  Upload, 
  UtensilsCrossed,
  Smile,
  Frown,
  Meh,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mealOptions = [
  { id: 'cafe', name: 'Café da Manhã', icon: '☕' },
  { id: 'lanche-manha', name: 'Lanche da Manhã', icon: '🍎' },
  { id: 'almoco', name: 'Almoço', icon: '🍽️' },
  { id: 'lanche-tarde', name: 'Lanche da Tarde', icon: '🥤' },
  { id: 'jantar', name: 'Jantar', icon: '🌙' },
  { id: 'ceia', name: 'Ceia', icon: '🫖' },
];

const hungerLevels = [
  { value: 1, label: 'Nenhuma', icon: Frown },
  { value: 2, label: 'Pouca', icon: Meh },
  { value: 3, label: 'Moderada', icon: Meh },
  { value: 4, label: 'Muita', icon: Smile },
  { value: 5, label: 'Extrema', icon: Smile },
];

export function PatientRegistro() {
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [hungerBefore, setHungerBefore] = useState([3]);
  const [satietyAfter, setSatietyAfter] = useState([3]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
                  "flex items-center gap-2 p-3 rounded-xl border transition-all",
                  selectedMeal === meal.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-foreground hover:border-primary/30"
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
                onClick={() => setImagePreview(null)}
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

      {/* Submit Button */}
      <Button 
        className="w-full h-12 rounded-xl text-base font-semibold"
        disabled={!selectedMeal}
      >
        <UtensilsCrossed className="w-5 h-5 mr-2" />
        Registrar Refeição
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Seus registros ajudam seu nutricionista a acompanhar seu progresso
      </p>
    </div>
  );
}
