import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, CheckCircle, XCircle, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { logAdminAction } from '@/lib/admin-audit';

interface TicketMessage {
  id: string;
  ticket_id: string;
  is_staff_reply: boolean;
  description: string;
  created_at: string;
}

interface TicketDetail {
  id: string;
  ticket_number: number;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  nutritionist_id: string;
  profiles: { full_name: string; email: string | null } | null;
}

export default function SupportChatView() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ticketId) {
      fetchTicket(ticketId);
      fetchMessages(ticketId);
      subscribeToMessages(ticketId);
    }
    return () => {
      supabase.removeAllChannels();
    };
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTicket = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, profiles(full_name, email)')
        .eq('id', id)
        .single();
      if (error) throw error;
      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Erro ao carregar ticket');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = (id: string) => {
    const channel = supabase
      .channel(`support-chat-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_ticket_messages', filter: `ticket_id=eq.${id}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as TicketMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticketId) return;
    setSending(true);
    try {
      const { error } = await supabase.from('support_ticket_messages').insert({
        ticket_id: ticketId,
        is_staff_reply: true,
        description: newMessage.trim(),
      });
      if (error) throw error;

      // Update ticket status to answered if it was open
      if (ticket?.status === 'open') {
        await supabase.from('support_tickets').update({ status: 'answered' }).eq('id', ticketId);
        setTicket(prev => prev ? { ...prev, status: 'answered' } : null);
      }

      await logAdminAction('reply_support_ticket', 'support_ticket', ticketId);
      setNewMessage('');
      toast.success('Mensagem enviada');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticketId) return;
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', ticketId);
      if (error) throw error;
      setTicket(prev => prev ? { ...prev, status: 'closed' } : null);
      await logAdminAction('close_support_ticket', 'support_ticket', ticketId);
      toast.success('Ticket fechado');
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('Erro ao fechar ticket');
    }
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-destructive/20 text-destructive border-destructive/30',
    high: 'bg-warning/20 text-warning border-warning/30',
    normal: 'bg-info/20 text-info border-info/30',
    low: 'bg-muted text-muted-foreground border-border',
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center h-[calc(100vh-3rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!ticket) {
    return (
      <AdminLayout>
        <div className="p-6 text-center py-20">
          <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Ticket não encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/suporte')}>Voltar</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] p-4 gap-4">
        {/* Header */}
        <GlassCard className="p-4 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin/suporte')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground">#{ticket.ticket_number} — {ticket.subject}</h1>
                  <Badge variant="outline" className={priorityColors[ticket.priority] || ''}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant={ticket.status === 'open' ? 'destructive' : ticket.status === 'closed' ? 'secondary' : 'default'}>
                    {ticket.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {ticket.profiles?.full_name || 'Desconhecido'} • Aberto em {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
            {ticket.status !== 'closed' && (
              <Button variant="outline" onClick={handleCloseTicket} className="border-success/30 text-success hover:bg-success/10">
                <CheckCircle className="w-4 h-4 mr-2" />
                Fechar Ticket
              </Button>
            )}
          </div>
        </GlassCard>

        {/* Messages */}
        <ScrollArea className="flex-1 rounded-xl border border-border/50 bg-card/50 p-4">
          <div className="space-y-4 min-h-full flex flex-col justify-end">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma mensagem ainda</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.is_staff_reply === true
                      ? 'ml-auto bg-primary text-white rounded-br-md'
                      : 'mr-auto bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.description}</p>
                  <p className={`text-xs mt-2 ${msg.is_staff_reply === true ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {msg.is_staff_reply === true ? 'Admin' : ticket.profiles?.full_name || 'Nutricionista'} • {format(new Date(msg.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                  </p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        {ticket.status !== 'closed' ? (
          <GlassCard className="p-4 shrink-0">
            <div className="flex gap-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua resposta..."
                className="min-h-[60px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="bg-primary hover:bg-primary/90 self-end h-[60px] w-[60px] shrink-0"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-4 shrink-0 text-center text-muted-foreground">
            Este ticket está fechado. Reabra-o para responder.
          </GlassCard>
        )}
      </div>
    </AdminLayout>
  );
}