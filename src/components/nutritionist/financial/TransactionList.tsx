/**
 * TransactionList - Animated list of financial transactions
 * Displays transactions with color-coded status and stagger animations
 */

import { motion } from 'framer-motion';
import { slideInLeft } from '@/lib/motion-variants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Receipt } from 'lucide-react';

export interface Transaction {
  id: string;
  patientName: string;
  type: 'payment' | 'refund' | 'pending';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  isLoading = false,
  onTransactionClick,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Receipt className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">Transações Recentes</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-secondary text-foreground border-border';
    }
  };

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'payment':
        return 'Pagamento';
      case 'refund':
        return 'Reembolso';
      case 'pending':
        return 'Pendente';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Receipt className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">Transações Recentes</h3>
        <span className="text-xs font-medium text-muted-foreground ml-auto">
          {transactions.length} {transactions.length === 1 ? 'transação' : 'transações'}
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium mb-1">Nenhuma transação</p>
          <p className="text-sm text-muted-foreground">As transações aparecerão aqui</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Data
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Paciente
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Valor
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial="hidden"
                  animate="visible"
                  variants={slideInLeft}
                  transition={{
                    delay: index * 0.05,
                  }}
                  onClick={() => onTransactionClick?.(transaction)}
                  className={`
                    border-b border-border last:border-0
                    ${onTransactionClick ? 'cursor-pointer hover:bg-secondary' : ''}
                    transition-colors
                  `}
                >
                  <td className="py-4 px-4">
                    <p className="text-sm text-foreground">
                      {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), 'HH:mm', { locale: ptBR })}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-foreground">
                      {transaction.patientName}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-foreground">{getTypeLabel(transaction.type)}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="text-sm font-semibold text-foreground">
                      R$ {transaction.amount.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${getStatusColor(transaction.status)}
                      `}
                    >
                      {getStatusLabel(transaction.status)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
