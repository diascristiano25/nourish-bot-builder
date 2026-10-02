# 🎯 Agent de Tráfego Pago - README

## 📖 O que é?

Um **Agent de IA** integrado ao NutriFlow que automatiza a criação e otimização de campanhas de anúncios no Facebook/Instagram Ads.

### ✨ Features

- 🤖 **IA com Gemini 2.0 Flash**: Gera estratégias completas de campanha
- 🎯 **Segmentação Inteligente**: Análise de público-alvo baseada em dados
- 📊 **3 Variações de Anúncios**: Para teste A/B automático
- 💰 **Budget Recomendado**: Cálculo otimizado de investimento
- 🔗 **Integração Meta Ads** (opcional): Cria campanhas automaticamente
- 📈 **Análise de Mercado**: Insights profundos sobre seu setor

---

## 🚀 Como Testar AGORA

### 1. Configure o Gemini

```bash
# Adicione no .env.local
VITE_GEMINI_API_KEY=sua_chave_aqui
```

**Como obter**: https://ai.google.dev/ → "Get API Key"

### 2. Rode o projeto

```bash
bun run dev
```

### 3. Acesse

```
http://localhost:5173/trafego-pago
```

### 4. Teste!

Preencha os dados (já vem pré-preenchido com NutriFlow) e clique em:

**"Gerar Estratégia de Campanha"**

---

## 📸 Screenshots

### Dashboard do Agent
```
┌─────────────────────────────────────────┐
│  🎯 Agent de Tráfego Pago              │
│  IA que cria campanhas automaticamente  │
├─────────────────────────────────────────┤
│  [Configuração] [Estratégia] [Análise] │
│                                         │
│  📝 Contexto do Negócio                │
│  ├─ Nome: NutriFlow                    │
│  ├─ Setor: Saúde e Nutrição           │
│  ├─ Público: Nutricionistas...        │
│  └─ [🤖 Gerar Estratégia]             │
└─────────────────────────────────────────┘
```

### Resultado - Estratégia
```
┌──────────────────────────────┐
│ Visão Geral da Campanha      │
├──────────────────────────────┤
│ Objetivo: OUTCOME_LEADS      │
│ Budget: R$ 50,00/dia         │
│ Duração: 30 dias             │
├──────────────────────────────┤
│ 🎯 Segmentação               │
│ • Brasil                     │
│ • 25-45 anos                 │
│ • SP, RJ, BH                 │
├──────────────────────────────┤
│ 📢 3 Anúncios Criados        │
│ Variação 1: "Crie Cardápios"│
│ Variação 2: "Automatize..."  │
│ Variação 3: "Teste Grátis"  │
└──────────────────────────────┘
```

### Resultado - Análise
```
┌──────────────────────────────┐
│ 📊 Resultados Esperados      │
├──────────────────────────────┤
│ Impressões: 50K - 80K        │
│ Cliques: 1.5K - 2.5K         │
│ Conversões: 30 - 60 leads    │
├──────────────────────────────┤
│ 💡 Dicas de Otimização       │
│ • Teste CTAs após 3 dias     │
│ • Monitore CPL diariamente   │
│ • A/B test de imagens        │
└──────────────────────────────┘
```

---

## 🧪 Casos de Teste

### Teste 1: Geração Básica (SEM Meta Ads)
```typescript
// O que vai acontecer:
✅ IA gera estratégia completa
✅ Exibe 3 anúncios prontos
✅ Análise de mercado
✅ Resultados esperados
⚠️ NÃO cria no Meta Ads (credenciais não configuradas)
```

### Teste 2: Com Meta Ads (Avançado)
```bash
# Configure no .env.local:
VITE_META_ACCESS_TOKEN=EAAG...
VITE_META_AD_ACCOUNT_ID=act_123456789
```

```typescript
// Resultado:
✅ Gera estratégia
✅ Cria campanha no Meta Ads
✅ Cria Ad Set com segmentação
✅ Cria 3 anúncios
⚠️ Campanha fica PAUSADA (você revisa antes)
```

---

## 🎨 Estrutura de Arquivos

```
src/
├── services/
│   ├── meta-ads.ts              # Cliente Meta Ads API
│   │   ├─ createCampaign()
│   │   ├─ createAdSet()
│   │   ├─ createAd()
│   │   └─ getCampaignInsights()
│   │
│   └── paid-traffic-agent.ts    # Agent com IA
│       ├─ generateCampaignStrategy()
│       ├─ analyzeMarket()
│       └─ createFullCampaign()
│
└── pages/
    └── PaidTrafficAgent.tsx     # Dashboard UI
```

---

## 🔌 API Reference

### PaidTrafficAgent

```typescript
import { initPaidTrafficAgent } from '@/services/paid-traffic-agent';

const agent = initPaidTrafficAgent(GEMINI_KEY);

// Gerar estratégia
const result = await agent.createFullCampaign({
  businessName: "NutriFlow",
  industry: "SaaS Saúde",
  targetAudience: "Nutricionistas",
  mainService: "Gestão de pacientes com IA",
  uniqueSellingPoint: "Cardápios automáticos",
  websiteUrl: "https://nutriflow.inf.br"
});

console.log(result.strategy);  // Estratégia completa
console.log(result.analysis);  // Análise de mercado
console.log(result.campaignId); // ID se criou no Meta Ads
```

