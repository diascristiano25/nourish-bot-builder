import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Zap, ShieldCheck, Activity } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-nf-bg pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Mesh - More intense */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-nf-teal/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-nf-coral/20 blur-[120px] animate-pulse-slow delay-1000" />

        {/* Grid Pattern - Subtle */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* --- LEFT COLUMN: COPY --- */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nf-teal/10 border border-nf-teal/20 backdrop-blur-sm scroll-fade-up">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nf-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-nf-teal"></span>
              </span>
              <span className="text-sm font-semibold text-nf-teal tracking-wide uppercase">Lançamento Exclusivo 2026</span>
            </div>

            {/* Headline - Larger, tighter tracking */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-nf-text leading-[1.1] scroll-fade-up scroll-stagger-1">
              Nutrição de precisão,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nf-teal to-nf-coral">
                potencializada por IA.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-nf-text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed scroll-fade-up scroll-stagger-2">
              Esqueça planilhas. O NutriFlow gera cardápios personalizados em segundos e gestiona sua clínica inteira em uma plataforma unificada.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start scroll-fade-up scroll-stagger-3">
              <Link to="/auth">
                <Button size="lg" className="h-14 px-8 text-lg bg-nf-coral hover:bg-nf-coral/90 text-white shadow-lg shadow-nf-coral/25 transition-all hover:scale-105 group">
                  Começar Grátis Agora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-nf-border hover:border-nf-teal hover:text-nf-teal transition-colors bg-white/50 backdrop-blur-sm">
                <Play className="mr-2 h-5 w-5" />
                Ver Demonstração
              </Button>
            </div>

            {/* Trust Indicators - Minimal */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-sm text-nf-text-muted scroll-fade-up scroll-stagger-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-nf-teal" />
                <span>LGPD Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-nf-teal" />
                <span>Sem cartão de crédito</span>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: VISUAL --- */}
          <div className="relative lg:h-[600px] flex items-center justify-center scroll-blur-in scroll-stagger-2">

            {/* Main Dashboard Card - Glassmorphism */}
            <div className="relative w-full max-w-lg aspect-[4/3] bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500 z-10">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b border-nf-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-nf-teal to-nf-teal/70 flex items-center justify-center text-white shadow-lg shadow-nf-teal/20">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-nf-text">Painel Clínico</div>
                    <div className="text-xs text-nf-text-muted">Atualizado agora</div>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>

              {/* Content Mockup */}
              <div className="space-y-4">
                {/* Stat Row */}
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-nf-bg-alt/50 border border-nf-border/30 p-3 flex flex-col justify-between">
                      <div className="h-2 w-8 bg-nf-border rounded-full" />
                      <div className="h-4 w-12 bg-nf-teal/20 rounded-full" />
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="h-32 rounded-2xl bg-gradient-to-b from-nf-teal/5 to-transparent border border-nf-border/30 p-4 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-between gap-1 px-2">
                    {[40, 70, 45, 90, 60, 85, 50].map((h, i) => (
                      <div key={i} className="w-full bg-nf-teal/20 rounded-t-sm hover:bg-nf-teal/40 transition-colors" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                {/* List Item */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-nf-bg-alt/30 border border-nf-border/30">
                  <div className="h-10 w-10 rounded-full bg-nf-coral/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-24 bg-nf-border rounded-full" />
                    <div className="h-2 w-16 bg-nf-border/50 rounded-full" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-nf-teal/10" />
                </div>
              </div>
            </div>

            {/* Floating Element 1 - AI Generation */}
            <div className="absolute -top-6 -left-6 md:-left-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-nf-border/50 animate-float z-20 max-w-[200px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-nf-coral/10 flex items-center justify-center text-nf-coral">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-nf-text">IA Generativa</span>
              </div>
              <div className="text-xs text-nf-text-muted leading-relaxed">
                Gerando plano de 7 dias para paciente diabético...
              </div>
              <div className="mt-2 h-1 w-full bg-nf-border rounded-full overflow-hidden">
                <div className="h-full bg-nf-coral w-2/3 animate-pulse" />
              </div>
            </div>

            {/* Floating Element 2 - Success Notification */}
            <div className="absolute -bottom-6 -right-6 md:-right-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-nf-border/50 animate-float-delay z-20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-nf-text">Cardápio Aprovado</div>
                  <div className="text-xs text-nf-text-muted">Precisão nutricional 98%</div>
                </div>
              </div>
            </div>

            {/* Decorative Blobs behind card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-nf-teal/10 to-nf-coral/10 rounded-full blur-3xl -z-10 animate-morph-blob" />
          </div>
        </div>
      </div>
    </section>
  );
}