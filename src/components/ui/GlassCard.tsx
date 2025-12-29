import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong' | 'subtle';
  glow?: 'none' | 'lime' | 'violet' | 'cyan';
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', glow = 'none', hover = true, children, ...props }, ref) => {
    const variants = {
      default: 'glass',
      strong: 'glass-strong',
      subtle: 'bg-card/50 backdrop-blur-sm border border-border/50',
    };

    const glowStyles = {
      none: '',
      lime: 'hover:shadow-neon',
      violet: 'hover:shadow-violet',
      cyan: 'hover:shadow-[0_0_30px_hsl(180_100%_50%/0.3)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl overflow-hidden transition-all duration-300',
          variants[variant],
          glow !== 'none' && glowStyles[glow],
          hover && 'hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {/* Gradient border overlay */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent bg-clip-padding">
          <div 
            className="absolute inset-0 rounded-2xl opacity-50"
            style={{
              background: 'linear-gradient(135deg, hsl(68 100% 50% / 0.2), hsl(270 100% 65% / 0.1))',
              mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: '1px',
            }}
          />
        </div>
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
