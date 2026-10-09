import { Link } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, CreditCard, Shield, Ban } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function Termos() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/auth" className="text-orange-400 hover:text-orange-300 font-medium">
                Login
              </Link>
              <Link
                to="/auth"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Termos de Uso</h1>
          </div>
          <p className="text-xl text-emerald-50">
            Última atualização: Janeiro de 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-8">

          {/* Introduction */}
          <section>
            <p className="text-slate-700 leading-relaxed">
              Bem-vindo ao NutriFlow. Ao acessar e usar nossa plataforma, você concorda com estes Termos de Uso.
              Leia atentamente antes de criar sua conta e utilizar nossos serviços.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  1. Descrição do Serviço
                </h2>
                <p className="text-slate-700 mb-3">
                  O NutriFlow é uma plataforma SaaS para gestão de consultórios de nutrição, oferecendo:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Gestão de pacientes e agendamentos</li>
                  <li>Criação de cardápios personalizados</li>
                  <li>Geração automática de prescrições nutricionais</li>
                  <li>Portal do paciente para acompanhamento</li>
                  <li>Controle financeiro e relatórios</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              2. Elegibilidade
            </h2>
            <p className="text-slate-700 mb-3">
              Para usar o NutriFlow você deve:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Ser nutricionista registrado no CRN (Conselho Regional de Nutricionistas)</li>
              <li>Ter capacidade legal para celebrar contratos</li>
              <li>Fornecer informações verdadeiras e atualizadas</li>
              <li>Cumprir com todas as leis e regulamentos aplicáveis</li>
            </ul>
          </section>

          {/* User Account */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              3. Conta de Usuário
            </h2>
            <div className="space-y-4 text-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">3.1 Responsabilidades</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Manter a confidencialidade de suas credenciais</li>
                  <li>Notificar imediatamente sobre uso não autorizado</li>
                  <li>Ser responsável por todas as atividades em sua conta</li>
                  <li>Manter seus dados cadastrais atualizados</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">3.2 Uso Proibido</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Compartilhar sua conta com terceiros</li>
                  <li>Criar múltiplas contas para o mesmo usuário</li>
                  <li>Usar a plataforma para fins ilegais ou não autorizados</li>
                  <li>Tentar acessar dados de outros usuários</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pricing and Payment */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <CreditCard className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  4. Preços e Pagamento
                </h2>
                <div className="space-y-4 text-slate-700">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">4.1 Planos</h3>
                    <p>Oferecemos diferentes planos de assinatura mensal ou anual. Os preços estão disponíveis em nossa página principal.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">4.2 Cobrança</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Pagamentos são processados automaticamente no início de cada período</li>
                      <li>Aceitamos cartão de crédito e PIX</li>
                      <li>Você receberá uma nota fiscal por e-mail</li>
                      <li>Preços podem ser alterados com aviso prévio de 30 dias</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">4.3 Cancelamento e Reembolso</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Você pode cancelar a qualquer momento</li>
                      <li>O acesso permanece até o fim do período pago</li>
                      <li>Não oferecemos reembolso proporcional</li>
                      <li>Período de teste gratuito: 14 dias (sem cobrança)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Professional Responsibilities */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <Shield className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  5. Responsabilidades Profissionais
                </h2>
                <p className="text-slate-700 mb-3">
                  Como nutricionista, você é totalmente responsável por:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Avaliação e conduta nutricional dos pacientes</li>
                  <li>Prescrições e orientações fornecidas</li>
                  <li>Cumprimento das normas do CFN e legislação vigente</li>
                  <li>Sigilo profissional e ética</li>
                  <li>Atualização e veracidade dos dados de pacientes</li>
                </ul>
                <p className="text-slate-700 mt-4 font-medium">
                  O NutriFlow é uma ferramenta de gestão e não substitui o julgamento profissional do nutricionista.
                </p>
              </div>
            </div>
          </section>

          {/* Data and Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              6. Dados e Privacidade
            </h2>
            <p className="text-slate-700 mb-3">
              O tratamento de dados pessoais é regido por nossa{' '}
              <Link to="/suporte/privacidade" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Política de Privacidade
              </Link>
              . Você é responsável por:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Obter consentimento adequado dos pacientes</li>
              <li>Informar os pacientes sobre o uso da plataforma</li>
              <li>Garantir a veracidade dos dados inseridos</li>
              <li>Cumprir com a LGPD e demais regulamentações</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              7. Propriedade Intelectual
            </h2>
            <div className="space-y-4 text-slate-700">
              <p>
                Todo o conteúdo da plataforma (código, design, textos, logos) é propriedade do NutriFlow
                e protegido por leis de propriedade intelectual.
              </p>
              <p>
                Seus dados de pacientes, prescrições e conteúdos criados permanecem de sua propriedade.
                Você nos concede licença para processar e armazenar esses dados conforme necessário para
                prestar os serviços.
              </p>
            </div>
          </section>

          {/* Limitations */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  8. Limitações e Garantias
                </h2>
                <div className="space-y-4 text-slate-700">
                  <p>
                    O serviço é fornecido "como está". Embora nos esforcemos para manter alta disponibilidade
                    e segurança, não garantimos que o serviço será ininterrupto ou livre de erros.
                  </p>
                  <p className="font-medium">
                    Não nos responsabilizamos por:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Decisões clínicas tomadas usando a plataforma</li>
                    <li>Perda de dados por uso inadequado</li>
                    <li>Incompatibilidade com outros sistemas</li>
                    <li>Lucros cessantes ou danos indiretos</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <Ban className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  9. Suspensão e Encerramento
                </h2>
                <p className="text-slate-700 mb-3">
                  Podemos suspender ou encerrar sua conta em caso de:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Violação destes Termos de Uso</li>
                  <li>Inadimplência no pagamento</li>
                  <li>Uso fraudulento ou ilegal</li>
                  <li>Risco à segurança da plataforma</li>
                </ul>
                <p className="text-slate-700 mt-4">
                  Você pode exportar seus dados antes do encerramento definitivo (30 dias após suspensão).
                </p>
              </div>
            </div>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              10. Alterações nos Termos
            </h2>
            <p className="text-slate-700">
              Podemos atualizar estes Termos periodicamente. Mudanças significativas serão notificadas por
              e-mail com 30 dias de antecedência. O uso continuado da plataforma após as mudanças constitui
              aceitação dos novos termos.
            </p>
          </section>

          {/* Applicable Law */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              11. Lei Aplicável
            </h2>
            <p className="text-slate-700">
              Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de São Paulo, SP,
              para dirimir qualquer controvérsia.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Contato
            </h2>
            <p className="text-slate-700 mb-2">
              Dúvidas sobre estes Termos:
            </p>
            <p className="text-slate-700">
              <strong>E-mail:</strong>{' '}
              <a href="mailto:contato@nutriflow.com.br" className="text-emerald-600 hover:text-emerald-700">
                contato@nutriflow.com.br
              </a>
            </p>
            <p className="text-slate-700">
              <strong>WhatsApp:</strong>{' '}
              <a href="https://wa.me/5513978113923" className="text-emerald-600 hover:text-emerald-700">
                (13) 97811-3923
              </a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/suporte/privacidade" className="hover:text-white transition-colors">
                Privacidade
              </Link>
              <Link to="/suporte/termos" className="hover:text-white transition-colors">
                Termos
              </Link>
              <Link to="/suporte/contato" className="hover:text-white transition-colors">
                Suporte
              </Link>
            </div>
            <p className="text-sm">© 2026 NutriFlow. CNPJ 00.000.000/0001-00</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
