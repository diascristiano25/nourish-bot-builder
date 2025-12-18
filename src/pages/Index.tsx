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
  ShieldCheck,
  Play,
  Star
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Elite Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="w-9 h-9 object-contain" />
            <span className="font-bold text-xl text-slate-800 tracking-tight">NutriFlow</span>
          </div>
          <nav className="flex items-center gap-4">
            <a 
              href="/sobre" 
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors hidden sm:inline font-medium"
            >
              Sobre
            </a>
            <a 
              href="mailto:contato@flowtechgroup.com.br" 
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors hidden sm:inline font-medium"
            >
              Contato
            </a>
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline" 
              size="sm"
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            >
              Entrar
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-slate-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-600 border-0 rounded-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Oferta de Lançamento
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-slate-800 tracking-tight">
              Crie cardápios com{' '}
              <span className="text-emerald-500">IA</span> em segundos
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              A plataforma mais moderna para nutricionistas que querem 
              economizar tempo e impressionar pacientes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto text-base px-8 py-6 bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25 font-semibold"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  document.getElementById('solucao')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto text-base px-8 py-6 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <ArrowRight className="mr-2 w-4 h-4" />
                Saiba Mais
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                60 dias grátis
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Sem cartão
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Cancele quando quiser
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-slate-200/60 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-slate-500">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-sm font-medium">Nutrição Moderna</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-sm font-medium">Tabela TACO</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Handshake className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-sm font-medium">Clínicas Parceiras</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-red-50 text-red-500 border-0 rounded-full font-medium">
              O Problema
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 tracking-tight">
              Ainda perde horas montando cardápios?
            </h2>
            <p className="text-lg text-slate-500">
              Sabemos como é frustrante gastar tempo com tarefas repetitivas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">Horas perdidas</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  1-2 horas por paciente para montar um cardápio manualmente.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">Cálculos complexos</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Tabela TACO, macros, calorias... muito trabalho manual e risco de erros.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">Menos pacientes</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Tempo gasto com burocracia é tempo que você não está atendendo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solucao" className="py-20 md:py-28 bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-emerald-50 text-emerald-500 border-0 rounded-full font-medium">
              A Solução
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 tracking-tight">
              NutriFlow: Seu assistente com IA
            </h2>
            <p className="text-lg text-slate-500">
              Automatize cardápios e foque no que importa: seus pacientes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="bg-white rounded-2xl border border-slate-200/60 hover:border-emerald-200 hover:shadow-lg transition-all group">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                  <Brain className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">IA com Tabela TACO</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Cardápios com dados nutricionais brasileiros oficiais.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-2xl border border-slate-200/60 hover:border-emerald-200 hover:shadow-lg transition-all group">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                  <Zap className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">30 Segundos</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  De 2 horas para 30 segundos. Mais tempo para atender.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-2xl border border-slate-200/60 hover:border-emerald-200 hover:shadow-lg transition-all group">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                  <FileText className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">PDF Personalizado</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Exporte com seu logo, cores e CRN. Profissionalismo total.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-2xl border border-slate-200/60 hover:border-emerald-200 hover:shadow-lg transition-all group">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                  <Users className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">Portal do Paciente</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Pacientes acessam dieta e lista de compras pelo celular.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-amber-50 text-amber-600 border-0 rounded-full font-medium">
              🔥 Membro Fundador
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 tracking-tight">
              Preço especial de lançamento
            </h2>
            <p className="text-lg text-slate-500">
              Garanta seu lugar e pague menos para sempre.
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card className="bg-white rounded-3xl border-2 border-emerald-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-center py-3 text-sm font-semibold">
                Apenas 100 vagas disponíveis
              </div>
              <CardContent className="p-8 pt-16">
                <div className="text-center mb-8">
                  <p className="text-slate-400 line-through text-lg">R$ 149,90/mês</p>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-5xl font-bold text-slate-800">R$ 69,90</span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                  <Badge className="mt-3 bg-emerald-50 text-emerald-600 border-0 rounded-full">
                    Preço fixo para sempre
                  </Badge>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    '60 dias grátis para testar',
                    'Geração ilimitada de cardápios',
                    'Gestão completa de pacientes',
                    'Portal do paciente incluso',
                    'Lista de compras automática',
                    'PDF personalizado',
                    'Suporte prioritário',
                    'Atualizações gratuitas',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-500" />
                      </div>
                      <span className="text-sm text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  size="lg" 
                  className="w-full text-base py-6 bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25 font-semibold"
                  onClick={() => navigate('/auth')}
                >
                  Quero ser Membro Fundador
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <p className="text-center text-sm text-slate-400 mt-4 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Cancele quando quiser
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Guarantee Block */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl border-0">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-emerald-700">Garantia Risco Zero</h3>
                    <p className="text-emerald-600/80">
                      Use por 60 dias. Se não amar, você não paga nada. 
                      Cancele com um clique. É a nossa garantia.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-emerald-50 text-emerald-500 border-0 rounded-full font-medium">
              <Star className="w-4 h-4 mr-1 fill-emerald-500" />
              Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 tracking-tight">
              O que dizem sobre o NutriFlow
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  "Economizei 4 horas semanais só com a Anamnese Livre. 
                  Pela primeira vez o software trabalha para mim."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">LT</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">Dra. Luiza T.</p>
                    <p className="text-xs text-slate-400">Nutricionista Clínica</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  "A prescrição com IA é incrível. A liberdade de criar minhas receitas 
                  personalizadas mudou meu jogo."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">MP</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">Dr. Marcos P.</p>
                    <p className="text-xs text-slate-400">Nutricionista Esportivo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  "Minhas pacientes adoram receber o link do portal. 
                  Dá um ar super profissional ao meu trabalho."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">CF</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">Dra. Carla F.</p>
                    <p className="text-xs text-slate-400">Nutrição Funcional</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 tracking-tight">
              Perguntas Frequentes
            </h2>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "Os cardápios são realmente baseados na Tabela TACO?",
                  answer: "Sim! A IA foi treinada com dados da Tabela Brasileira de Composição de Alimentos (TACO), garantindo precisão nutricional nos cardápios gerados."
                },
                {
                  question: "Posso personalizar os cardápios depois de gerados?",
                  answer: "Absolutamente! Você pode editar qualquer parte do cardápio, adicionar alimentos da sua biblioteca pessoal e salvar as alterações."
                },
                {
                  question: "Como funciona o Portal do Paciente?",
                  answer: "Cada paciente recebe um link único para acessar sua dieta e lista de compras. Tudo com sua marca e identidade visual."
                },
                {
                  question: "Posso cancelar a qualquer momento?",
                  answer: "Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento, sem multas ou burocracia."
                },
                {
                  question: "Meus dados estão seguros?",
                  answer: "Utilizamos criptografia de ponta e servidores seguros. Seus dados e dos seus pacientes estão protegidos."
                }
              ].map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-slate-50 rounded-2xl border-0 px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-slate-800 hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-emerald-500 to-emerald-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">
              Pronto para transformar seu consultório?
            </h2>
            <p className="text-lg text-emerald-100 mb-8">
              Junte-se a centenas de nutricionistas que já economizam horas por semana.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-base px-8 py-6 bg-white hover:bg-slate-50 text-emerald-600 rounded-2xl shadow-lg font-semibold"
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <img src={logoImg} alt="NutriFlow" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-bold text-lg text-white">NutriFlow</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="/privacidade" className="hover:text-white transition-colors">Privacidade</a>
              <a href="/sobre" className="hover:text-white transition-colors">Sobre</a>
              <a href="mailto:contato@flowtechgroup.com.br" className="hover:text-white transition-colors">Contato</a>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} FlowTech Group
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
