import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function LandingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 'R$ 99',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        'Até 20 pacientes',
        'Gerador de cardápios com IA',
        'Relatórios básicos',
        'Suporte por email',
        'App mobile do paciente',
      ],
      cta: 'Começar Grátis',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: 'R$ 299',
      period: '/mês',
      description: 'Para crescer profissionalmente',
      features: [
        'Até 100 pacientes',
        'Gerador avançado com IA',
        'Relatórios detalhados',
        'Agendamento integrado',
        'Notificações para pacientes',
        'Suporte prioritário',
        'Analytics de resultados',
      ],
      cta: 'Começar Grátis',
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
      cta: 'Conversar',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1419] to-[#1A1F2E] text-white">
      {/* Header */}
      <header className="border-b border-[#293447] sticky top-0 z-50 bg-[#0F1419]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
            <span className="font-serif text-2xl font-bold">NutriFlow</span>
          </Link>
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-gray-400 hover:text-white">Recursos</a>
            <a href="#pricing" className="text-gray-400 hover:text-white">Planos</a>
            <a href="#contact" className="text-gray-400 hover:text-white">Contato</a>
          </nav>
          <Link to="/auth">
            <Button className="bg-[#1CBFA5] hover:bg-[#0E9B8A] text-black font-semibold">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="absolute inset-0 overflow-hidden rounded-full blur-3xl opacity-20">
          <div className="absolute w-96 h-96 bg-[#1CBFA5] rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="inline-block mb-6 px-4 py-2 bg-[#1CBFA5]/10 rounded-full border border-[#1CBFA5]/30">
            <span className="text-[#1CBFA5] flex items-center gap-2 text-sm font-semibold">
              <Zap className="w-4 h-4" />
              Cardápios com Inteligência Artificial
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Cardápios{' '}
            <span className="bg-gradient-to-r from-[#1CBFA5] to-[#0E9B8A] text-transparent bg-clip-text">
              personalizados
            </span>
            {' '}em segundos
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            A plataforma mais avançada do mercado para nutricionistas criarem cardápios inteligentes,
            gerenciarem pacientes e impressionarem resultados. Economize tempo. Impressione pacientes.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button className="bg-[#EF7B66] hover:bg-[#E85D48] text-white font-semibold px-8 py-6 text-lg">
                Começar Grátis por 14 Dias <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" className="border-[#1CBFA5] text-[#1CBFA5] hover:bg-[#1CBFA5]/10 px-8 py-6 text-lg">
              Ver Demo
            </Button>
          </div>

          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#1CBFA5]" />
              14 dias grátis
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#1CBFA5]" />
              Sem cartão de crédito
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#1CBFA5]" />
              Cancelar a qualquer momento
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-serif font-bold text-center mb-16">Por que NutriFlow?</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-8 h-8 text-[#1CBFA5]" />,
              title: 'IA Inteligente',
              desc: 'Gemini 2.5 gera cardápios personalizados em segundos',
            },
            {
              icon: <Users className="w-8 h-8 text-[#1CBFA5]" />,
              title: 'Gestão de Pacientes',
              desc: 'Acompanhe evolução, metricas e comunicação centralizada',
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-[#1CBFA5]" />,
              title: 'Resultados Mensuráveis',
              desc: 'Relatórios detalhados e analytics de progresso',
            },
          ].map((item, i) => (
            <Card key={i} className="bg-[#1A1F2E] border-[#293447] p-8 hover:border-[#1CBFA5]/50 transition">
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-serif font-bold text-center mb-16">Planos Simples e Transparentes</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={`border-[#293447] transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-[#1CBFA5]/10 to-[#0E9B8A]/5 border-[#1CBFA5]/50 transform scale-105 shadow-2xl shadow-[#1CBFA5]/20'
                  : 'bg-[#1A1F2E]'
              }`}
            >
              <div className="p-8">
                {plan.highlighted && (
                  <div className="mb-4 inline-block px-3 py-1 bg-[#1CBFA5]/20 border border-[#1CBFA5] rounded text-[#1CBFA5] text-sm font-semibold">
                    Mais popular
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>

                <Link to="/auth" className="w-full block mb-8">
                  <Button
                    className={`w-full py-3 font-semibold ${
                      plan.highlighted
                        ? 'bg-[#1CBFA5] hover:bg-[#0E9B8A] text-black'
                        : 'bg-[#EF7B66] hover:bg-[#E85D48] text-white'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <div className="space-y-4">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#1CBFA5] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-[#1CBFA5]/10 to-[#EF7B66]/10 border border-[#1CBFA5]/30 rounded-xl p-12">
          <h2 className="text-3xl font-serif font-bold mb-6">Pronto para transformar sua nutrição?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de nutricionistas que já estão economizando tempo e impressionando resultados.
          </p>
          <Link to="/auth">
            <Button className="bg-[#EF7B66] hover:bg-[#E85D48] text-white font-semibold px-8 py-3 text-lg">
              Começar Gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#293447] mt-20 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400">
          <p>© 2026 NutriFlow. Transformando a nutrição com IA.</p>
        </div>
      </footer>
    </div>
  );
}
