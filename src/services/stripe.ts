// Stripe integration service
import { loadStripe } from '@stripe/js';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export const stripe = loadStripe(STRIPE_PUBLIC_KEY);

interface CreateCheckoutSessionRequest {
  priceId: string;
  userId: string;
  email: string;
}

export async function createCheckoutSession(request: CreateCheckoutSessionRequest) {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    const stripeInstance = await stripe;

    if (!stripeInstance) {
      throw new Error('Stripe failed to load');
    }

    const { error } = await stripeInstance.redirectToCheckout({ sessionId });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
}

export interface PricingPlan {
  id: string;
  name: string;
  priceId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    amount: 99,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Até 20 pacientes',
      'Gerador de cardápios com IA',
      'Relatórios básicos',
      'Suporte por email',
      'App mobile do paciente',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    amount: 299,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Até 100 pacientes',
      'Gerador avançado com IA',
      'Relatórios detalhados',
      'Agendamento integrado',
      'Notificações para pacientes',
      'Suporte prioritário',
      'Analytics de resultados',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
    amount: 0,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Pacientes ilimitados',
      'IA customizada',
      'Relatórios executive',
      'API integrada',
      'Suporte dedicado 24/7',
      'Treinamento da equipe',
      'White-label disponível',
    ],
  },
];

export async function handleSubscriptionUpdate(userId: string, priceId: string) {
  try {
    const response = await fetch('/api/update-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, priceId }),
    });

    if (!response.ok) throw new Error('Failed to update subscription');
    return response.json();
  } catch (error) {
    console.error('Subscription update error:', error);
    throw error;
  }
}

export async function cancelSubscription(userId: string) {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) throw new Error('Failed to cancel subscription');
    return response.json();
  } catch (error) {
    console.error('Cancellation error:', error);
    throw error;
  }
}
