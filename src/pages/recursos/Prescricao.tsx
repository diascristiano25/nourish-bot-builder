import { Navigate } from 'react-router-dom';
import { HybridPage } from '@/components/hybrid/HybridPage';
import { LockedFeature } from '@/components/hybrid/LockedFeature';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, Utensils, FileText, Database, Zap } from 'lucide-react';

export default function Prescricao() {
  const publicContent = (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#C4764A]/5 to-[#FAF8F5]">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#518C5B]/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#518C5B]" />
            <span className="text-sm font-semibold text-[#518C5B]">Powered by AI</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#518C5B] mb-6">
            Cardápios Personalizados com IA
          </h1>
          <p className="text-lg text-[#C4764A]/80 mb-8 max-w-2xl mx-auto">
            Crie prescrições dietéticas completas em minutos. Nossa IA considera restrições alimentares, objetivos e preferências do paciente.
          </p>
          <Button
            className="bg-[#C4764A] hover:bg-[#C4764A]/90 text-white px-8 py-6 text-lg"
            onClick={() => window.location.href = '/auth'}
          >
            Experimentar IA Gratuitamente
          </Button>
        </div>
      </section>

      {/* Demo Meal Plan */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#518C5B] mb-3">
              Exemplo de Cardápio Gerado
            </h2>
            <p className="text-[#C4764A]/70">
              Veja como a IA cria planos nutricionais completos e personalizados
            </p>
          </div>

          <Card className="p-8 border-[#518C5B]/20 bg-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-[#518C5B] mb-2">
                  Plano para Hipertrofia
                </h3>
                <p className="text-[#C4764A]/70">
                  Paciente: 28 anos, masculino, 75kg, objetivo: ganho de massa muscular
                </p>
              </div>
              <Badge className="bg-[#518C5B]/10 text-[#518C5B] border-[#518C5B]/20">
                2.800 kcal/dia
              </Badge>
            </div>

            <div className="space-y-6">
              {/* Breakfast */}
              <div className="border-l-4 border-[#518C5B] pl-4">
                <h4 className="font-bold text-[#518C5B] mb-2">Café da Manhã (07:00)</h4>
                <ul className="space-y-1 text-[#C4764A]/80">
                  <li>• 3 ovos mexidos com espinafre</li>
                  <li>• 2 fatias de pão integral</li>
                  <li>• 1 banana média</li>
                  <li>• 200ml de leite desnatado</li>
                </ul>
                <p className="text-sm text-[#C4764A]/60 mt-2">
                  Macros: 35g proteína, 45g carboidratos, 12g gorduras
                </p>
              </div>

              {/* Snack */}
              <div className="border-l-4 border-[#C4764A] pl-4">
                <h4 className="font-bold text-[#518C5B] mb-2">Lanche da Manhã (10:00)</h4>
                <ul className="space-y-1 text-[#C4764A]/80">
                  <li>• 1 iogurte grego natural (170g)</li>
                  <li>• 30g de granola</li>
                  <li>• 1 colher de sopa de mel</li>
                </ul>
                <p className="text-sm text-[#C4764A]/60 mt-2">
                  Macros: 18g proteína, 35g carboidratos, 8g gorduras
                </p>
              </div>

              {/* Lunch */}
              <div className="border-l-4 border-[#518C5B] pl-4">
                <h4 className="font-bold text-[#518C5B] mb-2">Almoço (12:30)</h4>
                <ul className="space-y-1 text-[#C4764A]/80">
                  <li>• 150g de frango grelhado</li>
                  <li>• 1 xícara de arroz integral</li>
                  <li>• 1 xícara de feijão preto</li>
                  <li>• Salada verde à vontade</li>
                  <li>• 1 colher de azeite</li>
                </ul>
                <p className="text-sm text-[#C4764A]/60 mt-2">
                  Macros: 52g proteína, 68g carboidratos, 15g gorduras
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#518C5B]/5 rounded-lg">
              <p className="text-sm text-[#518C5B] font-semibold mb-1">
                💡 Recomendações da IA:
              </p>
              <p className="text-sm text-[#C4764A]/70">
                Mantenha hidratação de 3L/dia. Realize 5-6 refeições. Consuma proteína a cada 3-4 horas para síntese proteica otimizada.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 px-6 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#518C5B] text-center mb-12">
            Recursos de Prescrição
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-[#518C5B]/20 flex items-start gap-4">
              <div className="w-10 h-10 bg-[#518C5B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#518C5B]" />
              </div>
              <div>
                <h3 className="font-bold text-[#518C5B] mb-2">Geração Automática com IA</h3>
                <p className="text-[#C4764A]/70 text-sm">
                  Crie cardápios completos em 30 segundos. A IA analisa histórico, restrições, preferências e objetivos do paciente.
                </p>
              </div>
            </Card>

            <Card className="p-6 border-[#518C5B]/20 flex items-start gap-4">
              <div className="w-10 h-10 bg-[#C4764A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Utensils className="w-5 h-5 text-[#C4764A]" />
              </div>
              <div>
                <h3 className="font-bold text-[#518C5B] mb-2">Substituições Inteligentes</h3>
                <p className="text-[#C4764A]/70 text-sm">
                  Sugira trocas automáticas de alimentos mantendo equivalência nutricional. Facilite a adesão do paciente ao plano.
                </p>
              </div>
            </Card>

            <Card className="p-6 border-[#518C5B]/20 flex items-start gap-4">
              <div className="w-10 h-10 bg-[#518C5B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[#518C5B]" />
              </div>
              <div>
                <h3 className="font-bold text-[#518C5B] mb-2">Exportação Profissional</h3>
                <p className="text-[#C4764A]/70 text-sm">
                  Exporte cardápios em PDF com sua identidade visual. Inclua logo, CRN e orientações personalizadas automaticamente.
                </p>
              </div>
            </Card>

            <Card className="p-6 border-[#518C5B]/20 flex items-start gap-4">
              <div className="w-10 h-10 bg-[#C4764A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-[#C4764A]" />
              </div>
              <div>
                <h3 className="font-bold text-[#518C5B] mb-2">Tabela TACO Integrada</h3>
                <p className="text-[#C4764A]/70 text-sm">
                  Acesso completo à tabela TACO de composição nutricional. Cálculos automáticos de macros e micronutrientes.
                </p>
              </div>
            </Card>

            <Card className="p-6 border-[#518C5B]/20 flex items-start gap-4">
              <div className="w-10 h-10 bg-[#518C5B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-[#518C5B]" />
              </div>
              <div>
                <h3 className="font-bold text-[#518C5B] mb-2">Ajustes em Tempo Real</h3>
                <p className="text-[#C4764A]/70 text-sm">
                  Modifique porções e veja os macros atualizarem instantaneamente. Balanceie o plano até atingir as metas do paciente.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Template Gallery */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#518C5B] text-center mb-12">
            Biblioteca de Templates
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LockedFeature
              title="Low Carb"
              description="12 modelos prontos para dietas low carb, keto e cetogênica"
            />
            <LockedFeature
              title="Vegetariano"
              description="15 templates completos para dietas vegetarianas e veganas"
            />
            <LockedFeature
              title="Ganho de Massa"
              description="18 planos hipercalóricos para hipertrofia e ganho de peso"
            />
            <LockedFeature
              title="Emagrecimento"
              description="20 cardápios hipocalóricos com foco em perda de gordura"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#518C5B]/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#518C5B] mb-6">
            Economize horas de trabalho com IA
          </h2>
          <p className="text-lg text-[#C4764A]/80 mb-8">
            Junte-se a mais de 2.500 nutricionistas que já usam NutriFlow para criar cardápios profissionais em minutos.
          </p>
          <Button
            className="bg-[#518C5B] hover:bg-[#518C5B]/90 text-white px-8 py-6 text-lg"
            onClick={() => window.location.href = '/auth'}
          >
            Começar Agora
          </Button>
        </div>
      </section>
    </div>
  );

  const authContent = <Navigate to="/biblioteca" replace />;

  return (
    <HybridPage
      publicContent={publicContent}
      authContent={authContent}
      title="Prescrição"
      description="Crie cardápios personalizados com IA em minutos. Biblioteca de templates, cálculo automático de macros e exportação profissional."
    />
  );
}
