import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Loader2, Check, Brain, Shield, Clock, Users, Star, Crown, Rocket, Sun, Moon, Leaf, Heart, Apple
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import logoImg from '@/assets/logo.png';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard');
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
      features: ['Até 10 pacientes', 'Gerador de cardápios com IA', 'Tabela TACO completa', 'Suporte por WhatsApp'],
      cta: 'Começar Grátis',
      popular: false,
    },
    {
      name: 'Profissional',
      price: 'R$ 97',
      period: '/mês',
      description: 'Para nutricionistas em crescimento',
      icon: Crown,
      features: ['Pacientes ilimitados', 'IA avançada para cardápios', 'Portal do paciente', 'Agenda integrada', 'Relatórios financeiros', 'Suporte prioritário'],
      cta: 'Assinar Agora',
      popular: true,
    },
    {
      name: 'Clínica',
      price: 'R$ 197',
      period: '/mês',
      description: 'Para clínicas e equipes',
      icon: Star,
      features: ['Tudo do Profissional', 'Múltiplos nutricionistas', 'Dashboard administrativo', 'Relatórios consolidados', 'API personalizada', 'Onboarding dedicado'],
      cta: 'Assinar Agora',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="w-10 h-10 object-contain" />
            <span className="font-serif font-semibold text-xl text-foreground tracking-tight">
              Nutri<span className="text-primary">Flow</span>
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline font-medium">Preços</a>
            <a href="/sobre" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline font-medium">Sobre</a>
            <a href="https://wa.me/5547992381906" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline font-medium">Contato</a>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl text-muted-foreground hover:text-foreground" aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button onClick={() => navigate('/auth')} variant="outline" size="sm" className="rounded-xl font-medium px-5">
              Entrar
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Organic background */}
        <div className="absolute inset-0 bg-organic-pattern" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[80px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Leaf decoration */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Leaf className="w-4 h-4" />
                Software para Nutricionistas
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-semibold mb-6 leading-[1.1] tracking-tight text-foreground">
              Cardápios com{' '}
              <span className="text-primary italic">Inteligência Artificial</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              A plataforma mais avançada do mercado para criar 
              cardápios personalizados em segundos. Economize tempo. Impressione pacientes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="xl" 
                variant="hero"
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto"
              >
                Ver Como Funciona
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <strong className="text-primary">33</strong> dias grátis
              </span>
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                Sem cartão
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-gentle-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Recursos
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-4 text-foreground">
              Feito para quem <span className="text-primary italic">cuida</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Ferramentas pensadas para facilitar o dia a dia do nutricionista
            </p>
          </div>

          <div className="bento-grid max-w-5xl mx-auto">
            <div className="bento-item span-2 p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-xl mb-2 text-foreground">IA Generativa</h3>
                  <p className="text-muted-foreground">
                    Cardápios personalizados gerados por inteligência artificial em segundos, 
                    considerando restrições, preferências e objetivos.
                  </p>
                </div>
              </div>
            </div>

            <div className="bento-item p-8">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                <Apple className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-sans font-semibold text-lg mb-2 text-foreground">Tabela TACO</h3>
              <p className="text-muted-foreground text-sm">Banco de dados completo com +600 alimentos brasileiros.</p>
            </div>

            <div className="bento-item p-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-sans font-semibold text-lg mb-2 text-foreground">100% Seguro</h3>
              <p className="text-muted-foreground text-sm">Dados criptografados e protegidos com os mais altos padrões.</p>
            </div>

            <div className="bento-item p-8">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-sans font-semibold text-lg mb-2 text-foreground">Economia de Tempo</h3>
              <p className="text-muted-foreground text-sm">De horas para segundos na criação de cardápios.</p>
            </div>

            <div className="bento-item span-2 p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-3xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <Users className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-xl mb-2 text-foreground">Gestão Completa</h3>
                  <p className="text-muted-foreground">
                    Pacientes, agenda, financeiro, prontuários e muito mais em uma única plataforma.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 bg-organic-pattern opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Planos
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-4 text-foreground">
              Escolha seu <span className="text-secondary italic">plano</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Comece grátis e escale conforme sua necessidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-6">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap shadow-terracotta">
                    Mais Popular
                  </div>
                )}
                <div className={`organic-card p-8 h-full ${plan.popular ? 'border-secondary/30 shadow-soft-md' : ''}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.popular ? 'bg-secondary/10' : 'bg-primary/10'}`}>
                      <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-secondary' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-lg text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className={`text-4xl font-serif font-semibold ${plan.popular ? 'text-secondary' : 'text-primary'}`}>
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      {plan.period.includes('33') ? (<>por <span className="text-primary font-semibold">33 dias</span></>) : plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-secondary/10' : 'bg-primary/10'}`}>
                          <Check className={`w-3 h-3 ${plan.popular ? 'text-secondary' : 'text-primary'}`} />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => navigate('/auth')}
                    variant={plan.popular ? "hero" : "default"}
                    className="w-full rounded-xl py-6 font-semibold"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="organic-card max-w-4xl mx-auto p-12 text-center border-primary/20">
            <Leaf className="w-10 h-10 text-primary/40 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-foreground">
              Pronto para <span className="text-primary italic">transformar</span> seu consultório?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Junte-se a centenas de nutricionistas que já elevaram sua prática com o NutriFlow.
            </p>
            <Button size="xl" variant="hero" onClick={() => navigate('/auth')}>
              Começar Agora <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="NutriFlow" className="w-8 h-8 object-contain" />
              <span className="font-serif font-semibold text-foreground">NutriFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 NutriFlow. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <a href="/suporte/privacidade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacidade</a>
              <a href="/sobre" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
