import { UserCircle, HeartStraight, ChartLine, ClipboardText, Bell, CalendarCheck } from '@phosphor-icons/react';

const nutritionistBenefits = [
  { icon: CalendarCheck, title: 'Agenda Inteligente', description: 'Integração com Google Calendar e lembretes automáticos' },
  { icon: ClipboardText, title: 'Prescrições Rápidas', description: 'Crie cardápios personalizados em minutos' },
  { icon: ChartLine, title: 'Relatórios Detalhados', description: 'Acompanhe evolução com gráficos e métricas' }
];

const patientBenefits = [
  { icon: UserCircle, title: 'Acesso Mobile', description: 'App para consultar cardápios e registrar refeições' },
  { icon: HeartStraight, title: 'Acompanhamento Contínuo', description: 'Chat direto com seu nutricionista' },
  { icon: Bell, title: 'Lembretes Personalizados', description: 'Notificações de refeições e água' }
];

export function DualBenefitsSection(): JSX.Element {
  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
          Benefícios para Todos
        </h2>
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left column: Nutritionist */}
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-8">
              Para o Nutricionista
            </h3>
            <div className="space-y-6">
              {nutritionistBenefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Icon size={32} weight="duotone" className="text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-slate-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column: Patient */}
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-8">
              Para o Paciente
            </h3>
            <div className="space-y-6">
              {patientBenefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Icon size={32} weight="duotone" className="text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-slate-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
