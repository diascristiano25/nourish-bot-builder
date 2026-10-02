/**
 * Meta Ads API Integration
 * Serviço para criar e gerenciar campanhas no Facebook/Instagram Ads
 */

interface MetaAdsConfig {
  accessToken: string;
  adAccountId: string;
  pixelId?: string;
}

interface AdCreative {
  title: string;
  description: string;
  imageUrl: string;
  callToAction: 'LEARN_MORE' | 'SIGN_UP' | 'CONTACT_US' | 'DOWNLOAD';
  destinationUrl: string;
}

interface AdCampaign {
  name: string;
  objective: 'OUTCOME_AWARENESS' | 'OUTCOME_ENGAGEMENT' | 'OUTCOME_TRAFFIC' | 'OUTCOME_LEADS' | 'OUTCOME_SALES';
  budget: number; // Daily budget in cents
  startTime?: string;
  endTime?: string;
}

interface AdTargeting {
  countries: string[]; // ['BR']
  ageMin: number;
  ageMax: number;
  genders?: ('male' | 'female')[];
  interests?: string[]; // IDs de interesses
  locations?: {
    cities?: string[];
    regions?: string[];
  };
}

interface AdSetConfig {
  name: string;
  campaignId: string;
  targeting: AdTargeting;
  bidStrategy: 'LOWEST_COST_WITHOUT_CAP' | 'COST_CAP';
  dailyBudget: number;
}

interface MetaAdResponse {
  id: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  insights?: {
    impressions: number;
    clicks: number;
    spend: number;
    ctr: number;
    cpc: number;
  };
}

class MetaAdsService {
  private config: MetaAdsConfig;
  private baseUrl = 'https://graph.facebook.com/v19.0';

  constructor(config: MetaAdsConfig) {
    this.config = config;
  }

  /**
   * Cria uma nova campanha
   */
  async createCampaign(campaign: AdCampaign): Promise<MetaAdResponse> {
    const url = `${this.baseUrl}/act_${this.config.adAccountId}/campaigns`;

    const body = {
      name: campaign.name,
      objective: campaign.objective,
      status: 'PAUSED', // Começa pausada para revisão
      special_ad_categories: [],
      daily_budget: campaign.budget,
      ...(campaign.startTime && { start_time: campaign.startTime }),
      ...(campaign.endTime && { end_time: campaign.endTime }),
      access_token: this.config.accessToken,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Meta Ads API Error: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Cria um Ad Set (conjunto de anúncios)
   */
  async createAdSet(config: AdSetConfig): Promise<MetaAdResponse> {
    const url = `${this.baseUrl}/act_${this.config.adAccountId}/adsets`;

    const targeting = {
      geo_locations: {
        countries: config.targeting.countries,
        ...(config.targeting.locations?.cities && { cities: config.targeting.locations.cities }),
        ...(config.targeting.locations?.regions && { regions: config.targeting.locations.regions }),
      },
      age_min: config.targeting.ageMin,
      age_max: config.targeting.ageMax,
      ...(config.targeting.genders && { genders: config.targeting.genders.map(g => g === 'male' ? 1 : 2) }),
      ...(config.targeting.interests && { flexible_spec: [{ interests: config.targeting.interests.map(id => ({ id })) }] }),
    };

    const body = {
      name: config.name,
      campaign_id: config.campaignId,
      daily_budget: config.dailyBudget,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'REACH',
      bid_strategy: config.bidStrategy,
      targeting: JSON.stringify(targeting),
      status: 'PAUSED',
      access_token: this.config.accessToken,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Meta Ads API Error: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Cria um anúncio (Ad Creative + Ad)
   */
  async createAd(adSetId: string, creative: AdCreative): Promise<MetaAdResponse> {
    // 1. Criar o creative
    const creativeUrl = `${this.baseUrl}/act_${this.config.adAccountId}/adcreatives`;

    const creativeBody = {
      name: creative.title,
      object_story_spec: {
        page_id: this.config.adAccountId.replace('act_', ''), // Simplificado
        link_data: {
          link: creative.destinationUrl,
          message: creative.description,
          name: creative.title,
          picture: creative.imageUrl,
          call_to_action: {
            type: creative.callToAction,
            value: { link: creative.destinationUrl },
          },
        },
      },
      access_token: this.config.accessToken,
    };

    const creativeResponse = await fetch(creativeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creativeBody),
    });

    if (!creativeResponse.ok) {
      const error = await creativeResponse.json();
      throw new Error(`Creative Error: ${error.error?.message || 'Unknown error'}`);
    }

    const creativeData = await creativeResponse.json();

    // 2. Criar o Ad
    const adUrl = `${this.baseUrl}/act_${this.config.adAccountId}/ads`;

    const adBody = {
      name: creative.title,
      adset_id: adSetId,
      creative: { creative_id: creativeData.id },
      status: 'PAUSED',
      access_token: this.config.accessToken,
    };

    const adResponse = await fetch(adUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adBody),
    });

    if (!adResponse.ok) {
      const error = await adResponse.json();
      throw new Error(`Ad Error: ${error.error?.message || 'Unknown error'}`);
    }

    return adResponse.json();
  }

  /**
   * Busca insights de uma campanha
   */
  async getCampaignInsights(campaignId: string): Promise<any> {
    const url = `${this.baseUrl}/${campaignId}/insights?fields=impressions,clicks,spend,ctr,cpc&access_token=${this.config.accessToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Insights Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data[0] || null;
  }

  /**
   * Pausa/ativa uma campanha
   */
  async updateCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED'): Promise<void> {
    const url = `${this.baseUrl}/${campaignId}`;

    const body = {
      status,
      access_token: this.config.accessToken,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Status Update Error: ${error.error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Lista todas as campanhas
   */
  async listCampaigns(): Promise<MetaAdResponse[]> {
    const url = `${this.baseUrl}/act_${this.config.adAccountId}/campaigns?fields=id,name,status,objective,daily_budget&access_token=${this.config.accessToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`List Campaigns Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data || [];
  }
}

// Export singleton instance (será inicializado com env vars)
let metaAdsInstance: MetaAdsService | null = null;

export const initMetaAds = (config: MetaAdsConfig) => {
  metaAdsInstance = new MetaAdsService(config);
  return metaAdsInstance;
};

export const getMetaAds = (): MetaAdsService => {
  if (!metaAdsInstance) {
    throw new Error('MetaAdsService not initialized. Call initMetaAds() first.');
  }
  return metaAdsInstance;
};

export type { MetaAdsConfig, AdCampaign, AdCreative, AdTargeting, AdSetConfig, MetaAdResponse };
