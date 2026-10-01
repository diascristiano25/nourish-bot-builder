import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, columns = 3, gap = 'md', children, ...props }, ref) => {
    const columnStyles = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };

    const gapStyles = {
      sm: 'gap-3',
      md: 'gap-4 lg:gap-6',
      lg: 'gap-6 lg:gap-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          columnStyles[columns],
          gapStyles[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoGrid.displayName = 'BentoGrid';
