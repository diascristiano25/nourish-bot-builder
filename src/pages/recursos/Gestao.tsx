import { Navigate } from 'react-router-dom';
import { HybridPage } from '@/components/hybrid/HybridPage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Users, FileBarChart, DollarSign, Check, X } from 'lucide-react';

export default function Gestao() {
  const publicContent = (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#518C5B]/5 to-[#FAF8F5]">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#518C5B] mb-6">
            Gestão Completa do seu Consultório
          </h1>
          <p className="text-lg text-[#C4764A]/80 mb-8 max-w-2xl mx-auto">
            Dashboards inteligentes, gestão de pacientes, relatórios financeiros e análise de resultados em uma única plataforma.
          </p>
          <Button
            className="bg-[#C4764A] hover:bg-[#C4764A]/90 text-white px-8 py-6 text-lg"
            onClick={() => window.location.href = '/auth'}
          >
            Começar Gratuitamente
          </Button>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#518C5B] text-center mb-12">
            Tudo que você precisa para gerenciar seu consultório
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-[#518C5B]/20 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#518C5B]/10 rounded-lg flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6 text-[#518C5B]" />
              </div>
              <h3 className="text-xl font-bold text-[#518C5B] mb-3">
                Dashboard Executivo
              </h3>
              <p className="text-[#C4764A]/70 leading-relaxed mb-4">
                Visualize métricas essenciais do seu consultório em tempo real: consultas do dia, receita mensal, taxa de conversão e evolução de pacientes.
              </p>
              <ul className="space-y-2 text-sm text-[#C4764A]/80">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#518C5B] rounded-full" />
                  Gráficos de receita e faturamento
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#518C5B] rounded-full" />
                  Acompanhamento de metas mensais
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#518C5B] rounded-full" />
                  Alertas de aniversários e retornos
                </li>
              </ul>
            </Card>

            <Card className="p-8 border-[#518C5B]/20 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#C4764A]/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#C4764A]" />
              </div>
              <h3 className="text-xl font-bold text-[#518C5B] mb-3">
                Gestão de Pacientes
              </h3>
              <p className="text-[#C4764A]/70 leading-relaxed mb-4">
                Cadastro completo, histórico de evolução, anotações personalizadas e comunicação integrada com seus pacientes.
              </p>
              <ul className="space-y-2 text-sm text-[#C4764A]/80">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#C4764A] rounded-full" />
                  Fichas detalhadas e anamnese digital
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#C4764A] rounded-full" />
                  Fotos de progresso e bioimpedância
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#C4764A] rounded-full" />
                  Portal do paciente integrado
                </li>
              </ul>
            </Card>

            <Card className="p-8 border-[#518C5B]/20 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#518C5B]/10 rounded-lg flex items-center justify-center mb-4">
                <FileBarChart className="w-6 h-6 text-[#518C5B]" />
              </div>
              <h3 className="text-xl font-bold text-[#518C5B] mb-3">
                Relatórios Avançados
              </h3>
              <p className="text-[#C4764A]/70 leading-relaxed mb-4">
                Análises detalhadas de desempenho, retenção de pacientes, efetividade de protocolos e identificação de oportunidades de crescimento.
              </p>
              <ul className="space-y-2 text-sm text-[#C4764A]/80">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#518C5B] rounded-full" />
                  Relatórios de aderência ao tratamento
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#518C5B] rounded-full" />
                  Análise de resultados por protocolo
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#518C5B] rounded-full" />
                  Exportação em Excel e PDF
                </li>
              </ul>
            </Card>

            <Card className="p-8 border-[#518C5B]/20 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#C4764A]/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-[#C4764A]" />
              </div>
              <h3 className="text-xl font-bold text-[#518C5B] mb-3">
                Controle Financeiro
              </h3>
              <p className="text-[#C4764A]/70 leading-relaxed mb-4">
                Emissão de recibos, controle de inadimplência, previsão de receita e integração com sistemas de pagamento online.
              </p>
              <ul className="space-y-2 text-sm text-[#C4764A]/80">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#C4764A] rounded-full" />
                  Recibos com assinatura digital
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#C4764A] rounded-full" />
                  Lembretes de pagamento automáticos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#C4764A] rounded-full" />
                  Integração Pix e cartão de crédito
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#518C5B] text-center mb-12">
            Compare os Planos
          </h2>
          <Card className="overflow-hidden border-[#518C5B]/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#518C5B]/10">
                    <th className="text-left p-4 font-semibold text-[#518C5B]">Recurso</th>
                    <th className="text-center p-4 font-semibold text-[#518C5B]">Gratuito</th>
                    <th className="text-center p-4 font-semibold text-[#C4764A] bg-[#C4764A]/5">
                      Profissional
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#518C5B]/5">
                    <td className="p-4 text-[#C4764A]/80">Pacientes ativos</td>
                    <td className="text-center p-4 text-[#C4764A]/70">Até 20</td>
                    <td className="text-center p-4 text-[#518C5B] font-semibold bg-[#C4764A]/5">
                      Ilimitados
                    </td>
                  </tr>
                  <tr className="border-b border-[#518C5B]/5">
                    <td className="p-4 text-[#C4764A]/80">Dashboard com métricas</td>
                    <td className="text-center p-4">
                      <Check className="w-5 h-5 text-[#518C5B] mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-[#C4764A]/5">
                      <Check className="w-5 h-5 text-[#518C5B] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-[#518C5B]/5">
                    <td className="p-4 text-[#C4764A]/80">Relatórios avançados</td>
                    <td className="text-center p-4">
                      <X className="w-5 h-5 text-[#C4764A]/30 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-[#C4764A]/5">
                      <Check className="w-5 h-5 text-[#518C5B] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-[#518C5B]/5">
                    <td className="p-4 text-[#C4764A]/80">Controle financeiro completo</td>
                    <td className="text-center p-4">
                      <X className="w-5 h-5 text-[#C4764A]/30 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-[#C4764A]/5">
                      <Check className="w-5 h-5 text-[#518C5B] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-[#518C5B]/5">
                    <td className="p-4 text-[#C4764A]/80">Emissão de recibos</td>
                    <td className="text-center p-4">
                      <X className="w-5 h-5 text-[#C4764A]/30 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-[#C4764A]/5">
                      <Check className="w-5 h-5 text-[#518C5B] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-[#518C5B]/5">
                    <td className="p-4 text-[#C4764A]/80">Exportação de dados</td>
                    <td className="text-center p-4">
                      <Badge variant="outline" className="text-xs">Limitado</Badge>
                    </td>
                    <td className="text-center p-4 bg-[#C4764A]/5">
                      <Check className="w-5 h-5 text-[#518C5B] mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 text-[#C4764A]/80">Suporte prioritário</td>
                    <td className="text-center p-4">
                      <X className="w-5 h-5 text-[#C4764A]/30 mx-auto" />
                    </td>
                    <td className="text-center p-4 bg-[#C4764A]/5">
                      <Check className="w-5 h-5 text-[#518C5B] mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
          <div className="text-center mt-8">
            <Button
              className="bg-[#C4764A] hover:bg-[#C4764A]/90 text-white px-8 py-6 text-lg"
              onClick={() => window.location.href = '/auth'}
            >
              Começar Teste Grátis de 14 dias
            </Button>
            <p className="text-sm text-[#C4764A]/60 mt-3">
              Sem cartão de crédito necessário
            </p>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#518C5B] text-center mb-12">
            Interface Intuitiva e Profissional
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-[#518C5B]/20">
              <div className="aspect-video bg-gradient-to-br from-[#518C5B]/10 to-[#C4764A]/10 rounded-lg flex items-center justify-center mb-4">
                <LayoutDashboard className="w-16 h-16 text-[#518C5B]/30" />
              </div>
              <h3 className="font-bold text-[#518C5B] mb-2">Dashboard Personalizado</h3>
              <p className="text-sm text-[#C4764A]/70">
                Visualize suas métricas principais em cards interativos. Acompanhe receita, consultas agendadas e pacientes ativos em tempo real.
              </p>
            </Card>

            <Card className="p-6 border-[#518C5B]/20">
              <div className="aspect-video bg-gradient-to-br from-[#C4764A]/10 to-[#518C5B]/10 rounded-lg flex items-center justify-center mb-4">
                <FileBarChart className="w-16 h-16 text-[#C4764A]/30" />
              </div>
              <h3 className="font-bold text-[#518C5B] mb-2">Relatórios Detalhados</h3>
              <p className="text-sm text-[#C4764A]/70">
                Gere relatórios completos de desempenho, faturamento e evolução de pacientes. Exporte em PDF ou Excel para contabilidade.
              </p>
            </Card>

            <Card className="p-6 border-[#518C5B]/20">
              <div className="aspect-video bg-gradient-to-br from-[#518C5B]/10 to-[#C4764A]/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-16 h-16 text-[#518C5B]/30" />
              </div>
              <h3 className="font-bold text-[#518C5B] mb-2">Fichas de Pacientes</h3>
              <p className="text-sm text-[#C4764A]/70">
                Acesse histórico completo de cada paciente: anamnese, medidas antropométricas, cardápios prescritos e fotos de progresso.
              </p>
            </Card>

            <Card className="p-6 border-[#518C5B]/20">
              <div className="aspect-video bg-gradient-to-br from-[#C4764A]/10 to-[#518C5B]/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-16 h-16 text-[#C4764A]/30" />
              </div>
              <h3 className="font-bold text-[#518C5B] mb-2">Gestão Financeira</h3>
              <p className="text-sm text-[#C4764A]/70">
                Controle completo de receitas, emissão de recibos profissionais e acompanhamento de inadimplência em uma tela.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#518C5B]/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#518C5B] mb-6">
            Gerencie seu consultório de forma profissional
          </h2>
          <p className="text-lg text-[#C4764A]/80 mb-8">
            Mais de 2.500 nutricionistas já confiam no NutriFlow para organizar e fazer crescer seus consultórios.
          </p>
          <Button
            className="bg-[#518C5B] hover:bg-[#518C5B]/90 text-white px-8 py-6 text-lg"
            onClick={() => window.location.href = '/auth'}
          >
            Criar Conta Gratuita
          </Button>
        </div>
      </section>
    </div>
  );

  const authContent = <Navigate to="/dashboard" replace />;

  return (
    <HybridPage
      publicContent={publicContent}
      authContent={authContent}
      title="Gestão"
      description="Gestão completa do consultório de nutrição. Dashboard executivo, relatórios avançados, controle financeiro e muito mais."
    />
  );
}
