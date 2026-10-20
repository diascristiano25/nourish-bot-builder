import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50 safe-area-bottom"
    >
      {navItems.map((item) => (
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
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </motion.nav>
  );
}