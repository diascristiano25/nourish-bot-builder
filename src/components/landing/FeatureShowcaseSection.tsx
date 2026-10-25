import { Sparkles, Smartphone, FileText, ArrowRight, Check, Zap, ShieldCheck, Activity } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Gerador de cardápios com IA',
    description:
      'Crie planos alimentares completos em segundos. A IA analisa o perfil do paciente e gera cardápios equilibrados automaticamente, com precisão nutricional clínica.',
    bullets: [
      'Geração em menos de 30 segundos',
      'Balanceamento macro e micronutrientes',
      'Substituições inteligentes por preferência',
      'Adaptação a restrições e alergias',
    ],
    reversed: false,
    accent: 'teal',
    mockupType: 'generator',
  },
  {
    icon: Smartphone,
    title: 'App mobile do paciente',
    description:
      'Seus pacientes recebem cardápios, lembretes e acompanhamento direto no celular. Engajamento sem esforço, adesão que transforma resultados.',
    bullets: [
      'Cardápio sempre no bolso',
      'Lembretes personalizados de refeição',
      'Check-in diário de adesão',
      'Comunicação direta com nutricionista',
    ],
    reversed: true,
    accent: 'coral',
    mockupType: 'mobile',
  },
  {
    icon: FileText,
    title: 'Relatórios automatizados',
    description:
      'Relatórios profissionais de evolução gerados automaticamente. Impressione pacientes com dados visuais claros e tome decisões baseadas em evidência.',
    bullets: [
      'Gráficos de evolução semanal e mensal',
      'Exportação em PDF profissional',
      'Comparativos antes/depois',
      'Insights gerados por IA',
    ],
    reversed: false,
    accent: 'teal',
    mockupType: 'report',
  },
];

