/**
 * PatientLayout - Layout wrapper for patient-facing pages
 * Uses blue/teal theme and provides patient-specific navigation
 * This is a minimal placeholder that Task 8 will enhance
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PatientLayoutProps {
  children: ReactNode;
}

export function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-50">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {children}
      </motion.main>
    </div>
  );
}
