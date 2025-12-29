import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong' | 'subtle';
  glow?: 'none' | 'lime' | 'violet' | 'cyan';
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', glow = 'none', hover = true, children, ...props }, ref) => {
    
    const glowStyles = {
      none: '',
      lime: 'hover:shadow-[0_0_40px_rgba(223,255,0,0.25)]',
      violet: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]',
      cyan: 'hover:shadow-[0_0_40px_rgba(34,211,238,0.25)]',
    };

    const variantStyles = {
      default: 'bg-card/80 dark:bg-card/60 border-border/20 dark:border-white/10',
      strong: 'bg-card dark:bg-card/80 border-border/30 dark:border-white/15',
      subtle: 'bg-card/50 dark:bg-card/40 border-border/10 dark:border-white/5',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl overflow-hidden transition-all duration-300',
          'backdrop-blur-xl border shadow-sm',
          // Light mode: white bg with subtle shadow
          'shadow-black/5 dark:shadow-none',
          variantStyles[variant],
          glow !== 'none' && glowStyles[glow],
          hover && 'hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';