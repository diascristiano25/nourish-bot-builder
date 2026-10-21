import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, DollarSign, TrendingDown } from 'lucide-react';

interface NewTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  nutritionistId: string;
}

export function NewTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
  nutritionistId,
}: NewTransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [patientName, setPatientName] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Valor inválido', description: 'Informe um valor maior que zero.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Handle both comma and dot decimal separators for Brazilian format
      const normalizedAmount = amount.replace(',', '.');
      const amountValue = parseFloat(normalizedAmount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Valor inválido');
      }
      // Store as integer cents to match DB schema (integer, no scale)
      const amountCents = Math.round(amountValue * 100);
      const recordType = type === 'income' ? 'payment' : 'expense';

      // REAL schema (verified via supabase db query --linked):
      // financial_records columns: id, user_id, patient_id, transaction_type,
      // amount, currency, status, payment_method, stripe_payment_intent_id,
      // description, metadata, processed_at, created_at, updated_at.
      // NOTE: uses `user_id` (auth uid), NOT nutritionist_id/profile id.
      // NOTE: uses `transaction_type`, NOT record_type/type.
      // NOTE: uses `processed_at` for the date, NOT date/record_date.
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Usuário não autenticado');

      const { error } = await supabase.from('financial_records').insert({
        user_id: authUser.id,
        amount: amountCents,
        transaction_type: recordType,
        status: 'completed',
        processed_at: new Date().toISOString(),
        payment_method: paymentMethod || null,
        description: description || (type === 'income' ? 'Receita' : 'Despesa'),
      });

      if (error) throw error;

      toast({
        title: type === 'income' ? 'Receita registrada! ✅' : 'Despesa registrada! ✅',
        description: `R$ ${parseFloat(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} lançado com sucesso.`,
      });

      setAmount('');
      setDescription('');
      setPaymentMethod('');
      setPatientName('');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      toast({
        title: 'Erro ao lançar',
        description: err.message || 'Não foi possível registrar o lançamento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-[#518C5B]" />
            Novo Lançamento Financeiro
          </DialogTitle>
          <DialogDescription>
            Registre uma receita ou despesa manualmente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium text-sm ${
                type === 'income'
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <TrendingDown className="w-4 h-4 rotate-180" />
              Receita
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium text-sm ${
                type === 'expense'
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Despesa
            </button>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Valor (R$)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="pl-10 h-12 text-lg font-semibold rounded-xl"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Input
              id="description"
              type="text"
              placeholder={type === 'income' ? 'Ex: Consulta Maria Silva' : 'Ex: Aluguel do consultório'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          {/* Método de pagamento */}
          <div className="space-y-2">
            <Label htmlFor="payment-method" className="text-sm font-medium">
              Forma de pagamento
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !amount}
              className={`rounded-xl px-6 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {type === 'income' ? 'Registrar Receita' : 'Registrar Despesa'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}