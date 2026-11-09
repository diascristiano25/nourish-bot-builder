// Client-side billing helpers. All privileged work happens in Edge Functions.
import { supabase } from '@/integrations/supabase/client';

export type Plan = 'starter' | 'pro' | 'enterprise';
export type BillingAccess = 'admin' | 'licensed' | 'subscription' | 'trial' | 'expired' | 'none';
export type BillingRole = 'nutritionist' | 'patient' | 'none';

export const BILLING_WHATSAPP_URL =
  'https://wa.me/5513996205253?text=' +
  encodeURIComponent('Olá! Tenho dúvidas sobre a assinatura do NutriFlow.');

export interface MyBillingAccess {
  access: BillingAccess;
  role: BillingRole;
}

// Access of the logged-in user. Patients inherit the access of their nutritionist.
export async function getMyBillingAccess(): Promise<MyBillingAccess> {
  const { data, error } = await (supabase as any).rpc('get_my_billing_access');
  if (error) throw error;
  return data as MyBillingAccess;
}

export const PLAN_OPTIONS: { id: Plan; name: string; price: string; features: string[] }[] = [
  { id: 'starter', name: 'Starter', price: 'R$ 39,90/mês', features: ['Até 20 pacientes ativos', 'Gerador de cardápios com IA', 'Relatórios básicos', 'Suporte por email'] },
  { id: 'pro', name: 'Pro', price: 'R$ 69,90/mês', features: ['Até 100 pacientes ativos', 'Gerador avançado com IA', 'Relatórios detalhados', 'Agendamento online', 'Suporte prioritário'] },
  { id: 'enterprise', name: 'Enterprise', price: 'R$ 109,90/mês', features: ['Pacientes ilimitados', 'IA customizada', 'Relatórios executive board', 'API integrada', 'Gerente de sucesso dedicado'] },
];

export async function getActiveSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions' as any)
    .select('plan, status, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as null | { plan: Plan; status: string; current_period_end: string | null; cancel_at_period_end: boolean };
}

async function redirectTo(fn: 'create-checkout' | 'create-portal', body?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(fn, { body: body ?? {} });
  if (error) throw error;
  if (!data?.url) throw new Error('Resposta sem URL de pagamento');
  window.location.href = data.url as string;
}

export const startCheckout = (plan: Plan) => redirectTo('create-checkout', { plan });
export const openBillingPortal = () => redirectTo('create-portal');
