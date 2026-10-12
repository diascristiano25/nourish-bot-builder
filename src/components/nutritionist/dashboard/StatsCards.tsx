/**
 * StatsCards - Dashboard stat cards with stagger animation
 * Displays 4 animated stat cards in a responsive grid
 */

import { motion } from 'framer-motion';
import { StatCard } from '@/components/shared/StatCard';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';

export interface StatCardsProps {
  stats: Array<{
    icon: React.ReactNode;
    value: string | number;
    label: string;
    trend?: { value: number; direction: 'up' | 'down' };
  }>;
}

export function StatsCards({ stats }: StatCardsProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      role="region"
      aria-label="Dashboard Statistics"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={staggerItem}>
          <StatCard
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            trend={stat.trend}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
