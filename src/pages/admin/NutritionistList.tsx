import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, Search, MoreVertical, Clock, CheckCircle, XCircle, UserCheck, UserX, CalendarPlus, StickyNote, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { logAdminAction } from '@/lib/admin-audit';
import { motion } from 'framer-motion';

interface Nutritionist {
  id: string;
  full_name: string;
  user_id: string;
  crn: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  is_active: boolean;
  is_admin: boolean;
  account_status: string;
  trial_ends_at: string | null;
  admin_notes: string | null;
}

type StatusFilter = 'all' | 'active' | 'trial' | 'inactive';

export default function NutritionistList() {
  const navigate = useNavigate();
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [extendTrialDialog, setExtendTrialDialog] = useState<{ open: boolean; nutriId: string | null; days: number }>({ open: false, nutriId: null, days: 7 });
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; nutriId: string | null; notes: string }>({ open: false, nutriId: null, notes: '' });

  useEffect(() => {
    fetchNutritionists();
  }, []);

  const fetchNutritionists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, user_id, crn, phone, created_at, is_active, is_admin, account_status, trial_ends_at, admin_notes')
        .eq('is_admin', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch emails via edge function
      const userIds = (data || []).map(p => p.user_id);
      let emailMap: Record<string, string | null> = {};
      if (userIds.length > 0) {
        try {
          const { data: emailData } = await supabase.functions.invoke('get-user-emails', {
            body: { user_ids: userIds },
          });
          if (emailData?.success) {
            emailMap = emailData.emails || {};
          }
        } catch (e) {
          console.error('Error fetching emails:', e);
        }
      }

      const withEmails = (data || []).map(p => ({
        ...p,
        email: emailMap[p.user_id] || null,
      }));

      setNutritionists(withEmails);
    } catch (error) {
      console.error('Error fetching nutritionists:', error);
      toast.error('Erro ao carregar nutricionistas');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (nutritionistId: string, currentStatus: boolean) => {
    setUpdating(nutritionistId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', nutritionistId);

      if (error) throw error;

      setNutritionists(prev =>
        prev.map(n => n.id === nutritionistId ? { ...n, is_active: !currentStatus } : n)
      );

      await logAdminAction(
        !currentStatus ? 'activate_nutritionist' : 'deactivate_nutritionist',
        'profile',
        nutritionistId
      );

      toast.success(`Acesso ${!currentStatus ? 'ativado' : 'desativado'}`);
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setUpdating(null);
    }
  };

  const handleExtendTrial = async () => {
    if (!extendTrialDialog.nutriId) return;
    try {
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + extendTrialDialog.days);

      const { error } = await supabase
        .from('profiles')
        .update({ trial_ends_at: newEndDate.toISOString(), account_status: 'trial' })
        .eq('id', extendTrialDialog.nutriId);

      if (error) throw error;

      await logAdminAction('extend_trial', 'profile', extendTrialDialog.nutriId, { days: extendTrialDialog.days });

      setNutritionists(prev =>
        prev.map(n => n.id === extendTrialDialog.nutriId
          ? { ...n, trial_ends_at: newEndDate.toISOString(), account_status: 'trial' }
          : n)
      );

      toast.success(`Trial estendido por ${extendTrialDialog.days} dias`);
      setExtendTrialDialog({ open: false, nutriId: null, days: 7 });
    } catch (error) {
      console.error('Error extending trial:', error);
      toast.error('Erro ao estender trial');
    }
  };

  const handleSaveNotes = async () => {
    if (!notesDialog.nutriId) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ admin_notes: notesDialog.notes })
        .eq('id', notesDialog.nutriId);

      if (error) throw error;

      await logAdminAction('update_admin_notes', 'profile', notesDialog.nutriId);

      setNutritionists(prev =>
        prev.map(n => n.id === notesDialog.nutriId ? { ...n, admin_notes: notesDialog.notes } : n)
      );

      toast.success('Notas salvas');
      setNotesDialog({ open: false, nutriId: null, notes: '' });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Erro ao salvar notas');
    }
  };

  const getLicenseStatus = (createdAt: string, trialEndsAt: string | null) => {
    if (trialEndsAt && new Date(trialEndsAt) > new Date()) {
      const daysLeft = differenceInDays(new Date(trialEndsAt), new Date());
      return { label: `Trial (${daysLeft}d)`, variant: 'default' as const, color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' };
    }
    const daysSinceCreation = differenceInDays(new Date(), new Date(createdAt));
    if (daysSinceCreation <= 33) {
      return { label: `Teste (${33 - daysSinceCreation}d)`, variant: 'default' as const, color: 'bg-info/20 text-info border-info/30' };
    }
    return { label: 'Expirado', variant: 'destructive' as const, color: '' };
  };

  const filteredNutritionists = nutritionists.filter(n => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      n.full_name.toLowerCase().includes(term) ||
      (n.crn && n.crn.toLowerCase().includes(term)) ||
      (n.phone && n.phone.includes(term)) ||
      (n.email && n.email.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    switch (statusFilter) {
      case 'active': return n.is_active;
      case 'trial': return n.account_status === 'trial' || (n.trial_ends_at && new Date(n.trial_ends_at) > new Date());
      case 'inactive': return !n.is_active;
      default: return true;
    }
  });

  const activeCount = nutritionists.filter(n => n.is_active).length;
  const trialCount = nutritionists.filter(n => n.account_status === 'trial' || (n.trial_ends_at && new Date(n.trial_ends_at) > new Date())).length;
  const inactiveCount = nutritionists.filter(n => !n.is_active).length;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Nutricionistas"
          subtitle="Gerencie todos os profissionais da plataforma"
          icon={<Users className="w-7 h-7 text-white" />}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: nutritionists.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Ativos', value: activeCount, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: 'Em Trial', value: trialCount, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Inativos', value: inactiveCount, icon: UserX, color: 'text-red-600', bg: 'bg-red-100' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Filters & Table */}
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <NeonText as="h2" color="primary" className="font-semibold">
              Nutricionistas Registrados
            </NeonText>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="trial">Em Trial</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar nome, CRN, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Nome</TableHead>
                  <TableHead>CRN</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Licença</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredNutritionists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum nutricionista registrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNutritionists.map((n) => {
                    const license = getLicenseStatus(n.created_at, n.trial_ends_at);
                    return (
                      <TableRow key={n.id} className="border-border/30 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/admin/nutris/${n.id}`)}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{n.full_name}</p>
                            {n.phone && <p className="text-xs text-muted-foreground">{n.phone}</p>}
                          </div>
                        </TableCell>
                        <TableCell>{n.crn || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{n.email || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(n.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={license.variant} className={`text-xs ${license.color}`}>
                            {license.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={n.is_active ? 'default' : 'secondary'}
                            className={n.is_active ? 'bg-success/20 text-success border-success/30' : ''}
                          >
                            {n.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <Switch
                              checked={n.is_active}
                              onCheckedChange={() => toggleActive(n.id, n.is_active)}
                              disabled={updating === n.id}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/admin/nutris/${n.id}`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setExtendTrialDialog({ open: true, nutriId: n.id, days: 7 })}>
                                  <CalendarPlus className="w-4 h-4 mr-2" />
                                  Estender Trial
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setNotesDialog({ open: true, nutriId: n.id, notes: n.admin_notes || '' })}>
                                  <StickyNote className="w-4 h-4 mr-2" />
                                  Notas Admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </GlassCard>
      </div>

      {/* Extend Trial Dialog */}
      <Dialog open={extendTrialDialog.open} onOpenChange={(open) => setExtendTrialDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estender Trial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="days">Dias adicionais</Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={365}
                value={extendTrialDialog.days}
                onChange={(e) => setExtendTrialDialog(prev => ({ ...prev, days: parseInt(e.target.value) || 7 }))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExtendTrialDialog({ open: false, nutriId: null, days: 7 })}>Cancelar</Button>
              <Button onClick={handleExtendTrial} className="bg-primary hover:bg-primary/90">Estender</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={notesDialog.open} onOpenChange={(open) => setNotesDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notas Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Observações internas sobre este nutricionista..."
              value={notesDialog.notes}
              onChange={(e) => setNotesDialog(prev => ({ ...prev, notes: e.target.value }))}
              rows={5}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotesDialog({ open: false, nutriId: null, notes: '' })}>Cancelar</Button>
              <Button onClick={handleSaveNotes} className="bg-primary hover:bg-primary/90">Salvar</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}