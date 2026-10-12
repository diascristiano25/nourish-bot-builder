/**
 * PatientFilters - Search and status filter controls for patient table
 * Provides real-time search and status filtering capabilities
 */

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PatientFiltersProps {
  onSearch: (query: string) => void;
  onFilterStatus: (status: 'all' | 'active' | 'inactive' | 'paused') => void;
  currentStatus?: 'all' | 'active' | 'inactive' | 'paused';
}

const statusOptions: Array<{ value: 'all' | 'active' | 'inactive' | 'paused'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'paused', label: 'Pausado' },
];

export function PatientFilters({
  onSearch,
  onFilterStatus,
  currentStatus = 'all',
}: PatientFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 p-6 bg-white rounded-lg border border-slate-200 shadow-sm"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Buscar paciente por nome ou email..."
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 py-2 h-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-300"
        />
      </div>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            onClick={() => onFilterStatus(option.value)}
            variant={currentStatus === option.value ? 'default' : 'outline'}
            size="sm"
            className={`rounded-lg transition-all ${
              currentStatus === option.value
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}
