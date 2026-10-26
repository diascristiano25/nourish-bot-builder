import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Check, ChevronRight, TrendingDown, ArrowUpRight,
  Clock, MessageCircle, Heart, DollarSign, Star, Activity, ShieldAlert
} from 'lucide-react';
import logoImg from '@/assets/logo-nutriflow.png';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/* Pixel tracking                                                      */
/* ------------------------------------------------------------------ */
function trackPixel(event: string, params?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', event, params);
    }
  } catch { /* silent fail */ }
}

/* ------------------------------------------------------------------ */
/* Brand tokens — NutriFlow SaaS palette                               */
/* ------------------------------------------------------------------ */
const GREEN = '#518C5B';
const GREEN_DEEP = '#3d7047';
const CORAL = '#C4764A';
const INK = '#0c0e12';        // page background — near-black, slightly warm
const SURFACE = '#14171d';    // raised surface
const SURFACE_2 = '#1b1f27';  // secondary raised surface
const HAIRLINE = '#262b35';   // 1px borders
const TEXT = '#eef1f4';
const TEXT_MUTED = '#9aa3b0';
const TEXT_DIM = '#6b7280';

/* One authored entrance — exponential ease-out, reused everywhere */
const EASE = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ */
/* Quiz — Diagnóstico de Potencial Perdido (dor / desejo)              */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    id: 1,
    category: 'Sua Rotina',
    question: 'Sendo bem sincero(a): quantas horas por semana você perde montando cardápios manualmente ou ajustando planilhas?',
    options: [
      { id: 'a', text: 'Menos de 5h — sou organizado(a)', points: 10, lostHours: 5, lostMoney: 750 },
      { id: 'b', text: 'Entre 5h e 10h — é cansativo', points: 15, lostHours: 10, lostMoney: 1500 },
      { id: 'c', text: 'Mais de 10h — vivo apagando incêndio', points: 20, lostHours: 15, lostMoney: 2250 },
      { id: 'd', text: 'Perdi a conta… é o meu dia todo', points: 25, lostHours: 20, lostMoney: 3000 },
    ],
    insight: 'Cada hora em tarefa repetitiva é uma hora que você não está atendendo (R$ 150/h) nem descansando. Automatizar isso com IA libera sua agenda imediatamente.',
  },
  {
    id: 2,
    category: 'Retenção de Pacientes',
    question: 'Quando seu paciente sai da consulta, como você garante que ele vai seguir o plano até o retorno?',
    options: [
      { id: 'a', text: 'Entrego o PDF e torço pelo melhor', points: 10, retentionLoss: 40 },
      { id: 'b', text: 'Mando mensagem no WhatsApp, na mão', points: 15, retentionLoss: 25 },
      { id: 'c', text: 'Ele tem um app com lembretes e chat', points: 25, retentionLoss: 5 },
      { id: 'd', text: 'Não faço nada — muitos não voltam', points: 5, retentionLoss: 60 },
    ],
    insight: 'Sem acompanhamento digital (app + lembretes), a adesão ao tratamento cai até 60%. Paciente que não vê resultado não renova o pacote. O app do paciente é a sua máquina de retenção.',
  },
  {
    id: 3,
    category: 'Seu Futuro',
    question: 'Se o NutriFlow te devolvesse 10 horas livres por semana a partir de amanhã, o que você faria com esse tempo?',
    options: [
      { id: 'a', text: 'Atenderia mais pacientes — mais lucro', points: 20, desire: 'money' },
      { id: 'b', text: 'Ficaria com minha família / descansaria', points: 20, desire: 'time' },
      { id: 'c', text: 'Estudaria e me especializaria mais', points: 20, desire: 'growth' },
      { id: 'd', text: 'Focaria em marketing para crescer', points: 20, desire: 'growth' },
    ],
    insight: 'Essa é a verdadeira promessa do NutriFlow: não é só um software, é liberdade. Seja para ganhar mais ou viver melhor, a tecnologia deve trabalhar para você — não o contrário.',
  },
];

