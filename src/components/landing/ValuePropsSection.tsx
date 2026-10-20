import { Brain, Users, TrendingUp } from 'lucide-react';

const props = [
  {
    icon: Brain,
    title: 'IA Generativa Avançada',
    description:
      'Gemini 2.5 gera cardápios personalizados em segundos, adaptados a objetivos e restrições alimentares.',
  },
  {
    icon: Users,
    title: 'Gestão Clínica Unificada',
    description:
      'Pacientes, agendamento e evolução em um só lugar. Sem planilhas, sem caos.',
  },
  {
    icon: TrendingUp,
    title: 'Resultados Mensuráveis',
    description:
      'Analytics em tempo real do progresso dos pacientes. Dados que impressionam.',
  },
];

export default function ValuePropsSection() {
  return (
    <section id="recursos" className="bg-nf-bg-alt py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {props.map((prop, i) => (
            <div
              key={prop.title}
              className={`bg-nf-bg border border-nf-border rounded-2xl p-8 scroll-scale-in scroll-stagger-${i + 1}`}
            >
              <div className="w-12 h-12 rounded-xl bg-nf-teal/10 flex items-center justify-center text-nf-teal mb-4">
                <prop.icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-nf-text mb-2">
                {prop.title}
              </h3>
              <p className="text-nf-text-muted leading-relaxed">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}