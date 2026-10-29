import { Brain, Users, TrendingUp, Zap, ShieldCheck, Clock, ArrowRight, Sparkles, Video, FlaskConical, Calculator, Activity, Check } from 'lucide-react';

export default function ValuePropsSection() {
  return (
    <section id="recursos" className="relative bg-nf-bg py-24 md:py-32 overflow-hidden">
      {/* Animated transition divider from Hero */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-nf-bg-alt to-nf-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-16 md:mb-24 max-w-3xl scroll-fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nf-teal/10 text-nf-teal text-xs font-bold uppercase tracking-widest mb-6 border border-nf-teal/20">
            <Sparkles className="w-3 h-3" />
            Plataforma Completa
          </span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-nf-text leading-[1.1] mb-6">
            Tudo que você precisa.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nf-teal to-nf-coral">
              Nada que não precisa.
            </span>
          </h2>
          <p className="text-xl text-nf-text-muted leading-relaxed">
            Substitua 5 ferramentas diferentes por uma única plataforma inteligente desenhada para nutricionistas modernos.
          </p>
        </div>

        {/* BENTO GRID LAYOUT - Dense, no empty space */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">

          {/* Card 1: IA Generativa (Large - Spans 2 cols) */}
          <div className="md:col-span-2 lg:col-span-2 row-span-2 glass-card rounded-3xl p-8 md:p-10 hover-lift card-shine group relative overflow-hidden scroll-scale-in scroll-stagger-1">
            <div className="absolute top-0 right-0 w-64 h-64 bg-nf-teal/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-nf-teal/20 transition-colors duration-700" />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nf-teal to-nf-teal/70 flex items-center justify-center text-white shadow-lg shadow-nf-teal/25 mb-8">
                  <Brain className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-3xl font-bold text-nf-text mb-4">IA Generativa Clínica</h3>
                <p className="text-lg text-nf-text-muted leading-relaxed max-w-md">
                  Nossa IA analisa anamnese, exames e preferências para gerar cardápios completos em segundos. Não é template, é nutrição de precisão personalizada.
                </p>
              </div>

              {/* Visual Demo inside card */}
              <div className="mt-8 p-4 rounded-2xl bg-nf-bg-alt/50 border border-nf-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-2 w-2 rounded-full bg-nf-teal animate-pulse" />
                  <span className="text-xs font-semibold text-nf-teal uppercase tracking-wide">Gerando agora...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-nf-border/50 rounded-full overflow-hidden">
                    <div className="h-full bg-nf-teal w-3/4 animate-shimmer relative">
                      <div className="absolute inset-0 bg-card/30 animate-shimmer" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-nf-text-muted">
                    <span>Análise nutricional</span>
                    <span>78%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Gestão Unificada (Tall) */}
          <div className="lg:col-span-1 row-span-2 glass-card rounded-3xl p-8 hover-lift card-shine group scroll-scale-in scroll-stagger-2">
            <div className="w-12 h-12 rounded-xl bg-nf-coral/10 flex items-center justify-center text-nf-coral mb-6 border border-nf-coral/20">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-nf-text mb-3">Gestão Unificada</h3>
            <p className="text-nf-text-muted leading-relaxed mb-6">
              Agenda, prontuário, evolução e financeiro em um só lugar. Fim das abas infinitas.
            </p>

            <ul className="space-y-3 mt-auto">
              {[
                { icon: Clock, text: 'Agenda inteligente' },
                { icon: ShieldCheck, text: 'Prontuário seguro' },
                { icon: TrendingUp, text: 'Evolução automática' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-nf-text-muted">
                  <item.icon className="w-4 h-4 text-nf-coral" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Stat Highlight (Small) */}
          <div className="glass-card rounded-3xl p-8 flex flex-col justify-center items-center text-center hover-lift scroll-scale-in scroll-stagger-3 group">
            <Zap className="w-8 h-8 text-nf-teal mb-4 group-hover:scale-110 transition-transform" />
            <div className="text-4xl font-bold text-nf-text mb-1">&lt; 30s</div>
            <div className="text-sm text-nf-text-muted font-medium">Por cardápio gerado</div>
          </div>

          {/* Card 4: Analytics (Wide) */}
          <div className="md:col-span-2 lg:col-span-1 glass-card rounded-3xl p-8 hover-lift card-shine group scroll-scale-in scroll-stagger-4 relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-nf-teal/10 rounded-full blur-2xl group-hover:bg-nf-teal/20 transition-colors" />

             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-lg bg-nf-teal/10 flex items-center justify-center text-nf-teal">
                   <TrendingUp className="w-5 h-5" />
                 </div>
                 <h3 className="font-serif text-xl font-bold text-nf-text">Resultados Reais</h3>
               </div>
               <p className="text-sm text-nf-text-muted leading-relaxed mb-4">
                 Dashboards visuais que mostram a evolução do paciente semana a semana. Dados que fidelizam.
               </p>

               {/* Mini Chart Visualization */}
               <div className="flex items-end gap-1 h-12 mt-auto">
                 {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                   <div
                    key={i}
                    className="flex-1 bg-nf-teal/20 rounded-t-sm hover:bg-nf-teal transition-colors duration-300"
                    style={{ height: `${h}%` }}
                   />
                 ))}
               </div>
             </div>
          </div>

          {/* Card 5: Videochamadas integradas */}
          <div className="md:col-span-1 lg:col-span-1 glass-card rounded-3xl p-8 flex flex-col justify-between hover-lift card-shine scroll-scale-in scroll-stagger-4 relative overflow-hidden group border-nf-coral/30">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-nf-coral/10 rounded-full blur-2xl group-hover:bg-nf-coral/20 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-nf-coral/10 flex items-center justify-center text-nf-coral mb-6 border border-nf-coral/20">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-nf-text mb-3">Teleconsulta Nativa</h3>
              <p className="text-nf-text-muted text-sm leading-relaxed">
                Videochamada integrada direto na agenda. Um clique e a sala abre — sem links externos, sem apps extras.
              </p>
            </div>
          </div>

          {/* Card 6: Exames com upload pelo paciente */}
          <div className="md:col-span-2 lg:col-span-2 glass-card rounded-3xl p-8 hover-lift card-shine group scroll-scale-in scroll-stagger-5 relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-nf-coral/10 rounded-full blur-3xl group-hover:bg-nf-coral/20 transition-colors" />
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-12 h-12 rounded-xl bg-nf-coral/10 flex items-center justify-center text-nf-coral mb-5 border border-nf-coral/20">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-nf-text mb-3">60+ Exames Laboratoriais</h3>
                <p className="text-nf-text-muted text-sm leading-relaxed mb-4">
                  Glicemia, colesterol, tireoide, vitaminas, hormônios e muito mais. O paciente faz upload do PDF ou foto do exame direto pelo app — você vê na hora, sem precisar de consulta.
                </p>
                <ul className="space-y-2">
                  {['Upload de PDF e imagem pelo paciente', 'Valores fora da referência em destaque', 'Histórico completo por data'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-nf-text-muted">
                      <Check className="w-3.5 h-3.5 text-nf-coral flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Mini mockup */}
              <div className="space-y-2">
                {[
                  { label: 'Glicemia (Jejum)', value: '112 mg/dL', abnormal: true },
                  { label: 'Vitamina D', value: '28 ng/mL', abnormal: true },
                  { label: 'TSH', value: '2.1 mUI/L', abnormal: false },
                ].map((exam, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${exam.abnormal ? 'border-red-500/30 bg-red-500/5' : 'border-nf-border/50 bg-nf-bg-alt/50'}`}>
                    <span className="text-xs font-medium text-nf-text">{exam.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold ${exam.abnormal ? 'text-red-400' : 'text-nf-teal'}`}>{exam.value}</span>
                      {exam.abnormal && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">ALTERADO</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 7: Cálculos nutricionais automáticos */}
          <div className="md:col-span-1 lg:col-span-1 glass-card rounded-3xl p-8 flex flex-col justify-between hover-lift card-shine scroll-scale-in scroll-stagger-5 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-nf-teal/10 rounded-full blur-2xl group-hover:bg-nf-teal/20 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-nf-teal/10 flex items-center justify-center text-nf-teal mb-5 border border-nf-teal/20">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-nf-text mb-3">TMB · GET · VET Automáticos</h3>
              <p className="text-nf-text-muted text-xs leading-relaxed mb-4">
                Preencha peso, altura e objetivo — os cálculos nutricionais aparecem sozinhos. Mifflin-St Jeor + dobras cutâneas Jackson-Pollock.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[{ l: 'TMB', v: '1.420' }, { l: 'GET', v: '2.201' }, { l: 'VET', v: '1.701' }].map((m, i) => (
                  <div key={i} className="p-2 rounded-lg bg-nf-bg-alt/60 border border-nf-border/40 text-center">
                    <div className="text-[9px] text-nf-text-muted uppercase tracking-wide">{m.l}</div>
                    <div className="text-sm font-bold text-nf-teal">{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Transition Divider to Next Section */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-nf-border to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-nf-teal/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}