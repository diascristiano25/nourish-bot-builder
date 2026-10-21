import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Users, Calendar, DollarSign, MessageSquare, FileText, Activity, ArrowLeft, Shield, Clock, CheckCircle, XCircle, Save, CalendarPlus, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { logAdminAction } from '@/lib/admin-audit';
import { motion } from 'framer-motion';

interface ProfileData {
  id: string;
  full_name: string;
  user_id: string;
  crn: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  created_at: string;
  is_active: boolean;
  account_status: string;
  trial_ends_at: string | null;
  admin_notes: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  has_seen_onboarding: boolean;
}

interface PatientRecord { id: string; full_name: string; created_at: string; }
interface AppointmentRecord { id: string; scheduled_at: string; status: string; type: string | null; }
interface FinancialRecord { id: string; record_type: string; amount: number; record_date: string; description: string | null; }
interface TicketRecord { id: string; ticket_number: number; subject: string; status: string; priority: string; created_at: string; }
interface AuditRecord { id: string; action: string; details: Record<string, unknown> | null; created_at: string; }

export default function NutritionistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [financials, setFinancials] = useState<FinancialRecord[]>([]);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [extendDialog, setExtendDialog] = useState({ open: false, days: 7 });

  useEffect(() => {
    if (id) fetchAll(id);
  }, [id]);

  const fetchAll = async (profileId: string) => {
    setLoading(true);
    try {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      if (profErr) throw profErr;

      // Fetch email
      let email: string | null = null;
      try {
        const { data: emailData } = await supabase.functions.invoke('get-user-emails', {
          body: { user_ids: [prof.user_id] },
        });
        if (emailData?.success) email = emailData.emails?.[prof.user_id] || null;
      } catch {}

      setProfile({ ...prof, email });
      setNotes(prof.admin_notes || '');

      // Parallel fetches
      const [patRes, appRes, finRes, tickRes, audRes] = await Promise.all([
        supabase.from('patients').select('id, full_name, created_at').eq('nutritionist_id', profileId).order('created_at', { ascending: false }).limit(50),
        supabase.from('appointments').select('id, scheduled_at, status, type').eq('nutritionist_id', profileId).order('scheduled_at', { ascending: false }).limit(20),
        supabase.from('financial_records').select('id, record_type, amount, record_date, description').eq('nutritionist_id', profileId).order('record_date', { ascending: false }).limit(30),
        supabase.from('support_tickets').select('id, ticket_number, subject, status, priority, created_at').eq('nutritionist_id', profileId).order('created_at', { ascending: false }),
        supabase.from('admin_audit_log').select('id, action, details, created_at').eq('target_id', profileId).order('created_at', { ascending: false }).limit(50),
      ]);

      setPatients(patRes.data || []);
      setAppointments(appRes.data || []);
      setFinancials(finRes.data || []);
      setTickets(tickRes.data || []);
      setAuditLogs(audRes.data || []);
    } catch (error) {
      console.error('Error fetching nutritionist detail:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    setSavingNotes(true);
    try {
      const { error } = await supabase.from('profiles').update({ admin_notes: notes }).eq('id', id);
      if (error) throw error;
      await logAdminAction('update_admin_notes', 'profile', id);
      toast.success('Notas salvas');
    } catch {
      toast.error('Erro ao salvar notas');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleToggleActive = async () => {
    if (!id || !profile) return;
    try {
      const newStatus = !profile.is_active;
      const { error } = await supabase.from('profiles').update({ is_active: newStatus }).eq('id', id);
      if (error) throw error;
      await logAdminAction(newStatus ? 'activate_nutritionist' : 'deactivate_nutritionist', 'profile', id);
      setProfile({ ...profile, is_active: newStatus });
      toast.success(`Acesso ${newStatus ? 'ativado' : 'desativado'}`);
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleExtendTrial = async () => {
    if (!id) return;
    try {
      const newEnd = new Date();
      newEnd.setDate(newEnd.getDate() + extendDialog.days);
      const { error } = await supabase.from('profiles').update({ trial_ends_at: newEnd.toISOString(), account_status: 'trial' }).eq('id', id);
      if (error) throw error;
      await logAdminAction('extend_trial', 'profile', id, { days: extendDialog.days });
      setProfile(prev => prev ? { ...prev, trial_ends_at: newEnd.toISOString(), account_status: 'trial' } : null);
      toast.success(`Trial estendido por ${extendDialog.days} dias`);
      setExtendDialog({ open: false, days: 7 });
    } catch {
      toast.error('Erro ao estender trial');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="h-32 rounded-3xl bg-muted/30 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-48 rounded-xl bg-muted/30 animate-pulse" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout>
        <div className="p-6 text-center py-20">
          <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Nutricionista não encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/nutris')}>Voltar</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/nutris')} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>
                <Badge variant={profile.is_active ? 'default' : 'secondary'} className={profile.is_active ? 'bg-success/20 text-success border-success/30' : ''}>
                  {profile.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {profile.email || '-'} • CRN: {profile.crn || '-'} • Desde {format(new Date(profile.created_at), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={profile.is_active} onCheckedChange={handleToggleActive} />
            <Button variant="outline" size="sm" onClick={() => setExtendDialog({ open: true, days: 7 })}>
              <CalendarPlus className="w-4 h-4 mr-2" />
              Estender Trial
            </Button>
          </div>
        </div>

        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="glass border border-border/50 p-1">
            <TabsTrigger value="perfil" className="gap-2"><Shield className="w-4 h-4" /> Perfil</TabsTrigger>
            <TabsTrigger value="pacientes" className="gap-2"><Users className="w-4 h-4" /> Pacientes ({patients.length})</TabsTrigger>
            <TabsTrigger value="agenda" className="gap-2"><Calendar className="w-4 h-4" /> Agenda</TabsTrigger>
            <TabsTrigger value="financeiro" className="gap-2"><DollarSign className="w-4 h-4" /> Financeiro</TabsTrigger>
            <TabsTrigger value="suporte" className="gap-2"><MessageSquare className="w-4 h-4" /> Suporte ({tickets.length})</TabsTrigger>
            <TabsTrigger value="logs" className="gap-2"><Activity className="w-4 h-4" /> Logs</TabsTrigger>
          </TabsList>

          {/* Perfil Tab */}
          <TabsContent value="perfil" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <NeonText as="h3" color="primary" className="font-semibold mb-4">Dados do Profissional</NeonText>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/30"><span className="text-muted-foreground">Nome</span><span className="font-medium">{profile.full_name}</span></div>
                  <div className="flex justify-between py-2 border-b border-border/30"><span className="text-muted-foreground">Email</span><span className="font-medium">{profile.email || '-'}</span></div>
                  <div className="flex justify-between py-2 border-b border-border/30"><span className="text-muted-foreground">Telefone</span><span className="font-medium">{profile.phone || '-'}</span></div>
                  <div className="flex justify-between py-2 border-b border-border/30"><span className="text-muted-foreground">CRN</span><span className="font-medium">{profile.crn || '-'}</span></div>
                  <div className="flex justify-between py-2 border-b border-border/30"><span className="text-muted-foreground">Status</span><span className="font-medium">{profile.account_status}</span></div>
                  <div className="flex justify-between py-2 border-b border-border/30"><span className="text-muted-foreground">Trial expira</span><span className="font-medium">{profile.trial_ends_at ? format(new Date(profile.trial_ends_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</span></div>
                  <div className="flex justify-between py-2"><span className="text-muted-foreground">Onboarding</span><span className="font-medium">{profile.has_seen_onboarding ? 'Concluído' : 'Pendente'}</span></div>
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <NeonText as="h3" color="primary" className="font-semibold mb-4">Notas Internas</NeonText>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações internas sobre este nutricionista..."
                  rows={8}
                  className="mb-4"
                />
                <Button onClick={handleSaveNotes} disabled={savingNotes} className="bg-primary hover:bg-primary/90 w-full">
                  {savingNotes ? 'Salvando...' : <><Save className="w-4 h-4 mr-2" /> Salvar Notas</>}
                </Button>
              </GlassCard>
            </div>
          </TabsContent>

          {/* Pacientes Tab */}
          <TabsContent value="pacientes">
            <GlassCard className="p-6">
              <NeonText as="h3" color="primary" className="font-semibold mb-4">Pacientes ({patients.length})</NeonText>
              <Table>
                <TableHeader><TableRow className="bg-muted/30"><TableHead>Nome</TableHead><TableHead>Cadastro</TableHead></TableRow></TableHeader>
                <TableBody>
                  {patients.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-8 text-muted-foreground">Nenhum paciente</TableCell></TableRow>
                  ) : patients.map(p => (
                    <TableRow key={p.id}><TableCell className="font-medium">{p.full_name}</TableCell><TableCell>{format(new Date(p.created_at), 'dd/MM/yyyy', { locale: ptBR })}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </GlassCard>
          </TabsContent>

          {/* Agenda Tab */}
          <TabsContent value="agenda">
            <GlassCard className="p-6">
              <NeonText as="h3" color="primary" className="font-semibold mb-4">Consultas Recentes</NeonText>
              <Table>
                <TableHeader><TableRow className="bg-muted/30"><TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Nenhuma consulta</TableCell></TableRow>
                  ) : appointments.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{format(new Date(a.scheduled_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                      <TableCell>{a.type || '-'}</TableCell>
                      <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </GlassCard>
          </TabsContent>

          {/* Financeiro Tab */}
          <TabsContent value="financeiro">
            <GlassCard className="p-6">
              <NeonText as="h3" color="primary" className="font-semibold mb-4">Transações Financeiras</NeonText>
              <Table>
                <TableHeader><TableRow className="bg-muted/30"><TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
                <TableBody>
                  {financials.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma transação</TableCell></TableRow>
                  ) : financials.map(f => (
                    <TableRow key={f.id}>
                      <TableCell>{format(new Date(f.record_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell><Badge variant={f.record_type === 'income' ? 'default' : 'secondary'}>{f.record_type === 'income' ? 'Receita' : 'Despesa'}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{f.description || '-'}</TableCell>
                      <TableCell className="text-right font-medium">R$ {Number(f.amount).toLocaleString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </GlassCard>
          </TabsContent>

          {/* Suporte Tab */}
          <TabsContent value="suporte">
            <GlassCard className="p-6">
              <NeonText as="h3" color="primary" className="font-semibold mb-4">Tickets de Suporte</NeonText>
              <Table>
                <TableHeader><TableRow className="bg-muted/30"><TableHead>#</TableHead><TableHead>Assunto</TableHead><TableHead>Prioridade</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
                <TableBody>
                  {tickets.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum ticket</TableCell></TableRow>
                  ) : tickets.map(t => (
                    <TableRow key={t.id} className="cursor-pointer hover:bg-muted/20" onClick={() => navigate(`/admin/suporte/${t.id}`)}>
                      <TableCell>#{t.ticket_number}</TableCell>
                      <TableCell className="font-medium">{t.subject}</TableCell>
                      <TableCell><Badge variant="outline">{t.priority}</Badge></TableCell>
                      <TableCell><Badge variant={t.status === 'open' ? 'destructive' : t.status === 'closed' ? 'secondary' : 'default'}>{t.status}</Badge></TableCell>
                      <TableCell>{format(new Date(t.created_at), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </GlassCard>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <GlassCard className="p-6">
              <NeonText as="h3" color="primary" className="font-semibold mb-4">Audit Log</NeonText>
              <Table>
                <TableHeader><TableRow className="bg-muted/30"><TableHead>Ação</TableHead><TableHead>Detalhes</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Nenhum registro</TableCell></TableRow>
                  ) : auditLogs.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.action}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{l.details ? JSON.stringify(l.details) : '-'}</TableCell>
                      <TableCell>{format(new Date(l.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* Extend Trial Dialog */}
      <Dialog open={extendDialog.open} onOpenChange={(open) => setExtendDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Estender Trial</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="days">Dias adicionais</Label>
              <Input id="days" type="number" min={1} max={365} value={extendDialog.days} onChange={(e) => setExtendDialog(prev => ({ ...prev, days: parseInt(e.target.value) || 7 }))} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExtendDialog({ open: false, days: 7 })}>Cancelar</Button>
              <Button onClick={handleExtendTrial} className="bg-primary hover:bg-primary/90">Estender</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}