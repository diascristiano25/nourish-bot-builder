import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Utensils, TrendingUp, User, MessageCircle,
  LogOut, Leaf, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PatientSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Meu Dashboard', path: '/patient-portal', icon: LayoutDashboard },
  { name: 'Plano Alimentar', path: '/patient-meal-plan', icon: Utensils },
  { name: 'Meu Progresso', path: '/patient-progress', icon: TrendingUp },
  { name: 'Meu Perfil', path: '/patient-profile', icon: User },
  { name: 'Chat com Nutriólogo', path: '/patient-portal', icon: MessageCircle },
];

export function PatientSidebar({ collapsed = false, onToggleCollapse }: PatientSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

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
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen w-[280px] bg-gradient-to-b from-[#518C5B] to-[#3d7047] border-r border-white/10 flex flex-col z-50 shadow-2xl shadow-emerald-900/20"
    >
      {/* Logo / Brand */}
      <div className="p-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">NutriFlow</span>
        </motion.div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item, index) => (
          <motion.div
            key={item.path + item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-white/20 backdrop-blur-sm text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activePatientNav"
                      className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-5 h-5 relative z-10" />
                  <span className="text-sm font-medium relative z-10">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto relative z-10" />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 h-auto font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Button>
      </div>
    </motion.aside>
  );
}