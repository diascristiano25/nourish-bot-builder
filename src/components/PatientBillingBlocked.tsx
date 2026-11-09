import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import logoImg from '@/assets/logo.png';

// Shown to patients when their nutritionist has no active trial or plan.
export function PatientBillingBlocked() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-5">
          <img src={logoImg} alt="NutriFlow" className="w-14 h-14 object-contain mx-auto" />
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold">Acesso temporariamente indisponível</h1>
            <p className="text-muted-foreground">
              O acesso ao seu plano alimentar está pausado no momento.
              Entre em contato com o seu nutricionista para mais informações.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
