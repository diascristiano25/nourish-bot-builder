import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  HelpCircle, 
  Loader2, 
  Send, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Paperclip, 
  X, 
  CheckCircle2, 
  GraduationCap,
  Terminal,
  Bot,
  User,
  Sparkles,
  MessageCircle,
  Plus,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { restartOnboardingTour } from './OnboardingTour';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  user_id: string;
}

interface TicketMessage {
  id: string;
  is_staff_reply: boolean;
  description: string;
  created_at: string;
}

interface SupportDialogProps {
  nutritionistId: string;
  onRestartTour?: () => void;
}

const priorityConfig = {
  low: { label: 'Baixa', color: 'bg-slate-500', glow: 'shadow-slate-500/30' },
  normal: { label: 'Normal', color: 'bg-cyber-lime', glow: 'shadow-cyber-lime/30' },
  high: { label: 'Alta', color: 'bg-orange-500', glow: 'shadow-orange-500/30' },
  urgent: { label: 'Urgente', color: 'bg-red-500', glow: 'shadow-red-500/30' },
};

const statusConfig = {
  open: { 
    label: 'Processando', 
    description: 'Seu ticket está na fila de análise da IA.',
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30'
  },
  answered: { 
    label: 'Respondido', 
    description: 'A equipe FlowTech respondeu seu ticket.',
    icon: MessageCircle,
    color: 'text-cyber-lime',
    bgColor: 'bg-cyber-lime/10',
    borderColor: 'border-cyber-lime/30'
  },
  closed: { 
    label: 'Resolvido', 
    description: 'Este ticket foi finalizado com sucesso.',
    icon: CheckCircle,
    color: 'text-electric-violet',
    bgColor: 'bg-electric-violet/10',
    borderColor: 'border-electric-violet/30'
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
        .select('id, subject, description, status, priority, created_at, user_id')
        .eq('user_id', nutritionistId)
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
        .select('id, is_staff_reply, description, created_at')
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
          user_id: nutritionistId,
          subject: subject.trim(),
          description: message.trim(),
          priority,
          category: 'general'
        })
        .select('id')
        .single();

      if (ticketError) throw ticketError;

      const { error: messageError } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketData.id,
          is_staff_reply: false,
          description: message.trim(),
          user_id: nutritionistId,
        });

      if (messageError) throw messageError;

      setCreatedTicketNumber(null);
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
          is_staff_reply: 'nutritionist',
          description: newMessage.trim(),
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
      console.error('Error sending description:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSendingMessage(false);
    }
  };

  const openTicketConversation = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchMessages(ticket.id);
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
  };

  const getPriorityConfig = (priorityValue: string) => {
    return priorityConfig[priorityValue as keyof typeof priorityConfig] || priorityConfig.normal;
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
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative glass hover:bg-cyber-lime/10 hover:text-cyber-lime transition-all duration-300 group" 
          data-tour="support-button"
        >
          <Bot className="h-5 w-5 group-hover:animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-lime rounded-full animate-pulse" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 glass-strong border-white/10 overflow-hidden">
        {/* Terminal Header */}
        <div className="relative px-6 py-4 border-b border-white/10 bg-gradient-to-r from-cyber-lime/5 via-transparent to-electric-violet/5">
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] animate-scan opacity-20" />
          </div>
          
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-lime to-electric-violet flex items-center justify-center">
                <Terminal className="w-5 h-5 text-background" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyber-lime rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent">
                  AI Concierge
                </span>
                <Sparkles className="w-4 h-4 text-cyber-lime animate-pulse" />
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedTicket
                  ? `${selectedTicket.subject}`
                  : 'Central de Suporte Inteligente'
                }
              </p>
            </div>
          </div>
          
          {/* Terminal dots */}
          <div className="absolute top-4 right-6 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {selectedTicket ? (
            /* Conversation View */
            <div className="flex flex-col h-full">
              {/* Back Button & Status */}
              <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-cyber-lime gap-2"
                  onClick={() => setSelectedTicket(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-mono text-xs">cd ..</span>
                </Button>
                
                {/* Status Badge */}
                {(() => {
                  const config = getStatusConfig(selectedTicket.status);
                  const Icon = config.icon;
                  return (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.borderColor} border`}>
                      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Messages Timeline */}
              <ScrollArea className="flex-1 px-6 py-4">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="relative">
                      <Loader2 className="h-8 w-8 animate-spin text-cyber-lime" />
                      <div className="absolute inset-0 blur-xl bg-cyber-lime/30 animate-pulse" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">Carregando histórico...</span>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-cyber-lime/50 via-electric-violet/50 to-transparent" />
                    
                    <div className="space-y-6">
                      {messages.map((msg, index) => {
                        const isUser = msg.is_staff_reply === 'nutritionist';
                        return (
                          <div key={msg.id} className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                            {/* Timeline dot */}
                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              isUser 
                                ? 'bg-electric-violet/20 border border-electric-violet/50' 
                                : 'bg-cyber-lime/20 border border-cyber-lime/50'
                            }`}>
                              {isUser ? (
                                <User className="w-4 h-4 text-electric-violet" />
                              ) : (
                                <Bot className="w-4 h-4 text-cyber-lime" />
                              )}
                            </div>
                            
                            {/* Message bubble */}
                            <div className={`flex-1 glass rounded-xl p-4 border ${
                              isUser 
                                ? 'border-electric-violet/20 bg-electric-violet/5' 
                                : 'border-cyber-lime/20 bg-cyber-lime/5'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-semibold ${isUser ? 'text-electric-violet' : 'text-cyber-lime'}`}>
                                  {isUser ? 'Você' : 'AI Concierge'}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {format(new Date(msg.created_at), "dd/MM HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                              <p className="text-sm text-foreground/90 leading-relaxed">{msg.description}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              {selectedTicket.status !== 'closed' ? (
                <div className="p-4 border-t border-white/10 bg-background/50">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sendingMessage}
                        className="glass border-white/10 focus:border-cyber-lime/50 pr-12 font-mono text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">
                        ↵ enviar
                      </span>
                    </div>
                    <Button 
                      size="icon" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-gradient-to-r from-cyber-lime to-electric-violet hover:opacity-90 text-background shrink-0"
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-white/10 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-violet/10 border border-electric-violet/30">
                    <CheckCircle className="w-4 h-4 text-electric-violet" />
                    <span className="text-sm text-electric-violet">Ticket resolvido</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Main View - Tabs */
            <div className="flex flex-col h-full">
              {/* Tab Navigation */}
              <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2">
                <button
                  onClick={() => { setActiveTab('new'); setTicketCreated(false); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs transition-all duration-300 ${
                    activeTab === 'new' 
                      ? 'bg-cyber-lime/20 text-cyber-lime border border-cyber-lime/30' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  NOVO_TICKET
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs transition-all duration-300 ${
                    activeTab === 'history' 
                      ? 'bg-electric-violet/20 text-electric-violet border border-electric-violet/30' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  HISTORICO [{tickets.length}]
                </button>
              </div>

              <ScrollArea className="flex-1 px-6 py-4">
                {activeTab === 'new' ? (
                  ticketCreated ? (
                    /* Success State */
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-scale-in">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyber-lime/20 to-electric-violet/20 flex items-center justify-center border border-cyber-lime/30">
                          <CheckCircle2 className="w-10 h-10 text-cyber-lime" />
                        </div>
                        <div className="absolute inset-0 blur-2xl bg-cyber-lime/20 -z-10" />
                      </div>
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent mb-2">
                        Ticket Enviado!
                      </h3>
                      <p className="text-sm text-muted-foreground font-mono mb-6">
                        TICKET_#{createdTicketNumber} criado com sucesso
                      </p>
                      <div className="glass rounded-xl p-4 border border-white/10 mb-6 max-w-sm">
                        <p className="text-sm text-muted-foreground">
                          O AI Concierge responderá em até <span className="text-cyber-lime font-semibold">24 horas úteis</span>.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={handleNewTicket}
                          className="glass border-white/10 hover:border-cyber-lime/50 hover:text-cyber-lime"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Ticket
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('history')}
                          className="bg-gradient-to-r from-cyber-lime to-electric-violet hover:opacity-90 text-background"
                        >
                          Ver Histórico
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* New Ticket Form */
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                          Assunto
                        </Label>
                        <Input
                          id="subject"
                          placeholder="Ex: Dúvida sobre geração de planos"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          disabled={loading}
                          className="glass border-white/10 focus:border-cyber-lime/50 font-mono"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                          Prioridade
                        </Label>
                        <Select value={priority} onValueChange={setPriority} disabled={loading}>
                          <SelectTrigger className="glass border-white/10 focus:border-cyber-lime/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-strong border-white/10">
                            {Object.entries(priorityConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key} className="focus:bg-white/10">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${config.color}`} />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                          Mensagem
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Descreva sua dúvida ou solicitação em detalhes..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          disabled={loading}
                          rows={4}
                          className="glass border-white/10 focus:border-cyber-lime/50 resize-none"
                        />
                      </div>

                      {/* Attachment Section */}
                      <div className="space-y-2">
                        <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                          Anexo (opcional)
                        </Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        {attachment ? (
                          <div className="flex items-center gap-3 p-3 glass rounded-lg border border-cyber-lime/30">
                            <Paperclip className="w-4 h-4 text-cyber-lime" />
                            <span className="text-sm flex-1 truncate font-mono">{attachment.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-red-400"
                              onClick={() => setAttachment(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full glass border-white/10 hover:border-cyber-lime/50 hover:text-cyber-lime"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="w-4 h-4 mr-2" />
                            Anexar print ou arquivo
                          </Button>
                        )}
                        <p className="text-[10px] font-mono text-muted-foreground">
                          Formatos: imagens, PDF • Máx: 5MB
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-cyber-lime to-electric-violet hover:opacity-90 text-background font-semibold h-12"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {uploadingAttachment ? 'Enviando anexo...' : 'Processando...'}
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
                  /* Ticket History - Timeline Style */
                  <div>
                    {loadingTickets ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-cyber-lime" />
                        <span className="text-xs font-mono text-muted-foreground">Carregando tickets...</span>
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 border border-border">
                          <MessageCircle className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Nenhum ticket encontrado</p>
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab('new')}
                          className="glass border-border hover:border-cyber-lime/50 hover:text-cyber-lime"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Criar primeiro ticket
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[18px] top-4 bottom-4 w-px bg-gradient-to-b from-cyber-lime/50 via-electric-violet/30 to-transparent" />
                        
                        <div className="space-y-3">
                          {tickets.map((ticket, index) => {
                            const statusCfg = getStatusConfig(ticket.status);
                            const priorityCfg = getPriorityConfig(ticket.priority);
                            const StatusIcon = statusCfg.icon;
                            
                            return (
                              <div 
                                key={ticket.id}
                                className="relative flex gap-4 cursor-pointer group animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => openTicketConversation(ticket)}
                              >
                                {/* Timeline dot */}
                                <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${statusCfg.bgColor} border ${statusCfg.borderColor} group-hover:scale-110`}>
                                  <StatusIcon className={`w-4 h-4 ${statusCfg.color}`} />
                                </div>
                                
                                {/* Card */}
                                <div className="flex-1 glass rounded-xl p-4 border border-white/10 group-hover:border-cyber-lime/30 transition-all duration-300">
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`w-2 h-2 rounded-full ${priorityCfg.color}`} />
                                      <h4 className="text-sm font-medium text-foreground">{ticket.subject}</h4>
                                    </div>
                                    <div className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded ${statusCfg.bgColor} ${statusCfg.color}`}>
                                      {statusCfg.label}
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                    {ticket.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      {format(new Date(ticket.created_at), "dd/MM/yyyy • HH:mm", { locale: ptBR })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Footer - Restart Tour */}
              <div className="px-6 py-4 border-t border-white/5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-muted-foreground hover:text-cyber-lime hover:bg-cyber-lime/10 font-mono text-xs"
                  onClick={() => {
                    restartOnboardingTour(nutritionistId);
                    setOpen(false);
                    onRestartTour?.();
                    toast.success('Tour reiniciado! Recarregue a página para começar.');
                    window.location.reload();
                  }}
                >
                  <GraduationCap className="w-4 h-4" />
                  REINICIAR_TOUR_ONBOARDING
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
