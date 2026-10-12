/**
 * LoadingState - Skeleton/shimmer loading state component
 * Provides visual feedback during data loading
 */

import { motion } from "framer-motion";
import { pulse } from "@/lib/motion-variants";

export interface LoadingStateProps {
  count?: number;
  height?: string;
  className?: string;
}

export function LoadingState({
  count = 3,
  height = "h-12",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          animate="animate"
          variants={pulse}
          className={`${height} rounded-lg bg-slate-200`}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for cards
 */
export function SkeletonCard() {
  return (
    <motion.div
      animate="animate"
      variants={pulse}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-4">
        <div className="h-4 rounded bg-slate-200 w-3/4" />
        <div className="h-3 rounded bg-slate-200 w-1/2" />
      </div>
    </motion.div>
  );
}

/**
 * Skeleton loader for tables/lists
 */
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          animate="animate"
          variants={pulse}
          className="h-10 rounded bg-slate-200"
        />
      ))}
    </div>
  );
}
