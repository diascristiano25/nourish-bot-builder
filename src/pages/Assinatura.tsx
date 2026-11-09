import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Info, MessageCircle, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMyBillingAccess, MY_BILLING_ACCESS_KEY } from '@/hooks/useMyBillingAccess';
import {
  PLAN_OPTIONS, Plan, PayMethod, BillingAccess, BILLING_WHATSAPP_URL,
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
      toast.success('Acesso liberado!');
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

  const hasCardSub = sub?.kind === 'card' && sub.status === 'active';
  const pixActive = sub?.kind === 'pix' && sub.status === 'active' && (daysLeft(sub.current_period_end) ?? 0) > 0;
  const isCancelling = hasCardSub && !!sub?.cancel_at_period_end;
  const endDateLabel = sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString('pt-BR') : null;

  const statusText = isCancelling ? 'Assinatura cancelada' : STATUS_LABEL[access];

  return (
    <ModernLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Assinatura</h1>
          <p className="text-muted-foreground">
            Status: <strong>{statusText}</strong>
            {remaining !== null && ` · ${remaining} ${remaining === 1 ? 'dia restante' : 'dias restantes'}`}
            {sub && access === 'subscription' && ` · Plano ${sub.plan}${sub.kind === 'pix' ? ' (Pix)' : ''}`}
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

        {pixActive && (
          <div className="flex gap-3 rounded-xl border border-sky-500/40 bg-sky-500/10 p-4">
            <Info className="h-5 w-5 shrink-0 text-sky-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Acesso via Pix{endDateLabel ? ` até ${endDateLabel}` : ''}</p>
              <p className="text-sm text-muted-foreground">
                O Pix não renova sozinho. Para continuar, pague de novo antes do vencimento:
                os 30 dias novos são somados ao tempo que ainda resta.
              </p>
            </div>
          </div>
        )}

        {access === 'subscription' && justPaid && !isCancelling && (
          <div className="flex gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
            <p className="text-sm">Pagamento confirmado. Seu acesso e o dos seus pacientes está liberado.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {hasCardSub && (
            <Button variant="outline" disabled={busy !== null} onClick={() => run('portal', openBillingPortal)}>
              Gerenciar cartão e cancelamento
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2">
            <a href={BILLING_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Tirar dúvidas no WhatsApp
            </a>
          </Button>
          {hasCardSub && (
            <p className="w-full text-xs text-muted-foreground">
              Ao cancelar, o acesso é encerrado imediatamente, sem reembolso do período já pago.
            </p>
          )}
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
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    disabled={busy !== null || hasCardSub}
                    onClick={() => run(`${p.id}-card`, () => startCheckout(p.id as Plan, 'card' as PayMethod))}
                  >
                    {sub?.kind === 'card' && sub.plan === p.id && hasCardSub ? 'Plano atual' : 'Assinar com cartão (mensal)'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    disabled={busy !== null || hasCardSub}
                    onClick={() => run(`${p.id}-pix`, () => startCheckout(p.id as Plan, 'pix' as PayMethod))}
                  >
                    <QrCode className="h-4 w-4" />
                    {pixActive ? 'Renovar 30 dias com Pix' : 'Pagar 30 dias com Pix'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Cartão: cobrança mensal automática, cancele quando quiser. Pix: pagamento único de 30 dias, sem renovação automática.
        </p>
      </div>
    </ModernLayout>
  );
}
