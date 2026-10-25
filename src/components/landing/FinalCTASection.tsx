
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

export default function FinalCTASection() {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-nf-teal/8 via-nf-bg to-nf-coral/8 animate-gradient-shift" />

      {/* Morphing blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-nf-teal/10 rounded-full blur-3xl animate-morph-blob pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-nf-coral/10 rounded-full blur-3xl animate-morph-blob pointer-events-none" style={{ animationDelay: '-6s' }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--nf-text-primary)) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Headline */}
        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-nf-text mb-6 leading-tight scroll-fade-up scroll-stagger-1">
          Pronto para transformar{' '}
          <span className="gradient-text">sua prática?</span>
        </h2>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-nf-text-muted mb-10 max-w-2xl mx-auto leading-relaxed scroll-fade-up scroll-stagger-2">
          Junte-se aos primeiros nutricionistas a usar o NutriFlow.
          Inovação em nutrição, disponível agora com condições exclusivas de lançamento.
        </p>

        {/* CTA Button */}
        <div className="scroll-fade-up scroll-stagger-3 mb-12">
          <a href="https://wa.me/5513996205253?text=Ol%C3%A1!%20Quero%20come%C3%A7ar%20meu%20teste%20gr%C3%A1tis%20de%2014%20dias%20no%20NutriFlow." target="_blank" rel="noopener noreferrer">
            <Button className="bg-nf-coral hover:bg-nf-coral/90 text-white font-bold px-12 py-5 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover-lift group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-3">
                Começar Teste Grátis
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </Button>
          </a>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-8 text-sm scroll-fade-up scroll-stagger-4">
          <div className="flex items-center gap-2 text-nf-text-muted">
            <div className="w-8 h-8 rounded-full bg-nf-teal/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-nf-teal" />
            </div>
            <span>14 dias grátis</span>
          </div>
          <div className="flex items-center gap-2 text-nf-text-muted">
            <div className="w-8 h-8 rounded-full bg-nf-teal/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-nf-teal" />
            </div>
            <span>Sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-2 text-nf-text-muted">
            <div className="w-8 h-8 rounded-full bg-nf-teal/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-nf-teal" />
            </div>
            <span>Cancele quando quiser</span>
          </div>
        </div>

        {/* Decorative floating elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-nf-teal/10 rounded-2xl rotate-12 animate-float blur-sm pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-nf-coral/10 rounded-full animate-float-delay blur-sm pointer-events-none" />
      </div>
    </section>
  );
}