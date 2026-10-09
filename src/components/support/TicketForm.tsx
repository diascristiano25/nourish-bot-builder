import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
}

interface TicketFormProps {
  user: User | null;
  onSuccess: () => void;
}

export function TicketForm({ user, onSuccess }: TicketFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    subject: '',
    message: '',
    patientNumber: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let nutritionistId = null;

      // If user is authenticated, get their nutritionist_id
      if (user) {
        const { data: nutritionistData, error: nutritionistError } = await supabase
          .from('nutritionists')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (nutritionistError) {
          throw new Error('Erro ao buscar dados do nutricionista');
        }

        nutritionistId = nutritionistData?.id;
      }

      // Insert the ticket
      const ticketData = {
        nutritionist_id: nutritionistId,
        subject: formData.subject,
        message: formData.message,
        status: 'open',
      };

      const { error: insertError } = await supabase
        .from('support_tickets')
        .insert(ticketData);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Mensagem enviada!',
        description: 'Responderemos em breve no seu email.',
      });

      // Reset form
      setFormData({
        name: '',
        email: user?.email || '',
        subject: '',
        message: '',
        patientNumber: '',
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={!!user}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Assunto</Label>
          <Select
            name="subject"
            value={formData.subject}
            onValueChange={(value) => setFormData({ ...formData, subject: value })}
            required
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder="Selecione o assunto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dúvida Técnica">Dúvida Técnica</SelectItem>
              <SelectItem value="Problema com Pagamento">Problema com Pagamento</SelectItem>
              <SelectItem value="Solicitação de Feature">Solicitação de Feature</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {user && (
          <div className="space-y-2">
            <Label htmlFor="patientNumber">Número do Paciente (opcional)</Label>
            <Input
              id="patientNumber"
              value={formData.patientNumber}
              onChange={(e) => setFormData({ ...formData, patientNumber: e.target.value })}
              placeholder="Ex: 12345"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="message">Mensagem</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={5}
            placeholder="Descreva sua dúvida ou problema..."
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </form>
    </Card>
  );
}
