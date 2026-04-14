import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface NeonTextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'sage' | 'terracotta' | 'gradient' | 'lime' | 'violet';
  glow?: boolean;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
}

export const NeonText = forwardRef<HTMLSpanElement, NeonTextProps>(
  ({ className, variant = 'sage', glow = false, as: Component = 'span', children, ...props }, ref) => {
    const variants: Record<string, string> = {
      sage: 'text-primary',
      lime: 'text-primary',
      terracotta: 'text-secondary',
      violet: 'text-secondary',
      gradient: 'text-gradient-sage',
    };

    return (
      <Component
        ref={ref as any}
        className={cn(
          variants[variant] || 'text-primary',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

NeonText.displayName = 'NeonText';
