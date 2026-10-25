import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Users, Clock, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';
import logoImg from '@/assets/logo-nutriflow.png';

const WHATSAPP_TESTE =
  'https://wa.me/5513996205253?text=' +
  encodeURIComponent('Olá! Quero começar meu teste grátis de 14 dias no NutriFlow pelo Desafio Nutri.');

// Dispara eventos de conversão do Meta Pixel nesta landing de campanha
function trackPixel(event: string) {
  try {
    // @ts-ignore - fbq injected by index.html
    if (typeof window !== 'undefined' && window.fbq) {
      // @ts-ignore
      window.fbq('track', event);
    }
  } catch {
    /* pixel indisponível — não bloqueia a página */
  }
}

const benefits = [
  { icon: Sparkles, title: 'Cardápios com IA em segundos', text: 'Gere planos personalizados a partir da anamnese, exames e preferências do paciente.' },
  { icon: Users, title: 'Gestão completa de pacientes', text: 'Prontuário, evolução, agenda e mensagens em um só lugar. Chega de abas infinitas.' },
  { icon: Clock, title: 'Economize 15h por semana', text: 'Automatize o que te toma tempo e foque no atendimento que realmente importa.' },
  { icon: ShieldCheck, title: 'LGPD e segurança', text: 'Dados criptografados, isolamento por nutricionista e conformidade com a LGPD.' },
];

const steps = [
  { n: '1', title: 'Clique no botão abaixo', text: 'Fale conosco pelo WhatsApp em segundos.' },
  { n: '2', title: 'Ative seu teste grátis', text: '14 dias completos, sem cartão de crédito.' },
  { n: '3', title: 'Gere seu primeiro cardápio', text: 'Com IA, em menos de 1 minuto.' },
];

export default function DesafioNutri() {
  useEffect(() => {
    trackPixel('ViewContent');
  }, []);

  const handleStartTest = () => {
    trackPixel('StartTrial');
    trackPixel('Lead');
    window.open(WHATSAPP_TESTE, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header simples */}
      <header className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
            <span className="font-serif text-xl font-bold">NutriFlow</span>
          </a>
          <Button
            onClick={handleStartTest}
            className="gap-2 bg-[#518C5B] hover:bg-[#3d7047] text-white rounded-xl"
          >
            <MessageCircle className="w-4 h-4" />
            Teste Grátis
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#518C5B]/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#518C5B]/10 text-[#518C5B] text-xs font-bold uppercase tracking-widest mb-6 border border-[#518C5B]/20">
            <Zap className="w-3.5 h-3.5" />
            Desafio Nutri • Lançamento
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[1.08] mb-6">
            Cardápios com IA em segundos.{' '}
            <span className="text-[#518C5B]">
              Sua clínica inteira em uma plataforma.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Esqueça planilhas e sistemas travados. O NutriFlow gera cardápios personalizados,
            gestiona pacientes, agenda e financeiro — tudo integrado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <Button
              onClick={handleStartTest}
              size="lg"
              className="gap-2 bg-[#518C5B] hover:bg-[#3d7047] text-white text-base px-8 h-14 rounded-xl shadow-lg shadow-[#518C5B]/20"
            >
              <MessageCircle className="w-5 h-5" />
              Começar Teste Grátis de 14 Dias
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#518C5B]" /> Sem cartão de crédito</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#518C5B]" /> Cancele quando quiser</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#518C5B]" /> Suporte humano</span>
          </p>
        </div>
      </section>

      {/* Preços de lançamento */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Preços especiais de lançamento</h2>
          <p className="text-muted-foreground">Garanta o valor de lançamento enquanto durar a campanha.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Starter', price: '39,90', desc: 'Para começar a inovar', features: ['Até 20 pacientes ativos', 'Gerador de cardápios com IA', 'App mobile do paciente', 'Suporte por email'], highlighted: false },
            { name: 'Pro', price: '69,90', desc: 'Para crescer com IA', features: ['Até 100 pacientes ativos', 'IA avançada Gemini 2.5', 'Agendamento online', 'Notificações WhatsApp', 'Suporte prioritário 24/7'], highlighted: true },
            { name: 'Enterprise', price: '109,90', desc: 'Solução para clínicas', features: ['Pacientes ilimitados', 'IA customizada e treinada', 'API integrada', 'White-label disponível', 'Gerente de sucesso dedicado'], highlighted: false },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 flex flex-col ${
                plan.highlighted
                  ? 'border-2 border-[#518C5B] bg-[#518C5B]/[0.04] shadow-lg shadow-[#518C5B]/10'
                  : 'border border-border/60 bg-card'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#518C5B] text-white text-xs font-bold">
                  Mais Popular
                </span>
              )}
              <h3 className="font-serif text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-2.5 mb-7 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-[#518C5B] flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleStartTest}
                className={`w-full rounded-xl ${
                  plan.highlighted
                    ? 'bg-[#518C5B] hover:bg-[#3d7047] text-white'
                    : 'border-border/60 hover:border-[#518C5B]/50'
                }`}
                variant={plan.highlighted ? 'default' : 'outline'}
              >
                Começar Teste Grátis
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-5">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="bg-card border border-border/60 rounded-2xl p-6 flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#518C5B]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#518C5B]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="font-serif text-3xl font-bold text-center mb-10">Comece em 3 passos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#518C5B] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="font-semibold mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-br from-[#518C5B] to-[#3d7047] rounded-3xl p-10 text-white">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Pronto para transformar sua clínica?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Junte-se aos nutricionistas que já economizam horas toda semana com o NutriFlow.
            Teste grátis por 14 dias.
          </p>
          <Button
            onClick={handleStartTest}
            size="lg"
            className="gap-2 bg-white text-[#3d7047] hover:bg-white/90 text-base px-8 h-14 rounded-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Começar Meu Teste Grátis Agora
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} NutriFlow • Dúvidas?{' '}
          <a href={WHATSAPP_TESTE} target="_blank" rel="noopener noreferrer" className="text-[#518C5B] hover:underline">
            Fale conosco no WhatsApp
          </a>
        </div>
      </footer>
    </div>
  );
}