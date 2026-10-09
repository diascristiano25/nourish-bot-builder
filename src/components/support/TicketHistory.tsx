import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
}

interface TicketHistoryProps {
  userId: string;
}

export function TicketHistory({ userId }: TicketHistoryProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, [userId]);

  const fetchTickets = async () => {
    try {
      // First get the nutritionist_id
      const { data: nutritionistData, error: nutritionistError } = await supabase
        .from('nutritionists')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (nutritionistError) {
        throw nutritionistError;
      }

      // Then fetch tickets
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('nutritionist_id', nutritionistData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setTickets(data || []);
    } catch (error) {
      toast({
        title: 'Erro ao carregar tickets',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Ticket['status']) => {
    const variants: Record<Ticket['status'], { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
      open: { variant: 'secondary', label: 'Aberto' },
      in_progress: { variant: 'default', label: 'Em Andamento' },
      resolved: { variant: 'outline', label: 'Resolvido' },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={
        status === 'resolved' ? 'bg-[#518C5B] text-white' :
        status === 'in_progress' ? 'bg-[#C4764A] text-white' :
        'bg-slate-200 text-slate-700'
      }>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Carregando histórico...</p>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Nenhum ticket encontrado.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Histórico de Tickets</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">Data</th>
              <th className="text-left py-3 px-2">Assunto</th>
              <th className="text-left py-3 px-2">Status</th>
              <th className="text-left py-3 px-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b">
                <td className="py-3 px-2">{formatDate(ticket.created_at)}</td>
                <td className="py-3 px-2">{ticket.subject}</td>
                <td className="py-3 px-2">{getStatusBadge(ticket.status)}</td>
                <td className="py-3 px-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        Ver Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{ticket.subject}</DialogTitle>
                        <DialogDescription>
                          Criado em {formatDate(ticket.created_at)}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Sua Mensagem:</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {ticket.message}
                          </p>
                        </div>
                        {ticket.admin_response && (
                          <div>
                            <h4 className="font-semibold mb-2">Resposta:</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {ticket.admin_response}
                            </p>
                            {ticket.responded_at && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Respondido em {formatDate(ticket.responded_at)}
                              </p>
                            )}
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold mb-2">Status:</h4>
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
