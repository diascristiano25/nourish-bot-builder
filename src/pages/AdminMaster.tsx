import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Loader2, Shield, Users, Clock, CheckCircle, XCircle, MessageSquare, 
  Send, Lock, Bell, AlertCircle, Filter, Headphones
} from 'lucide-react';
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

interface SupportTicket {
  id: string;
  ticket_number: number;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
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

const MASTER_ADMIN_EMAIL = 'admin@flowtechgroup.com.br';

const priorityConfig = {
  low: { label: 'Baixa', color: 'bg-slate-500', order: 1 },
  normal: { label: 'Normal', color: 'bg-blue-500', order: 2 },
  high: { label: 'Alta', color: 'bg-orange-500', order: 3 },
  urgent: { label: 'Urgente', color: 'bg-red-500', order: 4 },
};

const statusConfig = {
  open: { label: 'Pendente', variant: 'secondary' as const },
  answered: { label: 'Respondido', variant: 'default' as const },
  closed: { label: 'Resolvido', variant: 'outline' as const },
};

export default function AdminMaster() {
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
  const [closingTicket, setClosingTicket] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pendingTicketsCount = tickets.filter(t => t.status === 'open').length;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      if (user.email === MASTER_ADMIN_EMAIL) {
        setIsMasterAdmin(true);
        fetchData();
      } else {
        checkAdminStatus();
      }
    }
  }, [user, authLoading, navigate]);

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
    await Promise.all([fetchNutritionists(), fetchTickets()]);
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

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          id,
          ticket_number,
          subject,
          message,
          status,
          priority,
          created_at,
          nutritionist:nutritionists(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedTickets = (data || []).map(ticket => ({
        ...ticket,
        nutritionist: Array.isArray(ticket.nutritionist) ? ticket.nutritionist[0] : ticket.nutritionist
      }));
      
      // Sort by priority (urgent first) then by date
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

    setClosingTicket(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast.success('Ticket finalizado com sucesso');
      setSelectedTicket({ ...selectedTicket, status: 'closed' });
      fetchTickets();
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('Erro ao fechar ticket');
    } finally {
      setClosingTicket(false);
    }
  };

  const openTicketConversation = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchMessages(ticket.id);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="secondary">{status}</Badge>;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;
    return (
      <div className="flex items-center gap-1">
        <span className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className="text-xs text-muted-foreground">{config.label}</span>
      </div>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    return true;
  });

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
      {/* Header with Notification Badge */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
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
          <div className="flex items-center gap-4">
            {/* Notification Badge */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {pendingTicketsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                    {pendingTicketsCount}
                  </span>
                )}
              </Button>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
          <p className="text-muted-foreground">
            Gerencie licenças, acessos e suporte dos nutricionistas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
                  <p className="text-sm text-muted-foreground">Em Teste</p>
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
                  <p className="text-sm text-muted-foreground">Expirados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={pendingTicketsCount > 0 ? 'ring-2 ring-red-500 ring-offset-2' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${pendingTicketsCount > 0 ? 'bg-red-500/20' : 'bg-orange-500/10'}`}>
                  <Headphones className={`w-6 h-6 ${pendingTicketsCount > 0 ? 'text-red-500' : 'text-orange-500'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingTicketsCount}</p>
                  <p className="text-sm text-muted-foreground">Tickets Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tickets" className="relative">
              Central de Chamados
              {pendingTicketsCount > 0 && (
                <span className="ml-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingTicketsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="nutritionists">Gestão de Nutricionistas</TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-primary" />
                    Central de Chamados
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="open">Pendentes</SelectItem>
                        <SelectItem value="answered">Respondidos</SelectItem>
                        <SelectItem value="closed">Resolvidos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[140px]">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Ticket</TableHead>
                        <TableHead>Nutricionista</TableHead>
                        <TableHead>Assunto</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nenhum ticket encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTickets.map((ticket) => (
                          <TableRow 
                            key={ticket.id} 
                            className={ticket.status === 'open' && ticket.priority === 'urgent' ? 'bg-red-50' : ''}
                          >
                            <TableCell className="font-mono text-sm">
                              #{ticket.ticket_number}
                            </TableCell>
                            <TableCell className="font-medium">
                              {ticket.nutritionist?.full_name || 'N/A'}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {ticket.subject}
                            </TableCell>
                            <TableCell>
                              {getPriorityBadge(ticket.priority)}
                            </TableCell>
                            <TableCell>
                              {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(ticket.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant={ticket.status === 'open' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => openTicketConversation(ticket)}
                              >
                                {ticket.status === 'open' ? 'Responder' : 'Ver'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutritionists Tab */}
          <TabsContent value="nutritionists">
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
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>FlowTech Group - CNPJ: 46.684.547/0001-54</p>
          <p className="mt-1">Painel de Administração Master v2.0</p>
        </div>
      </main>

      {/* Ticket Conversation Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Ticket #{selectedTicket?.ticket_number}
              {selectedTicket && getStatusBadge(selectedTicket.status)}
              {selectedTicket && getPriorityBadge(selectedTicket.priority)}
            </DialogTitle>
            <DialogDescription>
              {selectedTicket?.nutritionist?.full_name || 'N/A'} - {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="flex flex-col flex-1 min-h-0">
              <ScrollArea className="flex-1 pr-4 max-h-[350px]">
                {loadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.sender_type === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">
                            {msg.sender_type === 'admin' ? 'Você (Suporte)' : 'Nutricionista'}
                          </p>
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_type === 'admin' 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {format(new Date(msg.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {selectedTicket.status !== 'closed' ? (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua resposta..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendingMessage}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCloseTicket}
                    disabled={closingTicket}
                  >
                    {closingTicket ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    Marcar como Resolvido
                  </Button>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                  Este ticket foi resolvido.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
