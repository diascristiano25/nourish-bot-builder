import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, FlaskConical, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LabResult {
  id: string;
  exam_date: string;
  exam_type: string;
  value: number | null;
  unit: string | null;
  reference_range: string | null;
  notes: string | null;
}

interface LabResultsPanelProps {
  patientId: string;
}

const EXAM_TYPES = [
  { value: 'glicemia', label: 'Glicemia', unit: 'mg/dL', ref: '70-99 (jejum)' },
  { value: 'colesterol_total', label: 'Colesterol Total', unit: 'mg/dL', ref: '< 200' },
  { value: 'hdl', label: 'HDL', unit: 'mg/dL', ref: '> 40 (H) / > 50 (M)' },
  { value: 'ldl', label: 'LDL', unit: 'mg/dL', ref: '< 100' },
  { value: 'triglicerideos', label: 'Triglicerídeos', unit: 'mg/dL', ref: '< 150' },
  { value: 'tsh', label: 'TSH', unit: 'mUI/L', ref: '0.4-4.0' },
  { value: 't4_livre', label: 'T4 Livre', unit: 'ng/dL', ref: '0.8-1.8' },
  { value: 'ureia', label: 'Ureia', unit: 'mg/dL', ref: '15-40' },
  { value: 'creatinina', label: 'Creatinina', unit: 'mg/dL', ref: '0.6-1.2 (H) / 0.5-1.0 (M)' },
  { value: 'hemoglobina', label: 'Hemoglobina', unit: 'g/dL', ref: '13-17 (H) / 12-15 (M)' },
  { value: 'hematocrito', label: 'Hematócrito', unit: '%', ref: '40-54 (H) / 36-48 (M)' },
  { value: 'vitamina_d', label: 'Vitamina D', unit: 'ng/mL', ref: '30-100' },
  { value: 'vitamina_b12', label: 'Vitamina B12', unit: 'pg/mL', ref: '200-900' },
  { value: 'ferritina', label: 'Ferritina', unit: 'ng/mL', ref: '20-300 (H) / 15-150 (M)' },
  { value: 'outro', label: 'Outro', unit: '', ref: '' },
];

function isValueAbnormal(value: number | null, examType: string): boolean {
  if (value === null) return false;
  const ranges: Record<string, [number, number]> = {
    glicemia: [70, 99],
    colesterol_total: [0, 200],
    hdl: [40, 100],
    ldl: [0, 100],
    triglicerideos: [0, 150],
    tsh: [0.4, 4.0],
    t4_livre: [0.8, 1.8],
    ureia: [15, 40],
    creatinina: [0.5, 1.2],
    hemoglobina: [12, 17],
    hematocrito: [36, 54],
    vitamina_d: [30, 100],
    vitamina_b12: [200, 900],
    ferritina: [15, 300],
  };
  const range = ranges[examType];
  if (!range) return false;
  return value < range[0] || value > range[1];
}

export function LabResultsPanel({ patientId }: LabResultsPanelProps) {
  const { toast } = useToast();
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [examDate, setExamDate] = useState('');
  const [examType, setExamType] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [referenceRange, setReferenceRange] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchResults();
  }, [patientId]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .eq('patient_id', patientId)
        .order('exam_date', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar exames', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleExamTypeChange = (type: string) => {
    setExamType(type);
    const exam = EXAM_TYPES.find(e => e.value === type);
    if (exam) {
      setUnit(exam.unit);
      setReferenceRange(exam.ref);
    }
  };

  const handleSave = async () => {
    if (!examDate || !examType || !value) {
      toast({ title: 'Campos obrigatórios', description: 'Data, tipo e valor são obrigatórios.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('lab_results').insert({
        patient_id: patientId,
        exam_date: examDate,
        exam_type: examType,
        value: parseFloat(value),
        unit: unit || null,
        reference_range: referenceRange || null,
        notes: notes || null,
      });

      if (error) throw error;

      toast({ title: 'Exame registrado!', description: 'Resultado laboratorial salvo com sucesso.' });
      resetForm();
      fetchResults();
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('lab_results').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Exame removido' });
      setResults(prev => prev.filter(r => r.id !== id));
    } catch (error: any) {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setExamDate('');
    setExamType('');
    setValue('');
    setUnit('');
    setReferenceRange('');
    setNotes('');
    setShowForm(false);
  };

  const getExamLabel = (type: string) => EXAM_TYPES.find(e => e.value === type)?.label || type;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <FlaskConical className="w-4 h-4" style={{ color: '#C4764A' }} />
            Exames Laboratoriais
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="gap-1 text-xs"
          >
            <Plus className="w-3 h-3" />
            {showForm ? 'Cancelar' : 'Novo Exame'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 rounded-xl bg-muted/30 space-y-3 border border-border/50">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data do Exame *</Label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo de Exame *</Label>
                <Select value={examType} onValueChange={handleExamTypeChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map(exam => (
                      <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ex: 95"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Unidade</Label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="h-9 text-sm"
                  readOnly={examType !== 'outro'}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Referência</Label>
                <Input
                  value={referenceRange}
                  onChange={(e) => setReferenceRange(e.target.value)}
                  className="h-9 text-sm"
                  readOnly={examType !== 'outro'}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Observações</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionais..."
                className="h-9 text-sm"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-9 text-sm"
              style={{ backgroundColor: '#518C5B' }}
            >
              {saving ? 'Salvando...' : 'Salvar Exame'}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4 text-sm text-muted-foreground">Carregando exames...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Nenhum exame registrado ainda.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map(result => {
              const abnormal = isValueAbnormal(result.value, result.exam_type);
              return (
                <div
                  key={result.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    abnormal ? 'border-red-500/30 bg-red-500/5' : 'border-border/50 bg-muted/20'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{getExamLabel(result.exam_type)}</span>
                      {abnormal && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                          <AlertTriangle className="w-3 h-3 mr-0.5" />
                          Alterado
                        </Badge>
                      )}
                      {!abnormal && result.value !== null && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-green-600 border-green-600/30">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" />
                          Normal
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono font-medium text-foreground">
                        {result.value} {result.unit}
                      </span>
                      {result.reference_range && (
                        <span>Ref: {result.reference_range}</span>
                      )}
                      <span>{format(new Date(result.exam_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                    {result.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{result.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                    onClick={() => handleDelete(result.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}