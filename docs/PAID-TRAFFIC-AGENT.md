# 🚀 Agent de Tráfego Pago - Documentação Completa

## 📋 Visão Geral

O **Agent de Tráfego Pago** é um sistema de IA integrado ao NutriFlow que automatiza a criação e otimização de campanhas de anúncios no Facebook/Instagram Ads (Meta Ads).

### Funcionalidades Principais

- ✅ **Geração Automática de Estratégias**: IA analisa seu negócio e cria estratégias de campanha personalizadas
- ✅ **Criação de Anúncios**: Gera múltiplas variações de anúncios para teste A/B
- ✅ **Análise de Mercado**: Insights profundos sobre público-alvo e tendências
- ✅ **Integração Meta Ads**: Cria campanhas automaticamente na plataforma do Facebook
- ✅ **Otimização Contínua**: Recomendações baseadas em performance real

---

## 🏗️ Arquitetura

```
src/
├── services/
│   ├── meta-ads.ts              # Cliente Meta Ads API
│   └── paid-traffic-agent.ts    # Agent com IA (Gemini)
└── pages/
    └── PaidTrafficAgent.tsx     # Dashboard do Agent
```

### Fluxo de Funcionamento

```
1. Usuário preenche contexto do negócio
   ↓
2. Agent usa Gemini 2.0 Flash para gerar estratégia
   ↓
3. IA analisa mercado e público-alvo
   ↓
4. (Opcional) Cria campanha automaticamente via Meta Ads API
   ↓
5. Exibe estratégia completa + insights no dashboard
```

---

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
# Gemini (Obrigatório)
VITE_GEMINI_API_KEY=AIza...

# Meta Ads (Opcional - só se quiser criar campanhas automaticamente)
VITE_META_ACCESS_TOKEN=EAAG...
VITE_META_AD_ACCOUNT_ID=act_123456789
VITE_META_PIXEL_ID=123456789
```

### 2. Como Obter Credenciais da Meta Ads

#### Passo 1: Access Token
1. Acesse [Meta Business Suite](https://business.facebook.com/)
2. Vá em **Configurações** → **Contas de Anúncios**
3. Clique em **Ferramentas** → **Graph API Explorer**
4. Selecione sua Página do Facebook
5. Em **Permissões**, marque:
   - `ads_management`
   - `ads_read`
   - `business_management`
6. Clique em **Gerar Token de Acesso**
7. Copie o token (começa com `EAAG...`)

⚠️ **Importante**: Tokens de usuário expiram. Para produção, crie um **System User Token** que não expira.

#### Passo 2: Ad Account ID
1. No Meta Business Suite, vá em **Configurações**
2. Clique em **Contas de Anúncios**
3. Copie o ID da conta (formato: `act_123456789`)

#### Passo 3: Pixel ID (Opcional)
1. Vá em **Gerenciador de Eventos**
2. Copie o ID do seu Pixel do Facebook

---

## 🎯 Como Usar

### Acesso
Navegue para: `https://nutriflow.inf.br/trafego-pago`

### Configuração do Contexto de Negócio

Preencha os campos na aba **Configuração**:

```typescript
{
  businessName: "NutriFlow",
  industry: "Saúde e Nutrição",
  targetAudience: "Nutricionistas clínicos e esportivos",
  mainService: "SaaS para gestão de pacientes com IA",
  uniqueSellingPoint: "Geração automática de cardápios",
  websiteUrl: "https://nutriflow.inf.br",
  competitorUrls: ["https://competitor1.com"] // Opcional
}
```

### Gerar Estratégia

1. Clique em **"Gerar Estratégia de Campanha"**
2. Aguarde ~10-20 segundos (IA processando)
3. Acesse as abas:
   - **Estratégia**: Detalhes da campanha, segmentação, anúncios
   - **Análise**: Insights de mercado, público, resultados esperados

---

## 📊 Outputs do Agent

### Estratégia de Campanha

```json
{
  "objective": "OUTCOME_LEADS",
  "budget": 5000, // R$ 50,00/dia
  "duration": 30,
  "targeting": {
    "countries": ["BR"],
    "ageMin": 25,
    "ageMax": 45,
    "genders": ["female", "male"],
    "interests": ["6003139266461"], // Nutrição
    "locations": {
      "cities": ["São Paulo", "Rio de Janeiro"]
    }
  },
  "adVariations": [
    {
      "title": "Crie Cardápios com IA em Minutos",
      "description": "Plataforma completa para nutricionistas gerenciarem pacientes e gerarem cardápios personalizados automaticamente.",
      "callToAction": "SIGN_UP",
      "destinationUrl": "https://nutriflow.inf.br"
    }
  ],
  "reasoning": "Estratégia focada em conversão direta..."
}
```

### Análise de Mercado

```json
{
  "marketInsights": "O mercado de nutrição digital no Brasil cresce 35% ao ano...",
  "audienceProfile": "Nutricionistas mulheres, 28-42 anos, com consultório próprio...",
  "recommendedBudget": 7500,
  "expectedResults": {
    "impressions": "50.000 - 80.000",
    "clicks": "1.500 - 2.500",
    "conversions": "30 - 60 leads"
  },
  "optimizationTips": [
    "Teste diferentes CTAs após 3 dias",
    "Ajuste orçamento conforme CPC",
    "Crie landing page específica"
  ]
}
```

---

## 🔌 Integração com Meta Ads API

