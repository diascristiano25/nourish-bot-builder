// Mock content data for NutriFlow professional landing page
// All copy in Brazilian Portuguese (pt-BR)

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'month' | 'year';
  description: string;
  features: string[];
  highlighted: boolean;
  ctaText: string;
  ctaLink: string;
}

export interface FeatureTab {
  id: string;
  label: string;
  screenshot: string;
  features: Array<{
    icon: string; // Phosphor icon name
    title: string;
    description: string;
  }>;
}

export interface Testimonial {
  id: string;
  name: string;
  photo: string;
  city: string;
  state: string;
  instagram: string;
  quote: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'funcionalidade' | 'precos' | 'suporte' | 'tecnico';
}

export const heroContent = {
  headline: 'Software de Nutrição Profissional',
  subheadline: 'Crie cardápios personalizados, gerencie consultas e acompanhe a evolução dos pacientes em uma única plataforma',
  screenshotUrl: 'https://picsum.photos/seed/nutriflow-dashboard/1200/800'
};

export const pricingPlans: PricingPlan[] = [
  {
    id: 'basico',
    name: 'Básico',
    price: 97,
    billingPeriod: 'month',
    description: 'Para nutricionistas iniciando a carreira digital',
    features: [
      'Até 30 pacientes ativos',
      'Cardápios personalizados ilimitados',
      'Anamnese digital completa',
      'Relatórios básicos de evolução',
      'Suporte por email'
    ],
    highlighted: false,
    ctaText: 'Começar agora',
    ctaLink: '#signup'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 197,
    billingPeriod: 'month',
    description: 'Para consultórios estabelecidos com demanda crescente',
    features: [
      'Até 100 pacientes ativos',
      'Tudo do plano Básico',
      'Agendamento online integrado',
      'Biblioteca de receitas personalizadas',
      'Relatórios avançados e gráficos',
      'WhatsApp Business integrado',
      'Suporte prioritário'
    ],
    highlighted: true,
    ctaText: 'Teste grátis por 14 dias',
    ctaLink: '#signup'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 397,
    billingPeriod: 'month',
    description: 'Para clínicas com múltiplos profissionais',
    features: [
      'Pacientes ilimitados',
      'Tudo do plano Pro',
      'Múltiplos usuários (até 5 nutricionistas)',
      'API para integrações personalizadas',
      'Exportação de dados completa',
      'Gerente de conta dedicado',
      'Suporte 24/7 via WhatsApp'
    ],
    highlighted: false,
    ctaText: 'Falar com consultor',
    ctaLink: '#contact'
  }
];

