import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import logoImg from '@/assets/logo-nutriflow.png';

type Status = 'verifying' | 'ready' | 'invalid';

const ResetPassword = () => {
  const [status, setStatus] = useState<Status>('verifying');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // O link do email traz ?token_hash=... (ou ?token=... nos emails antigos).
  // Trocamos o token por uma sessão de recuperação e só então pedimos a nova senha.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash') || params.get('token');

    const verify = async () => {
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash });
        setStatus(error ? 'invalid' : 'ready');
        return;
      }
      // Fluxo alternativo (link padrão do Supabase com sessão já na URL)
      const { data } = await supabase.auth.getSession();
      setStatus(data.session ? 'ready' : 'invalid');
    };
    verify();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Senha muito curta', description: 'Use no mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Senhas diferentes', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (error) {
      toast({ title: 'Erro ao redefinir senha', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Senha atualizada!', description: 'Você já está logado com a nova senha.' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card text-card-foreground border border-border rounded-2xl shadow-lg p-8 space-y-6">
        <img src={logoImg} alt="NutriFlow" className="h-10 mx-auto" />
        {status === 'verifying' && (
          <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin" /></div>
        )}
        {status === 'invalid' && (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-foreground">Link inválido ou expirado</h1>
            <p className="text-sm text-muted-foreground">Solicite um novo link para redefinir sua senha.</p>
            <Button asChild className="w-full"><Link to="/forgot-password">Solicitar novo link</Link></Button>
          </div>
        )}
        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h1 className="text-2xl font-semibold text-foreground text-center">Criar nova senha</h1>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar nova senha'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
