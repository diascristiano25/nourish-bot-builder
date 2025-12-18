import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  AlertTriangle, 
  Plus, 
  X, 
  Leaf, 
  Milk, 
  Droplet, 
  Heart, 
  Fish, 
  Egg,
  Wheat,
  Ban,
  Baby,
  Pill
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CriticalTagsBadgesProps {
  tags: string[];
  onChange?: (tags: string[]) => void;
  editable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// Predefined tags with icons and colors
const predefinedTags = [
  { label: 'Vegano', icon: Leaf, color: 'bg-emerald-500 hover:bg-emerald-600' },
  { label: 'Vegetariano', icon: Leaf, color: 'bg-green-500 hover:bg-green-600' },
  { label: 'Intolerante à Lactose', icon: Milk, color: 'bg-amber-500 hover:bg-amber-600' },
  { label: 'Alérgico a Leite', icon: Milk, color: 'bg-orange-500 hover:bg-orange-600' },
  { label: 'Diabético Tipo 1', icon: Droplet, color: 'bg-red-500 hover:bg-red-600' },
  { label: 'Diabético Tipo 2', icon: Droplet, color: 'bg-red-400 hover:bg-red-500' },
  { label: 'Hipertenso', icon: Heart, color: 'bg-rose-500 hover:bg-rose-600' },
  { label: 'Celíaco', icon: Wheat, color: 'bg-yellow-500 hover:bg-yellow-600' },
  { label: 'Alérgico a Glúten', icon: Wheat, color: 'bg-yellow-600 hover:bg-yellow-700' },
  { label: 'Alérgico a Frutos do Mar', icon: Fish, color: 'bg-blue-500 hover:bg-blue-600' },
  { label: 'Alérgico a Ovo', icon: Egg, color: 'bg-orange-400 hover:bg-orange-500' },
  { label: 'Alérgico a Amendoim', icon: Ban, color: 'bg-amber-600 hover:bg-amber-700' },
  { label: 'Gestante', icon: Baby, color: 'bg-pink-500 hover:bg-pink-600' },
  { label: 'Lactante', icon: Baby, color: 'bg-pink-400 hover:bg-pink-500' },
  { label: 'Uso de Medicamentos', icon: Pill, color: 'bg-purple-500 hover:bg-purple-600' },
];

const getTagConfig = (tag: string) => {
  const found = predefinedTags.find(t => t.label.toLowerCase() === tag.toLowerCase());
  return found || { label: tag, icon: AlertTriangle, color: 'bg-slate-500 hover:bg-slate-600' };
};

export function CriticalTagsBadges({ 
  tags, 
  onChange, 
  editable = false,
  size = 'md',
  showLabel = true 
}: CriticalTagsBadgesProps) {
  const [newTag, setNewTag] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'text-[10px] h-5 px-1.5',
    md: 'text-xs h-6 px-2',
    lg: 'text-sm h-7 px-3',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && onChange && !tags.includes(tag.trim())) {
      onChange([...tags, tag.trim()]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (onChange) {
      onChange(tags.filter(t => t !== tagToRemove));
    }
  };

  if (tags.length === 0 && !editable) {
    return null;
  }

  return (
    <div className="space-y-2">
      {showLabel && tags.length > 0 && (
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span className="text-xs font-medium text-warning">Tags Críticas</span>
        </div>
      )}
      
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const config = getTagConfig(tag);
          const Icon = config.icon;
          
          return (
            <Badge 
              key={tag}
              className={cn(
                "text-white font-medium gap-1 animate-pulse-slow shadow-sm",
                config.color,
                sizeClasses[size]
              )}
            >
              <Icon className={iconSizes[size]} />
              {tag}
              {editable && onChange && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag);
                  }}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          );
        })}
        
        {editable && onChange && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "border-dashed gap-1",
                  sizeClasses[size]
                )}
              >
                <Plus className={iconSizes[size]} />
                Adicionar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3 z-50" align="start">
              <div className="space-y-3">
                <div className="text-sm font-medium">Adicionar Tag Crítica</div>
                
                {/* Predefined tags */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Tags Predefinidas</div>
                  <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto">
                    {predefinedTags.filter(t => !tags.includes(t.label)).map((tag) => {
                      const Icon = tag.icon;
                      return (
                        <Badge
                          key={tag.label}
                          className={cn(
                            "text-white font-medium gap-1 cursor-pointer transition-transform hover:scale-105",
                            tag.color,
                            "text-[10px] h-5 px-1.5"
                          )}
                          onClick={() => {
                            handleAddTag(tag.label);
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {tag.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                {/* Custom tag input */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Ou crie uma tag personalizada</div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Ex: Alérgico a Soja"
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag(newTag);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => handleAddTag(newTag)}
                      disabled={!newTag.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
