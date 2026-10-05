import { useState, useMemo } from 'react';
import { format, differenceInDays, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, UserCheck, UserX, TrendingUp, TrendingDown, Utensils, CalendarDays, 
  BarChart3, Mail, Loader2, Download, Filter, RefreshCw, Target, Percent,
  Clock, Award, AlertTriangle, CheckCircle, XCircle, Eye, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client-custom';

interface UserEngagementData {
  id: string;
  full_name: string;
  email: string | null;
  user_id: string;
  created_at: string;
  has_seen_onboarding: boolean;
  total_patients: number;
  total_meal_plans: number;
  total_appointments: number;
  last_activity: string | null;
}

interface Nutritionist {
  id: string;
  full_name: string;
  user_id: string;
  crn: string | null;
  phone: string | null;
  created_at: string;
  is_active: boolean;
  is_admin: boolean;
  account_status: string;
}

interface AdminAnalyticsProps {
  engagementData: UserEngagementData[];
  nutritionists: Nutritionist[];
  loadingEngagement: boolean;
  onRefresh: () => void;
}

export default function AdminAnalytics({ 
  engagementData, 
  nutritionists, 
  loadingEngagement,
  onRefresh 
}: AdminAnalyticsProps) {
  const [dateRange, setDateRange] = useState<'7' | '14' | '30' | '90'>('30');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingEmailTo, setSendingEmailTo] = useState<string | null>(null);
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false);

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const now = new Date();
    const daysAgo = parseInt(dateRange);
    const periodStart = subDays(now, daysAgo);
    const previousPeriodStart = subDays(periodStart, daysAgo);

    // Current period data
    const currentPeriodUsers = nutritionists.filter(n => 
      new Date(n.created_at) >= periodStart
    );
    
    // Previous period data for comparison
    const previousPeriodUsers = nutritionists.filter(n => 
      new Date(n.created_at) >= previousPeriodStart && new Date(n.created_at) < periodStart
    );

    const activeUsers = engagementData.filter(u => u.total_patients > 0 || u.total_meal_plans > 0);
    const inactiveUsers = engagementData.filter(u => u.total_patients === 0 && u.total_meal_plans === 0);
    const onboardedUsers = engagementData.filter(u => u.has_seen_onboarding);
    
    const totalPatients = engagementData.reduce((sum, u) => sum + u.total_patients, 0);
    const totalMealPlans = engagementData.reduce((sum, u) => sum + u.total_meal_plans, 0);
    const totalAppointments = engagementData.reduce((sum, u) => sum + u.total_appointments, 0);

    // Users with recent activity (last 7 days)
    const recentlyActive = engagementData.filter(u => {
      if (!u.last_activity) return false;
      return differenceInDays(now, new Date(u.last_activity)) <= 7;
    });

    // User health score calculation
    const getUserHealthScore = (user: UserEngagementData) => {
      let score = 0;
      if (user.has_seen_onboarding) score += 20;
      if (user.total_patients > 0) score += 30;
      if (user.total_meal_plans > 0) score += 25;
      if (user.total_appointments > 0) score += 15;
      if (user.last_activity && differenceInDays(now, new Date(user.last_activity)) <= 7) score += 10;
      return score;
    };

    const healthScores = engagementData.map(getUserHealthScore);
    const avgHealthScore = healthScores.length > 0 
      ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length) 
      : 0;

    // Growth rate
    const growthRate = previousPeriodUsers.length > 0 
      ? Math.round(((currentPeriodUsers.length - previousPeriodUsers.length) / previousPeriodUsers.length) * 100)
      : currentPeriodUsers.length > 0 ? 100 : 0;

    // Engagement rate
    const engagementRate = engagementData.length > 0 
      ? Math.round((activeUsers.length / engagementData.length) * 100) 
      : 0;

    // Onboarding completion rate
    const onboardingRate = engagementData.length > 0 
      ? Math.round((onboardedUsers.length / engagementData.length) * 100) 
      : 0;

    // Average metrics per user
    const avgPatientsPerUser = activeUsers.length > 0 
      ? (totalPatients / activeUsers.length).toFixed(1) 
      : '0';
    const avgMealPlansPerUser = activeUsers.length > 0 
      ? (totalMealPlans / activeUsers.length).toFixed(1) 
      : '0';

    // Trial users (within 33 days)
    const trialUsers = nutritionists.filter(n => 
      differenceInDays(now, new Date(n.created_at)) <= 33
    );

    // Expired trial users
    const expiredTrialUsers = nutritionists.filter(n => 
      differenceInDays(now, new Date(n.created_at)) > 33
    );

    return {
      totalUsers: nutritionists.length,
      newUsersThisPeriod: currentPeriodUsers.length,
      previousPeriodUsers: previousPeriodUsers.length,
      activeUsers: activeUsers.length,
      inactiveUsers: inactiveUsers.length,
      onboardedUsers: onboardedUsers.length,
      recentlyActive: recentlyActive.length,
      totalPatients,
      totalMealPlans,
      totalAppointments,
      engagementRate,
      onboardingRate,
      avgHealthScore,
      growthRate,
      avgPatientsPerUser,
      avgMealPlansPerUser,
      trialUsers: trialUsers.length,
      expiredTrialUsers: expiredTrialUsers.length,
      activeList: activeUsers,
      inactiveList: inactiveUsers,
    };
  }, [engagementData, nutritionists, dateRange]);

  // Registration trend data
  const registrationTrendData = useMemo(() => {
    const days = parseInt(dateRange);
    const data = [];
    const today = startOfDay(new Date());
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'dd/MM');
      
      const registrations = nutritionists.filter(n => {
        const regDate = format(startOfDay(new Date(n.created_at)), 'yyyy-MM-dd');
        return regDate === dateStr;
      }).length;
      
      // Calculate cumulative active users up to this date
      const cumulativeActive = engagementData.filter(u => {
        const userDate = startOfDay(new Date(u.created_at));
        return userDate <= date && (u.total_patients > 0 || u.total_meal_plans > 0);
      }).length;
      
      data.push({ 
        date: displayDate, 
        registrations,
        activeUsers: cumulativeActive
      });
    }
    
    return data;
  }, [nutritionists, engagementData, dateRange]);

  // Engagement funnel data
  const funnelData = useMemo(() => [
    { name: 'Cadastrados', value: engagementData.length, fill: 'hsl(var(--primary))' },
    { name: 'Onboarding', value: stats.onboardedUsers, fill: 'hsl(var(--info))' },
    { name: 'Com Pacientes', value: stats.activeUsers, fill: 'hsl(var(--success))' },
    { name: 'Ativos (7d)', value: stats.recentlyActive, fill: 'hsl(var(--warning))' },
  ], [engagementData.length, stats]);

  // User status distribution
  const statusDistribution = useMemo(() => [
    { name: 'Ativos', value: stats.activeUsers, color: 'hsl(var(--success))' },
    { name: 'Inativos', value: stats.inactiveUsers, color: 'hsl(var(--destructive))' },
  ], [stats]);

  // License distribution
  const licenseDistribution = useMemo(() => [
    { name: 'Em Teste', value: stats.trialUsers, color: 'hsl(var(--info))' },
    { name: 'Expirados', value: stats.expiredTrialUsers, color: 'hsl(var(--destructive))' },
  ], [stats]);

  // Activity distribution
  const activityData = useMemo(() => [
    { name: 'Pacientes', value: stats.totalPatients, fill: 'hsl(var(--primary))' },
    { name: 'Planos', value: stats.totalMealPlans, fill: 'hsl(var(--info))' },
    { name: 'Consultas', value: stats.totalAppointments, fill: 'hsl(var(--warning))' },
  ], [stats]);

  // Filtered users for table
  const filteredUsers = useMemo(() => {
    let users = engagementData;
    
    if (statusFilter === 'active') {
      users = users.filter(u => u.total_patients > 0 || u.total_meal_plans > 0);
    } else if (statusFilter === 'inactive') {
      users = users.filter(u => u.total_patients === 0 && u.total_meal_plans === 0);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      users = users.filter(u => 
        u.full_name.toLowerCase().includes(term) ||
        (u.email && u.email.toLowerCase().includes(term))
      );
    }
    
    return users;
  }, [engagementData, statusFilter, searchTerm]);

  // Send nudge email
  const handleSendNudgeEmail = async (user: UserEngagementData) => {
    if (!user.email) {
      toast.error('Usuário não possui email cadastrado');
      return;
    }

    setSendingEmailTo(user.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-nudge-email', {
        body: { name: user.full_name, email: user.email },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('E-mail enviado com sucesso!');
      } else {
        throw new Error(data?.error || 'Erro ao enviar email');
      }
    } catch (error: any) {
      console.error('Error sending nudge email:', error);
      toast.error(error.message || 'Erro ao enviar e-mail');
    } finally {
      setSendingEmailTo(null);
    }
  };

  // Send bulk email to all inactive users
  const handleSendBulkEmail = async () => {
    const inactiveWithEmail = stats.inactiveList.filter(u => u.email);
    
    if (inactiveWithEmail.length === 0) {
      toast.error('Nenhum usuário inativo com email');
      return;
    }

    setSendingBulkEmail(true);
    let successCount = 0;
    let errorCount = 0;

    for (const user of inactiveWithEmail) {
      try {
        const { data, error } = await supabase.functions.invoke('send-nudge-email', {
          body: { name: user.full_name, email: user.email },
        });

        if (error || !data?.success) {
          errorCount++;
        } else {
          successCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setSendingBulkEmail(false);
    toast.success(`Enviados: ${successCount} | Erros: ${errorCount}`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Nome', 'Email', 'Cadastro', 'Onboarding', 'Pacientes', 'Planos', 'Consultas', 'Última Atividade', 'Status'];
    const rows = filteredUsers.map(u => [
      u.full_name,
      u.email || '',
      format(new Date(u.created_at), 'dd/MM/yyyy'),
      u.has_seen_onboarding ? 'Sim' : 'Não',
      u.total_patients,
      u.total_meal_plans,
      u.total_appointments,
      u.last_activity ? format(new Date(u.last_activity), 'dd/MM/yyyy HH:mm') : '-',
      (u.total_patients > 0 || u.total_meal_plans > 0) ? 'Ativo' : 'Inativo'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('Relatório exportado!');
  };

  // Get user health indicator
  const getUserHealthIndicator = (user: UserEngagementData) => {
    const now = new Date();
    let score = 0;
    if (user.has_seen_onboarding) score += 1;
    if (user.total_patients > 0) score += 2;
    if (user.total_meal_plans > 0) score += 1;
    if (user.last_activity && differenceInDays(now, new Date(user.last_activity)) <= 7) score += 1;
    
    if (score >= 4) return { color: 'bg-success', label: 'Saudável' };
    if (score >= 2) return { color: 'bg-warning', label: 'Em risco' };
    return { color: 'bg-destructive', label: 'Crítico' };
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendValue,
    iconColor = 'text-primary',
    bgColor = 'bg-primary/10'
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    iconColor?: string;
    bgColor?: string;
  }) => (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-xs ${
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
             trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
            {trendValue}
          </div>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
    </GlassCard>
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <NeonText as="h2" color="primary" className="text-xl font-bold">
            Dashboard de Analytics
          </NeonText>
          <p className="text-sm text-muted-foreground">
            Visão completa do engajamento e crescimento
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-32 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="14">14 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loadingEngagement}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loadingEngagement ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard 
          title="Total Usuários" 
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard 
          title="Novos no Período" 
          value={stats.newUsersThisPeriod}
          icon={TrendingUp}
          trend={stats.growthRate > 0 ? 'up' : stats.growthRate < 0 ? 'down' : 'neutral'}
          trendValue={`${stats.growthRate > 0 ? '+' : ''}${stats.growthRate}%`}
          iconColor="text-success"
          bgColor="bg-success/10"
        />
        <StatCard 
          title="Engajados" 
          value={stats.activeUsers}
          subtitle={`${stats.engagementRate}% do total`}
          icon={UserCheck}
          iconColor="text-success"
          bgColor="bg-success/10"
        />
        <StatCard 
          title="Inativos" 
          value={stats.inactiveUsers}
          icon={UserX}
          iconColor="text-destructive"
          bgColor="bg-destructive/10"
        />
        <StatCard 
          title="Em Teste" 
          value={stats.trialUsers}
          icon={Clock}
          iconColor="text-info"
          bgColor="bg-info/10"
        />
        <StatCard 
          title="Health Score" 
          value={`${stats.avgHealthScore}%`}
          icon={Award}
          iconColor="text-warning"
          bgColor="bg-warning/10"
        />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Onboarding Completo" 
          value={`${stats.onboardingRate}%`}
          subtitle={`${stats.onboardedUsers} usuários`}
          icon={CheckCircle}
          iconColor="text-success"
          bgColor="bg-success/10"
        />
        <StatCard 
          title="Ativos (7 dias)" 
          value={stats.recentlyActive}
          icon={Eye}
          iconColor="text-info"
          bgColor="bg-info/10"
        />
        <StatCard 
          title="Total Pacientes" 
          value={stats.totalPatients}
          subtitle={`Média: ${stats.avgPatientsPerUser}/usuário`}
          icon={Users}
          iconColor="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard 
          title="Planos Criados" 
          value={stats.totalMealPlans}
          subtitle={`Média: ${stats.avgMealPlansPerUser}/usuário`}
          icon={Utensils}
          iconColor="text-info"
          bgColor="bg-info/10"
        />
        <StatCard 
          title="Consultas" 
          value={stats.totalAppointments}
          icon={CalendarDays}
          iconColor="text-warning"
          bgColor="bg-warning/10"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Registration & Activity Trend */}
        <GlassCard className="lg:col-span-2 p-6">
          <NeonText as="h3" color="primary" className="font-semibold mb-4">
            Tendência de Cadastros e Engajamento
          </NeonText>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={registrationTrendData}>
              <defs>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="registrations" 
                name="Novos Cadastros"
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorReg)" 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="activeUsers" 
                name="Usuários Ativos"
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Engagement Funnel */}
        <GlassCard className="p-6">
          <NeonText as="h3" color="primary" className="font-semibold mb-4">
            Funil de Engajamento
          </NeonText>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <GlassCard className="p-6">
          <NeonText as="h3" color="primary" className="font-semibold mb-4">
            Distribuição de Status
          </NeonText>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* License Distribution */}
        <GlassCard className="p-6">
          <NeonText as="h3" color="primary" className="font-semibold mb-4">
            Licenças
          </NeonText>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={licenseDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {licenseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Activity Distribution */}
        <GlassCard className="p-6">
          <NeonText as="h3" color="primary" className="font-semibold mb-4">
            Atividades Totais
          </NeonText>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* User Engagement Table */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <NeonText as="h3" color="primary" className="font-semibold">
            Detalhamento de Usuários
          </NeonText>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-background/50 h-8 text-sm"
              />
              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-28 bg-background/50 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSendBulkEmail}
              disabled={sendingBulkEmail || stats.inactiveUsers === 0}
              className="border-warning/30 text-warning hover:bg-warning/10"
            >
              {sendingBulkEmail ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Mail className="w-4 h-4 mr-1" />
              )}
              Enviar p/ Inativos ({stats.inactiveUsers})
            </Button>
          </div>
        </div>

        {loadingEngagement ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Saúde</TableHead>
                  <TableHead>Nutricionista</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-center">Pacientes</TableHead>
                  <TableHead className="text-center">Planos</TableHead>
                  <TableHead className="text-center">Consultas</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const isActive = user.total_patients > 0 || user.total_meal_plans > 0;
                    const health = getUserHealthIndicator(user);
                    return (
                      <TableRow key={user.id} className="border-border/30">
                        <TableCell>
                          <div className={`w-3 h-3 rounded-full ${health.color}`} title={health.label} />
                        </TableCell>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                          {user.email || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(user.created_at), 'dd/MM/yy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-center">{user.total_patients}</TableCell>
                        <TableCell className="text-center">{user.total_meal_plans}</TableCell>
                        <TableCell className="text-center">{user.total_appointments}</TableCell>
                        <TableCell className="text-sm">
                          {user.last_activity 
                            ? format(new Date(user.last_activity), 'dd/MM HH:mm', { locale: ptBR })
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={isActive ? 'default' : 'secondary'}
                            className={isActive ? 'bg-success/20 text-success border-success/30' : 'bg-destructive/20 text-destructive border-destructive/30'}
                          >
                            {isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!isActive && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSendNudgeEmail(user)}
                              disabled={sendingEmailTo === user.id}
                              className="h-7 px-2"
                            >
                              {sendingEmailTo === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-3">
          Mostrando {filteredUsers.length} de {engagementData.length} usuários
        </p>
      </GlassCard>
    </div>
  );
}
