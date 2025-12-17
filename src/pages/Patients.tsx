import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Eye, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageTour, patientsTourSteps } from '@/components/PageTour';

const Patients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', user?.id],
    queryFn: async () => {
      const { data: nutritionist } = await supabase
        .from('nutritionists')
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

  return (
    <AppLayout>
      <PageTour tourKey="patients" steps={patientsTourSteps} run />
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Pacientes</h1>
            <p className="text-muted-foreground">Gerencie seus pacientes</p>
          </div>
          <Button onClick={() => navigate('/patients/new')} className="gap-2" data-tour="patients-new-btn">
            <Plus className="w-4 h-4" />
            Novo Paciente
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Lista de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : !patients || patients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-4">Nenhum paciente cadastrado ainda.</p>
                <Button onClick={() => navigate('/patients/new')} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Cadastrar primeiro paciente
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.full_name}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(patient.updated_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Patients;
