import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Zap, Shield } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-nf-bg pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden min-h-screen flex items-center">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Morphing blob 1 - teal */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-nf-teal/8 rounded-full blur-3xl animate-morph-blob" />
        {/* Morphing blob 2 - coral */}
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-nf-coral/6 rounded-full blur-3xl animate-morph-blob" style={{ animationDelay: '-4s' }} />
        {/* Morphing blob 3 - center accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-nf-teal/4 rounded-full blur-3xl animate-float-slow" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--nf-text-primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Noise texture */}
      <div className="noise-overlay" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Text content */}
          <div className="space-y-8">
            {/* Animated Badge */}
            <div className="inline-flex scroll-fade-up">
              <span className="animate-pulse-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-nf-teal/10 text-nf-teal text-sm font-semibold border border-nf-teal/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                Lançamento Exclusivo 2026
              </span>
            </div>

            {/* Headline with gradient text */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-nf-text leading-[1.1] scroll-fade-up scroll-stagger-1">
              Cardápios inteligentes que se{' '}
              <span className="gradient-text">adaptam a cada paciente</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-nf-text-muted max-w-xl leading-relaxed scroll-fade-up scroll-stagger-2">
              IA generativa + gestão clínica em uma plataforma unificada.
              O futuro da nutrição chegou — e está disponível agora.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-nf-text-muted scroll-fade-up scroll-stagger-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-nf-teal" />
                <span>Geração em segundos</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-nf-teal" />
                <span>LGPD compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-nf-teal" />
                <span>IA Gemini 2.5</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 scroll-fade-up scroll-stagger-3">
              <Link to="/auth">
                <Button className="bg-nf-coral hover:bg-nf-coral/90 text-white font-semibold px-8 py-7 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift w-full sm:w-auto group">
                  Começar Grátis por 14 Dias
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" className="border-2 border-nf-teal/30 text-nf-text hover:bg-nf-teal/5 px-8 py-7 text-lg rounded-xl backdrop-blur-sm w-full sm:w-auto group">
                <Play className="mr-2 w-5 h-5 text-nf-teal group-hover:scale-110 transition-transform" />
                Ver Demo
              </Button>
            </div>

            {/* Social proof alternative - launch stats */}
            <div className="flex gap-8 pt-4 scroll-fade-up scroll-stagger-4">
              <div>
                <div className="text-2xl font-bold text-nf-text">14 dias</div>
                <div className="text-sm text-nf-text-muted">Grátis, sem cartão</div>
              </div>
              <div className="w-px bg-nf-border" />
              <div>
                <div className="text-2xl font-bold text-nf-text">&lt; 30s</div>
                <div className="text-sm text-nf-text-muted">Por cardápio gerado</div>
              </div>
              <div className="w-px bg-nf-border" />
              <div>
                <div className="text-2xl font-bold text-nf-text">100%</div>
                <div className="text-sm text-nf-text-muted">Personalizado</div>
              </div>
            </div>
          </div>

          {/* Right column - Interactive mockup */}
          <div className="relative scroll-blur-in scroll-stagger-2">
            {/* Floating decorative elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-nf-coral/10 rounded-2xl rotate-12 animate-float blur-sm" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-nf-teal/10 rounded-full animate-float-delay blur-sm" />

            {/* Main mockup card with glass effect */}
            <div className="relative glass-card rounded-3xl p-6 md:p-8 glow-teal">
              {/* Mockup header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nf-teal to-nf-teal/70 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-nf-text text-sm">NutriFlow AI</div>
                    <div className="text-xs text-nf-text-muted">Gerando cardápio...</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-nf-coral/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-nf-teal/60" />
                </div>
              </div>

              {/* Mockup content - simulated dashboard */}
              <div className="space-y-4">
                {/* Patient info bar */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-nf-bg-alt/50 border border-nf-border/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nf-teal/20 to-nf-coral/20" />
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-nf-text/10 rounded" />
                    <div className="h-2 w-16 bg-nf-text/5 rounded mt-1.5" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-nf-teal/10 text-nf-teal text-xs font-medium">
                    Ativo
                  </div>
                </div>

                {/* Meal plan cards */}
                <div className="grid grid-cols-3 gap-3">
                  {['Café', 'Almoço', 'Jantar'].map((meal, i) => (
                    <div key={meal} className="p-3 rounded-xl bg-white/60 border border-nf-border/40 space-y-2">
                      <div className="text-xs font-medium text-nf-text-muted">{meal}</div>
                      <div className="h-16 rounded-lg bg-gradient-to-br from-nf-teal/5 to-nf-coral/5 border border-nf-border/30" />
                      <div className="h-2 w-3/4 bg-nf-text/5 rounded" />
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-nf-teal/5 to-nf-coral/5 border border-nf-border/40">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-nf-text-muted">Progresso semanal</span>
                    <span className="text-nf-teal font-semibold">78%</span>
                  </div>
                  <div className="h-2 rounded-full bg-nf-border/50 overflow-hidden">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-nf-teal to-nf-coral animate-shimmer relative">
                      <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                    </div>
                  </div>
                </div>

                {/* AI suggestion */}
                <div className="p-3 rounded-xl bg-nf-teal/5 border border-nf-teal/20 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-nf-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-nf-teal" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-nf-teal mb-0.5">Sugestão IA</div>
                    <div className="text-xs text-nf-text-muted leading-relaxed">
                      Aumentar proteína em 15% baseado na evolução do paciente
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification card */}
            <div className="absolute -bottom-4 -right-4 md:-right-8 glass-card rounded-2xl p-4 animate-float shadow-xl max-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-nf-text">Cardápio gerado!</span>
              </div>
              <div className="text-xs text-nf-text-muted">
                Plano de 7 dias pronto em 23s
              </div>
            </div>

            {/* Floating stat card */}
            <div className="absolute -top-4 -left-4 md:-left-8 glass-card rounded-2xl p-4 animate-float-delay shadow-xl">
              <div className="text-2xl font-bold gradient-text">98%</div>
              <div className="text-xs text-nf-text-muted">Precisão nutricional</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-fade-up scroll-stagger-4">
        <div className="w-6 h-10 rounded-full border-2 border-nf-border flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-nf-teal animate-bounce" />
        </div>
      </div>
    </section>
  );
}