function MockupGenerator() {
  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 glow-teal relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-nf-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nf-teal to-nf-teal/70 flex items-center justify-center text-white shadow-lg shadow-nf-teal/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-nf-text text-sm">Gerador IA</div>
            <div className="text-xs text-nf-text-muted">Plano de 7 dias • 1850 kcal</div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-nf-teal/10 text-nf-teal text-xs font-medium border border-nf-teal/20 animate-pulse">
          Gerando...
        </span>
      </div>

      {/* Meal Cards Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {['Café da Manhã', 'Almoço', 'Jantar'].map((meal, i) => (
          <div key={meal} className="p-3 rounded-2xl bg-nf-bg-alt/60 border border-nf-border/40 space-y-2 hover:border-nf-teal/30 transition-colors">
            <div className="text-[10px] font-semibold text-nf-text-muted uppercase tracking-wide">{meal}</div>
            <div className="h-16 rounded-xl bg-gradient-to-br from-nf-teal/5 to-nf-coral/5 border border-nf-border/30 flex items-center justify-center">
              <Activity className="w-6 h-6 text-nf-teal/30" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-nf-text/5 rounded-full" />
              <div className="h-1.5 w-2/3 bg-nf-text/5 rounded-full" />
            </div>
            <div className="text-[10px] text-nf-teal font-semibold">{450 + i * 150} kcal</div>
          </div>
        ))}
      </div>

      {/* AI Suggestion Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-nf-teal/10 to-nf-coral/10 border border-nf-teal/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-nf-teal/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-nf-teal" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-nf-teal mb-0.5">Sugestão IA</div>
          <div className="text-[11px] text-nf-text-muted leading-relaxed">
            Aumentar proteína em 15% baseado na evolução do paciente
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-nf-teal opacity-50" />
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-nf-border/50 overflow-hidden">
          <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-nf-teal to-nf-coral relative">
            <div className="absolute inset-0 bg-card/30 animate-shimmer" />
          </div>
        </div>
        <span className="text-xs font-bold text-nf-teal">78%</span>
      </div>
    </div>
  );
}

function MockupMobile() {
  return (
    <div className="relative flex justify-center">
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] rounded-[3rem] bg-nf-text p-3 shadow-2xl glow-coral">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-nf-text rounded-b-2xl z-10" />
        {/* Screen */}
        <div className="w-full h-full rounded-[2.4rem] bg-nf-bg overflow-hidden relative">
          {/* Status Bar */}
          <div className="h-10 bg-gradient-to-r from-nf-teal to-nf-coral flex items-end justify-center pb-1">
            <span className="text-white text-xs font-bold tracking-wide">NutriFlow</span>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Greeting */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-nf-text">Bom dia, Maria 👋</div>
              <div className="w-8 h-8 rounded-full bg-nf-teal/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-nf-teal" />
              </div>
            </div>

            {/* Next Meal Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-nf-teal/10 to-nf-coral/10 border border-nf-teal/20">
              <div className="text-xs text-nf-text-muted mb-1">Próxima refeição</div>
              <div className="text-base font-bold text-nf-text mb-1">Almoço • 12:30</div>
              <div className="text-xs text-nf-text-muted">Frango grelhado + quinoa + legumes</div>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-1 rounded-md bg-card/60 text-[10px] font-medium text-nf-text">450 kcal</span>
                <span className="px-2 py-1 rounded-md bg-card/60 text-[10px] font-medium text-nf-text">35g prot</span>
              </div>
            </div>

            {/* Meal Timeline */}
            <div className="grid grid-cols-3 gap-2">
              {['Café', 'Almoço', 'Jantar'].map((m, i) => (
                <div key={m} className={`p-2 rounded-xl border text-center ${i === 1 ? 'bg-nf-teal/10 border-nf-teal/30' : 'bg-nf-bg-alt border-nf-border/50'}`}>
                  <div className={`w-6 h-6 mx-auto rounded-full mb-1 ${i === 1 ? 'bg-nf-teal/30' : 'bg-nf-border/50'}`} />
                  <div className="text-[10px] font-medium text-nf-text-muted">{m}</div>
                  <div className="text-[9px] text-nf-teal">{i === 0 ? '✓ Feito' : i === 1 ? 'Agora' : '19:00'}</div>
                </div>
              ))}
            </div>

            {/* Adherence Chart */}
            <div className="p-3 rounded-2xl bg-nf-bg-alt border border-nf-border/50">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-nf-text-muted">Adesão semanal</span>
                <span className="text-nf-coral font-bold">92%</span>
              </div>
              <div className="h-1.5 rounded-full bg-nf-border/50 overflow-hidden">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-nf-teal to-nf-coral" />
              </div>
            </div>

            {/* AI Tip */}
            <div className="p-3 rounded-2xl bg-nf-coral/5 border border-nf-coral/20">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-nf-coral" />
                <span className="text-xs font-bold text-nf-coral">Dica da IA</span>
              </div>
              <div className="text-[11px] text-nf-text-muted leading-relaxed">
                Hidrate-se! Meta de 2L hoje. Você já bebeu 1.2L 💧
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notification */}
      <div className="absolute top-12 -right-4 md:-right-12 glass-card rounded-2xl p-3 animate-float shadow-xl max-w-[180px] z-20">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-nf-text">Check-in feito!</span>
        </div>
        <div className="text-[11px] text-nf-text-muted">Maria marcou o almoço às 12:32</div>
      </div>
    </div>
  );
}

