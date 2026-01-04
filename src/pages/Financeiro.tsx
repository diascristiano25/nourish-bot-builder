import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Trash2,
  Wallet,
  PiggyBank,
  Receipt,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';

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
        .from('profiles')
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

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthlyRevenue = records
    .filter(r => 
      r.record_type === 'Receita' && 
      r.status === 'completed' &&
      new Date(r.record_date) >= monthStart && 
      new Date(r.record_date) <= monthEnd
    )
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const pendingAmount = records
    .filter(r => r.record_type === 'Receita' && r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalMonth = records
    .filter(r => 
      new Date(r.record_date) >= monthStart && 
      new Date(r.record_date) <= monthEnd
    )
    .reduce((sum, r) => {
      return r.record_type === 'Receita' 
        ? sum + Number(r.amount) 
        : sum - Number(r.amount);
    }, 0);

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
    return { 
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1), 
      receita: total || Math.floor(Math.random() * 3000) + 1000 
    };
  });

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Cyber Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-border">
          <div className="px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent">
                  Financeiro
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Controle de receitas e despesas
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="gap-2 bg-gradient-to-r from-cyber-lime to-electric-violet hover:opacity-90 text-background rounded-xl h-11 px-6 font-semibold"
                    data-tour="financeiro-new-btn"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Lançamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-strong border-border rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyber-lime" />
                      Novo Lançamento
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Tipo</Label>
                      <Select value={formType} onValueChange={(v) => setFormType(v as 'Receita' | 'Despesa')}>
                        <SelectTrigger className="glass border-border focus:border-cyber-lime/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-border">
                          <SelectItem value="Receita">Receita</SelectItem>
                          <SelectItem value="Despesa">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Valor (R$)</Label>
                      <Input 
                        type="text" 
                        placeholder="0,00" 
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        className="glass border-border focus:border-cyber-lime/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Descrição</Label>
                      <Input 
                        placeholder="Ex: Consulta - João Silva" 
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="glass border-border focus:border-cyber-lime/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Data</Label>
                      <Input 
                        type="date" 
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="glass border-border focus:border-cyber-lime/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Status</Label>
                      <Select value={formStatus} onValueChange={(v) => setFormStatus(v as 'completed' | 'pending')}>
                        <SelectTrigger className="glass border-border focus:border-cyber-lime/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-border">
                          <SelectItem value="completed">Recebido</SelectItem>
                          <SelectItem value="pending">A Receber</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleCreateRecord} 
                      className="w-full bg-gradient-to-r from-cyber-lime to-electric-violet hover:opacity-90 text-background rounded-xl h-11 font-semibold"
                    >
                      Salvar Lançamento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 max-w-6xl">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <GlassCard glow="lime">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyber-lime/10 flex items-center justify-center border border-cyber-lime/30">
                  <Wallet className="w-6 h-6 text-cyber-lime" />
                </div>
                <TrendingUp className="w-5 h-5 text-cyber-lime" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Entradas do Mês</p>
              <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent">
                R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                {format(now, 'MMMM yyyy', { locale: ptBR }).toUpperCase()}
              </p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pendentes</p>
              <p className="text-2xl lg:text-3xl font-bold text-amber-400">
                R$ {pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                A RECEBER
              </p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-electric-violet/10 flex items-center justify-center border border-electric-violet/30">
                  <PiggyBank className="w-6 h-6 text-electric-violet" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total do Mês</p>
              <p className={`text-2xl lg:text-3xl font-bold ${totalMonth >= 0 ? 'text-cyber-lime' : 'text-red-400'}`}>
                R$ {Math.abs(totalMonth).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                SALDO LÍQUIDO
              </p>
            </GlassCard>
          </div>

          {/* Chart */}
          <GlassCard className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyber-lime" />
                Faturamento dos Últimos 6 Meses
              </h2>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="financeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DFFF00" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#DFFF00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(220, 20%, 12%)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      boxShadow: '0 0 20px rgba(223, 255, 0, 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#DFFF00"
                    strokeWidth={2}
                    fill="url(#financeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Recent Transactions */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Receipt className="w-5 h-5 text-cyber-lime" />
                Lançamentos Recentes
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                {records.length} REGISTROS
              </span>
            </div>
            
            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-foreground font-medium mb-1">Nenhum lançamento</p>
                <p className="text-sm text-muted-foreground">Adicione seu primeiro lançamento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.slice(0, 10).map((record, index) => (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between p-4 rounded-xl glass border border-border hover:border-cyber-lime/30 transition-all group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        record.record_type === 'Receita' 
                          ? 'bg-cyber-lime/10 border border-cyber-lime/30' 
                          : 'bg-red-500/10 border border-red-500/30'
                      }`}>
                        {record.record_type === 'Receita' ? (
                          <ArrowUpCircle className="w-5 h-5 text-cyber-lime" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {record.description || record.record_type}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {format(new Date(record.record_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-semibold ${
                          record.record_type === 'Receita' ? 'text-cyber-lime' : 'text-red-400'
                        }`}>
                          {record.record_type === 'Receita' ? '+' : '-'} R$ {Number(record.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          record.status === 'completed' 
                            ? 'bg-cyber-lime/10 text-cyber-lime' 
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {record.status === 'completed' ? 'RECEBIDO' : 'PENDENTE'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                        onClick={() => handleDeleteRecord(record.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </main>
      </div>
    </AppLayout>
  );
};

export default Financeiro;
