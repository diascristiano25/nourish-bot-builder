/**
 * Criativos de Tráfego Pago - NutriFlow
 * Variações persuasivas para capturar nutricionistas dos concorrentes
 */

export interface AdCreative {
  id: string;
  category: 'dor' | 'velocidade' | 'economia' | 'tecnologia' | 'autoridade' | 'exclusividade';
  target: string;
  headline: string;
  subheadline: string;
  body: string;
  cta: string;
  imagePrompt: string;
  psychologicalTriggers: string[];
  competitorWeaknesses: string[];
}

export const adCreatives: AdCreative[] = [
  // GATILHO 1: DOR - Perda de tempo com planilhas
  {
    id: 'dor-planilhas-01',
    category: 'dor',
    target: 'Nutricionistas que usam Excel/Planilhas',
    headline: 'Ainda perdendo 4h por semana no Excel?',
    subheadline: 'Cardápios em 3 minutos com IA. Não é mágica, é NutriFlow.',
    body: 'Enquanto você perde horas montando cardápios manualmente, seus colegas já estão gerando planos completos com IA em minutos. Cálculos automáticos, ajustes instantâneos, zero erro. Pare de trabalhar como em 2010.',
    cta: 'Quero testar grátis por 7 dias',
    imagePrompt: 'Split screen: esquerda mostra nutricionista cansada com pilha de planilhas Excel, direita mostra nutricionista sorrindo com tablet gerando cardápio em segundos',
    psychologicalTriggers: ['Dor', 'FOMO', 'Contraste', 'Prova Social'],
    competitorWeaknesses: ['Workflow manual', 'Sem IA', 'Processo lento']
  },

  // GATILHO 2: VELOCIDADE - IA que gera cardápios instantaneamente
  {
    id: 'velocidade-ia-01',
    category: 'velocidade',
    target: 'Nutricionistas sobrecarregados',
    headline: '3 minutos. Do zero ao cardápio completo.',
    subheadline: 'IA treinada com 10.000+ cardápios reais. TACO integrado.',
    body: 'Seus pacientes não esperam. Você não tem tempo. A IA do NutriFlow gera cardápios personalizados em segundos, com cálculos nutricionais precisos e ajustes automáticos. Atenda 3x mais pacientes sem contratar ajuda.',
    cta: 'Ver a IA em ação (demo grátis)',
    imagePrompt: 'Cronômetro mostrando 3 minutos com cardápio completo sendo gerado em tempo real na tela do NutriFlow',
    psychologicalTriggers: ['Urgência', 'Eficiência', 'Ganho de Tempo', 'Escalabilidade'],
    competitorWeaknesses: ['Processo manual demorado', 'Sem automação IA']
  },

  // GATILHO 3: ECONOMIA - Economiza dinheiro vs concorrentes
  {
    id: 'economia-preco-01',
    category: 'economia',
    target: 'Nutricionistas que pagam caro em outros SaaS',
    headline: 'R$ 47/mês. Sério.',
    subheadline: 'Enquanto eles cobram R$ 150+, você tem IA + tudo ilimitado.',
    body: 'Outros SaaS cobram R$ 150-300/mês por funcionalidades básicas. NutriFlow entrega IA generativa, pacientes ilimitados, cardápios ilimitados e suporte real por menos de R$ 2/dia. Simples assim.',
    cta: 'Começar agora por R$ 47/mês',
    imagePrompt: 'Tabela comparativa mostrando NutriFlow R$47 vs Concorrente A R$197 vs Concorrente B R$297, com check marks nas features',
    psychologicalTriggers: ['Economia', 'Valor Percebido', 'Ancoragem de Preço'],
    competitorWeaknesses: ['Preço alto', 'Cobranças ocultas', 'Planos limitados']
  },

  // GATILHO 4: TECNOLOGIA - IA vs Ferramentas antigas
  {
    id: 'tech-ia-moderna-01',
    category: 'tecnologia',
    target: 'Early adopters e nutricionistas tech-savvy',
    headline: 'Seus concorrentes já descobriram a IA.',
    subheadline: 'E você ainda está usando software de 2015?',
    body: 'Gemini 2.5 Flash. Ajustes em tempo real. Substituições inteligentes de alimentos. Cálculos automáticos. Enquanto você digita manualmente, a nova geração de nutris já está 10x mais rápida. Tecnologia de 2026, não de 2016.',
    cta: 'Testar a IA grátis (sem cartão)',
    imagePrompt: 'Contraste futurista: software antigo em preto e branco vs interface moderna do NutriFlow com IA brilhante',
    psychologicalTriggers: ['FOMO', 'Inovação', 'Status', 'Medo de Ficar Pra Trás'],
    competitorWeaknesses: ['Tecnologia defasada', 'Sem IA', 'Interface antiga']
  },

  // GATILHO 5: AUTORIDADE - Usado por nutricionistas reais
  {
    id: 'autoridade-social-proof-01',
    category: 'autoridade',
    target: 'Nutricionistas céticos',
    headline: '847 nutricionistas migraram em 2026.',
    subheadline: 'Incluindo 3 dos top 10 do Instagram nutricional BR.',
    body: 'Não somos o maior. Ainda. Mas somos o preferido de nutricionistas que realmente atendem. Portal do paciente com cardápio interativo. Geração de PDF profissional. WhatsApp integrado. Feito por quem entende consultório.',
    cta: 'Ver cases reais de nutricionistas',
    imagePrompt: 'Mosaico de fotos de nutricionistas reais (rostos borrados) usando o NutriFlow em seus consultórios',
    psychologicalTriggers: ['Prova Social', 'Autoridade', 'Pertencimento', 'Validação'],
    competitorWeaknesses: ['Pouca adoção', 'Sem cases públicos']
  },

  // GATILHO 6: EXCLUSIVIDADE - Vagas limitadas (escassez)
  {
    id: 'exclusividade-vagas-01',
    category: 'exclusividade',
    target: 'Nutricionistas indecisos',
    headline: 'Só aceitamos 200 novos nutris por mês.',
    subheadline: 'Por questão de suporte humanizado. Janeiro já tem 147.',
    body: 'Não queremos ser o maior SaaS do Brasil. Queremos ser o melhor. Por isso limitamos vagas mensais para garantir onboarding 1:1 e suporte via WhatsApp em até 2h. Se está pensando em migrar, migre agora.',
    cta: 'Garantir minha vaga (53 restantes)',
    imagePrompt: 'Badge exclusivo "VAGA CONFIRMADA" com contador de vagas restantes',
    psychologicalTriggers: ['Escassez', 'Exclusividade', 'Urgência', 'Status'],
    competitorWeaknesses: ['Suporte lento', 'Sem onboarding', 'Atendimento ruim']
  },

  // GATILHO 7: DOR - Cancelamento de outros SaaS
  {
    id: 'dor-insatisfacao-01',
    category: 'dor',
    target: 'Nutricionistas insatisfeitos com SaaS atual',
    headline: 'Quer cancelar seu SaaS mas tem medo de migrar?',
    subheadline: 'Migramos seus pacientes em 24h. Grátis.',
    body: 'Sabemos que você está preso num SaaS ruim por preguiça de migrar. Nós fazemos isso pra você: importamos todos os pacientes, cardápios e dados em menos de 1 dia útil. Zero trabalho manual. Zero perda de dados.',
    cta: 'Migrar meus pacientes grátis',
    imagePrompt: 'Antes: nutricionista frustrada com software bugado. Depois: sorrindo com NutriFlow funcionando',
    psychologicalTriggers: ['Dor', 'Solução Fácil', 'Remoção de Objeção', 'Ganho Rápido'],
    competitorWeaknesses: ['Migração difícil', 'Sem suporte de migração', 'Dados presos']
  },

  // GATILHO 8: VELOCIDADE - Portal do Paciente
  {
    id: 'velocidade-portal-01',
    category: 'velocidade',
    target: 'Nutricionistas que enviam PDF por WhatsApp',
    headline: 'Pare de enviar PDF por WhatsApp.',
    subheadline: 'Portal interativo onde o paciente vê, salva e imprime sozinho.',
    body: 'Seu paciente recebe um link. Abre. Vê o cardápio colorido e interativo. Salva no celular. Imprime se quiser. Marca as refeições que fez. Você vê tudo em tempo real. Sem PDF perdido no WhatsApp.',
    cta: 'Ver portal do paciente (demo)',
    imagePrompt: 'Paciente no celular acessando portal NutriFlow com cardápio interativo colorido e check marks',
    psychologicalTriggers: ['Inovação', 'Profissionalismo', 'Diferenciação', 'Modernidade'],
    competitorWeaknesses: ['Só gera PDF', 'Sem portal interativo', 'Experiência do paciente ruim']
  },

  // GATILHO 9: ECONOMIA - ROI claro
  {
    id: 'economia-roi-01',
    category: 'economia',
    target: 'Nutricionistas que calculam ROI',
    headline: 'Atenda 1 paciente a mais por semana. Paga sozinho.',
    subheadline: 'R$ 47/mês vs R$ 600+ de faturamento extra. ROI de 12x.',
    body: 'Com a IA do NutriFlow, você ganha 4 horas por semana. Use pra atender mais 1 paciente. Média de consulta: R$ 150. Isso dá R$ 600/mês extra. O software custa R$ 47. Sobram R$ 553 no seu bolso. Matemática simples.',
    cta: 'Calcular meu ROI (grátis)',
    imagePrompt: 'Calculadora visual mostrando: 4h/semana economizadas = 1 paciente extra = R$600 - R$47 = R$553 lucro',
    psychologicalTriggers: ['Racionalidade', 'ROI Claro', 'Prova Matemática', 'Ganho Financeiro'],
    competitorWeaknesses: ['Preço não justificável', 'ROI pouco claro']
  },

  // GATILHO 10: TECNOLOGIA - Mobile First
  {
    id: 'tech-mobile-01',
    category: 'tecnologia',
    target: 'Nutricionistas que atendem fora do consultório',
    headline: 'Atendimento domiciliar? Funciona no celular.',
    subheadline: 'App otimizado que funciona até offline. Zero desktop.',
    body: 'Criamos o NutriFlow para nutricionistas que atendem fora do consultório. Funciona 100% no celular. Gera cardápios, acessa fichas, faz anamnese, tudo na palma da mão. Sincroniza quando voltar o Wi-Fi.',
    cta: 'Testar no meu celular agora',
    imagePrompt: 'Nutricionista atendendo em casa de paciente, usando NutriFlow no celular',
    psychologicalTriggers: ['Flexibilidade', 'Mobilidade', 'Conveniência', 'Modernidade'],
    competitorWeaknesses: ['Desktop only', 'Não funciona no mobile', 'Sem modo offline']
  },

  // GATILHO 11: AUTORIDADE - Feito POR nutricionistas
  {
    id: 'autoridade-nutris-01',
    category: 'autoridade',
    target: 'Nutricionistas que querem ferramenta de verdade',
    headline: 'Criado por uma nutricionista. Não por programadores.',
    subheadline: 'Que nunca atenderam 1 paciente na vida.',
    body: 'Sabe aquela frustração de usar software feito por dev que nunca pisou num consultório? Acabou. NutriFlow foi desenhado com 12 nutricionistas clínicas. Cada botão, cada campo, cada detalhe foi pensado pra SUA rotina real.',
    cta: 'Conhecer a história',
    imagePrompt: 'Foto da fundadora nutricionista em consultório + screenshots de reuniões de design com outras nutris',
    psychologicalTriggers: ['Identificação', 'Autoridade', 'Confiança', 'Pertencimento'],
    competitorWeaknesses: ['Feito por tech sem expertise', 'Não entendem nutrição']
  },

  // GATILHO 12: DOR - Bugs e suporte ruim
  {
    id: 'dor-suporte-01',
    category: 'dor',
    target: 'Nutricionistas com suporte ruim no SaaS atual',
    headline: 'Seu SaaS bugou no meio da consulta. De novo.',
    subheadline: 'Suporte responde em 3 dias. Paciente esperando na sua frente.',
    body: 'A gente sabe porque já ouviu isso 847 vezes. Por isso nosso suporte responde em até 2h (média real: 37min). Via WhatsApp. Pessoa real. Que entende de nutrição. Sem bot, sem ticket, sem espera.',
    cta: 'Falar com suporte agora (teste)',
    imagePrompt: 'Chat do WhatsApp mostrando resposta rápida do suporte NutriFlow em 12 minutos',
    psychologicalTriggers: ['Dor', 'Alívio', 'Confiança', 'Segurança'],
    competitorWeaknesses: ['Suporte lento', 'Só email/ticket', 'Chatbot inútil']
  }
];

