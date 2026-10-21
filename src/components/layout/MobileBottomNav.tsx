import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Send, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoImg from '@/assets/logo-nutriflow.png';

const navItems = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
  { name: 'Pacientes', path: '/pacientes', icon: Users },
  { name: 'Chat', path: '/mensagens', icon: Send },
  { name: 'Mais', path: '/perfil', icon: MoreHorizontal },
];

export function MobileBottomNav() {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-slate-200/60 flex items-center justify-around px-2 z-50 safe-area-bottom shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]"
    >
      {navItems.map((item, index) => {
        // Center item (index 2 = Pacientes) gets the elevated logo treatment
        // but still navigates to /pacientes so the Patients list is reachable on mobile.
        if (index === 2) {
          return (
            <NavLink key={item.path} to={item.path} className="relative -mt-5">
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white overflow-hidden transition-all',
                    'bg-gradient-to-br from-[#518C5B] to-[#3d7047]',
                    isActive && 'ring-2 ring-[#518C5B]/40 scale-105'
                  )}
                >
                  <img src={logoImg} alt="Pacientes" className="w-8 h-8 object-contain brightness-0 invert" />
                </motion.div>
              )}
            </NavLink>
          );
        }
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all',
                isActive ? 'text-[#518C5B]' : 'text-slate-400'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'p-2 rounded-xl transition-all',
                    isActive && 'bg-[#518C5B]/10'
                  )}
                >
                  <item.icon
                    className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')}
                  />
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