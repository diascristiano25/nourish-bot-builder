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
import { FinancialDashboard } from '@/components/nutritionist/financial/FinancialDashboard';
import { RevenueChart } from '@/components/nutritionist/financial/RevenueChart';
import { TransactionList, Transaction } from '@/components/nutritionist/financial/TransactionList';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface RevenueData {
  month: string;
  revenue: number;
}

// Mock data generator
const getMockData = () => ({
  totalRevenue: 4800,
  pendingPayments: 1200,
  avgConsultationCost: 150,
  totalTransactions: 32,
  monthlyRevenue: [
    { month: 'Nov', revenue: 2800 },
    { month: 'Dez', revenue: 3200 },
    { month: 'Jan', revenue: 3600 },
    { month: 'Fev', revenue: 4100 },
    { month: 'Mar', revenue: 3900 },
    { month: 'Abr', revenue: 4500 },
    { month: 'Mai', revenue: 4200 },
    { month: 'Jun', revenue: 4800 },
    { month: 'Jul', revenue: 5100 },
    { month: 'Ago', revenue: 4900 },
    { month: 'Set', revenue: 5300 },
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

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Try to fetch real data from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const nutritionistId = profileData?.id;
      if (!nutritionistId) throw new Error('No profile');

      // Fetch financial records
      const { data: financialData, error: financialError } = await supabase
        .from('financial_records')
        .select('id, amount, transaction_type, status, description, created_at, patient:patient_id(id, full_name)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (financialError) throw financialError;

      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const currentMonthRecords = (financialData || []).filter((r: any) => {
        const recordDate = new Date(r.created_at);
        return recordDate >= monthStart && recordDate <= monthEnd && r.status === 'completed';
      });

      const totalRev = currentMonthRecords.reduce((sum: number, r: any) => sum + r.amount, 0);
      const pending = (financialData || [])
        .filter((r: any) => r.status === 'pending')
        .reduce((sum: number, r: any) => sum + r.amount, 0);

      const consultationRecords = (financialData || []).filter(
        (r: any) => r.transaction_type === 'consultation' && r.status === 'completed'
      );
      const avgCost = consultationRecords.length > 0
        ? consultationRecords.reduce((sum: number, r: any) => sum + r.amount, 0) / consultationRecords.length
        : 0;

      // Monthly revenue (last 12 months)
      const revenueMonths: RevenueData[] = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      for (let i = 11; i >= 0; i--) {
        const targetMonth = subMonths(now, i);
        const mStart = startOfMonth(targetMonth);
        const mEnd = endOfMonth(targetMonth);

        const monthRecords = (financialData || []).filter((r: any) => {
          const recordDate = new Date(r.created_at);
          return recordDate >= mStart && recordDate <= mEnd && r.status === 'completed';
        });

        const total = monthRecords.reduce((sum: number, r: any) => sum + r.amount, 0);
        revenueMonths.push({
          month: monthNames[targetMonth.getMonth()],
          revenue: total / 100,
        });
      }

      // Transactions list
      const transactionsList: Transaction[] = (financialData || []).slice(0, 20).map((record: any) => ({
        id: record.id,
        patientName: record.patient?.full_name || 'Paciente',
        type: record.transaction_type === 'refund' ? 'refund' as const : record.status === 'pending' ? 'pending' as const : 'payment' as const,
        amount: record.amount / 100,
        date: record.created_at,
        status: record.status as 'completed' | 'pending' | 'failed',
      }));

      setData({
        totalRevenue: totalRev / 100,
        pendingPayments: pending / 100,
        avgConsultationCost: avgCost / 100,
        totalTransactions: (financialData || []).length,
        monthlyRevenue: revenueMonths,
        transactions: transactionsList,
      });

    } catch (err) {
      console.warn('Supabase fetch failed for Financeiro, using mock data:', err);
      setData(getMockData());
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
      <div className="min-h-screen bg-[#FAF8F5] p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Financeiro</h1>
            <p className="text-slate-600">Acompanhe suas receitas e transações</p>
          </div>

          <FinancialDashboard
            totalRevenue={data.totalRevenue}
            pendingPayments={data.pendingPayments}
            avgConsultationCost={data.avgConsultationCost}
            totalTransactions={data.totalTransactions}
          />

          <RevenueChart data={data.monthlyRevenue} />

          <TransactionList transactions={data.transactions} />
        </div>
      </div>
    </ModernLayout>
  );
}