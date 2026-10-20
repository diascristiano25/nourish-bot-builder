import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-nf-bg py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-nf-teal hover:text-nf-teal/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl font-bold text-nf-text mb-8">
          Termos de Uso
        </h1>

        <div className="prose prose-lg text-nf-text-muted space-y-6">
          <p className="text-sm text-nf-text-muted/70">Última atualização: 20 de Outubro, 2026</p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar o NutriFlow, você aceita e concorda em estar vinculado aos termos e disposições deste acordo. Se você não concorda com estes termos, por favor, não use o serviço.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">2. Descrição do Serviço</h2>
          <p>
            O NutriFlow é uma plataforma de software como serviço (SaaS) destinada a nutricionistas, oferecendo ferramentas de gestão clínica, geração de cardápios assistida por IA e acompanhamento de pacientes.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">3. Uso da Inteligência Artificial</h2>
          <p>
            As funcionalidades de IA do NutriFlow são ferramentas de apoio à decisão clínica. Elas não substituem o julgamento profissional do nutricionista. O usuário é o único responsável pela validação final de qualquer plano alimentar gerado pela plataforma antes de ser entregue ao paciente.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">4. Responsabilidades do Usuário</h2>
          <p>
            Você concorda em usar o NutriFlow apenas para fins lícitos e de acordo com estes Termos. Você é responsável por manter a confidencialidade de sua conta e senha e por todas as atividades que ocorram sob sua conta.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">5. Propriedade Intelectual</h2>
          <p>
            O serviço e seu conteúdo original, recursos e funcionalidades são e continuarão sendo propriedade exclusiva do NutriFlow e seus licenciadores. O serviço é protegido por direitos autorais, marcas registradas e outras leis.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">6. Rescisão</h2>
          <p>
            Podemos rescindir ou suspender sua conta imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos. Após a rescisão, seu direito de usar o serviço cessará imediatamente.
          </p>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">7. Contato</h2>
          <p>
            Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco pelo email contato@nutriflow.com.br.
          </p>
        </div>
      </div>
    </div>
  );
}