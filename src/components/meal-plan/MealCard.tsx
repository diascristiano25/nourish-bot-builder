import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

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

interface MealCardProps {
  food: Food;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export function MealCard({ food, onRemove, onUpdateQuantity }: MealCardProps) {
  const controls = useDragControls();
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(food.quantity);

  const handleSaveQuantity = () => {
    onUpdateQuantity(quantity);
    setIsEditing(false);
  };

  const multiplier = quantity / 100;
  const displayCalories = Math.round(food.calories * multiplier);
  const displayProtein = (food.protein * multiplier).toFixed(1);
  const displayCarbs = (food.carbs * multiplier).toFixed(1);
  const displayFats = (food.fats * multiplier).toFixed(1);

  return (
    <Reorder.Item
      value={food}
      dragListener={false}
      dragControls={controls}
      className="group relative"
    >
      <div className="bg-card rounded-xl border border-border/40 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            onPointerDown={(e) => controls.start(e)}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Food Info */}
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{food.name}</h4>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20 h-7 text-xs"
                    min={1}
                    onBlur={handleSaveQuantity}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveQuantity()}
                    autoFocus
                  />
                  <span>{food.unit}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <span className="font-medium">{quantity}{food.unit}</span>
                  <Edit className="w-3 h-3" />
                </button>
              )}
              <span>•</span>
              <span>{displayCalories} kcal</span>
              <span>•</span>
              <span>P: {displayProtein}g</span>
              <span>C: {displayCarbs}g</span>
              <span>G: {displayFats}g</span>
            </div>
          </div>

          {/* Actions */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Reorder.Item>
  );
}
