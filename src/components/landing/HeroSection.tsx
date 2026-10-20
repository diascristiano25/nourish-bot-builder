import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-nf-bg pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background decorative element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-nf-teal/5 to-nf-coral/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 mb-8 scroll-fade-up">
            <span className="animate-pulse-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nf-teal/10 text-nf-teal text-sm font-semibold border border-nf-teal/30">
              🚀 Lançamento Exclusivo
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-nf-text leading-tight mb-6 scroll-fade-up scroll-stagger-1">
            Cardápios inteligentes que se{' '}
            <span className="text-nf-teal">adaptam a cada paciente</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-nf-text-muted max-w-2xl mx-auto mb-10 leading-relaxed scroll-fade-up scroll-stagger-2">
            IA generativa + gestão clínica em uma plataforma unificada.
            Disponível agora.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 scroll-fade-up scroll-stagger-3">
            <Link to="/auth">
              <Button className="bg-nf-coral hover:bg-nf-coral/90 text-white font-semibold px-8 py-6 text-lg w-full sm:w-auto">
                Começar Grátis por 14 Dias <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" className="border-nf-teal text-nf-teal hover:bg-nf-teal/10 px-8 py-6 text-lg w-full sm:w-auto">
              Ver Demo
            </Button>
          </div>

          {/* Mockup placeholder with parallax */}
          <div className="scroll-parallax-y mt-12">
            <div className="relative max-w-4xl mx-auto aspect-video rounded-xl bg-gradient-to-br from-nf-bg-alt to-nf-border border border-nf-border shadow-2xl overflow-hidden">
              {/* Dashboard mockup representation */}
              <div className="absolute inset-0 p-8 flex flex-col gap-4">
                <div className="h-8 w-1/3 bg-nf-teal/20 rounded-md" />
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div className="bg-white/50 rounded-lg border border-nf-border/50" />
                  <div className="bg-white/50 rounded-lg border border-nf-border/50" />
                  <div className="bg-white/50 rounded-lg border border-nf-border/50" />
                </div>
                <div className="h-24 bg-white/50 rounded-lg border border-nf-border/50" />
              </div>

              {/* Floating elements for visual interest */}
              <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-nf-coral/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-nf-teal/20 rounded-full blur-xl animate-pulse delay-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}