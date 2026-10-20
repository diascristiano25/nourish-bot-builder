import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-nf-bg py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-nf-teal hover:text-nf-teal/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-nf-text mb-8">
          Política de Privacidade
        </h1>

        <div className="prose prose-lg text-nf-text-muted space-y-6">
          <p className="text-sm text-nf-text-muted/70">Última atualização: 20 de Outubro, 2026</p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">1. Introdução</h2>
          <p>
            A privacidade dos nossos usuários é de extrema importância para o NutriFlow. Esta Política de Privacidade descreve como coletamos, usamos, divulgamos e protegemos suas informações quando você usa nossa plataforma.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">2. Informações que Coletamos</h2>
          <p>
            Coletamos informações que você nos fornece diretamente, como nome, email, dados profissionais e informações de pagamento. Também coletamos dados de uso, como páginas visitadas, tempo gasto na plataforma e interações com as ferramentas de IA.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">3. Dados dos Pacientes</h2>
          <p>
            Reconhecemos a sensibilidade dos dados de saúde dos pacientes inseridos na plataforma. Estes dados são criptografados em repouso e em trânsito. O NutriFlow atua como operador de dados, e o nutricionista é o controlador, conforme definido pela LGPD.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">4. Como Usamos suas Informações</h2>
          <p>
            Usamos as informações para fornecer, manter e melhorar nossos serviços, para processar transações, para enviar notificações técnicas e atualizações, e para personalizar a experiência do usuário, incluindo as sugestões geradas por IA.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">5. Compartilhamento de Dados</h2>
          <p>
            Não vendemos seus dados pessoais. Podemos compartilhar informações com provedores de serviços terceirizados que nos auxiliam na operação da plataforma (ex: hospedagem em nuvem, processamento de pagamentos), sob estritos acordos de confidencialidade.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">6. Segurança</h2>
          <p>
            Implementamos medidas de segurança administrativas, técnicas e físicas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">7. Seus Direitos (LGPD)</h2>
          <p>
            Você tem o direito de acessar, corrigir, excluir ou portar seus dados pessoais. Para exercer esses direitos, entre em contato com nosso encarregado de proteção de dados pelo email privacidade@nutriflow.com.br.
          </p>
        </div>
      </div>
    </div>
  );
}