import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Loader2, AlertTriangle, Zap, Clock, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logAdminAction } from '@/lib/admin-audit';
import { motion } from 'framer-motion';

interface FeatureFlags {
  ai_meal_plans: boolean;
  chat: boolean;
  paid_traffic: boolean;
}

interface MaintenanceMode {
  enabled: boolean;
  message: string;
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trialDays, setTrialDays] = useState(33);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    ai_meal_plans: true,
    chat: true,
    paid_traffic: true,
  });
  const [maintenance, setMaintenance] = useState<MaintenanceMode>({
    enabled: false,
    message: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value');

      if (error) throw error;

      (data || []).forEach(row => {
        if (row.key === 'trial_duration_days') {
          setTrialDays(Number(row.value) || 33);
        } else if (row.key === 'feature_flags') {
          setFeatureFlags(prev => ({ ...prev, ...(row.value as FeatureFlags) }));
        } else if (row.key === 'maintenance_mode') {
          setMaintenance(prev => ({ ...prev, ...(row.value as MaintenanceMode) }));
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: 'trial_duration_days', value: trialDays },
        { key: 'feature_flags', value: featureFlags },
        { key: 'maintenance_mode', value: maintenance },
      ];

      for (const item of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert({ key: item.key, value: item.value, updated_at: new Date().toISOString() });

        if (error) throw error;
      }

      await logAdminAction('update_settings', 'admin_settings', undefined, {
        trial_days: trialDays,
        feature_flags: featureFlags,
        maintenance_enabled: maintenance.enabled,
      });

      toast.success('Configurações salvas com sucesso');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="h-32 rounded-3xl bg-muted/30 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-xl bg-muted/30 animate-pulse" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Configurações"
          subtitle="Gerencie configurações globais da plataforma"
          icon={<Settings className="w-7 h-7 text-white" />}
          actions={
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Alterações
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trial Duration */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <NeonText as="h3" color="primary" className="font-semibold">Duração do Trial</NeonText>
              </div>
              <div className="space-y-3">
                <Label htmlFor="trial-days">Dias de teste gratuito</Label>
                <Input
                  id="trial-days"
                  type="number"
                  min={1}
                  max={365}
                  value={trialDays}
                  onChange={(e) => setTrialDays(parseInt(e.target.value) || 33)}
                />
                <p className="text-xs text-muted-foreground">
                  Novos nutricionistas terão este período de teste antes de precisar assinar.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Feature Flags */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <NeonText as="h3" color="primary" className="font-semibold">Feature Flags</NeonText>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">AI Meal Plans</p>
                    <p className="text-xs text-muted-foreground">Geração de cardápios por IA</p>
                  </div>
                  <Switch
                    checked={featureFlags.ai_meal_plans}
                    onCheckedChange={(v) => setFeatureFlags(prev => ({ ...prev, ai_meal_plans: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Chat em Tempo Real</p>
                    <p className="text-xs text-muted-foreground">Mensagens entre nutri e paciente</p>
                  </div>
                  <Switch
                    checked={featureFlags.chat}
                    onCheckedChange={(v) => setFeatureFlags(prev => ({ ...prev, chat: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Tráfego Pago</p>
                    <p className="text-xs text-muted-foreground">Agente de campanhas Meta Ads</p>
                  </div>
                  <Switch
                    checked={featureFlags.paid_traffic}
                    onCheckedChange={(v) => setFeatureFlags(prev => ({ ...prev, paid_traffic: v }))}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Maintenance Mode */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-orange-600" />
                </div>
                <NeonText as="h3" color="primary" className="font-semibold">Modo Manutenção</NeonText>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Ativar Manutenção</p>
                    <p className="text-xs text-muted-foreground">Exibe banner global no app</p>
                  </div>
                  <Switch
                    checked={maintenance.enabled}
                    onCheckedChange={(v) => setMaintenance(prev => ({ ...prev, enabled: v }))}
                  />
                </div>
                {maintenance.enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="maint-msg">Mensagem de manutenção</Label>
                    <Textarea
                      id="maint-msg"
                      value={maintenance.message}
                      onChange={(e) => setMaintenance(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Estamos em manutenção. Voltamos em breve!"
                      rows={3}
                    />
                  </div>
                )}
                {maintenance.enabled && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Banner ativo: todos os usuários verão esta mensagem.</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* System Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-emerald-600" />
                </div>
                <NeonText as="h3" color="primary" className="font-semibold">Informações do Sistema</NeonText>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Versão</span>
                  <span className="font-medium">2.1.0</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Ambiente</span>
                  <span className="font-medium">Production</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Última atualização</span>
                  <span className="font-medium">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Admin</span>
                  <span className="font-medium">diascristianoconsultor@gmail.com</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}