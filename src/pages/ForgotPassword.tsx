import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import logoImg from '@/assets/logo-nutriflow.png';

const emailSchema = z.string().trim().email('Email inválido');

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast({ title: 'Email inválido', description: 'Digite um email válido.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-reset-email`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: parsed.data }),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao enviar email de recuperação');
      }
      setSent(true);
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Não foi possível enviar o email. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card text-card-foreground border border-border rounded-2xl shadow-lg p-8 space-y-6">
        <img src={logoImg} alt="NutriFlow" className="h-10 mx-auto" />
        {sent ? (
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-semibold text-foreground">Verifique seu email</h1>
            <p className="text-sm text-muted-foreground">
              Se existir uma conta para <strong>{email}</strong>, enviamos um link para redefinir a senha. O link vale por 1 hora.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-semibold text-foreground">Esqueceu a senha?</h1>
              <p className="text-sm text-muted-foreground">Informe seu email e enviaremos um link para criar uma nova senha.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar link de recuperação'}
            </Button>
          </form>
        )}
        <Link to="/auth" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para o login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
