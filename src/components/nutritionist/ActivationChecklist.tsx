import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, MessageCircle, UserPlus, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

type ActivationState = {
  profileId: string;
  hasPhone: boolean;
  firstPatientId: string | null;
  patientCount: number;
  planCount: number;
};

const onlyDigits = (v: string) => v.replace(/\D/g, '');

/**
 * Guia o primeiro uso: WhatsApp -> 1º paciente -> 1º plano.
 * Some sozinho quando os três passos terminam.
 */
export function ActivationChecklist({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<ActivationState | null>(null);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, phone')
          .eq('user_id', userId)
          .maybeSingle();
        if (!profile || cancelled) return;

        const [patients, plans] = await Promise.all([
          supabase
            .from('patients')
            .select('id', { count: 'exact' })
            .eq('nutritionist_id', profile.id)
            .order('created_at', { ascending: true })
            .limit(1),
          supabase
            .from('meal_plans')
            .select('id', { count: 'exact', head: true })
            .eq('nutritionist_id', profile.id),
        ]);
        if (cancelled) return;

        setState({
          profileId: profile.id,
          hasPhone: onlyDigits(profile.phone ?? '').length >= 10,
          firstPatientId: patients.data?.[0]?.id ?? null,
          patientCount: patients.count ?? 0,
          planCount: plans.count ?? 0,
        });
      } catch {
        /* checklist é opcional: falha silenciosa */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!state) return null;

  const steps = [
    { done: state.hasPhone },
    { done: state.patientCount > 0 },
    { done: state.planCount > 0 },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  const savePhone = async () => {
    if (onlyDigits(phone).length < 10) {
      toast({ title: 'WhatsApp inválido', description: 'Informe com DDD, ex.: (11) 99999-9999', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ phone: phone.trim() }).eq('id', state.profileId);
    setSaving(false);
    if (error) {
      toast({ title: 'Não foi possível salvar', description: error.message, variant: 'destructive' });
      return;
    }
    setState({ ...state, hasPhone: true });
  };

  const Icon = ({ done }: { done: boolean }) =>
    done ? (
      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" aria-label="Concluído" />
    ) : (
      <Circle className="h-5 w-5 text-muted-foreground shrink-0" aria-label="Pendente" />
    );

  return (
    <section
      aria-label="Primeiros passos"
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Comece em 3 passos</h2>
          <p className="text-sm text-muted-foreground">
            Gere seu primeiro plano alimentar em menos de 10 minutos.
          </p>
        </div>
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {doneCount}/{steps.length}
        </span>
      </div>

      <Progress value={(doneCount / steps.length) * 100} className="h-2" />

      <ul className="space-y-3">
        <li className="flex items-center gap-3">
          <Icon done={state.hasPhone} />
          <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className={state.hasPhone ? 'text-sm text-muted-foreground line-through' : 'text-sm font-medium text-foreground'}>
              Adicione seu WhatsApp
            </p>
            {!state.hasPhone && (
              <div className="mt-2 flex gap-2 max-w-sm">
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-label="WhatsApp"
                />
                <Button size="sm" onClick={savePhone} disabled={saving}>
                  {saving ? 'Salvando…' : 'Salvar'}
                </Button>
              </div>
            )}
          </div>
        </li>

        <li className="flex items-center gap-3">
          <Icon done={state.patientCount > 0} />
          <UserPlus className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
          <p className={state.patientCount > 0 ? 'flex-1 text-sm text-muted-foreground line-through' : 'flex-1 text-sm font-medium text-foreground'}>
            Cadastre seu primeiro paciente
          </p>
          {state.patientCount === 0 && (
            <Button size="sm" onClick={() => navigate('/novo-paciente')}>
              Cadastrar
            </Button>
          )}
        </li>

        <li className="flex items-center gap-3">
          <Icon done={state.planCount > 0} />
          <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
          <p className={state.planCount > 0 ? 'flex-1 text-sm text-muted-foreground line-through' : 'flex-1 text-sm font-medium text-foreground'}>
            Gere o plano alimentar com IA
          </p>
          {state.planCount === 0 && (
            <Button
              size="sm"
              variant={state.patientCount > 0 ? 'default' : 'outline'}
              disabled={!state.firstPatientId}
              title={state.firstPatientId ? undefined : 'Cadastre um paciente primeiro'}
              onClick={() => state.firstPatientId && navigate(`/gerar-cardapio/${state.firstPatientId}`)}
            >
              Gerar plano
            </Button>
          )}
        </li>
      </ul>
    </section>
  );
}
