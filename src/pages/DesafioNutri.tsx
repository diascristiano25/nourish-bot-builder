import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Check, ChevronRight,
  Clock, MessageCircle, Heart, Activity, Sparkles, Smartphone, Users,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import logoImg from '@/assets/logo-nutriflow.png';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/* Pixel tracking                                                      */
/*  - Lead: o diagnóstico foi concluído (resultado na tela)            */
/*  - CompleteRegistration / StartTrial: disparam em Auth.tsx, quando  */
/*    a conta é criada de verdade                                      */
/* ------------------------------------------------------------------ */
function fb(kind: 'track' | 'trackCustom', event: string, params?: Record<string, unknown>) {
  try {
    const f = typeof window !== 'undefined' ? (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq : undefined;
    if (f) f(kind, event, params);
  } catch { /* silent fail */ }
}

/* ------------------------------------------------------------------ */
/* Brand tokens — NutriFlow SaaS palette · LIGHT surface               */
/* ------------------------------------------------------------------ */
const GREEN = '#518C5B';
const GREEN_DEEP = '#3d7047';
const CORAL = '#C4764A';
const PAPER = '#f7f6f2';
const SURFACE = '#ffffff';
const SURFACE_2 = '#f1efe9';
const HAIRLINE = '#e4e1d8';
const INK = '#1c1f24';
const TEXT_MUTED = '#5b616b';
const TEXT_DIM = '#9aa0a8';

const EASE = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

const HOURLY_RATE = 150;      // R$ por hora de atendimento, usado na estimativa
const SHARE_TO_CARE = 0.5;    // só metade das horas liberadas vira atendimento (estimativa conservadora)

/* ------------------------------------------------------------------ */
/* Quiz — 3 perguntas, uma toque cada (avança sozinho)                  */
/* ------------------------------------------------------------------ */
type QuizOption = { id: string; text: string; lostHours?: number };
type QuizQuestion = { id: number; category: string; question: string; options: QuizOption[] };

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    category: 'Sua rotina',
    question: 'Quantas horas por semana você gasta montando cardápios ou ajustando planilhas?',
    options: [
      { id: 'a', text: 'Menos de 5 horas', lostHours: 5 },
      { id: 'b', text: 'Entre 5 e 10 horas', lostHours: 10 },
      { id: 'c', text: 'Mais de 10 horas', lostHours: 15 },
      { id: 'd', text: 'Perdi a conta… é o meu dia todo', lostHours: 20 },
    ],
  },
  {
    id: 2,
    category: 'Acompanhamento',
    question: 'Depois da consulta, como o paciente recebe e segue o plano?',
    options: [
      { id: 'a', text: 'Entrego um PDF' },
      { id: 'b', text: 'Mando pelo WhatsApp, na mão' },
      { id: 'c', text: 'Ele tem um app com lembretes' },
      { id: 'd', text: 'Não tenho um processo fixo' },
    ],
  },
  {
    id: 3,
    category: 'Seu futuro',
    question: 'Se você ganhasse 10 horas livres por semana, o que faria com esse tempo?',
    options: [
      { id: 'a', text: 'Atenderia mais pacientes' },
      { id: 'b', text: 'Descansaria e ficaria com a família' },
      { id: 'c', text: 'Estudaria e me especializaria' },
      { id: 'd', text: 'Investiria em marketing' },
    ],
  },
];

