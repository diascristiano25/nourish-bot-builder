const features = [
  {
    title: 'Gerador de cardápios com IA',
    description:
      'Crie planos alimentares completos em segundos. A IA analisa o perfil do paciente e gera cardápios equilibrados automaticamente.',
    reversed: false,
  },
  {
    title: 'App mobile do paciente',
    description:
      'Seus pacientes recebem cardápios, lembretes e acompanhamento direto no celular. Engajamento sem esforço.',
    reversed: true,
  },
  {
    title: 'Relatórios automatizados',
    description:
      'Relatórios profissionais de evolução gerados automaticamente. Impressione pacientes com dados visuais.',
    reversed: false,
  },
];

export default function FeatureShowcaseSection() {
  return (
    <section className="bg-nf-bg-alt py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 space-y-24">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className={`flex flex-col gap-12 items-center ${
              feature.reversed ? 'md:flex-row-reverse' : 'md:flex-row'
            }`}
          >
            {/* Text side */}
            <div className="flex-1 scroll-fade-up">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-nf-text mb-4">
                {feature.title}
              </h3>
              <p className="text-nf-text-muted text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Image/mockup side with parallax */}
            <div className="flex-1 w-full scroll-parallax-y">
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-nf-bg to-nf-border border border-nf-border shadow-lg overflow-hidden relative">
                {/* Abstract dashboard representation */}
                <div className="absolute inset-0 p-6 flex flex-col gap-3">
                  <div className="h-6 w-2/5 bg-nf-teal/15 rounded-md" />
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="bg-white/60 rounded-lg border border-nf-border/40" />
                    <div className="bg-white/60 rounded-lg border border-nf-border/40" />
                  </div>
                  <div className="h-16 bg-white/60 rounded-lg border border-nf-border/40" />
                </div>
                {/* Decorative accent */}
                <div
                  className={`absolute w-24 h-24 rounded-full blur-2xl opacity-30 ${
                    i % 2 === 0
                      ? 'bg-nf-teal top-1/4 right-1/4'
                      : 'bg-nf-coral bottom-1/4 left-1/4'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}