const optionGlyph: Record<string, typeof Clock> = {
  1: Clock, 2: MessageCircle, 3: Heart,
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function DesafioNutri() {
  const [step, setStep] = useState(0); // 0 intro · 1–3 quiz · 4 result
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [metrics, setMetrics] = useState({ lostHours: 0, lostMoney: 0, retentionLoss: 0, desire: '' });

  useEffect(() => { trackPixel('ViewContent'); }, []);

  const handleAnswer = (questionId: number, optionId: string, points: number, optionData: any) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setTotalPoints(prev => prev + points);
    setMetrics(prev => ({
      lostHours: prev.lostHours + (optionData.lostHours || 0),
      lostMoney: prev.lostMoney + (optionData.lostMoney || 0),
      retentionLoss: optionData.retentionLoss !== undefined ? optionData.retentionLoss : prev.retentionLoss,
      desire: optionData.desire || prev.desire,
    }));
    setTimeout(() => { setShowInsight(true); setIsAnimating(false); }, 380);
  };

  const handleNextQuestion = () => {
    setIsAnimating(true);
    setShowInsight(false);
    setTimeout(() => {
      if (step < 3) setStep(prev => prev + 1);
      else { setStep(4); trackPixel('Lead'); }
      setIsAnimating(false);
    }, 280);
  };

  const handleStartTest = () => {
    trackPixel('StartTrial');
    trackPixel('CompleteRegistration');
    window.location.href = '/auth';
  };

  const brl = (n: number) => n.toLocaleString('pt-BR');

  /* ================================================================ */
  /* INTRO                                                             */
  /* ================================================================ */
  if (step === 0) {
    return (
      <div className="min-h-screen text-white" style={{ background: INK }}>
        <div className="mx-auto max-w-5xl px-6 py-10">
          {/* masthead */}
          <header className="flex items-center justify-between border-b pb-6" style={{ borderColor: HAIRLINE }}>
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
              <span className="font-serif text-xl font-semibold tracking-tight">NutriFlow</span>
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: TEXT_DIM }}>
              Diagnóstico gratuito
            </span>
          </header>

          {/* hero — editorial, left-aligned, asymmetric */}
          <div className="grid gap-12 pt-20 pb-24 md:grid-cols-12 md:pt-28">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, ease: EASE }}
              className="md:col-span-7"
            >
              <p className="mb-6 text-sm font-medium" style={{ color: CORAL }}>
                Para nutricionistas que querem parar de perder tempo
              </p>
              <h1 className="font-serif text-[2.7rem] font-semibold leading-[1.04] tracking-[-0.02em] sm:text-6xl md:text-[4.4rem]">
                Quanto da sua semana
                <br />
                some montando
                <br />
                <span style={{ color: GREEN }}>cardápio na mão?</span>
              </h1>
              <p className="mt-8 max-w-md text-lg leading-relaxed" style={{ color: TEXT_MUTED }}>
                Três perguntas rápidas sobre a sua rotina. No final, um número honesto:
                quantas horas e quantos reais você pode recuperar com o NutriFlow.
              </p>

              <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <Button
                  onClick={() => setStep(1)}
                  size="lg"
                  className="group h-14 gap-2.5 rounded-xl px-8 text-base font-semibold text-white transition-colors"
                  style={{ background: GREEN }}
                  onMouseEnter={e => (e.currentTarget.style.background = GREEN_DEEP)}
                  onMouseLeave={e => (e.currentTarget.style.background = GREEN)}
                >
                  Começar diagnóstico
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <span className="text-sm" style={{ color: TEXT_DIM }}>
                  Leva menos de 1 minuto
                </span>
              </div>
            </motion.div>

            {/* side column — quiet proof, not a card grid */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
              className="flex flex-col justify-end gap-px overflow-hidden rounded-2xl md:col-span-5"
              style={{ background: HAIRLINE }}
            >
              {[
                { k: '15h', v: 'economizadas por semana, em média' },
                { k: 'R$ 3 mil', v: 'deixados na mesa por mês é comum' },
                { k: '14 dias', v: 'grátis, sem cartão de crédito' },
              ].map((row, i) => (
                <div key={i} className="flex items-baseline justify-between gap-4 px-6 py-5" style={{ background: SURFACE }}>
                  <span className="font-serif text-2xl font-semibold tabular-nums" style={{ color: TEXT }}>{row.k}</span>
                  <span className="text-right text-sm leading-snug" style={{ color: TEXT_MUTED }}>{row.v}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /* QUIZ                                                              */
  /* ================================================================ */
  if (step >= 1 && step <= 3) {
    const q = quizQuestions[step - 1];
    const Glyph = optionGlyph[q.id] || Activity;
    const answeredId = answers[q.id];
    const earned = q.options.find(o => o.id === answeredId)?.points || 0;

    return (
      <div className="min-h-screen text-white" style={{ background: INK }}>
        {/* progress rail */}
        <div className="sticky top-0 z-50 border-b backdrop-blur" style={{ borderColor: HAIRLINE, background: 'rgba(12,14,18,0.85)' }}>
          <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
            <span className="text-xs font-medium tabular-nums" style={{ color: TEXT_DIM }}>
              {String(step).padStart(2, '0')} <span style={{ color: HAIRLINE }}>/</span> 03
            </span>
            <div className="h-px flex-1" style={{ background: HAIRLINE }}>
              <div className="h-px transition-all duration-500" style={{ width: `${(step / 3) * 100}%`, background: GREEN }} />
            </div>
            <span className="text-xs font-medium tabular-nums" style={{ color: TEXT_MUTED }}>
              {totalPoints} pts
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-16 pt-14">
          {!showInsight ? (
            <motion.div key={`q-${step}`} {...fadeUp} transition={{ duration: 0.45, ease: EASE }}>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: CORAL }}>
                {q.category}
              </p>
              <h2 className="font-serif text-2xl font-semibold leading-snug tracking-[-0.01em] sm:text-[2rem]">
                {q.question}
              </h2>

              <div className="mt-9 space-y-3">
                {q.options.map((option, i) => {
                  const selected = answeredId === option.id;
                  const dimmed = !!answeredId && !selected;
                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * i, duration: 0.4, ease: EASE }}
                      onClick={() => handleAnswer(q.id, option.id, option.points, option)}
                      disabled={!!answeredId || isAnimating}
                      className="group flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-200"
                      style={{
                        borderColor: selected ? GREEN : HAIRLINE,
                        background: selected ? 'rgba(81,140,91,0.10)' : SURFACE,
                        opacity: dimmed ? 0.45 : 1,
                      }}
                    >
                      <span
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-colors"
                        style={{
                          borderColor: selected ? GREEN : HAIRLINE,
                          background: selected ? GREEN : 'transparent',
                        }}
                      >
                        {selected
                          ? <Check className="h-4 w-4 text-white" />
                          : <Glyph className="h-4 w-4" style={{ color: TEXT_DIM }} />}
                      </span>
                      <span className="flex-1 text-base font-medium leading-snug" style={{ color: TEXT }}>
                        {option.text}
                      </span>
                      {!answeredId && (
                        <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: TEXT_DIM }} />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key={`i-${step}`} {...fadeUp} transition={{ duration: 0.45, ease: EASE }}>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: GREEN }}>
                <Check className="h-4 w-4" />
                Resposta registrada · +{earned} pts
              </div>

              <div className="mt-6 rounded-2xl border p-7" style={{ borderColor: HAIRLINE, background: SURFACE }}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: CORAL }}>
                  Você sabia?
                </p>
                <p className="mt-3 text-lg leading-relaxed" style={{ color: TEXT }}>
                  {q.insight}
                </p>
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleNextQuestion}
                  size="lg"
                  className="group h-14 gap-2.5 rounded-xl px-8 text-base font-semibold text-white transition-colors"
                  style={{ background: GREEN }}
                  onMouseEnter={e => (e.currentTarget.style.background = GREEN_DEEP)}
                  onMouseLeave={e => (e.currentTarget.style.background = GREEN)}
                >
                  {step < 3 ? 'Próxima pergunta' : 'Ver meu resultado'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /* RESULT — editorial, asymmetric, no pastel metric cards            */
  /* ================================================================ */
  if (step === 4) {
    return (
      <div className="min-h-screen text-white" style={{ background: INK }}>
        <div className="mx-auto max-w-5xl px-6 py-10">
          {/* masthead */}
          <header className="flex items-center justify-between border-b pb-6" style={{ borderColor: HAIRLINE }}>
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
              <span className="font-serif text-xl font-semibold tracking-tight">NutriFlow</span>
            </div>
            <span className="text-xs font-medium tabular-nums uppercase tracking-[0.18em]" style={{ color: TEXT_DIM }}>
              Seu resultado · {totalPoints} pts
            </span>
          </header>

          {/* headline row */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASE }}
            className="max-w-2xl pt-16"
          >
            <p className="mb-5 text-sm font-medium" style={{ color: CORAL }}>
              Diagnóstico concluído
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
              Este é o custo silencioso
              <br />
              da sua clínica hoje.
            </h1>
          </motion.div>

          {/* THE number — big editorial figure, asymmetric two-column */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="mt-14 grid gap-10 border-t pt-12 md:grid-cols-12"
            style={{ borderColor: HAIRLINE }}
          >
            <div className="md:col-span-7">
              <p className="text-sm font-medium" style={{ color: TEXT_MUTED }}>
                Potencial deixado na mesa, por mês
              </p>
              <p className="mt-3 font-serif font-semibold leading-none tracking-[-0.03em] tabular-nums" style={{ color: GREEN, fontSize: 'clamp(4rem, 12vw, 8.5rem)' }}>
                R$ {brl(metrics.lostMoney)}
              </p>
              <p className="mt-5 max-w-md text-base leading-relaxed" style={{ color: TEXT_MUTED }}>
                Equivale a <span className="font-semibold tabular-nums" style={{ color: TEXT }}>{metrics.lostHours} horas</span> por semana
                gastas em tarefas que a IA do NutriFlow faz em segundos — tempo que poderia virar atendimento, estudo ou descanso.
              </p>
            </div>

            {/* secondary metric — quiet, right-aligned, not a twin card */}
            <div className="flex flex-col justify-end md:col-span-5">
              <div className="rounded-2xl border p-7" style={{ borderColor: HAIRLINE, background: SURFACE }}>
                <div className="flex items-center gap-2.5" style={{ color: CORAL }}>
                  <ShieldAlert className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em]">Risco de evasão</span>
                </div>
                <p className="mt-4 font-serif text-5xl font-semibold tabular-nums" style={{ color: TEXT }}>
                  {metrics.retentionLoss}%
                </p>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>
                  Chance estimada de pacientes não renovarem sem acompanhamento digital entre as consultas.
                </p>
              </div>
            </div>
          </motion.div>

          {/* recovery band — solid green, single CTA, no gradient */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
            className="mt-12 overflow-hidden rounded-2xl px-8 py-12 sm:px-12"
            style={{ background: GREEN }}
          >
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <h2 className="font-serif text-3xl font-semibold leading-tight tracking-[-0.01em] text-white sm:text-4xl">
                  Vamos recuperar esse tempo?
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/85">
                  Cardápios automáticos, um app que fideliza o paciente e gestão organizada.
                  Comece hoje e recupere <span className="font-semibold text-white tabular-nums">R$ {brl(metrics.lostMoney)}/mês</span>.
                </p>
              </div>
              <Button
                onClick={handleStartTest}
                size="lg"
                className="group h-14 flex-shrink-0 gap-2.5 rounded-xl bg-white px-8 text-base font-semibold transition-transform hover:scale-[1.03]"
                style={{ color: GREEN_DEEP }}
              >
                Ativar meus 14 dias grátis
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </div>
            <p className="mt-6 text-sm text-white/70">
              Sem cartão de crédito · cancele quando quiser
            </p>
          </motion.div>

          {/* pricing — restrained table-like row, not three glowing cards */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASE, delay: 0.26 }}
            className="mt-16"
          >
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: TEXT_DIM }}>
              Após o teste · preços de lançamento
            </p>
            <div className="overflow-hidden rounded-2xl border" style={{ borderColor: HAIRLINE }}>
              {[
                { name: 'Starter', price: '39,90', note: 'Até 20 pacientes · cardápios com IA', popular: false },
                { name: 'Pro', price: '69,90', note: 'Até 100 pacientes · IA avançada + agendamento', popular: true },
                { name: 'Enterprise', price: '109,90', note: 'Pacientes ilimitados · API + white-label', popular: false },
              ].map((plan, i) => (
                <div
                  key={plan.name}
                  className="flex items-center justify-between gap-4 px-6 py-5"
                  style={{ background: plan.popular ? 'rgba(81,140,91,0.08)' : i % 2 ? SURFACE : SURFACE_2, borderTop: i ? `1px solid ${HAIRLINE}` : 'none' }}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-serif text-lg font-semibold" style={{ color: TEXT }}>{plan.name}</span>
                    {plan.popular && (
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: GREEN }}>
                        Mais escolhido
                      </span>
                    )}
                    <span className="hidden text-sm sm:inline" style={{ color: TEXT_DIM }}>{plan.note}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm" style={{ color: TEXT_MUTED }}>R$</span>
                    <span className="font-serif text-2xl font-semibold tabular-nums" style={{ color: plan.popular ? GREEN : TEXT }}>{plan.price}</span>
                    <span className="text-xs" style={{ color: TEXT_DIM }}>/mês</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <footer className="mt-16 border-t pt-8 text-sm" style={{ borderColor: HAIRLINE, color: TEXT_DIM }}>
            © {new Date().getFullYear()} NutriFlow · Dúvidas?{' '}
            <a
              href="https://wa.me/5513996205253?text=Ol%C3%A1!%20Fiz%20o%20diagn%C3%B3stico%20e%20quero%20saber%20mais."
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors hover:text-white"
              style={{ color: GREEN }}
            >
              Fale conosco no WhatsApp
            </a>
          </footer>
        </div>
      </div>
    );
  }

  return null;
}