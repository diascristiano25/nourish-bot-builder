import { useState } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PatientStats } from '@/components/nutritionist/patients/PatientStats';
import { PatientFilters } from '@/components/nutritionist/patients/PatientFilters';
import { PatientTable } from '@/components/nutritionist/patients/PatientTable';

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

  return (
    <ModernLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Meus Pacientes</h1>
        </div>

        {/* Stats Section */}
        <PatientStats patients={patients || []} />

        {/* Filters Section */}
        <PatientFilters
          onSearch={setSearchQuery}
          onFilterStatus={setStatusFilter}
          currentStatus={statusFilter}
        />

        {/* Table Section */}
        <PatientTable
          patients={filteredPatients}
          onSelectPatient={(id) => navigate(`/pacientes/${id}`)}
          onEdit={(id) => navigate(`/pacientes/${id}/editar`)}
          isLoading={isLoading}
        />
      </div>
    </ModernLayout>
  );
};

export default Patients;
