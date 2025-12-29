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
      lime: 'hover:shadow-[0_0_40px_hsl(68_100%_50%/0.2)] hover:border-[hsl(68_100%_50%/0.4)]',
      violet: 'hover:shadow-[0_0_40px_hsl(270_100%_65%/0.2)] hover:border-[hsl(270_100%_65%/0.4)]',
      cyan: 'hover:shadow-[0_0_40px_hsl(180_100%_50%/0.2)] hover:border-[hsl(180_100%_50%/0.4)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Real Glassmorphism
          'relative rounded-2xl overflow-hidden',
          'bg-[rgba(15,18,22,0.7)] backdrop-blur-[20px]',
          'border border-[rgba(255,255,255,0.08)]',
          // Transitions
          'transition-all duration-300 ease-out',
          // Interactive states
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
        {/* Inner glow overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(163, 230, 53, 0.1), transparent 60%)',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

BentoCard.displayName = 'BentoCard';
