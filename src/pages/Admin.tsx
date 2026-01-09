import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Loader2, Shield, Users, Clock, CheckCircle, XCircle, MessageSquare, 
  Send, Bell, Search, DollarSign, TrendingUp, Paperclip, Activity, 
  UserCheck, UserX, CalendarDays, Utensils, BarChart3, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts';
import logoImg from '@/assets/logo.png';

interface Nutritionist {
  id: string;
  full_name: string;
  user_id: string;
  crn: string | null;
  phone: string | null;
  created_at: string;
  is_active: boolean;
  is_admin: boolean;
  account_status: string;
}

interface SupportTicket {
  id: string;
  ticket_number: number;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  attachment_url?: string;
  nutritionist: {
    full_name: string;
  };
}

interface TicketMessage {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

const priorityConfig = {
  low: { label: 'Baixa', color: 'bg-muted text-muted-foreground', order: 1 },
  normal: { label: 'Normal', color: 'bg-info/20 text-info', order: 2 },
  high: { label: 'Alta', color: 'bg-warning/20 text-warning', order: 3 },
  urgent: { label: 'Urgente', color: 'bg-destructive/20 text-destructive', order: 4 },
};

interface UserEngagementData {
  id: string;
  full_name: string;
  email: string | null;
  user_id: string;
  created_at: string;
  has_seen_onboarding: boolean;
  total_patients: number;
  total_meal_plans: number;
  total_appointments: number;
  last_activity: string | null;
}

const statusConfig = {
  open: { label: 'Pendente', variant: 'secondary' as const },
  answered: { label: 'Respondido', variant: 'default' as const },
  closed: { label: 'Resolvido', variant: 'outline' as const },
};

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [engagementData, setEngagementData] = useState<UserEngagementData[]>([]);
  const [loadingEngagement, setLoadingEngagement] = useState(false);
  const [sendingEmailTo, setSendingEmailTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pendingTicketsCount = tickets.filter(t => t.status === 'open').length;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkMasterAdminStatus();
    }
  }, [user, authLoading, navigate]);

  const checkMasterAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_current_user_master_admin');
      if (error) throw error;
      
      if (data) {
        setIsMasterAdmin(true);
        fetchData();
      } else {
        checkAdminStatus();
      }
    } catch (error) {
      console.error('Error checking master admin status:', error);
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_current_user_admin');
      if (error) throw error;
      
      if (data) {
        setIsMasterAdmin(true);
        fetchData();
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/dashboard');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchNutritionists(), fetchTickets(), fetchEngagementData()]);
    setLoading(false);
  };

  const fetchEngagementData = async () => {
    setLoadingEngagement(true);
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, user_id, created_at, has_seen_onboarding')
        .eq('is_admin', false)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch emails from edge function
      const userIds = (profiles || []).map(p => p.user_id);
      let emailMap: Record<string, string | null> = {};
      
      if (userIds.length > 0) {
        try {
          console.log('Fetching emails for user IDs:', userIds);
          const { data: emailData, error: emailError } = await supabase.functions.invoke('get-user-emails', {
            body: { user_ids: userIds },
          });
          
          console.log('Email fetch response:', emailData, emailError);
          
          if (emailError) {
            console.error('Error fetching emails:', emailError);
          } else if (emailData?.success) {
            emailMap = emailData.emails || {};
          }
        } catch (e) {
          console.error('Exception fetching emails:', e);
        }
      }

      const engagementPromises = (profiles || []).map(async (profile) => {
        const [patientsRes, mealPlansRes, appointmentsRes] = await Promise.all([
          supabase.from('patients').select('id, created_at').eq('nutritionist_id', profile.id),
          supabase.from('meal_plans').select('id, created_at').eq('nutritionist_id', profile.id),
          supabase.from('appointments').select('id, created_at').eq('nutritionist_id', profile.id),
        ]);

        const allDates = [
          ...(patientsRes.data || []).map(p => p.created_at),
          ...(mealPlansRes.data || []).map(m => m.created_at),
          ...(appointmentsRes.data || []).map(a => a.created_at),
        ].filter(Boolean);

        const lastActivity = allDates.length > 0 
          ? allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
          : null;

        return {
          id: profile.id,
          full_name: profile.full_name,
          email: emailMap[profile.user_id] || null,
          user_id: profile.user_id,
          created_at: profile.created_at,
          has_seen_onboarding: profile.has_seen_onboarding,
          total_patients: patientsRes.data?.length || 0,
          total_meal_plans: mealPlansRes.data?.length || 0,
          total_appointments: appointmentsRes.data?.length || 0,
          last_activity: lastActivity,
        };
      });

      const results = await Promise.all(engagementPromises);
      setEngagementData(results);
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      toast.error('Erro ao carregar dados de engajamento');
    } finally {
      setLoadingEngagement(false);
    }
  };

  const handleSendNudgeEmail = async (user: UserEngagementData) => {
    if (!user.email) {
      toast.error('Usuário não possui email cadastrado');
      return;
    }

    setSendingEmailTo(user.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-nudge-email', {
        body: { name: user.full_name, email: user.email },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('E-mail enviado com sucesso!');
      } else {
        throw new Error(data?.error || 'Erro ao enviar email');
      }
    } catch (error: any) {
      console.error('Error sending nudge email:', error);
      toast.error(error.message || 'Erro ao enviar e-mail');
    } finally {
      setSendingEmailTo(null);
    }
  };

  const fetchNutritionists = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, user_id, crn, phone, created_at, is_active, is_admin, account_status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNutritionists(data || []);
    } catch (error) {
      console.error('Error fetching nutritionists:', error);
      toast.error('Erro ao carregar nutricionistas');
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          id, ticket_number, subject, message, status, priority, created_at, attachment_url,
          nutritionist:profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedTickets = (data || []).map(ticket => ({
        ...ticket,
        nutritionist: Array.isArray(ticket.nutritionist) ? ticket.nutritionist[0] : ticket.nutritionist
      }));
      
      formattedTickets.sort((a, b) => {
        const priorityA = priorityConfig[a.priority as keyof typeof priorityConfig]?.order || 0;
        const priorityB = priorityConfig[b.priority as keyof typeof priorityConfig]?.order || 0;
        if (priorityB !== priorityA) return priorityB - priorityA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setTickets(formattedTickets as SupportTicket[]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('id, sender_type, message, created_at')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const getLicenseStatus = (createdAt: string) => {
    const daysSinceCreation = differenceInDays(new Date(), new Date(createdAt));
    
    if (daysSinceCreation <= 33) {
      return {
        label: `Teste (${33 - daysSinceCreation} dias)`,
        variant: 'default' as const,
      };
    } else {
      return {
        label: 'Expirado',
        variant: 'destructive' as const,
      };
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
        prev.map(n =>
          n.id === nutritionistId ? { ...n, is_active: !currentStatus } : n
        )
      );

      toast.success(`Acesso ${!currentStatus ? 'ativado' : 'desativado'}`);
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setUpdating(null);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender_type: 'admin',
          message: newMessage.trim(),
        });

      if (error) throw error;

      await supabase
        .from('support_tickets')
        .update({ status: 'answered' })
        .eq('id', selectedTicket.id);

      setSelectedTicket({ ...selectedTicket, status: 'answered' });
      setNewMessage('');
      fetchMessages(selectedTicket.id);
      fetchTickets();
      toast.success('Resposta enviada!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast.success('Ticket finalizado');
      setSelectedTicket({ ...selectedTicket, status: 'closed' });
      fetchTickets();
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('Erro ao fechar ticket');
    }
  };

  const filteredNutritionists = nutritionists.filter(n => {
    const term = searchTerm.toLowerCase();
    return (
      n.full_name.toLowerCase().includes(term) ||
      (n.crn && n.crn.toLowerCase().includes(term)) ||
      (n.phone && n.phone.includes(term))
    );
  });

  const ticketVolumeData = useMemo(() => {
    const days = 14;
    const data = [];
    const today = startOfDay(new Date());
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'dd/MM');
      
      const count = tickets.filter(ticket => {
        const ticketDate = format(startOfDay(new Date(ticket.created_at)), 'yyyy-MM-dd');
        return ticketDate === dateStr;
      }).length;
      
      data.push({ date: displayDate, count });
    }
    
    return data;
  }, [tickets]);

  // Analytics computed data
  const analyticsStats = useMemo(() => {
    const activeUsers = engagementData.filter(u => u.total_patients > 0 || u.total_meal_plans > 0).length;
    const inactiveUsers = engagementData.length - activeUsers;
    const onboardedUsers = engagementData.filter(u => u.has_seen_onboarding).length;
    const totalPatients = engagementData.reduce((sum, u) => sum + u.total_patients, 0);
    const totalMealPlans = engagementData.reduce((sum, u) => sum + u.total_meal_plans, 0);
    const totalAppointments = engagementData.reduce((sum, u) => sum + u.total_appointments, 0);
    
    return {
      activeUsers,
      inactiveUsers,
      onboardedUsers,
      totalPatients,
      totalMealPlans,
      totalAppointments,
      engagementRate: engagementData.length > 0 ? Math.round((activeUsers / engagementData.length) * 100) : 0,
    };
  }, [engagementData]);

  const registrationTrendData = useMemo(() => {
    const days = 30;
    const data = [];
    const today = startOfDay(new Date());
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'dd/MM');
      
      const registrations = nutritionists.filter(n => {
        const regDate = format(startOfDay(new Date(n.created_at)), 'yyyy-MM-dd');
        return regDate === dateStr;
      }).length;
      
      data.push({ date: displayDate, registrations });
    }
    
    return data;
  }, [nutritionists]);

  const engagementPieData = useMemo(() => {
    return [
      { name: 'Ativos', value: analyticsStats.activeUsers, color: 'hsl(var(--success))' },
      { name: 'Inativos', value: analyticsStats.inactiveUsers, color: 'hsl(var(--destructive))' },
    ];
  }, [analyticsStats]);

  const activityDistributionData = useMemo(() => {
    return [
      { name: 'Pacientes', value: analyticsStats.totalPatients, fill: 'hsl(var(--primary))' },
      { name: 'Planos', value: analyticsStats.totalMealPlans, fill: 'hsl(var(--info))' },
      { name: 'Consultas', value: analyticsStats.totalAppointments, fill: 'hsl(var(--warning))' },
    ];
  }, [analyticsStats]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!isMasterAdmin) return null;

  const activeCount = nutritionists.filter(n => n.is_active).length;
  const trialCount = nutritionists.filter(n => differenceInDays(new Date(), new Date(n.created_at)) <= 33).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="w-10 h-10 object-contain" />
            <div>
              <NeonText as="span" color="primary" className="font-bold text-xl">
                NutriFlow
              </NeonText>
              <Badge variant="secondary" className="ml-2 text-xs bg-primary/20 text-primary border-primary/30">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {pendingTicketsCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {pendingTicketsCount}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="border-border/50">
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="nutritionists" className="space-y-6">
          <TabsList className="glass border border-border/50 p-1">
            <TabsTrigger value="nutritionists" className="gap-2 data-[state=active]:bg-primary/20">
              <Users className="w-4 h-4" />
              Nutricionistas
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2 data-[state=active]:bg-primary/20 relative">
              <MessageSquare className="w-4 h-4" />
              Suporte
              {pendingTicketsCount > 0 && (
                <span className="ml-1 h-5 w-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
                  {pendingTicketsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-primary/20">
              <Activity className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="gap-2 data-[state=active]:bg-primary/20">
              <DollarSign className="w-4 h-4" />
              Financeiro
            </TabsTrigger>
          </TabsList>

          {/* Nutricionistas Tab */}
          <TabsContent value="nutritionists" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{nutritionists.length}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                    <p className="text-sm text-muted-foreground">Ativos</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{trialCount}</p>
                    <p className="text-sm text-muted-foreground">Em Teste</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{nutritionists.length - activeCount}</p>
                    <p className="text-sm text-muted-foreground">Inativos</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Search & Table */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <NeonText as="h2" color="primary" className="font-semibold">
                  Nutricionistas Registrados
                </NeonText>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Nome</TableHead>
                      <TableHead>CRN</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Licença</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNutritionists.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum nutricionista registrado'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredNutritionists.map((n) => {
                        const license = getLicenseStatus(n.created_at);
                        return (
                          <TableRow key={n.id} className="border-border/30">
                            <TableCell>
                              <div>
                                <p className="font-medium">{n.full_name}</p>
                                {n.phone && <p className="text-xs text-muted-foreground">{n.phone}</p>}
                              </div>
                            </TableCell>
                            <TableCell>{n.crn || '-'}</TableCell>
                            <TableCell>
                              {format(new Date(n.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={license.variant} className="text-xs">
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
                            <TableCell className="text-right">
                              <Switch
                                checked={n.is_active}
                                onCheckedChange={() => toggleActive(n.id, n.is_active)}
                                disabled={updating === n.id}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Tickets List */}
              <GlassCard className="lg:col-span-2 p-6">
                <NeonText as="h2" color="primary" className="font-semibold mb-4">
                  Tickets de Suporte
                </NeonText>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => {
                          setSelectedTicket(ticket);
                          fetchMessages(ticket.id);
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedTicket?.id === ticket.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border/30 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">#{ticket.ticket_number}</span>
                          <Badge className={priorityConfig[ticket.priority as keyof typeof priorityConfig]?.color}>
                            {priorityConfig[ticket.priority as keyof typeof priorityConfig]?.label}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-foreground">{ticket.subject}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{ticket.nutritionist?.full_name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(ticket.created_at), 'dd/MM HH:mm')}
                          </span>
                          <Badge variant={statusConfig[ticket.status as keyof typeof statusConfig]?.variant}>
                            {statusConfig[ticket.status as keyof typeof statusConfig]?.label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </GlassCard>

              {/* Chart */}
              <GlassCard className="p-6">
                <NeonText as="h3" color="primary" className="font-semibold mb-4">
                  Volume de Tickets (14 dias)
                </NeonText>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ticketVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{engagementData.length}</p>
                    <p className="text-sm text-muted-foreground">Novos (30 dias)</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{analyticsStats.activeUsers}</p>
                    <p className="text-sm text-muted-foreground">Engajados</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <UserX className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{analyticsStats.inactiveUsers}</p>
                    <p className="text-sm text-muted-foreground">Sem atividade</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{analyticsStats.engagementRate}%</p>
                    <p className="text-sm text-muted-foreground">Taxa Engajamento</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Registration Trend */}
              <GlassCard className="lg:col-span-2 p-6">
                <NeonText as="h3" color="primary" className="font-semibold mb-4">
                  Novos Cadastros (30 dias)
                </NeonText>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={registrationTrendData}>
                    <defs>
                      <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="registrations" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorReg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </GlassCard>

              {/* Engagement Pie */}
              <GlassCard className="p-6">
                <NeonText as="h3" color="primary" className="font-semibold mb-4">
                  Engajamento
                </NeonText>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={engagementPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {engagementPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend 
                      formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </GlassCard>
            </div>

            {/* Activity Stats */}
            <div className="grid lg:grid-cols-3 gap-6">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{analyticsStats.totalPatients}</p>
                    <p className="text-sm text-muted-foreground">Pacientes Cadastrados</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{analyticsStats.totalMealPlans}</p>
                    <p className="text-sm text-muted-foreground">Planos Alimentares</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{analyticsStats.totalAppointments}</p>
                    <p className="text-sm text-muted-foreground">Consultas Agendadas</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* User Engagement Table */}
            <GlassCard className="p-6">
              <NeonText as="h3" color="primary" className="font-semibold mb-4">
                Detalhamento de Engajamento (Últimos 30 dias)
              </NeonText>
              {loadingEngagement ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Nutricionista</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cadastro</TableHead>
                        <TableHead>Onboarding</TableHead>
                        <TableHead className="text-center">Pacientes</TableHead>
                        <TableHead className="text-center">Planos</TableHead>
                        <TableHead className="text-center">Consultas</TableHead>
                        <TableHead>Última Atividade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {engagementData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                            Nenhum usuário cadastrado nos últimos 30 dias
                          </TableCell>
                        </TableRow>
                      ) : (
                        engagementData.map((user) => {
                          const isActive = user.total_patients > 0 || user.total_meal_plans > 0;
                          return (
                            <TableRow key={user.id} className="border-border/30">
                              <TableCell className="font-medium">{user.full_name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {user.email || '-'}
                              </TableCell>
                              <TableCell>
                                {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                              </TableCell>
                              <TableCell>
                                {user.has_seen_onboarding ? (
                                  <CheckCircle className="w-4 h-4 text-success" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-muted-foreground" />
                                )}
                              </TableCell>
                              <TableCell className="text-center">{user.total_patients}</TableCell>
                              <TableCell className="text-center">{user.total_meal_plans}</TableCell>
                              <TableCell className="text-center">{user.total_appointments}</TableCell>
                              <TableCell>
                                {user.last_activity 
                                  ? format(new Date(user.last_activity), 'dd/MM HH:mm', { locale: ptBR })
                                  : '-'
                                }
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={isActive ? 'default' : 'secondary'}
                                  className={isActive ? 'bg-success/20 text-success border-success/30' : 'bg-destructive/20 text-destructive border-destructive/30'}
                                >
                                  {isActive ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {!isActive && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSendNudgeEmail(user)}
                                    disabled={sendingEmailTo === user.id}
                                    className="border-primary/30 text-primary hover:bg-primary/10"
                                  >
                                    {sendingEmailTo === user.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Mail className="w-4 h-4 mr-1" />
                                        Enviar Alerta
                                      </>
                                    )}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </GlassCard>
          </TabsContent>

          {/* Financeiro Tab */}
          <TabsContent value="financeiro">
            <GlassCard className="p-12 text-center">
              <DollarSign className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <NeonText as="h3" color="primary" className="text-xl font-semibold mb-2">
                Módulo Financeiro
              </NeonText>
              <p className="text-muted-foreground">
                Em desenvolvimento. Análise global de receitas, assinaturas e métricas financeiras.
              </p>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </main>

      {/* Ticket Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="glass border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Ticket #{selectedTicket?.ticket_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium text-foreground">{selectedTicket.subject}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedTicket.message}</p>
                {selectedTicket.attachment_url && (
                  <a 
                    href={selectedTicket.attachment_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary mt-2"
                  >
                    <Paperclip className="w-4 h-4" />
                    Ver anexo
                  </a>
                )}
              </div>

              <ScrollArea className="h-[200px] border rounded-lg p-3 border-border/30">
                {loadingMessages ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.sender_type === 'admin'
                            ? 'bg-primary/20 ml-4'
                            : 'bg-muted/50 mr-4'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(msg.created_at), 'dd/MM HH:mm')}
                        </p>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {selectedTicket.status !== 'closed' && (
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua resposta..."
                    className="flex-1 bg-background/50 border-border/50"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {selectedTicket.status !== 'closed' && (
                  <Button variant="outline" onClick={handleCloseTicket} className="border-success/30 text-success">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Resolvido
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
