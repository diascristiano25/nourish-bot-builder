import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, MessageCircle, User, Stethoscope } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender_type: 'patient' | 'nutritionist'; // Mapped from is_staff_reply for clarity
  created_at: string;
  is_read: boolean;
}

interface ChatWidgetProps {
  patientId: string;
  nutritionistId: string;
}

export function ChatWidget({ patientId, nutritionistId }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch messages on mount
  useEffect(() => {
    if (!patientId || !nutritionistId) return;
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`patient-chat-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          // REAL schema (verified via `supabase db query --linked`):
          // messages columns: patient_id, nutritionist_id, sender_type,
          // content, is_read, read_at, created_at.
          // KEY: uses `sender_type` ('patient'|'nutritionist'), NOT is_staff_reply.
          setMessages((prev) => [...prev, {
            id: newMsg.id,
            content: newMsg.content,
            sender_type: newMsg.sender_type === 'nutritionist' ? 'nutritionist' : 'patient',
            created_at: newMsg.created_at,
            is_read: newMsg.is_read,
          }]);

          // Mark as read if it's from nutritionist
          if (newMsg.sender_type === 'nutritionist') {
             markAsRead(newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId, nutritionistId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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

      // REAL schema (verified via `supabase db query --linked`):
      // messages uses `sender_type` ('patient'|'nutritionist'), NOT is_staff_reply.
      setMessages((data || []).map(m => ({
        id: m.id,
        content: m.content,
        sender_type: (m.sender_type === 'nutritionist' ? 'nutritionist' : 'patient') as 'patient' | 'nutritionist',
        created_at: m.created_at,
        is_read: m.is_read,
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar o histórico de conversa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      // REAL schema (verified via `supabase db query --linked`):
      // messages uses `sender_type` ('patient'|'nutritionist'), NOT is_staff_reply.
      const { error } = await supabase.from('messages').insert({
        patient_id: patientId,
        nutritionist_id: nutritionistId,
        content: newMessage.trim(),
        sender_type: 'patient',
        is_read: false,
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    return format(parseISO(dateStr), 'HH:mm', { locale: ptBR });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-emerald-100 bg-emerald-50/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-emerald-900">Meu Nutricionista</h3>
          <p className="text-xs text-emerald-600/70">Online agora</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-secondary/50" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
              <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">Nenhuma mensagem ainda</p>
              <p className="text-xs mt-1">Envie uma dúvida para seu nutricionista!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const isPatient = message.sender_type === 'patient';
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex w-full",
                      isPatient ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm",
                        isPatient
                          ? "bg-emerald-500 text-white rounded-br-none"
                          : "bg-card text-foreground border border-border rounded-bl-none"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <div className={cn(
                        "flex items-center gap-1 mt-1 text-[10px]",
                        isPatient ? "justify-end text-emerald-100" : "justify-start text-muted-foreground"
                      )}>
                        <span>{formatMessageTime(message.created_at)}</span>
                        {isPatient && message.is_read && (
                          <span className="ml-1">✓✓</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-emerald-100 bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-secondary border-border focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl h-12"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || sending}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 w-12 shadow-md shadow-emerald-200"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}