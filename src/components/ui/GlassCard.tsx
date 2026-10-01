import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong' | 'subtle';
  glow?: 'none' | 'sage' | 'terracotta' | 'lime' | 'violet' | 'cyan';
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', glow = 'none', hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'organic-card',
          variant === 'strong' && 'border-primary/20',
          variant === 'subtle' && 'bg-card/60 border-border/40',
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
