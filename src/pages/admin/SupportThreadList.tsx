import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Search, Filter, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SupportTicket {
  id: string;
  ticket_number: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  nutritionist_id: string;
  profiles: {
    full_name: string;
  } | null;
}

type StatusFilter = 'all' | 'open' | 'answered' | 'closed';
type PriorityFilter = 'all' | 'urgent' | 'high' | 'normal' | 'low';

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgente', color: 'bg-destructive/20 text-destructive border-destructive/30' },
  high: { label: 'Alta', color: 'bg-warning/20 text-warning border-warning/30' },
  normal: { label: 'Normal', color: 'bg-info/20 text-info border-info/30' },
  low: { label: 'Baixa', color: 'bg-muted text-muted-foreground border-border' },
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Pendente', variant: 'destructive' },
  answered: { label: 'Respondido', variant: 'default' },
  closed: { label: 'Resolvido', variant: 'secondary' },
};

export default function SupportThreadList() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel('admin-support-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => fetchTickets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(t.ticket_number).includes(searchTerm);

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const openCount = tickets.filter(t => t.status === 'open').length;
  const urgentCount = tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Suporte"
          subtitle="Gerencie tickets de suporte dos nutricionistas"
          icon={<MessageSquare className="w-7 h-7 text-white" />}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Tickets Abertos', value: openCount, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
            { label: 'Urgentes', value: urgentCount, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
            { label: 'Total', value: tickets.length, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Filters & Table */}
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <NeonText as="h2" color="primary" className="font-semibold">
              Tickets de Suporte
            </NeonText>
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="open">Pendentes</SelectItem>
                  <SelectItem value="answered">Respondidos</SelectItem>
                  <SelectItem value="closed">Resolvidos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}>
                <SelectTrigger className="w-[140px]">
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
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ticket..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>#</TableHead>
                  <TableHead>Nutricionista</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aberto em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Nenhum ticket encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => {
                    const priority = priorityConfig[ticket.priority] || priorityConfig.normal;
                    const status = statusConfig[ticket.status] || statusConfig.open;
                    const hoursOpen = ticket.status === 'open' ? differenceInHours(new Date(), new Date(ticket.created_at)) : 0;

                    return (
                      <TableRow
                        key={ticket.id}
                        className="border-border/30 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/suporte/${ticket.id}`)}
                      >
                        <TableCell className="font-mono text-sm">#{ticket.ticket_number}</TableCell>
                        <TableCell className="font-medium">{ticket.profiles?.full_name || '-'}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{ticket.subject}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={priority.color}>
                            {priority.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={status.variant}>{status.label}</Badge>
                            {hoursOpen > 48 && ticket.status === 'open' && (
                              <Clock className="w-3 h-3 text-destructive" title={`${hoursOpen}h aberto`} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </GlassCard>
      </div>
    </AdminLayout>
  );
}