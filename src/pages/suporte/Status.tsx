import { HybridPage } from '@/components/hybrid/HybridPage';
import { Card } from '@/components/ui/card';
import { StatusIndicator } from '@/components/support/StatusIndicator';
import { IncidentCard } from '@/components/support/IncidentCard';
import { Activity, TrendingUp } from 'lucide-react';
import statusData from '@/content/status.json';
import type { StatusData } from '@/types/status';

const data = statusData as StatusData;

export default function Status() {
  const publicContent = (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-800">
              Todos os sistemas operacionais
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Status do Sistema
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Acompanhe a disponibilidade e desempenho da plataforma NutriFlow em tempo real
          </p>
        </div>

        {/* Uptime Metric */}
        <Card className="p-8 bg-gradient-to-br from-slate-50 to-white border-2">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Disponibilidade (30 dias)</span>
              </div>
              <div className="text-5xl font-bold text-slate-900">
                {data.uptime}%
              </div>
              <p className="text-sm text-slate-500">
                Média calculada nos últimos 30 dias
              </p>
            </div>
            <Activity className="w-20 h-20 text-slate-300" />
          </div>
        </Card>

        {/* Services Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Serviços</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.services.map((service) => (
              <Card key={service.name} className="p-6 bg-card">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <StatusIndicator service={service} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Latência:</span>
                    <span>{service.latency}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Incidents Timeline */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Histórico de Incidentes</h2>
          <p className="text-slate-600">
            Últimos incidentes registrados e suas resoluções
          </p>
          <div className="space-y-3">
            {data.incidents.length > 0 ? (
              data.incidents.map((incident, index) => (
                <IncidentCard key={index} incident={incident} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-slate-600">
                  Nenhum incidente registrado recentemente
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* CTA */}
        <Card className="p-8 bg-gradient-to-br from-[#518C5B]/5 to-white border-[#518C5B]/20">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">
              Quer receber notificações sobre incidentes?
            </h3>
            <p className="text-slate-600">
              Cadastre-se gratuitamente e ative alertas em tempo real
            </p>
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-6 py-3 bg-[#518C5B] text-white rounded-lg font-medium hover:bg-[#518C5B]/90 transition-colors"
            >
              Criar Conta Grátis
            </button>
          </div>
        </Card>
      </div>
    </div>
  );

  const authContent = (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-800">
              Todos os sistemas operacionais
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Status do Sistema
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Acompanhe a disponibilidade e desempenho da plataforma NutriFlow em tempo real
          </p>
        </div>

        {/* Uptime Metric */}
        <Card className="p-8 bg-gradient-to-br from-slate-50 to-white border-2">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Disponibilidade (30 dias)</span>
              </div>
              <div className="text-5xl font-bold text-slate-900">
                {data.uptime}%
              </div>
              <p className="text-sm text-slate-500">
                Média calculada nos últimos 30 dias
              </p>
            </div>
            <Activity className="w-20 h-20 text-slate-300" />
          </div>
        </Card>

        {/* Services Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Serviços</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.services.map((service) => (
              <Card key={service.name} className="p-6 bg-card">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <StatusIndicator service={service} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Latência:</span>
                    <span>{service.latency}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Notification Toggle (Auth Only) */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900">
                Notificações de Incidentes
              </h3>
              <p className="text-sm text-slate-600">
                Receba alertas por email quando houver problemas nos serviços
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked={false}
                onChange={(e) => {
                  // Future: Save to database
                  console.log('Notifications:', e.target.checked);
                }}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#518C5B]"></div>
            </label>
          </div>
        </Card>

        {/* Incidents Timeline */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Histórico de Incidentes</h2>
          <p className="text-slate-600">
            Últimos incidentes registrados e suas resoluções
          </p>
          <div className="space-y-3">
            {data.incidents.length > 0 ? (
              data.incidents.map((incident, index) => (
                <IncidentCard key={index} incident={incident} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-slate-600">
                  Nenhum incidente registrado recentemente
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <HybridPage
      publicContent={publicContent}
      authContent={authContent}
      title="Status"
      description="Acompanhe a disponibilidade e desempenho da plataforma NutriFlow em tempo real"
    />
  );
}
