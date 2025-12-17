import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { HelpCircle, Loader2, Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SupportTicket {
  id: string;
  ticket_number: number;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface TicketMessage {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

interface SupportDialogProps {
  nutritionistId: string;
}

export function SupportDialog({ nutritionistId }: SupportDialogProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('id, ticket_number, subject, message, status, created_at')
        .eq('nutritionist_id', nutritionistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoadingTickets(false);
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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchTickets();
      setSelectedTicket(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      // Create ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          nutritionist_id: nutritionistId,
          subject: subject.trim(),
          message: message.trim(),
        })
        .select('id')
        .single();

      if (ticketError) throw ticketError;

      // Create first message
      const { error: messageError } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketData.id,
          sender_type: 'nutritionist',
          message: message.trim(),
        });

      if (messageError) throw messageError;

      toast.success('Ticket #' + ticketData.id.slice(0, 8) + ' criado com sucesso!');
      setSubject('');
      setMessage('');
      setActiveTab('history');
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Erro ao enviar ticket');
    } finally {
      setLoading(false);
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
          sender_type: 'nutritionist',
          message: newMessage.trim(),
        });

      if (error) throw error;

      // Update ticket status to open if it was answered
      if (selectedTicket.status === 'answered') {
        await supabase
          .from('support_tickets')
          .update({ status: 'open' })
          .eq('id', selectedTicket.id);
        
        setSelectedTicket({ ...selectedTicket, status: 'open' });
      }

      setNewMessage('');
      fetchMessages(selectedTicket.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSendingMessage(false);
    }
  };

  const openTicketConversation = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchMessages(ticket.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">Aguardando</Badge>;
      case 'answered':
        return <Badge className="bg-blue-500">Respondido</Badge>;
      case 'closed':
        return <Badge variant="outline">Fechado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Suporte NutriFlow
          </DialogTitle>
          <DialogDescription>
            {selectedTicket 
              ? `Ticket #${selectedTicket.ticket_number} - ${selectedTicket.subject}`
              : 'Envie sua dúvida ou solicitação para nossa equipe'
            }
          </DialogDescription>
        </DialogHeader>

        {selectedTicket ? (
          // Conversation View
          <div className="flex flex-col flex-1 min-h-0">
            <Button
              variant="ghost"
              size="sm"
              className="self-start mb-2"
              onClick={() => setSelectedTicket(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            
            <div className="flex items-center justify-between mb-2">
              {getStatusBadge(selectedTicket.status)}
              <span className="text-xs text-muted-foreground">
                Aberto em {format(new Date(selectedTicket.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>

            <ScrollArea className="flex-1 pr-4 max-h-[300px]">
              {loadingMessages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'nutritionist' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender_type === 'nutritionist'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_type === 'nutritionist' 
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

            {selectedTicket.status !== 'closed' && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Input
                  placeholder="Digite sua mensagem..."
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
            )}

            {selectedTicket.status === 'closed' && (
              <p className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                Este ticket foi fechado pelo suporte.
              </p>
            )}
          </div>
        ) : (
          // Tabs View
          <>
            <div className="flex gap-2 border-b border-border pb-2">
              <Button
                variant={activeTab === 'new' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('new')}
              >
                Novo Ticket
              </Button>
              <Button
                variant={activeTab === 'history' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('history')}
              >
                Meus Tickets ({tickets.length})
              </Button>
            </div>

            {activeTab === 'new' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    placeholder="Ex: Dúvida sobre geração de planos"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Descreva sua dúvida ou solicitação em detalhes..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Enviar Ticket
                </Button>
              </form>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3 pr-4">
                  {loadingTickets ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : tickets.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      Você ainda não enviou nenhum ticket
                    </p>
                  ) : (
                    tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border border-border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => openTicketConversation(ticket)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs text-muted-foreground">
                              #{ticket.ticket_number}
                            </span>
                            <h4 className="font-medium text-sm">{ticket.subject}</h4>
                          </div>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {ticket.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
