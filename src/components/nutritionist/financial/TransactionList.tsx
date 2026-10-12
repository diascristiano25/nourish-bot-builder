/**
 * TransactionList - Animated table of financial transactions
 * Each row animates in with slideInLeft, staggered 0.05s
 * Rows are color-coded by status: green=completed, yellow=pending, red=failed
 */

import { motion } from 'framer-motion';
import { slideInLeft, staggerContainer } from '@/lib/motion-variants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export interface Transaction {
  id: string;
  patientName: string;
  type: 'payment' | 'refund' | 'pending';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface TransactionListProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

export function TransactionList({ transactions = [], isLoading = false }: TransactionListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'refund') {
      return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
    }
    return <ArrowUpCircle className="w-5 h-5 text-emerald-500" />;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-base font-semibold text-slate-900">Transações</h3>
        <span className="text-xs font-medium text-slate-500">
          {transactions.length} registro(s)
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-600">Nenhuma transação disponível</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Tipo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
              </tr>
            </thead>
            <motion.tbody
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {transactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  variants={slideInLeft}
                  onClick={() => setSelectedId(selectedId === transaction.id ? null : transaction.id)}
                  className={`border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedId === transaction.id ? 'bg-slate-100' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {transaction.patientName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(transaction.type)}
                      <span className="text-sm text-slate-600 capitalize">
                        {transaction.type === 'payment' ? 'Pagamento' : 'Reembolso'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-right text-slate-900">
                    R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(transaction.status)}`}>
                      {transaction.status === 'completed' ? 'Concluído' : transaction.status === 'pending' ? 'Pendente' : 'Falhou'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}
    </div>
  );
}