### Métodos Disponíveis

```typescript
import { getMetaAds } from '@/services/meta-ads';

const metaAds = getMetaAds();

// 1. Criar campanha
const campaign = await metaAds.createCampaign({
  name: "Campanha NutriFlow",
  objective: "OUTCOME_LEADS",
  budget: 5000
});

// 2. Criar Ad Set
const adSet = await metaAds.createAdSet({
  name: "Nutricionistas SP",
  campaignId: campaign.id,
  targeting: { /* ... */ },
  dailyBudget: 5000
});

// 3. Criar anúncio
const ad = await metaAds.createAd(adSet.id, {
  title: "Seu título",
  description: "Descrição",
  imageUrl: "https://...",
  callToAction: "SIGN_UP",
  destinationUrl: "https://nutriflow.inf.br"
});

// 4. Ver insights
const insights = await metaAds.getCampaignInsights(campaign.id);

// 5. Pausar/ativar
await metaAds.updateCampaignStatus(campaign.id, "ACTIVE");
```

---

## 🤖 Como o Agent Funciona (Internamente)

### 1. Análise com IA (Gemini)

O agent usa o **Gemini 2.0 Flash** com prompt engineering avançado:

```typescript
const prompt = `
Você é um especialista em Marketing Digital com 10+ anos de experiência.

CONTEXTO DO NEGÓCIO:
- Nome: ${context.businessName}
- Setor: ${context.industry}
...

SUA MISSÃO:
Crie uma estratégia de campanha para Facebook/Instagram Ads.

ESTRUTURA DA RESPOSTA (JSON):
{...}
`;
```

### 2. Geração de Estratégia

O agent gera:
- **Objetivo da campanha** (leads, tráfego, vendas)
- **Budget recomendado**
- **Segmentação precisa** (idade, localização, interesses)
- **3 variações de anúncio** para teste A/B

### 3. Criação Automática (Se Meta Ads configurado)

Se você forneceu credenciais da Meta Ads:
1. Cria campanha pausada
2. Cria ad set com segmentação
3. Cria 3 anúncios com variações

⚠️ **Campanhas começam PAUSADAS** para você revisar antes de ativar.

---

## 📈 Melhores Práticas

### Budget Inicial
- **Teste**: R$ 30-50/dia
- **Escala**: R$ 100-300/dia
- **Produção**: R$ 500+/dia

### Duração
- **Mínimo**: 7 dias (aprendizado do algoritmo)
- **Ideal**: 30 dias (dados consistentes)

### Segmentação
- Comece **amplo** (Brasil todo, 25-55 anos)
- Analise dados após 3-5 dias
- Refine para públicos de melhor performance

### Criativos
- Sempre rode **3+ variações**
- Teste CTAs diferentes: `LEARN_MORE`, `SIGN_UP`, `CONTACT_US`
- Imagens: 1200x628px (formato landscape)

---

## 🐛 Troubleshooting

### Erro: "MetaAdsService not initialized"

**Causa**: Credenciais da Meta Ads não configuradas

**Solução**: 
- Se não quiser integração automática: ignore (estratégia será gerada normalmente)
- Se quiser integração: configure `VITE_META_ACCESS_TOKEN` e `VITE_META_AD_ACCOUNT_ID`

### Erro: "Meta Ads API Error: Invalid OAuth"

**Causa**: Token expirado ou sem permissões

**Solução**:
1. Gere novo token no Graph API Explorer
2. Verifique se marcou `ads_management` nas permissões

### Agent gera estratégias genéricas

**Causa**: Contexto do negócio incompleto

**Solução**: Preencha TODOS os campos com detalhes específicos

---

## 🔮 Roadmap

### Próximas Features

- [ ] **Dashboard de Analytics**: Visualizar performance em tempo real
- [ ] **Otimização Automática**: Agent ajusta budget/segmentação automaticamente
- [ ] **Google Ads Integration**: Suporte para Google Search/Display
- [ ] **A/B Testing Automático**: Pausa anúncios de baixa performance
- [ ] **Relatórios por Email**: Envio automático de insights semanais

---

## 💡 Exemplo de Uso Real

### Caso: Lançamento do NutriFlow

```typescript
const context = {
  businessName: "NutriFlow",
  industry: "SaaS para Saúde",
  targetAudience: "Nutricionistas brasileiras, 25-45 anos, clínicas privadas",
  mainService: "Plataforma web para gestão de pacientes com gerador de cardápios usando IA",
  uniqueSellingPoint: "Criação de cardápios personalizados em segundos com Inteligência Artificial",
  websiteUrl: "https://nutriflow.inf.br"
};

// Resultado esperado:
// - Budget: R$ 75/dia
// - Segmentação: Mulheres 28-42 anos, SP/RJ/BH
// - Interesses: Nutrição, Saúde, Empreendedorismo
// - 3 anúncios testando CTAs: "Experimente Grátis", "Agende Demo", "Saiba Mais"
// - Expectativa: 40-70 leads/mês, CPL R$ 35-50
```

---

## 📚 Referências

- [Meta Marketing API Docs](https://developers.facebook.com/docs/marketing-apis)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Meta Ads Best Practices](https://www.facebook.com/business/help)

---

## 🆘 Suporte

Problemas ou dúvidas? Abra uma issue no repositório ou entre em contato pelo email do projeto.

---

**Criado com ❤️ para o NutriFlow**