// Segmentações específicas por plataforma
export const platformTargeting = {
  facebook: {
    interests: [
      '6003139266461', // Nutrição
      '6004115376138', // Saúde e Bem-estar
      '6003277229371', // Fitness e Nutrição
      '6003195267498', // Nutrição Esportiva
      '6003020834693', // Alimentação Saudável
    ],
    ageRange: { min: 23, max: 50 },
    locations: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Curitiba'],
    jobTitles: ['Nutricionista', 'Nutrição', 'Nutri', 'Nutrição Clínica', 'Nutrição Esportiva']
  },

  instagram: {
    hashtags: ['#nutricionista', '#nutricao', '#nutri', '#nutricaobrasil', '#dietaenutricao'],
    behavior: 'Business account + Nutrition content creators',
    engagement: 'Engaged with nutrition/health content in last 30 days'
  },

  google: {
    keywords: [
      'software para nutricionista',
      'sistema para consultório de nutrição',
      'melhor app para nutricionista',
      'software nutricional',
      'sistema de cardápios',
      'IA para nutricionista',
      'alternativa [Concorrente A]',
      'alternativa [Concorrente B]'
    ],
    negativeKeywords: ['grátis', 'pirata', 'curso', 'faculdade']
  }
};

// Estratégia de teste A/B
export const abTestStrategy = {
  phase1: {
    duration: '7 dias',
    budget: 'R$ 70/dia',
    creatives: ['dor-planilhas-01', 'velocidade-ia-01', 'economia-preco-01'],
    goal: 'Identificar melhor ângulo (dor vs velocidade vs economia)'
  },

  phase2: {
    duration: '14 dias',
    budget: 'R$ 100/dia',
    creatives: 'Top 2 performers da Fase 1 + 2 variações',
    goal: 'Otimizar CTR e CPC'
  },

  phase3: {
    duration: '30 dias',
    budget: 'R$ 150/dia',
    creatives: 'Winner + retargeting para quem clicou mas não converteu',
    goal: 'Maximizar conversões (signups)'
  }
};

