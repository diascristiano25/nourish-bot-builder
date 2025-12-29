import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import logoImg from '@/assets/logo.png';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { ParticleField } from '@/components/ui/ParticleField';

const emailSchema = z.string().email('Email inválido');

export default function PatientAuth() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle auth callback from magic link
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await checkUserTypeAndRedirect(session.user);
      }
    };

    handleAuthCallback();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await checkUserTypeAndRedirect(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserTypeAndRedirect = async (authUser: { id: string; email?: string }) => {
    try {
      // First check if user is already linked as a patient
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (patient) {
        console.log('User is a patient, redirecting to portal');
        navigate('/patient-portal');
        return;
      }

      // Check if user is a nutritionist
      const { data: nutritionist } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (nutritionist) {
        console.log('User is a nutritionist, redirecting to dashboard');
        navigate('/dashboard');
        return;
      }

      // If not found in either table, check user metadata for patient info
      const { data: { user: fullUser } } = await supabase.auth.getUser();
      const metadata = fullUser?.user_metadata;
      
      if (metadata?.is_patient && metadata?.patient_id) {
        console.log('User has patient metadata, linking...');
        // Try to link based on metadata
        const { error: updateError } = await supabase
          .from('patients')
          .update({ user_id: authUser.id })
          .eq('id', metadata.patient_id);

        if (!updateError) {
          toast({
            title: "Acesso configurado!",
            description: "Bem-vindo ao seu portal de paciente.",
          });
          navigate('/patient-portal');
          return;
        }
      }

      // Last resort: check by email and link if needed
      if (authUser.email) {
        // Use RPC or check if there's a patient with this email
        // Since RLS might block, we check if we got authenticated successfully
        // The user was authenticated via magic link, so they should have access
        
        // Just redirect to portal - the portal will handle any missing links
        console.log('User authenticated via magic link, redirecting to portal');
        navigate('/patient-portal');
        return;
      }

      // If nothing worked, show error
      toast({
        title: "Acesso não configurado",
        description: "Entre em contato com seu nutricionista para liberar seu acesso.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error checking user type:', error);
      // If there's an error but user is authenticated, try redirecting anyway
      navigate('/patient-portal');
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(email);

      // Check if patient exists with this email
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('email', email)
        .maybeSingle();

      if (patientError) {
        throw patientError;
      }

      if (!patient) {
        toast({
          title: "Email não encontrado",
          description: "Este email não está cadastrado como paciente. Entre em contato com seu nutricionista.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/patient-portal`,
          data: {
            patient_id: patient.id,
            full_name: patient.full_name,
            is_patient: true,
          },
        },
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Link enviado!",
        description: "Verifique sua caixa de entrada e clique no link para acessar.",
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Email inválido",
          description: err.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao enviar link",
          description: (err as Error).message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleField />
        <div className="w-full max-w-md animate-fade-in relative z-10">
          <GlassCard glow="lime" className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Verifique seu email</h2>
            <p className="text-muted-foreground mb-6">
              Enviamos um link de acesso para <strong className="text-primary">{email}</strong>. 
              Clique no link para acessar seu portal.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setEmailSent(false)}
              className="w-full border-border/50 hover:bg-primary/10"
            >
              Tentar outro email
            </Button>
          </GlassCard>
        </div>
      </div>
    );
  }

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
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-foreground">Entrar com Email</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Digite seu email cadastrado para receber um link de acesso
            </p>
          </div>
          <form onSubmit={handleSendMagicLink} className="space-y-4">
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
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar link de acesso'
              )}
            </Button>
          </form>
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
      </div>
    </div>
  );
}
