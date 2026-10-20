import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, FileText, DollarSign,
  Settings, HelpCircle, LogOut, Leaf, Send, Grid3X3, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Evolução', path: '/dashboard', icon: FileText },
  { name: 'Mensagens', path: '/suporte/ajuda', icon: Send, badge: 5 },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
  { name: 'Pacientes', path: '/pacientes', icon: Grid3X3 },
  { name: 'Info', path: '/perfil', icon: Info },
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
      className="fixed left-4 top-4 bottom-4 w-[88px] bg-gradient-to-b from-[#518C5B] to-[#3d7047] rounded-[2rem] flex flex-col items-center py-6 z-50 shadow-2xl shadow-emerald-900/20"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-8"
      >
        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
          <Leaf className="w-6 h-6 text-white" />
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
                    ? "bg-white/20 shadow-lg shadow-black/10"
                    : "hover:bg-white/10"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-white/20 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 relative z-10 transition-colors",
                    isActive ? "text-white" : "text-white/70 group-hover:text-white"
                  )} />

                  {/* Badge */}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-20 border-2 border-[#518C5B]">
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip */}
                  {hoveredItem === item.name && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none"
                    >
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSignOut}
          className="w-full h-12 rounded-2xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.aside>
  );
}