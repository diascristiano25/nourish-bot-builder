import { useState } from 'react';
import { PatientData } from '@/pages/PatientMobileApp';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PatientChat } from './PatientChat';
import { 
  User, 
  Bell, 
  LogOut,
  ChevronRight,
  Moon,
  Shield,
  HelpCircle,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientPerfilProps {
  patient: PatientData;
  onSignOut: () => void;
}

const goalLabels: Record<string, string> = {
  weight_loss: 'Emagrecimento',
  hypertrophy: 'Hipertrofia',
  maintenance: 'Manutenção',
  health: 'Saúde',
  performance: 'Performance',
};

export function PatientPerfil({ patient, onSignOut }: PatientPerfilProps) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const menuItems = [
    {
      icon: Bell,
      label: 'Notificações',
      description: 'Lembretes de refeições e água',
      action: 'toggle' as const,
      value: notifications,
      onChange: setNotifications,
    },
    {
      icon: Moon,
      label: 'Modo escuro',
      description: 'Aparência do aplicativo',
      action: 'toggle' as const,
      value: darkMode,
      onChange: setDarkMode,
    },
    {
      icon: Shield,
      label: 'Privacidade',
      description: 'Termos e políticas',
      action: 'link' as const,
    },
    {
      icon: HelpCircle,
      label: 'Ajuda',
      description: 'Dúvidas frequentes',
      action: 'link' as const,
    },
  ];

  return (
    <div className="px-4 pt-4 animate-fade-in">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
        <p className="text-sm text-muted-foreground">Suas configurações</p>
      </header>

      {/* User Card */}
      <Card className="border-border/50 mb-4 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">{patient.full_name}</h2>
              <p className="text-sm text-muted-foreground">{patient.email}</p>
              {patient.goal && (
                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs">
                  <Heart className="w-3 h-3" />
                  {goalLabels[patient.goal] || patient.goal}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Menu */}
      <Card className="border-border/50 mb-4">
        <CardContent className="p-0">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5",
                  index !== menuItems.length - 1 && "border-b border-border/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                
                {item.action === 'toggle' ? (
                  <Switch
                    checked={item.value}
                    onCheckedChange={item.onChange}
                  />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Contact Nutritionist - Chat */}
      <div className="mb-4">
        <PatientChat 
          patientId={patient.id}
          nutritionistId={patient.nutritionist_id}
        />
      </div>

      {/* Logout */}
      <Button 
        variant="outline"
        className="w-full h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={onSignOut}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Sair da Conta
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-6">
        NutriFlow v1.0.0
      </p>
    </div>
  );
}
