import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'chart' | 'button';
  width?: string;
  height?: string;
}

const variantStyles = {
  text: 'h-4 rounded-md',
  card: 'h-32 rounded-2xl',
  avatar: 'w-12 h-12 rounded-full',
  chart: 'h-48 rounded-2xl',
  button: 'h-10 w-32 rounded-xl',
};

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-border/60',
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
    >
      {/* Shimmer effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
    </div>
  );
}

export function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-3xl border border-border/60 shadow-soft p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="avatar" className="w-8 h-8" />
      </div>
      <div className="flex items-end gap-3">
        <Skeleton variant="chart" className="w-20 h-16" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" className="h-8" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border"
        >
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="30%" className="h-3" />
          </div>
          <Skeleton variant="button" className="w-20 h-8" />
        </motion.div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-44 rounded-[2rem] overflow-hidden bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200"
      >
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
      </motion.div>
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SkeletonCard delay={0.1} />
        <SkeletonCard delay={0.2} />
        <SkeletonCard delay={0.3} />
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard delay={0.4} />
        <SkeletonCard delay={0.5} />
      </div>
    </div>
  );
}