
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Zap, ShieldCheck, Activity } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-nf-bg pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
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
            {/* Headline - Responsive sizing */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-nf-text leading-[1.1] scroll-fade-up text-center lg:text-left">
              Nutrição de precisão,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nf-teal to-nf-coral">
                potencializada por IA.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-nf-text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed scroll-fade-up scroll-stagger-1 text-center lg:text-left">
              Esqueça planilhas. O NutriFlow gera cardápios personalizados em segundos e gestiona sua clínica inteira em uma plataforma unificada.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start scroll-fade-up scroll-stagger-3">
              <a href="https://wa.me/5513996205253?text=Ol%C3%A1!%20Quero%20come%C3%A7ar%20meu%20teste%20gr%C3%A1tis%20de%2014%20dias%20no%20NutriFlow." target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg bg-nf-teal hover:bg-nf-teal/90 text-white shadow-lg shadow-nf-teal/25 transition-all hover:scale-105 group">
                  Começar Teste Grátis
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-2 border-nf-border hover:border-nf-teal hover:text-nf-teal transition-colors bg-card/50 backdrop-blur-sm">
                <Play className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
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
            <div className="relative w-full max-w-lg aspect-[4/3] bg-card/70 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500 z-10">
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
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Content Mockup */}
              <div className="space-y-4">
                {/* Stat Row - Real data */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Pacientes', value: '48', trend: '+12%' },
                    { label: 'Cardápios', value: '126', trend: '+34%' },
                    { label: 'Adesão', value: '94%', trend: '+8%' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-nf-bg-alt/50 border border-nf-border/30 p-3 flex flex-col justify-between">
                      <div className="text-[10px] text-nf-text-muted font-medium uppercase tracking-wide">{stat.label}</div>
                      <div>
                        <div className="text-lg font-bold text-nf-text leading-none">{stat.value}</div>
                        <div className="text-[10px] text-nf-teal font-semibold mt-1">{stat.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart Area - With labels */}
                <div className="rounded-2xl bg-gradient-to-b from-nf-teal/5 to-transparent border border-nf-border/30 p-4 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-nf-text">Evolução semanal</span>
                    <span className="text-[10px] text-nf-teal font-bold">-3.2 kg</span>
                  </div>
                  <div className="h-20 flex items-end justify-between gap-1.5 px-1">
                    {[40, 70, 45, 90, 60, 85, 50].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-gradient-to-t from-nf-teal/40 to-nf-teal/20 rounded-t-sm hover:from-nf-teal/60 transition-colors" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-nf-text-muted mt-1.5 px-1">
                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                      <span key={i} className="flex-1 text-center">{d}</span>
                    ))}
                  </div>
                </div>

                {/* Patient List Item - Real data */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-nf-bg-alt/30 border border-nf-border/30">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-nf-coral/20 to-nf-teal/20 flex items-center justify-center text-xs font-bold text-nf-text">MS</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-nf-text truncate">Maria Silva</div>
                    <div className="text-[11px] text-nf-text-muted">Plano low-carb • 1.650 kcal</div>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-nf-teal/10 text-nf-teal text-[10px] font-bold">Ativa</div>
                </div>
              </div>
            </div>

            {/* Floating Element 1 - AI Generation */}
            <div className="absolute -top-6 -left-6 md:-left-12 bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-nf-border/50 animate-float z-20 max-w-[200px]">
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
            <div className="absolute -bottom-6 -right-6 md:-right-12 bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-nf-border/50 animate-float-delay z-20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-nf-teal/20 flex items-center justify-center text-nf-teal">
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