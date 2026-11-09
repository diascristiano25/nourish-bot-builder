import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  PLAN_OPTIONS, Plan, BillingAccess, getBillingAccess, getActiveSubscription,
  startCheckout, openBillingPortal,
} from '@/services/billing';

export default function Assinatura() {
  const { user } = useAuth() as { user: { id: string } | null };
  const [params] = useSearchParams();
  const [access, setAccess] = useState<BillingAccess | null>(null);
  const [sub, setSub] = useState<Awaited<ReturnType<typeof getActiveSubscription>>>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([getBillingAccess(user.id), getActiveSubscription(user.id)])
      .then(([a, s]) => { setAccess(a); setSub(s); })
      .catch(() => toast.error('Não foi possível carregar sua assinatura.'));
  }, [user]);

  useEffect(() => {
    if (params.get('status') === 'success') toast.success('Pagamento recebido. Sua assinatura está sendo ativada.');
    if (params.get('status') === 'cancelled') toast.message('Checkout cancelado. Nada foi cobrado.');
  }, [params]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try { await fn(); } catch (e) { toast.error((e as Error).message || 'Erro ao abrir pagamento'); setBusy(null); }
  };

  const statusLabel = access === 'subscription' ? 'Assinatura ativa'
    : access === 'trial' ? 'Período de teste'
    : access === 'expired' ? 'Teste encerrado' : 'Carregando...';

  return (
    <ModernLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Assinatura</h1>
          <p className="text-muted-foreground">Status: <strong>{statusLabel}</strong>
            {sub && ` · Plano ${sub.plan}${sub.cancel_at_period_end ? ' (cancela no fim do período)' : ''}`}
          </p>
        </header>

        {sub && (
          <Button variant="outline" disabled={busy !== null} onClick={() => run('portal', openBillingPortal)}>
            Gerenciar cartão e cancelamento
          </Button>
        )}

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
                  disabled={busy !== null || (sub?.status === 'active' && sub.plan === p.id)}
                  onClick={() => run(p.id, () => startCheckout(p.id as Plan))}
                >
                  {sub?.plan === p.id && sub.status === 'active' ? 'Plano atual' : 'Assinar com cartão ou Pix'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ModernLayout>
  );
}
