import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Droplets, UtensilsCrossed, CalendarDays, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onAddWater: (amount: number) => void;
  onNavigateToRegistro: () => void;
  onNavigateToAgenda: () => void;
}

/**
 * QuickActions — Botões flutuantes para ações comuns
 * Menu FAB (Floating Action Button) com 3 ações rápidas
 */
export function QuickActions({ onAddWater, onNavigateToRegistro, onNavigateToAgenda }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleQuickWater = () => {
    onAddWater(250);
    setIsOpen(false);
  };

  const handleNavigateRegistro = () => {
    onNavigateToRegistro();
    setIsOpen(false);
  };

  const handleNavigateAgenda = () => {
    onNavigateToAgenda();
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-3">
            {/* Quick Water */}
            <motion.button
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ delay: 0, duration: 0.2 }}
              onClick={handleQuickWater}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Droplets className="w-5 h-5" />
              <span className="text-sm font-medium">+250ml água</span>
            </motion.button>

            {/* Navigate to Registro */}
            <motion.button
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ delay: 0.05, duration: 0.2 }}
              onClick={handleNavigateRegistro}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span className="text-sm font-medium">Registrar refeição</span>
            </motion.button>

            {/* Navigate to Agenda */}
            <motion.button
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              onClick={handleNavigateAgenda}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <CalendarDays className="w-5 h-5" />
              <span className="text-sm font-medium">Ver agenda</span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* FAB Main Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          "bg-primary text-primary-foreground hover:shadow-xl",
          isOpen && "rotate-45"
        )}
        aria-label="Ações rápidas"
      >
        {isOpen ? (
          <X className="w-6 h-6" strokeWidth={2.5} />
        ) : (
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        )}
      </motion.button>
    </>
  );
}