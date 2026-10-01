import { useState, useEffect, useRef } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';

interface PageTourProps {
  tourKey: string;
  steps: Step[];
  run?: boolean;
  onComplete?: () => void;
}

export function PageTour({ tourKey, steps, run = false, onComplete }: PageTourProps) {
  const [shouldRun, setShouldRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only check once per mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    const storageKey = `tour_${tourKey}`;
    const tourCompleted = localStorage.getItem(storageKey) === 'true';
    
    // Only start tour if run is true AND tour was never completed
    if (run && !tourCompleted) {
      const timer = setTimeout(() => {
        // Double check before starting
        if (localStorage.getItem(storageKey) !== 'true') {
          setShouldRun(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tourKey, run]);

  const handleCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finished: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finished.includes(status)) {
      localStorage.setItem(`tour_${tourKey}`, 'true');
      setShouldRun(false);
      onComplete?.();
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }
  };

  if (!shouldRun || steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={shouldRun}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      callback={handleCallback}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular',
      }}
      styles={{
        options: {
          primaryColor: 'hsl(142, 26%, 39%)',
          backgroundColor: 'hsl(var(--card))',
          textColor: 'hsl(var(--foreground))',
          arrowColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
        },
        tooltip: { borderRadius: 12, padding: 16 },
        buttonNext: { borderRadius: 8, padding: '8px 16px', fontSize: 14 },
        buttonBack: { borderRadius: 8, marginRight: 8, color: 'hsl(var(--muted-foreground))' },
        buttonSkip: { color: 'hsl(var(--muted-foreground))', fontSize: 13 },
        spotlight: { borderRadius: 12 },
      }}
      floaterProps={{ disableAnimation: true }}
    />
  );
}

// Tour steps for each page
export const patientsTourSteps: Step[] = [
  {
    target: '[data-tour="patients-new-btn"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">➕ Novo Paciente</h3>
        <p className="text-sm text-muted-foreground">
          Clique aqui para cadastrar um novo paciente com todos os dados de anamnese.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: 'table',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">📋 Lista de Pacientes</h3>
        <p className="text-sm text-muted-foreground">
          Aqui você visualiza todos os seus pacientes. Clique em "Ver" para acessar os detalhes e iniciar uma consulta.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
];

export const agendaTourSteps: Step[] = [
  {
    target: '[data-tour="agenda-new-btn"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">📅 Novo Agendamento</h3>
        <p className="text-sm text-muted-foreground">
          Clique aqui para agendar uma nova consulta selecionando paciente, data e horário.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.rdp',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">🗓️ Calendário</h3>
        <p className="text-sm text-muted-foreground">
          Selecione uma data no calendário para ver as consultas agendadas para aquele dia.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
];

export const bibliotecaTourSteps: Step[] = [
  {
    target: '[data-tour="biblioteca-foods-tab"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">🍎 Alimentos</h3>
        <p className="text-sm text-muted-foreground">
          Nesta aba você cadastra <strong>alimentos personalizados</strong> com informações nutricionais para usar nas prescrições.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="biblioteca-recipes-tab"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">👨‍🍳 Receitas</h3>
        <p className="text-sm text-muted-foreground">
          Crie <strong>receitas personalizadas</strong> manualmente ou com ajuda da IA para incluir nos planos alimentares.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="biblioteca-new-food"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">➕ Novo Alimento</h3>
        <p className="text-sm text-muted-foreground">
          Cadastre um novo alimento informando nome, unidade de medida e valores de macros.
        </p>
      </div>
    ),
    placement: 'left',
    disableBeacon: true,
  },
];

export const financeiroTourSteps: Step[] = [
  {
    target: '[data-tour="financeiro-new-btn"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">💰 Novo Lançamento</h3>
        <p className="text-sm text-muted-foreground">
          Registre receitas e despesas do seu consultório. Consultas finalizadas geram lançamentos automaticamente.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.recharts-responsive-container',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">📊 Gráfico de Receitas</h3>
        <p className="text-sm text-muted-foreground">
          Acompanhe a evolução do seu faturamento nos últimos 6 meses de forma visual.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
];

export const profileTourSteps: Step[] = [
  {
    target: '[data-tour="profile-logo"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">🖼️ Sua Logo</h3>
        <p className="text-sm text-muted-foreground">
          Faça upload da sua logo para personalizar PDFs de planos alimentares e o Portal do Paciente.
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="profile-colors"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">🎨 Cores da Marca</h3>
        <p className="text-sm text-muted-foreground">
          Defina as cores primária e secundária da sua marca para criar uma identidade visual consistente.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="profile-signature"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-primary">✍️ Assinatura</h3>
        <p className="text-sm text-muted-foreground">
          Adicione uma assinatura personalizada que aparecerá no rodapé do Portal do Paciente.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
];

// Helper to restart a specific page tour
export function restartPageTour(tourKey: string) {
  localStorage.removeItem(`tour_${tourKey}`);
}

// Helper to check if page tour was completed
export function isPageTourCompleted(tourKey: string): boolean {
  return localStorage.getItem(`tour_${tourKey}`) === 'true';
}
