import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Leaf, ArrowRight, Users, Sparkles, FileText, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen gradient-subtle">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">NutriFlow</span>
          </div>
          <Button onClick={() => navigate('/auth')} variant="outline">
            Entrar
          </Button>
        </header>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center py-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Cardápios inteligentes com IA
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Crie cardápios personalizados com{' '}
            <span className="text-primary">
              inteligência artificial
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Plataforma completa para nutricionistas gerenciarem pacientes e gerarem 
            planos alimentares baseados na Tabela TACO em segundos.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto"
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto"
            >
              Já tenho conta
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
          <div className="p-6 rounded-2xl bg-card shadow-md hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Gestão de Pacientes</h3>
            <p className="text-muted-foreground text-sm">
              Cadastro completo com anamnese, histórico de medidas e acompanhamento de evolução.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card shadow-md hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold text-lg mb-2">IA com Tabela TACO</h3>
            <p className="text-muted-foreground text-sm">
              Geração automática de cardápios baseados em dados nutricionais brasileiros.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card shadow-md hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-info" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Personalização Total</h3>
            <p className="text-muted-foreground text-sm">
              Edite cardápios, adicione seu logo e exporte documentos personalizados.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-12 mt-16 text-sm text-muted-foreground">
          <p>© 2024 NutriFlow. Plataforma para nutricionistas.</p>
        </footer>
      </div>
    </div>
  );
}
