import { useState, useEffect, useRef } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingTourProps {
  nutritionistId: string;
  onComplete?: () => void;
  forceStart?: boolean;
}

export function OnboardingTour({ nutritionistId, onComplete, forceStart = false }: OnboardingTourProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const hasChecked = useRef(false);

  const steps: Step[] = [
    // BOAS-VINDAS
    {
      target: 'body',
      content: (
        <div className="text-center space-y-4 py-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyber-lime/20 to-electric-violet/20 flex items-center justify-center border border-cyber-lime/30">
            <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent">
            Bem-vinda ao NutriFlow 2026!
          </h2>
          <p className="text-muted-foreground text-sm">
            Vamos te mostrar como o <span className="text-cyber-lime font-semibold">FlowTech Group</span> simplifica sua rotina de atendimentos.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Duração: aproximadamente 3 minutos
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
      styles: { options: { width: 440 } },
    },
    // SIDEBAR - HOME
    {
      target: '[data-tour="nav-home"]',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏠</span>
            <h3 className="font-semibold text-cyber-lime">Dashboard</h3>
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <h3 className="font-semibold text-cyber-lime">Pacientes</h3>
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <h3 className="font-semibold text-cyber-lime">Agenda</h3>
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <h3 className="font-semibold text-cyber-lime">Biblioteca</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Crie sua biblioteca pessoal de <span className="text-electric-violet font-medium">alimentos e receitas</span> personalizados para usar nas prescrições.
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
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <h3 className="font-semibold text-cyber-lime">Financeiro</h3>
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <h3 className="font-semibold text-cyber-lime">Configurações</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Personalize seu perfil: <span className="text-electric-violet font-medium">logo, cores, CRN e assinatura</span> que aparecem nos PDFs e Portal do Paciente.
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
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h3 className="font-semibold text-cyber-lime">Cadastre seus Pacientes</h3>
          </div>
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
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <h3 className="font-semibold text-cyber-lime">Anamnese com IA</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="text-electric-violet font-medium">Escreva naturalmente</span> o que o paciente relata e nossa IA preenche automaticamente os campos estruturados.
          </p>
          <p className="text-xs text-muted-foreground/70 italic font-mono">
            "Paciente relata dor de cabeça frequente..." → IA organiza tudo!
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
          <div className="flex items-center gap-2">
            <span className="text-lg">🧘</span>
            <h3 className="font-semibold text-cyber-lime">Modo Zen</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Ative para uma interface <span className="text-electric-violet font-medium">mais limpa e focada</span>. Esconde estatísticas e exibe apenas o essencial.
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
          <div className="flex items-center gap-2">
            <span className="text-lg">🎛️</span>
            <h3 className="font-semibold text-cyber-lime">Personalizar</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Escolha quais widgets exibir no seu Dashboard. O sistema se adapta ao <span className="text-electric-violet font-medium">seu fluxo de trabalho</span>.
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
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <h3 className="font-semibold text-cyber-lime">AI Concierge</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Dúvidas ou problemas? Abra um ticket e nossa equipe responde em até 24h. Você também pode <span className="text-electric-violet font-medium">reiniciar este tour</span> por aqui!
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
          <div className="flex items-center gap-2">
            <span className="text-lg">📱</span>
            <h3 className="font-semibold text-cyber-lime">Portal do Paciente</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Seu paciente tem acesso mobile exclusivo! Ele acompanha a dieta, registra peso e água pelo celular.
          </p>
          <p className="text-xs text-muted-foreground/70">
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
          <div className="flex items-center gap-2">
            <span className="text-lg">🎨</span>
            <h3 className="font-semibold text-cyber-lime">Personalize sua Marca</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Suba sua <span className="text-electric-violet font-medium">logo</span>, defina suas <span className="text-electric-violet font-medium">cores</span> e adicione sua <span className="text-electric-violet font-medium">assinatura</span>. Tudo aparece automaticamente nos PDFs e no Portal do Paciente.
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
        <div className="text-center space-y-4 py-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyber-lime/20 to-electric-violet/20 flex items-center justify-center border border-cyber-lime/30">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent">
            Pronta para começar!
          </h2>
          <p className="text-muted-foreground text-sm">
            Você já conhece o NutriFlow completo. Qualquer dúvida, acesse o <span className="text-cyber-lime font-semibold">AI Concierge</span> no topo da página.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Dica: Reinicie este tour pelo botão de Suporte
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
      styles: { options: { width: 440 } },
    },
  ];

  useEffect(() => {
    if (hasChecked.current && !forceStart) return;
    
    const checkOnboardingStatus = async () => {
      if (forceStart) {
        hasChecked.current = false;
        setStepIndex(0);
        setRun(true);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('has_seen_onboarding')
        .eq('id', nutritionistId)
        .single();

      if (!data?.has_seen_onboarding && !hasChecked.current) {
        hasChecked.current = true;
        const timer = setTimeout(() => {
          setRun(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        hasChecked.current = true;
      }
    };

    checkOnboardingStatus();
  }, [nutritionistId, forceStart]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      await supabase
        .from('profiles')
        .update({ has_seen_onboarding: true })
        .eq('id', nutritionistId);
      
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
          primaryColor: '#DFFF00',
          backgroundColor: 'hsl(220, 20%, 10%)',
          textColor: 'hsl(var(--foreground))',
          arrowColor: 'hsl(220, 20%, 10%)',
          overlayColor: 'rgba(15, 18, 22, 0.95)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 16,
          padding: 24,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 0 40px rgba(223, 255, 0, 0.15), 0 0 80px rgba(139, 92, 246, 0.1)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipContent: {
          padding: '8px 0',
        },
        buttonNext: {
          borderRadius: 12,
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 600,
          backgroundColor: '#DFFF00',
          color: '#0F1216',
        },
        buttonBack: {
          borderRadius: 12,
          marginRight: 8,
          color: 'hsl(var(--muted-foreground))',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: 13,
        },
        spotlight: {
          borderRadius: 16,
          boxShadow: '0 0 0 4px rgba(223, 255, 0, 0.3)',
        },
        beacon: {
          backgroundColor: '#DFFF00',
        },
        beaconInner: {
          backgroundColor: '#DFFF00',
        },
        beaconOuter: {
          backgroundColor: 'rgba(223, 255, 0, 0.3)',
        },
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
}

export async function restartOnboardingTour(nutritionistId: string) {
  await supabase
    .from('profiles')
    .update({ has_seen_onboarding: false })
    .eq('id', nutritionistId);
}

export async function isTourCompleted(nutritionistId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('has_seen_onboarding')
    .eq('id', nutritionistId)
    .single();
  
  return data?.has_seen_onboarding ?? false;
}
