import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface FinancialRecord {
  id: string;
  record_type: string;
  amount: number;
  record_date: string;
  description: string | null;
  nutritionist_id: string | null;
}

interface ProfileSummary {
  id: string;
  full_name: string;
  subscription_plan: string | null;
  account_status: string;
}

const COLORS = ['#518C5B', '#E76F51', '#2A9D8F', '#E9C46A', '#264653'];

export default function AdminFinanceiro() {
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<FinancialRecord[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expense: number }[]>([]);
  const [planDistribution, setPlanDistribution] = useState<{ name: string; value: number }[]>([]);
  const [payingNutris, setPayingNutris] = useState(0);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Fetch all financial records
      const { data: records, error: recErr } = await supabase
        .from('financial_records')
        .select('id, record_type, amount, record_date, description, nutritionist_id')
        .order('record_date', { ascending: false });

      if (recErr) throw recErr;

      const allRecords = records || [];
      const income = allRecords.filter(r => r.record_type === 'income').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const expense = allRecords.filter(r => r.record_type === 'expense').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      setTotalIncome(income);
      setTotalExpense(expense);
      setRecentTransactions(allRecords.slice(0, 50));

      // Monthly breakdown (last 6 months)
      const monthly: { month: string; income: number; expense: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const mStart = startOfMonth(subMonths(new Date(), i));
        const mEnd = endOfMonth(subMonths(new Date(), i));
        const mIncome = allRecords
          .filter(r => r.record_type === 'income' && new Date(r.record_date) >= mStart && new Date(r.record_date) <= mEnd)
          .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        const mExpense = allRecords
          .filter(r => r.record_type === 'expense' && new Date(r.record_date) >= mStart && new Date(r.record_date) <= mEnd)
          .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        monthly.push({
          month: format(mStart, 'MMM/yyyy', { locale: ptBR }),
          income: mIncome,
          expense: mExpense,
        });
      }
      setMonthlyData(monthly);

      // Plan distribution from profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, subscription_plan, account_status')
        .eq('is_admin', false);

      const nonAdmin = profiles || [];
      const planMap: Record<string, number> = {};
      let paying = 0;
      nonAdmin.forEach(p => {
        const plan = p.subscription_plan || 'free';
        planMap[plan] = (planMap[plan] || 0) + 1;
        if (p.account_status === 'active' && plan !== 'free') paying++;
      });
      setPlanDistribution(Object.entries(planMap).map(([name, value]) => ({ name, value })));
      setPayingNutris(paying);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Receita Total', value: `R$ ${totalIncome.toLocaleString('pt-BR')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Despesas Totais', value: `R$ ${totalExpense.toLocaleString('pt-BR')}`, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Lucro Líquido', value: `R$ ${(totalIncome - totalExpense).toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Nutris Pagantes', value: payingNutris, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="h-32 rounded-3xl bg-muted/30 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Financeiro"
          subtitle="Visão financeira consolidada da plataforma"
          icon={<DollarSign className="w-7 h-7 text-white" />}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5">
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <NeonText as="h3" color="primary" className="font-semibold mb-4">
              Receita vs Despesas (6 meses)
            </NeonText>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="income" name="Receita" fill="#518C5B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Despesa" fill="#E76F51" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-6">
            <NeonText as="h3" color="primary" className="font-semibold mb-4">
              Distribuição por Plano
            </NeonText>
            {planDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {planDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                Sem dados de planos disponíveis
              </div>
            )}
          </GlassCard>
        </div>

        {/* Recent Transactions */}
        <GlassCard className="p-6">
          <NeonText as="h3" color="primary" className="font-semibold mb-4">
            Transações Recentes
          </NeonText>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação registrada
                    </TableCell>
                  </TableRow>
                ) : recentTransactions.map(t => (
                  <TableRow key={t.id} className="border-border/30">
                    <TableCell>{format(new Date(t.record_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>
                      <Badge variant={t.record_type === 'income' ? 'default' : 'secondary'} className={t.record_type === 'income' ? 'bg-success/20 text-success border-success/30' : ''}>
                        {t.record_type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{t.description || '-'}</TableCell>
                    <TableCell className={`text-right font-medium ${t.record_type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.record_type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </GlassCard>
      </div>
    </AdminLayout>
  );
}