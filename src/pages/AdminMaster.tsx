import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logoImg from '@/assets/logo.png';

interface Nutritionist {
  id: string;
  full_name: string;
  user_id: string;
  created_at: string;
  is_active: boolean;
  is_admin: boolean;
  account_status: string;
}

// Master admin email - only this user can access
const MASTER_ADMIN_EMAIL = 'admin@flowtechgroup.com.br';

export default function AdminMaster() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      // Check if user is master admin
      if (user.email === MASTER_ADMIN_EMAIL) {
        setIsMasterAdmin(true);
        fetchNutritionists();
      } else {
        // Check if user is a regular admin
        checkAdminStatus();
      }
    }
  }, [user, authLoading, navigate]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_current_user_admin');
      if (error) throw error;
      
      if (data) {
        setIsMasterAdmin(true);
        fetchNutritionists();
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/dashboard');
    }
  };

  const fetchNutritionists = async () => {
    try {
      const { data, error } = await supabase
        .from('nutritionists')
        .select('id, full_name, user_id, created_at, is_active, is_admin, account_status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNutritionists(data || []);
    } catch (error) {
      console.error('Error fetching nutritionists:', error);
      toast.error('Erro ao carregar nutricionistas');
    } finally {
      setLoading(false);
    }
  };

  const getLicenseStatus = (createdAt: string) => {
    const daysSinceCreation = differenceInDays(new Date(), new Date(createdAt));
    
    if (daysSinceCreation <= 60) {
      return {
        label: 'Período de Teste (Membro Fundador)',
        variant: 'default' as const,
        daysLeft: 60 - daysSinceCreation
      };
    } else {
      return {
        label: 'Expirado',
        variant: 'destructive' as const,
        daysLeft: 0
      };
    }
  };

  const toggleActive = async (nutritionistId: string, currentStatus: boolean) => {
    setUpdating(nutritionistId);
    try {
      const { error } = await supabase
        .from('nutritionists')
        .update({ is_active: !currentStatus })
        .eq('id', nutritionistId);

      if (error) throw error;

      setNutritionists(prev =>
        prev.map(n =>
          n.id === nutritionistId ? { ...n, is_active: !currentStatus } : n
        )
      );

      toast.success(`Acesso ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setUpdating(null);
    }
  };

  const toggleAdmin = async (nutritionistId: string, currentStatus: boolean) => {
    setUpdating(nutritionistId + '-admin');
    try {
      const { error } = await supabase
        .from('nutritionists')
        .update({ is_admin: !currentStatus })
        .eq('id', nutritionistId);

      if (error) throw error;

      setNutritionists(prev =>
        prev.map(n =>
          n.id === nutritionistId ? { ...n, is_admin: !currentStatus } : n
        )
      );

      toast.success(`Admin ${!currentStatus ? 'ativado' : 'removido'} com sucesso`);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('Erro ao atualizar status de admin');
    } finally {
      setUpdating(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isMasterAdmin) {
    return null;
  }

  const activeCount = nutritionists.filter(n => n.is_active).length;
  const trialCount = nutritionists.filter(n => {
    const days = differenceInDays(new Date(), new Date(n.created_at));
    return days <= 60;
  }).length;
  const expiredCount = nutritionists.filter(n => {
    const days = differenceInDays(new Date(), new Date(n.created_at));
    return days > 60;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="w-10 h-10 object-contain" />
            <div>
              <span className="font-bold text-xl">NutriFlow</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Admin Master
              </Badge>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
          <p className="text-muted-foreground">
            Gerencie licenças e acessos dos nutricionistas cadastrados
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{nutritionists.length}</p>
                  <p className="text-sm text-muted-foreground">Total Cadastrados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trialCount}</p>
                  <p className="text-sm text-muted-foreground">Em Período de Teste</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{expiredCount}</p>
                  <p className="text-sm text-muted-foreground">Licenças Expiradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nutritionists Table */}
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Nutricionistas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Profissional</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Status da Licença</TableHead>
                    <TableHead>Status do Acesso</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nutritionists.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum nutricionista cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    nutritionists.map((nutritionist) => {
                      const licenseStatus = getLicenseStatus(nutritionist.created_at);
                      
                      return (
                        <TableRow key={nutritionist.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{nutritionist.full_name}</span>
                              {nutritionist.is_admin && (
                                <Badge variant="outline" className="text-xs">
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(nutritionist.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={licenseStatus.variant}>
                              {licenseStatus.label}
                            </Badge>
                            {licenseStatus.daysLeft > 0 && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({licenseStatus.daysLeft} dias restantes)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {nutritionist.is_active ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-destructive border-destructive">
                                Inativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={nutritionist.is_admin}
                                onCheckedChange={() => toggleAdmin(nutritionist.id, nutritionist.is_admin)}
                                disabled={updating === nutritionist.id + '-admin'}
                              />
                              <span className="text-xs text-muted-foreground">
                                {nutritionist.is_admin ? 'Sim' : 'Não'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-sm text-muted-foreground">
                                {nutritionist.is_active ? 'Ativo' : 'Inativo'}
                              </span>
                              <Switch
                                checked={nutritionist.is_active}
                                onCheckedChange={() => toggleActive(nutritionist.id, nutritionist.is_active)}
                                disabled={updating === nutritionist.id}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>FlowTech Group - CNPJ: 46.684.547/0001-54</p>
          <p className="mt-1">Painel de Administração Master v1.0</p>
        </div>
      </main>
    </div>
  );
}
