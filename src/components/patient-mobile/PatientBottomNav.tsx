import { Home, UtensilsCrossed, Plus, TrendingUp, User } from 'lucide-react';
import { TabType } from '@/pages/PatientMobileApp';
import { cn } from '@/lib/utils';

interface PatientBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'plano', label: 'Plano', icon: UtensilsCrossed },
  { id: 'registro', label: '', icon: Plus },
  { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
  { id: 'perfil', label: 'Perfil', icon: User },
];

export function PatientBottomNav({ activeTab, onTabChange }: PatientBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isCenter = item.id === 'registro';

          if (isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="relative -mt-6"
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                  "bg-gradient-to-br from-primary to-primary/80",
                  isActive && "scale-110 shadow-primary/40"
                )}>
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
