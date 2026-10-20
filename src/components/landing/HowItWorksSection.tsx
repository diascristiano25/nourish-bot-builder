import { UserPlus, Sparkles, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

const stages = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Cadastre o perfil do paciente',
    description: 'Anamnese inteligente que coleta dados essenciais em minutos. Histórico, objetivos, restrições e preferências — tudo estruturado automaticamente.',
    features: ['Anamnese digital', 'Importação de exames', 'Perfis personalizados'],
    color: 'teal',
  },
  {
    number: 2,
    icon: Sparkles,
    title: 'IA gera o cardápio personalizado',
    description: 'Baseado em objetivos, restrições e preferências alimentares. Nossa IA cria planos equilibrados com precisão nutricional clínica.',
    features: ['Geração em < 30s', 'Balanceamento automático', 'Substituições inteligentes'],
    color: 'coral',
  },
  {
    number: 3,
    icon: BarChart3,
    title: 'Acompanhe resultados em tempo real',
    description: 'Dashboard de evolução com métricas que importam. Visualize progresso, ajuste planos e impressione pacientes com dados visuais.',
    features: ['Analytics em tempo real', 'Relatórios automáticos', 'Alertas inteligentes'],
    color: 'teal',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="como-funciona" className="relative bg-nf-bg-alt py-24 md:py-36 overflow-hidden">
      {/* Transition from previous section */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-nf-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20 scroll-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nf-coral/10 text-nf-coral text-xs font-semibold uppercase tracking-wider mb-4 border border-nf-coral/20">
            Como Funciona
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-nf-text mb-6">
            Três passos para a{' '}
            <span className="gradient-text">transformação</span>
          </h2>
          <p className="text-lg text-nf-text-muted max-w-2xl mx-auto leading-relaxed">
            Do cadastro ao resultado mensurável — um fluxo intuitivo powered by IA.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical line with gradient */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 md:-translate-x-px overflow-hidden">
            <div className="absolute inset-0 bg-nf-border/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-nf-teal via-nf-coral to-nf-teal scroll-line-grow origin-top" />
          </div>

          <div className="space-y-12 md:space-y-16">
            {stages.map((stage, i) => {
              const isEven = i % 2 === 0;
              const Icon = stage.icon;
              return (
                <div
                  key={stage.number}
                  className={`relative flex flex-col md:flex-row items-start gap-8 md:gap-16 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Number circle with glow */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-20">
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
                      stage.color === 'teal'
                        ? 'bg-gradient-to-br from-nf-teal to-nf-teal/80 glow-teal'
                        : 'bg-gradient-to-br from-nf-coral to-nf-coral/80 glow-coral'
                    }`}>
                      <Icon className="w-7 h-7 text-white" />
                      {/* Pulse ring */}
                      <div className={`absolute inset-0 rounded-2xl ${
                        stage.color === 'teal' ? 'bg-nf-teal/20' : 'bg-nf-coral/20'
                      } animate-ping opacity-20`} style={{ animationDuration: '3s' }} />
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-nf-bg border-2 border-nf-border flex items-center justify-center text-xs font-bold text-nf-text shadow-sm">
                      {stage.number}
                    </div>
                  </div>

                  {/* Content card */}
                  <div
                    className={`ml-24 md:ml-0 md:w-[calc(50%-4rem)] ${
                      isEven ? 'scroll-slide-left' : 'scroll-slide-right'
                    }`}
                  >
                    <div className="glass-card rounded-3xl p-8 hover-lift card-shine group">
                      <h3 className="font-serif text-2xl md:text-3xl font-bold text-nf-text mb-4 group-hover:gradient-text transition-all duration-300">
                        {stage.title}
                      </h3>
                      <p className="text-nf-text-muted leading-relaxed mb-6">
                        {stage.description}
                      </p>

                      {/* Feature pills */}
                      <div className="flex flex-wrap gap-2">
                        {stage.features.map((feature) => (
                          <span
                            key={feature}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                              stage.color === 'teal'
                                ? 'bg-nf-teal/10 text-nf-teal border border-nf-teal/20'
                                : 'bg-nf-coral/10 text-nf-coral border border-nf-coral/20'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-[calc(50%-4rem)]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transition to next section */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-nf-border to-transparent" />
    </section>
  );
}