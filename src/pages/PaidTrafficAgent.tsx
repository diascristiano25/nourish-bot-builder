import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Target, TrendingUp, Zap, Palette } from "lucide-react";
import { initPaidTrafficAgent, type BusinessContext } from "@/services/paid-traffic-agent";
import { initMetaAds } from "@/services/meta-ads";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PaidTrafficCreativePreview from "@/components/PaidTrafficCreativePreview";

export default function PaidTrafficAgent() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  // Form state
  const [businessContext, setBusinessContext] = useState<BusinessContext>({
    businessName: "NutriFlow",
    industry: "Saúde e Nutrição",
    targetAudience: "Nutricionistas clínicos e esportivos",
    mainService: "SaaS para gestão de pacientes e criação de cardápios com IA",
    uniqueSellingPoint: "Geração automática de cardápios personalizados usando Inteligência Artificial",
    websiteUrl: "https://nutriflow.inf.br",
    competitorUrls: [],
  });

  // Meta Ads credentials
  const [metaConfig, setMetaConfig] = useState({
    accessToken: "",
    adAccountId: "",
    pixelId: "",
  });

  const handleGenerateStrategy = async () => {
    setIsGenerating(true);

    try {
      // Initialize services
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error("VITE_GEMINI_API_KEY não configurada");
      }

      const agent = initPaidTrafficAgent(geminiKey);

      // Initialize Meta Ads if credentials provided
      if (metaConfig.accessToken && metaConfig.adAccountId) {
        initMetaAds({
          accessToken: metaConfig.accessToken,
          adAccountId: metaConfig.adAccountId,
          pixelId: metaConfig.pixelId || undefined,
        });
      }

      // Generate campaign
      const result = await agent.createFullCampaign(businessContext);

      setStrategy(result.strategy);
      setAnalysis(result.analysis);

      toast({
        title: result.status === "success" ? "Campanha criada! 🎉" : "Estratégia gerada!",
        description: result.message,
        variant: result.status === "error" ? "destructive" : "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar estratégia",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-50">
              Agent de Tráfego Pago
            </h1>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            IA que cria e otimiza campanhas de anúncios no Facebook/Instagram Ads automaticamente
          </p>
        </div>

        <Tabs defaultValue="creatives" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="creatives">
              <Palette className="w-4 h-4 mr-2" />
              Criativos
            </TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="strategy">Estratégia</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>

          {/* Criativos Tab */}
          <TabsContent value="creatives">
            <PaidTrafficCreativePreview />
          </TabsContent>

          {/* Configuração */}
          <TabsContent value="config" className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-50 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Contexto do Negócio
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Forneça informações sobre seu negócio para a IA gerar a estratégia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-slate-300">Nome do Negócio</Label>
                    <Input
                      id="businessName"
                      value={businessContext.businessName}
                      onChange={(e) => setBusinessContext({ ...businessContext, businessName: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-slate-300">Setor</Label>
                    <Input
                      id="industry"
                      value={businessContext.industry}
                      onChange={(e) => setBusinessContext({ ...businessContext, industry: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience" className="text-slate-300">Público-Alvo</Label>
                  <Input
                    id="targetAudience"
                    value={businessContext.targetAudience}
                    onChange={(e) => setBusinessContext({ ...businessContext, targetAudience: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-50"
                    placeholder="Ex: Nutricionistas de 25-45 anos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainService" className="text-slate-300">Serviço Principal</Label>
                  <Textarea
                    id="mainService"
                    value={businessContext.mainService}
                    onChange={(e) => setBusinessContext({ ...businessContext, mainService: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-50 min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usp" className="text-slate-300">Diferencial Competitivo</Label>
                  <Textarea
                    id="usp"
                    value={businessContext.uniqueSellingPoint}
                    onChange={(e) => setBusinessContext({ ...businessContext, uniqueSellingPoint: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-50 min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-slate-300">URL do Site</Label>
                  <Input
                    id="websiteUrl"
                    value={businessContext.websiteUrl}
                    onChange={(e) => setBusinessContext({ ...businessContext, websiteUrl: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-50"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-50 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  Meta Ads API (Opcional)
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Configure para criar campanhas automaticamente. Se deixar em branco, gera apenas a estratégia.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessToken" className="text-slate-300">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={metaConfig.accessToken}
                    onChange={(e) => setMetaConfig({ ...metaConfig, accessToken: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-slate-50"
                    placeholder="EAAG..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adAccountId" className="text-slate-300">Ad Account ID</Label>
                    <Input
                      id="adAccountId"
                      value={metaConfig.adAccountId}
                      onChange={(e) => setMetaConfig({ ...metaConfig, adAccountId: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-50"
                      placeholder="act_123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pixelId" className="text-slate-300">Pixel ID (Opcional)</Label>
                    <Input
                      id="pixelId"
                      value={metaConfig.pixelId}
                      onChange={(e) => setMetaConfig({ ...metaConfig, pixelId: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-slate-50"
                      placeholder="123456789"
                    />
                  </div>
                </div>

                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <p className="text-xs text-cyan-300">
                    💡 <strong>Como obter credenciais:</strong> Acesse o Meta Business Suite → Configurações → Contas de Anúncios → Ferramentas → Graph API Explorer
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerateStrategy}
              disabled={isGenerating}
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Estratégia com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Estratégia de Campanha
                </>
              )}
            </Button>
          </TabsContent>

          {/* Estratégia */}
          <TabsContent value="strategy">
            {strategy ? (
              <div className="space-y-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-50">Visão Geral da Campanha</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Objetivo</p>
                        <p className="text-lg font-semibold text-slate-50">{strategy.objective}</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Budget Diário</p>
                        <p className="text-lg font-semibold text-slate-50">
                          R$ {(strategy.budget / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Duração</p>
                        <p className="text-lg font-semibold text-slate-50">{strategy.duration} dias</p>
                      </div>
                    </div>

                    <Separator className="bg-slate-800" />

                    <div>
                      <h3 className="text-sm font-semibold text-slate-50 mb-3">Segmentação</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
                          <p className="text-xs text-slate-400">Países</p>
                          <p className="text-sm text-slate-200">{strategy.targeting.countries.join(", ")}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
                          <p className="text-xs text-slate-400">Idade</p>
                          <p className="text-sm text-slate-200">
                            {strategy.targeting.ageMin} - {strategy.targeting.ageMax} anos
                          </p>
                        </div>
                        {strategy.targeting.locations?.cities && (
                          <div className="p-3 bg-slate-800/50 rounded border border-slate-700 col-span-2">
                            <p className="text-xs text-slate-400">Cidades</p>
                            <p className="text-sm text-slate-200">
                              {strategy.targeting.locations.cities.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-slate-800" />

                    <div>
                      <h3 className="text-sm font-semibold text-slate-50 mb-2">Raciocínio Estratégico</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{strategy.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-50">Variações de Anúncios</CardTitle>
                    <CardDescription className="text-slate-400">
                      {strategy.adVariations.length} variações criadas para teste A/B
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {strategy.adVariations.map((ad: any, index: number) => (
                      <div key={index} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                            Variação {index + 1}
                          </Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {ad.callToAction}
                          </Badge>
                        </div>
                        <h4 className="text-base font-semibold text-slate-50 mb-2">{ad.title}</h4>
                        <p className="text-sm text-slate-300 mb-3">{ad.description}</p>
                        <p className="text-xs text-slate-500">→ {ad.destinationUrl}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Gere uma estratégia primeiro</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Análise */}
          <TabsContent value="analysis">
            {analysis ? (
              <div className="space-y-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-50 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      Insights de Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {analysis.marketInsights}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-50">Perfil do Público</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {analysis.audienceProfile}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-50">Resultados Esperados</CardTitle>
                    <CardDescription className="text-slate-400">
                      Budget Recomendado: R$ {(analysis.recommendedBudget / 100).toFixed(2)}/dia
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-xs text-emerald-300 mb-1">Impressões</p>
                        <p className="text-lg font-bold text-emerald-400">
                          {analysis.expectedResults.impressions}
                        </p>
                      </div>
                      <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                        <p className="text-xs text-cyan-300 mb-1">Cliques</p>
                        <p className="text-lg font-bold text-cyan-400">
                          {analysis.expectedResults.clicks}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <p className="text-xs text-orange-300 mb-1">Conversões</p>
                        <p className="text-lg font-bold text-orange-400">
                          {analysis.expectedResults.conversions}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-50">Dicas de Otimização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.optimizationTips.map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="py-12 text-center">
                  <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Análise disponível após gerar estratégia</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
