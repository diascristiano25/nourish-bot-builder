const stages = [
  {
    number: 1,
    title: 'Cadastre o perfil do paciente',
    description: 'Anamnese inteligente que coleta dados essenciais em minutos.',
  },
  {
    number: 2,
    title: 'IA gera o cardápio personalizado',
    description: 'Baseado em objetivos, restrições e preferências alimentares.',
  },
  {
    number: 3,
    title: 'Acompanhe resultados em tempo real',
    description: 'Dashboard de evolução com métricas que importam.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="como-funciona" className="bg-nf-bg py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-nf-text mb-16 text-center">
          Como funciona
        </h2>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-nf-teal/30 md:-translate-x-px">
            <div className="absolute inset-0 bg-nf-teal scroll-line-grow origin-top" />
          </div>

          <div className="space-y-16">
            {stages.map((stage, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  key={stage.number}
                  className={`relative flex items-start gap-8 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Number circle */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-nf-teal text-white flex items-center justify-center font-bold text-lg z-10 shadow-lg">
                    {stage.number}
                  </div>

                  {/* Content card */}
                  <div
                    className={`ml-20 md:ml-0 md:w-[calc(50%-3rem)] ${
                      isEven
                        ? 'md:pr-0 md:text-right scroll-slide-left'
                        : 'md:pl-0 md:text-left scroll-slide-right'
                    }`}
                  >
                    <div className="bg-nf-bg-alt border border-nf-border rounded-xl p-6">
                      <h3 className="font-serif text-xl font-bold text-nf-text mb-2">
                        {stage.title}
                      </h3>
                      <p className="text-nf-text-muted leading-relaxed">
                        {stage.description}
                      </p>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}