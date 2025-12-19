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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white">
      {/* Elite Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="w-9 h-9 object-contain" />
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">NutriFlow</span>
          </div>
          <nav className="flex items-center gap-4">
            <a 
              href="/sobre" 
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:inline font-medium"
            >
              Sobre
            </a>
            <a 
              href="https://wa.me/5547992381906?text=Olá! Tenho uma dúvida sobre o NutriFlow antes de me cadastrar."
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:inline font-medium"
            >
              Contato
            </a>
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline" 
              size="sm"
              className="rounded-full border-slate-300 text-slate-700 hover:bg-slate-100 font-medium px-5"
            >
              Entrar
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section - Apple Style */}
      <section className="relative overflow-hidden min-h-[80vh] md:min-h-[90vh] flex items-center">
        {/* Gradient Orbs Background - smaller on mobile */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] orb-mint rounded-full blur-3xl opacity-60" />
          <div className="absolute top-1/3 right-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] orb-blue rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] orb-purple rounded-full blur-3xl opacity-30" />
        </div>

        {/* Glassmorphism shapes */}
        <div className="absolute top-20 right-10 w-32 h-32 glass rounded-3xl rotate-12 hidden lg:block" />
        <div className="absolute bottom-32 left-10 w-24 h-24 glass rounded-2xl -rotate-12 hidden lg:block" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 glass rounded-xl rotate-45 hidden lg:block" />
        
        <div className="container mx-auto px-4 py-8 md:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-6 px-5 py-2.5 text-sm font-semibold bg-white/80 backdrop-blur text-emerald-600 border border-emerald-200/50 rounded-full shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Software Premium para Nutricionistas
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-4 md:mb-6 leading-[1.15] text-slate-900 tracking-tight">
                Cardápios com{' '}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Inteligência
                </span>
                {' '}Artificial
              </h1>
              
              <p className="text-base md:text-lg lg:text-xl text-slate-600 mb-6 md:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed px-2 md:px-0">
                A plataforma mais avançada do mercado para criar 
                cardápios personalizados em segundos. Economize tempo. Impressione pacientes.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto text-base px-10 py-7 bg-emerald-500 hover:bg-emerald-600 rounded-full font-bold btn-glow animate-glow-pulse"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost"
                  onClick={() => {
                    document.getElementById('solucao')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto text-base px-8 py-7 rounded-full text-slate-700 hover:bg-white/50 font-medium"
                >
                  <Play className="mr-2 w-5 h-5 fill-slate-700" />
                  Ver Como Funciona
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  60 dias grátis
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  Sem cartão
                </span>
              </div>
            </div>

            {/* Right - MacBook Mockup - hidden on small screens */}
            <div className="perspective-1000 hidden sm:flex justify-center lg:justify-end">
              <div className="preserve-3d animate-float">
                <div className="macbook-frame w-[320px] sm:w-[400px] md:w-[500px] lg:w-[600px] max-w-full">
                  <div className="macbook-screen aspect-[16/10] relative">
                    {/* Fake Dashboard UI */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 p-4">
                      {/* Top bar */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <img src={logoImg} alt="" className="w-4 h-4 opacity-80" />
                          </div>
                          <span className="text-[10px] text-white/60 font-medium">NutriFlow</span>
                        </div>
                      </div>
                      {/* Dashboard content */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 bg-white/5 rounded-lg p-3">
                          <div className="text-[8px] text-white/40 mb-2">Cardápio do Dia</div>
                          <div className="space-y-1.5">
                            <div className="h-2 bg-emerald-500/30 rounded-full w-4/5" />
                            <div className="h-2 bg-white/10 rounded-full w-3/5" />
                            <div className="h-2 bg-white/10 rounded-full w-4/5" />
                            <div className="h-2 bg-white/10 rounded-full w-2/5" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-emerald-500/20 rounded-lg p-2">
                            <div className="text-[8px] text-emerald-400 mb-1">Pacientes</div>
                            <div className="text-sm text-white font-bold">128</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-[8px] text-white/40 mb-1">Cardápios</div>
                            <div className="text-sm text-white font-bold">342</div>
                          </div>
                        </div>
                      </div>
                      {/* Chart area */}
                      <div className="mt-3 bg-white/5 rounded-lg p-3">
                        <div className="flex items-end gap-1 h-12">
                          {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-gradient-to-t from-emerald-500/60 to-emerald-400/40 rounded-t"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="macbook-notch" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-6 md:py-8 border-y border-slate-200/60 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-16">
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

      {/* Problem Section - Bento Grid */}
      <section className="py-16 md:py-32 bg-[#fafafa]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
            <Badge className="mb-4 md:mb-6 px-4 md:px-5 py-2 bg-red-500/10 text-red-500 border-0 rounded-full font-semibold text-sm">
              O Problema
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 text-slate-900 tracking-tight leading-tight">
              Ainda perde horas
              <br />
              montando cardápios?
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Sabemos como é frustrante gastar tempo com tarefas repetitivas.
            </p>
          </div>
          
          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {/* Large Card */}
            <Card className="md:col-span-2 bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl border-0 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
              <CardContent className="p-8 md:p-10 h-full flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center mb-6 shadow-lg shadow-red-200/50">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-3 text-slate-900">Horas perdidas toda semana</h3>
                <p className="text-slate-600 text-base leading-relaxed flex-1">
                  Nutricionistas gastam em média 1-2 horas por paciente para montar um cardápio manualmente. 
                  Tempo precioso que poderia ser investido em atendimentos.
                </p>
                <div className="mt-6 flex items-center gap-3 text-red-500 font-semibold">
                  <span className="text-3xl">~8h</span>
                  <span className="text-sm text-slate-500">perdidas por semana</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Small Card 1 */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-0 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
              <CardContent className="p-8 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-5 shadow-lg shadow-purple-200/50">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-slate-900">Cálculos complexos</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Tabela TACO, macros, calorias... muito trabalho manual e alto risco de erros.
                </p>
              </CardContent>
            </Card>
            
            {/* Small Card 2 */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border-0 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
              <CardContent className="p-8 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mb-5 shadow-lg shadow-blue-200/50">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-slate-900">Menos pacientes</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Tempo gasto com burocracia é tempo que você não está atendendo e faturando.
                </p>
              </CardContent>
            </Card>
            
            {/* Wide Card */}
            <Card className="md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl border-0 shadow-sm overflow-hidden">
              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2 text-white">Resultado?</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Burnout, menos clientes, menos receita. É hora de mudar isso.
                  </p>
                </div>
                <div className="text-6xl">😩</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section - Bento Grid */}
      <section id="solucao" className="py-16 md:py-32 bg-white scroll-mt-20 relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute top-0 right-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-teal-50 rounded-full blur-3xl opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
            <Badge className="mb-4 md:mb-6 px-4 md:px-5 py-2 bg-emerald-500/10 text-emerald-600 border-0 rounded-full font-semibold text-sm">
              A Solução
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 text-slate-900 tracking-tight leading-tight">
              NutriFlow: Seu assistente
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                com Inteligência Artificial
              </span>
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Automatize cardápios e foque no que importa: seus pacientes.
            </p>
          </div>
          
          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {/* Hero Feature Card */}
            <Card className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl border-0 shadow-xl overflow-hidden group">
              <CardContent className="p-8 md:p-10 h-full flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-6">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-2xl md:text-3xl mb-4 text-white">IA com Tabela TACO</h3>
                <p className="text-emerald-100 text-base leading-relaxed flex-1">
                  Nossa inteligência artificial foi treinada com a Tabela Brasileira de Composição de Alimentos (TACO), 
                  garantindo precisão nutricional em cada cardápio gerado.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white/30 border-2 border-emerald-500 flex items-center justify-center text-xs text-white font-bold">
                        {['🥗', '🍎', '🥩', '🥦'][i]}
                      </div>
                    ))}
                  </div>
                  <span className="text-emerald-100 text-sm">+1000 alimentos</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Speed Card */}
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl border-0 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
              <CardContent className="p-6 md:p-8 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center mb-4 shadow-lg shadow-amber-200/50">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">30 Segundos</h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  De 2 horas para meio minuto.
                </p>
                <div className="mt-4 text-3xl font-extrabold text-amber-500">⚡</div>
              </CardContent>
            </Card>
            
            {/* PDF Card */}
            <Card className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl border-0 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
              <CardContent className="p-6 md:p-8 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center mb-4 shadow-lg shadow-rose-200/50">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">PDF Personalizado</h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  Seu logo, cores e CRN.
                </p>
                <div className="mt-4 text-3xl">📄</div>
              </CardContent>
            </Card>
            
            {/* Portal Card */}
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl border-0 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
              <CardContent className="p-6 md:p-8 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center mb-4 shadow-lg shadow-violet-200/50">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">Portal do Paciente</h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  Dieta e lista de compras no celular.
                </p>
                <div className="mt-4 text-3xl">📱</div>
              </CardContent>
            </Card>
            
            {/* Security Card */}
            <Card className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl border-0 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
              <CardContent className="p-6 md:p-8 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-400 flex items-center justify-center mb-4 shadow-lg shadow-sky-200/50">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">100% Seguro</h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  Dados criptografados e protegidos.
                </p>
                <div className="mt-4 text-3xl">🔒</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
            <Badge className="mb-3 md:mb-4 bg-amber-50 text-amber-600 border-0 rounded-full font-medium">
              🔥 Membro Fundador
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-slate-800 tracking-tight">
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
                  className="w-full text-base py-6 bg-emerald-500 hover:bg-emerald-600 rounded-full font-bold btn-glow"
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
      <section className="py-16 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
            <Badge className="mb-3 md:mb-4 bg-emerald-50 text-emerald-500 border-0 rounded-full font-medium">
              <Star className="w-4 h-4 mr-1 fill-emerald-500" />
              Depoimentos
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-slate-800 tracking-tight">
              O que dizem sobre o NutriFlow
            </h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3 md:gap-6 max-w-5xl mx-auto">
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
      <section className="py-16 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-slate-800 tracking-tight">
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
      <section className="py-16 md:py-28 bg-gradient-to-br from-emerald-500 to-emerald-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-white tracking-tight">
              Pronto para transformar seu consultório?
            </h2>
            <p className="text-base md:text-lg text-emerald-100 mb-6 md:mb-8">
              Junte-se a centenas de nutricionistas que já economizam horas por semana.
            </p>
            <Button 
              size="lg" 
              className="text-base px-8 md:px-10 py-6 md:py-7 bg-white hover:bg-slate-50 text-emerald-600 rounded-full shadow-xl font-bold transition-all hover:scale-105"
              onClick={() => navigate('/auth')}
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
              <a 
                href="https://wa.me/5547992381906?text=Olá! Tenho uma dúvida sobre o NutriFlow antes de me cadastrar."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Contato
              </a>
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
