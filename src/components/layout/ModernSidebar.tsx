import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, FileText, DollarSign,
  Settings, HelpCircle, LogOut, Send, Grid3X3, Info, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import logoImg from '@/assets/logo.png';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Pacientes', path: '/pacientes', icon: Users },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
  { name: 'Mensagens', path: '/mensagens', icon: Send },
  { name: 'Financeiro', path: '/financeiro', icon: DollarSign },
  { name: 'Evolução', path: '/evolucao', icon: TrendingUp },
  { name: 'Perfil', path: '/perfil', icon: Info },
];

export function ModernSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast({ title: "Logout realizado com sucesso" });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="fixed left-4 top-4 bottom-4 w-[88px] bg-gradient-to-b from-[#518C5B] via-[#4a7d52] to-[#2d5a37] rounded-[2rem] flex flex-col items-center py-6 z-50"
      style={{
        boxShadow: '0 25px 50px -12px rgba(45, 90, 55, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-8"
      >
        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner overflow-hidden">
          <img src={logoImg} alt="NutriFlow" className="w-10 h-10 object-contain" />
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2 w-full px-2">
        {navItems.map((item, index) => (
          <motion.div
            key={item.path + item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="relative w-full"
            onMouseEnter={() => setHoveredItem(item.name)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center justify-center w-full h-12 rounded-2xl transition-all duration-300 group",
                  isActive
                    ? "shadow-lg"
                    : "hover:bg-white/10"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{
                        boxShadow: '0 0 20px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                      }}
                    />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 relative z-10 transition-all duration-300",
                    isActive ? "text-white scale-110" : "text-white/60 group-hover:text-white group-hover:scale-105"
                  )} />
                  {/* Badge */}
                  {item.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-20 border-2 border-[#518C5B] shadow-lg"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                  {/* Tooltip */}
                  {hoveredItem === item.name && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-xl"
                    >
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900/95" />
                    </motion.div>
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-2 w-full px-2 mt-auto">
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSignOut}
          className="w-full h-12 rounded-2xl flex items-center justify-center text-white/60 hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.aside>
  );
}