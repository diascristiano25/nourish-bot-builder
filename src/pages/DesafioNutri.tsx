import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles, Zap, Trophy, Target, Clock, Users,
  ArrowRight, Check, Star, Flame, Award, ChevronRight,
  MessageCircle, Play
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

// Quiz questions — desafios clínicos reais para testar o nutricionista de verdade
const quizQuestions = [
  {
    id: 1,
    category: 'Raciocínio Clínico',
    question: "Paciente mulher, 62kg, sedentária, quer emagrecer. Qual TMB (Harris-Benedict) e GET você prescreveria para um déficit seguro?",
    options: [
      { id: 'a', text: 'TMB ~1.380 kcal • GET ~1.650 kcal (déficit de ~450 kcal/dia)', icon: Target, points: 25, correct: true },
      { id: 'b', text: 'TMB ~1.700 kcal • GET ~2.550 kcal (manutenção, sem déficit)', icon: Zap, points: 5, correct: false },
      { id: 'c', text: 'Dieta de 800 kcal/dia para resultado rápido', icon: Flame, points: 0, correct: false },
      { id: 'd', text: 'Não calculo — uso cardápio padrão de 1.500 kcal para todas', icon: Clock, points: 5, correct: false },
    ],
    insight: 'Certo! TMB feminina ≈ 655 + (9,6×62) + (1,8×altura) − (4,7×idade). Com fator 1,2 (sedentária) e déficit de ~450 kcal, você perde gordura preservando massa magra. Dietas abaixo de 1.200 kcal ou "padrão para todos" sabotam a adesão e o metabolismo.'
  },
  {
    id: 2,
    category: 'Gestão de Consultório',
    question: "Você atende 40 pacientes/mês e gasta 2h montando cada cardápio do zero. Quantas horas/semana você PERDE só nisso — e quanto isso custa?",
    options: [
      { id: 'a', text: '~20h/semana • equivale a meio expediente jogado fora', icon: Clock, points: 25, correct: true },
      { id: 'b', text: '~5h/semana, dá pra conciliar com o resto', icon: Target, points: 10, correct: false },
      { id: 'c', text: 'Não sei, nunca medi meu tempo nessa tarefa', icon: Users, points: 5, correct: false },
      { id: 'd', text: 'É o preço de ser nutricionista, faz parte', icon: Flame, points: 0, correct: false },
    ],
    insight: 'Exato. 40 pacientes × 2h = 80h/mês ≈ 20h/semana só montando cardápio. A R$ 150/hora, são R$ 3.000/mês de custo de oportunidade. Automatizar isso com IA libera esse tempo para atender MAIS pacientes ou descansar.'
  },
  {
    id: 3,
    category: 'Retenção de Paciente',
    question: "Seu paciente faltou ao retorno e disse: 'tava sem tempo, e o cardápio era difícil de seguir'. Qual é a causa RAIZ mais provável?",
    options: [
      { id: 'a', text: 'Cardápio rígido demais + sem acompanhamento entre consultas', icon: Target, points: 25, correct: true },
      { id: 'b', text: 'Falta de comprometimento do paciente', icon: Users, points: 5, correct: false },
      { id: 'c', text: 'Preço da consulta muito alto', icon: Zap, points: 5, correct: false },
      { id: 'd', text: 'Azar — alguns pacientes simplesmente somem', icon: Flame, points: 0, correct: false },
    ],
    insight: 'Isso! Estudos mostram que >60% das desistências vêm de planos inflexíveis + falta de suporte entre consultas. Um app mobile com cardápio ajustável, substituições e mensagens diretas reduz a evasão em até 40%. "Falta de comprometimento" é o sintoma, não a causa.'
  }
];

// Badges to unlock
const badges = [
  { id: 'explorer', name: 'Explorador', icon: Star, description: 'Começou o desafio', unlocked: false },
  { id: 'thinker', name: 'Estrategista', icon: Target, description: 'Respondeu todas as perguntas', unlocked: false },
  { id: 'champion', name: 'Campeão', icon: Trophy, description: 'Completou o desafio', unlocked: false },
];

