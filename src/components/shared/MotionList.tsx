import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

interface MotionListProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'ul' | 'ol';
}

export function MotionList({ children, className, as = 'div' }: MotionListProps) {
  const Tag = motion[as] as any;
  return (
    <Tag variants={container} initial="hidden" animate="visible" className={className}>
      {children}
    </Tag>
  );
}

export function MotionItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={item} whileHover={{ x: 4 }} className={className}>
      {children}
    </motion.div>
  );
}

export const staggerContainer = container;
export const staggerItem = item;