import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, ChevronRight, Target, Activity, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BentoCard } from '@/components/ui/BentoCard';
import { BentoGrid } from '@/components/ui/BentoGrid';

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde',
  performance: 'Performance',
};

const goalColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  hypertrophy: { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30', icon: '💪' },
  weight_loss: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', icon: '⚡' },
  maintenance: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', icon: '⚖️' },
  health: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: '🌿' },
  performance: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', icon: '🏆' },
};

const adherenceColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  high: { bg: 'bg-cyber-lime/15', text: 'text-cyber-lime', border: 'border-cyber-lime/30', label: 'Alta' },
  medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Média' },
  low: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', label: 'Baixa' },
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
        {/* Glassmorphism Header */}
        <header className="sticky top-0 z-30 bg-[rgba(15,18,22,0.7)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.08)]">
          <div className="px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-lime/20 to-electric-violet/20 flex items-center justify-center border border-cyber-lime/20">
                    <Users className="w-5 h-5 text-cyber-lime" />
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent">
                    Pacientes
                  </h1>
                </div>
                <p className="text-muted-foreground font-mono text-sm ml-[52px]">
                  {patients?.length || 0} registros ativos
                </p>
              </div>
              <Button 
                onClick={() => navigate('/patients/new')} 
                className="gap-2 bg-gradient-to-r from-cyber-lime to-electric-violet hover:opacity-90 text-background rounded-xl h-12 px-6 font-semibold shadow-lg shadow-cyber-lime/20"
                data-tour="patients-new-btn"
              >
                <Plus className="w-5 h-5" />
                Novo Paciente
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mt-6 relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] focus:border-cyber-lime/50 focus:bg-[rgba(255,255,255,0.05)] transition-all"
              />
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          {isLoading ? (
            <BentoGrid columns={3} gap="md">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BentoCard key={i} className="animate-pulse" interactive={false}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-white/5 rounded-lg w-3/4" />
                      <div className="h-4 bg-white/5 rounded-lg w-1/2" />
                    </div>
                  </div>
                </BentoCard>
              ))}
            </BentoGrid>
          ) : !filteredPatients || filteredPatients.length === 0 ? (
            <BentoCard className="py-20 text-center max-w-lg mx-auto" interactive={false}>
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyber-lime/10 to-electric-violet/10 border border-white/10 flex items-center justify-center mx-auto mb-8">
                <Users className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {searchQuery ? 'Nenhum paciente encontrado' : 'Comece sua jornada'}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                {searchQuery 
                  ? 'Tente buscar com outros termos' 
                  : 'Cadastre seu primeiro paciente e comece a transformar vidas'
                }
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => navigate('/patients/new')} 
                  className="gap-2 bg-gradient-to-r from-cyber-lime to-electric-violet hover:opacity-90 text-background rounded-xl h-12 px-8"
                >
                  <Sparkles className="w-5 h-5" />
                  Cadastrar Paciente
                </Button>
              )}
            </BentoCard>
          ) : (
            <BentoGrid columns={3} gap="md">
              {filteredPatients.map((patient, index) => {
                const adherence = getRandomAdherence();
                const adherenceStyle = adherenceColors[adherence];
                const goalStyle = goalColors[patient.goal || 'health'];
                
                return (
                  <BentoCard 
                    key={patient.id} 
                    className="group"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    glow="lime"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-lime/20 to-electric-violet/20 flex items-center justify-center border border-white/10 flex-shrink-0 group-hover:border-cyber-lime/40 group-hover:shadow-lg group-hover:shadow-cyber-lime/20 transition-all duration-300">
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyber-lime to-electric-violet bg-clip-text text-transparent">
                          {patient.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground truncate text-lg group-hover:text-cyber-lime transition-colors">
                              {patient.full_name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 font-mono">
                              {format(new Date(patient.created_at), "dd MMM yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-cyber-lime group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {patient.goal && goalStyle && (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${goalStyle.bg} ${goalStyle.text} border ${goalStyle.border}`}>
                              <span>{goalStyle.icon}</span>
                              {goalLabels[patient.goal] || patient.goal}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${adherenceStyle.bg} ${adherenceStyle.text} border ${adherenceStyle.border}`}>
                            <TrendingUp className="w-3 h-3" />
                            {adherenceStyle.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </BentoCard>
                );
              })}
            </BentoGrid>
          )}
        </main>
      </div>
    </AppLayout>
  );
};

export default Patients;
