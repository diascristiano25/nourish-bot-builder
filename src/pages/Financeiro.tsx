/**
 * Financeiro - Financial dashboard page
 * Premium financial overview with NutriFlow palette and motion design
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { FinancialDashboard } from '@/components/nutritionist/financial/FinancialDashboard';
import { RevenueChart } from '@/components/nutritionist/financial/RevenueChart';
import { TransactionList, Transaction } from '@/components/nutritionist/financial/TransactionList';
import { NewTransactionDialog } from '@/components/nutritionist/financial/NewTransactionDialog';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { DollarSign, TrendingUp, Clock, Receipt, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface RevenueData {
  month: string;
  revenue: number;
}

const getMockData = () => ({
  totalRevenue: 4800,
  pendingPayments: 1200,
  avgConsultationCost: 150,
  totalTransactions: 32,
  monthlyRevenue: [
    { month: 'Mai', revenue: 3200 },
    { month: 'Jun', revenue: 4100 },
    { month: 'Jul', revenue: 3800 },
    { month: 'Ago', revenue: 4500 },
    { month: 'Set', revenue: 5200 },
    { month: 'Out', revenue: 4800 },
  ] as RevenueData[],
  transactions: [
    { id: '1', patientName: 'Maria Silva', type: 'payment' as const, amount: 150, date: new Date().toISOString(), status: 'completed' as const },
    { id: '2', patientName: 'João Santos', type: 'payment' as const, amount: 200, date: new Date(Date.now() - 86400000).toISOString(), status: 'completed' as const },
    { id: '3', patientName: 'Ana Costa', type: 'pending' as const, amount: 150, date: new Date(Date.now() - 172800000).toISOString(), status: 'pending' as const },
    { id: '4', patientName: 'Pedro Oliveira', type: 'payment' as const, amount: 180, date: new Date(Date.now() - 259200000).toISOString(), status: 'completed' as const },
    { id: '5', patientName: 'Carla Mendes', type: 'refund' as const, amount: 150, date: new Date(Date.now() - 345600000).toISOString(), status: 'completed' as const },
  ] as Transaction[],
});

export default function Financeiro() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(getMockData());
  const [loading, setLoading] = useState(true);
  const [nutritionistId, setNutritionistId] = useState<string>('');
  const [newTxOpen, setNewTxOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (profileError) throw profileError;
      const nId = profileData?.id;
      if (!nId) throw new Error('No profile');
      setNutritionistId(nId);

      // Real schema (verified via Supabase REST probe): id, nutritionist_id,
      // record_type, amount, description, record_date, status (+ created_at).
      // There is NO `date`, `type`, or `payment_method` column.
      const { data: financialData, error: financialError } = await supabase
        .from('financial_records')
        .select('id, amount, record_type, status, description, record_date, created_at')
        .eq('nutritionist_id', nId)
        .order('record_date', { ascending: false })
        .limit(200);
      if (financialError) throw financialError;

      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const records = (financialData || []) as any[];
      const incomeRecords = records.filter((r) => (r.record_type === 'income' || r.record_type === 'payment') && r.status !== 'cancelled');
      const expenseRecords = records.filter((r) => r.record_type === 'expense' && r.status !== 'cancelled');

      const currentMonthIncome = incomeRecords.filter((r) => {
        const d = new Date(r.record_date);
        return d >= monthStart && d <= monthEnd;
      });
      const totalRev = currentMonthIncome.reduce((sum, r) => sum + Number(r.amount || 0), 0);

      const pending = records
        .filter((r) => r.status === 'pending')
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);

      const completedIncome = incomeRecords.filter((r) => r.status === 'completed');
      const avgCost = completedIncome.length > 0
        ? completedIncome.reduce((sum, r) => sum + Number(r.amount || 0), 0) / completedIncome.length
        : 0;

      const revenueMonths: RevenueData[] = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      for (let i = 5; i >= 0; i--) {
        const targetMonth = subMonths(now, i);
        const mStart = startOfMonth(targetMonth);
        const mEnd = endOfMonth(targetMonth);
        const monthIncome = incomeRecords.filter((r) => {
          const d = new Date(r.record_date);
          return d >= mStart && d <= mEnd;
        });
        const monthExpense = expenseRecords.filter((r) => {
          const d = new Date(r.record_date);
          return d >= mStart && d <= mEnd;
        });
        const net = monthIncome.reduce((s, r) => s + Number(r.amount || 0), 0)
          - monthExpense.reduce((s, r) => s + Number(r.amount || 0), 0);
        revenueMonths.push({ month: monthNames[targetMonth.getMonth()], revenue: net / 100 });
      }

      const transactionsList: Transaction[] = records.slice(0, 20).map((record) => {
        const isExpense = record.record_type === 'expense';
        const isRefund = record.record_type === 'refund';
        const tType: Transaction['type'] = isRefund ? 'refund' : record.status === 'pending' ? 'pending' : 'payment';
        return {
          id: record.id,
          patientName: record.description || (isExpense ? 'Despesa' : 'Receita'),
          type: tType,
          amount: (isExpense ? -1 : 1) * (Number(record.amount || 0) / 100),
          date: record.record_date || record.created_at,
          status: (record.status === 'cancelled' ? 'failed' : record.status) as 'completed' | 'pending' | 'failed',
        };
      });

      setData({
        totalRevenue: totalRev / 100,
        pendingPayments: pending / 100,
        avgConsultationCost: avgCost / 100,
        totalTransactions: records.length,
        monthlyRevenue: revenueMonths,
        transactions: transactionsList,
      });
    } catch (err) {
      console.warn('Supabase fetch failed for Financeiro, showing empty state:', err);
      setData({
        totalRevenue: 0,
        pendingPayments: 0,
        avgConsultationCost: 0,
        totalTransactions: 0,
        monthlyRevenue: [],
        transactions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ModernLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <LoadingState count={3} height="h-64" />
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-8">
        <PageHeader
          title="Financeiro"
          subtitle="Acompanhe suas receitas, pagamentos e transações"
          icon={<DollarSign className="w-7 h-7 text-white" />}
          gradient="from-[#518C5B] via-[#4a7d52] to-[#2d5a37]"
        />

        {/* KPI tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <RichCard delay={0.1}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#518C5B]/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#518C5B]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receita do Mês</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  R$ {data.totalRevenue.toLocaleString('pt-BR')}
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.2}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendentes</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  R$ {data.pendingPayments.toLocaleString('pt-BR')}
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.3}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Médio</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  R$ {data.avgConsultationCost.toLocaleString('pt-BR')}
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.4}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C4764A]/10 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-[#C4764A]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transações</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  {data.totalTransactions}
                </motion.p>
              </div>
            </div>
          </RichCard>
        </div>

        {/* Action bar: New transaction button */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-xl md:text-2xl font-bold text-slate-800">
            Movimentações
          </h2>
          <Button
            onClick={() => setNewTxOpen(true)}
            disabled={!nutritionistId}
            className="bg-[#518C5B] hover:bg-[#3d7047] text-white rounded-xl px-5 h-11 shadow-md shadow-[#518C5B]/20 gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </Button>
        </div>

        {/* Revenue chart in rich card */}
        <RichCard delay={0.5} padding="lg">
          <RevenueChart data={data.monthlyRevenue} />
        </RichCard>

        {/* Transactions in rich card */}
        <RichCard delay={0.6} padding="lg">
          <TransactionList transactions={data.transactions} />
        </RichCard>

        {/* New Transaction Dialog */}
        {nutritionistId && (
          <NewTransactionDialog
            open={newTxOpen}
            onOpenChange={setNewTxOpen}
            nutritionistId={nutritionistId}
            onSuccess={fetchData}
          />
        )}
      </div>
    </ModernLayout>
  );
}