import { Incident } from '@/types/status';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Eye, Search } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
}

export function IncidentCard({ incident }: IncidentCardProps) {
  const statusConfig = {
    investigating: {
      label: 'Investigando',
      icon: Search,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    identified: {
      label: 'Identificado',
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    monitoring: {
      label: 'Monitorando',
      icon: Eye,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    resolved: {
      label: 'Resolvido',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200',
    },
  };

  const severityConfig = {
    low: { label: 'Baixa', color: 'bg-slate-100 text-slate-700' },
    medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-700' },
    high: { label: 'Alta', color: 'bg-red-100 text-red-700' },
  };

  const config = statusConfig[incident.status];
  const Icon = config.icon;
  const severityLabel = incident.severity ? severityConfig[incident.severity] : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={config.color}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            {severityLabel && (
              <Badge variant="secondary" className={severityLabel.color}>
                {severityLabel.label}
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-slate-900">{incident.title}</h3>

          {incident.description && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {incident.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
            <span>{formatDate(incident.date)}</span>
            <span>•</span>
            <span>Duração: {incident.duration}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
