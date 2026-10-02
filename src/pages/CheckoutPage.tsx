import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { loadStripe } from '@stripe/js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { PRICING_PLANS } from '@/services/stripe';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export default function CheckoutPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    if (!user?.email) {
      setError('User email not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call backend to create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const { sessionId } = await response.json();
      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);

      if (!stripe) throw new Error('Stripe failed to load');

      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Escolha seu Plano</h1>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {PRICING_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`p-8 ${
              selectedPlan === plan.id
                ? 'border-[#1CBFA5] bg-[#1CBFA5]/5'
                : 'border-gray-700'
            }`}
          >
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-gray-400 mb-6">
              {plan.amount === 0
                ? 'Customizado'
                : `R$ ${plan.amount.toFixed(0)}/mês`}
            </p>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="text-sm text-gray-300">
                  ✓ {feature}
                </li>
              ))}
            </ul>

            {plan.amount > 0 ? (
              <Button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loading}
                className="w-full bg-[#1CBFA5] hover:bg-[#0E9B8A] text-black font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assinar Agora'}
              </Button>
            ) : (
              <Button variant="outline" className="w-full">
                Fale com Vendas
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
