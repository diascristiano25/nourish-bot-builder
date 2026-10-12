import { ReactNode } from 'react';
import { ModernSidebar } from './ModernSidebar';
import { motion } from 'framer-motion';

interface ModernLayoutProps {
  children: ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <ModernSidebar />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="ml-[280px] min-h-screen"
      >
        {children}
      </motion.main>
    </div>
  );
}
