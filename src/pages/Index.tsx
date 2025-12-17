import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Users, 
  Sparkles, 
  FileText, 
  Loader2,
  Check,
  Clock,
  Zap,
  Brain,
  Shield,
  BookOpen,
  Stethoscope,
  Handshake,
  Quote,
  ShieldCheck
} from 'lucide-react';
import logoImg from '@/assets/logo.png';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Marketing Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl">NutriFlow</span>
          </div>
          <nav className="flex items-center gap-6">
            <a 
              href="/sobre" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
            >
              Sobre Nós
            </a>
            <a 
              href="mailto:contato@flowtechgroup.com.br" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
            >
              Contato
            </a>
            <Button onClick={() => navigate('/auth')} variant="outline" size="sm">
              Login
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Oferta Exclusiva de Lançamento
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Crie cardápios personalizados em{' '}
              <span className="text-primary">segundos</span> com IA
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A plataforma completa para nutricionistas que querem economizar tempo, 
              impressionar pacientes e escalar seu consultório.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90"
              >
                Quero ser Membro Fundador
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              60 dias grátis + preço fixo de R$ 69,90/mês para sempre
            </p>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm">Feito com apoio da Nutrição Moderna</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm">Baseado na Tabela TACO</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Handshake className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm">Desenvolvido com Clínicas Parceiras</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Você ainda perde horas montando cardápios?
            </h2>
            <p className="text-lg text-muted-foreground">
              Sabemos como é frustrante gastar tempo em tarefas repetitivas 
              quando você poderia estar atendendo mais pacientes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Horas perdidas</h3>
                <p className="text-muted-foreground text-sm">
                  Montar um cardápio manualmente pode levar 1-2 horas por paciente.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Cálculos complexos</h3>
                <p className="text-muted-foreground text-sm">
                  Tabela TACO, macros, calorias... muito trabalho manual e risco de erros.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Menos pacientes</h3>
                <p className="text-muted-foreground text-sm">
                  Tempo gasto com burocracia é tempo que você não está atendendo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="sobre" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-0">
              A Solução
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              NutriFlow: Seu assistente com IA
            </h2>
            <p className="text-lg text-muted-foreground">
              Automatize a criação de cardápios e foque no que realmente importa: 
              seus pacientes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">IA com Tabela TACO</h3>
                <p className="text-muted-foreground text-sm">
                  Cardápios gerados com dados nutricionais brasileiros oficiais.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Geração em Segundos</h3>
                <p className="text-muted-foreground text-sm">
                  De 2 horas para 30 segundos. Mais tempo para atender pacientes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">PDF Personalizado</h3>
                <p className="text-muted-foreground text-sm">
                  Exporte com seu logo, cores e CRN. Profissionalismo total.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Portal do Paciente</h3>
                <p className="text-muted-foreground text-sm">
                  Pacientes acessam dieta e lista de compras pelo celular.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-amber-500/10 text-amber-600 border-0">
              🔥 Oferta de Membro Fundador
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Preço especial de lançamento
            </h2>
            <p className="text-lg text-muted-foreground">
              Garanta seu lugar entre os primeiros e pague menos para sempre.
            </p>
          </div>
          
          <div className="max-w-lg mx-auto">
            <Card className="border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                Apenas para os primeiros 100 nutricionistas
              </div>
              <CardContent className="p-8 pt-14">
                <div className="text-center mb-6">
                  <p className="text-muted-foreground line-through text-lg">R$ 149,90/mês</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">R$ 69,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <Badge className="mt-2 bg-primary/10 text-primary border-0">
                    Preço fixo para sempre
                  </Badge>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    '60 dias grátis para testar',
                    'Geração ilimitada de cardápios com IA',
                    'Gestão completa de pacientes',
                    'Portal do paciente incluso',
                    'Lista de compras automática',
                    'Exportação em PDF personalizado',
                    'Suporte prioritário por WhatsApp',
                    'Atualizações gratuitas para sempre',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  size="lg" 
                  className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/auth')}
                >
                  Quero ser Membro Fundador
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Cancele quando quiser. Sem multas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Guarantee Block */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-primary/30 bg-background">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-primary">RISCO ZERO</h3>
                    <p className="text-muted-foreground">
                      Use por 60 dias. Se não economizar tempo ou se não amar a ferramenta, 
                      você não paga nada. Cancele com um clique. É a nossa garantia de que a liberdade funciona.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-0">
              Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que estão dizendo sobre a revolução do NutriFlow?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-muted-foreground mb-6">
                  "Economizei 4 horas semanais só com a Anamnese Livre. 
                  Pela primeira vez sinto que o software trabalha para mim."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">LT</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Dra. Luiza T.</p>
                    <p className="text-xs text-muted-foreground">Nutricionista Clínica</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-muted-foreground mb-6">
                  "A prescrição com IA é incrível, mas a liberdade de criar minhas receitas 
                  personalizadas mudou meu jogo. É o software mais adaptável que já vi."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">MP</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Dr. Marcos P.</p>
                    <p className="text-xs text-muted-foreground">Nutricionista Esportivo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-muted-foreground mb-6">
                  "Meus pacientes adoram receber o cardápio pelo celular. 
                  A lista de compras automática foi o diferencial que fidelizou minha clientela."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">AC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Dra. Ana C.</p>
                    <p className="text-xs text-muted-foreground">Nutricionista Funcional</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Tire suas dúvidas sobre o NutriFlow
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  Como funciona a geração de cardápios com IA?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Nossa IA utiliza a Tabela TACO (Tabela Brasileira de Composição de Alimentos) 
                  como referência nutricional. Você cadastra os dados do paciente (peso, altura, 
                  objetivo, restrições) e em segundos recebe um cardápio completo e personalizado, 
                  pronto para editar e entregar.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Posso editar os cardápios gerados pela IA?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Todos os cardápios são 100% editáveis. A IA gera uma base completa que você 
                  pode ajustar conforme necessário: trocar alimentos, modificar porções, adicionar 
                  observações. Você tem total controle.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  O que acontece após os 60 dias grátis?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Após o período de teste, você será cobrado R$ 69,90/mês (preço de Membro Fundador). 
                  Se não quiser continuar, basta cancelar antes do fim do período. Não há multas ou 
                  taxas de cancelamento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Meus pacientes terão acesso ao sistema?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Cada paciente pode acessar seu próprio portal pelo celular, onde visualiza 
                  sua dieta atual e lista de compras. Você pode compartilhar o link por WhatsApp 
                  diretamente do sistema.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Posso usar meu próprio logo nos documentos?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Você pode personalizar seus documentos com seu logo, cores e CRN. 
                  Todos os PDFs exportados terão a identidade visual do seu consultório, 
                  transmitindo profissionalismo aos seus pacientes.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  O preço de R$ 69,90 vai aumentar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Para Membros Fundadores, não! Este é um preço especial de lançamento que será 
                  mantido enquanto você for assinante. Novos usuários que entrarem depois pagarão 
                  o preço normal de R$ 149,90/mês.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para economizar horas toda semana?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Junte-se aos nutricionistas que estão revolucionando seu atendimento com IA.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
              onClick={() => navigate('/auth')}
            >
              Quero ser Membro Fundador (Garantir 60 dias Grátis)
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Top Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="NutriFlow" className="w-10 h-10 object-contain" />
                <div>
                  <span className="font-bold text-lg block">NutriFlow</span>
                  <span className="text-xs text-muted-foreground">by FlowTech Group</span>
                </div>
              </div>
              
              {/* Links */}
              <nav className="flex flex-wrap items-center gap-6">
                <a 
                  href="/sobre"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sobre Nós
                </a>
                <a 
                  href="/privacidade"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacidade
                </a>
                <a 
                  href="/privacidade"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Termos de Uso
                </a>
                <a 
                  href="mailto:contato@flowtechgroup.com.br"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contato
                </a>
              </nav>
            </div>
            
            {/* Divider */}
            <div className="border-t border-border pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center md:text-left">
                  © 2025 NutriFlow | FlowTech Group - CNPJ: 46.684.547/0001-54. Todos os direitos reservados.
                </p>
                <a 
                  href="mailto:contato@flowtechgroup.com.br"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  contato@flowtechgroup.com.br
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
