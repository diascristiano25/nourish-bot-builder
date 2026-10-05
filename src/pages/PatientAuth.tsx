import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, Eye, EyeOff, Leaf, Heart, Sparkles } from 'lucide-react';
import { z } from 'zod';
import logoImg from '@/assets/logo.png';
import { motion } from 'framer-motion';

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkUserTypeAndRedirect(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserTypeAndRedirect = async (authUser: { id: string; email?: string }) => {
    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('id, nutritionist_id')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (patient) {
        navigate('/meu-app');
        return;
      }

      const { data: nutritionist } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (nutritionist) {
        navigate('/dashboard');
        return;
      }

      if (authUser.email) {
        const { data: patientByEmail } = await supabase
          .from('patients')
          .select('id')
          .eq('email', authUser.email)
          .maybeSingle();

        if (patientByEmail) {
          await supabase
            .from('patients')
            .update({ user_id: authUser.id })
            .eq('id', patientByEmail.id);
          
          navigate('/meu-app');
          return;
        }
      }

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

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Digite seu email",
        description: "Preencha o campo de email para recuperar sua senha.",
        variant: "destructive",
      });
      return;
    }

    try {
      loginSchema.shape.email.parse(email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/patient-auth`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Beautiful gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
      
      {/* Animated gradient orbs */}
      <motion.div 
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-200/40 to-teal-200/30 rounded-full blur-3xl"
        animate={{ 
          x: [0, 50, 0], 
          y: [0, 30, 0],
          scale: [1, 1.1, 1] 
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-green-200/40 to-emerald-100/30 rounded-full blur-3xl"
        animate={{ 
          x: [0, -40, 0], 
          y: [0, -50, 0],
          scale: [1, 1.15, 1] 
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-lime-100/30 to-emerald-100/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Decorative floating icons */}
      <motion.div 
        className="absolute top-20 right-20 text-emerald-300/50"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Leaf className="w-12 h-12" />
      </motion.div>
      <motion.div 
        className="absolute bottom-32 left-16 text-teal-300/50"
        animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="w-10 h-10" />
      </motion.div>
      <motion.div 
        className="absolute top-1/3 left-10 text-green-300/40"
        animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>
      
      {/* Main content */}
      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo and Title */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl blur-xl opacity-30" />
            <img 
              src={logoImg} 
              alt="NutriFlow" 
              className="w-24 h-24 object-contain mx-auto relative drop-shadow-lg" 
            />
          </motion.div>
          <h1 className="text-4xl font-bold mt-6 bg-gradient-to-r from-emerald-700 via-teal-600 to-green-600 bg-clip-text text-transparent">
            NutriFlow
          </h1>
          <p className="text-lg text-emerald-700/80 mt-2 font-medium">
            Área do Paciente
          </p>
        </motion.div>

        {/* Glass Card */}
        <motion.div 
          className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl shadow-emerald-900/10 border border-white/50 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {isFirstAccess ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-emerald-900">Primeiro Acesso</h2>
                <p className="text-sm text-emerald-700/70 mt-1">
                  Crie uma senha para acessar seu portal
                </p>
              </div>
              <form onSubmit={handleFirstAccess} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-emerald-800 text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 text-base bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/30 rounded-xl"
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-800 text-sm font-medium">Criar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-14 text-base bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/30 rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-800 text-sm font-medium">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 h-14 text-base bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/30 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar conta e entrar'
                    )}
                  </Button>
                </motion.div>
                <Button 
                  type="button"
                  variant="ghost"
                  className="w-full h-12 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/50"
                  onClick={() => setIsFirstAccess(false)}
                >
                  Já tenho conta
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-emerald-900">Bem-vindo de volta!</h2>
                <p className="text-sm text-emerald-700/70 mt-1">
                  Entre para acessar seu plano alimentar
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-emerald-800 text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 text-base bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/30 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-800 text-sm font-medium">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-14 text-base bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/30 rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </motion.div>
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50/50 hover:border-emerald-300 rounded-xl transition-all duration-300"
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
        </motion.div>

        {/* Footer info */}
        <motion.p 
          className="text-center text-sm text-emerald-700/60 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Seu acesso é gerado pelo seu nutricionista.<br />
          Caso não tenha acesso, entre em contato.
        </motion.p>
      </motion.div>
    </div>
  );
}
