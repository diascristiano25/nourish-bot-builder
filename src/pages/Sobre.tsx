import { Link } from 'react-router-dom';
import { ArrowLeft, Rocket, Sparkles, Users, Zap, Heart, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import logoImg from '@/assets/logo.png';

export default function Sobre() {
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
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-0">
              <Rocket className="w-4 h-4 mr-2" />
              Sobre Nós
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Transformando a <span className="text-primary">nutrição</span> com tecnologia de ponta
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Conheça a história por trás do NutriFlow e nossa missão de revolucionar 
              o atendimento nutricional no Brasil.
            </p>
          </div>
        </div>
      </section>

      {/* FlowTech Group Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <Badge variant="secondary" className="w-fit mb-4 bg-primary/10 text-primary border-0">
                      FlowTech Group
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      O NutriFlow é um produto de elite do FlowTech Group
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Somos uma <strong className="text-foreground">Startup focada em UX (User Experience)</strong> que 
                      transforma sistemas complexos em ferramentas simples, intuitivas e extremamente rápidas.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CNPJ: 46.684.547/0001-54
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-10 h-10 text-primary" />
                      </div>
                      <p className="font-semibold text-lg">Inovação + Simplicidade</p>
                      <p className="text-sm text-muted-foreground">Nossa fórmula de sucesso</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Missão</h3>
                  <p className="text-muted-foreground text-sm">
                    Empoderar nutricionistas com tecnologia de ponta, permitindo que 
                    foquem no que realmente importa: a saúde de seus pacientes.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Visão</h3>
                  <p className="text-muted-foreground text-sm">
                    Ser a plataforma líder em gestão nutricional no Brasil, reconhecida 
                    pela inovação, agilidade e excelência em experiência do usuário.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Valores</h3>
                  <p className="text-muted-foreground text-sm">
                    Simplicidade, confiança, inovação constante e compromisso com 
                    resultados reais para profissionais e pacientes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Nossa História
            </h2>
            
            <div className="space-y-6 text-muted-foreground">
              <p>
                O NutriFlow nasceu de uma observação simples: nutricionistas passavam mais tempo 
                com planilhas e cálculos do que com seus pacientes. Horas eram gastas em tarefas 
                repetitivas que poderiam ser automatizadas.
              </p>
              
              <p>
                Em 2024, o FlowTech Group decidiu aplicar sua expertise em User Experience para 
                resolver esse problema. Com uma equipe apaixonada por tecnologia e design, 
                desenvolvemos uma plataforma que transforma complexidade em simplicidade.
              </p>
              
              <p>
                Utilizando inteligência artificial avançada e a base de dados da Tabela TACO, 
                criamos um sistema que gera cardápios personalizados em segundos, não em horas. 
                Mas mais do que velocidade, focamos na <strong className="text-foreground">experiência</strong>: 
                cada clique, cada tela, cada funcionalidade foi pensada para ser intuitiva.
              </p>
              
              <p>
                Hoje, o NutriFlow representa nosso compromisso com a inovação e a confiança. 
                Somos uma startup brasileira que acredita que a tecnologia deve servir às pessoas, 
                não o contrário.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Por que escolher o NutriFlow?
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Agilidade</h3>
                  <p className="text-sm text-muted-foreground">
                    Cardápios em segundos, não em horas. Mais tempo para o que importa.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Inovação</h3>
                  <p className="text-sm text-muted-foreground">
                    IA de última geração com dados nutricionais brasileiros oficiais.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Confiança</h3>
                  <p className="text-sm text-muted-foreground">
                    Segurança de dados em conformidade com a LGPD e boas práticas.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Suporte Humano</h3>
                  <p className="text-sm text-muted-foreground">
                    Time dedicado pronto para ajudar. Você nunca está sozinho.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Pronto para fazer parte dessa revolução?
            </h2>
            <p className="text-muted-foreground mb-8">
              Junte-se a centenas de nutricionistas que já estão economizando tempo e 
              encantando seus pacientes.
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/auth">
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="NutriFlow" className="w-8 h-8 object-contain" />
              <span className="font-semibold">NutriFlow</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/sobre" className="text-muted-foreground hover:text-foreground transition-colors">
                Sobre Nós
              </Link>
              <Link to="/privacidade" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <a 
                href="mailto:contato@flowtechgroup.com.br" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contato
              </a>
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
