import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Clock, DollarSign, MessageSquare, TrendingUp, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalNutris: number;
  activeNutris: number;
  trialNutris: number;
  inactiveNutris: number;
  pendingTickets: number;
  newToday: number;
  monthlyRevenue: number;
}

const COLORS = ['#518C5B', '#E76F51', '#2A9D8F', '#E9C46A', '#264653'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalNutris: 0, activeNutris: 0, trialNutris: 0, inactiveNutris: 0,
    pendingTickets: 0, newToday: 0, monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [evolutionData, setEvolutionData] = useState<{ month: string; count: number }[]>([]);
  const [planDistribution, setPlanDistribution] = useState<{ name: string; value: number }[]>([]);
  const [alerts, setAlerts] = useState<{ type: 'warning' | 'danger'; message: string }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = startOfDay(new Date());
      const thirtyDaysAgo = subDays(today, 30);

      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at, is_active, account_status, trial_ends_at, subscription_plan');

      if (profilesError) throw profilesError;

      const nonAdminProfiles = (profiles || []).filter(p => !p.is_admin);
      const activeCount = nonAdminProfiles.filter(p => p.is_active).length;
      const trialCount = nonAdminProfiles.filter(p =>
        p.trial_ends_at && new Date(p.trial_ends_at) > today && p.account_status === 'trial'
      ).length;
      const newTodayCount = nonAdminProfiles.filter(p =>
        startOfDay(new Date(p.created_at)).getTime() === today.getTime()
      ).length;

      // Pending tickets
      const { count: ticketCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Monthly revenue (financial_records)
      const { data: financialRecords } = await supabase
        .from('financial_records')
        .select('amount, record_type, record_date')
        .gte('record_date', thirtyDaysAgo.toISOString())
        .eq('record_type', 'income');

      const monthlyRevenue = (financialRecords || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      // Evolution data (last 6 months)
      const evolution = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = subDays(today, i * 30);
        const monthEnd = subDays(today, (i - 1) * 30);
        const count = nonAdminProfiles.filter(p => {
          const d = new Date(p.created_at);
          return d >= monthStart && d < monthEnd;
        }).length;
        evolution.push({
          month: format(monthStart, 'MMM', { locale: ptBR }),
          count,
        });
      }

      // Plan distribution
      const planMap: Record<string, number> = {};
      nonAdminProfiles.forEach(p => {
        const plan = p.subscription_plan || 'free';
        planMap[plan] = (planMap[plan] || 0) + 1;
      });
      const planDist = Object.entries(planMap).map(([name, value]) => ({ name, value }));

      // Alerts
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

      setStats({
        totalNutris: nonAdminProfiles.length,
        activeNutris: activeCount,
        trialNutris: trialCount,
        inactiveNutris: nonAdminProfiles.length - activeCount,
        pendingTickets: ticketCount || 0,
        newToday: newTodayCount,
        monthlyRevenue,
      });
      setEvolutionData(evolution);
      setPlanDistribution(planDist);
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
    { label: 'Taxa Ativação', value: stats.totalNutris > 0 ? `${Math.round((stats.activeNutris / stats.totalNutris) * 100)}%` : '0%', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-100' },
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

        {/* Alerts */}
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

        {/* Stats Grid */}
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <NeonText as="h3" color="primary" className="font-semibold mb-4">
              Evolução de Nutricionistas (6 meses)
            </NeonText>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="count" stroke="#518C5B" strokeWidth={3} dot={{ fill: '#518C5B', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-6">
            <NeonText as="h3" color="primary" className="font-semibold mb-4">
              Distribuição por Plano
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
        </div>

        {/* Summary Footer */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <NeonText as="h3" color="primary" className="font-semibold">Resumo da Plataforma</NeonText>
              <p className="text-sm text-muted-foreground mt-1">
                Total de {stats.totalNutris} nutricionistas registrados • {stats.inactiveNutris} inativos
              </p>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              <CheckCircle className="w-3 h-3 mr-1" />
              Sistema Operacional
            </Badge>
          </div>
        </GlassCard>
      </div>
    </AdminLayout>
  );
}