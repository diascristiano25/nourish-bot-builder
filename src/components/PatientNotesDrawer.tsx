import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CriticalTagsBadges } from './CriticalTagsBadges';
import { 
  StickyNote, 
  User, 
  AlertTriangle, 
  Heart, 
  Scale, 
  Target,
  Apple,
  Ban,
  FileText,
  Zap
} from 'lucide-react';

interface PatientInfo {
  full_name: string;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  goal?: string | null;
  allergies?: string[] | null;
  dietary_restrictions?: string[] | null;
  medical_conditions?: string | null;
  notes?: string | null;
  critical_tags?: string[] | null;
}

interface PatientNotesDrawerProps {
  patient: PatientInfo;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const goalLabels: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  maintenance: 'Manutenção',
  health: 'Saúde Geral',
  performance: 'Performance',
};

export function PatientNotesDrawer({ patient, open, onOpenChange, children }: PatientNotesDrawerProps) {
  const hasAlerts = (patient.allergies && patient.allergies.length > 0) || 
                    (patient.dietary_restrictions && patient.dietary_restrictions.length > 0) ||
                    (patient.critical_tags && patient.critical_tags.length > 0) ||
                    patient.medical_conditions;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children && (
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
      )}
      <SheetContent 
        side="right" 
        className="w-[350px] sm:w-[400px] p-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-l border-cyan-500/20"
      >
        <SheetHeader className="p-4 pb-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-violet-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center">
              <User className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <SheetTitle className="text-left text-foreground">{patient.full_name}</SheetTitle>
              {patient.age && (
                <p className="text-sm text-cyan-400 font-mono">{patient.age} anos</p>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-4 space-y-4">
            {/* Critical Tags Alert */}
            {patient.critical_tags && patient.critical_tags.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400">Atenção!</span>
                </div>
                <CriticalTagsBadges tags={patient.critical_tags} size="sm" showLabel={false} />
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              {patient.weight && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-cyan-500/20 text-center">
                  <Scale className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                  <p className="font-bold font-mono text-foreground">{patient.weight} kg</p>
                  <p className="text-xs text-muted-foreground">Peso</p>
                </div>
              )}
              {patient.height && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-violet-500/20 text-center">
                  <Target className="w-4 h-4 mx-auto mb-1 text-violet-400" />
                  <p className="font-bold font-mono text-foreground">{patient.height} cm</p>
                  <p className="text-xs text-muted-foreground">Altura</p>
                </div>
              )}
            </div>

            {/* Goal */}
            {patient.goal && (
              <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-foreground">Objetivo</span>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  {goalLabels[patient.goal] || patient.goal}
                </Badge>
              </div>
            )}

            <Separator className="bg-cyan-500/20" />

            {/* Allergies */}
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-foreground">Alergias</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map((allergy, i) => (
                    <Badge 
                      key={i} 
                      className="bg-red-500/10 text-red-400 border border-red-500/30"
                    >
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary Restrictions */}
            {patient.dietary_restrictions && patient.dietary_restrictions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">Restrições Alimentares</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.dietary_restrictions.map((restriction, i) => (
                    <Badge 
                      key={i} 
                      className="bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    >
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Conditions */}
            {patient.medical_conditions && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-medium text-foreground">Condições Médicas</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <p className="text-sm text-rose-300">{patient.medical_conditions}</p>
                </div>
              </div>
            )}

            {/* General Notes */}
            {patient.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Notas Gerais</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-cyan-500/20">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{patient.notes}</p>
                </div>
              </div>
            )}

            {/* No alerts message */}
            {!hasAlerts && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.02] border border-cyan-500/20 flex items-center justify-center">
                  <StickyNote className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm">Nenhum alerta ou restrição cadastrada</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
