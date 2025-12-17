import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';

interface OnboardingTourProps {
  nutritionistId: string;
  onComplete?: () => void;
  forceStart?: boolean;
}

const TOUR_COMPLETED_KEY = 'nutriflow_tour_completed';

export function OnboardingTour({ nutritionistId, onComplete, forceStart = false }: OnboardingTourProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    // BOAS-VINDAS
    {
      target: 'body',
      content: (
        <div className="text-center space-y-3">
          <div className="text-3xl">👋</div>
          <h2 className="text-xl font-bold text-primary">Bem-vinda ao NutriFlow!</h2>
          <p className="text-muted-foreground">
            Vamos te mostrar como o <strong>FlowTech Group</strong> simplifica sua rotina de atendimentos nutricionais.
          </p>
          <p className="text-sm text-muted-foreground">
            Este tour completo leva cerca de 3 minutos. Vamos lá? 🚀
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
      styles: { options: { width: 420 } },
    },
    // SIDEBAR - HOME
    {
      target: '[data-tour="nav-home"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">🏠 Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Sua central de comando. Veja estatísticas, próximas consultas e atalhos rápidos.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    // SIDEBAR - PACIENTES
    {
      target: '[data-tour="nav-pacientes"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">👥 Pacientes</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie todos os seus pacientes em um só lugar. Cadastre, edite e acompanhe a evolução de cada um.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    // SIDEBAR - AGENDA
    {
      target: '[data-tour="nav-agenda"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">📅 Agenda</h3>
          <p className="text-sm text-muted-foreground">
            Organize suas consultas com o calendário interativo. Agende, reagende e marque consultas como realizadas.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    // SIDEBAR - BIBLIOTECA
    {
      target: '[data-tour="nav-biblioteca"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">📚 Biblioteca</h3>
          <p className="text-sm text-muted-foreground">
            Crie sua biblioteca pessoal de <strong>alimentos e receitas</strong> personalizados para usar nas prescrições.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    // SIDEBAR - FINANCEIRO
    {
      target: '[data-tour="nav-financeiro"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">💰 Financeiro</h3>
          <p className="text-sm text-muted-foreground">
            Controle suas receitas e despesas. Visualize gráficos de faturamento e gerencie pendências.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    // SIDEBAR - CONFIGURAÇÕES
    {
      target: '[data-tour="nav-config"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">⚙️ Configurações</h3>
          <p className="text-sm text-muted-foreground">
            Personalize seu perfil: <strong>logo, cores, CRN e assinatura</strong> que aparecem nos PDFs e Portal do Paciente.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    // NOVO PACIENTE
    {
      target: '[data-tour="new-patient"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">📋 Cadastre seus Pacientes</h3>
          <p className="text-sm text-muted-foreground">
            Aqui começa a jornada! Clique para cadastrar um novo paciente com todos os dados de anamnese.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    // NOVA CONSULTA / IA
    {
      target: '[data-tour="ai-consultation"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">🤖 Anamnese com IA</h3>
          <p className="text-sm text-muted-foreground">
            <strong>Escreva naturalmente</strong> o que o paciente relata e nossa IA preenche automaticamente os campos estruturados.
          </p>
          <p className="text-xs text-muted-foreground italic">
            "Paciente relata dor de cabeça frequente, dorme mal..." → A IA organiza tudo!
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    // MODO ZEN
    {
      target: '[data-tour="zen-mode"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">🧘 Modo Zen</h3>
          <p className="text-sm text-muted-foreground">
            Ative para uma interface <strong>mais limpa e focada</strong>. Esconde estatísticas e exibe apenas o essencial.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    // PERSONALIZAR DASHBOARD
    {
      target: '[data-tour="customize-dashboard"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">🎛️ Personalizar</h3>
          <p className="text-sm text-muted-foreground">
            Escolha quais widgets exibir no seu Dashboard. O sistema se adapta ao <strong>seu fluxo de trabalho</strong>.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    // SUPORTE
    {
      target: '[data-tour="support-button"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">💬 Suporte</h3>
          <p className="text-sm text-muted-foreground">
            Dúvidas ou problemas? Abra um ticket e nossa equipe responde em até 24h. Você também pode <strong>reiniciar este tour</strong> por aqui!
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    // PORTAL DO PACIENTE
    {
      target: '[data-tour="patient-portal"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">📱 Portal do Paciente</h3>
          <p className="text-sm text-muted-foreground">
            Seu paciente tem acesso mobile exclusivo! Ele acompanha a dieta, registra peso e água pelo celular.
          </p>
          <p className="text-xs text-muted-foreground">
            Copie o link ou envie por email com um clique.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
      spotlightClicks: false,
    },
    // CONFIGURAÇÕES - PROFILE
    {
      target: '[data-tour="profile-settings"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">🎨 Personalize sua Marca</h3>
          <p className="text-sm text-muted-foreground">
            Suba sua <strong>logo</strong>, defina suas <strong>cores</strong> e adicione sua <strong>assinatura</strong>. Tudo aparece automaticamente nos PDFs e no Portal do Paciente.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    // FINALIZAÇÃO
    {
      target: 'body',
      content: (
        <div className="text-center space-y-3">
          <div className="text-3xl">🎉</div>
          <h2 className="text-xl font-bold text-primary">Pronta para começar!</h2>
          <p className="text-muted-foreground">
            Você já conhece o NutriFlow completo. Qualquer dúvida, acesse o <strong>Suporte</strong> no topo da página.
          </p>
          <p className="text-sm text-muted-foreground">
            Dica: Você pode reiniciar este tour a qualquer momento pelo botão de Suporte.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
      styles: { options: { width: 420 } },
    },
  ];

  useEffect(() => {
    const tourCompleted = localStorage.getItem(`${TOUR_COMPLETED_KEY}_${nutritionistId}`);
    
    if (forceStart) {
      setStepIndex(0);
      setRun(true);
    } else if (!tourCompleted) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [nutritionistId, forceStart]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      localStorage.setItem(`${TOUR_COMPLETED_KEY}_${nutritionistId}`, 'true');
      setRun(false);
      onComplete?.();
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextIndex);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      spotlightClicks
      callback={handleJoyrideCallback}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular Tour',
      }}
      styles={{
        options: {
          primaryColor: 'hsl(142, 26%, 39%)',
          backgroundColor: 'hsl(var(--card))',
          textColor: 'hsl(var(--foreground))',
          arrowColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipContent: {
          padding: '8px 0',
        },
        buttonNext: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          borderRadius: 8,
          marginRight: 8,
          color: 'hsl(var(--muted-foreground))',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: 13,
        },
        spotlight: {
          borderRadius: 12,
        },
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
}

export function restartOnboardingTour(nutritionistId: string) {
  localStorage.removeItem(`${TOUR_COMPLETED_KEY}_${nutritionistId}`);
}

export function isTourCompleted(nutritionistId: string): boolean {
  return localStorage.getItem(`${TOUR_COMPLETED_KEY}_${nutritionistId}`) === 'true';
}
