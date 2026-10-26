import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, Zap, Trophy, Target, Clock, Users,
  ArrowRight, Check, Star, Flame, Award, ChevronRight,
  MessageCircle, Play, TrendingDown, DollarSign, Heart, Gift
} from 'lucide-react';
import logoImg from '@/assets/logo-nutriflow.png';
import { motion, AnimatePresence } from 'framer-motion';

// Pixel tracking helper
function trackPixel(event: string, params?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', event, params);
    }
  } catch { /* silent fail */ }
}

// Quiz questions — Diagnóstico de Potencial Perdido (foco em dor/desejo, não em teste técnico)
const quizQuestions = [
  {
    id: 1,
    category: 'Sua Rotina',
    question: "Sendo bem sincero(a): quantas horas por semana você perde montando cardápios manualmente ou ajustando planilhas?",
    options: [
      { id: 'a', text: 'Menos de 5h (sou organizado/a)', icon: Clock, points: 10, lostHours: 5, lostMoney: 750 },
      { id: 'b', text: 'Entre 5h e 10h (é cansativo)', icon: Clock, points: 15, lostHours: 10, lostMoney: 1500 },
      { id: 'c', text: 'Mais de 10h (vivo apagando incêndio)', icon: Flame, points: 20, lostHours: 15, lostMoney: 2250 },
      { id: 'd', text: 'Perdi a conta... é meu dia todo', icon: TrendingDown, points: 25, lostHours: 20, lostMoney: 3000 },
    ],
    insight: 'Cada hora gasta em tarefa repetitiva é uma hora que você NÃO está atendendo (R$ 150/h) ou descansando. Automatizar isso com IA libera sua agenda imediatamente.'
  },
  {
    id: 2,
    category: 'Retenção de Pacientes',
    question: "Quando seu paciente termina a consulta e vai para casa, como você garante que ele vai seguir o plano até o retorno?",
    options: [
      { id: 'a', text: 'Entrego o PDF e torço pelo melhor', icon: Target, points: 10, retentionLoss: 40 },
      { id: 'b', text: 'Mando mensagem no WhatsApp manual', icon: MessageCircle, points: 15, retentionLoss: 25 },
      { id: 'c', text: 'Ele tem um app com lembretes e chat', icon: Sparkles, points: 25, retentionLoss: 5 },
      { id: 'd', text: 'Não faço nada, muitos não voltam', icon: TrendingDown, points: 5, retentionLoss: 60 },
    ],
    insight: 'Estudos mostram que sem acompanhamento digital (app/lembretes), a adesão ao tratamento cai até 60%. Paciente que não vê resultado, não renova o pacote. O app do paciente é sua máquina de retenção.'
  },
  {
    id: 3,
    category: 'Seu Futuro',
    question: "Se o NutriFlow te devolvesse 10 horas livres por semana a partir de amanhã, o que você faria com esse tempo?",
    options: [
      { id: 'a', text: 'Atenderia mais pacientes (mais lucro)', icon: DollarSign, points: 20, desire: 'money' },
      { id: 'b', text: 'Ficaria com minha família / descansaria', icon: Heart, points: 20, desire: 'time' },
      { id: 'c', text: 'Estudaria e me especializaria mais', icon: Star, points: 20, desire: 'growth' },
      { id: 'd', text: 'Focaria em marketing para crescer', icon: TrendingDown, points: 20, desire: 'growth' },
    ],
    insight: 'Essa é a verdadeira promessa do NutriFlow: não é só um software, é liberdade. Seja para ganhar mais ou viver melhor, a tecnologia deve trabalhar para você, não o contrário.'
  }
];

