import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  UserCheck, UserX, CalendarPlus, StickyNote, Shield,
  KeyRound, Settings, AlertTriangle, CheckCircle, XCircle,
  Clock, Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';

interface AuditRecord {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
  admin_user_id?: string | null;
}

interface AuditLogTimelineProps {
  logs: AuditRecord[];
}

const ACTION_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  activate_nutritionist: {
    label: 'Ativou acesso',
    icon: UserCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-500/30'
  },
  deactivate_nutritionist: {
    label: 'Desativou acesso',
    icon: UserX,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500/30'
  },
  extend_trial: {
    label: 'Estendeu trial',
    icon: CalendarPlus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500/30'
  },
  update_admin_notes: {
    label: 'Atualizou notas internas',
    icon: StickyNote,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-500/30'
  },
  update_profile: {
    label: 'Atualizou perfil',
    icon: Settings,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-500/30'
  },
  reset_password: {
    label: 'Resetou senha',
    icon: KeyRound,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-500/30'
  },
  grant_admin: {
    label: 'Concedeu acesso admin',
    icon: Shield,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-500/30'
  },
  revoke_admin: {
    label: 'Revogou acesso admin',
    icon: XCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500/30'
  },
};

const DEFAULT_ACTION_CONFIG = {
  label: 'Ação administrativa',
  icon: Activity,
  color: 'text-slate-600',
  bgColor: 'bg-slate-100',
  borderColor: 'border-slate-500/30'
};

function formatDetails(details: Record<string, unknown> | null): string {
  if (!details) return '';

  const parts: string[] = [];
  if (details.days) parts.push(`${details.days} dias`);
  if (details.plan) parts.push(`Plano: ${details.plan}`);
  if (details.status) parts.push(`Status: ${details.status}`);
  if (details.reason) parts.push(`Motivo: ${details.reason}`);
  if (details.amount) parts.push(`Valor: R$ ${Number(details.amount).toLocaleString('pt-BR')}`);

  // Fallback for unknown keys
  if (parts.length === 0) {
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  return parts.join(' • ');
}

export function AuditLogTimeline({ logs }: AuditLogTimelineProps) {
  if (logs.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">Nenhum registro de atividade</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-0">
      <NeonText as="h3" color="primary" className="font-semibold mb-4">
        Histórico de Atividades
      </NeonText>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-4 bottom-4 w-px bg-border/50" />

        <div className="space-y-4">
          {logs.map((log, index) => {
            const config = ACTION_CONFIG[log.action] || DEFAULT_ACTION_CONFIG;
            const Icon = config.icon;
            const isLast = index === logs.length - 1;

            return (
              <div key={log.id} className="relative flex gap-4 group">
                {/* Timeline dot */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>

                {/* Content card */}
                <div className="flex-1 min-w-0 pb-2">
                  <GlassCard className="p-4 hover:bg-card/80 transition-colors" hover={false}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${config.color}`}>
                            {config.label}
                          </span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.borderColor} ${config.color} bg-transparent`}>
                            {log.action}
                          </Badge>
                        </div>

                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDetails(log.details)}
                          </p>
                        )}
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs font-medium text-foreground">
                          {format(new Date(log.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(log.created_at), 'HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Connector arrow (except last) */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 w-px h-4 bg-border/30" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}