// Copy adicional para diferentes formatos
export const copyVariations = {
  carouselAd: {
    card1: { headline: 'Excel = 2010', body: 'IA = 2026' },
    card2: { headline: '4h/semana perdidas', body: '240h/ano no Excel' },
    card3: { headline: 'NutriFlow = 3min', body: 'IA gera tudo' },
    card4: { headline: 'R$ 47/mês', body: 'Menos que 1 consulta' },
    card5: { headline: 'Teste 7 dias grátis', body: 'Sem cartão' }
  },

  videoScript: {
    hook: '[5 seg] "Você tá perdendo 4 horas por semana montando cardápio no Excel?"',
    problem: '[10 seg] "Enquanto isso, nutricionistas espertos já usam IA que faz em 3 minutos"',
    solution: '[15 seg] "NutriFlow: IA treinada com 10 mil cardápios reais. Gera plano completo, cálculos automáticos, ajustes instantâneos"',
    proof: '[5 seg] "847 nutricionistas já migraram em 2026"',
    cta: '[5 seg] "Teste 7 dias grátis. Link na bio"'
  },

  emailSequence: {
    email1: {
      subject: 'Você ainda usa Excel pra cardápio? 👀',
      preview: 'Tem uma forma 40x mais rápida (e não é ctrl+c ctrl+v)',
      body: 'Template com vídeo demo de 90 segundos'
    },
    email2: {
      subject: 'Por que 847 nutris migraram do [Concorrente]',
      preview: 'Spoiler: IA + R$ 47/mês vs R$ 197/mês',
      body: 'Comparação lado a lado + depoimentos'
    },
    email3: {
      subject: 'Última chance: vagas de Janeiro acabando',
      preview: '21 vagas restantes (de 200)',
      body: 'Gatilho de escassez + onboarding 1:1'
    }
  }
};

// Métricas de sucesso
export const successMetrics = {
  ctr: { target: '> 2.5%', benchmark: '1.8% média do setor' },
  cpc: { target: '< R$ 3.50', benchmark: 'R$ 4.20 média do setor' },
  conversionRate: { target: '> 8%', benchmark: '4-6% SaaS B2B' },
  cpl: { target: '< R$ 45', benchmark: 'R$ 65 média SaaS' },
  cac: { target: '< R$ 120', benchmark: 'R$ 180 concorrentes' },
  roas: { target: '> 5x', benchmark: '3-4x é bom pra SaaS' }
};