const optionGlyph: Record<number, typeof Clock> = { 1: Clock, 2: MessageCircle, 3: Heart };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Mantém só dígitos e aplica máscara (DD) 9XXXX-XXXX */
function maskPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const SIGNUP_UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function DesafioNutri() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 intro · 1–3 quiz · 4 resultado
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [lostHours, setLostHours] = useState(0);
  const leadFired = useRef(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadError, setLeadError] = useState<string | null>(null);

  useEffect(() => { fb('track', 'ViewContent'); }, []);

  const brl = (n: number) => n.toLocaleString('pt-BR');

  const handleStart = () => {
    fb('trackCustom', 'QuizStart');
    setStep(1);
  };

  const handleAnswer = (option: QuizOption) => {
    if (locked) return;
    setLocked(true);
    setSelected(option.id);
    const nextHours = lostHours + (option.lostHours ?? 0);
    setLostHours(nextHours);
    window.setTimeout(() => {
      setSelected(null);
      setLocked(false);
      if (step < 3) {
        setStep(step + 1);
      } else {
        setStep(4);
        if (!leadFired.current) {
          leadFired.current = true;
          fb('track', 'Lead', { content_name: 'diagnostico_desafio_nutri' });
        }
      }
    }, 380);
  };

  // Clicar em "Criar minha conta grátis" abre o formulário de e-mail + WhatsApp
  const handleSignup = () => {
    fb('trackCustom', 'SignupClick', { source: 'desafio-nutri' });
    setLeadError(null);
    setLeadOpen(true);
  };

  // Depois de preencher (obrigatório), segue para /auth com e-mail e telefone já preenchidos
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = leadEmail.trim();
    const phoneDigits = leadPhone.replace(/\D/g, '');
    if (!EMAIL_RE.test(email)) {
      setLeadError('Digite um e-mail válido.');
      return;
    }
    if (phoneDigits.length < 10) {
      setLeadError('Digite seu WhatsApp com DDD.');
      return;
    }
    const current = new URLSearchParams(window.location.search);
    const out = new URLSearchParams({
      mode: 'signup',
      source: 'desafio-nutri',
      email,
      phone: leadPhone,
    });
    SIGNUP_UTMS.forEach((k) => {
      const v = current.get(k);
      if (v) out.set(k, v);
    });
    navigate(`/auth?${out.toString()}`);
  };

  const hoursPerMonth = lostHours * 4;                                   // mês = 4 semanas
  const recoverable = Math.round(hoursPerMonth * SHARE_TO_CARE * HOURLY_RATE);

  const Masthead = ({ right }: { right: string }) => (
    <header className="flex items-center justify-between border-b pb-5" style={{ borderColor: HAIRLINE }}>
      <div className="flex items-center gap-2.5">
        <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
        <span className="font-serif text-xl font-semibold tracking-tight" style={{ color: INK }}>NutriFlow</span>
      </div>
      <span className="text-[11px] font-medium uppercase tracking-[0.16em]" style={{ color: TEXT_DIM }}>{right}</span>
    </header>
  );

  /* ================================================================ */
  /* INTRO                                                             */
  /* ================================================================ */
  if (step === 0) {
    return (
      <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Masthead right="Diagnóstico grátis" />

          <div className="grid gap-10 pt-10 pb-16 md:grid-cols-12 md:pt-20 md:pb-24">
            <motion.div {...fadeUp} transition={{ duration: 0.6, ease: EASE }} className="md:col-span-7">
              <p className="mb-4 text-sm font-medium" style={{ color: CORAL }}>
                Para nutricionistas que querem parar de perder tempo
              </p>
              <h1 className="font-serif text-[2.4rem] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-6xl md:text-[4.2rem]" style={{ color: INK }}>
                Quanto da sua semana some montando
                {' '}<span style={{ color: GREEN }}>cardápio na mão?</span>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed" style={{ color: TEXT_MUTED }}>
                Responda 3 perguntas rápidas e veja uma estimativa de quantas horas e quantos reais você pode recuperar com o NutriFlow.
              </p>

              <div className="mt-8 flex flex-col items-start gap-4">
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="group h-14 w-full gap-2.5 rounded-xl px-8 text-base font-semibold text-white transition-colors sm:w-auto"
                  style={{ background: GREEN }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = GREEN_DEEP)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
                >
                  Fazer o diagnóstico grátis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <span className="text-sm" style={{ color: TEXT_DIM }}>
                  Leva menos de 1 minuto · Sem cadastro para começar
                </span>
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, ease: EASE, delay: 0.1 }} className="flex flex-col gap-5 md:col-span-5">
              {/* mockup do produto: o plano alimentar gerado pela IA */}
              <div className="relative overflow-hidden rounded-2xl border shadow-lg" style={{ borderColor: HAIRLINE, background: SURFACE }}>
                <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: HAIRLINE, background: SURFACE_2 }}>
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: CORAL }} />
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#e8c94a' }} />
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: GREEN }} />
                  <span className="ml-2 text-[10px] font-medium tracking-wide" style={{ color: TEXT_DIM }}>NutriFlow · Cardápio IA</span>
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: GREEN }}>Almoço · Terça</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ background: GREEN }}>IA</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Frango grelhado', grams: '150g', kcal: '248 kcal' },
                      { name: 'Arroz integral', grams: '100g', kcal: '124 kcal' },
                      { name: 'Brócolis no vapor', grams: '80g', kcal: '28 kcal' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: PAPER }}>
                        <span className="text-sm font-medium" style={{ color: INK }}>{item.name}</span>
                        <div className="flex gap-3 text-xs tabular-nums" style={{ color: TEXT_MUTED }}>
                          <span>{item.grams}</span>
                          <span className="font-semibold" style={{ color: GREEN }}>{item.kcal}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl" style={{ background: HAIRLINE }}>
                {[
                  { icon: Sparkles, label: 'Cardápio por IA' },
                  { icon: Smartphone, label: 'App do paciente' },
                  { icon: Check, label: '14 dias grátis' },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col items-center justify-center gap-1 py-3" style={{ background: SURFACE }}>
                    <row.icon className="h-4 w-4" style={{ color: GREEN }} />
                    <span className="text-[11px] font-medium" style={{ color: TEXT_MUTED }}>{row.label}</span>
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

    return (
      <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
        <div className="sticky top-0 z-50 border-b backdrop-blur" style={{ borderColor: HAIRLINE, background: 'rgba(247,246,242,0.88)' }}>
          <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
            <span className="text-xs font-medium tabular-nums" style={{ color: TEXT_DIM }}>
              {String(step).padStart(2, '0')} <span style={{ color: HAIRLINE }}>/</span> 03
            </span>
            <div className="h-1 flex-1 rounded-full" style={{ background: HAIRLINE }}>
              <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%`, background: GREEN }} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-16 pt-10">
          <motion.div key={`q-${step}`} {...fadeUp} transition={{ duration: 0.4, ease: EASE }}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: CORAL }}>{q.category}</p>
            <h2 className="font-serif text-2xl font-semibold leading-snug tracking-[-0.01em] sm:text-[2rem]" style={{ color: INK }}>
              {q.question}
            </h2>

            <div className="mt-8 space-y-3">
              {q.options.map((option, i) => {
                const isSelected = selected === option.id;
                const dimmed = selected !== null && !isSelected;
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: dimmed ? 0.45 : 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.35, ease: EASE }}
                    onClick={() => handleAnswer(option)}
                    disabled={locked}
                    className="group flex min-h-[64px] w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-200 active:scale-[0.99]"
                    style={{
                      borderColor: isSelected ? GREEN : HAIRLINE,
                      background: isSelected ? 'rgba(81,140,91,0.10)' : SURFACE,
                    }}
                  >
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-colors"
                      style={{ borderColor: isSelected ? GREEN : HAIRLINE, background: isSelected ? GREEN : 'transparent' }}
                    >
                      {isSelected ? <Check className="h-4 w-4 text-white" /> : <Glyph className="h-4 w-4" style={{ color: TEXT_DIM }} />}
                    </span>
                    <span className="flex-1 text-base font-medium leading-snug" style={{ color: INK }}>{option.text}</span>
                    {selected === null && (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: TEXT_DIM }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /* RESULTADO — um número, um botão                                    */
  /* ================================================================ */
  return (
    <div className="min-h-screen pb-32 md:pb-0" style={{ background: PAPER, color: INK }}>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Masthead right="Seu diagnóstico" />

        <motion.div {...fadeUp} transition={{ duration: 0.5, ease: EASE }} className="pt-10">
          <p className="mb-3 text-sm font-medium" style={{ color: CORAL }}>Diagnóstico concluído</p>
          <h1 className="font-serif text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-5xl" style={{ color: INK }}>
            Montar cardápio na mão leva cerca de
          </h1>
          <p
            className="mt-4 font-serif font-semibold leading-none tracking-[-0.03em] tabular-nums"
            style={{ color: GREEN, fontSize: 'clamp(3.4rem, 15vw, 7rem)' }}
          >
            {brl(hoursPerMonth)}
            <span className="ml-2 text-2xl font-medium tracking-normal sm:text-3xl" style={{ color: TEXT_MUTED }}>horas/mês</span>
          </p>
          <p className="mt-5 max-w-lg text-base leading-relaxed" style={{ color: TEXT_MUTED }}>
            São cerca de <span className="font-semibold tabular-nums" style={{ color: INK }}>{lostHours} horas por semana</span> em
            uma tarefa que o NutriFlow automatiza: a IA monta o plano e você só revisa.
          </p>
          <p className="mt-4 inline-block rounded-xl px-4 py-3 text-sm leading-relaxed" style={{ background: 'rgba(81,140,91,0.10)', color: GREEN_DEEP }}>
            Se metade desse tempo virar atendimento, são cerca de <span className="font-semibold tabular-nums">R$ {brl(recoverable)}</span> a mais por mês.
          </p>
          <p className="mt-2 text-xs" style={{ color: TEXT_DIM }}>
            Estimativa com base nas suas respostas e em R$ {HOURLY_RATE} por hora de atendimento.
          </p>

          <div className="mt-8 hidden md:block">
            <Button
              onClick={handleSignup}
              size="lg"
              className="group h-14 gap-2.5 rounded-xl px-8 text-base font-semibold text-white transition-colors"
              style={{ background: GREEN }}
              onMouseEnter={(e) => (e.currentTarget.style.background = GREEN_DEEP)}
              onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
            >
              Criar minha conta grátis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="mt-3 text-sm" style={{ color: TEXT_DIM }}>14 dias grátis · sem cartão de crédito</p>
          </div>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, ease: EASE, delay: 0.12 }}
          className="mt-10 rounded-2xl border p-6"
          style={{ borderColor: HAIRLINE, background: SURFACE }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: CORAL }}>O que você testa nos 14 dias</p>
          <ul className="mt-4 space-y-4">
            {[
              { icon: Sparkles, title: 'Cardápios gerados por IA', text: 'Plano personalizado do paciente; você só revisa e ajusta.' },
              { icon: Smartphone, title: 'App do paciente', text: 'Lembretes e chat para o paciente seguir o plano até o retorno.' },
              { icon: Users, title: 'Gestão da clínica', text: 'Pacientes, evolução e agenda em um só lugar.' },
            ].map((b) => (
              <li key={b.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(81,140,91,0.12)' }}>
                  <b.icon className="h-4 w-4" style={{ color: GREEN }} />
                </span>
                <div>
                  <p className="text-base font-semibold" style={{ color: INK }}>{b.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{b.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        <footer className="mt-10 border-t pt-6 text-sm" style={{ borderColor: HAIRLINE, color: TEXT_DIM }}>
          © {new Date().getFullYear()} NutriFlow · Dúvidas?{' '}
          <a
            href="https://wa.me/5513996205253?text=Ol%C3%A1!%20Fiz%20o%20diagn%C3%B3stico%20e%20quero%20saber%20mais."
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-colors"
            style={{ color: GREEN }}
          >
            Fale conosco no WhatsApp
          </a>
        </footer>
      </div>

      {/* botão fixo no celular: o cadastro está sempre a um toque */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t px-4 pb-4 pt-3 backdrop-blur md:hidden" style={{ borderColor: HAIRLINE, background: 'rgba(247,246,242,0.96)' }}>
        <Button
          onClick={handleSignup}
          size="lg"
          className="h-14 w-full gap-2.5 rounded-xl text-base font-semibold text-white"
          style={{ background: GREEN }}
        >
          Criar minha conta grátis
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="mt-2 text-center text-xs" style={{ color: TEXT_DIM }}>14 dias grátis · sem cartão de crédito</p>
      </div>

      <Dialog open={leadOpen} onOpenChange={setLeadOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Quase lá! Onde te avisamos?</DialogTitle>
            <DialogDescription>
              Informe seu e-mail e WhatsApp para criar sua conta grátis. Falta só nome e senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLeadSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="lead-email">E-mail</Label>
              <Input
                id="lead-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">WhatsApp</Label>
              <Input
                id="lead-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(11) 99999-9999"
                value={leadPhone}
                onChange={(e) => setLeadPhone(maskPhone(e.target.value))}
                required
                className="h-12 rounded-xl"
              />
            </div>
            {leadError && <p role="alert" className="text-sm text-red-600">{leadError}</p>}
            <Button
              type="submit"
              size="lg"
              className="h-14 w-full gap-2.5 rounded-xl text-base font-semibold text-white"
              style={{ background: GREEN }}
            >
              Criar minha conta grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-center text-xs" style={{ color: TEXT_DIM }}>14 dias grátis · sem cartão de crédito</p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
