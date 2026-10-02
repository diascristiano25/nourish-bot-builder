/**
 * Paid Traffic Agent - AI-powered advertising automation
 * Usa Gemini para gerar estratégias e criativos de anúncios
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getMetaAds, type AdCampaign, type AdCreative, type AdTargeting } from "./meta-ads";

interface BusinessContext {
  businessName: string;
  industry: string;
  targetAudience: string;
  mainService: string;
  uniqueSellingPoint: string;
  websiteUrl: string;
  competitorUrls?: string[];
}

interface CampaignStrategy {
  objective: string;
  budget: number;
  duration: number;
  targeting: AdTargeting;
  adVariations: AdCreative[];
  reasoning: string;
}

interface AgentAnalysis {
  marketInsights: string;
  audienceProfile: string;
  recommendedBudget: number;
  expectedResults: {
    impressions: string;
    clicks: string;
    conversions: string;
  };
  optimizationTips: string[];
}

class PaidTrafficAgent {
  private gemini: GoogleGenerativeAI;
  private model: any;

  constructor(geminiApiKey: string) {
    this.gemini = new GoogleGenerativeAI(geminiApiKey);
    this.model = this.gemini.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });
  }

  /**
   * Analisa o negócio e gera estratégia de campanha
   */
  async generateCampaignStrategy(context: BusinessContext): Promise<CampaignStrategy> {
    const prompt = `
Você é um especialista em Marketing Digital e Tráfego Pago com 10+ anos de experiência.

**CONTEXTO DO NEGÓCIO:**
- Nome: ${context.businessName}
- Setor: ${context.industry}
- Público-alvo: ${context.targetAudience}
- Serviço principal: ${context.mainService}
- Diferencial: ${context.uniqueSellingPoint}
- Website: ${context.websiteUrl}
${context.competitorUrls ? `- Concorrentes: ${context.competitorUrls.join(', ')}` : ''}

**SUA MISSÃO:**
Crie uma estratégia de campanha de anúncios para Facebook/Instagram Ads.

**ESTRUTURA DA RESPOSTA (JSON):**
{
  "objective": "OUTCOME_LEADS", // ou OUTCOME_TRAFFIC, OUTCOME_SALES
  "budget": 5000, // Budget diário em centavos (R$ 50,00)
  "duration": 30, // Dias
  "targeting": {
    "countries": ["BR"],
    "ageMin": 25,
    "ageMax": 55,
    "genders": ["female", "male"], // ou só um
    "interests": ["6003139266461", "6004115376138"], // IDs reais do Meta
    "locations": {
      "cities": ["São Paulo", "Rio de Janeiro"],
      "regions": []
    }
  },
  "adVariations": [
    {
      "title": "Título chamativo (máx 40 caracteres)",
      "description": "Descrição persuasiva (máx 125 caracteres)",
      "imageUrl": "https://placeholder.com/600x314", // Placeholder por enquanto
      "callToAction": "LEARN_MORE", // ou SIGN_UP, CONTACT_US
      "destinationUrl": "${context.websiteUrl}"
    }
  ],
  "reasoning": "Explicação da estratégia e por que escolheu essas configurações"
}

**DICAS:**
- Budget: R$ 30-100/dia para começar (3000-10000 centavos)
- Idade: Baseie-se no público-alvo descrito
- Interesses: Use IDs reais do Meta Ads (nutrição, saúde, bem-estar, fitness)
- Crie 3 variações de anúncio para testar
- CTAs: LEARN_MORE (topo de fufunil), SIGN_UP (conversão), CONTACT_US (contato direto)

Responda APENAS com o JSON válido, sem markdown.
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();

    // Parse JSON da resposta
    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const strategy: CampaignStrategy = JSON.parse(cleanJson);

    return strategy;
  }

  /**
   * Analisa dados do negócio e gera insights de mercado
   */
  async analyzeMarket(context: BusinessContext): Promise<AgentAnalysis> {
    const prompt = `
Você é um analista de mercado especializado em publicidade digital.

**NEGÓCIO:**
- Nome: ${context.businessName}
- Setor: ${context.industry}
- Público: ${context.targetAudience}
- Serviço: ${context.mainService}

**SUA MISSÃO:**
Analise o mercado e forneça insights para criar campanhas de sucesso.

**RESPOSTA (JSON):**
{
  "marketInsights": "Análise do mercado de ${context.industry} no Brasil, tendências, oportunidades",
  "audienceProfile": "Perfil detalhado do público-alvo ideal para este negócio",
  "recommendedBudget": 7500, // Budget diário recomendado em centavos
  "expectedResults": {
    "impressions": "50.000 - 80.000",
    "clicks": "1.500 - 2.500",
    "conversions": "30 - 60 leads"
  },
  "optimizationTips": [
    "Dica 1 sobre como otimizar as campanhas",
    "Dica 2 sobre segmentação",
    "Dica 3 sobre criativos"
  ]
}

Responda APENAS com JSON válido.
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();

    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis: AgentAnalysis = JSON.parse(cleanJson);

    return analysis;
  }

  /**
   * Cria uma campanha completa (campanha + ad set + anúncios)
   */
  async createFullCampaign(context: BusinessContext): Promise<{
    strategy: CampaignStrategy;
    analysis: AgentAnalysis;
    campaignId?: string;
    status: 'success' | 'draft' | 'error';
    message: string;
  }> {
    try {
      // 1. Gera estratégia com IA
      const strategy = await this.generateCampaignStrategy(context);

      // 2. Análise de mercado
      const analysis = await this.analyzeMarket(context);

      // 3. Tenta criar campanha no Meta Ads (se credenciais configuradas)
      try {
        const metaAds = getMetaAds();

        // Cria campanha
        const campaign: AdCampaign = {
          name: `${context.businessName} - ${new Date().toLocaleDateString('pt-BR')}`,
          objective: strategy.objective as any,
          budget: strategy.budget,
        };

        const campaignResponse = await metaAds.createCampaign(campaign);

        // Cria Ad Set
        const adSetResponse = await metaAds.createAdSet({
          name: `AdSet - ${context.targetAudience}`,
          campaignId: campaignResponse.id,
          targeting: strategy.targeting,
          bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
          dailyBudget: strategy.budget,
        });

        // Cria anúncios
        for (const adCreative of strategy.adVariations) {
          await metaAds.createAd(adSetResponse.id, adCreative);
        }

        return {
          strategy,
          analysis,
          campaignId: campaignResponse.id,
          status: 'success',
          message: `Campanha criada com sucesso! ID: ${campaignResponse.id}. Revise e ative na Meta Ads.`,
        };

      } catch (metaError: any) {
        // Se Meta Ads não está configurado, retorna estratégia em modo rascunho
        return {
          strategy,
          analysis,
          status: 'draft',
          message: `Estratégia gerada com sucesso! Configure as credenciais da Meta Ads para criar a campanha automaticamente. Erro: ${metaError.message}`,
        };
      }

    } catch (error: any) {
      return {
        strategy: {} as CampaignStrategy,
        analysis: {} as AgentAnalysis,
        status: 'error',
        message: `Erro ao gerar estratégia: ${error.message}`,
      };
    }
  }

  /**
   * Otimiza uma campanha existente baseado em performance
   */
  async optimizeCampaign(campaignId: string): Promise<{
    recommendations: string[];
    actions: string[];
  }> {
    const metaAds = getMetaAds();
    const insights = await metaAds.getCampaignInsights(campaignId);

    const prompt = `
Você é um especialista em otimização de campanhas de anúncios.

**DADOS DA CAMPANHA:**
- Impressões: ${insights?.impressions || 0}
- Cliques: ${insights?.clicks || 0}
- Gasto: R$ ${(insights?.spend || 0) / 100}
- CTR: ${insights?.ctr || 0}%
- CPC: R$ ${(insights?.cpc || 0) / 100}

**SUA MISSÃO:**
Analise a performance e sugira otimizações.

**RESPOSTA (JSON):**
{
  "recommendations": [
    "Recomendação 1 baseada nos dados",
    "Recomendação 2",
    "Recomendação 3"
  ],
  "actions": [
    "Ação concreta 1 (ex: aumentar budget em 20%)",
    "Ação concreta 2 (ex: testar novo criativo)",
    "Ação concreta 3"
  ]
}

Responda APENAS com JSON válido.
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();

    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  }
}

// Export singleton
let agentInstance: PaidTrafficAgent | null = null;

export const initPaidTrafficAgent = (geminiApiKey: string) => {
  agentInstance = new PaidTrafficAgent(geminiApiKey);
  return agentInstance;
};

export const getPaidTrafficAgent = (): PaidTrafficAgent => {
  if (!agentInstance) {
    throw new Error('PaidTrafficAgent not initialized. Call initPaidTrafficAgent() first.');
  }
  return agentInstance;
};

export type { BusinessContext, CampaignStrategy, AgentAnalysis };
