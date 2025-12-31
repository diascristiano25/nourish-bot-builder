import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import logoImg from '@/assets/logo.png';

export default function Termos() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl">NutriFlow</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Termos de Uso
            </h1>
            <p className="text-lg text-muted-foreground">
              Leia com atenção os termos e condições de uso da plataforma NutriFlow.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-primary/20">
                <CardContent className="p-6 text-center">
                  <Scale className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Uso Responsável</h3>
                  <p className="text-sm text-muted-foreground">
                    Utilize a plataforma de acordo com as normas do CFN.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardContent className="p-6 text-center">
                  <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Segurança</h3>
                  <p className="text-sm text-muted-foreground">
                    Seus dados estão protegidos com criptografia avançada.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardContent className="p-6 text-center">
                  <FileText className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Transparência</h3>
                  <p className="text-sm text-muted-foreground">
                    Termos claros e objetivos para sua tranquilidade.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Terms Content */}
            <Card className="mb-8">
              <CardContent className="p-8 md:p-10">
                <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
                  
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
                    <p>
                      Ao acessar e utilizar a plataforma NutriFlow, você declara ter lido, compreendido e 
                      concordado com estes Termos de Uso. Se você não concordar com algum termo, não 
                      utilize nossos serviços. O uso continuado da plataforma constitui aceitação de 
                      quaisquer alterações futuras nestes termos.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">2. Descrição do Serviço</h2>
                    <p>
                      O NutriFlow é uma plataforma SaaS (Software as a Service) desenvolvida exclusivamente 
                      para auxiliar profissionais nutricionistas na gestão de pacientes, criação de planos 
                      alimentares com auxílio de inteligência artificial, acompanhamento nutricional e 
                      comunicação com pacientes. Os serviços incluem:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Cadastro e gestão de pacientes</li>
                      <li>Geração de cardápios personalizados com IA</li>
                      <li>Monitoramento de evolução e antropometria</li>
                      <li>Portal do paciente para acompanhamento</li>
                      <li>Ferramentas de comunicação integradas</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">3. Cadastro e Conta de Usuário</h2>
                    <p>
                      Para utilizar o NutriFlow, é necessário criar uma conta fornecendo informações 
                      verdadeiras, completas e atualizadas. Você é responsável por manter a 
                      confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
                      É obrigatório possuir registro ativo no Conselho Regional de Nutricionistas (CRN) 
                      para utilizar a plataforma como profissional.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">4. Uso Adequado da Plataforma</h2>
                    <p>
                      O usuário compromete-se a utilizar o NutriFlow de forma ética e profissional, 
                      respeitando as normas do Conselho Federal de Nutricionistas (CFN) e a legislação 
                      vigente. É expressamente vedado:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Utilizar a plataforma para fins ilícitos</li>
                      <li>Compartilhar credenciais de acesso com terceiros</li>
                      <li>Tentar acessar dados de outros usuários</li>
                      <li>Realizar engenharia reversa do software</li>
                      <li>Violar direitos de propriedade intelectual</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">5. Responsabilidade Profissional</h2>
                    <p>
                      Os cardápios e sugestões gerados pela inteligência artificial são ferramentas de 
                      auxílio baseadas em dados nutricionais da Tabela TACO e outras fontes científicas. 
                      A responsabilidade pela prescrição final, adequação ao paciente, consideração de 
                      condições clínicas específicas e acompanhamento profissional é exclusiva do 
                      nutricionista habilitado. O NutriFlow não substitui o julgamento profissional.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">6. Propriedade Intelectual</h2>
                    <p>
                      Todo o conteúdo, código-fonte, design, marcas, logotipos e funcionalidades do 
                      NutriFlow são propriedade exclusiva do FlowTech Group. É proibida a reprodução, 
                      modificação, distribuição ou uso comercial sem autorização prévia por escrito.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">7. Pagamento e Assinatura</h2>
                    <p>
                      O acesso aos recursos da plataforma está sujeito ao pagamento de assinatura mensal 
                      ou anual, conforme plano escolhido. Os valores podem ser alterados mediante aviso 
                      prévio de 30 dias. O cancelamento pode ser solicitado a qualquer momento, com 
                      acesso mantido até o final do período pago.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">8. Limitação de Responsabilidade</h2>
                    <p>
                      O NutriFlow é fornecido "como está", sem garantias de qualquer tipo. Não nos 
                      responsabilizamos por danos indiretos, incidentais ou consequenciais decorrentes 
                      do uso da plataforma. Nossa responsabilidade está limitada ao valor pago pela 
                      assinatura nos últimos 12 meses.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">9. Modificações nos Termos</h2>
                    <p>
                      Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações 
                      significativas serão comunicadas por e-mail ou através da plataforma com antecedência 
                      mínima de 15 dias. O uso continuado após as alterações constitui aceitação dos novos termos.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">10. Foro e Legislação Aplicável</h2>
                    <p>
                      Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. 
                      Fica eleito o foro da Comarca de Joinville/SC para dirimir quaisquer controvérsias 
                      decorrentes destes termos.
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Última atualização: Janeiro de 2025
              </p>
              <Button asChild variant="outline">
                <Link to="/privacidade">
                  Ver Política de Privacidade
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="NutriFlow" className="w-8 h-8 object-contain" />
              <span className="font-semibold">NutriFlow</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">
                Privacidade
              </Link>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2025 NutriFlow | FlowTech Group - CNPJ: 46.684.547/0001-54. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
