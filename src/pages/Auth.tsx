import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, ArrowRight, Sparkles, Activity, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import logoImg from '@/assets/logo-nutriflow.png';

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
  const [activeTab, setActiveTab] = useState('login');

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const email = params.get('email');
    const name = params.get('name');

    if (mode === 'signup') {
      setActiveTab('signup');
      if (email) setSignupEmail(email);
      if (name) setSignupFullName(name);
    }
  }, []);

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
        toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Dados inválidos", description: err.errors[0].message, variant: "destructive" });
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
        toast({ title: "Erro no cadastro", description: message, variant: "destructive" });
      } else {
        toast({ title: "Conta criada!", description: "Bem-vindo ao NutriFlow." });
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Dados inválidos", description: err.errors[0].message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-nf-bg">
      {/* LEFT PANEL - Visual / Brand side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-nf-teal via-nf-teal/90 to-nf-coral/80">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-morph-blob" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full text-white">
          {/* Top: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <img src={logoImg} alt="NutriFlow" className="h-8 w-auto brightness-0 invert" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight">NutriFlow</span>
          </div>

          {/* Middle: Hero content */}
          <div className="space-y-8 max-w-lg">
            <div>
              <h1 className="font-serif text-4xl xl:text-5xl font-bold leading-tight mb-4">
                Nutrição de precisão, potencializada por IA.
              </h1>
              <p className="text-white/85 text-lg leading-relaxed">
                Gere cardápios personalizados em segundos e gestione sua clínica inteira em uma plataforma unificada.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                { icon: Sparkles, text: 'Cardápios gerados por IA em menos de 30 segundos' },
                { icon: Users, text: 'Gestão completa de pacientes e agendamentos' },
                { icon: TrendingUp, text: 'Analytics de evolução em tempo real' },
                { icon: CheckCircle2, text: '14 dias grátis, sem cartão de crédito' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 group-hover:bg-white/25 transition-colors">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-white/90 pt-1.5 text-sm leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Mini dashboard preview */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-semibold">Painel Clínico</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Ao vivo</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Pacientes', value: '48' },
                  { label: 'Cardápios', value: '126' },
                  { label: 'Adesão', value: '94%' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <div className="text-[10px] text-white/70 uppercase tracking-wide">{stat.label}</div>
                    <div className="text-lg font-bold mt-1">{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-1.5 h-12">
                {[40, 70, 45, 90, 60, 85, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/30 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom: copyright */}
          <div className="text-white/60 text-xs">
            © 2026 NutriFlow. Inovação em nutrição.
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Form side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile logo (shown only on small screens) */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
          <span className="font-serif text-xl font-bold text-nf-text">NutriFlow</span>
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-nf-text">
              {activeTab === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h2>
            <p className="text-nf-text-muted">
              {activeTab === 'login'
                ? 'Entre para acessar sua plataforma clínica'
                : 'Comece gratuitamente e transforme sua prática'}
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-nf-bg-alt p-1 h-12 rounded-xl">
              <TabsTrigger
                value="login"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-nf-teal data-[state=active]:shadow-sm font-medium transition-all"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-nf-coral data-[state=active]:shadow-sm font-medium transition-all"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>

            {/* LOGIN FORM */}
            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-nf-text">
                    Email profissional
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nf-text-muted" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="pl-10 h-12 bg-nf-bg-alt/50 border-nf-border focus:border-nf-teal focus:ring-nf-teal/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-sm font-medium text-nf-text">
                      Senha
                    </Label>
                    <Link to="/forgot-password" className="text-xs text-nf-teal hover:underline font-medium">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nf-text-muted" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="pl-10 h-12 bg-nf-bg-alt/50 border-nf-border focus:border-nf-teal focus:ring-nf-teal/20 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-nf-coral hover:bg-nf-coral/90 text-white font-semibold rounded-xl shadow-lg shadow-nf-coral/20 transition-all hover:shadow-xl group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      Entrar na plataforma
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* SIGNUP FORM */}
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium text-nf-text">
                    Nome completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nf-text-muted" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Dra. Maria Silva"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      required
                      className="pl-10 h-12 bg-nf-bg-alt/50 border-nf-border focus:border-nf-coral focus:ring-nf-coral/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-nf-text">
                    Email profissional
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nf-text-muted" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="pl-10 h-12 bg-nf-bg-alt/50 border-nf-border focus:border-nf-coral focus:ring-nf-coral/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-nf-text">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nf-text-muted" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        className="pl-10 h-12 bg-nf-bg-alt/50 border-nf-border focus:border-nf-coral focus:ring-nf-coral/20 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-sm font-medium text-nf-text">
                      Confirmar
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nf-text-muted" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        required
                        className="pl-10 h-12 bg-nf-bg-alt/50 border-nf-border focus:border-nf-coral focus:ring-nf-coral/20 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-nf-coral hover:bg-nf-coral/90 text-white font-semibold rounded-xl shadow-lg shadow-nf-coral/20 transition-all hover:shadow-xl group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar conta gratuita
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-nf-text-muted text-center leading-relaxed">
                  Ao criar uma conta, você concorda com nossos{' '}
                  <Link to="/terms" className="text-nf-teal hover:underline font-medium">Termos</Link>
                  {' '}e{' '}
                  <Link to="/privacy" className="text-nf-teal hover:underline font-medium">Privacidade</Link>.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="pt-6 border-t border-nf-border/50 flex items-center justify-between text-xs text-nf-text-muted">
            <Link to="/" className="hover:text-nf-teal transition-colors">
              ← Voltar ao site
            </Link>
            <span>© 2026 NutriFlow</span>
          </div>
        </div>
      </div>
    </div>
  );
}