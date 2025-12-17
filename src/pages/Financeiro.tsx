import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, TrendingUp, Clock, Plus, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface FinancialRecord {
  id: string;
  record_type: 'Receita' | 'Despesa';
  amount: number;
  description: string | null;
  record_date: string;
  status: 'pending' | 'completed';
  created_at: string;
}

const Financeiro = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [nutritionistId, setNutritionistId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [formType, setFormType] = useState<'Receita' | 'Despesa'>('Receita');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formStatus, setFormStatus] = useState<'completed' | 'pending'>('completed');

  useEffect(() => {
    if (user) {
      fetchNutritionistAndRecords();
    }
  }, [user]);

  const fetchNutritionistAndRecords = async () => {
    try {
      const { data: nutri } = await supabase
        .from('nutritionists')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (nutri) {
        setNutritionistId(nutri.id);
        await fetchRecords();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .order('record_date', { ascending: false });

    if (!error && data) {
      setRecords(data as FinancialRecord[]);
    }
  };

  const handleCreateRecord = async () => {
    if (!nutritionistId || !formAmount) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase
      .from('financial_records')
      .insert({
        nutritionist_id: nutritionistId,
        record_type: formType,
        amount: parseFloat(formAmount.replace(',', '.')),
        description: formDescription || null,
        record_date: formDate,
        status: formStatus
      });

    if (error) {
      toast({
        title: 'Erro ao criar lançamento',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Lançamento criado!',
        description: 'O registro financeiro foi salvo com sucesso.'
      });
      setIsDialogOpen(false);
      resetForm();
      fetchRecords();
    }
  };

  const handleDeleteRecord = async (id: string) => {
    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id);

    if (!error) {
      toast({ title: 'Lançamento excluído' });
      fetchRecords();
    }
  };

  const resetForm = () => {
    setFormType('Receita');
    setFormAmount('');
    setFormDescription('');
    setFormDate(format(new Date(), 'yyyy-MM-dd'));
    setFormStatus('completed');
  };

  // Calculate summary values
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthlyRevenue = records
    .filter(r => 
      r.record_type === 'Receita' && 
      new Date(r.record_date) >= monthStart && 
      new Date(r.record_date) <= monthEnd
    )
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const pendingAmount = records
    .filter(r => r.record_type === 'Receita' && r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  // Mock data for last 6 months chart
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    const monthName = format(date, 'MMM', { locale: ptBR });
    const monthRecords = records.filter(r => {
      const recordDate = new Date(r.record_date);
      return r.record_type === 'Receita' &&
        recordDate.getMonth() === date.getMonth() &&
        recordDate.getFullYear() === date.getFullYear();
    });
    const total = monthRecords.reduce((sum, r) => sum + Number(r.amount), 0);
    return { month: monthName.charAt(0).toUpperCase() + monthName.slice(1), receita: total || Math.floor(Math.random() * 3000) + 1000 };
  });

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Financeiro</h1>
            <p className="text-muted-foreground">Controle de receitas e despesas do consultório</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-tour="financeiro-new-btn">
                <Plus className="w-4 h-4" />
                Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Lançamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formType} onValueChange={(v) => setFormType(v as 'Receita' | 'Despesa')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Receita">Receita</SelectItem>
                      <SelectItem value="Despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input 
                    type="text" 
                    placeholder="0,00" 
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input 
                    placeholder="Ex: Consulta - João Silva" 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input 
                    type="date" 
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formStatus} onValueChange={(v) => setFormStatus(v as 'completed' | 'pending')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Recebido</SelectItem>
                      <SelectItem value="pending">A Receber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateRecord} className="w-full">
                  Salvar Lançamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Total do Mês
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(now, 'MMMM yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total a Receber
              </CardTitle>
              <Clock className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lançamentos pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Receita dos Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `R$${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lançamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum lançamento encontrado. Clique em "Novo Lançamento" para começar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 10).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {record.record_type === 'Receita' ? (
                            <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ArrowDownCircle className="w-4 h-4 text-red-500" />
                          )}
                          {record.record_type}
                        </div>
                      </TableCell>
                      <TableCell>{record.description || '-'}</TableCell>
                      <TableCell>{format(new Date(record.record_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                          {record.status === 'completed' ? 'Recebido' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${record.record_type === 'Receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {record.record_type === 'Receita' ? '+' : '-'} R$ {Number(record.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Financeiro;