### MetaAdsService

```typescript
import { initMetaAds } from '@/services/meta-ads';

const metaAds = initMetaAds({
  accessToken: "EAAG...",
  adAccountId: "act_123456789"
});

// Criar campanha
const campaign = await metaAds.createCampaign({
  name: "Campanha Teste",
  objective: "OUTCOME_LEADS",
  budget: 5000 // R$ 50/dia
});

// Ver performance
const insights = await metaAds.getCampaignInsights(campaign.id);
console.log(insights.impressions); // 50000
console.log(insights.clicks);      // 1500
```

---

## 🎯 Integrações Futuras

### 1. Google Ads (Roadmap)
```typescript
// Coming soon:
const googleAgent = initGoogleAdsAgent(API_KEY);
await googleAgent.createSearchCampaign({...});
```

### 2. TikTok Ads (Roadmap)
```typescript
// Coming soon:
const tiktokAgent = initTikTokAdsAgent(API_KEY);
await tiktokAgent.createVideoCampaign({...});
```

### 3. LinkedIn Ads (Roadmap)
```typescript
// Coming soon:
const linkedinAgent = initLinkedInAdsAgent(API_KEY);
await linkedinAgent.createB2BCampaign({...});
```

---

## 💡 Exemplo Real - NutriFlow

### Input
```json
{
  "businessName": "NutriFlow",
  "industry": "SaaS para Nutrição",
  "targetAudience": "Nutricionistas brasileiras, 25-45 anos",
  "mainService": "Plataforma de gestão com gerador de cardápios IA",
  "uniqueSellingPoint": "Cardápios personalizados em segundos",
  "websiteUrl": "https://nutriflow.inf.br"
}
```

### Output (Estratégia)
```json
{
  "objective": "OUTCOME_LEADS",
  "budget": 7500,
  "duration": 30,
  "targeting": {
    "countries": ["BR"],
    "ageMin": 28,
    "ageMax": 42,
    "genders": ["female"],
    "interests": ["6003139266461", "6004115376138"],
    "locations": { "cities": ["São Paulo", "Rio de Janeiro", "Belo Horizonte"] }
  },
  "adVariations": [
    {
      "title": "Crie Cardápios em Segundos com IA",
      "description": "Plataforma completa para nutricionistas. Gere cardápios personalizados automaticamente e economize horas.",
      "callToAction": "SIGN_UP"
    },
    {
      "title": "Automatize sua Nutrição com IA",
      "description": "Gestão de pacientes + gerador de cardápios inteligente. Teste grátis por 7 dias.",
      "callToAction": "LEARN_MORE"
    },
    {
      "title": "Nutricionistas: Teste Grátis",
      "description": "Crie cardápios com IA em minutos. Mais de 100 nutricionistas já usam. Sem cartão.",
      "callToAction": "SIGN_UP"
    }
  ]
}
```

### Output (Análise)
```json
{
  "marketInsights": "O mercado de SaaS para saúde no Brasil cresce 38% ao ano. Nutricionistas buscam ferramentas que reduzam tempo operacional e melhorem atendimento. Principal dor: criação manual de cardápios (2-3h por paciente).",
  "audienceProfile": "Nutricionistas mulheres, 28-42 anos, com consultório próprio ou clínica. Ativas em Instagram, buscam eficiência e tecnologia. Alto interesse em IA e automação.",
  "recommendedBudget": 7500,
  "expectedResults": {
    "impressions": "60.000 - 90.000",
    "clicks": "1.800 - 2.700",
    "conversions": "45 - 75 leads qualificados"
  },
  "optimizationTips": [
    "Teste variação 'Teste Grátis' vs 'Saiba Mais' após 3 dias",
    "CPL alvo: R$ 40-60. Se >R$ 80, ajuste segmentação",
    "Crie landing page específica com depoimentos",
    "Pixel de conversão no cadastro (não só clique)"
  ]
}
```

---

## 📚 Documentação Completa

- **Quick Start**: [`docs/QUICK-START-AGENT.md`](./docs/QUICK-START-AGENT.md)
- **Documentação Completa**: [`docs/PAID-TRAFFIC-AGENT.md`](./docs/PAID-TRAFFIC-AGENT.md)

---

## 🆘 Suporte

**Problemas?** Abra uma issue ou leia os docs:
- Como obter credenciais Meta Ads
- Troubleshooting de erros comuns
- Exemplos de uso avançado

---

## ✅ Checklist de Deploy

- [x] Services criados (`meta-ads.ts`, `paid-traffic-agent.ts`)
- [x] UI implementada (`PaidTrafficAgent.tsx`)
- [x] Rota adicionada (`/trafego-pago`)
- [x] Build passando (sem erros TypeScript)
- [x] Documentação completa
- [ ] Configurar `VITE_GEMINI_API_KEY` em produção
- [ ] (Opcional) Configurar credenciais Meta Ads

---

**Desenvolvido com ❤️ para o NutriFlow**

🚀 **Agora você tem um Agent de Tráfego Pago com IA!**
