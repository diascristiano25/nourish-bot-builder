import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  glow?: 'none' | 'lime' | 'violet' | 'cyan';
}

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, size = 'md', interactive = true, glow = 'lime', children, ...props }, ref) => {
    const sizeStyles = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    const glowStyles = {
      none: '',
      lime: 'hover:shadow-[0_0_40px_rgba(223,255,0,0.25)]',
      violet: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]',
      cyan: 'hover:shadow-[0_0_40px_rgba(34,211,238,0.25)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl overflow-hidden',
          'bg-card/80 dark:bg-card/60 backdrop-blur-xl',
          'border border-border',
          'transition-all duration-300 ease-out',
          interactive && [
            'cursor-pointer',
            'hover:-translate-y-2 hover:scale-[1.02]',
            glowStyles[glow],
          ],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

BentoCard.displayName = 'BentoCard';
