import { motion, Variants, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RichCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  glass?: boolean;
  glowColor?: 'sage' | 'terracotta' | 'none';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const glowMap = {
  sage: '0 20px 40px -12px rgba(81, 140, 91, 0.15)',
  terracotta: '0 20px 40px -12px rgba(196, 118, 74, 0.15)',
  none: '0 20px 40px -12px rgba(0,0,0,0.08)',
};

export function RichCard({
  children,
  className,
  delay = 0,
  hover = true,
  padding = 'md',
  onClick,
  glass = false,
  glowColor = 'none',
}: RichCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? {
        y: -6,
        boxShadow: glowMap[glowColor],
        transition: { duration: 0.2 }
      } : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        'rounded-3xl border transition-all duration-300',
        glass
          ? 'bg-white/70 backdrop-blur-xl border-white/40 shadow-lg'
          : 'bg-white border-slate-200/60 shadow-soft',
        paddingMap[padding],
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

// Magnetic button component
interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
}

export function MagneticButton({ children, onClick, className, strength = 0.3 }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// Ripple effect wrapper
interface RippleWrapperProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function RippleWrapper({ children, className, onClick }: RippleWrapperProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick?.();
  };

  return (
    <div className={cn('relative overflow-hidden', className)} onClick={handleClick}>
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute w-20 h-20 rounded-full bg-[#518C5B]/20 pointer-events-none"
          style={{ left: ripple.x - 40, top: ripple.y - 40 }}
        />
      ))}
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: string | number;
  trend?: { value: number; direction: 'up' | 'down' | 'flat' };
  icon?: ReactNode;
  color?: 'sage' | 'terracotta' | 'indigo' | 'pink' | 'amber';
  delay?: number;
  sparkline?: Array<{ v: number }>;
}

const colorMap = {
  sage: { bg: 'bg-[#518C5B]/5', text: 'text-[#518C5B]', stroke: '#518C5B' },
  terracotta: { bg: 'bg-[#C4764A]/5', text: 'text-[#C4764A]', stroke: '#C4764A' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-500', stroke: '#6366f1' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-500', stroke: '#ec4899' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-500', stroke: '#f59e0b' },
};

export function StatTile({
  label,
  value,
  trend,
  icon,
  color = 'sage',
  delay = 0,
  sparkline,
}: StatTileProps) {
  const c = colorMap[color];
  const trendColor =
    trend?.direction === 'up'
      ? 'text-emerald-600'
      : trend?.direction === 'down'
        ? 'text-red-500'
        : 'text-slate-500';
  const trendLabel = trend
    ? trend.direction === 'flat'
      ? '0%'
      : `${trend.direction === 'up' ? '+' : '-'}${Math.abs(trend.value)}%`
    : null;

  return (
    <RichCard delay={delay} padding="md" glowColor={color === 'sage' ? 'sage' : color === 'terracotta' ? 'terracotta' : 'none'}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</h3>
        {icon && <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', c.bg, c.text)}>{icon}</div>}
      </div>
      <div className="flex items-end gap-3">
        {sparkline && (
          <div className={cn('w-20 h-16 rounded-xl p-1 shrink-0', c.bg)}>
            <svg viewBox="0 0 80 60" className="w-full h-full">
              <polyline
                points={sparkline.map((p, i) => `${(i / (sparkline.length - 1)) * 75 + 2},${60 - (p.v / Math.max(...sparkline.map(s => s.v))) * 50}`).join(' ')}
                fill="none"
                stroke={c.stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring' }}
            className="text-3xl font-bold text-slate-800 leading-none tabular-nums"
          >
            {value}
          </motion.p>
          {trendLabel && (
            <div className={cn('flex items-center gap-1 mt-1.5 text-xs font-semibold', trendColor)}>
              <span className="tabular-nums">{trendLabel}</span>
              <span className="text-slate-400 font-normal">vs média</span>
            </div>
          )}
        </div>
      </div>
    </RichCard>
  );
}