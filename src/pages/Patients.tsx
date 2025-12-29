import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, ChevronRight, Target, Activity, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GlassCard } from '@/components/ui/GlassCard';

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde',
  performance: 'Performance',
};

const goalColors: Record<string, { bg: string; text: string; border: string }> = {
  hypertrophy: { bg: 'bg-electric-violet/10', text: 'text-electric-violet', border: 'border-electric-violet/30' },
  weight_loss: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  maintenance: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  health: { bg: 'bg-cyber-lime/10', text: 'text-cyber-lime', border: 'border-cyber-lime/30' },
  performance: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
};

const adherenceColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  high: { bg: 'bg-cyber-lime/10', text: 'text-cyber-lime', border: 'border-cyber-lime/30', label: 'Alta' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Média' },
  low: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'Baixa' },
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
      <div className="min-h-screen">
        {/* Cyber Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-white/10">
          <div className="px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent">
                  Pacientes
                </h1>
                <p className="text-muted-foreground mt-1 font-mono text-sm">
                  GERENCIANDO :: {patients?.length || 0} REGISTROS
                </p>
              </div>
              <Button 
                onClick={() => navigate('/patients/new')} 
                className="gap-2 bg-gradient-to-r from-cyber-lime to-electric-violet hover:opacity-90 text-background rounded-xl h-11 px-6 font-semibold"
                data-tour="patients-new-btn"
              >
                <Plus className="w-4 h-4" />
                Novo Paciente
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mt-6 relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 rounded-xl glass border-white/10 focus:border-cyber-lime/50"
              />
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <GlassCard key={i} className="animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : !filteredPatients || filteredPatients.length === 0 ? (
            <GlassCard className="py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'Nenhum paciente encontrado' : 'Comece sua jornada'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {searchQuery 
                  ? 'Tente buscar com outros termos' 
                  : 'Cadastre seu primeiro paciente e comece a transformar vidas'
                }
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => navigate('/patients/new')} 
                  className="gap-2 bg-gradient-to-r from-cyber-lime to-electric-violet hover:opacity-90 text-background rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar Paciente
                </Button>
              )}
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient, index) => {
                const adherence = getRandomAdherence();
                const adherenceStyle = adherenceColors[adherence];
                const goalStyle = goalColors[patient.goal || 'health'];
                
                return (
                  <GlassCard 
                    key={patient.id} 
                    className="cursor-pointer group hover:border-cyber-lime/30 transition-all duration-300"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyber-lime/20 to-electric-violet/20 flex items-center justify-center border border-white/10 flex-shrink-0 group-hover:border-cyber-lime/30 transition-colors">
                        <span className="text-xl font-bold bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent">
                          {patient.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground truncate group-hover:text-cyber-lime transition-colors">
                              {patient.full_name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                              {format(new Date(patient.created_at), "MMM 'de' yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-cyber-lime group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {patient.goal && goalStyle && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${goalStyle.bg} ${goalStyle.text} border ${goalStyle.border}`}>
                              <Target className="w-3 h-3" />
                              {goalLabels[patient.goal] || patient.goal}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${adherenceStyle.bg} ${adherenceStyle.text} border ${adherenceStyle.border}`}>
                            <Activity className="w-3 h-3" />
                            Adesão {adherenceStyle.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
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
