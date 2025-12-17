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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { HelpCircle, Loader2, Send, MessageSquare, ArrowLeft, Clock, CheckCircle, Paperclip, X, CheckCircle2, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { restartOnboardingTour } from './OnboardingTour';

interface SupportTicket {
  id: string;
  ticket_number: number;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  attachment_url?: string;
}

interface TicketMessage {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

interface SupportDialogProps {
  nutritionistId: string;
  onRestartTour?: () => void;
}

const priorityConfig = {
  low: { label: 'Baixa', color: 'bg-slate-500' },
  normal: { label: 'Normal', color: 'bg-blue-500' },
  high: { label: 'Alta', color: 'bg-orange-500' },
  urgent: { label: 'Urgente', color: 'bg-red-500' },
};

const statusConfig = {
  open: { 
    label: 'Aguardando Análise', 
    description: 'Seu ticket foi recebido e será analisado em breve.',
    icon: Clock,
    color: 'text-yellow-600'
  },
  answered: { 
    label: 'Respondido', 
    description: 'A equipe FlowTech respondeu seu ticket.',
    icon: MessageSquare,
    color: 'text-blue-600'
  },
  closed: { 
    label: 'Resolvido', 
    description: 'Este ticket foi finalizado.',
    icon: CheckCircle,
    color: 'text-green-600'
  },
};

export function SupportDialog({ nutritionistId, onRestartTour }: SupportDialogProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('id, ticket_number, subject, message, status, priority, created_at, attachment_url')
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
      setTicketCreated(false);
      setCreatedTicketNumber(null);
    }
  };

  const uploadAttachment = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${nutritionistId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('ticket-attachments')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading attachment:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('ticket-attachments')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      let attachmentUrl: string | null = null;
      
      if (attachment) {
        setUploadingAttachment(true);
        attachmentUrl = await uploadAttachment(attachment);
        setUploadingAttachment(false);
      }

      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          nutritionist_id: nutritionistId,
          subject: subject.trim(),
          message: message.trim(),
          priority,
          attachment_url: attachmentUrl,
        })
        .select('id, ticket_number')
        .single();

      if (ticketError) throw ticketError;

      const { error: messageError } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketData.id,
          sender_type: 'nutritionist',
          message: message.trim(),
        });

      if (messageError) throw messageError;

      // Show success state
      setCreatedTicketNumber(ticketData.ticket_number);
      setTicketCreated(true);
      setSubject('');
      setMessage('');
      setPriority('normal');
      setAttachment(null);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Erro ao enviar ticket');
    } finally {
      setLoading(false);
      setUploadingAttachment(false);
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
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="secondary">{status}</Badge>;
    
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} border-current`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priorityValue: string) => {
    const config = priorityConfig[priorityValue as keyof typeof priorityConfig];
    if (!config) return null;
    return (
      <span className={`inline-block w-2 h-2 rounded-full ${config.color}`} title={config.label} />
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo: 5MB');
        return;
      }
      setAttachment(file);
    }
  };

  const handleNewTicket = () => {
    setTicketCreated(false);
    setCreatedTicketNumber(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-tour="support-button">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Suporte FlowTech
          </DialogTitle>
          <DialogDescription>
            {selectedTicket 
              ? `Ticket #${selectedTicket.ticket_number} - ${selectedTicket.subject}`
              : 'Envie sua dúvida ou solicitação para nossa equipe'
            }
          </DialogDescription>
        </DialogHeader>

        {selectedTicket ? (
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
            
            {/* Status Feedback Card */}
            <div className={`p-3 rounded-lg border mb-3 ${
              selectedTicket.status === 'open' ? 'bg-yellow-50 border-yellow-200' :
              selectedTicket.status === 'answered' ? 'bg-blue-50 border-blue-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge(selectedTicket.status)}
                {getPriorityBadge(selectedTicket.priority)}
              </div>
              <p className="text-xs text-muted-foreground">
                {statusConfig[selectedTicket.status as keyof typeof statusConfig]?.description}
              </p>
            </div>

            <ScrollArea className="flex-1 pr-4 max-h-[250px]">
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
                        <p className="text-xs font-medium mb-1">
                          {msg.sender_type === 'nutritionist' ? 'Você' : 'Suporte FlowTech'}
                        </p>
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
                Este ticket foi resolvido pelo suporte.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-2 border-b border-border pb-2">
              <Button
                variant={activeTab === 'new' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => { setActiveTab('new'); setTicketCreated(false); }}
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
              ticketCreated ? (
                // Success confirmation screen
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-700">Ticket enviado!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ticket #{createdTicketNumber} criado com sucesso
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    O time FlowTech responderá em até <strong>24 horas úteis</strong>.
                    Você será notificado quando houver uma resposta.
                  </p>
                  <div className="flex gap-2 justify-center pt-2">
                    <Button variant="outline" onClick={handleNewTicket}>
                      Novo Ticket
                    </Button>
                    <Button onClick={() => setActiveTab('history')}>
                      Ver Meus Tickets
                    </Button>
                  </div>
                </div>
              ) : (
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
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={priority} onValueChange={setPriority} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            Baixa
                          </div>
                        </SelectItem>
                        <SelectItem value="normal">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Normal
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                            Alta
                          </div>
                        </SelectItem>
                        <SelectItem value="urgent">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Urgente
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      placeholder="Descreva sua dúvida ou solicitação em detalhes..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={loading}
                      rows={4}
                    />
                  </div>

                  {/* Attachment Section */}
                  <div className="space-y-2">
                    <Label>Anexo (opcional)</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    {attachment ? (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm flex-1 truncate">{attachment.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setAttachment(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        Anexar print ou arquivo
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Formatos aceitos: imagens e PDF (máx. 5MB)
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {uploadingAttachment ? 'Enviando anexo...' : 'Enviando...'}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Ticket
                      </>
                    )}
                  </Button>
                </form>
              )
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
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(ticket.priority)}
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
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          {ticket.attachment_url && (
                            <Badge variant="outline" className="text-xs">
                              <Paperclip className="w-3 h-3 mr-1" />
                              Anexo
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
            
            {/* Restart Tour Button */}
            <Separator className="my-4" />
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-primary border-primary/30 hover:bg-primary/5"
                onClick={() => {
                  restartOnboardingTour(nutritionistId);
                  setOpen(false);
                  onRestartTour?.();
                  toast.success('Tour reiniciado! Recarregue a página para começar.');
                  // Reload page to start tour
                  window.location.reload();
                }}
              >
                <GraduationCap className="w-4 h-4" />
                Dúvidas? Reiniciar Tour de Treinamento
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
