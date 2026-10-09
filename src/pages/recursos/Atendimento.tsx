import { Navigate } from 'react-router-dom';
import { HybridPage } from '@/components/hybrid/HybridPage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Bell, Clock, Check } from 'lucide-react';

export default function Atendimento() {
  const publicContent = (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#518C5B]/5 to-[#FAF8F5]">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#518C5B] mb-6">
            Sistema de Agendamento Inteligente
          </h1>
          <p className="text-lg text-[#C4764A]/80 mb-8 max-w-2xl mx-auto">
            Gerencie consultas, envie lembretes automáticos e acesse o histórico completo de atendimentos em um só lugar.
          </p>
          <Button
            className="bg-[#C4764A] hover:bg-[#C4764A]/90 text-white px-8 py-6 text-lg"
            onClick={() => window.location.href = '/auth'}
          >
            Começar Gratuitamente
          </Button>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <Card className="p-8 border-[#518C5B]/20 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#518C5B]/10 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-[#518C5B]" />
            </div>
            <h3 className="text-xl font-bold text-[#518C5B] mb-3">
              Calendário Inteligente
            </h3>
            <p className="text-[#C4764A]/70 leading-relaxed">
              Visualização clara de todas as consultas, com sincronização Google Calendar e detecção automática de conflitos de horário.
            </p>
          </Card>

          <Card className="p-8 border-[#518C5B]/20 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#C4764A]/10 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-[#C4764A]" />
            </div>
            <h3 className="text-xl font-bold text-[#518C5B] mb-3">
              Lembretes Automáticos
            </h3>
            <p className="text-[#C4764A]/70 leading-relaxed">
              Envie lembretes por WhatsApp, SMS e e-mail automaticamente. Reduza faltas em até 70% com confirmações inteligentes.
            </p>
          </Card>

          <Card className="p-8 border-[#518C5B]/20 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#518C5B]/10 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-[#518C5B]" />
            </div>
            <h3 className="text-xl font-bold text-[#518C5B] mb-3">
              Histórico Completo
            </h3>
            <p className="text-[#C4764A]/70 leading-relaxed">
              Acesse todo o histórico de consultas do paciente em segundos. Veja evoluções, cardápios prescritos e notas de atendimento.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-16 px-6 bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#518C5B] text-center mb-12">
            Escolha seu Plano
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-[#518C5B]/20">
              <h3 className="text-2xl font-bold text-[#518C5B] mb-2">Gratuito</h3>
              <p className="text-[#C4764A]/70 mb-6">Para começar</p>
              <div className="text-4xl font-bold text-[#518C5B] mb-6">
                R$ 0<span className="text-lg font-normal">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#518C5B] flex-shrink-0 mt-0.5" />
                  <span className="text-[#C4764A]/80">Até 20 pacientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#518C5B] flex-shrink-0 mt-0.5" />
                  <span className="text-[#C4764A]/80">Agendamento básico</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#518C5B] flex-shrink-0 mt-0.5" />
                  <span className="text-[#C4764A]/80">Lembretes por e-mail</span>
                </li>
              </ul>
              <Button
                className="w-full bg-[#518C5B] hover:bg-[#518C5B]/90 text-white"
                onClick={() => window.location.href = '/auth'}
              >
                Começar Grátis
              </Button>
            </Card>

            <Card className="p-8 border-[#C4764A] border-2 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C4764A] text-white px-4 py-1 rounded-full text-sm font-semibold">
                Mais Popular
              </div>
              <h3 className="text-2xl font-bold text-[#518C5B] mb-2">Profissional</h3>
              <p className="text-[#C4764A]/70 mb-6">Para crescer</p>
              <div className="text-4xl font-bold text-[#518C5B] mb-6">
                R$ 97<span className="text-lg font-normal">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#518C5B] flex-shrink-0 mt-0.5" />
                  <span className="text-[#C4764A]/80">Pacientes ilimitados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#518C5B] flex-shrink-0 mt-0.5" />
                  <span className="text-[#C4764A]/80">Lembretes WhatsApp + SMS</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#518C5B] flex-shrink-0 mt-0.5" />
                  <span className="text-[#C4764A]/80">Integração Google Calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#518C5B] flex-shrink-0 mt-0.5" />
                  <span className="text-[#C4764A]/80">Relatórios avançados</span>
                </li>
              </ul>
              <Button
                className="w-full bg-[#C4764A] hover:bg-[#C4764A]/90 text-white"
                onClick={() => window.location.href = '/auth'}
              >
                Começar Teste Grátis
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#518C5B] mb-6">
            Pronto para organizar sua agenda?
          </h2>
          <p className="text-lg text-[#C4764A]/80 mb-8">
            Comece gratuitamente hoje mesmo. Sem cartão de crédito necessário.
          </p>
          <Button
            className="bg-[#518C5B] hover:bg-[#518C5B]/90 text-white px-8 py-6 text-lg"
            onClick={() => window.location.href = '/auth'}
          >
            Criar Conta Gratuita
          </Button>
        </div>
      </section>
    </div>
  );

  const authContent = <Navigate to="/agenda" replace />;

  return (
    <HybridPage
      publicContent={publicContent}
      authContent={authContent}
      title="Atendimento"
      description="Sistema de agendamento inteligente para nutricionistas. Gerencie consultas, envie lembretes e acesse histórico completo."
    />
  );
}
