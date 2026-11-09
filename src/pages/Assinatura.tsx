import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMyBillingAccess, MY_BILLING_ACCESS_KEY } from '@/hooks/useMyBillingAccess';
import {
  PLAN_OPTIONS, Plan, BillingAccess, BILLING_WHATSAPP_URL,
  getActiveSubscription, startCheckout, openBillingPortal,
} from '@/services/billing';

const STATUS_LABEL: Record<BillingAccess, string> = {
  admin: 'Administrador',
  licensed: 'Licença ativa',
  subscription: 'Assinatura ativa',
  trial: 'Período de teste',
  expired: 'Teste encerrado',
  none: '...',
};

function daysLeft(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 86_400_000) : 0;
}

export default function Assinatura() {
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const justPaid = params.get('status') === 'success';
  const [busy, setBusy] = useState<string | null>(null);

  // After paying, the webhook may take a few seconds: keep checking until access is released.
  const { data: billing, user } = useMyBillingAccess({ refetchInterval: justPaid ? 3000 : false });
  const access = billing?.access ?? 'none';
  const isExpired = access === 'expired';

  const { data: sub } = useQuery({
    queryKey: ['active-subscription', user?.id, access],
    queryFn: () => getActiveSubscription(user!.id),
    enabled: !!user,
  });

  const { data: trialEndsAt } = useQuery({
    queryKey: ['trial-ends-at', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('trial_ends_at').eq('user_id', user!.id).maybeSingle();
      return (data?.trial_ends_at as string | null) ?? null;
    },
  });
  const remaining = access === 'trial' ? daysLeft(trialEndsAt) : null;

  useEffect(() => {
    if (justPaid) toast.success('Pagamento recebido. Sua assinatura está sendo ativada.');
    if (params.get('status') === 'cancelled') toast.message('Checkout cancelado. Nada foi cobrado.');
  }, [justPaid, params]);

  useEffect(() => {
    if (justPaid && access === 'subscription') {
      queryClient.invalidateQueries({ queryKey: [MY_BILLING_ACCESS_KEY] });
      toast.success('Assinatura ativada! Seu acesso está liberado.');
    }
  }, [justPaid, access, queryClient]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast.error((e as Error).message || 'Erro ao abrir pagamento');
      setBusy(null);
    }
  };

  const currentPlan = sub?.status === 'active' ? sub.plan : null;
  const isCancelling = !!sub?.cancel_at_period_end && sub.status === 'active';
  const endDateLabel = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('pt-BR')
    : null;

  return (
    <ModernLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Assinatura</h1>
          <p className="text-muted-foreground">
            Status: <strong>{isCancelling && access === 'subscription' ? 'Assinatura cancelada' : STATUS_LABEL[access]}</strong>
            {remaining !== null && ` · ${remaining} ${remaining === 1 ? 'dia restante' : 'dias restantes'}`}
            {sub && ` · Plano ${sub.plan}`}
          </p>
        </header>

        {isExpired && (
          <div className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Seu período de teste terminou</p>
              <p className="text-sm text-muted-foreground">
                Para voltar a usar o NutriFlow e liberar o acesso dos seus pacientes, assine um plano abaixo.
                Se ficou com alguma dúvida, fale com a gente no WhatsApp.
              </p>
            </div>
          </div>
        )}

        {isCancelling && (
          <div className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Cancelamento agendado</p>
              <p className="text-sm text-muted-foreground">
                Sua assinatura não será renovada. Você continua com acesso completo
                {endDateLabel ? ` até ${endDateLabel}` : ' até o fim do período já pago'}.
                Para mudar de ideia, use "Gerenciar cartão e cancelamento" e reative a assinatura.
              </p>
            </div>
          </div>
        )}

        {access === 'subscription' && justPaid && !isCancelling && (
          <div className="flex gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
            <p className="text-sm">Assinatura ativada. Seu acesso e o dos seus pacientes está liberado.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {sub && (
            <Button variant="outline" disabled={busy !== null} onClick={() => run('portal', openBillingPortal)}>
              Gerenciar cartão e cancelamento
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2">
            <a href={BILLING_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Tirar dúvidas no WhatsApp
            </a>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLAN_OPTIONS.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>{p.price}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm space-y-1">{p.features.map((f) => <li key={f}>• {f}</li>)}</ul>
                <Button
                  className="w-full"
                  disabled={busy !== null || currentPlan === p.id}
                  onClick={() => run(p.id, () => startCheckout(p.id as Plan))}
                >
                  {currentPlan === p.id ? 'Plano atual' : 'Assinar com cartão'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ModernLayout>
  );
}
