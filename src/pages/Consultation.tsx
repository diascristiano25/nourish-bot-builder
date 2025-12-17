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
import { 
  ArrowLeft, 
  Sparkles, 
  FileText,
  User,
  Ruler,
  Activity,
  Utensils,
  ToggleLeft,
  ToggleRight
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
  const [activePhase, setActivePhase] = useState<string>('anamnese');
  const [viewMode, setViewMode] = useState<'freeflow' | 'structured'>('freeflow');
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

  const hasAIContent = freeText.length > 50;

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50">
          <div className="px-8 h-16 flex items-center justify-between">
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

        <main className="p-8 max-w-5xl mx-auto">
          {/* Phase Tabs */}
          <Tabs value={activePhase} onValueChange={setActivePhase} className="space-y-8">
            <TabsList className="bg-muted/50 p-1 rounded-xl h-auto">
              <TabsTrigger 
                value="anamnese" 
                className="rounded-lg px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Anamnese
              </TabsTrigger>
              <TabsTrigger 
                value="exames" 
                className="rounded-lg px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Exames
              </TabsTrigger>
              <TabsTrigger 
                value="plano" 
                className="rounded-lg px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Plano Alimentar
              </TabsTrigger>
              <TabsTrigger 
                value="orientacoes" 
                className="rounded-lg px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Orientações
              </TabsTrigger>
            </TabsList>

            {/* Anamnese Tab */}
            <TabsContent value="anamnese" className="space-y-6 animate-fade-in">
              {/* View Mode Toggle */}
              <div className="flex items-center justify-between">
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
                      placeholder="Digite livremente as queixas, rotina e histórico do paciente... A IA organizará tudo depois.

Exemplo: 'Maria, 32 anos, busca emagrecimento. Trabalha em escritório, sedentária. Prefere alimentos naturais, não gosta de peixe. Sem alergias. Peso atual 72kg, altura 1,65m. Meta: perder 8kg em 4 meses. Come muito à noite por ansiedade...'"
                      className="min-h-[450px] bg-card border-border/50 text-base leading-relaxed resize-none focus:border-primary/30 focus:ring-primary/10 rounded-xl p-6"
                    />
                    
                    {/* AI Status */}
                    {freeText.length > 0 && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
                        <Sparkles className={`w-3.5 h-3.5 ${hasAIContent ? 'text-primary' : 'text-muted-foreground/50'}`} />
                        {hasAIContent ? 'Pronto para estruturar' : 'Continue escrevendo...'}
                      </div>
                    )}
                  </div>

                  {/* AI Hint */}
                  {hasAIContent && (
                    <Card className="border-primary/20 bg-primary/5 animate-scale-in">
                      <CardContent className="py-4 px-5">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Dados detectados pela IA</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Clique em "Visualização Estruturada" para ver os campos preenchidos automaticamente.
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
                  {hasAIContent && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="py-3 px-4">
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          Campos preenchidos automaticamente com base nas suas anotações livres.
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
                          value={hasAIContent ? 'Maria Silva' : structuredData.name}
                          onChange={(e) => handleStructuredChange('name', e.target.value)}
                          placeholder="Nome completo"
                          disabled={hasAIContent}
                          className="rounded-lg h-10 disabled:bg-muted/50 disabled:text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm text-muted-foreground">Idade</Label>
                        <Input
                          id="age"
                          value={hasAIContent ? '32' : structuredData.age}
                          onChange={(e) => handleStructuredChange('age', e.target.value)}
                          placeholder="Ex: 32"
                          disabled={hasAIContent}
                          className="rounded-lg h-10 disabled:bg-muted/50 disabled:text-foreground"
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
                          value={hasAIContent ? '72' : structuredData.weight}
                          onChange={(e) => handleStructuredChange('weight', e.target.value)}
                          placeholder="Ex: 72"
                          disabled={hasAIContent}
                          className="rounded-lg h-10 disabled:bg-muted/50 disabled:text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-sm text-muted-foreground">Altura (cm)</Label>
                        <Input
                          id="height"
                          value={hasAIContent ? '165' : structuredData.height}
                          onChange={(e) => handleStructuredChange('height', e.target.value)}
                          placeholder="Ex: 165"
                          disabled={hasAIContent}
                          className="rounded-lg h-10 disabled:bg-muted/50 disabled:text-foreground"
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
                        value={hasAIContent ? 'Trabalha em escritório, sedentária. Come muito à noite por ansiedade.' : structuredData.habits}
                        onChange={(e) => handleStructuredChange('habits', e.target.value)}
                        placeholder="Descreva a rotina do paciente, nível de atividade física, horários, etc."
                        disabled={hasAIContent}
                        className="min-h-[100px] rounded-lg disabled:bg-muted/50 disabled:text-foreground"
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
                          value={hasAIContent ? 'Prefere alimentos naturais' : structuredData.preferences}
                          onChange={(e) => handleStructuredChange('preferences', e.target.value)}
                          placeholder="Alimentos que o paciente gosta, preferências culinárias..."
                          disabled={hasAIContent}
                          className="min-h-[80px] rounded-lg disabled:bg-muted/50 disabled:text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Restrições e Alergias</Label>
                        <Textarea
                          value={hasAIContent ? 'Não gosta de peixe. Sem alergias.' : structuredData.restrictions}
                          onChange={(e) => handleStructuredChange('restrictions', e.target.value)}
                          placeholder="Alergias, intolerâncias, alimentos que evita..."
                          disabled={hasAIContent}
                          className="min-h-[80px] rounded-lg disabled:bg-muted/50 disabled:text-foreground"
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
