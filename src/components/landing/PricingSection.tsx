import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 'R$ 99',
    period: '/mês',
    description: 'Para começar a inovar',
    features: [
      'Até 20 pacientes',
      'Gerador de cardápios com IA',
      'Relatórios básicos',
      'Suporte por email',
      'App mobile do paciente',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$ 299',
    period: '/mês',
    description: 'Para crescer com IA',
    badge: 'Mais Popular',
    features: [
      'Até 100 pacientes',
      'Gerador avançado com IA',
      'Relatórios detalhados',
      'Agendamento integrado',
      'Notificações para pacientes',
      'Suporte prioritário',
      'Analytics de resultados',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Customizado',
    period: '',
    description: 'Solução completa para clínicas',
    features: [
      'Pacientes ilimitados',
      'IA customizada',
      'Relatórios executive',
      'API integrada',
      'Suporte dedicado 24/7',
      'Treinamento da equipe',
      'White-label disponível',
    ],
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section id="planos" className="bg-nf-bg py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-nf-text mb-16 text-center">
          Planos de lançamento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative bg-nf-bg border rounded-2xl p-8 scroll-scale-in scroll-stagger-${i + 1} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                plan.highlighted
                  ? 'border-nf-teal ring-2 ring-nf-teal/20 md:scale-105 z-10'
                  : 'border-nf-border'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-nf-teal text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  {plan.badge}
                </div>
              )}

              <h3 className="font-serif text-xl font-bold text-nf-text mb-1">{plan.name}</h3>
              <p className="text-nf-text-muted text-sm mb-6">{plan.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-nf-text">{plan.price}</span>
                <span className="text-nf-text-muted">{plan.period}</span>
              </div>

              <Link to="/auth" className="block mb-8">
                <Button
                  className={`w-full py-3 font-semibold ${
                    plan.highlighted
                      ? 'bg-nf-coral hover:bg-nf-coral/90 text-white'
                      : 'bg-nf-coral hover:bg-nf-coral/90 text-white'
                  }`}
                >
                  Começar Grátis
                </Button>
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-nf-teal flex-shrink-0 mt-0.5" />
                    <span className="text-nf-text-muted text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}