export const featureTabs: FeatureTab[] = [
  {
    id: 'atendimento',
    label: 'Atendimento',
    screenshot: 'https://picsum.photos/seed/nutriflow-atendimento/800/600',
    features: [
      {
        icon: 'CalendarBlank',
        title: 'Agenda integrada',
        description: 'Gestão completa de consultas com lembretes automáticos via WhatsApp'
      },
      {
        icon: 'ClipboardText',
        title: 'Prontuário digital',
        description: 'Registro completo de cada consulta com histórico de evolução'
      },
      {
        icon: 'ChatsCircle',
        title: 'Chat com paciente',
        description: 'Comunicação direta e segura para dúvidas entre consultas'
      },
      {
        icon: 'Bell',
        title: 'Lembretes automáticos',
        description: 'Notificações de consulta, renovação de cardápio e check-ins'
      },
      {
        icon: 'ChartLine',
        title: 'Acompanhamento de metas',
        description: 'Visualize o progresso do paciente em tempo real com gráficos'
      }
    ]
  },
  {
    id: 'prescricao',
    label: 'Prescrição',
    screenshot: 'https://picsum.photos/seed/nutriflow-prescricao/800/600',
    features: [
      {
        icon: 'ForkKnife',
        title: 'Cardápios personalizados',
        description: 'Monte planos alimentares adaptados às restrições e preferências'
      },
      {
        icon: 'ShoppingCart',
        title: 'Lista de compras automática',
        description: 'Geração instantânea de lista com quantidades precisas'
      },
      {
        icon: 'ArrowsClockwise',
        title: 'Substituições inteligentes',
        description: 'Sugestões de trocas mantendo equivalência nutricional'
      },
      {
        icon: 'Target',
        title: 'Cálculo de macros',
        description: 'Distribuição automática de proteínas, carboidratos e gorduras'
      },
      {
        icon: 'FileText',
        title: 'Biblioteca de receitas',
        description: 'Crie e reutilize preparações favoritas dos seus pacientes'
      }
    ]
  },
  {
    id: 'gestao',
    label: 'Gestão',
    screenshot: 'https://picsum.photos/seed/nutriflow-gestao/800/600',
    features: [
      {
        icon: 'CurrencyDollar',
        title: 'Controle financeiro',
        description: 'Acompanhe recebimentos, pendências e fluxo de caixa'
      },
      {
        icon: 'ChartLine',
        title: 'Relatórios gerenciais',
        description: 'Dashboards com métricas de atendimento e faturamento'
      },
      {
        icon: 'UserCircle',
        title: 'Múltiplos profissionais',
        description: 'Gerencie equipe com permissões e agendas independentes'
      },
      {
        icon: 'FileText',
        title: 'Documentos fiscais',
        description: 'Emissão de recibos e notas fiscais integrada'
      },
      {
        icon: 'Bell',
        title: 'Alertas de gestão',
        description: 'Notificações de pagamentos atrasados e renovações'
      }
    ]
  },
  {
    id: 'anamnese',
    label: 'Anamnese',
    screenshot: 'https://picsum.photos/seed/nutriflow-anamnese/800/600',
    features: [
      {
        icon: 'ClipboardText',
        title: 'Formulários personalizáveis',
        description: 'Crie questionários adaptados ao seu método de trabalho'
      },
      {
        icon: 'Image',
        title: 'Registro fotográfico',
        description: 'Anexe fotos de evolução corporal e exames laboratoriais'
      },
      {
        icon: 'ChartLine',
        title: 'Histórico de medidas',
        description: 'Gráficos automáticos de peso, circunferências e bioimpedância'
      },
      {
        icon: 'FileText',
        title: 'Exames laboratoriais',
        description: 'Armazene e compare resultados de exames ao longo do tempo'
      },
      {
        icon: 'Target',
        title: 'Objetivos do paciente',
        description: 'Documente metas e acompanhe o alcance dos resultados'
      }
    ]
  }
];

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Dra. Mariana Oliveira',
    photo: 'https://i.pravatar.cc/150?img=5',
    city: 'São Paulo',
    state: 'SP',
    instagram: 'nutri.marianaoliveira',
    quote: 'Reduzi 40% do tempo gasto com burocracia. Agora consigo atender 3 pacientes a mais por dia e ainda ter tempo para criar conteúdo.'
  },
  {
    id: 't2',
    name: 'Dr. Rafael Costa',
    photo: 'https://i.pravatar.cc/150?img=12',
    city: 'Rio de Janeiro',
    state: 'RJ',
    instagram: 'nutrirafa',
    quote: 'O diferencial é a anamnese digital. Meus pacientes preenchem antes da consulta e economizo 20 minutos que uso para aprofundar a estratégia nutricional.'
  },
  {
    id: 't3',
    name: 'Dra. Juliana Mendes',
    photo: 'https://i.pravatar.cc/150?img=9',
    city: 'Belo Horizonte',
    state: 'MG',
    instagram: 'dra.junutri',
    quote: 'Tenho 2 consultórios e 85 pacientes ativos. O NutriFlow sincroniza tudo em tempo real e consigo trabalhar de qualquer lugar.'
  },
  {
    id: 't4',
    name: 'Dra. Camila Souza',
    photo: 'https://i.pravatar.cc/150?img=47',
    city: 'Curitiba',
    state: 'PR',
    instagram: 'camila.nutricao',
    quote: 'Os gráficos de evolução mudaram meu atendimento. Mostro para o paciente em 30 segundos o que antes levava 10 minutos explicando.'
  },
  {
    id: 't5',
    name: 'Dr. Lucas Pereira',
    photo: 'https://i.pravatar.cc/150?img=15',
    city: 'Porto Alegre',
    state: 'RS',
    instagram: 'lucasnutri.rs',
    quote: 'Migrei 120 pacientes em um fim de semana. A importação funcionou perfeitamente e não perdi nenhum histórico.'
  },
  {
    id: 't6',
    name: 'Dra. Fernanda Lima',
    photo: 'https://i.pravatar.cc/150?img=20',
    city: 'Brasília',
    state: 'DF',
    instagram: 'fe.nutri',
    quote: 'O suporte respondeu minha dúvida em 15 minutos via WhatsApp. Isso no fim de semana. Qualidade que não esperava encontrar.'
  }
];

