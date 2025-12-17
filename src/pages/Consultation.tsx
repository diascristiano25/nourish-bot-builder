import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Leaf, 
  ArrowLeft, 
  Sparkles, 
  FileText,
  User,
  Ruler,
  Activity,
  Utensils
} from 'lucide-react';

interface StructuredData {
  name: string;
  age: string;
  weight: string;
  height: string;
  waist: string;
  hip: string;
  bodyFat: string;
  habits: string;
  preferences: string;
  restrictions: string;
}

export default function Consultation() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('ai');
  const [freeText, setFreeText] = useState('');
  const [structuredData, setStructuredData] = useState<StructuredData>({
    name: '',
    age: '',
    weight: '',
    height: '',
    waist: '',
    hip: '',
    bodyFat: '',
    habits: '',
    preferences: '',
    restrictions: '',
  });

  const handleStructuredChange = (field: keyof StructuredData, value: string) => {
    setStructuredData(prev => ({ ...prev, [field]: value }));
  };

  // Simulate AI extraction preview (visual simulation only)
  const hasAIContent = freeText.length > 50;

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="zen-container h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-medium text-foreground">Nova Consulta</span>
            </div>
          </div>
          <Button size="sm" className="h-8 rounded-lg">
            Salvar
          </Button>
        </div>
      </header>

      <main className="zen-container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              value="ai" 
              className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Anamnese Livre (IA)
            </TabsTrigger>
            <TabsTrigger 
              value="structured" 
              className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              Estruturado
            </TabsTrigger>
          </TabsList>

          {/* AI Free-Form Tab */}
          <TabsContent value="ai" className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Escreva livremente. A IA estruturará suas anotações automaticamente.
              </p>
            </div>
            
            <div className="relative">
              <Textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Digite livremente as anotações da consulta, o histórico do paciente e preferências... A IA estruturará tudo depois.

Exemplo: 'Maria, 32 anos, busca emagrecimento. Trabalha em escritório, sedentária. Prefere alimentos naturais, não gosta de peixe. Sem alergias. Peso atual 72kg, altura 1,65m. Meta: perder 8kg em 4 meses...'"
                className="min-h-[400px] bg-card border-border/50 text-base leading-relaxed resize-none focus:border-primary/30 focus:ring-primary/10 rounded-xl p-5"
              />
              
              {/* AI Status Indicator */}
              {freeText.length > 0 && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2.5 py-1.5 rounded-md">
                  <Sparkles className={`w-3 h-3 ${hasAIContent ? 'text-primary' : 'text-muted-foreground/50'}`} />
                  {hasAIContent ? 'Pronto para estruturar' : 'Continue escrevendo...'}
                </div>
              )}
            </div>

            {/* Preview hint */}
            {hasAIContent && (
              <Card className="zen-card border-primary/20 bg-primary/5 animate-scale-in">
                <CardContent className="py-4 px-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Dados detectados</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        A IA identificou informações no seu texto. Mude para "Estruturado" para ver os campos preenchidos automaticamente.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Structured Tab */}
          <TabsContent value="structured" className="space-y-6 animate-fade-in">
            {/* Indication that fields may be auto-filled */}
            {hasAIContent && (
              <Card className="zen-card border-primary/20 bg-primary/5 mb-6">
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Alguns campos podem ser preenchidos automaticamente com base nas suas anotações livres.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Patient Data */}
            <Card className="zen-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Dados do Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-muted-foreground">Nome</Label>
                  <Input
                    id="name"
                    value={structuredData.name}
                    onChange={(e) => handleStructuredChange('name', e.target.value)}
                    placeholder="Nome completo"
                    className="zen-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm text-muted-foreground">Idade</Label>
                  <Input
                    id="age"
                    value={structuredData.age}
                    onChange={(e) => handleStructuredChange('age', e.target.value)}
                    placeholder="Ex: 32"
                    className="zen-input"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Anthropometry */}
            <Card className="zen-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" />
                  Antropometria
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm text-muted-foreground">Peso (kg)</Label>
                  <Input
                    id="weight"
                    value={structuredData.weight}
                    onChange={(e) => handleStructuredChange('weight', e.target.value)}
                    placeholder="Ex: 72"
                    className="zen-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm text-muted-foreground">Altura (cm)</Label>
                  <Input
                    id="height"
                    value={structuredData.height}
                    onChange={(e) => handleStructuredChange('height', e.target.value)}
                    placeholder="Ex: 165"
                    className="zen-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat" className="text-sm text-muted-foreground">% Gordura</Label>
                  <Input
                    id="bodyFat"
                    value={structuredData.bodyFat}
                    onChange={(e) => handleStructuredChange('bodyFat', e.target.value)}
                    placeholder="Ex: 28"
                    className="zen-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist" className="text-sm text-muted-foreground">Cintura (cm)</Label>
                  <Input
                    id="waist"
                    value={structuredData.waist}
                    onChange={(e) => handleStructuredChange('waist', e.target.value)}
                    placeholder="Ex: 80"
                    className="zen-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hip" className="text-sm text-muted-foreground">Quadril (cm)</Label>
                  <Input
                    id="hip"
                    value={structuredData.hip}
                    onChange={(e) => handleStructuredChange('hip', e.target.value)}
                    placeholder="Ex: 98"
                    className="zen-input"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Habits */}
            <Card className="zen-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Hábitos e Rotina
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={structuredData.habits}
                  onChange={(e) => handleStructuredChange('habits', e.target.value)}
                  placeholder="Descreva a rotina do paciente, nível de atividade física, horários, etc."
                  className="min-h-[100px] zen-input"
                />
              </CardContent>
            </Card>

            {/* Preferences & Restrictions */}
            <Card className="zen-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-primary" />
                  Preferências Alimentares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Preferências</Label>
                  <Textarea
                    value={structuredData.preferences}
                    onChange={(e) => handleStructuredChange('preferences', e.target.value)}
                    placeholder="Alimentos que o paciente gosta, preferências culinárias..."
                    className="min-h-[80px] zen-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Restrições e Alergias</Label>
                  <Textarea
                    value={structuredData.restrictions}
                    onChange={(e) => handleStructuredChange('restrictions', e.target.value)}
                    placeholder="Alergias, intolerâncias, alimentos que evita..."
                    className="min-h-[80px] zen-input"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
