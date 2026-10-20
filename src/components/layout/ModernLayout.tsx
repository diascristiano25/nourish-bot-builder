import { ReactNode, useState } from 'react';
import { ModernSidebar } from './ModernSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { CommandBar } from '@/components/CommandBar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

interface ModernLayoutProps {
  children: ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <ModernSidebar />
      </div>

      {/* Main Content Area */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="lg:ml-[120px] min-h-screen pb-20 lg:pb-0"
      >
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          {/* Global Search Trigger - visible on desktop */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setCommandOpen(true)}
            className="hidden lg:flex items-center gap-3 w-full max-w-md mb-6 px-4 py-3 bg-white rounded-2xl border border-slate-200/60 shadow-soft hover:shadow-md hover:border-[#518C5B]/30 transition-all group"
          >
            <Search className="w-5 h-5 text-slate-400 group-hover:text-[#518C5B] transition-colors" />
            <span className="text-sm text-slate-400 group-hover:text-slate-600 transition-colors flex-1 text-left">
              Buscar pacientes, consultas, ações...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg border border-slate-200">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </motion.button>

          {children}
        </div>
      </motion.main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>

      {/* Global Command Palette */}
      <AnimatePresence>
        {commandOpen && (
          <CommandBar open={commandOpen} onOpenChange={setCommandOpen} />
        )}
      </AnimatePresence>
    </div>
  );
}