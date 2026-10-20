import { Home, UtensilsCrossed, Plus, TrendingUp, User } from 'lucide-react';
import { TabType } from '@/pages/PatientMobileApp';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';

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
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/60 safe-area-inset-bottom shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isCenter = item.id === 'registro';

          if (isCenter) {
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(item.id)}
                className="relative -mt-6"
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 overflow-hidden border-2 border-white",
                  "bg-gradient-to-br from-[#518C5B] to-[#3d7047]",
                  isActive && "scale-110 shadow-emerald-500/40"
                )}>
                  <img src={logoImg} alt="NutriFlow" className="w-9 h-9 object-contain" />
                </div>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-[#518C5B]"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all",
                isActive && "bg-[#518C5B]/10"
              )}>
                <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}