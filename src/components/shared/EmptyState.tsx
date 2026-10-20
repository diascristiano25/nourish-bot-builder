import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'compact' | 'illustrated';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('text-center py-8', className)}
      >
        {icon && (
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            {icon}
          </div>
        )}
        <p className="text-sm font-medium text-slate-600">{title}</p>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        variant === 'illustrated' && 'bg-gradient-to-br from-[#518C5B]/5 to-[#C4764A]/5 rounded-3xl border border-dashed border-slate-200',
        className
      )}
    >
      {/* Illustrated SVG background */}
      {variant === 'illustrated' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-[#518C5B]/10 flex items-center justify-center">
            {icon || (
              <svg className="w-12 h-12 text-[#518C5B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          {/* Decorative dots */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-[#C4764A]/30"
          />
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-1 -left-3 w-2 h-2 rounded-full bg-[#518C5B]/30"
          />
        </motion.div>
      )}

      {!variant.includes('illustrated') && icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="w-16 h-16 mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400"
        >
          {icon}
        </motion.div>
      )}

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-bold text-slate-800 mb-2"
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed"
        >
          {description}
        </motion.p>
      )}

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

// Pre-built empty states for common scenarios
export function EmptyPatients({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      variant="illustrated"
      icon={
        <svg className="w-12 h-12 text-[#518C5B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round"/>
          <circle cx="9" cy="7" r="4" strokeLinecap="round"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round"/>
        </svg>
      }
      title="Nenhum paciente cadastrado"
      description="Comece adicionando seu primeiro paciente para acompanhar sua evolução nutricional."
      action={
        onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-gradient-to-r from-[#518C5B] to-[#3d7047] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
          >
            + Adicionar Paciente
          </button>
        )
      }
    />
  );
}

export function EmptyAppointments({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      variant="illustrated"
      icon={
        <svg className="w-12 h-12 text-[#518C5B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
        </svg>
      }
      title="Nenhuma consulta agendada"
      description="Sua agenda está livre! Agende uma nova consulta para começar a atender seus pacientes."
      action={
        onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-gradient-to-r from-[#518C5B] to-[#3d7047] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
          >
            + Nova Consulta
          </button>
        )
      }
    />
  );
}

export function EmptyPlans({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      variant="illustrated"
      icon={
        <svg className="w-12 h-12 text-[#C4764A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round"/>
        </svg>
      }
      title="Nenhum plano alimentar"
      description="Crie seu primeiro plano alimentar personalizado para seus pacientes."
      action={
        onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-gradient-to-r from-[#C4764A] to-[#9d5a38] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20"
          >
            + Criar Plano
          </button>
        )
      }
    />
  );
}