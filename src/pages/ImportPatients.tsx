import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, AlertTriangle, XCircle, Copy, Users,
} from 'lucide-react';
import {
  FIELDS, MAX_IMPORT_ROWS, ParsedRow, ColumnMap, digitsOnly, downloadTemplate, parseRows, readSpreadsheet,
} from '@/lib/patient-import';

type Step = 'upload' | 'preview' | 'importing' | 'done';
type Preview = { rows: ParsedRow[]; map: ColumnMap; unrecognized: string[]; fileName: string };
type Result = { imported: number; failed: { line: number; name: string; reason: string }[]; measurements: number };

const CHUNK = 50;

export default function ImportPatients() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleTemplate = async () => {
    setDownloading(true);
    try { await downloadTemplate(); }
    catch (e: any) { toast({ title: 'Não foi possível gerar o modelo', description: e.message, variant: 'destructive' }); }
    finally { setDownloading(false); }
  };

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file || !user) return;
    setReading(true);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Arquivo muito grande (máximo 10 MB).');
      const table = await readSpreadsheet(file);
      if (table.length - 1 > MAX_IMPORT_ROWS) {
        throw new Error(`A planilha tem ${table.length - 1} linhas. O limite é ${MAX_IMPORT_ROWS} pacientes por importação: divida o arquivo.`);
      }
      const { data: nutri } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (!nutri) throw new Error('Perfil do nutricionista não encontrado.');
      const { data: existing, error } = await supabase
        .from('patients').select('email, phone').eq('nutritionist_id', nutri.id).limit(10000);
      if (error) throw error;
      const parsed = parseRows(table, {
        emails: new Set((existing ?? []).map(p => (p.email ?? '').toLowerCase()).filter(Boolean)),
        phones: new Set((existing ?? []).map(p => digitsOnly(p.phone ?? '')).filter(Boolean)),
      });
      setPreview({ ...parsed, fileName: file.name });
      setStep('preview');
    } catch (e: any) {
      toast({ title: 'Não consegui ler a planilha', description: e.message, variant: 'destructive' });
    } finally {
      setReading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [user, toast]);

  const importable = preview?.rows.filter(r => r.errors.length === 0 && !r.duplicate) ?? [];
  const duplicates = preview?.rows.filter(r => r.duplicate) ?? [];
  const invalid = preview?.rows.filter(r => r.errors.length > 0) ?? [];

  const runImport = async () => {
    if (!user || importable.length === 0) return;
    setStep('importing');
    setProgress(0);
    const failed: Result['failed'] = [];
    let imported = 0;
    let measurements = 0;
    try {
      const { data: nutri } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      if (!nutri) throw new Error('Perfil do nutricionista não encontrado.');

      const toRecord = (r: ParsedRow) => ({ nutritionist_id: nutri.id, ...r.patient });
      const created: { id: string; row: ParsedRow }[] = [];

      for (let i = 0; i < importable.length; i += CHUNK) {
        const chunk = importable.slice(i, i + CHUNK);
        const { data, error } = await supabase.from('patients').insert(chunk.map(toRecord)).select('id');
        if (!error && data && data.length === chunk.length) {
          data.forEach((d, k) => created.push({ id: d.id, row: chunk[k] }));
        } else {
          // lote falhou: tenta um a um para isolar a linha com problema
          for (const row of chunk) {
            const { data: one, error: e1 } = await supabase.from('patients').insert(toRecord(row)).select('id').single();
            if (e1 || !one) failed.push({ line: row.line, name: row.patient.full_name, reason: e1?.message ?? 'Erro desconhecido' });
            else created.push({ id: one.id, row });
          }
        }
        setProgress(Math.round(((i + chunk.length) / importable.length) * 80));
      }
      imported = created.length;

      // medidas: vira a 1ª avaliação (anthropometrics) + ponto no gráfico de peso (weight_logs)
      const withMeasure = created.filter(c => c.row.measurement);
      for (let i = 0; i < withMeasure.length; i += CHUNK) {
        const chunk = withMeasure.slice(i, i + CHUNK);
        const { error } = await supabase.from('anthropometrics').insert(
          chunk.map(c => ({ patient_id: c.id, notes: 'Importado de planilha', ...c.row.measurement! })),
        );
        if (error) {
          chunk.forEach(c => failed.push({ line: c.row.line, name: c.row.patient.full_name, reason: `Paciente criado, mas as medidas falharam: ${error.message}` }));
        } else measurements += chunk.length;
        const weights = chunk.filter(c => c.row.measurement!.weight_kg !== null);
        if (weights.length) {
          await supabase.from('weight_logs').insert(
            weights.map(c => ({ patient_id: c.id, weight: c.row.measurement!.weight_kg!, measured_at: c.row.measurement!.measured_at, notes: 'Importado de planilha' })),
          );
        }
      }
      setProgress(100);
      setResult({ imported, failed, measurements });
      setStep('done');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    } catch (e: any) {
      toast({ title: 'Erro na importação', description: e.message, variant: 'destructive' });
      if (imported > 0) { setResult({ imported, failed, measurements }); setStep('done'); queryClient.invalidateQueries({ queryKey: ['patients'] }); }
      else setStep('preview');
    }
  };

  if (authLoading) return null;

  return (
    <ModernLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <PageHeader
          title="Importar pacientes"
          subtitle="Traga todos os seus pacientes de uma vez, direto de uma planilha"
          icon={<FileSpreadsheet className="w-7 h-7 text-white" />}
          actions={
            <Button onClick={() => navigate('/pacientes')} variant="ghost" className="text-white hover:bg-card/20 rounded-xl">
              <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
            </Button>
          }
        />

        {step === 'upload' && (
          <>
            <RichCard padding="lg">
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">1. Baixe o modelo</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use o modelo para que cada coluna (nome, contato, peso, medidas, anamnese) vá para o lugar certo da ficha.
                    Já vem com exemplo, listas de opções e uma aba de instruções.
                  </p>
                </div>
                <Button onClick={handleTemplate} disabled={downloading} variant="outline" className="shrink-0 gap-2 border-[#518C5B] text-[#518C5B]">
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Baixar modelo (.xlsx)
                </Button>
              </div>
            </RichCard>

            <RichCard padding="lg">
              <h3 className="text-lg font-bold text-foreground mb-3">2. Envie sua planilha</h3>
              <div
                role="button"
                tabIndex={0}
                aria-label="Selecionar planilha de pacientes"
                onClick={() => inputRef.current?.click()}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${dragging ? 'border-[#518C5B] bg-[#518C5B]/10' : 'border-border hover:border-[#518C5B]/60 hover:bg-muted/40'}`}
              >
                {reading ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin text-[#518C5B]" />Lendo planilha...</div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-9 h-9 text-[#518C5B]" />
                    <p className="font-semibold text-foreground">Arraste o arquivo aqui ou clique para escolher</p>
                    <p className="text-sm text-muted-foreground">Excel (.xlsx) ou CSV · até {MAX_IMPORT_ROWS} pacientes</p>
                  </div>
                )}
                <input ref={inputRef} type="file" accept=".xlsx,.csv,.txt" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Você confere tudo antes de importar. Nenhum email é enviado ao paciente. Duplicados (mesmo email ou celular) são ignorados.
              </p>
            </RichCard>
          </>
        )}

        {step === 'preview' && preview && (
          <>
            <RichCard padding="lg">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Confira o que a IA reconheceu</h3>
                  <p className="text-sm text-muted-foreground">{preview.fileName}</p>
                </div>
                <Button variant="ghost" onClick={() => { setPreview(null); setStep('upload'); }}>Trocar arquivo</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <Stat icon={<Users className="w-4 h-4" />} label="Na planilha" value={preview.rows.length} />
                <Stat icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} label="Serão importados" value={importable.length} />
                <Stat icon={<Copy className="w-4 h-4 text-amber-600" />} label="Duplicados (ignorados)" value={duplicates.length} />
                <Stat icon={<XCircle className="w-4 h-4 text-red-600" />} label="Com erro (ignorados)" value={invalid.length} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Colunas reconhecidas:</span>
                {FIELDS.filter(f => preview.map[f.key] !== undefined).map(f => <Badge key={f.key} variant="secondary">{f.label}</Badge>)}
              </div>
              {preview.unrecognized.length > 0 && (
                <p className="text-xs text-amber-700 mt-2 flex items-start gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  Colunas ignoradas (não fazem parte do modelo): {preview.unrecognized.join(', ')}
                </p>
              )}
            </RichCard>

            <RichCard padding="none">
              <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Linha</th><th className="px-3 py-2">Nome</th><th className="px-3 py-2">Contato</th>
                      <th className="px-3 py-2">Peso/Altura</th><th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map(r => (
                      <tr key={r.line} className="border-t border-border align-top">
                        <td className="px-3 py-2 text-muted-foreground">{r.line}</td>
                        <td className="px-3 py-2 font-medium">{r.patient.full_name || '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{[r.patient.email, r.patient.phone].filter(Boolean).join(' · ') || '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {[r.patient.initial_weight && `${r.patient.initial_weight} kg`, r.patient.height && `${r.patient.height} cm`].filter(Boolean).join(' · ') || '—'}
                        </td>
                        <td className="px-3 py-2">
                          {r.errors.length > 0 ? <span className="text-red-600">{r.errors.join('; ')}</span>
                            : r.duplicate ? <span className="text-amber-700">{r.duplicate}</span>
                            : <span className="text-emerald-700">OK</span>}
                          {r.errors.length === 0 && r.warnings.length > 0 && (
                            <div className="text-xs text-amber-700 mt-0.5">{r.warnings.join('; ')}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </RichCard>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setPreview(null); setStep('upload'); }}>Cancelar</Button>
              <Button onClick={runImport} disabled={importable.length === 0} className="bg-gradient-to-r from-[#518C5B] to-[#3d7047] text-white gap-2">
                <Upload className="w-4 h-4" /> Importar {importable.length} {importable.length === 1 ? 'paciente' : 'pacientes'}
              </Button>
            </div>
          </>
        )}

        {step === 'importing' && (
          <RichCard padding="lg">
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-10 h-10 animate-spin text-[#518C5B]" />
              <p className="font-semibold">Importando pacientes... não feche esta página.</p>
              <Progress value={progress} className="max-w-md" />
            </div>
          </RichCard>
        )}

        {step === 'done' && result && (
          <RichCard padding="lg">
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-600" />
              <h3 className="text-2xl font-bold">Importação concluída</h3>
              <p className="text-muted-foreground">
                {result.imported} {result.imported === 1 ? 'paciente adicionado' : 'pacientes adicionados'} à sua lista
                {result.measurements > 0 && ` · ${result.measurements} com medidas registradas`}
              </p>
              {result.failed.length > 0 && (
                <div className="text-left w-full max-w-xl mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <p className="font-semibold mb-1">{result.failed.length} linha(s) com problema:</p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {result.failed.slice(0, 20).map((f, i) => <li key={i}>Linha {f.line} ({f.name}): {f.reason}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => { setPreview(null); setResult(null); setStep('upload'); }}>Importar outra planilha</Button>
                <Button onClick={() => navigate('/pacientes')} className="bg-gradient-to-r from-[#518C5B] to-[#3d7047] text-white">Ver meus pacientes</Button>
              </div>
            </div>
          </RichCard>
        )}
      </div>
    </ModernLayout>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