export default function DesafioNutri() {
  const [step, setStep] = useState(0); // 0=intro, 1-3=quiz, 3.5=insight, 4=result
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  useEffect(() => {
    trackPixel('ViewContent');
  }, []);

  const handleAnswer = (questionId: number, optionId: string, points: number, isCorrect: boolean) => {
    if (isAnimating) return;
    setIsAnimating(true);

    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setTotalPoints(prev => prev + points);
    setLastAnswerCorrect(isCorrect);

    // Unlock badges based on progress
    if (step === 1 && !unlockedBadges.includes('explorer')) {
      setUnlockedBadges(prev => [...prev, 'explorer']);
    }

    // Show insight after answering
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
        setUnlockedBadges(prev => [...prev, 'thinker', 'champion']);
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

  const progress = step === 0 ? 0 : step === 4 ? 100 : (step / 3) * 100;

  // Intro screen
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#518C5B]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C4764A]/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#518C5B]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="NutriFlow" className="h-10 w-auto" />
              <span className="font-serif text-2xl font-bold">NutriFlow</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#518C5B]/20 border border-[#518C5B]/30">
              <Flame className="w-4 h-4 text-[#518C5B]" />
              <span className="text-sm font-semibold text-[#518C5B]">Desafio Nutri</span>
            </div>
          </header>

          {/* Hero */}
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
              <span className="font-bold text-lg">Desafio Nutri • Lançamento 2026</span>
            </motion.div>

            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
              Transforme sua clínica em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#518C5B] to-[#C4764A]">
                60 segundos
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              Responda 3 perguntas rápidas, descubra seu perfil e ganhe{' '}
              <span className="text-[#518C5B] font-bold">14 dias grátis</span> + bônus exclusivos
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                { icon: Zap, text: 'Cardápios com IA' },
                { icon: Users, text: 'Gestão completa' },
                { icon: Clock, text: 'Economize 15h/semana' },
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

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setStep(1)}
                size="lg"
                className="gap-3 bg-gradient-to-r from-[#518C5B] to-[#3d7047] hover:from-[#3d7047] hover:to-[#518C5B] text-white text-lg px-10 h-16 rounded-2xl shadow-2xl shadow-[#518C5B]/30"
              >
                <Play className="w-5 h-5" />
                Começar Desafio
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>

            <p className="mt-6 text-sm text-white/50">
              ⚡ Leva menos de 1 minuto • 🎁 Ganhe bônus exclusivos
            </p>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-3 gap-6 mt-16"
          >
            {[
              { number: '500+', label: 'Nutris já usam' },
              { number: '15h', label: 'Economizadas/semana' },
              { number: '4.9★', label: 'Avaliação média' },
            ].map((stat, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-[#518C5B] mb-2">{stat.number}</p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
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
            <Progress value={progress} className="h-2 bg-white/10" />
          </div>
        </div>

        {/* Badges */}
        <div className="fixed top-20 right-6 z-40 flex flex-col gap-2">
          {badges.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isUnlocked ? 1 : 0.8, opacity: isUnlocked ? 1 : 0.3 }}
                className={`p-3 rounded-xl border ${
                  isUnlocked
                    ? 'bg-[#518C5B]/20 border-[#518C5B]/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <badge.icon className={`w-5 h-5 ${isUnlocked ? 'text-[#518C5B]' : 'text-white/30'}`} />
              </motion.div>
            );
          })}
        </div>

        {/* Question */}
        <div className="pt-28 pb-12 px-6">
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${step}-${showInsight ? 'insight' : 'question'}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {!showInsight ? (
                  <>
                    {/* Category badge */}
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
                        const isCorrectOption = (option as any).correct === true;

                        let optionStyle = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20';
                        if (answered && isSelected) {
                          optionStyle = isCorrectOption
                            ? 'bg-[#518C5B]/20 border-[#518C5B] shadow-lg shadow-[#518C5B]/20'
                            : 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/20';
                        } else if (answered && isCorrectOption) {
                          optionStyle = 'bg-[#518C5B]/10 border-[#518C5B]/50';
                        } else if (answered) {
                          optionStyle = 'bg-white/5 border-white/10 opacity-50';
                        }

                        return (
                          <motion.button
                            key={option.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={!answered ? { scale: 1.02, x: 8 } : {}}
                            whileTap={!answered ? { scale: 0.98 } : {}}
                            onClick={() => handleAnswer(currentQuestion.id, option.id, option.points, (option as any).correct === true)}
                            disabled={answered || isAnimating}
                            className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 ${optionStyle}`}
                          >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              answered && isSelected
                                ? (isCorrectOption ? 'bg-[#518C5B]' : 'bg-red-500')
                                : answered && isCorrectOption
                                ? 'bg-[#518C5B]/80'
                                : 'bg-white/10'
                            }`}>
                              <option.icon className={`w-5 h-5 ${
                                (answered && (isSelected || isCorrectOption)) ? 'text-white' : 'text-white/60'
                              }`} />
                            </div>
                            <span className="text-base md:text-lg font-medium flex-1 leading-snug">{option.text}</span>
                            {answered && isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isCorrectOption ? 'bg-[#518C5B]' : 'bg-red-500'
                                }`}
                              >
                                {isCorrectOption ? <Check className="w-4 h-4 text-white" /> : <span className="text-white text-sm font-bold">✕</span>}
                              </motion.div>
                            )}
                            {answered && !isSelected && isCorrectOption && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-7 h-7 rounded-full bg-[#518C5B] flex items-center justify-center flex-shrink-0"
                              >
                                <Check className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                            {!answered && <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  /* Insight / feedback after answering */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 ${
                      lastAnswerCorrect
                        ? 'bg-[#518C5B]/20 border border-[#518C5B]/40 text-[#518C5B]'
                        : 'bg-[#C4764A]/20 border border-[#C4764A]/40 text-[#C4764A]'
                    }`}>
                      {lastAnswerCorrect ? (
                        <><Check className="w-4 h-4" /><span className="font-bold">Resposta correta! +{quizQuestions[step - 1].options.find(o => (o as any).correct)?.points || 0} pts</span></>
                      ) : (
                        <><Flame className="w-4 h-4" /><span className="font-bold">Quase lá — veja a explicação</span></>
                      )}
                    </div>

                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-left mb-8">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            lastAnswerCorrect ? 'bg-[#518C5B]/20' : 'bg-[#C4764A]/20'
                          }`}>
                            <Sparkles className={`w-5 h-5 ${lastAnswerCorrect ? 'text-[#518C5B]' : 'text-[#C4764A]'}`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-2">
                              {lastAnswerCorrect ? 'Você acertou!' : 'A resposta ideal era outra'}
                            </h3>
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
                          <>Ver Minhas Recompensas <Trophy className="w-5 h-5" /></>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] text-white overflow-hidden">
        {/* Celebration background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#518C5B]/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C4764A]/30 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
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

          {/* Victory message */}
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

            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
              Parabéns! 🎉
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Você completou o Desafio Nutri e desbloqueou recompensas exclusivas
            </p>

            {/* Unlocked badges */}
            <div className="flex justify-center gap-4 mb-12">
              {badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + badges.indexOf(badge) * 0.2, type: "spring" }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#518C5B] to-[#3d7047] flex items-center justify-center shadow-lg shadow-[#518C5B]/30">
                    <badge.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white/60">{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Rewards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-2 gap-6 mb-12"
          >
            <Card className="bg-gradient-to-br from-[#518C5B]/20 to-[#518C5B]/5 border-[#518C5B]/30 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#518C5B] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">14 Dias Grátis</h3>
                    <p className="text-sm text-white/60">Acesso completo ao NutriFlow</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    'Cardápios ilimitados com IA',
                    'Até 100 pacientes ativos',
                    'App mobile para pacientes',
                    'Suporte prioritário',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[#518C5B]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#C4764A]/20 to-[#C4764A]/5 border-[#C4764A]/30 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C4764A] flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Bônus Exclusivo</h3>
                    <p className="text-sm text-white/60">Só para quem completou o desafio</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    'Treinamento personalizado 1:1',
                    'Templates de cardápios premium',
                    'Guia de precificação 2026',
                    'Acesso à comunidade VIP',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-[#C4764A]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-[#518C5B] to-[#3d7047] rounded-3xl p-10 mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Suas recompensas estão esperando. Ative seu teste grátis agora e transforme sua clínica com IA.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleStartTest}
                  size="lg"
                  className="gap-3 bg-white text-[#3d7047] hover:bg-white/90 text-lg px-10 h-16 rounded-2xl shadow-2xl"
                >
                  <Zap className="w-5 h-5" />
                  Ativar Meu Teste Grátis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
              <p className="mt-4 text-sm text-white/60">
                ⚡ Sem cartão de crédito • Cancele quando quiser
              </p>
            </div>

            {/* Pricing teaser */}
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