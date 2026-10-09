"use client";
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import logoImg from '@/assets/logo.png';
import {
  Clock,
  Brain,
  LineChart,
  Smartphone,
  Check,
  ArrowRight,
  Sparkles,
  Users,
  ChevronDown
} from 'lucide-react';
import { useRef } from 'react';

export default function LandingPageNew() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const features = [
    {
      icon: Clock,
      title: "3 minutos por cardápio",
      description: "IA treinada com 50.000+ combinações nutricionais. Gere planos completos enquanto o paciente espera.",
      size: "large" as const,
    },
    {
      icon: Brain,
      title: "Ajustes automáticos",
      description: "Restrições, preferências e metas calculadas em tempo real.",
      size: "medium" as const,
    },
    {
      icon: Smartphone,
      title: "App para pacientes",
      description: "Seus pacientes recebem notificações, registram refeições e acompanham evolução.",
      size: "medium" as const,
    },
    {
      icon: LineChart,
      title: "Métricas que importam",
      description: "Taxa de adesão, evolução de peso, macros consumidos. Dados reais para ajustar estratégia.",
      size: "large" as const,
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: 'R$ 99',
      period: '/mês',
      description: 'Para começar',
      features: [
        '20 pacientes ativos',
        'Gerador de cardápios ilimitado',
        'App mobile do paciente',
        'Relatórios básicos',
      ],
      cta: 'Começar grátis',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: 'R$ 299',
      period: '/mês',
      description: 'Para crescer',
      features: [
        '100 pacientes ativos',
        'Tudo do Starter, mais:',
        'Analytics de adesão',
        'Notificações automáticas',
        'Agendamento integrado',
        'Suporte prioritário',
      ],
      cta: 'Começar grátis',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Sob medida',
      period: '',
      description: 'Para clínicas',
      features: [
        'Pacientes ilimitados',
        'Tudo do Pro, mais:',
        'White-label',
        'API customizada',
        'Suporte dedicado',
        'Treinamento da equipe',
      ],
      cta: 'Falar com vendas',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl"
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="h-9 w-auto" />
            <span className="text-xl font-semibold tracking-tight">NutriFlow</span>
          </Link>

          <nav className="hidden md:flex gap-8 text-sm">
            <a href="#features" className="text-slate-400 hover:text-slate-50 transition">Recursos</a>
            <a href="#pricing" className="text-slate-400 hover:text-slate-50 transition">Planos</a>
            <a href="#testimonials" className="text-slate-400 hover:text-slate-50 transition">Cases</a>
          </nav>

          <Link to="/auth">
            <Button className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-6">
              Entrar
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Hero - Asymmetric Split */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden"
      >
        {/* Background gradient accent */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Content (60%) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="lg:col-span-7"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-600/10 border border-teal-600/20 text-teal-400 text-sm font-medium mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Cardápios com IA em 3 minutos
              </motion.div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-none mb-6">
                Menos planilhas.
                <br />
                <span className="text-teal-400">Mais pacientes.</span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-400 leading-relaxed mb-8 max-w-[540px]">
                Crie cardápios personalizados em minutos, não horas. Acompanhe resultados reais. Seus pacientes recebem tudo no celular.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to="/auth">
                  <Button className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-8 py-6 text-base">
                    Testar grátis por 14 dias
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-slate-50 px-8 py-6 text-base"
                >
                  Ver demonstração
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" />
                  Cancele quando quiser
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" />
                  Setup em 5 minutos
                </div>
              </div>
            </motion.div>

            {/* Right: Image (40%) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="lg:col-span-5"
            >
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 overflow-hidden">
                  <img
                    src="https://picsum.photos/seed/nutriflow-dashboard/800/1000"
                    alt="NutriFlow Dashboard"
                    className="w-full h-full object-cover opacity-90"
                  />
                </div>
                {/* Floating stat card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute bottom-6 -left-6 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl"
                >
                  <div className="text-2xl font-bold text-teal-400 mb-1">3 min</div>
                  <div className="text-xs text-slate-400">tempo médio por cardápio</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1,
            duration: 0.6,
            y: {
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5,
              ease: [0.16, 0, 0.3, 1]
            }
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.section>

      {/* Features - Bento Grid */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4">
              Feito para nutricionistas que querem escalar
            </h2>
            <p className="text-lg text-slate-400 max-w-[600px]">
              Automatize o trabalho repetitivo. Foque no que só você sabe fazer.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const isLarge = feature.size === 'large';

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={isLarge ? "md:col-span-1" : "md:col-span-1"}
                >
                  <Card className={`bg-slate-900/50 border-slate-800/50 ${isLarge ? 'p-8' : 'p-6'} hover:border-slate-700/50 transition group h-full`}>
                    <div className={`w-12 h-12 rounded-lg bg-teal-600/10 flex items-center justify-center mb-4 group-hover:bg-teal-600/20 transition`}>
                      <Icon className="w-6 h-6 text-teal-400" />
                    </div>
                    <h3 className={`${isLarge ? 'text-2xl' : 'text-xl'} font-bold mb-3 tracking-tight`}>
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof - Marquee */}
      <section className="py-16 border-y border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-8">
          <p className="text-sm text-slate-500 text-center">Usado por nutricionistas em</p>
        </div>
        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 items-center"
          >
            {['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Curitiba', 'Porto Alegre', 'Salvador', 'Fortaleza'].map((city, i) => (
              <div key={i} className="text-slate-600 font-medium whitespace-nowrap flex items-center gap-2">
                <Users className="w-4 h-4" />
                {city}
              </div>
            ))}
            {['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Curitiba', 'Porto Alegre', 'Salvador', 'Fortaleza'].map((city, i) => (
              <div key={`dup-${i}`} className="text-slate-600 font-medium whitespace-nowrap flex items-center gap-2">
                <Users className="w-4 h-4" />
                {city}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing - Staggered */}
      <section id="pricing" className="py-20 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4">
              Planos transparentes
            </h2>
            <p className="text-lg text-slate-400">
              Escolha o que faz sentido agora. Mude quando quiser.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={plan.highlighted ? "md:-mt-4" : ""}
              >
                <Card className={`border-slate-800/50 ${plan.highlighted ? 'bg-gradient-to-b from-teal-950/30 to-slate-900/50 border-teal-800/30' : 'bg-slate-900/30'} p-8 h-full flex flex-col`}>
                  {plan.highlighted && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-600/10 border border-teal-600/20 text-teal-400 text-xs font-medium mb-4 self-start">
                      Mais popular
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-slate-400 mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>

                  <Link to="/auth" className="block mb-8">
                    <Button className={`w-full py-3 font-semibold ${plan.highlighted ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-50'}`}>
                      {plan.cta}
                    </Button>
                  </Link>

                  <div className="space-y-3 flex-grow">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-12 lg:p-16 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjUiIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />

            <div className="relative text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
                Comece hoje. Grátis por 14 dias.
              </h2>
              <p className="text-teal-100 text-lg mb-8 max-w-[600px] mx-auto">
                Configure sua conta em 5 minutos. Importe sua lista de pacientes. Gere seu primeiro cardápio.
              </p>
              <Link to="/auth">
                <Button className="bg-white hover:bg-slate-50 text-teal-700 font-semibold px-8 py-6 text-base">
                  Criar conta gratuita
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">NutriFlow</span>
            </div>

            <div className="flex gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-slate-300 transition">Privacidade</a>
              <a href="#" className="hover:text-slate-300 transition">Termos</a>
              <a href="#" className="hover:text-slate-300 transition">Suporte</a>
            </div>

            <p className="text-sm text-slate-500">
              © 2026 NutriFlow. CNPJ 00.000.000/0001-00
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