function MockupReport() {
  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 glow-teal relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-nf-border/50 pb-4">
        <div>
          <div className="font-bold text-nf-text text-sm">Relatório de Evolução</div>
          <div className="text-xs text-nf-text-muted">Maria Silva • Outubro 2026</div>
        </div>
        <span className="px-3 py-1 rounded-full bg-nf-coral/10 text-nf-coral text-xs font-medium border border-nf-coral/20 flex items-center gap-1">
          <FileText className="w-3 h-3" />
          PDF pronto
        </span>
      </div>

      {/* Chart */}
      <div className="p-4 rounded-2xl bg-nf-bg-alt/60 border border-nf-border/50 mb-4">
        <div className="flex justify-between text-xs mb-3">
          <span className="text-nf-text-muted font-medium">Peso corporal (kg)</span>
          <span className="text-nf-teal font-bold">-3.2 kg ↓</span>
        </div>
        <div className="flex items-end gap-1.5 h-24">
          {[65, 58, 72, 48, 62, 40, 35].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-gradient-to-t from-nf-teal to-nf-coral opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-nf-text-muted mt-2">
          {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'].map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'IMC Atual', value: '22.4', color: 'teal' },
          { label: 'Massa Magra', value: '+1.2kg', color: 'teal' },
          { label: 'Adesão Total', value: '94%', color: 'coral' },
        ].map((m) => (
          <div key={m.label} className="p-3 rounded-xl bg-nf-bg-alt/60 border border-nf-border/50 text-center hover:border-nf-teal/30 transition-colors">
            <div className={`text-lg font-bold ${m.color === 'teal' ? 'text-nf-teal' : 'text-nf-coral'}`}>
              {m.value}
            </div>
            <div className="text-[10px] text-nf-text-muted uppercase tracking-wider mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-nf-teal/10 to-nf-coral/10 border border-nf-teal/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-nf-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-nf-teal" />
        </div>
        <div>
          <div className="text-xs font-bold text-nf-teal mb-1">Insight IA</div>
          <div className="text-xs text-nf-text-muted leading-relaxed">
            Progresso acima da média para o perfil. Manter protocolo atual e reavaliar em 2 semanas.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeatureShowcaseSection() {
  return (
    <section className="relative bg-nf-bg py-24 md:py-36 overflow-hidden">
      {/* Transition divider from HowItWorks */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-nf-border to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-nf-teal/5 rounded-full blur-3xl pointer-events-none" />

      {/* Background decoration */}
      <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-nf-coral/3 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/4 -left-40 w-[400px] h-[400px] bg-nf-teal/3 rounded-full blur-3xl animate-float pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20 scroll-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nf-teal/10 text-nf-teal text-xs font-semibold uppercase tracking-wider mb-4 border border-nf-teal/20">
            Funcionalidades
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-nf-text mb-6">
            Poder clínico na{' '}
            <span className="gradient-text">palma da mão</span>
          </h2>
          <p className="text-lg text-nf-text-muted max-w-2xl mx-auto leading-relaxed">
            Cada detalhe pensado para transformar sua prática e encantar seus pacientes.
          </p>
        </div>

        <div className="space-y-24 md:space-y-32">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="relative">
                {/* Connector line between features */}
                {idx < features.length - 1 && (
                  <div className="absolute left-1/2 -bottom-16 md:-bottom-20 w-px h-16 md:h-20 bg-gradient-to-b from-nf-border to-transparent -translate-x-1/2 z-0" />
                )}

                <div
                  className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                    feature.reversed ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  {/* Text side */}
                  <div className="scroll-fade-up space-y-6">
                    <div
                      className={`inline-flex w-14 h-14 rounded-2xl items-center justify-center ${
                        feature.accent === 'teal'
                          ? 'bg-gradient-to-br from-nf-teal/15 to-nf-teal/5 border border-nf-teal/20 text-nf-teal'
                          : 'bg-gradient-to-br from-nf-coral/15 to-nf-coral/5 border border-nf-coral/20 text-nf-coral'
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-nf-text leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-nf-text-muted leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-3 pt-2">
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              feature.accent === 'teal' ? 'bg-nf-teal/15 text-nf-teal' : 'bg-nf-coral/15 text-nf-coral'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-nf-text-muted">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`inline-flex items-center gap-2 font-semibold group mt-2 ${
                        feature.accent === 'teal' ? 'text-nf-teal' : 'text-nf-coral'
                      }`}
                    >
                      Saiba mais
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Mockup side */}
                  <div className="scroll-blur-in scroll-parallax-y">
                    {feature.mockupType === 'generator' && <MockupGenerator />}
                    {feature.mockupType === 'mobile' && <MockupMobile />}
                    {feature.mockupType === 'report' && <MockupReport />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transition divider to Pricing */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-nf-border to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-nf-coral/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}