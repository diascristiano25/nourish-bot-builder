import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoImg from '@/assets/logo.png';

const navItems = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
  { name: 'Pacientes', path: '/pacientes', icon: Users },
  { name: 'Planos', path: '/biblioteca', icon: FileText },
  { name: 'Mais', path: '/perfil', icon: MoreHorizontal },
];

export function MobileBottomNav() {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-slate-200/60 flex items-center justify-around px-2 z-50 safe-area-bottom shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]"
    >
      {navItems.map((item, index) => {
        // Replace the center item (index 2) with the logo button
        if (index === 2) {
          return (
            <NavLink
              key="logo"
              to="/dashboard"
              className="relative -mt-5"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#518C5B] to-[#3d7047] flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white overflow-hidden"
              >
                <img src={logoImg} alt="NutriFlow" className="w-8 h-8 object-contain" />
              </motion.div>
            </NavLink>
          );
        }
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all",
                isActive ? "text-[#518C5B]" : "text-slate-400"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive && "bg-[#518C5B]/10"
                )}>
                  <item.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                </div>
                <span className="text-[10px] mt-0.5 font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </motion.nav>
  );
}