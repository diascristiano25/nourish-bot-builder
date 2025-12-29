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

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl overflow-hidden transition-all duration-300',
          glow !== 'none' && glowStyles[glow],
          hover && 'hover:-translate-y-1',
          className
        )}
        style={{
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
