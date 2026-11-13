// Fonte única de verdade para o status de conta dos nutricionistas no painel admin.
// Espelha a regra do banco (get_billing_access):
//   licença manual (account_status = 'active') > assinatura Stripe > trial vigente > expirado.
export type AccessState = 'licensed' | 'subscription' | 'trial' | 'expired';

export interface AccessProfile {
  user_id: string;
  account_status: string | null;
  trial_ends_at: string | null;
}

export interface SubscriptionRow {
  user_id: string;
  status: string;
  current_period_end: string | null;
}

export const getAccessState = (
  p: AccessProfile,
  subscriptions: SubscriptionRow[] = [],
  now = new Date(),
): AccessState => {
  if (p.account_status === 'active') return 'licensed';
  const hasSub = subscriptions.some(
    s =>
      s.user_id === p.user_id &&
      ['active', 'trialing', 'past_due'].includes(s.status) &&
      (!s.current_period_end || new Date(s.current_period_end) > now),
  );
  if (hasSub) return 'subscription';
  if (p.trial_ends_at && new Date(p.trial_ends_at) > now) return 'trial';
  return 'expired';
};

// "Ativo" = tem acesso pago/liberado. "Inativo" = sem acesso (trial vencido ou cancelado).
export const isPayingActive = (s: AccessState) => s === 'licensed' || s === 'subscription';
export const isInactive = (s: AccessState) => s === 'expired';

export const ACCESS_LABEL: Record<AccessState, string> = {
  licensed: 'Ativo (licença)',
  subscription: 'Ativo (assinatura)',
  trial: 'Trial',
  expired: 'Inativo',
};
