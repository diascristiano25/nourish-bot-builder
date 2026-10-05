import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client-custom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  MessageCircle, 
  Send, 
  Loader2,
  User,
  Stethoscope
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_type: 'patient' | 'nutritionist';
  is_read: boolean;
  created_at: string;
}

interface PatientChatProps {
  patientId: string;
  nutritionistId: string;
  nutritionistName?: string;
}

export function PatientChat({ patientId, nutritionistId, nutritionistName }: PatientChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && patientId && nutritionistId) {
      fetchMessages();
      markMessagesAsRead();
    }
  }, [isOpen, patientId, nutritionistId]);

  useEffect(() => {
    if (!patientId || !nutritionistId) return;

    // Subscribe to realtime messages
    const channel = supabase
      .channel('patient-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          
          if (newMsg.sender_type === 'nutritionist' && !isOpen) {
            setUnreadCount(prev => prev + 1);
          }
          
          scrollToBottom();
        }
      )
      .subscribe();

    // Fetch unread count on mount
    fetchUnreadCount();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId, nutritionistId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('patient_id', patientId)
        .eq('nutritionist_id', nutritionistId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'patient' | 'nutritionist'
      })));
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patientId)
        .eq('nutritionist_id', nutritionistId)
        .eq('sender_type', 'nutritionist')
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('patient_id', patientId)
        .eq('nutritionist_id', nutritionistId)
        .eq('sender_type', 'nutritionist')
        .eq('is_read', false);

      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          patient_id: patientId,
          nutritionist_id: nutritionistId,
          sender_type: 'patient',
          content: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/90 relative"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Falar com meu Nutricionista
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        <SheetHeader className="px-4 py-3 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground text-sm">
                {nutritionistName || 'Seu Nutricionista'}
              </p>
              <p className="text-xs text-muted-foreground font-normal">Online</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(85vh-130px)] px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
              <p className="text-xs text-muted-foreground mt-1">
                Envie uma mensagem para seu nutricionista
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender_type === 'patient' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5",
                      msg.sender_type === 'patient'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={cn(
                      "text-[10px] mt-1",
                      msg.sender_type === 'patient' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    )}>
                      {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border/50 safe-area-inset-bottom">
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 h-11 rounded-full bg-muted/50 border-border/50 px-4"
              disabled={sending}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="h-11 w-11 rounded-full"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
