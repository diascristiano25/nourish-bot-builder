import { useState } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PatientStats } from '@/components/nutritionist/patients/PatientStats';
import { PatientFilters } from '@/components/nutritionist/patients/PatientFilters';
import { PatientTable } from '@/components/nutritionist/patients/PatientTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { Users, UserPlus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Patient {
  id: string;
  full_name: string;
  email: string;
  status?: 'active' | 'inactive' | 'paused';
  goal?: string;
  progress?: number;
  created_at: string;
}

const Patients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'paused'>('all');

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

  const filteredPatients = (patients || []).filter((patient: Patient) => {
    const matchesSearch =
      patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = (patients || []).filter((p: Patient) => p.status === 'active' || !p.status).length;
  const pausedCount = (patients || []).filter((p: Patient) => p.status === 'paused').length;

  return (
    <ModernLayout>
      <div className="space-y-8">
        <PageHeader
          title="Meus Pacientes"
          subtitle={`${(patients || []).length} pacientes cadastrados · ${activeCount} ativos`}
          icon={<Users className="w-7 h-7 text-white" />}
          actions={
            <Button
              onClick={() => navigate('/novo-paciente')}
              className="gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/20 rounded-2xl font-semibold px-5 h-11 shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              Novo Paciente
            </Button>
          }
        />

        {/* Quick stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RichCard delay={0.1}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#518C5B]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#518C5B]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  {(patients || []).length}
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.2}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ativos</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  {activeCount}
                </motion.p>
              </div>
            </div>
          </RichCard>
          <RichCard delay={0.3}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C4764A]/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#C4764A]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pausados</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  {pausedCount}
                </motion.p>
              </div>
            </div>
          </RichCard>
        </div>

        {/* Stats Section */}
        <PatientStats patients={patients || []} />

        {/* Filters + Table in a rich card */}
        <RichCard delay={0.4} padding="lg">
          <div className="flex items-center gap-2 mb-5">
            <Search className="w-5 h-5 text-[#518C5B]" />
            <h2 className="text-lg font-bold text-slate-800">Lista de Pacientes</h2>
            <span className="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {filteredPatients.length} resultados
            </span>
          </div>
          <PatientFilters
            onSearch={setSearchQuery}
            onFilterStatus={setStatusFilter}
            currentStatus={statusFilter}
          />
          <div className="mt-5">
            <PatientTable
              patients={filteredPatients}
              onSelectPatient={(id) => navigate(`/pacientes/${id}`)}
              onEdit={(id) => navigate(`/pacientes/${id}/editar`)}
              isLoading={isLoading}
            />
          </div>
        </RichCard>
      </div>
    </ModernLayout>
  );
};

export default Patients;