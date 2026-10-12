/**
 * AnimatedCard - Reusable motion-enabled card component
 * Provides consistent fade-in-up animation with customizable hover effects
 */

import { ReactNode } from "react";
import { motion, MotionProps } from "framer-motion";
import { fadeInUp, liftHover } from "@/lib/motion-variants";

export interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  onClick?: () => void;
  className?: string;
  whileHover?: MotionProps["whileHover"];
}

export function AnimatedCard({
  children,
  delay = 0,
  onClick,
  className = "",
  whileHover = liftHover,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ delay }}
      whileHover={whileHover}
      onClick={onClick}
      className={`rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {children}
    </motion.div>
  );
}
