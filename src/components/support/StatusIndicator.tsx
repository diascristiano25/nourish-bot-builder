import { Service } from '@/types/status';

interface StatusIndicatorProps {
  service: Service;
}

export function StatusIndicator({ service }: StatusIndicatorProps) {
  const statusColors = {
    operational: '#10b981',
    degraded: '#f59e0b',
    outage: '#ef4444',
  };

  const statusLabels = {
    operational: 'Operacional',
    degraded: 'Degradado',
    outage: 'Indisponível',
  };

  const color = statusColors[service.status];
  const label = statusLabels[service.status];

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );
}
