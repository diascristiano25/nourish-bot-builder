import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  full_name: string;
}

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess: () => void;
}

const timeSlots = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00',
];

export function NewAppointmentDialog({ 
  open, 
  onOpenChange, 
  selectedDate,
  onSuccess 
}: NewAppointmentDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && user) {
      fetchPatients();
    }
  }, [open, user]);

  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data: nutritionist } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (nutritionist) {
        const { data, error } = await supabase
          .from('patients')
          .select('id, full_name')
          .eq('nutritionist_id', nutritionist.id)
          .order('full_name');

        if (error) throw error;
        setPatients(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!patientId || !date || !time) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha paciente, data e horário.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { data: nutritionist } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (!nutritionist) throw new Error('Perfil não encontrado');

      const [hours, minutes] = time.split(':');
      const dateTime = new Date(date);
      dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error } = await supabase
        .from('appointments')
        .insert({
          nutritionist_id: nutritionist.id,
          patient_id: patientId,
          date_time: dateTime.toISOString(),
          notes: notes || null,
          status: 'scheduled',
        });

      if (error) throw error;

      toast({
        title: 'Agendamento criado',
        description: 'A consulta foi agendada com sucesso.',
      });

      setPatientId('');
      setTime('');
      setNotes('');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Erro ao agendar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/50 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Agende uma consulta com seu paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Patient Select */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Paciente *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder={loading ? "Carregando..." : "Selecione o paciente"} />
              </SelectTrigger>
              <SelectContent className="glass-strong border-border/50">
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background/50 border-border/50",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-strong border-border/50" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Select */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Horário *</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-border/50 max-h-[200px]">
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione notas sobre a consulta..."
              rows={3}
              className="bg-background/50 border-border/50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border/50">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Agendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
