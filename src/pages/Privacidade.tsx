import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, FileText, Eye, Database, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import logoImg from '@/assets/logo.png';

export default function Privacidade() {
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
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Política de Privacidade e Termos de Uso
            </h1>
            <p className="text-lg text-muted-foreground">
              Seu compromisso com a segurança dos dados de saúde é o nosso também.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* LGPD Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-primary/20">
                <CardContent className="p-6 text-center">
                  <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Dados Criptografados</h3>
                  <p className="text-sm text-muted-foreground">
                    Todas as informações são protegidas com criptografia de ponta a ponta.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardContent className="p-6 text-center">
                  <UserCheck className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Você no Controle</h3>
                  <p className="text-sm text-muted-foreground">
                    O Nutricionista é o controlador dos dados de seus pacientes.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardContent className="p-6 text-center">
                  <Database className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Conformidade LGPD</h3>
                  <p className="text-sm text-muted-foreground">
                    100% em conformidade com a Lei Geral de Proteção de Dados.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Terms Content */}
            <Card className="mb-8">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Termos de Uso</h2>
                </div>
                
                <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                  <p>
                    Ao utilizar o NutriFlow, você concorda com os seguintes termos e condições:
                  </p>
                  
                  <h3 className="text-foreground font-semibold mt-6">1. Aceitação dos Termos</h3>
                  <p>
                    Ao acessar e utilizar a plataforma NutriFlow, você declara ter lido, compreendido e 
                    concordado com estes Termos de Uso. Se você não concordar com algum termo, não 
                    utilize nossos serviços.
                  </p>
                  
                  <h3 className="text-foreground font-semibold mt-6">2. Descrição do Serviço</h3>
                  <p>
                    O NutriFlow é uma plataforma SaaS (Software as a Service) desenvolvida para auxiliar 
                    nutricionistas na gestão de pacientes, criação de planos alimentares com inteligência 
                    artificial e acompanhamento nutricional.
                  </p>
                  
                  <h3 className="text-foreground font-semibold mt-6">3. Uso Adequado</h3>
                  <p>
                    O usuário compromete-se a utilizar o NutriFlow de forma ética e profissional, respeitando 
                    as normas do Conselho Federal de Nutricionistas (CFN) e a legislação vigente. É vedado 
                    o uso da plataforma para fins ilícitos ou que violem direitos de terceiros.
                  </p>
                  
                  <h3 className="text-foreground font-semibold mt-6">4. Responsabilidade Profissional</h3>
                  <p>
                    Os cardápios gerados pela inteligência artificial são sugestões baseadas em dados 
                    nutricionais da Tabela TACO. A responsabilidade pela prescrição final e adequação 
                    ao paciente é exclusiva do profissional nutricionista habilitado.
                  </p>
                  
                  <h3 className="text-foreground font-semibold mt-6">5. Propriedade Intelectual</h3>
                  <p>
                    Todo o conteúdo, código-fonte, design e funcionalidades do NutriFlow são propriedade 
                    do FlowTech Group. É proibida a reprodução, modificação ou distribuição sem autorização.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Policy */}
            <Card className="mb-8">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Política de Privacidade (LGPD)</h2>
                </div>
                
                <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                  <p>
                    Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas 
                    informações pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                  </p>
                  
                  <h3 className="text-foreground font-semibold mt-6">1. Controlador de Dados</h3>
                  <p>
                    <strong>Para dados de pacientes:</strong> O Nutricionista cadastrado na plataforma é o 
                    Controlador dos dados de seus pacientes, sendo responsável por obter consentimento, 
                    definir finalidades de tratamento e garantir os direitos dos titulares.
                  </p>
                  <p>
                    <strong>Para dados de Nutricionistas:</strong> O FlowTech Group (CNPJ: 46.684.547/0001-54) 
                    atua como Controlador, responsável pelo tratamento seguro e adequado dos dados.
                  </p>
                  
                  <h3 className="text-foreground font-semibold mt-6">2. Dados Coletados</h3>
                  <p>Coletamos os seguintes tipos de dados:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Dados cadastrais (nome, e-mail, telefone, CRN)</li>
                    <li>Dados de pacientes (inseridos pelo nutricionista)</li>
                    <li>Dados de saúde e antropométricos</li>
                    <li>Dados de uso da plataforma</li>
                  </ul>
                  
                  <h3 className="text-foreground font-semibold mt-6">3. Finalidade do Tratamento</h3>
                  <p>Os dados são utilizados para:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Prestação dos serviços contratados</li>
                    <li>Geração de planos alimentares personalizados</li>
                    <li>Comunicação sobre atualizações e suporte</li>
                    <li>Melhoria contínua da plataforma</li>
                  </ul>
                  
                  <h3 className="text-foreground font-semibold mt-6">4. Segurança dos Dados de Saúde</h3>
                  <p>
                    Reconhecemos a sensibilidade dos dados de saúde. Por isso, implementamos medidas 
                    rigorosas de segurança, incluindo:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Criptografia de dados em trânsito e em repouso</li>
                    <li>Controle de acesso baseado em funções (RBAC)</li>
                    <li>Autenticação segura com tokens JWT</li>
                    <li>Políticas de segurança em nível de linha (RLS)</li>
                    <li>Backups regulares e redundância de dados</li>
                  </ul>
                  
                  <h3 className="text-foreground font-semibold mt-6">5. Direitos do Titular</h3>
                  <p>
                    Conforme a LGPD, você tem direito a: acesso, correção, exclusão, portabilidade, 
                    revogação de consentimento e informação sobre compartilhamento de dados.
                  </p>
                  
                  <h3 className="text-foreground font-semibold mt-6">6. Retenção de Dados</h3>
                  <p>
                    Os dados são retidos pelo tempo necessário para cumprimento das finalidades ou 
                    conforme exigido por lei. Após esse período, são anonimizados ou excluídos.
                  </p>
                  
                  <h3 className="text-foreground font-semibold mt-6">7. Contato</h3>
                  <p>
                    Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato 
                    através do e-mail: <a href="mailto:privacidade@flowtechgroup.com.br" className="text-primary hover:underline">privacidade@flowtechgroup.com.br</a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center">
              Última atualização: Janeiro de 2025
            </p>
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
            <p className="text-sm text-muted-foreground text-center">
              © 2025 NutriFlow | FlowTech Group - CNPJ: 46.684.547/0001-54. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
