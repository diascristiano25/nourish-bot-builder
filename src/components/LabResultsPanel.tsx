import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, FlaskConical, AlertTriangle, CheckCircle2, Upload, FileText, Image as ImageIcon, X, Eye } from 'lucide-react';
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
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
}

interface LabResultsPanelProps {
  patientId: string;
  readOnly?: boolean;
}

const EXAM_TYPES = [
  // Glicemia e metabolismo
  { value: 'glicemia_jejum', label: 'Glicemia (Jejum)', unit: 'mg/dL', ref: '70-99' },
  { value: 'glicemia_pos', label: 'Glicemia (Pós-prandial)', unit: 'mg/dL', ref: '< 140' },
  { value: 'hemoglobina_glicada', label: 'Hemoglobina Glicada (HbA1c)', unit: '%', ref: '< 5.7' },
  { value: 'insulina_jejum', label: 'Insulina (Jejum)', unit: 'µUI/mL', ref: '2-25' },
  { value: 'homa_ir', label: 'HOMA-IR', unit: '', ref: '< 2.5' },
  // Lipídios
  { value: 'colesterol_total', label: 'Colesterol Total', unit: 'mg/dL', ref: '< 200' },
  { value: 'hdl', label: 'HDL', unit: 'mg/dL', ref: '> 40 (H) / > 50 (M)' },
  { value: 'ldl', label: 'LDL', unit: 'mg/dL', ref: '< 100' },
  { value: 'vldl', label: 'VLDL', unit: 'mg/dL', ref: '5-40' },
  { value: 'triglicerideos', label: 'Triglicerídeos', unit: 'mg/dL', ref: '< 150' },
  { value: 'colesterol_nao_hdl', label: 'Colesterol Não-HDL', unit: 'mg/dL', ref: '< 130' },
  // Tireoide
  { value: 'tsh', label: 'TSH', unit: 'mUI/L', ref: '0.4-4.0' },
  { value: 't4_livre', label: 'T4 Livre', unit: 'ng/dL', ref: '0.8-1.8' },
  { value: 't3_livre', label: 'T3 Livre', unit: 'pg/mL', ref: '2.3-4.2' },
  { value: 'anti_tpo', label: 'Anti-TPO', unit: 'UI/mL', ref: '< 35' },
  // Função renal
  { value: 'ureia', label: 'Ureia', unit: 'mg/dL', ref: '15-40' },
  { value: 'creatinina', label: 'Creatinina', unit: 'mg/dL', ref: '0.6-1.2 (H) / 0.5-1.0 (M)' },
  { value: 'acido_urico', label: 'Ácido Úrico', unit: 'mg/dL', ref: '3.5-7.2 (H) / 2.6-6.0 (M)' },
  { value: 'taxa_filtracao_glomerular', label: 'Taxa de Filtração Glomerular', unit: 'mL/min', ref: '> 60' },
  // Função hepática
  { value: 'tgo_ast', label: 'TGO/AST', unit: 'U/L', ref: '10-40' },
  { value: 'tgp_alt', label: 'TGP/ALT', unit: 'U/L', ref: '7-56' },
  { value: 'ggt', label: 'GGT', unit: 'U/L', ref: '9-48 (H) / 8-30 (M)' },
  { value: 'bilirrubina_total', label: 'Bilirrubina Total', unit: 'mg/dL', ref: '0.1-1.2' },
  { value: 'fosfatase_alcalina', label: 'Fosfatase Alcalina', unit: 'U/L', ref: '44-147' },
  { value: 'albumina', label: 'Albumina', unit: 'g/dL', ref: '3.5-5.0' },
  { value: 'proteina_total', label: 'Proteína Total', unit: 'g/dL', ref: '6.0-8.3' },
  // Hemograma
  { value: 'hemoglobina', label: 'Hemoglobina', unit: 'g/dL', ref: '13-17 (H) / 12-15 (M)' },
  { value: 'hematocrito', label: 'Hematócrito', unit: '%', ref: '40-54 (H) / 36-48 (M)' },
  { value: 'leucocitos', label: 'Leucócitos', unit: '/mm³', ref: '4000-11000' },
  { value: 'plaquetas', label: 'Plaquetas', unit: '/mm³', ref: '150000-450000' },
  { value: 'rdw', label: 'RDW', unit: '%', ref: '11.5-14.5' },
  { value: 'vcm', label: 'VCM', unit: 'fL', ref: '80-100' },
  { value: 'hcm', label: 'HCM', unit: 'pg', ref: '27-33' },
  // Vitaminas e minerais
  { value: 'vitamina_d', label: 'Vitamina D (25-OH)', unit: 'ng/mL', ref: '30-100' },
  { value: 'vitamina_b12', label: 'Vitamina B12', unit: 'pg/mL', ref: '200-900' },
  { value: 'vitamina_b9', label: 'Ácido Fólico (B9)', unit: 'ng/mL', ref: '3-17' },
  { value: 'ferritina', label: 'Ferritina', unit: 'ng/mL', ref: '20-300 (H) / 15-150 (M)' },
  { value: 'ferro_serico', label: 'Ferro Sérico', unit: 'µg/dL', ref: '60-170 (H) / 50-170 (M)' },
  { value: 'transferrina', label: 'Transferrina', unit: 'mg/dL', ref: '200-360' },
  { value: 'calcio', label: 'Cálcio', unit: 'mg/dL', ref: '8.5-10.5' },
  { value: 'magnesio', label: 'Magnésio', unit: 'mg/dL', ref: '1.7-2.2' },
  { value: 'zinc', label: 'Zinco', unit: 'µg/dL', ref: '70-120' },
  { value: 'selenio', label: 'Selênio', unit: 'µg/L', ref: '70-150' },
  // Hormônios
  { value: 'testosterona_total', label: 'Testosterona Total', unit: 'ng/dL', ref: '241-827 (H) / 15-70 (M)' },
  { value: 'testosterona_livre', label: 'Testosterona Livre', unit: 'pg/mL', ref: '4.5-22.0 (H)' },
  { value: 'estradiol', label: 'Estradiol (E2)', unit: 'pg/mL', ref: '10-40 (H) / varia ciclo (M)' },
  { value: 'progesterona', label: 'Progesterona', unit: 'ng/mL', ref: 'varia ciclo' },
  { value: 'lh', label: 'LH', unit: 'mUI/mL', ref: '1.7-8.6 (H) / varia ciclo (M)' },
  { value: 'fsh', label: 'FSH', unit: 'mUI/mL', ref: '1.5-12.4 (H) / varia ciclo (M)' },
  { value: 'prolactina', label: 'Prolactina', unit: 'ng/mL', ref: '2-18 (H) / 2-29 (M)' },
  { value: 'cortisol', label: 'Cortisol', unit: 'µg/dL', ref: '6-18 (manhã)' },
  { value: 'dhea_s', label: 'DHEA-S', unit: 'µg/dL', ref: 'varia idade' },
  { value: 'igf1', label: 'IGF-1', unit: 'ng/mL', ref: 'varia idade' },
  // Inflamação e coagulação
  { value: 'pcr_ultrassensivel', label: 'PCR Ultrassensível', unit: 'mg/L', ref: '< 3.0' },
  { value: 'vs', label: 'Velocidade de Sedimentação (VS)', unit: 'mm/h', ref: '< 15 (H) / < 20 (M)' },
  { value: 'fibrinogenio', label: 'Fibrinogênio', unit: 'mg/dL', ref: '200-400' },
  { value: 'homocisteina', label: 'Homocisteína', unit: 'µmol/L', ref: '5-15' },
  // Eletrólitos
  { value: 'sodio', label: 'Sódio', unit: 'mEq/L', ref: '136-145' },
  { value: 'potassio', label: 'Potássio', unit: 'mEq/L', ref: '3.5-5.1' },
  { value: 'cloro', label: 'Cloro', unit: 'mEq/L', ref: '98-106' },
  { value: 'bicarbonato', label: 'Bicarbonato', unit: 'mEq/L', ref: '22-29' },
  // Outros
  { value: 'sumario_urina', label: 'Sumário de Urina', unit: '', ref: 'Variável' },
  { value: 'parasitologico', label: 'Parasitológico de Fezes', unit: '', ref: 'Negativo' },
  { value: 'outro', label: 'Outro', unit: '', ref: '' },
];

