import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adCreatives, type AdCreative } from "@/data/paid-traffic-creatives";
import {
  Target,
  Zap,
  DollarSign,
  Cpu,
  Award,
  Star,
  TrendingUp,
  Eye,
  Copy,
  Download
} from "lucide-react";

const categoryIcons = {
  dor: Target,
  velocidade: Zap,
  economia: DollarSign,
  tecnologia: Cpu,
  autoridade: Award,
  exclusividade: Star
};

const categoryColors = {
  dor: 'bg-red-500/10 border-red-500/30 text-red-300',
  velocidade: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
  economia: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  tecnologia: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  autoridade: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
  exclusividade: 'bg-orange-500/10 border-orange-500/30 text-orange-300'
};

export default function PaidTrafficCreativePreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCreatives = selectedCategory === 'all'
    ? adCreatives
    : adCreatives.filter(c => c.category === selectedCategory);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderCreativeCard = (creative: AdCreative) => {
    const Icon = categoryIcons[creative.category];

    return (
      <Card key={creative.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded ${categoryColors[creative.category]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                  {creative.id}
                </Badge>
              </div>
              <CardTitle className="text-lg text-slate-50 mb-1">
                {creative.headline}
              </CardTitle>
              <p className="text-sm text-cyan-400 font-medium">
                {creative.subheadline}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-slate-200"
              onClick={() => handleCopy(
                `${creative.headline}\n${creative.subheadline}\n\n${creative.body}\n\n${creative.cta}`,
                creative.id
              )}
            >
              {copiedId === creative.id ? (
                <span className="text-emerald-400 text-xs">✓ Copiado</span>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Target */}
          <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">🎯 Público-Alvo</p>
            <p className="text-sm text-slate-200">{creative.target}</p>
          </div>

          {/* Body */}
          <div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {creative.body}
            </p>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
            >
              {creative.cta}
            </Button>
          </div>

          {/* Gatilhos */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Gatilhos Psicológicos:</p>
            <div className="flex flex-wrap gap-1.5">
              {creative.psychologicalTriggers.map((trigger, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="border-slate-700 bg-slate-800/50 text-slate-300 text-xs"
                >
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>

          {/* Fraquezas dos Concorrentes */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Ataca fraquezas:</p>
            <div className="flex flex-wrap gap-1.5">
              {creative.competitorWeaknesses.map((weakness, i) => (
                <Badge
                  key={i}
                  className="bg-red-500/10 border-red-500/30 text-red-300 text-xs"
                >
                  {weakness}
                </Badge>
              ))}
            </div>
          </div>

          {/* Image Prompt */}
          <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1.5">🎨 Prompt da Imagem:</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {creative.imagePrompt}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-50">
              Criativos de Tráfego Pago
            </h2>
            <p className="text-sm text-slate-400">
              {adCreatives.length} variações persuasivas para capturar nutris dos concorrentes
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-slate-50">{adCreatives.length}</p>
                <p className="text-xs text-slate-400">Criativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-slate-50">6</p>
                <p className="text-xs text-slate-400">Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-slate-50">24</p>
                <p className="text-xs text-slate-400">Gatilhos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-slate-50">&lt; R$3.50</p>
                <p className="text-xs text-slate-400">CPC Target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="all">Todos ({adCreatives.length})</TabsTrigger>
          <TabsTrigger value="dor">
            <Target className="w-3.5 h-3.5 mr-1.5" />
            Dor
          </TabsTrigger>
          <TabsTrigger value="velocidade">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Velocidade
          </TabsTrigger>
          <TabsTrigger value="economia">
            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
            Economia
          </TabsTrigger>
          <TabsTrigger value="tecnologia">
            <Cpu className="w-3.5 h-3.5 mr-1.5" />
            Tech
          </TabsTrigger>
          <TabsTrigger value="autoridade">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Autoridade
          </TabsTrigger>
          <TabsTrigger value="exclusividade">
            <Star className="w-3.5 h-3.5 mr-1.5" />
            Exclusividade
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCreatives.map(renderCreativeCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Actions */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-50 mb-1">
                Exportar criativos
              </h3>
              <p className="text-xs text-slate-400">
                Baixe todos os criativos para usar no Meta Ads Manager
              </p>
            </div>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
