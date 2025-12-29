import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface NeonTextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'lime' | 'violet' | 'gradient' | 'cyber';
  glow?: boolean;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
}

export const NeonText = forwardRef<HTMLSpanElement, NeonTextProps>(
  ({ className, variant = 'lime', glow = true, as: Component = 'span', children, ...props }, ref) => {
    const variants = {
      lime: 'text-primary',
      violet: 'text-secondary',
      gradient: 'text-gradient-neon',
      cyber: 'text-gradient-cyber',
    };

    const glowStyles = {
      lime: 'text-glow',
      violet: 'text-glow-violet',
      gradient: '',
      cyber: '',
    };

    return (
      <Component
        ref={ref as any}
        className={cn(
          variants[variant],
          glow && glowStyles[variant],
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
