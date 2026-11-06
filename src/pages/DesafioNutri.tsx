import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight, Check, ChevronRight, ArrowUpRight,
  Clock, MessageCircle, Heart, Activity, ShieldAlert, Mail
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
/* Brand tokens — NutriFlow SaaS palette · LIGHT surface               */
/* ------------------------------------------------------------------ */
const GREEN = '#518C5B';
const GREEN_DEEP = '#3d7047';
const CORAL = '#C4764A';
const PAPER = '#f7f6f2';     // page background — warm off-white
const SURFACE = '#ffffff';   // raised surface
const SURFACE_2 = '#f1efe9'; // secondary raised surface
const HAIRLINE = '#e4e1d8';  // 1px borders
const INK = '#1c1f24';       // primary text — near-black
const TEXT_MUTED = '#5b616b';
const TEXT_DIM = '#9aa0a8';

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
  const [captureEmail, setCaptureEmail] = useState('');
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => { trackPixel('ViewContent'); }, []);

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureEmail || captureStatus === 'sending' || captureStatus === 'sent') return;
    setCaptureStatus('sending');
    try {
      // Send lead to Supabase edge function or API endpoint
      // For now, store locally and redirect to auth with email pre-filled
      const params = new URLSearchParams({
        mode: 'signup',
        source: 'desafio-nutri',
        email: captureEmail,
        points: String(totalPoints),
        lostMoney: String(metrics.lostMoney),
        lostHours: String(metrics.lostHours),
        desire: metrics.desire,
        captured: 'email-only',
      });
      trackPixel('Lead', { content_type: 'email_capture', value: metrics.lostMoney });
      setCaptureStatus('sent');
      // Optional: also send to backend here via fetch('/api/capture-lead', ...)
      // For immediate effect, redirect after short delay so user sees confirmation
      setTimeout(() => {
        window.location.href = `/auth?${params.toString()}`;
      }, 1200);
    } catch {
      setCaptureStatus('error');
    }
  };

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
      else { setStep(4); trackPixel('ViewContent', { content_type: 'diagnostic_result' }); }
      setIsAnimating(false);
    }, 280);
  };

  const handleStartTest = () => {
    // Only fire StartTrial here; CompleteRegistration fires on actual signup in Auth.tsx
    trackPixel('StartTrial');
    const params = new URLSearchParams({
      mode: 'signup',
      source: 'desafio-nutri',
      points: String(totalPoints),
      lostMoney: String(metrics.lostMoney),
      lostHours: String(metrics.lostHours),
      desire: metrics.desire,
    });
    window.location.href = `/auth?${params.toString()}`;
  };

  const brl = (n: number) => n.toLocaleString('pt-BR');

  /* ================================================================ */
  /* INTRO                                                             */
  /* ================================================================ */
  if (step === 0) {
    return (
      <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
        <div className="mx-auto max-w-5xl px-6 py-10">
          {/* masthead */}
          <header className="flex items-center justify-between border-b pb-6" style={{ borderColor: HAIRLINE }}>
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
              <span className="font-serif text-xl font-semibold tracking-tight" style={{ color: INK }}>NutriFlow</span>
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
              <h1 className="font-serif text-[2.7rem] font-semibold leading-[1.04] tracking-[-0.02em] sm:text-6xl md:text-[4.4rem]" style={{ color: INK }}>
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
                  Descobrir quanto posso recuperar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <span className="text-sm" style={{ color: TEXT_DIM }}>
                  Leva menos de 1 minuto · +2.000 nutricionistas já usaram
                </span>
              </div>
            </motion.div>

            {/* side column — app mockup + metrics */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
              className="flex flex-col gap-6 md:col-span-5"
            >
              {/* CSS-only app mockup — shows the product generating a meal plan */}
              <div className="relative overflow-hidden rounded-2xl border shadow-lg" style={{ borderColor: HAIRLINE, background: SURFACE }}>
                {/* mockup header bar */}
                <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: HAIRLINE, background: SURFACE_2 }}>
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: CORAL }} />
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#e8c94a' }} />
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: GREEN }} />
                  <span className="ml-2 text-[10px] font-medium tracking-wide" style={{ color: TEXT_DIM }}>NutriFlow · Cardápio IA</span>
                </div>
                {/* mockup body — simulated meal plan card */}
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: GREEN }}>Almoço · Terça</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ background: GREEN }}>IA ✓</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Frango grelhado', grams: '150g', kcal: '248 kcal' },
                      { name: 'Arroz integral', grams: '100g', kcal: '124 kcal' },
                      { name: 'Brócolis no vapor', grams: '80g', kcal: '28 kcal' },
                      { name: 'Azeite extra virgem', grams: '5ml', kcal: '45 kcal' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: PAPER }}>
                        <span className="text-sm font-medium" style={{ color: INK }}>{item.name}</span>
                        <div className="flex gap-3 text-xs tabular-nums" style={{ color: TEXT_MUTED }}>
                          <span>{item.grams}</span>
                          <span className="font-semibold" style={{ color: GREEN }}>{item.kcal}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: HAIRLINE }}>
                    <span className="text-xs" style={{ color: TEXT_DIM }}>Total da refeição</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: INK }}>445 kcal · 38g prot</span>
                  </div>
                </div>
              </div>

              {/* metrics strip below mockup */}
              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl" style={{ background: HAIRLINE }}>
                {[
                  { k: '15h', v: '/semana' },
                  { k: 'R$3k', v: '/mês' },
                  { k: '14d', v: 'grátis' },
                ].map((row, i) => (
                  <div key={i} className="flex flex-col items-center justify-center py-3" style={{ background: SURFACE }}>
                    <span className="font-serif text-lg font-semibold tabular-nums" style={{ color: GREEN }}>{row.k}</span>
                    <span className="text-[10px]" style={{ color: TEXT_DIM }}>{row.v}</span>
                  </div>
                ))}
              </div>
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
      <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
        {/* progress rail */}
        <div className="sticky top-0 z-50 border-b backdrop-blur" style={{ borderColor: HAIRLINE, background: 'rgba(247,246,242,0.85)' }}>
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
              <h2 className="font-serif text-2xl font-semibold leading-snug tracking-[-0.01em] sm:text-[2rem]" style={{ color: INK }}>
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
                      <span className="flex-1 text-base font-medium leading-snug" style={{ color: INK }}>
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
                <p className="mt-3 text-lg leading-relaxed" style={{ color: INK }}>
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
  /* RESULT — editorial, asymmetric, light surface, no pricing         */
  /* ================================================================ */
  if (step === 4) {
    return (
      <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
        <div className="mx-auto max-w-5xl px-6 py-10">
          {/* masthead */}
          <header className="flex items-center justify-between border-b pb-6" style={{ borderColor: HAIRLINE }}>
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
              <span className="font-serif text-xl font-semibold tracking-tight" style={{ color: INK }}>NutriFlow</span>
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
            <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl" style={{ color: INK }}>
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
                Equivale a <span className="font-semibold tabular-nums" style={{ color: INK }}>{metrics.lostHours} horas</span> por semana
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
                <p className="mt-4 font-serif text-5xl font-semibold tabular-nums" style={{ color: INK }}>
                  {metrics.retentionLoss}%
                </p>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>
                  Chance estimada de pacientes não renovarem sem acompanhamento digital entre as consultas.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Email capture — saves lead even if user doesn't sign up now */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            className="mt-12 rounded-2xl border p-7 sm:p-9"
            style={{ borderColor: HAIRLINE, background: SURFACE }}
          >
            {captureStatus === 'sent' ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(81,140,91,0.12)' }}>
                  <Check className="h-5 w-5" style={{ color: GREEN }} />
                </div>
                <div>
                  <p className="text-base font-semibold" style={{ color: INK }}>Diagnóstico enviado!</p>
                  <p className="text-sm" style={{ color: TEXT_MUTED }}>Redirecionando para seu cadastro...</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: CORAL }}>
                  Não quer criar conta agora?
                </p>
                <h3 className="mt-3 font-serif text-xl font-semibold leading-snug sm:text-2xl" style={{ color: INK }}>
                  Receba seu diagnóstico por email e continue depois.
                </h3>
                <form onSubmit={handleEmailCapture} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="capture-email" className="text-sm font-medium" style={{ color: TEXT_MUTED }}>
                      Seu melhor email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: TEXT_DIM }} />
                      <Input
                        id="capture-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={captureEmail}
                        onChange={(e) => setCaptureEmail(e.target.value)}
                        required
                        className="h-12 pl-10 rounded-xl border bg-nf-bg-alt/50 focus:border-nf-teal focus:ring-nf-teal/20"
                        style={{ borderColor: HAIRLINE }}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!captureEmail || captureStatus === 'sending'}
                    className="group h-12 gap-2 rounded-xl px-6 text-sm font-semibold text-white transition-colors"
                    style={{ background: captureStatus === 'error' ? CORAL : GREEN }}
                    onMouseEnter={e => { if (captureStatus !== 'error') e.currentTarget.style.background = GREEN_DEEP; }}
                    onMouseLeave={e => { if (captureStatus !== 'error') e.currentTarget.style.background = GREEN; }}
                  >
                    {captureStatus === 'sending' ? 'Enviando...' : captureStatus === 'error' ? 'Tentar novamente' : 'Enviar diagnóstico'}
                    {!captureStatus || captureStatus === 'idle' || captureStatus === 'error' ? (
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    ) : null}
                  </Button>
                </form>
                <p className="mt-3 text-xs" style={{ color: TEXT_DIM }}>
                  Sem spam. Você pode criar sua conta quando quiser.
                </p>
              </>
            )}
          </motion.div>

          {/* product proof + CTA band */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASE, delay: 0.22 }}
            className="mt-6 overflow-hidden rounded-2xl px-8 py-12 sm:px-12"
            style={{ background: GREEN }}
          >
            <div className="grid gap-10 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <h2 className="font-serif text-3xl font-semibold leading-tight tracking-[-0.01em] text-white sm:text-4xl">
                  O NutriFlow faz isso por você.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/85">
                  Cardápios gerados com IA em segundos, app do paciente com lembretes e chat,
                  e gestão completa da clínica. Recupere{' '}
                  <span className="font-semibold text-white tabular-nums">R$ {brl(metrics.lostMoney)}/mês</span>{' '}
                  a partir de hoje.
                </p>
                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Button
                    onClick={handleStartTest}
                    size="lg"
                    className="group h-14 flex-shrink-0 gap-2.5 rounded-xl bg-white px-8 text-base font-semibold transition-transform hover:scale-[1.03]"
                    style={{ color: GREEN_DEEP }}
                  >
                    Começar teste grátis agora
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                  <span className="text-sm text-white/70">
                    14 dias grátis · sem cartão
                  </span>
                </div>
              </div>

              {/* mini mockup — reinforces the product on the result screen */}
              <div className="md:col-span-5">
                <div className="overflow-hidden rounded-xl border border-white/20 shadow-xl" style={{ background: 'rgba(255,255,255,0.95)' }}>
                  <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5" style={{ background: SURFACE_2 }}>
                    <div className="h-2 w-2 rounded-full" style={{ background: CORAL }} />
                    <div className="h-2 w-2 rounded-full" style={{ background: '#e8c94a' }} />
                    <div className="h-2 w-2 rounded-full" style={{ background: GREEN }} />
                    <span className="ml-1.5 text-[9px] font-medium tracking-wide" style={{ color: TEXT_DIM }}>NutriFlow · Paciente</span>
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: GREEN }}>Hoje · Almoço</span>
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ background: GREEN }}>Gerado ✓</span>
                    </div>
                    {[
                      { name: 'Salmão grelhado', detail: '150g · 280 kcal' },
                      { name: 'Quinoa tricolor', detail: '80g · 96 kcal' },
                      { name: 'Mix de folhas verdes', detail: '60g · 12 kcal' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: PAPER }}>
                        <span className="text-xs font-medium" style={{ color: INK }}>{item.name}</span>
                        <span className="text-[10px] tabular-nums" style={{ color: TEXT_MUTED }}>{item.detail}</span>
                      </div>
                    ))}
                    <div className="mt-2.5 flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(81,140,91,0.08)' }}>
                      <MessageCircle className="h-3.5 w-3.5" style={{ color: GREEN }} />
                      <span className="text-[10px] font-medium" style={{ color: GREEN }}>Lembrete enviado ao paciente</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <footer className="mt-16 border-t pt-8 text-sm" style={{ borderColor: HAIRLINE, color: TEXT_DIM }}>
            © {new Date().getFullYear()} NutriFlow · Dúvidas?{' '}
            <a
              href="https://wa.me/5513996205253?text=Ol%C3%A1!%20Fiz%20o%20diagn%C3%B3stico%20e%20quero%20saber%20mais."
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors"
              style={{ color: GREEN }}
              onMouseEnter={e => (e.currentTarget.style.color = GREEN_DEEP)}
              onMouseLeave={e => (e.currentTarget.style.color = GREEN)}
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