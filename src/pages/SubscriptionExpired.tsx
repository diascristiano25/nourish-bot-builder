import { Clock, Mail, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import logoImg from '@/assets/logo.png';

export default function SubscriptionExpired() {
  const whatsappNumber = '5511999999999'; // Replace with actual support number
  const whatsappMessage = encodeURIComponent('Olá! Minha licença do NutriFlow expirou e gostaria de renovar.');
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-amber-500/50">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={logoImg} alt="NutriFlow" className="w-16 h-16 object-contain" />
          </div>
          
          {/* Icon */}
          <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          
          {/* Title and Description */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-amber-600">Período de Teste Expirado</h1>
            <p className="text-muted-foreground">
              Seu período de teste de <strong>33 dias</strong> como Membro Fundador chegou ao fim.
            </p>
          </div>
          
          {/* Benefits Reminder */}
          <div className="bg-muted/50 rounded-lg p-4 text-left">
            <p className="text-sm font-medium mb-2">Continue aproveitando:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Geração de cardápios com IA</li>
              <li>✓ Gestão completa de pacientes</li>
              <li>✓ Portal do paciente personalizado</li>
              <li>✓ Suporte prioritário</li>
            </ul>
          </div>
          
          {/* Contact Section */}
          <div className="pt-4 border-t space-y-4">
            <p className="text-sm text-muted-foreground">
              Entre em contato com a equipe FlowTech Group para renovar sua assinatura:
            </p>
            
            <div className="flex flex-col gap-3">
              <Button 
                variant="default" 
                className="w-full"
                asChild
              >
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar no WhatsApp
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href="mailto:contato@flowtechgroup.com.br">
                  <Mail className="w-4 h-4 mr-2" />
                  contato@flowtechgroup.com.br
                </a>
              </Button>
            </div>
          </div>
          
          {/* Footer */}
          <p className="text-xs text-muted-foreground pt-4">
            FlowTech Group - CNPJ: 46.684.547/0001-54
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
