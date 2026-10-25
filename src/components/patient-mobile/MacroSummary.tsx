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
    barColor: 'bg-[#C4764A]',
    iconWrap: 'bg-[#C4764A]/10',
    textColor: 'text-[#C4764A]',
  },
  {
    key: 'protein' as const,
    label: 'Proteínas',
    unit: 'g',
    icon: Beef,
    barColor: 'bg-[#518C5B]',
    iconWrap: 'bg-[#518C5B]/10',
    textColor: 'text-[#518C5B]',
  },
  {
    key: 'carbs' as const,
    label: 'Carboidratos',
    unit: 'g',
    icon: Wheat,
    barColor: 'bg-amber-500',
    iconWrap: 'bg-amber-500/10',
    textColor: 'text-amber-600',
  },
  {
    key: 'fat' as const,
    label: 'Gorduras',
    unit: 'g',
    icon: Droplet,
    barColor: 'bg-sky-500',
    iconWrap: 'bg-sky-500/10',
    textColor: 'text-sky-600',
  },
];

export function MacroSummary({ macros }: MacroSummaryProps) {
  return (
    <div className="space-y-3.5">
      {macroConfig.map((config) => {
        const macro = macros[config.key];
        const percentage = macro.goal > 0 ? Math.min((macro.current / macro.goal) * 100, 100) : 0;
        const Icon = config.icon;
        return (
          <div key={config.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md ${config.iconWrap} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${config.textColor}`} />
                </div>
                <span className="text-sm font-medium text-foreground">{config.label}</span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                <span className={`font-semibold ${config.textColor}`}>{macro.current}</span>
                <span className="text-muted-foreground/70"> / {macro.goal} {config.unit}</span>
              </span>
            </div>
            <div className="relative h-1.5 bg-muted/60 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${config.barColor} rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}