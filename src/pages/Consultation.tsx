import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/AppLayout';
import { ConsultationMealPlanEditor } from '@/components/ConsultationMealPlanEditor';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText,
  User,
  Ruler,
  Activity,
  Utensils,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Wand2,
  Heart,
  CheckCircle2
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
  healthConditions: string;
}

export default function Consultation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activePhase, setActivePhase] = useState<string>('anamnese');
  const [viewMode, setViewMode] = useState<'freeflow' | 'structured'>('freeflow');
  const [freeText, setFreeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);
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
    healthConditions: '',
  });

  const handleStructuredChange = (field: keyof StructuredData, value: string) => {
    setStructuredData(prev => ({ ...prev, [field]: value }));
  };

  // AI Parsing function (simulated)
  const parseTextToData = async () => {
    if (!freeText.trim()) {
      toast({
        title: 'Texto vazio',
        description: 'Digite algo na anamnese livre antes de analisar.',
        variant: 'destructive'
      });
      return;
    }

    setIsParsing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const textUpper = freeText.toUpperCase();
    const newData: Partial<StructuredData> = {};
    
    // Parse DIABETES
    if (textUpper.includes('DIABETES')) {
      newData.healthConditions = 'Diabetes Tipo 2';
    }
    
    // Parse VEGETARIANO
    if (textUpper.includes('VEGETARIANO') || textUpper.includes('VEGETARIANA')) {
      newData.habits = 'Dieta Vegetariana';
    }
    
    // Parse "PESA XX" pattern
    const weightMatch = textUpper.match(/PESA\s*(\d+)/);
    if (weightMatch) {
      newData.weight = weightMatch[1];
    }
    
    // Parse age pattern "XX ANOS"
    const ageMatch = textUpper.match(/(\d+)\s*ANOS/);
    if (ageMatch) {
      newData.age = ageMatch[1];
    }
    
    // Parse height pattern "1,XX" or "1.XX" meters
    const heightMatch = freeText.match(/1[,.](\d{2})/);
    if (heightMatch) {
      newData.height = `1${heightMatch[1]}`;
    }
    
    // Parse name (first capitalized word pattern)
    const nameMatch = freeText.match(/^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+)/);
    if (nameMatch) {
      newData.name = nameMatch[1];
    }
    
    // Parse allergies/restrictions
    if (textUpper.includes('ALERGIA') || textUpper.includes('INTOLERÂNCIA') || textUpper.includes('INTOLERANCIA')) {
      const alergiaMatch = freeText.match(/alergia\s*(?:a|ao|à)?\s*([^,.]+)/i);
      if (alergiaMatch) {
        newData.restrictions = alergiaMatch[1].trim();
      }
    }
    
    // Parse HIPERTENSÃO
    if (textUpper.includes('HIPERTENSÃO') || textUpper.includes('HIPERTENSAO') || textUpper.includes('PRESSÃO ALTA')) {
      newData.healthConditions = (newData.healthConditions ? newData.healthConditions + ', ' : '') + 'Hipertensão';
    }
    
    // Update structured data with parsed values
    setStructuredData(prev => ({
      ...prev,
      ...newData
    }));
    
    setIsParsing(false);
    setHasParsed(true);
    
    // Switch to structured view to show results
    setViewMode('structured');
    
    const fieldsFound = Object.keys(newData).length;
    toast({
      title: '✨ Análise concluída!',
      description: fieldsFound > 0 
        ? `${fieldsFound} campo(s) preenchido(s) automaticamente. Revise e edite se necessário.`
        : 'Nenhum dado reconhecido. Tente usar palavras-chave como DIABETES, VEGETARIANO, PESA XX.',
    });
  };

  const hasAIContent = freeText.length > 50;

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-lg"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Nova Consulta</h1>
                <p className="text-xs text-muted-foreground">Atendimento em andamento</p>
              </div>
            </div>
            <Button size="sm" className="h-9 rounded-lg px-5">
              Salvar Consulta
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-5xl mx-auto">
          {/* Phase Tabs */}
          <Tabs value={activePhase} onValueChange={setActivePhase} className="space-y-8">
            <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
              <TabsTrigger 
                value="anamnese" 
                className="rounded-lg px-4 md:px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Anamnese
              </TabsTrigger>
              <TabsTrigger 
                value="exames" 
                className="rounded-lg px-4 md:px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Exames
              </TabsTrigger>
              <TabsTrigger 
                value="plano" 
                className="rounded-lg px-4 md:px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Plano Alimentar
              </TabsTrigger>
              <TabsTrigger 
                value="orientacoes" 
                className="rounded-lg px-4 md:px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Orientações
              </TabsTrigger>
            </TabsList>

            {/* Anamnese Tab */}
            <TabsContent value="anamnese" className="space-y-6 animate-fade-in">
              {/* View Mode Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-foreground">Coleta de Dados</h2>
                  <p className="text-sm text-muted-foreground">
                    {viewMode === 'freeflow' 
                      ? 'Digite livremente. A IA organizará depois.' 
                      : 'Preencha os campos estruturados.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'freeflow' ? 'structured' : 'freeflow')}
                  className="rounded-lg gap-2 h-9"
                >
                  {viewMode === 'freeflow' ? (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      Visualização Estruturada
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      Modo Free-Flow
                    </>
                  )}
                </Button>
              </div>

              {/* Free-Flow Mode */}
              {viewMode === 'freeflow' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      placeholder={`Digite livremente as queixas, rotina e histórico do paciente...

Dica: Use palavras-chave para extração automática:
• DIABETES → preenche Condições de Saúde
• VEGETARIANO → preenche Hábitos Alimentares  
• PESA 75 → preenche Peso Atual
• 32 ANOS → preenche Idade
• 1,65 → preenche Altura

Exemplo: "Maria, 32 anos, PESA 75kg, altura 1,65m. Tem DIABETES tipo 2. É VEGETARIANA há 3 anos..."`}
                      className="min-h-[400px] bg-card border-border/50 text-base leading-relaxed resize-none focus:border-primary/30 focus:ring-primary/10 rounded-xl p-6"
                    />
                    
                    {/* AI Status */}
                    {freeText.length > 0 && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
                        <Sparkles className={`w-3.5 h-3.5 ${hasAIContent ? 'text-primary' : 'text-muted-foreground/50'}`} />
                        {hasAIContent ? 'Pronto para analisar' : 'Continue escrevendo...'}
                      </div>
                    )}
                  </div>

                  {/* AI Parse Button */}
                  <Button
                    onClick={parseTextToData}
                    disabled={isParsing || !freeText.trim()}
                    className="w-full gap-2 h-12 text-base"
                    size="lg"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analisando texto...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Analisar Texto e Preencher Estruturado
                      </>
                    )}
                  </Button>

                  {/* AI Hint */}
                  {hasAIContent && !hasParsed && (
                    <Card className="border-primary/20 bg-primary/5 animate-scale-in">
                      <CardContent className="py-4 px-5">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Texto pronto para análise</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Clique no botão acima para extrair os dados automaticamente.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Structured Mode */}
              {viewMode === 'structured' && (
                <div className="space-y-6">
                  {/* AI Notice */}
                  {hasParsed && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="py-3 px-4">
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          Campos preenchidos pela IA. Todos são editáveis - corrija se necessário.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Patient Data */}
                  <Card className="border-border/50">
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
                          className="rounded-lg h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm text-muted-foreground">Idade</Label>
                        <Input
                          id="age"
                          value={structuredData.age}
                          onChange={(e) => handleStructuredChange('age', e.target.value)}
                          placeholder="Ex: 32"
                          className="rounded-lg h-10"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Anthropometry */}
                  <Card className="border-border/50">
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
                          className="rounded-lg h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-sm text-muted-foreground">Altura (cm)</Label>
                        <Input
                          id="height"
                          value={structuredData.height}
                          onChange={(e) => handleStructuredChange('height', e.target.value)}
                          placeholder="Ex: 165"
                          className="rounded-lg h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bodyFat" className="text-sm text-muted-foreground">% Gordura</Label>
                        <Input
                          id="bodyFat"
                          value={structuredData.bodyFat}
                          onChange={(e) => handleStructuredChange('bodyFat', e.target.value)}
                          placeholder="Ex: 28"
                          className="rounded-lg h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waist" className="text-sm text-muted-foreground">Cintura (cm)</Label>
                        <Input
                          id="waist"
                          value={structuredData.waist}
                          onChange={(e) => handleStructuredChange('waist', e.target.value)}
                          placeholder="Ex: 80"
                          className="rounded-lg h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hip" className="text-sm text-muted-foreground">Quadril (cm)</Label>
                        <Input
                          id="hip"
                          value={structuredData.hip}
                          onChange={(e) => handleStructuredChange('hip', e.target.value)}
                          placeholder="Ex: 98"
                          className="rounded-lg h-10"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Health Conditions */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        Condições de Saúde
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={structuredData.healthConditions}
                        onChange={(e) => handleStructuredChange('healthConditions', e.target.value)}
                        placeholder="Diabetes, hipertensão, colesterol alto, etc."
                        className="min-h-[80px] rounded-lg"
                      />
                    </CardContent>
                  </Card>

                  {/* Habits */}
                  <Card className="border-border/50">
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
                        className="min-h-[100px] rounded-lg"
                      />
                    </CardContent>
                  </Card>

                  {/* Preferences */}
                  <Card className="border-border/50">
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
                          className="min-h-[80px] rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Restrições e Alergias</Label>
                        <Textarea
                          value={structuredData.restrictions}
                          onChange={(e) => handleStructuredChange('restrictions', e.target.value)}
                          placeholder="Alergias, intolerâncias, alimentos que evita..."
                          className="min-h-[80px] rounded-lg"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Other Tabs - Placeholder */}
            <TabsContent value="exames" className="animate-fade-in">
              <Card className="border-border/50">
                <CardContent className="py-16 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Área de exames em desenvolvimento</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plano" className="animate-fade-in">
              <ConsultationMealPlanEditor />
            </TabsContent>

            <TabsContent value="orientacoes" className="animate-fade-in">
              <Card className="border-border/50">
                <CardContent className="py-16 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Área de orientações em desenvolvimento</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AppLayout>
  );
}
