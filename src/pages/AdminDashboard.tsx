import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Shield, 
  Users,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Nutritionist {
  id: string;
  user_id: string;
  full_name: string;
  crn: string | null;
  phone: string | null;
  is_admin: boolean;
  account_status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminAndFetchData();
    }
  }, [user]);

  const checkAdminAndFetchData = async () => {
    try {
      // Check if current user is admin using security definer function
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_current_user_admin');

      if (adminError) throw adminError;

      if (!adminCheck) {
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);

      // Fetch all nutritionists (admin RLS policy allows this)
      const { data, error } = await supabase
        .from('nutritionists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNutritionists(data || []);
    } catch (error: any) {
      console.error('Admin check error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar permissões de administrador.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccountStatus = async (nutritionistId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUpdating(nutritionistId);

    try {
      const { error } = await supabase
        .from('nutritionists')
        .update({ account_status: newStatus })
        .eq('id', nutritionistId);

      if (error) throw error;

      setNutritionists(prev => 
        prev.map(n => 
          n.id === nutritionistId 
            ? { ...n, account_status: newStatus }
            : n
        )
      );

      toast({
        title: "Status atualizado",
        description: `Conta ${newStatus === 'active' ? 'ativada' : 'suspensa'} com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const activeCount = nutritionists.filter(n => n.account_status === 'active').length;
  const suspendedCount = nutritionists.filter(n => n.account_status === 'suspended').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="font-bold text-lg">Painel Administrativo</h1>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={checkAdminAndFetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Nutricionistas</p>
                  <p className="text-3xl font-bold">{nutritionists.length}</p>
                </div>
                <Users className="w-10 h-10 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contas Ativas</p>
                  <p className="text-3xl font-bold text-success">{activeCount}</p>
                </div>
                <Badge variant="default" className="bg-success">Ativas</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contas Suspensas</p>
                  <p className="text-3xl font-bold text-destructive">{suspendedCount}</p>
                </div>
                <Badge variant="destructive">Suspensas</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Nutricionistas Registrados</CardTitle>
            <CardDescription>
              Gerencie o status das contas dos nutricionistas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CRN</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nutritionists.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhum nutricionista registrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    nutritionists.map((nutritionist) => (
                      <TableRow key={nutritionist.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {nutritionist.full_name}
                            {nutritionist.is_admin && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{nutritionist.crn || '-'}</TableCell>
                        <TableCell>{nutritionist.phone || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(nutritionist.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={nutritionist.account_status === 'active' ? 'default' : 'destructive'}
                          >
                            {nutritionist.account_status === 'active' ? 'Ativo' : 'Suspenso'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {updating === nutritionist.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Switch
                                checked={nutritionist.account_status === 'active'}
                                onCheckedChange={() => toggleAccountStatus(nutritionist.id, nutritionist.account_status)}
                                disabled={nutritionist.is_admin}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
