// Fonte única de verdade para o status de conta dos nutricionistas no painel admin.
// Espelha a regra do banco (get_billing_access):
//   licença manual (account_status = 'active') > assinatura Stripe > trial vigente > expirado.
export type AccessState = 'licensed' | 'subscription' | 'trial' | 'expired';

export interface AccessProfile {
  user_id: string;
  account_status: string | null;
  trial_ends_at: string | null;
  last_login_at?: string | null;
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

// Licença (getAccessState) e atividade são coisas diferentes: uma conta nova com trial vigente
// tem licença "Trial", mas conta como "Inativo" enquanto nunca tiver feito login.
export type ActivityStatus = 'active' | 'trial' | 'inactive';

export const getActivityStatus = (access: AccessState, p: AccessProfile): ActivityStatus => {
  if (access === 'licensed' || access === 'subscription') return 'active';
  if (access === 'trial' && p.last_login_at) return 'trial';
  return 'inactive';
};

export const ACTIVITY_LABEL: Record<ActivityStatus, string> = {
  active: 'Ativo',
  trial: 'Trial',
  inactive: 'Inativo',
};