export const faqItems: FAQItem[] = [
  {
    id: 'faq1',
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim, você pode cancelar seu plano a qualquer momento diretamente no painel de configurações. Não há multa ou burocracia. Seu acesso permanece ativo até o final do período pago.',
    category: 'precos'
  },
  {
    id: 'faq2',
    question: 'Meus dados estão seguros? O sistema é LGPD compliant?',
    answer: 'Sim. Todos os dados são criptografados em repouso e em trânsito. Somos 100% compatíveis com a LGPD e possuímos certificação ISO 27001. Realizamos backups diários e você pode exportar seus dados a qualquer momento.',
    category: 'tecnico'
  },
  {
    id: 'faq3',
    question: 'Funciona offline?',
    answer: 'Não, o NutriFlow é uma plataforma web que requer conexão com internet. Isso garante que seus dados estejam sempre sincronizados entre dispositivos e protegidos por backups automáticos.',
    category: 'tecnico'
  },
  {
    id: 'faq4',
    question: 'Posso parcelar o pagamento?',
    answer: 'Sim, aceitamos parcelamento em até 12x no cartão de crédito sem juros para planos anuais. Planos mensais são cobrados em parcela única.',
    category: 'precos'
  },
  {
    id: 'faq5',
    question: 'Tem aplicativo mobile?',
    answer: 'Atualmente o NutriFlow funciona via navegador web, otimizado para desktop, tablet e celular. O app nativo para iOS e Android está em desenvolvimento e será lançado no primeiro trimestre de 2027.',
    category: 'funcionalidade'
  },
  {
    id: 'faq6',
    question: 'Como funciona o período de teste?',
    answer: 'Oferecemos 14 dias de teste gratuito no plano Pro, sem solicitar cartão de crédito. Você tem acesso completo a todas as funcionalidades. Ao final, escolhe se quer continuar e qual plano contratar.',
    category: 'precos'
  },
  {
    id: 'faq7',
    question: 'Posso importar meus pacientes de outro sistema?',
    answer: 'Sim. Aceitamos importação via planilha Excel ou CSV. Nossa equipe oferece suporte guiado durante o processo para garantir que nenhum dado seja perdido. A migração costuma levar menos de 2 horas.',
    category: 'funcionalidade'
  },
  {
    id: 'faq8',
    question: 'Vocês oferecem treinamento?',
    answer: 'Sim. Todo novo cliente recebe onboarding de 30 minutos via Google Meet. Também oferecemos base de conhecimento com vídeos e artigos, além de webinars mensais com dicas avançadas.',
    category: 'suporte'
  },
  {
    id: 'faq9',
    question: 'Posso usar em múltiplos dispositivos?',
    answer: 'Sim, você pode acessar de qualquer navegador (Chrome, Firefox, Safari, Edge) em computador, tablet ou celular. Seus dados sincronizam automaticamente entre todos os dispositivos.',
    category: 'funcionalidade'
  },
  {
    id: 'faq10',
    question: 'O que acontece se eu exceder o limite de pacientes?',
    answer: 'Você receberá um aviso quando atingir 90% do limite. Para adicionar novos pacientes, basta fazer upgrade para o próximo plano. A cobrança é proporcional ao período restante.',
    category: 'suporte'
  }
];
