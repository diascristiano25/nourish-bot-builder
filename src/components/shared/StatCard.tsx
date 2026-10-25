/**
 * StatCard - Animated stat display card with trend indicator
 * Shows icon, value, label, and optional trend direction
 */

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInScale } from "@/lib/motion-variants";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  trend?: { value: number; direction: "up" | "down" };
  className?: string;
}

export function StatCard({
  icon,
  value,
  label,
  trend,
  className = "",
}: StatCardProps) {
  const trendColor = trend?.direction === "up" ? "text-emerald-500" : "text-red-500";
  const trendBgColor =
    trend?.direction === "up" ? "bg-emerald-50" : "bg-red-50";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInScale}
      className={`rounded-lg border border-border bg-card p-6 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 ${trendBgColor} px-2 py-1 rounded`}>
                {trend.direction === "up" ? (
                  <ChevronUp className={`w-4 h-4 ${trendColor}`} />
                ) : (
                  <ChevronDown className={`w-4 h-4 ${trendColor}`} />
                )}
                <span className={`text-sm font-medium ${trendColor}`}>
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </motion.div>
  );
}
