import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, ChevronRight, Target, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde',
  performance: 'Performance',
};

const goalColors: Record<string, string> = {
  hypertrophy: 'bg-purple-100 text-purple-700',
  weight_loss: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-slate-100 text-slate-700',
  health: 'bg-emerald-100 text-emerald-700',
  performance: 'bg-amber-100 text-amber-700',
};

const adherenceColors: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Alta' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Média' },
  low: { bg: 'bg-red-100', text: 'text-red-700', label: 'Baixa' },
};

const getRandomAdherence = () => {
  const levels = ['high', 'medium', 'low'];
  return levels[Math.floor(Math.random() * levels.length)];
};

const Patients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', user?.id],
    queryFn: async () => {
      const { data: nutritionist } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!nutritionist) return [];

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('nutritionist_id', nutritionist.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filteredPatients = patients?.filter(patient =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Elite Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                  Pacientes
                </h1>
                <p className="text-slate-500 mt-1">
                  Gerencie sua carteira de {patients?.length || 0} pacientes
                </p>
              </div>
              <Button 
                onClick={() => navigate('/patients/new')} 
                className="gap-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl h-11 px-6 shadow-sm"
                data-tour="patients-new-btn"
              >
                <Plus className="w-4 h-4" />
                Novo Paciente
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mt-6 relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 rounded-xl border-slate-200 bg-white focus:border-emerald-300 focus:ring-emerald-200"
              />
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-white rounded-2xl border-0 shadow-sm animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !filteredPatients || filteredPatients.length === 0 ? (
            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {searchQuery ? 'Nenhum paciente encontrado' : 'Comece sua jornada'}
                </h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  {searchQuery 
                    ? 'Tente buscar com outros termos' 
                    : 'Cadastre seu primeiro paciente e comece a transformar vidas'
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => navigate('/patients/new')} 
                    className="gap-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                    Cadastrar Paciente
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient, index) => {
                const adherence = getRandomAdherence();
                const adherenceStyle = adherenceColors[adherence];
                
                return (
                  <Card 
                    key={patient.id} 
                    className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-xl font-bold text-white">
                            {patient.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                                {patient.full_name}
                              </h3>
                              <p className="text-sm text-slate-400 mt-0.5">
                                {format(new Date(patient.created_at), "MMM 'de' yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {patient.goal && (
                              <Badge 
                                variant="secondary" 
                                className={`${goalColors[patient.goal] || 'bg-slate-100 text-slate-600'} text-xs font-medium rounded-lg border-0`}
                              >
                                <Target className="w-3 h-3 mr-1" />
                                {goalLabels[patient.goal] || patient.goal}
                              </Badge>
                            )}
                            <Badge 
                              variant="secondary"
                              className={`${adherenceStyle.bg} ${adherenceStyle.text} text-xs font-medium rounded-lg border-0`}
                            >
                              <Activity className="w-3 h-3 mr-1" />
                              Adesão {adherenceStyle.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
};

export default Patients;
