import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PatientLayoutProps {
  children: ReactNode;
}

export function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen"
      >
        {children}
      </motion.main>
    </div>
  );
}