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
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <SheetContent side="right" className="w-[350px] sm:w-[400px] p-0">
        <SheetHeader className="p-4 pb-3 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-left">{patient.full_name}</SheetTitle>
              {patient.age && (
                <p className="text-sm text-muted-foreground">{patient.age} anos</p>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-4 space-y-4">
            {/* Critical Tags Alert */}
            {patient.critical_tags && patient.critical_tags.length > 0 && (
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 animate-pulse-slow">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold text-warning">Atenção!</span>
                </div>
                <CriticalTagsBadges tags={patient.critical_tags} size="sm" showLabel={false} />
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              {patient.weight && (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <Scale className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-bold">{patient.weight} kg</p>
                  <p className="text-xs text-muted-foreground">Peso</p>
                </div>
              )}
              {patient.height && (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <Target className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-bold">{patient.height} cm</p>
                  <p className="text-xs text-muted-foreground">Altura</p>
                </div>
              )}
            </div>

            {/* Goal */}
            {patient.goal && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Objetivo</span>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {goalLabels[patient.goal] || patient.goal}
                </Badge>
              </div>
            )}

            <Separator />

            {/* Allergies */}
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium">Alergias</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map((allergy, i) => (
                    <Badge 
                      key={i} 
                      variant="destructive" 
                      className="bg-destructive/10 text-destructive border border-destructive/20"
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
                  <Apple className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">Restrições Alimentares</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.dietary_restrictions.map((restriction, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="bg-warning/10 text-warning border border-warning/20"
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
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-medium">Condições Médicas</span>
                </div>
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                  <p className="text-sm text-rose-800">{patient.medical_conditions}</p>
                </div>
              </div>
            )}

            {/* General Notes */}
            {patient.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Notas Gerais</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{patient.notes}</p>
                </div>
              </div>
            )}

            {/* No alerts message */}
            {!hasAlerts && (
              <div className="text-center py-8 text-muted-foreground">
                <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum alerta ou restrição cadastrada</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
