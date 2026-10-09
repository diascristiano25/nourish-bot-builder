import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Users, FileText } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function Privacidade() {
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
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Política de Privacidade</h1>
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
              O NutriFlow está comprometido com a proteção da privacidade e segurança dos dados pessoais
              de seus usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos
              e protegemos suas informações em conformidade com a Lei Geral de Proteção de Dados (LGPD -
              Lei nº 13.709/2018).
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <Database className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  1. Dados Coletados
                </h2>
                <div className="space-y-4 text-slate-700">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">1.1 Dados de Profissionais</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Nome completo, CPF, CRN</li>
                      <li>E-mail e telefone</li>
                      <li>Dados de pagamento (processados por terceiros)</li>
                      <li>Informações de uso da plataforma</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">1.2 Dados de Pacientes</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Dados cadastrais e de contato</li>
                      <li>Informações de saúde e nutricionais</li>
                      <li>Histórico de consultas e prescrições</li>
                      <li>Medidas antropométricas e evolução</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Usage */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <Eye className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  2. Como Usamos os Dados
                </h2>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Prestação e melhoria dos serviços da plataforma</li>
                  <li>Comunicação sobre atualizações e suporte</li>
                  <li>Processamento de pagamentos e cobranças</li>
                  <li>Cumprimento de obrigações legais</li>
                  <li>Análises estatísticas e melhorias (dados anonimizados)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <Users className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  3. Compartilhamento de Dados
                </h2>
                <p className="text-slate-700 mb-3">
                  Seus dados não serão vendidos ou compartilhados com terceiros, exceto nas seguintes situações:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Prestadores de serviço essenciais (hospedagem, pagamento)</li>
                  <li>Quando exigido por lei ou ordem judicial</li>
                  <li>Com seu consentimento expresso</li>
                  <li>Para proteção dos direitos e segurança da plataforma</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <Lock className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  4. Segurança dos Dados
                </h2>
                <p className="text-slate-700 mb-3">
                  Implementamos medidas técnicas e organizacionais para proteger seus dados:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Criptografia SSL/TLS para transmissão de dados</li>
                  <li>Armazenamento em servidores seguros</li>
                  <li>Controle de acesso restrito</li>
                  <li>Backups regulares</li>
                  <li>Monitoramento de segurança contínuo</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Rights */}
          <section>
            <div className="flex items-start space-x-3 mb-4">
              <FileText className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  5. Seus Direitos (LGPD)
                </h2>
                <p className="text-slate-700 mb-3">
                  Você tem direito a:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Confirmar a existência de tratamento dos seus dados</li>
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li>Solicitar anonimização, bloqueio ou eliminação</li>
                  <li>Revogar o consentimento</li>
                  <li>Obter informações sobre compartilhamento</li>
                  <li>Portabilidade dos dados</li>
                </ul>
                <p className="text-slate-700 mt-4">
                  Para exercer seus direitos, entre em contato através do e-mail:{' '}
                  <a href="mailto:privacidade@nutriflow.com.br" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    privacidade@nutriflow.com.br
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              6. Cookies e Tecnologias Similares
            </h2>
            <p className="text-slate-700">
              Utilizamos cookies essenciais para o funcionamento da plataforma, como autenticação
              e preferências de usuário. Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              7. Retenção de Dados
            </h2>
            <p className="text-slate-700">
              Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política
              ou conforme exigido por lei. Dados de saúde de pacientes são mantidos por no mínimo 20 anos,
              conforme exigências do Conselho Federal de Nutrição.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              8. Alterações nesta Política
            </h2>
            <p className="text-slate-700">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças
              significativas por e-mail ou através de avisos na plataforma.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Contato
            </h2>
            <p className="text-slate-700 mb-2">
              Para questões sobre privacidade e proteção de dados:
            </p>
            <p className="text-slate-700">
              <strong>E-mail:</strong>{' '}
              <a href="mailto:privacidade@nutriflow.com.br" className="text-emerald-600 hover:text-emerald-700">
                privacidade@nutriflow.com.br
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
