import { ShieldX, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive/50">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-destructive">Acesso Suspenso</h1>
            <p className="text-muted-foreground">
              Sua conta foi temporariamente suspensa.
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Por favor, entre em contato com o Suporte do NutriFlow:
            </p>
            <a 
              href="mailto:suportenutriflow@gmail.com"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <Mail className="w-4 h-4" />
              suportenutriflow@gmail.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
