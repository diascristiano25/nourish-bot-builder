import { Brain, Users, TrendingUp, ArrowRight } from 'lucide-react';

const props = [
  {
    icon: Brain,
    title: 'IA Generativa Avançada',
    description:
      'Gemini 2.5 gera cardápios personalizados em segundos, adaptados a objetivos e restrições alimentares de cada paciente.',
    accent: 'teal',
    stat: '< 30s',
    statLabel: 'por cardápio',
  },
  {
    icon: Users,
    title: 'Gestão Clínica Unificada',
    description:
      'Pacientes, agendamento, evolução e comunicação em um só lugar. Sem planilhas, sem caos, sem perda de dados.',
    accent: 'coral',
    stat: '100%',
    statLabel: 'integrado',
  },
  {
    icon: TrendingUp,
    title: 'Resultados Mensuráveis',
    description:
      'Analytics em tempo real do progresso dos pacientes. Dashboards visuais que impressionam e fidelizam.',
    accent: 'teal',
    stat: 'Real-time',
    statLabel: 'analytics',
  },
];

export default function ValuePropsSection() {
  return (
    <section id="recursos" className="relative bg-nf-bg-alt py-24 md:py-36 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-nf-border to-transparent" />
      <div className="absolute -top-20 right-0 w-[400px] h-[400px] bg-nf-teal/3 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute -bottom-20 left-0 w-[300px] h-[300px] bg-nf-coral/3 rounded-full blur-3xl animate-float pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20 scroll-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nf-teal/10 text-nf-teal text-xs font-semibold uppercase tracking-wider mb-4">
            Recursos
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-nf-text mb-6">
            Tudo que você precisa para{' '}
            <span className="gradient-text">inovar</span>
          </h2>
          <p className="text-lg text-nf-text-muted max-w-2xl mx-auto leading-relaxed">
            Uma plataforma completa que combina inteligência artificial com gestão clínica profissional.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {props.map((prop, i) => (
            <div
              key={prop.title}
              className={`group relative glass-card rounded-3xl p-8 md:p-10 scroll-scale-in scroll-stagger-${i + 1} hover-lift card-shine cursor-default`}
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                prop.accent === 'teal'
                  ? 'bg-gradient-to-br from-nf-teal/5 to-transparent'
                  : 'bg-gradient-to-br from-nf-coral/5 to-transparent'
              }`} />

              {/* Icon with animated background */}
              <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                prop.accent === 'teal'
                  ? 'bg-gradient-to-br from-nf-teal/15 to-nf-teal/5 border border-nf-teal/20'
                  : 'bg-gradient-to-br from-nf-coral/15 to-nf-coral/5 border border-nf-coral/20'
              }`}>
                <prop.icon className={`w-7 h-7 ${
                  prop.accent === 'teal' ? 'text-nf-teal' : 'text-nf-coral'
                }`} />
                {/* Pulse ring */}
                <div className={`absolute inset-0 rounded-2xl ${
                  prop.accent === 'teal' ? 'bg-nf-teal/10' : 'bg-nf-coral/10'
                } animate-ping opacity-0 group-hover:opacity-100 transition-opacity`} style={{ animationDuration: '2s' }} />
              </div>

              {/* Content */}
              <h3 className="font-serif text-xl md:text-2xl font-bold text-nf-text mb-3 group-hover:gradient-text transition-all duration-300">
                {prop.title}
              </h3>
              <p className="text-nf-text-muted leading-relaxed mb-6">
                {prop.description}
              </p>

              {/* Stat badge */}
              <div className="flex items-center justify-between pt-6 border-t border-nf-border/50">
                <div>
                  <div className={`text-2xl font-bold ${
                    prop.accent === 'teal' ? 'text-nf-teal' : 'text-nf-coral'
                  }`}>
                    {prop.stat}
                  </div>
                  <div className="text-xs text-nf-text-muted uppercase tracking-wider">
                    {prop.statLabel}
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0 ${
                  prop.accent === 'teal' ? 'bg-nf-teal/10 text-nf-teal' : 'bg-nf-coral/10 text-nf-coral'
                }`}>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}