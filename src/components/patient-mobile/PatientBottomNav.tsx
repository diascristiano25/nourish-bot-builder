import { Home, UtensilsCrossed, Plus, TrendingUp, User, MessageCircle, CalendarDays } from 'lucide-react';
import { TabType } from '@/pages/PatientMobileApp';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
interface PatientBottomNavProps {
activeTab: TabType;
onTabChange: (tab: TabType) => void;
}
const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
{ id: 'inicio', label: 'Início', icon: Home },
{ id: 'agenda', label: 'Agenda', icon: CalendarDays },
{ id: 'plano', label: 'Plano', icon: UtensilsCrossed },
{ id: 'registro', label: '', icon: Plus },
{ id: 'mensagens', label: 'Chat', icon: MessageCircle },
{ id: 'evolucao', label: 'Evolução', icon: TrendingUp },
{ id: 'perfil', label: 'Perfil', icon: User },
];
export function PatientBottomNav({ activeTab, onTabChange }: PatientBottomNavProps) {
return (
<motion.nav
initial={{ y: 100 }}
animate={{ y: 0 }}
transition={{ type: "spring", stiffness: 300, damping: 30 }}
className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/60 safe-area-inset-bottom"
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
className="relative -mt-5"
aria-label="Registrar refeição"
>
<div className={cn(
"w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-200",
"bg-[#518C5B] text-white",
isActive && "scale-105 shadow-[#518C5B]/30"
)}>
<Icon className="w-5 h-5" strokeWidth={2.5} />
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
"flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-xl transition-colors duration-200",
isActive ? "text-[#518C5B]" : "text-muted-foreground"
)}
>
<Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} strokeWidth={isActive ? 2.25 : 2} />
<span className="text-[10px] font-medium">{item.label}</span>
{isActive && <span className="absolute -bottom-px w-4 h-0.5 rounded-full bg-[#518C5B]" />}
</motion.button>
);
})}
</div>
</motion.nav>
);
}