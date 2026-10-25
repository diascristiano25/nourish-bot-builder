/**
 * PatientTable - Animated data table displaying patient information
 * Features pagination, row animations, and interactive hover effects
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { fadeInUp } from '@/lib/motion-variants';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonTable } from '@/components/shared/Skeleton';
import { EmptyPatients } from '@/components/shared/EmptyState';

interface Patient {
  id: string;
  full_name: string;
  email: string;
  status?: 'active' | 'inactive' | 'paused';
  goal?: string;
  progress?: number;
}

interface PatientTableProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onEdit?: (patientId: string) => void;
  onDelete?: (patientId: string) => void;
  isLoading?: boolean;
}

const ROWS_PER_PAGE = 10;

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde',
  performance: 'Performance',
};

const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100' },
  inactive: { bg: 'bg-secondary', text: 'text-foreground', badge: 'bg-muted' },
  paused: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100' },
};

export function PatientTable({
  patients,
  onSelectPatient,
  onEdit,
  onDelete,
  isLoading = false,
}: PatientTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(patients.length / ROWS_PER_PAGE);
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const endIdx = startIdx + ROWS_PER_PAGE;
  const paginatedPatients = patients.slice(startIdx, endIdx);

  const getStatusColor = (status?: string) => {
    return statusColors[status || 'active'] || statusColors.active;
  };

  if (isLoading) {
    return <SkeletonTable rows={5} />;
  }

  if (patients.length === 0) {
    return <EmptyPatients onAction={() => window.location.href = '/novo-paciente'} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-lg border border-border shadow-sm overflow-hidden"
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nome</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Objetivo</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Progresso</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.map((patient, index) => {
              const statusColor = getStatusColor(patient.status);
              return (
                <motion.tr
                  key={patient.id}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                  whileHover={{
                    backgroundColor: '#f9fafb',
                    transition: { duration: 0.2 },
                  }}
                  className="border-b border-border cursor-pointer hover:bg-secondary transition-colors"
                  onClick={() => onSelectPatient(patient.id)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {patient.full_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.email}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {patient.goal ? goalLabels[patient.goal] || patient.goal : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${(patient.progress || 0) % 101}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(patient.progress || 0) % 101}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor.badge} ${statusColor.text}`}
                    >
                      {patient.status ? patient.status.charAt(0).toUpperCase() + patient.status.slice(1) : 'Ativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPatient(patient.id);
                        }}
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(patient.id);
                          }}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(patient.id);
                          }}
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages} ({patients.length} pacientes)
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
