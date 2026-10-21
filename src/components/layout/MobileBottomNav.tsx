import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, DollarSign, Send, TrendingUp, User, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Pacientes', path: '/pacientes', icon: Users },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
  { name: 'Financeiro', path: '/financeiro', icon: DollarSign },
];

const moreNavItems = [
  { name: 'Chat', path: '/mensagens', icon: Send },
  { name: 'Evolução', path: '/evolucao', icon: TrendingUp },
  { name: 'Perfil', path: '/perfil', icon: User },
];

export function MobileBottomNav() {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* "Mais" menu overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Mais opções</h3>
              <div className="grid grid-cols-3 gap-4">
                {moreNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMore(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex flex-col items-center gap-2 p-4 rounded-2xl transition-all',
                        isActive ? 'bg-[#518C5B]/10 text-[#518C5B]' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      )
                    }
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-slate-200/60 flex items-center justify-around px-2 z-50 safe-area-bottom shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)] lg:hidden"
      >
        {mainNavItems.map((item) => (
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
                    'p-1.5 rounded-xl transition-all',
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
        ))}

        {/* "Mais" button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={cn(
            'flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all',
            showMore ? 'text-[#518C5B]' : 'text-slate-400'
          )}
        >
          <div
            className={cn(
              'p-1.5 rounded-xl transition-all',
              showMore && 'bg-[#518C5B]/10'
            )}
          >
            <MoreHorizontal
              className={cn('w-5 h-5 transition-transform', showMore && 'scale-110')}
            />
          </div>
          <span className="text-[10px] mt-0.5 font-medium">Mais</span>
        </button>
      </motion.nav>
    </>
  );
}