export default function DesafioNutri() {
  const [step, setStep] = useState(0); // 0=intro, 1-3=quiz, 3.5=insight, 4=result
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  // Calculated metrics for the result
  const [metrics, setMetrics] = useState({ lostHours: 0, lostMoney: 0, retentionLoss: 0, desire: '' });

  useEffect(() => {
    trackPixel('ViewContent');
  }, []);

  const handleAnswer = (questionId: number, optionId: string, points: number, optionData: any) => {
    if (isAnimating) return;
    setIsAnimating(true);

    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setTotalPoints(prev => prev + points);

    // Accumulate metrics for the final result
    setMetrics(prev => ({
      lostHours: prev.lostHours + (optionData.lostHours || 0),
      lostMoney: prev.lostMoney + (optionData.lostMoney || 0),
      retentionLoss: optionData.retentionLoss !== undefined ? optionData.retentionLoss : prev.retentionLoss,
      desire: optionData.desire || prev.desire
    }));

    setTimeout(() => {
      setShowInsight(true);
      setIsAnimating(false);
    }, 400);
  };

  const handleNextQuestion = () => {
    setIsAnimating(true);
    setShowInsight(false);
    setTimeout(() => {
      if (step < 3) {
        setStep(prev => prev + 1);
      } else {
        setStep(4);
        trackPixel('Lead');
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleStartTest = () => {
    trackPixel('StartTrial');
    trackPixel('CompleteRegistration');
    window.location.href = '/auth';
  };

  const progress = step === 0 ? 0 : step === 4 ? 100 : ((step - (showInsight ? 0 : 1)) / 3) * 100 + (showInsight ? 33 : 0);

  // Intro screen
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#518C5B]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C4764A]/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="NutriFlow" className="h-10 w-auto" />
              <span className="font-serif text-2xl font-bold">NutriFlow</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#518C5B]/20 border border-[#518C5B]/30">
              <Flame className="w-4 h-4 text-[#518C5B]" />
              <span className="text-sm font-semibold text-[#518C5B]">Diagnóstico Gratuito</span>
            </div>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#518C5B]/20 to-[#C4764A]/20 border border-[#518C5B]/30 mb-8"
            >
              <Trophy className="w-5 h-5 text-[#518C5B]" />
              <span className="font-bold text-lg">Descubra seu Potencial Perdido</span>
            </motion.div>

            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
              Quanto dinheiro você está{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#518C5B] to-[#C4764A]">
                deixando na mesa?
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              Responda 3 perguntas rápidas sobre sua rotina e descubra exatamente quantas horas e reais você pode recuperar com o NutriFlow.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                { icon: Zap, text: 'Diagnóstico em 60s' },
                { icon: DollarSign, text: 'Relatório personalizado' },
                { icon: Gift, text: '14 dias grátis no final' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                >
                  <item.icon className="w-4 h-4 text-[#518C5B]" />
                  <span className="text-sm font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setStep(1)}
                size="lg"
                className="gap-3 bg-gradient-to-r from-[#518C5B] to-[#3d7047] hover:from-[#3d7047] hover:to-[#518C5B] text-white text-lg px-10 h-16 rounded-2xl shadow-2xl shadow-[#518C5B]/30"
              >
                <Play className="w-5 h-5" />
                Começar Diagnóstico
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz screens
  if (step >= 1 && step <= 3) {
    const currentQuestion = quizQuestions[step - 1];
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] text-white">
        {/* Progress bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/60">
                Pergunta {step} de 3
              </span>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#C4764A]" />
                <span className="text-sm font-bold text-[#C4764A]">{totalPoints} pts</span>
              </div>
            </div>
            <Progress value={(step / 3) * 100} className="h-2 bg-white/10" />
          </div>
        </div>

        <div className="pt-28 pb-12 px-6">
          <div className="max-w-2xl mx-auto">
            {!showInsight ? (
              <motion.div
                key={`question-${step}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-center mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C4764A]/20 border border-[#C4764A]/30 text-[#C4764A] text-xs font-bold uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5" />
                    {currentQuestion.category}
                  </span>
                </div>

                <h2 className="font-serif text-2xl md:text-3xl font-bold text-center mb-10 leading-snug">
                  {currentQuestion.question}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, i) => {
                    const isSelected = answers[currentQuestion.id] === option.id;
                    const answered = !!answers[currentQuestion.id];

                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={!answered ? { scale: 1.02, x: 8 } : {}}
                        whileTap={!answered ? { scale: 0.98 } : {}}
                        onClick={() => handleAnswer(currentQuestion.id, option.id, option.points, option)}
                        disabled={answered || isAnimating}
                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 ${
                          answered && isSelected
                            ? 'bg-[#518C5B]/20 border-[#518C5B] shadow-lg shadow-[#518C5B]/20'
                            : answered
                            ? 'bg-white/5 border-white/10 opacity-50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          answered && isSelected ? 'bg-[#518C5B]' : 'bg-white/10'
                        }`}>
                          <option.icon className={`w-5 h-5 ${
                            answered && isSelected ? 'text-white' : 'text-white/60'
                          }`} />
                        </div>
                        <span className="text-base md:text-lg font-medium flex-1 leading-snug">{option.text}</span>
                        {answered && isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-7 h-7 rounded-full bg-[#518C5B] flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                        {!answered && <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0" />}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`insight-${step}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 bg-[#518C5B]/20 border border-[#518C5B]/40 text-[#518C5B]">
                  <Check className="w-4 h-4" />
                  <span className="font-bold">Resposta registrada! +{quizQuestions[step - 1].options.find(o => o.id === answers[currentQuestion.id])?.points || 0} pts</span>
                </div>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-left mb-8">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#518C5B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-5 h-5 text-[#518C5B]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Você sabia?</h3>
                        <p className="text-white/70 leading-relaxed text-sm md:text-base">
                          {currentQuestion.insight}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleNextQuestion}
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-[#518C5B] to-[#3d7047] hover:from-[#3d7047] hover:to-[#518C5B] text-white text-base px-8 h-14 rounded-2xl shadow-xl shadow-[#518C5B]/30"
                  >
                    {step < 3 ? (
                      <>Próxima Pergunta <ArrowRight className="w-5 h-5" /></>
                    ) : (
                      <>Ver Meu Resultado <Trophy className="w-5 h-5" /></>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] text-white overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#518C5B]/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C4764A]/30 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="NutriFlow" className="h-10 w-auto" />
              <span className="font-serif text-2xl font-bold">NutriFlow</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C4764A]/20 border border-[#C4764A]/30">
              <Award className="w-4 h-4 text-[#C4764A]" />
              <span className="text-sm font-semibold text-[#C4764A]">{totalPoints} pontos</span>
            </div>
          </header>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#518C5B] to-[#C4764A] flex items-center justify-center mx-auto shadow-2xl shadow-[#518C5B]/50">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Seu Diagnóstico Está Pronto
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Com base nas suas respostas, calculamos seu potencial de recuperação.
            </p>
          </motion.div>

          {/* Metrics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6 mb-12"
          >
            <Card className="bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/30 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2">Potencial Perdido / Mês</h3>
                <p className="text-4xl font-bold text-white mb-2">
                  R$ {metrics.lostMoney.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-white/60">
                  Equivale a {metrics.lostHours} horas de trabalho jogadas fora mensalmente.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#518C5B]/20 to-[#518C5B]/5 border-[#518C5B]/30 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#518C5B]/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-8 h-8 text-[#518C5B] rotate-180" />
                </div>
                <h3 className="text-sm font-bold text-[#518C5B] uppercase tracking-wider mb-2">Risco de Evasão</h3>
                <p className="text-4xl font-bold text-white mb-2">
                  {metrics.retentionLoss}%
                </p>
                <p className="text-sm text-white/60">
                  Chance de pacientes não renovarem sem acompanhamento digital.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Solution & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-[#518C5B] to-[#3d7047] rounded-3xl p-10 mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Vamos recuperar esse tempo?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                O NutriFlow automatiza seus cardápios, fideliza pacientes com o app mobile e organiza sua gestão.
                <strong> Recupere R$ {metrics.lostMoney.toLocaleString('pt-BR')}/mês</strong> começando hoje.
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleStartTest}
                  size="lg"
                  className="gap-3 bg-white text-[#3d7047] hover:bg-white/90 text-lg px-10 h-16 rounded-2xl shadow-2xl"
                >
                  <Zap className="w-5 h-5" />
                  Ativar Meus 14 Dias Grátis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
              <p className="mt-4 text-sm text-white/60">
                ⚡ Sem cartão de crédito • Cancele quando quiser
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-12">
              {[
                { name: 'Starter', price: '39,90', popular: false },
                { name: 'Pro', price: '69,90', popular: true },
                { name: 'Enterprise', price: '109,90', popular: false },
              ].map((plan, i) => (
                <Card key={i} className={`bg-white/5 border-white/10 ${plan.popular ? 'border-[#518C5B]/50' : ''}`}>
                  <CardContent className="p-6 text-center">
                    {plan.popular && (
                      <span className="inline-block px-3 py-1 rounded-full bg-[#518C5B] text-white text-xs font-bold mb-3">
                        Mais Popular
                      </span>
                    )}
                    <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                    <p className="text-3xl font-bold text-[#518C5B] mb-1">
                      R$ {plan.price}
                    </p>
                    <p className="text-xs text-white/50">/mês após o teste</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}