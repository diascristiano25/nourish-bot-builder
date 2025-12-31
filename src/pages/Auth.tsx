import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Terminal, Sparkles } from 'lucide-react';
import { z } from 'zod';
import logoImg from '@/assets/logo.png';
import { GlassCard } from '@/components/ui/GlassCard';
import { ParticleField } from '@/components/ui/ParticleField';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      loginSchema.parse({ email: loginEmail, password: loginPassword });
      
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        toast({
          title: "Erro ao entrar",
          description: error.message === 'Invalid login credentials' 
            ? 'Email ou senha incorretos' 
            : error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Bem-vindo!",
          description: "Login realizado com sucesso.",
        });
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Dados inválidos",
          description: err.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      signupSchema.parse({
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        fullName: signupFullName,
      });

      const { error } = await signUp(signupEmail, signupPassword, signupFullName);

      if (error) {
        let message = error.message;
        if (error.message.includes('already registered')) {
          message = 'Este email já está cadastrado';
        }
        toast({
          title: "Erro no cadastro",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta criada!",
          description: "Bem-vindo ao NutriFlow.",
        });
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Dados inválidos",
          description: err.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <ParticleField />
      <div className="absolute inset-0 cyber-grid opacity-30" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-lime/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-violet/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
      
      <div className="w-full max-w-md animate-scale-in relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyber-lime/20 to-electric-violet/20 flex items-center justify-center mx-auto mb-4 border border-border backdrop-blur-sm">
              <img src={logoImg} alt="NutriFlow" className="w-12 h-12 object-contain" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-cyber-lime/20 to-electric-violet/20 rounded-3xl blur-xl -z-10" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-lime via-foreground to-electric-violet bg-clip-text text-transparent">
            NutriFlow
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-mono">
            SISTEMA_NUTRICIONAL :: v2026
          </p>
        </div>

        <GlassCard variant="strong" glow="lime" className="p-0 overflow-hidden">
          <Tabs defaultValue="login" className="w-full">
            {/* Tabs Header */}
            <div className="p-6 pb-0">
              <TabsList className="grid w-full grid-cols-2 glass rounded-xl p-1 h-12">
                <TabsTrigger 
                  value="login" 
                  className="rounded-lg data-[state=active]:bg-cyber-lime/20 data-[state=active]:text-cyber-lime font-medium"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="rounded-lg data-[state=active]:bg-electric-violet/20 data-[state=active]:text-electric-violet font-medium"
                >
                  Cadastrar
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 pt-4">
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="glass border-white/10 focus:border-cyber-lime/50 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      Senha
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="glass border-white/10 focus:border-cyber-lime/50 h-11"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-cyber-lime to-electric-violet hover:opacity-90 text-background font-semibold rounded-xl mt-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Terminal className="mr-2 h-4 w-4" />
                        Acessar Sistema
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      Nome completo
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Dr. João Silva"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      required
                      className="glass border-white/10 focus:border-electric-violet/50 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="glass border-white/10 focus:border-electric-violet/50 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      Senha
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="glass border-white/10 focus:border-electric-violet/50 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      Confirmar senha
                    </Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                      className="glass border-white/10 focus:border-electric-violet/50 h-11"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-electric-violet to-cyber-lime hover:opacity-90 text-background font-semibold rounded-xl mt-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Criar conta
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </GlassCard>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-2">
          <div className="flex justify-center gap-4 text-xs">
            <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">
              Termos de Uso
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">
              Privacidade
            </Link>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            FLOWTECH_GROUP :: NUTRIFLOW_2026
          </p>
        </div>
      </div>
    </div>
  );
}