const REFERENCE_RANGES: Record<string, [number, number]> = {
  glicemia_jejum: [70, 99],
  glicemia_pos: [0, 140],
  hemoglobina_glicada: [0, 5.7],
  insulina_jejum: [2, 25],
  homa_ir: [0, 2.5],
  colesterol_total: [0, 200],
  hdl: [40, 200],
  ldl: [0, 100],
  vldl: [5, 40],
  triglicerideos: [0, 150],
  colesterol_nao_hdl: [0, 130],
  tsh: [0.4, 4.0],
  t4_livre: [0.8, 1.8],
  t3_livre: [2.3, 4.2],
  anti_tpo: [0, 35],
  ureia: [15, 40],
  creatinina: [0.5, 1.2],
  acido_urico: [2.6, 7.2],
  taxa_filtracao_glomerular: [60, 200],
  tgo_ast: [10, 40],
  tgp_alt: [7, 56],
  ggt: [8, 48],
  bilirrubina_total: [0.1, 1.2],
  fosfatase_alcalina: [44, 147],
  albumina: [3.5, 5.0],
  proteina_total: [6.0, 8.3],
  hemoglobina: [12, 17],
  hematocrito: [36, 54],
  leucocitos: [4000, 11000],
  plaquetas: [150000, 450000],
  rdw: [11.5, 14.5],
  vcm: [80, 100],
  hcm: [27, 33],
  vitamina_d: [30, 100],
  vitamina_b12: [200, 900],
  vitamina_b9: [3, 17],
  ferritina: [15, 300],
  ferro_serico: [50, 170],
  transferrina: [200, 360],
  calcio: [8.5, 10.5],
  magnesio: [1.7, 2.2],
  zinc: [70, 120],
  selenio: [70, 150],
  testosterona_total: [15, 827],
  pcr_ultrassensivel: [0, 3.0],
  vs: [0, 20],
  fibrinogenio: [200, 400],
  homocisteina: [5, 15],
  sodio: [136, 145],
  potassio: [3.5, 5.1],
  cloro: [98, 106],
  bicarbonato: [22, 29],
};

