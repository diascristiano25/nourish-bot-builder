/**
 * Financeiro - Financial dashboard page
 * Modern financial overview with revenue charts and transaction list
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { FinancialDashboard } from '@/components/nutritionist/financial/FinancialDashboard';
import { RevenueChart } from '@/components/nutritionist/financial/RevenueChart';
import { TransactionList, Transaction } from '@/components/nutritionist/financial/TransactionList';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NutritionistProfile {
  id: string;
  full_name: string;
}

interface RevenueData {
  month: string;
  revenue: number;
}

export default function Financeiro() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [avgConsultationCost, setAvgConsultationCost] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch nutritionist profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ user_id: user!.id, full_name: user!.user_metadata?.full_name || 'Nutricionista' })
          .select('id, full_name')
          .single();
        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(profileData);
      }

      const nutritionistId = profileData?.id;
      if (!nutritionistId) throw new Error('Nutritionist profile not found');

      // Fetch financial records
      const { data: financialData, error: financialError } = await supabase
        .from('financial_records')
        .select(`
          id,
          amount,
          transaction_type,
          status,
          description,
          created_at,
          patient:patient_id (
            id,
            full_name
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (financialError) throw financialError;

      // Calculate current month revenue
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const currentMonthRecords = (financialData || []).filter(r => {
        const recordDate = new Date(r.created_at);
        return recordDate >= monthStart && recordDate <= monthEnd && r.status === 'completed';
      });

      const totalRev = currentMonthRecords.reduce((sum, r) => sum + r.amount, 0);
      setTotalRevenue(totalRev);

      // Calculate pending payments
      const pending = (financialData || [])
        .filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + r.amount, 0);
      setPendingPayments(pending);

      // Calculate average consultation cost
      const consultationRecords = (financialData || []).filter(
        r => r.transaction_type === 'consultation' && r.status === 'completed'
      );
      const avgCost = consultationRecords.length > 0
        ? consultationRecords.reduce((sum, r) => sum + r.amount, 0) / consultationRecords.length
        : 0;
      setAvgConsultationCost(avgCost / 100); // Convert from cents

      // Set total transactions
      setTotalTransactions((financialData || []).length);

      // Prepare monthly revenue data (last 12 months)
      const revenueMonths: RevenueData[] = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      for (let i = 11; i >= 0; i--) {
        const targetMonth = subMonths(now, i);
        const mStart = startOfMonth(targetMonth);
        const mEnd = endOfMonth(targetMonth);

        const monthRecords = (financialData || []).filter(r => {
          const recordDate = new Date(r.created_at);
          return recordDate >= mStart && recordDate <= mEnd && r.status === 'completed';
        });

        const total = monthRecords.reduce((sum, r) => sum + r.amount, 0);
        revenueMonths.push({
          month: monthNames[targetMonth.getMonth()],
          revenue: total / 100, // Convert from cents to reais
        });
      }
      setMonthlyRevenue(revenueMonths);

      // Prepare transactions list (last 20)
      const transactionsList: Transaction[] = (financialData || []).slice(0, 20).map((record: any) => ({
        id: record.id,
        patientName: record.patient?.full_name || 'Paciente',
        type: record.transaction_type === 'refund' ? 'refund' : record.status === 'pending' ? 'pending' : 'payment',
        amount: record.amount / 100, // Convert from cents
        date: record.created_at,
        status: record.status as 'completed' | 'pending' | 'failed',
      }));
      setTransactions(transactionsList);

    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
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

  if (error) {
    return (
      <ModernLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <ErrorBoundary>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 max-w-md">
              <h3 className="font-semibold text-red-900 mb-2">Erro ao carregar dados financeiros</h3>
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          </ErrorBoundary>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="min-h-screen bg-[#FAF8F5] p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Financeiro</h1>
            <p className="text-slate-600">Acompanhe suas receitas e transações</p>
          </div>

          {/* Financial Dashboard Stats */}
          <FinancialDashboard
            totalRevenue={totalRevenue / 100} // Convert from cents
            pendingPayments={pendingPayments / 100}
            avgConsultationCost={avgConsultationCost}
            totalTransactions={totalTransactions}
          />

          {/* Revenue Chart */}
          <RevenueChart data={monthlyRevenue} />

          {/* Transaction List */}
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </ModernLayout>
  );
}
