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
    barColor: 'bg-gradient-to-r from-accent to-[hsl(28,90%,58%)]',
    iconWrap: 'from-accent/20 to-accent/5',
    textColor: 'text-accent',
  },
  {
    key: 'protein' as const,
    label: 'Proteínas',
    unit: 'g',
    icon: Beef,
    barColor: 'bg-gradient-to-r from-primary to-[hsl(168,76%,45%)]',
    iconWrap: 'from-primary/20 to-primary/5',
    textColor: 'text-primary',
  },
  {
    key: 'carbs' as const,
    label: 'Carboidratos',
    unit: 'g',
    icon: Wheat,
    barColor: 'bg-gradient-to-r from-amber-500 to-amber-400',
    iconWrap: 'from-amber-500/20 to-amber-500/5',
    textColor: 'text-amber-600',
  },
  {
    key: 'fat' as const,
    label: 'Gorduras',
    unit: 'g',
    icon: Droplet,
    barColor: 'bg-gradient-to-r from-sky-500 to-sky-400',
    iconWrap: 'from-sky-500/20 to-sky-500/5',
    textColor: 'text-sky-600',
  },
];

export function MacroSummary({ macros }: MacroSummaryProps) {
  return (
    <div className="space-y-4">
      {macroConfig.map((config) => {
        const macro = macros[config.key];
        const percentage = macro.goal > 0 ? Math.min((macro.current / macro.goal) * 100, 100) : 0;
        const Icon = config.icon;
        return (
          <div key={config.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.iconWrap} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${config.textColor}`} />
                </div>
                <span className="text-sm font-semibold text-foreground">{config.label}</span>
              </div>
              <span className="text-xs tabular-nums">
                <span className={`font-bold ${config.textColor}`}>{macro.current}</span>
                <span className="text-muted-foreground/70 font-medium"> / {macro.goal} {config.unit}</span>
              </span>
            </div>
            <div className="relative h-2 bg-muted/40 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${config.barColor} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}