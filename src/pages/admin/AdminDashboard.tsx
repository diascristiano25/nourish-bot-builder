import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Clock, DollarSign, MessageSquare, TrendingUp, AlertTriangle, UserPlus, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth, isToday, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { getAccessState, isPayingActive, isInactive, type SubscriptionRow } from '@/lib/account-access';

interface DashboardStats {
  totalNutris: number;
  activeNutris: number;
  trialNutris: number;
  inactiveNutris: number;
  pendingTickets: number;
  newToday: number;
  monthlyRevenue: number;
  activationRate: number;
}

const COLORS = ['#2A9D8F', '#E76F51', '#518C5B', '#E9C46A', '#264653'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalNutris: 0, activeNutris: 0, trialNutris: 0, inactiveNutris: 0,
    pendingTickets: 0, newToday: 0, monthlyRevenue: 0, activationRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [evolutionData, setEvolutionData] = useState<{ month: string; count: number }[]>([]);
  const [planDistribution, setPlanDistribution] = useState<{ name: string; value: number }[]>([]);
  const [alerts, setAlerts] = useState<{ type: 'warning' | 'danger'; message: string }[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<{ month: string; income: number }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const currentMonthStart = startOfMonth(today);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, created_at, is_active, is_admin, account_status, trial_ends_at');

      if (profilesError) throw profilesError;

      const nonAdminProfiles = (profiles || []).filter(p => !p.is_admin);

      const { data: subs } = await supabase.from('subscriptions').select('user_id, status, current_period_end');
      const states = nonAdminProfiles.map(p => getAccessState(p, (subs || []) as SubscriptionRow[], today));
      const activeCount = states.filter(isPayingActive).length;
      const trialCount = states.filter(st => st === 'trial').length;
      const inactiveCount = states.filter(isInactive).length;

      // New today: created_at within today's calendar day (local timezone)
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const newTodayCount = nonAdminProfiles.filter(p => {
        const d = new Date(p.created_at);
        return d >= todayStart && d < todayEnd;
      }).length;

      const { count: ticketCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Use local timezone for month boundaries to avoid UTC offset issues
      const localMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const localMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const { data: financialRecords } = await supabase
        .from('financial_records')
        .select('amount, transaction_type, created_at')
        .gte('created_at', localMonthStart.toISOString())
        .lt('created_at', localMonthEnd.toISOString())
        .in('transaction_type', ['payment', 'subscription', 'income']);

      const monthlyRevenue = (financialRecords || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      const evolution = [];
      for (let i = 5; i >= 0; i--) {
        const mStart = startOfMonth(subMonths(today, i));
        const mEnd = endOfMonth(subMonths(today, i));
        const count = nonAdminProfiles.filter(p => {
          const d = new Date(p.created_at);
          return d >= mStart && d <= mEnd;
        }).length;
        evolution.push({
          month: format(mStart, 'MMM', { locale: ptBR }),
          count,
        });
      }

      const sixMonthsAgo = startOfMonth(subMonths(today, 5));
      const { data: allFinancialRecords } = await supabase
        .from('financial_records')
        .select('amount, transaction_type, created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .in('transaction_type', ['payment', 'subscription', 'income']);

      const revTrend = [];
      for (let i = 5; i >= 0; i--) {
        const mStart = startOfMonth(subMonths(today, i));
        const mEnd = endOfMonth(subMonths(today, i));
        const income = (allFinancialRecords || []).filter(r => {
          const d = new Date(r.created_at);
          return d >= mStart && d <= mEnd;
        }).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        revTrend.push({
          month: format(mStart, 'MMM', { locale: ptBR }),
          income,
        });
      }

      const statusLabels: Record<string, string> = {
        active: 'Ativo',
        trial: 'Trial',
        expired: 'Expirado',
        suspended: 'Suspenso',
      };
      const planMap: Record<string, number> = {};
      nonAdminProfiles.forEach(p => {
        const status = p.account_status || 'active';
        const label = statusLabels[status] || status;
        planMap[label] = (planMap[label] || 0) + 1;
      });
      const planDist = Object.entries(planMap).map(([name, value]) => ({ name, value }));

      const newAlerts: { type: 'warning' | 'danger'; message: string }[] = [];
      const expiringTrials = nonAdminProfiles.filter(p =>
        p.trial_ends_at && differenceInDays(new Date(p.trial_ends_at), today) <= 3 && differenceInDays(new Date(p.trial_ends_at), today) > 0
      );
      if (expiringTrials.length > 0) {
        newAlerts.push({ type: 'warning', message: `${expiringTrials.length} trial(s) expirando nos próximos 3 dias` });
      }
      if ((ticketCount || 0) > 0) {
        newAlerts.push({ type: 'danger', message: `${ticketCount} ticket(s) de suporte pendente(s)` });
      }

      const relevantBase = nonAdminProfiles.filter(p =>
        p.is_active || (p.trial_ends_at && new Date(p.trial_ends_at) < today) || p.account_status === 'expired'
      ).length;
      const activationRate = relevantBase > 0 ? Math.round((activeCount / relevantBase) * 100) : 0;

      setStats({
        totalNutris: nonAdminProfiles.length,
        activeNutris: activeCount,
        trialNutris: trialCount,
        inactiveNutris: inactiveCount,
        pendingTickets: ticketCount || 0,
        newToday: newTodayCount,
        monthlyRevenue,
        activationRate,
      });
      setEvolutionData(evolution);
      setPlanDistribution(planDist);
      setRevenueTrend(revTrend);
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Nutris Ativos', value: stats.activeNutris, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Em Trial', value: stats.trialNutris, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Receita Mensal', value: `R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Tickets Pendentes', value: stats.pendingTickets, icon: MessageSquare, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Novos Hoje', value: stats.newToday, icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Taxa Ativação', value: `${stats.activationRate}%`, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-100' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="h-32 rounded-3xl bg-muted/30 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Visão Geral"
          subtitle="Painel administrativo NutriFlow"
          icon={<Shield className="w-7 h-7 text-white" />}
        />

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  alert.type === 'danger' ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-warning/10 border-warning/30 text-warning'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{alert.message}</span>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <NeonText as="h3" color="primary" className="font-semibold mb-4">
              Evolução de Nutricionistas (6 meses)
            </NeonText>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2A9D8F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2A9D8F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="count" stroke="#2A9D8F" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" dot={{ fill: '#2A9D8F', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-6">
            <NeonText as="h3" color="primary" className="font-semibold mb-4">
              Receita Mensal (6 meses)
            </NeonText>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                />
                <Bar dataKey="income" fill="#518C5B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <NeonText as="h3" color="primary" className="font-semibold mb-4">
              Distribuição por Status
            </NeonText>
            {planDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {planDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Sem dados de planos disponíveis
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <NeonText as="h3" color="primary" className="font-semibold">Resumo da Plataforma</NeonText>
              <Badge variant="outline" className="border-primary/30 text-primary">
                <CheckCircle className="w-3 h-3 mr-1" />
                Sistema Operacional
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Total de Nutris</span>
                <span className="text-sm font-medium">{stats.totalNutris}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Ativos</span>
                <span className="text-sm font-medium text-emerald-600">{stats.activeNutris}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Em Trial</span>
                <span className="text-sm font-medium text-blue-600">{stats.trialNutris}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Inativos</span>
                <span className="text-sm font-medium text-red-600">{stats.inactiveNutris}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Taxa de Ativação</span>
                <span className="text-sm font-medium text-teal-600">{stats.activationRate}%</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AdminLayout>
  );
}