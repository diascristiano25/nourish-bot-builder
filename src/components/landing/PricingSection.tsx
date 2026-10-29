import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ArrowRight, Zap } from 'lucide-react';

const WHATSAPP_CHECKOUT = '/auth';

const plans = [
  {
    name: 'Starter',
    price: 'R$ 39,90',
    period: '/mês',
    description: 'Para começar a inovar',
    features: [
      'Até 20 pacientes ativos',
      'Gerador de cardápios com IA',
      'Relatórios básicos de evolução',
      'App mobile do paciente',
      'Suporte por email',
    ],
    highlighted: false,
    accent: 'teal',
    cta: 'Começar Teste Grátis',
    ctaHref: WHATSAPP_CHECKOUT,
  },
  {
    name: 'Pro',
    price: 'R$ 69,90',
    period: '/mês',
    description: 'Para crescer com IA',
    badge: 'Mais Popular',
    features: [
      'Até 100 pacientes ativos',
      'Gerador avançado com IA Gemini 2.5',
      'Relatórios detalhados + gráficos',
      'Agendamento online integrado',
      'Notificações WhatsApp para pacientes',
      'Analytics de resultados em tempo real',
      'Suporte prioritário 24/7',
    ],
    highlighted: true,
    accent: 'coral',
    cta: 'Começar Teste Grátis por 14 Dias',
    ctaHref: WHATSAPP_CHECKOUT,
  },
  {
    name: 'Enterprise',
    price: 'R$ 109,90',
    period: '/mês',
    description: 'Solução completa para clínicas',
    features: [
      'Pacientes ilimitados',
      'IA customizada e treinada',
      'Relatórios executive board',
      'API integrada ao seu sistema',
      'White-label disponível',
      'Treinamento dedicado da equipe',
      'Gerente de sucesso dedicado',
    ],
    highlighted: false,
    accent: 'teal',
    cta: 'Começar Teste Grátis',
    ctaHref: WHATSAPP_CHECKOUT,
  },
];

export default function PricingSection() {
  return (
    <section id="planos" className="relative bg-nf-bg py-24 md:py-36 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-nf-border to-transparent" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-nf-teal/3 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/3 -right-40 w-[400px] h-[400px] bg-nf-coral/3 rounded-full blur-3xl animate-float pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20 scroll-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nf-coral/10 text-nf-coral text-xs font-semibold uppercase tracking-wider mb-4">
            Planos de Lançamento
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-nf-text mb-6">
            Invista no futuro da{' '}
            <span className="gradient-text">sua prática</span>
          </h2>
          <p className="text-lg text-nf-text-muted max-w-2xl mx-auto leading-relaxed">
            14 dias grátis em todos os planos. Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative scroll-scale-in scroll-stagger-${i + 1} ${
                plan.highlighted ? 'md:-mt-4 md:mb-[-1rem]' : ''
              }`}
            >
              {/* Highlighted card wrapper with animated gradient border */}
              {plan.highlighted && (
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-nf-teal via-nf-coral to-nf-teal animate-gradient-shift opacity-75 blur-sm" />
              )}

              <div
                className={`relative rounded-3xl p-8 md:p-10 h-full flex flex-col ${
                  plan.highlighted
                    ? 'glass-card glow-coral'
                    : 'glass-card hover-lift card-shine'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-nf-coral to-nf-coral/80 text-white text-xs font-bold shadow-lg animate-pulse-badge">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-8">
                  <h3 className="font-serif text-2xl font-bold text-nf-text mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-nf-text-muted text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-nf-text tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-nf-text-muted text-lg">{plan.period}</span>
                    )}
                  </div>
                  {plan.highlighted && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-nf-coral font-medium">
                      <Zap className="w-3 h-3" />
                      Economia de R$ 600/ano no anual
                    </div>
                  )}
                </div>

                {/* CTA — aponta para WhatsApp (campanha leva ao teste) */}
                <a href={plan.ctaHref} target="_blank" rel="noopener noreferrer" className="block mb-8">
                  <Button
                    className={`w-full py-4 text-base font-semibold rounded-xl transition-all duration-300 group ${
                      plan.highlighted
                        ? 'bg-nf-coral hover:bg-nf-coral/90 text-white shadow-lg hover:shadow-xl'
                        : 'bg-nf-text hover:bg-nf-text/90 text-nf-bg'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>

                {/* Features */}
                <div className="space-y-4 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.accent === 'teal'
                            ? 'bg-nf-teal/15 text-nf-teal'
                            : 'bg-nf-coral/15 text-nf-coral'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-nf-text-muted text-sm leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust footer */}
        <div className="mt-16 text-center scroll-fade-up">
          <p className="text-sm text-nf-text-muted">
            Todos os planos incluem LGPD compliance, backups diários e atualizações gratuitas.
          </p>
        </div>
      </div>
    </section>
  );
}