function isValueAbnormal(value: number | null, examType: string): boolean {
  if (value === null) return false;
  const range = REFERENCE_RANGES[examType];
  if (!range) return false;
  return value < range[0] || value > range[1];
}

export function LabResultsPanel({ patientId, readOnly = false }: LabResultsPanelProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [examDate, setExamDate] = useState('');
  const [examType, setExamType] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [referenceRange, setReferenceRange] = useState('');
  const [notes, setNotes] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      console.error('Erro ao carregar exames:', error);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 10MB.', variant: 'destructive' });
      return;
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Formato não suportado', description: 'Use PDF, JPG, PNG ou WebP.', variant: 'destructive' });
      return;
    }
    setAttachmentFile(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadAttachment = async (file: File): Promise<{ url: string; type: string } | null> => {
    try {
      setUploading(true);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const fileName = `${patientId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('lab-attachments')
        .upload(fileName, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from('lab-attachments')
        .getPublicUrl(fileName);
      const type = file.type.startsWith('image/') ? 'image' : 'pdf';
      return { url: urlData.publicUrl, type };
    } catch (error: any) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!examDate && !attachmentFile) {
      toast({ title: 'Campos obrigatórios', description: 'Informe a data ou anexe um arquivo.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let attachmentUrl: string | null = null;
      let attachmentType: string | null = null;
      let attachmentName: string | null = null;

      if (attachmentFile) {
        const uploaded = await uploadAttachment(attachmentFile);
        if (uploaded) {
          attachmentUrl = uploaded.url;
          attachmentType = uploaded.type;
          attachmentName = attachmentFile.name;
        }
      }

      const { error } = await supabase.from('lab_results').insert({
        patient_id: patientId,
        exam_date: examDate || new Date().toISOString().split('T')[0],
        exam_type: examType || 'outro',
        value: value ? parseFloat(value) : null,
        unit: unit || null,
        reference_range: referenceRange || null,
        notes: notes || null,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
      });
      if (error) throw error;
      toast({ title: 'Exame registrado!', description: 'Resultado salvo com sucesso.' });
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
    removeAttachment();
    setShowForm(false);
  };

  const getExamLabel = (type: string) => EXAM_TYPES.find(e => e.value === type)?.label || type;

  const groupedExams = results.reduce((acc, r) => {
    const dateKey = r.exam_date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(r);
    return acc;
  }, {} as Record<string, LabResult[]>);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <FlaskConical className="w-4 h-4" style={{ color: '#C4764A' }} />
            Exames Laboratoriais
            <span className="text-xs font-normal text-muted-foreground">({results.length})</span>
          </CardTitle>
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="gap-1 text-xs"
            >
              <Plus className="w-3 h-3" />
              {showForm ? 'Cancelar' : 'Novo Exame'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && !readOnly && (
          <div className="p-4 rounded-xl bg-muted/30 space-y-3 border border-border/50">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data do Exame</Label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo de Exame</Label>
                <Select value={examType} onValueChange={handleExamTypeChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {EXAM_TYPES.map(exam => (
                      <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Valor</Label>
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
            {/* Upload de anexo */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Upload className="w-3 h-3" />
                Anexo (PDF ou Imagem) — opcional
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                onChange={handleFileSelect}
                className="hidden"
              />
              {!attachmentFile ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-10 border-dashed gap-2 text-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Selecionar arquivo (PDF, JPG, PNG — máx 10MB)
                </Button>
              ) : (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-red-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{attachmentFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">{(attachmentFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400"
                    onClick={removeAttachment}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="w-full h-9 text-sm"
              style={{ backgroundColor: '#518C5B' }}
            >
              {saving || uploading ? 'Salvando...' : 'Salvar Exame'}
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
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedExams)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([dateKey, exams]) => (
                <div key={dateKey}>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    📅 {format(new Date(dateKey + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <div className="space-y-2">
                    {exams.map(result => {
                      const abnormal = isValueAbnormal(result.value, result.exam_type);
                      return (
                        <div
                          key={result.id}
                          className={`p-3 rounded-lg border ${
                            abnormal ? 'border-red-500/30 bg-red-500/5' : 'border-border/50 bg-muted/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-medium text-sm">{getExamLabel(result.exam_type)}</span>
                                {result.value !== null && abnormal && (
                                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                                    <AlertTriangle className="w-3 h-3 mr-0.5" />
                                    Alterado
                                  </Badge>
                                )}
                                {result.value !== null && !abnormal && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-green-600 border-green-600/30">
                                    <CheckCircle2 className="w-3 h-3 mr-0.5" />
                                    Normal
                                  </Badge>
                                )}
                                {result.attachment_url && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5">
                                    {result.attachment_type === 'image' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                    Anexo
                                  </Badge>
                                )}
                              </div>
                              {result.value !== null && (
                                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                  <span className="font-mono font-medium text-foreground">
                                    {result.value} {result.unit}
                                  </span>
                                  {result.reference_range && (
                                    <span>Ref: {result.reference_range}</span>
                                  )}
                                </div>
                              )}
                              {result.notes && (
                                <p className="text-xs text-muted-foreground mt-1 italic">{result.notes}</p>
                              )}
                              {result.attachment_url && (
                                <a
                                  href={result.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-2 text-xs text-cyber-lime hover:underline"
                                >
                                  <Eye className="w-3 h-3" />
                                  {result.attachment_name || 'Ver anexo'}
                                </a>
                              )}
                            </div>
                            {!readOnly && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-400 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                                onClick={() => handleDelete(result.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}