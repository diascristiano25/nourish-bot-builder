import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { ParticleField } from '@/components/ui/ParticleField';
import { 
  ArrowRight, 
  Sparkles, 
  Loader2,
  Check,
  Zap,
  Brain,
  Shield,
  Clock,
  Users,
  Play,
  Star,
  Crown,
  Rocket,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import logoImg from '@/assets/logo.png';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Grátis',
      period: '33 dias',
      description: '30 dias + 3 extras para configurar',
      icon: Rocket,
      features: [
        'Até 10 pacientes',
        'Gerador de cardápios com IA',
        'Tabela TACO completa',
        'Suporte por WhatsApp',
      ],
      cta: 'Começar Grátis',
      popular: false,
      glowColor: 'lime' as const,
    },
    {
      name: 'Profissional',
      price: 'R$ 97',
      period: '/mês',
      description: 'Para nutricionistas em crescimento',
      icon: Crown,
      features: [
        'Pacientes ilimitados',
        'IA avançada para cardápios',
        'Portal do paciente',
        'Agenda integrada',
        'Relatórios financeiros',
        'Suporte prioritário',
      ],
      cta: 'Assinar Agora',
      popular: true,
      glowColor: 'violet' as const,
    },
    {
      name: 'Clínica',
      price: 'R$ 197',
      period: '/mês',
      description: 'Para clínicas e equipes',
      icon: Star,
      features: [
        'Tudo do Profissional',
        'Múltiplos nutricionistas',
        'Dashboard administrativo',
        'Relatórios consolidados',
        'API personalizada',
        'Onboarding dedicado',
      ],
      cta: 'Assinar Agora',
      popular: false,
      glowColor: 'lime' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Cyber Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
              <img src={logoImg} alt="NutriFlow" className="w-10 h-10 object-contain relative z-10" />
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">
              Nutri<NeonText variant="lime">Flow</NeonText>
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <a 
              href="#pricing" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline font-medium"
            >
              Preços
            </a>
            <a 
              href="/sobre" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline font-medium"
            >
              Sobre
            </a>
            <a 
              href="https://wa.me/5547992381906"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline font-medium"
            >
              Contato
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline" 
              size="sm"
              className="rounded-xl border-border/50 text-foreground hover:bg-muted hover:border-primary/50 font-medium px-5"
            >
              Entrar
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Particle Background */}
        <div className="absolute inset-0">
          <ParticleField particleCount={60} color="mixed" />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] orb-neon opacity-40" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] orb-violet opacity-30" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] orb-cyan opacity-20" />

        {/* Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Cardápios com{' '}
              <NeonText variant="gradient" className="inline">
                Inteligência Artificial
              </NeonText>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              A plataforma mais avançada do mercado para criar 
              cardápios personalizados em segundos. Economize tempo. Impressione pacientes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto text-base px-10 py-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold btn-cyber animate-glow-pulse"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto text-base px-8 py-7 rounded-xl border-border/50 hover:border-primary/50 hover:bg-muted font-medium"
              >
                <Play className="mr-2 w-5 h-5 fill-current" />
                Ver Como Funciona
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <strong className="text-primary">33</strong> dias grátis
              </span>
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                Sem cartão
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 glass border-primary/30 text-primary rounded-full font-semibold">
              Recursos
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Tecnologia de <NeonText variant="lime">Elite</NeonText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Ferramentas avançadas para nutricionistas modernos
            </p>
          </div>

          <div className="bento-grid max-w-6xl mx-auto">
            <GlassCard className="bento-item span-2 p-8" glow="lime">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">IA Generativa</h3>
                  <p className="text-muted-foreground">
                    Cardápios personalizados gerados por inteligência artificial em segundos, 
                    considerando restrições, preferências e objetivos.
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="bento-item p-8" glow="violet">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Tabela TACO</h3>
              <p className="text-muted-foreground text-sm">
                Banco de dados completo com +600 alimentos brasileiros.
              </p>
            </GlassCard>

            <GlassCard className="bento-item p-8" glow="lime">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">100% Seguro</h3>
              <p className="text-muted-foreground text-sm">
                Dados criptografados e protegidos com os mais altos padrões.
              </p>
            </GlassCard>

            <GlassCard className="bento-item p-8" glow="lime">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Economia de Tempo</h3>
              <p className="text-muted-foreground text-sm">
                De horas para segundos na criação de cardápios.
              </p>
            </GlassCard>

            <GlassCard className="bento-item span-2 p-8" glow="violet">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0">
                  <Users className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Gestão Completa</h3>
                  <p className="text-muted-foreground">
                    Pacientes, agenda, financeiro, prontuários e muito mais em uma única plataforma.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 glass border-secondary/30 text-secondary rounded-full font-semibold">
              Planos
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Escolha seu <NeonText variant="violet">plano</NeonText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Comece grátis e escale conforme sua necessidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-6">
            {pricingPlans.map((plan, index) => (
              <div key={plan.name} className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap shadow-lg">
                    Mais Popular
                  </Badge>
                )}
                <GlassCard 
                  className="p-8 h-full"
                  glow={plan.glowColor}
                  variant={plan.popular ? 'strong' : 'default'}
                >
                
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-secondary/20' : 'bg-primary/20'}`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-secondary' : 'text-primary'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-secondary' : 'text-primary'}`}>
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">
                    {plan.period.includes('33') ? (
                      <>por <span className="text-primary font-semibold">33 dias</span></>
                    ) : plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-secondary/20' : 'bg-primary/20'}`}>
                        <Check className={`w-3 h-3 ${plan.popular ? 'text-secondary' : 'text-primary'}`} />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => navigate('/auth')}
                  className={`w-full rounded-xl py-6 font-semibold ${
                    plan.popular 
                      ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' 
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {plan.cta}
                </Button>
              </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <GlassCard className="max-w-4xl mx-auto p-12 text-center" glow="lime" variant="strong">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para <NeonText variant="lime">revolucionar</NeonText> seu consultório?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Junte-se a centenas de nutricionistas que já transformaram sua prática com o NutriFlow.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-base px-12 py-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold btn-cyber"
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="NutriFlow" className="w-8 h-8 object-contain" />
              <span className="font-semibold text-foreground">NutriFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 NutriFlow. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a href="/privacidade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </a>
              <a href="/sobre" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sobre
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
