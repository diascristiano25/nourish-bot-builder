import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Construction } from 'lucide-react';

const Financeiro = () => {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie suas finanças</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Construction className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">Módulo em desenvolvimento</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Em breve você poderá gerenciar pagamentos, gerar relatórios financeiros e muito mais.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Financeiro;
