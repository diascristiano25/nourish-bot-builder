import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  color?: 'sage' | 'terracotta' | 'indigo' | 'amber';
  badge?: string | number;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

const colorMap = {
  sage: { bg: 'bg-[#518C5B]/10', text: 'text-[#518C5B]', hover: 'hover:bg-[#518C5B]/20' },
  terracotta: { bg: 'bg-[#C4764A]/10', text: 'text-[#C4764A]', hover: 'hover:bg-[#C4764A]/20' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-500', hover: 'hover:bg-indigo-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-500', hover: 'hover:bg-amber-100' },
};

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {actions.map((action, index) => {
        const colors = colorMap[action.color || 'sage'];
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all',
              colors.bg,
              colors.text,
              colors.hover
            )}
          >
            {action.icon}
            <span>{action.label}</span>
            {action.badge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {action.badge}
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}