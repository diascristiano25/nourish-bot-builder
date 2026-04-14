import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  glow?: 'none' | 'lime' | 'violet' | 'cyan' | 'sage' | 'terracotta';
}

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, size = 'md', interactive = true, glow = 'none', children, ...props }, ref) => {
    const sizeStyles = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'organic-card',
          interactive && 'cursor-pointer hover:-translate-y-1',
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
