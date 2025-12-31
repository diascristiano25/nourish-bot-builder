import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import logoImg from '@/assets/logo.png';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { ParticleField } from '@/components/ui/ParticleField';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export default function PatientAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await checkUserTypeAndRedirect(session.user);
      }
    });

    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkUserTypeAndRedirect(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserTypeAndRedirect = async (authUser: { id: string; email?: string }) => {
    try {
      // Check if user is a patient
      const { data: patient } = await supabase
        .from('patients')
        .select('id, nutritionist_id')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (patient) {
        navigate('/meu-app');
        return;
      }

      // Check if user is a nutritionist
      const { data: nutritionist } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (nutritionist) {
        navigate('/dashboard');
        return;
      }

      // If not found, try to link by email
      if (authUser.email) {
        const { data: patientByEmail } = await supabase
          .from('patients')
          .select('id')
          .eq('email', authUser.email)
          .maybeSingle();

        if (patientByEmail) {
          // Update patient with user_id
          await supabase
            .from('patients')
            .update({ user_id: authUser.id })
            .eq('id', patientByEmail.id);
          
          navigate('/meu-app');
          return;
        }
      }

      // User is authenticated but not a patient or nutritionist
      toast({
        title: "Acesso não encontrado",
        description: "Seu email não está cadastrado. Entre em contato com seu nutricionista.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error checking user type:', error);
      navigate('/meu-app');
    }
  };

  const handleCheckEmail = async () => {
    try {
      loginSchema.shape.email.parse(email);
      
      // Check if patient exists
      const { data: patient, error } = await supabase
        .from('patients')
        .select('id, user_id')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;

      if (!patient) {
        toast({
          title: "Email não encontrado",
          description: "Este email não está cadastrado como paciente. Entre em contato com seu nutricionista.",
          variant: "destructive",
        });
        return false;
      }

      // If patient has no user_id, it's first access
      setIsFirstAccess(!patient.user_id);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Email inválido",
          description: err.errors[0].message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      loginSchema.parse({ email, password });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos. Se é seu primeiro acesso, clique em 'Primeiro acesso'.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Dados inválidos",
          description: err.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao fazer login",
          description: (err as Error).message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        toast({
          title: "Senhas não conferem",
          description: "As senhas digitadas não são iguais.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      loginSchema.parse({ email, password });

      // Check if patient exists
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id, full_name, nutritionist_id')
        .eq('email', email)
        .maybeSingle();

      if (patientError) throw patientError;

      if (!patient) {
        toast({
          title: "Email não cadastrado",
          description: "Este email não foi cadastrado por um nutricionista.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/meu-app`,
          data: {
            patient_id: patient.id,
            full_name: patient.full_name,
            nutritionist_id: patient.nutritionist_id,
            is_patient: true,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já possui uma conta. Tente fazer login.",
            variant: "destructive",
          });
        } else {
          throw signUpError;
        }
        setIsLoading(false);
        return;
      }

      // Link user_id to patient
      if (signUpData.user) {
        await supabase
          .from('patients')
          .update({ user_id: signUpData.user.id })
          .eq('id', patient.id);
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode acessar seu portal.",
      });

      // Auto-login after signup (if email confirm is disabled)
      if (signUpData.session) {
        navigate('/meu-app');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Dados inválidos",
          description: err.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao criar conta",
          description: (err as Error).message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleField />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <img src={logoImg} alt="NutriFlow" className="w-20 h-20 object-contain mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">
            Portal do <NeonText variant="lime">Paciente</NeonText>
          </h1>
          <p className="text-muted-foreground mt-2">Acesse seu cardápio personalizado</p>
        </div>

        <GlassCard glow="lime" className="p-6">
          {isFirstAccess ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-foreground">Primeiro Acesso</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie uma senha para acessar seu portal
                </p>
              </div>
              <form onSubmit={handleFirstAccess} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50"
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Criar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-background/50 border-border/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="lg" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta e entrar'
                  )}
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsFirstAccess(false)}
                >
                  Já tenho conta
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-foreground">Entrar</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Use seu email e senha para acessar
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-background/50 border-border/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="lg" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-border/50"
                  onClick={async () => {
                    const valid = await handleCheckEmail();
                    if (valid) setIsFirstAccess(true);
                  }}
                >
                  Primeiro acesso? Criar senha
                </Button>
              </form>
            </>
          )}
        </GlassCard>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')} 
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sou nutricionista
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Seu acesso é gerado pelo seu nutricionista.<br />
          Caso não tenha acesso, entre em contato.
        </p>
      </div>
    </div>
  );
}
