import { useEffect, useState, useRef, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Loader2, Shield, Users, Clock, CheckCircle, XCircle, MessageSquare, 
  Send, Bell, Search, DollarSign, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
    setLoading(true);
    await Promise.all([fetchNutritionists(), fetchTickets()]);
    setLoading(false);
  };

  const fetchNutritionists = async () => {
    try {
      const { data, error } = await supabase
        .from('nutritionists')
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
          id, ticket_number, subject, message, status, priority, created_at,
          nutritionist:nutritionists(full_name)
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
    
    if (daysSinceCreation <= 60) {
      return {
        label: `Teste (${60 - daysSinceCreation} dias)`,
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
        .from('nutritionists')
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

  // Filtered nutritionists by search
  const filteredNutritionists = nutritionists.filter(n => {
    const term = searchTerm.toLowerCase();
    return (
      n.full_name.toLowerCase().includes(term) ||
      (n.crn && n.crn.toLowerCase().includes(term)) ||
      (n.phone && n.phone.includes(term))
    );
  });

  // Get patient count for each nutritionist (simplified - would need separate query in real app)
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isMasterAdmin) return null;

  const activeCount = nutritionists.filter(n => n.is_active).length;
  const trialCount = nutritionists.filter(n => differenceInDays(new Date(), new Date(n.created_at)) <= 60).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="w-10 h-10 object-contain" />
            <div>
              <span className="font-bold text-xl">NutriFlow</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {pendingTicketsCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {pendingTicketsCount}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="nutritionists" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 h-auto">
            <TabsTrigger value="nutritionists" className="gap-2 px-4 py-2">
              <Users className="w-4 h-4" />
              Nutricionistas
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2 px-4 py-2 relative">
              <MessageSquare className="w-4 h-4" />
              Suporte/Tickets
              {pendingTicketsCount > 0 && (
                <span className="ml-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingTicketsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="gap-2 px-4 py-2">
              <DollarSign className="w-4 h-4" />
              Financeiro Global
            </TabsTrigger>
          </TabsList>

          {/* Nutricionistas Tab */}
          <TabsContent value="nutritionists" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{nutritionists.length}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
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
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{nutritionists.length - activeCount}</p>
                      <p className="text-sm text-muted-foreground">Inativos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search & Table */}
            <Card>
              <CardHeader>
                <CardTitle>Nutricionistas Registrados</CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, CRN ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                            <TableRow key={n.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {n.full_name}
                                  {n.is_admin && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{n.crn || '-'}</TableCell>
                              <TableCell>{format(new Date(n.created_at), "dd/MM/yyyy")}</TableCell>
                              <TableCell>
                                <Badge variant={license.variant}>{license.label}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={n.is_active ? 'default' : 'destructive'}>
                                  {n.is_active ? 'Ativo' : 'Suspenso'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {updating === n.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                                ) : (
                                  <Switch
                                    checked={n.is_active}
                                    onCheckedChange={() => toggleActive(n.id, n.is_active)}
                                    disabled={n.is_admin}
                                  />
                                )}
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

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Central de Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Ticket List */}
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-4">
                      {tickets.length} tickets • {pendingTicketsCount} pendentes
                    </p>
                    <ScrollArea className="h-[500px] pr-4">
                      {tickets.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">Nenhum ticket</p>
                      ) : (
                        <div className="space-y-2">
                          {tickets.map((ticket) => (
                            <div
                              key={ticket.id}
                              onClick={() => {
                                setSelectedTicket(ticket);
                                fetchMessages(ticket.id);
                              }}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedTicket?.id === ticket.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">
                                  #{ticket.ticket_number}
                                </span>
                                <Badge variant={statusConfig[ticket.status as keyof typeof statusConfig]?.variant || 'secondary'}>
                                  {statusConfig[ticket.status as keyof typeof statusConfig]?.label || ticket.status}
                                </Badge>
                              </div>
                              <p className="font-medium text-sm">{ticket.subject}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {ticket.nutritionist?.full_name} • {format(new Date(ticket.created_at), "dd/MM HH:mm")}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Conversation */}
                  <div className="border rounded-lg p-4">
                    {selectedTicket ? (
                      <div className="flex flex-col h-[500px]">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b">
                          <div>
                            <p className="font-medium">{selectedTicket.subject}</p>
                            <p className="text-xs text-muted-foreground">
                              #{selectedTicket.ticket_number} • {selectedTicket.nutritionist?.full_name}
                            </p>
                          </div>
                          {selectedTicket.status !== 'closed' && (
                            <Button variant="outline" size="sm" onClick={handleCloseTicket}>
                              Finalizar
                            </Button>
                          )}
                        </div>

                        <ScrollArea className="flex-1 pr-4">
                          {loadingMessages ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {messages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`p-3 rounded-lg max-w-[85%] ${
                                    msg.sender_type === 'admin'
                                      ? 'bg-primary text-primary-foreground ml-auto'
                                      : 'bg-muted'
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                  <p className={`text-xs mt-1 ${
                                    msg.sender_type === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  }`}>
                                    {format(new Date(msg.created_at), "HH:mm")}
                                  </p>
                                </div>
                              ))}
                              <div ref={messagesEndRef} />
                            </div>
                          )}
                        </ScrollArea>

                        {selectedTicket.status !== 'closed' && (
                          <div className="flex gap-2 mt-4 pt-3 border-t">
                            <Textarea
                              placeholder="Digite sua resposta..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              className="min-h-[60px]"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                            />
                            <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                              {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                        Selecione um ticket para ver a conversa
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financeiro Tab */}
          <TabsContent value="financeiro" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{nutritionists.length}</p>
                      <p className="text-sm text-muted-foreground">Membros Fundadores</p>
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
                      <p className="text-sm text-muted-foreground">Em período de teste</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">R$ 0</p>
                      <p className="text-sm text-muted-foreground">Receita (período teste)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Volume de Tickets (Últimos 14 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ticketVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                      <YAxis className="text-xs fill-muted-foreground" allowDecimals={false} />
                      <Tooltip 
                        formatter={(value: number) => [value, 'Tickets']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
