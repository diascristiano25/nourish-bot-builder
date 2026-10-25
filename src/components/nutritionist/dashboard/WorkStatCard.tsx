import { motion } from 'framer-motion';
import { MoreHorizontal, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Line, LineChart } from 'recharts';

interface WorkStatCardProps {
  title: string;
  value: number;
  label: string;
  trend: number;
  variant: 'offline' | 'online' | 'lab';
  delay?: number;
}

const variantConfig = {
  offline: {
    gradientId: 'offlineGrad',
    strokeColor: '#C4764A',
    fillColor: '#C4764A',
    bgColor: 'bg-[#C4764A]/5',
    trendColor: 'text-red-500',
    chartType: 'area' as const,
  },
  online: {
    gradientId: 'onlineGrad',
    strokeColor: '#518C5B',
    fillColor: '#518C5B',
    bgColor: 'bg-[#518C5B]/5',
    trendColor: 'text-emerald-600',
    chartType: 'area' as const,
  },
  lab: {
    gradientId: 'labGrad',
    strokeColor: '#6366f1',
    fillColor: '#6366f1',
    bgColor: 'bg-indigo-50',
    trendColor: 'text-muted-foreground',
    chartType: 'line' as const,
  },
};

const mockData = [
  { v: 3 }, { v: 5 }, { v: 4 }, { v: 7 }, { v: 6 }, { v: 8 }, { v: 5 },
];

export function WorkStatCard({ title, value, label, trend, variant, delay = 0 }: WorkStatCardProps) {
  const config = variantConfig[variant];
  const TrendIcon = trend < 0 ? TrendingDown : trend > 0 ? TrendingUp : Minus;
  const trendLabel = trend === 0 ? '0%' : `${trend > 0 ? '+' : ''}${trend}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' }}
      className="bg-card rounded-3xl p-5 border border-border/60 shadow-soft cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-end gap-3">
        <div className={`w-20 h-16 rounded-xl ${config.bgColor} p-1 shrink-0`}>
          <ResponsiveContainer width="100%" height="100%">
            {config.chartType === 'area' ? (
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.fillColor} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={config.fillColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={config.strokeColor}
                  strokeWidth={2}
                  fill={`url(#${config.gradientId})`}
                />
              </AreaChart>
            ) : (
              <LineChart data={mockData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={config.strokeColor}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-3xl font-bold text-foreground leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${config.trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{trendLabel} que a média</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}