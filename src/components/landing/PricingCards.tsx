import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from '@phosphor-icons/react';
import { pricingPlans } from '@/data/landingContent';

export function PricingCards(): JSX.Element {
  const handlePlanClick = (planId: string, ctaLink: string) => {
    const url = `${ctaLink}?plan=${planId}`;
    console.log('Navigate to:', url);
    // TODO: actual navigation when signup flow exists
  };

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Planos e Preços
          </h2>
          <p className="text-xl text-slate-600">
            Teste grátis por 14 dias, sem cartão de crédito
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.highlighted
                  ? 'border-2 border-emerald-500 shadow-lg'
                  : 'border border-slate-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-slate-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    R$ {plan.price}
                  </span>
                  <span className="text-slate-600">/mês</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        size={20}
                        weight="bold"
                        className="text-emerald-500 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                  onClick={() => handlePlanClick(plan.id, plan.ctaLink)}
                >
                  {plan.ctaText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
