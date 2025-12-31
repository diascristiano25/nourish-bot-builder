import { Progress } from '@/components/ui/progress';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';

interface MacroData {
  current: number;
  goal: number;
}

interface MacroSummaryProps {
  macros: {
    calories: MacroData;
    protein: MacroData;
    carbs: MacroData;
    fat: MacroData;
  };
}

const macroConfig = [
  { 
    key: 'calories' as const, 
    label: 'Calorias', 
    unit: 'kcal',
    icon: Flame,
    color: 'bg-orange-500',
    textColor: 'text-orange-500'
  },
  { 
    key: 'protein' as const, 
    label: 'Proteínas', 
    unit: 'g',
    icon: Beef,
    color: 'bg-red-500',
    textColor: 'text-red-500'
  },
  { 
    key: 'carbs' as const, 
    label: 'Carboidratos', 
    unit: 'g',
    icon: Wheat,
    color: 'bg-amber-500',
    textColor: 'text-amber-500'
  },
  { 
    key: 'fat' as const, 
    label: 'Gorduras', 
    unit: 'g',
    icon: Droplet,
    color: 'bg-blue-500',
    textColor: 'text-blue-500'
  },
];

export function MacroSummary({ macros }: MacroSummaryProps) {
  return (
    <div className="space-y-3">
      {macroConfig.map((config) => {
        const macro = macros[config.key];
        const percentage = Math.min((macro.current / macro.goal) * 100, 100);
        const Icon = config.icon;

        return (
          <div key={config.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md ${config.color}/20 flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${config.textColor}`} />
                </div>
                <span className="text-sm font-medium text-foreground">{config.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                <span className={`font-semibold ${config.textColor}`}>{macro.current}</span>
                /{macro.goal} {config.unit}
              </span>
            </div>
            <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className={`absolute inset-y-0 left-0 ${config.color} rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
