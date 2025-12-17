import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import { useNavigate } from 'react-router-dom';

interface OnboardingTourProps {
  nutritionistId: string;
  onComplete?: () => void;
  forceStart?: boolean;
}

const TOUR_COMPLETED_KEY = 'nutriflow_tour_completed';

export function OnboardingTour({ nutritionistId, onComplete, forceStart = false }: OnboardingTourProps) {
  const navigate = useNavigate();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
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
            Este tour leva menos de 2 minutos. Vamos lá? 🚀
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
      styles: {
        options: {
          width: 400,
        },
      },
    },
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
    },
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
    {
      target: 'body',
      content: (
        <div className="text-center space-y-3">
          <div className="text-3xl">🎉</div>
          <h2 className="text-xl font-bold text-primary">Pronta para começar!</h2>
          <p className="text-muted-foreground">
            Você já conhece o essencial do NutriFlow. Qualquer dúvida, acesse o <strong>Suporte</strong> no menu.
          </p>
          <p className="text-sm text-muted-foreground">
            Dica: Você pode reiniciar este tour a qualquer momento pelo menu de Suporte.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
      styles: {
        options: {
          width: 400,
        },
      },
    },
  ];

  useEffect(() => {
    // Check if tour should run
    const tourCompleted = localStorage.getItem(`${TOUR_COMPLETED_KEY}_${nutritionistId}`);
    
    if (forceStart) {
      setStepIndex(0);
      setRun(true);
    } else if (!tourCompleted) {
      // Small delay to let the page render
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
      // Tour completed or skipped
      localStorage.setItem(`${TOUR_COMPLETED_KEY}_${nutritionistId}`, 'true');
      setRun(false);
      onComplete?.();
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Go to next step
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
          primaryColor: 'hsl(142, 26%, 39%)', // Primary mint green
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

// Helper function to restart tour
export function restartOnboardingTour(nutritionistId: string) {
  localStorage.removeItem(`${TOUR_COMPLETED_KEY}_${nutritionistId}`);
}

// Helper function to check if tour was completed
export function isTourCompleted(nutritionistId: string): boolean {
  return localStorage.getItem(`${TOUR_COMPLETED_KEY}_${nutritionistId}`) === 'true';
}
