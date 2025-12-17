import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Plus, 
  Users, 
  Calendar,
  Clock,
  ChevronRight,
  Loader2,
  Settings2,
  LogOut,
  User,
  Sparkles,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useWidgetPreferences, WidgetPreferences } from '@/hooks/useWidgetPreferences';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  goal: string | null;
  created_at: string;
}

interface NutritionistProfile {
  id: string;
  full_name: string;
  crn: string | null;
}

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde',
  performance: 'Performance',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { preferences, updatePreference, loaded: prefsLoaded } = useWidgetPreferences();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('nutritionists')
        .select('id, full_name, crn')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('nutritionists')
          .insert({ 
            user_id: user!.id, 
            full_name: user!.user_metadata?.full_name || 'Nutricionista' 
          })
          .select('id, full_name, crn')
          .single();
        
        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(profileData);
      }

      if (profileData || profile) {
        const nutritionistId = profileData?.id || profile?.id;
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, full_name, email, goal, created_at')
          .eq('nutritionist_id', nutritionistId)
          .order('created_at', { ascending: false });

        if (patientsError) throw patientsError;
        setPatients(patientsData || []);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const recentPatients = patients.slice(0, 4);
  const patientsThisMonth = patients.filter(p => {
    const created = new Date(p.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  if (authLoading || loading || !prefsLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const widgetLabels: Record<keyof WidgetPreferences, string> = {
    agenda: 'Agenda do Dia',
    recentPatients: 'Pacientes Recentes',
    quickActions: 'Ações Rápidas',
    stats: 'Estatísticas',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="zen-container h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">NutriFlow</span>
          </div>
          <div className="flex items-center gap-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings2 className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Personalizar Visual</SheetTitle>
                  <SheetDescription>
                    Escolha quais widgets exibir no seu dashboard
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {(Object.keys(preferences) as Array<keyof WidgetPreferences>).map((key) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">{widgetLabels[key]}</span>
                      <Switch
                        checked={preferences[key]}
                        onCheckedChange={(checked) => updatePreference(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/profile')}>
              <User className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="zen-container py-8 space-y-8">
        {/* Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">
            {getGreeting()}, {profile ? getFirstName(profile.full_name) : 'Nutricionista'}.
          </h1>
          <p className="text-muted-foreground">Hoje é dia de foco.</p>
        </div>

        {/* Stats Row */}
        {preferences.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            <div className="zen-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Pacientes</p>
              <p className="text-2xl font-semibold mt-1">{patients.length}</p>
            </div>
            <div className="zen-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Este Mês</p>
              <p className="text-2xl font-semibold mt-1">{patientsThisMonth}</p>
            </div>
            <div className="zen-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Cardápios</p>
              <p className="text-2xl font-semibold mt-1">—</p>
            </div>
            <div className="zen-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Consultas Hoje</p>
              <p className="text-2xl font-semibold mt-1">—</p>
            </div>
          </div>
        )}

        {/* Widget Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Agenda Widget */}
          {preferences.agenda && (
            <Card className="zen-card border-border/50 animate-slide-up">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Agenda do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma consulta agendada</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Patients Widget */}
          {preferences.recentPatients && (
            <Card className="zen-card border-border/50 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Pacientes Recentes
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => navigate('/patients/new')}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Novo
                </Button>
              </CardHeader>
              <CardContent>
                {recentPatients.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum paciente ainda</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="mt-2 h-auto p-0 text-primary"
                      onClick={() => navigate('/patients/new')}
                    >
                      Adicionar primeiro paciente
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {patient.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{patient.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {goalLabels[patient.goal || ''] || 'Sem objetivo'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions Widget */}
          {preferences.quickActions && (
            <Card className="zen-card border-border/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-11 text-sm font-normal border-border/50 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => navigate('/consulta')}
                >
                  <Plus className="w-4 h-4 mr-3 text-primary" />
                  Nova Consulta
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-11 text-sm font-normal border-border/50 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => navigate('/patients/new')}
                >
                  <Users className="w-4 h-4 mr-3 text-primary" />
                  Novo Paciente
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* All Patients Link */}
        {patients.length > 0 && (
          <div className="pt-4">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/patients')}
            >
              Ver todos os {patients.length} pacientes
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
