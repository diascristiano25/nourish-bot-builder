import { useState } from 'react';
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
import { toast } from 'sonner';
import { HelpCircle, Loader2, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
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

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
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

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchTickets();
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
      const { error } = await supabase.from('support_tickets').insert({
        nutritionist_id: nutritionistId,
        subject: subject.trim(),
        message: message.trim(),
      });

      if (error) throw error;

      toast.success('Ticket enviado com sucesso! Responderemos em breve.');
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Suporte NutriFlow
          </DialogTitle>
          <DialogDescription>
            Envie sua dúvida ou solicitação para nossa equipe
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
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
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
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
                  className="border border-border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm">{ticket.subject}</h4>
                    <Badge
                      variant={ticket.status === 'open' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {ticket.status === 'open' ? 'Aguardando' : 'Respondido'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{ticket.message}</p>
                  <p className="text-xs text-muted-foreground">
                    Enviado em {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  
                  {ticket.admin_response && (
                    <div className="mt-2 pt-2 border-t border-border bg-muted/50 rounded p-2">
                      <p className="text-xs font-medium text-primary mb-1">Resposta do Suporte:</p>
                      <p className="text-xs">{ticket.admin_response}</p>
                      {ticket.responded_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Respondido em {format(new Date(ticket.responded_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
