import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function LgpdPage() {
  return (
    <div className="min-h-screen bg-nf-bg py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-nf-teal hover:text-nf-teal/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-nf-teal/10 flex items-center justify-center text-nf-teal">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-nf-text">
            Conformidade LGPD
          </h1>
        </div>

        <div className="prose prose-lg text-nf-text-muted space-y-6">
          <p className="text-lg text-nf-text leading-relaxed">
            O NutriFlow foi desenvolvido desde o primeiro dia com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong> como pilar central de sua arquitetura. Entendemos que lidamos com dados sensíveis de saúde e tratamos essa responsabilidade com a máxima seriedade.
          </p>

          <div className="bg-nf-bg-alt border border-nf-border rounded-2xl p-8 my-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-nf-text">Nossos Pilares de Conformidade</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-nf-teal mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-nf-text">Privacidade desde a Concepção (Privacy by Design)</h3>
                  <p className="text-sm mt-1">A proteção de dados não é um complemento, é a base da nossa infraestrutura. Todos os dados de pacientes são criptografados em repouso (AES-256) e em trânsito (TLS 1.3).</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-nf-teal mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-nf-text">Minimização de Dados</h3>
                  <p className="text-sm mt-1">Coletamos apenas o estritamente necessário para a prestação do serviço nutricional. Não rastreamos seus pacientes para fins de publicidade externa.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-nf-teal mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-nf-text">Controle Total do Titular</h3>
                  <p className="text-sm mt-1">Ferramentas nativas para exportação e exclusão definitiva de dados de pacientes, garantindo os direitos de acesso, retificação e eliminação previstos na lei.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-nf-teal mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-nf-text">IA Ética e Transparente</h3>
                  <p className="text-sm mt-1">Nossa IA generativa opera dentro de limites éticos estritos, sem usar dados de pacientes para treinar modelos públicos externos. O profissional mantém a supervisão humana final.</p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">Papéis na LGPD</h2>
          <p>
            De acordo com a legislação, definimos claramente os papéis para garantir a segurança jurídica da sua prática:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Controlador:</strong> Você, nutricionista, que decide sobre o tratamento dos dados dos seus pacientes.</li>
            <li><strong>Operador:</strong> O NutriFlow, que realiza o tratamento técnico dos dados em seu nome, seguindo suas instruções.</li>
          </ul>

          <h2 className="font-serif text-2xl font-bold text-nf-text mt-8">Canal do Encarregado (DPO)</h2>
          <p>
            Para dúvidas, solicitações de titulares de dados ou reporte de incidentes, nosso Encarregado de Proteção de Dados está disponível através do canal exclusivo:
          </p>
          <a href="mailto:dpo@nutriflow.com.br" className="inline-block bg-nf-teal/10 text-nf-teal px-4 py-2 rounded-lg font-medium hover:bg-nf-teal/20 transition-colors">
            dpo@nutriflow.com.br
          </a>
        </div>
      </div>
    </div>
  );
}