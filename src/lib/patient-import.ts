/**
 * Importação de pacientes via planilha (Excel/CSV).
 * Funções puras (sem Supabase) para facilitar teste: leitura do arquivo,
 * reconhecimento de colunas, normalização/validação e geração do modelo.
 */

export const MAX_IMPORT_ROWS = 500;

export type ImportField =
  | 'full_name' | 'email' | 'phone' | 'birth_date' | 'gender' | 'goal'
  | 'activity_level' | 'weight' | 'height' | 'waist' | 'hip' | 'body_fat'
  | 'measured_at' | 'allergies' | 'restrictions' | 'medical_conditions' | 'notes';

export interface FieldDef {
  key: ImportField;
  label: string; // cabeçalho oficial do modelo
  required?: boolean;
  aliases: string[];
  example: string;
  hint: string;
}

export const FIELDS: FieldDef[] = [
  { key: 'full_name', label: 'Nome', required: true, aliases: ['nome', 'nome completo', 'paciente', 'name', 'full name', 'nome do paciente'], example: 'Maria da Silva', hint: 'Obrigatório' },
  { key: 'email', label: 'Email', aliases: ['email', 'e-mail', 'e mail'], example: 'maria@email.com', hint: 'Usado para evitar duplicados' },
  { key: 'phone', label: 'Celular', aliases: ['celular', 'telefone', 'whatsapp', 'fone', 'phone', 'contato', 'tel'], example: '(11) 99999-9999', hint: 'Com DDD' },
  { key: 'birth_date', label: 'Data de Nascimento', aliases: ['data de nascimento', 'nascimento', 'data nascimento', 'dt nascimento', 'birth date', 'aniversario'], example: '15/03/1990', hint: 'DD/MM/AAAA' },
  { key: 'gender', label: 'Sexo', aliases: ['sexo', 'genero', 'gender'], example: 'Feminino', hint: 'Feminino, Masculino ou Outro' },
  { key: 'goal', label: 'Objetivo', aliases: ['objetivo', 'meta', 'goal'], example: 'Emagrecimento', hint: 'Emagrecimento, Hipertrofia, Manutenção, Saúde ou Performance Esportiva' },
  { key: 'activity_level', label: 'Nível de Atividade', aliases: ['nivel de atividade', 'nivel atividade', 'atividade', 'atividade fisica', 'activity level'], example: 'Moderado', hint: 'Sedentário, Leve, Moderado, Intenso ou Extremo' },
  { key: 'weight', label: 'Peso (kg)', aliases: ['peso', 'peso kg', 'peso atual', 'peso (kg)', 'weight'], example: '72,5', hint: 'Em kg' },
  { key: 'height', label: 'Altura (cm)', aliases: ['altura', 'altura cm', 'altura (cm)', 'height'], example: '165', hint: 'Em cm (1,65 também funciona)' },
  { key: 'waist', label: 'Cintura (cm)', aliases: ['cintura', 'cintura cm', 'cintura (cm)', 'waist'], example: '80', hint: 'Em cm' },
  { key: 'hip', label: 'Quadril (cm)', aliases: ['quadril', 'quadril cm', 'quadril (cm)', 'hip'], example: '100', hint: 'Em cm' },
  { key: 'body_fat', label: 'Gordura Corporal (%)', aliases: ['gordura corporal', 'gordura', 'percentual de gordura', '% gordura', 'gordura (%)', 'gordura corporal (%)', 'body fat', 'bf'], example: '28', hint: 'Percentual' },
  { key: 'measured_at', label: 'Data da Medição', aliases: ['data da medicao', 'data medicao', 'data da avaliacao', 'data avaliacao', 'medido em'], example: '10/11/2026', hint: 'DD/MM/AAAA. Vazio = hoje' },
  { key: 'allergies', label: 'Alergias', aliases: ['alergias', 'alergia', 'allergies'], example: 'Lactose; Glúten', hint: 'Separe por ; ou vírgula' },
  { key: 'restrictions', label: 'Restrições Alimentares', aliases: ['restricoes alimentares', 'restricoes', 'restricao', 'dieta', 'restrictions'], example: 'Vegetariano', hint: 'Separe por ; ou vírgula' },
  { key: 'medical_conditions', label: 'Condições Médicas', aliases: ['condicoes medicas', 'condicoes de saude', 'patologias', 'doencas', 'medical conditions', 'condicoes'], example: 'Hipotireoidismo', hint: 'Texto livre' },
  { key: 'notes', label: 'Anamnese / Observações', aliases: ['anamnese', 'observacoes', 'observacao', 'obs', 'notas', 'notes', 'anamnese observacoes', 'anamnese / observacoes', 'historico'], example: 'Sono irregular, come fora 4x/semana', hint: 'Texto livre' },
];

// ---------- helpers de texto ----------

export const normalizeText = (s: unknown): string =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9%()/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const cellToString = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'object') {
    const o = v as any;
    if (o.text !== undefined) return String(o.text).trim(); // hyperlink
    if (o.result !== undefined) return cellToString(o.result); // fórmula
    if (Array.isArray(o.richText)) return o.richText.map((r: any) => r.text).join('').trim();
    return '';
  }
  return String(v).trim();
};

// ---------- leitura de arquivos ----------

/** Parser de CSV com aspas e detecção de separador (; , ou tab). */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? '';
  const delim = [';', '\t', ','].map(d => ({ d, n: firstLine.split(d).length })).sort((a, b) => b.n - a.n)[0].d;
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (inQ) {
      if (c === '"') {
        if (clean[i + 1] === '"') { cur += '"'; i++; } else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === delim) { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && clean[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      rows.push(row); row = [];
    } else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

export async function readSpreadsheet(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv') || name.endsWith('.txt')) {
    const buf = await file.arrayBuffer();
    let text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
    // Excel em português costuma salvar CSV em Windows-1252
    if (text.includes('�')) text = new TextDecoder('windows-1252').decode(buf);
    return parseCsv(text);
  }
  if (name.endsWith('.xlsx')) {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    // usa a aba "Pacientes" se existir, senão a primeira com dados
    const ws = wb.getWorksheet('Pacientes') ?? wb.worksheets.find(w => w.rowCount > 0);
    if (!ws) return [];
    const out: string[][] = [];
    ws.eachRow({ includeEmpty: false }, (row) => {
      const vals: string[] = [];
      for (let c = 1; c <= ws.columnCount; c++) vals.push(cellToString(row.getCell(c).value));
      out.push(vals);
    });
    return out.filter(r => r.some(c => c !== ''));
  }
  throw new Error('Formato não suportado. Envie um arquivo .xlsx ou .csv (arquivos .xls antigos: salve como .xlsx).');
}

// ---------- conversões de valor ----------

export function parseNumber(v: string): number | null {
  if (!v) return null;
  let s = v.replace(/[^\d.,-]/g, '');
  if (!s) return null;
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
  else s = s.replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** Aceita DD/MM/AAAA, DD-MM-AAAA, AAAA-MM-DD e DD/MM/AA. Retorna ISO (AAAA-MM-DD) ou null. */
export function parseDate(v: string): string | null {
  if (!v) return null;
  const s = v.trim();
  let y: number, m: number, d: number;
  let mt = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (mt) { y = +mt[1]; m = +mt[2]; d = +mt[3]; }
  else if ((mt = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/))) {
    d = +mt[1]; m = +mt[2]; y = +mt[3];
    if (y < 100) y += y > 30 ? 1900 : 2000;
  } else return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

const GENDER: Record<string, string> = {
  f: 'female', fem: 'female', feminino: 'female', mulher: 'female', female: 'female',
  m: 'male', masc: 'male', masculino: 'male', homem: 'male', male: 'male',
  outro: 'other', outra: 'other', other: 'other', nb: 'other',
};
const GOAL: Record<string, string> = {
  emagrecimento: 'weight_loss', emagrecer: 'weight_loss', 'perda de peso': 'weight_loss', 'perder peso': 'weight_loss', 'weight loss': 'weight_loss',
  hipertrofia: 'muscle_gain', 'ganho de massa': 'muscle_gain', 'ganho de massa muscular': 'muscle_gain', 'muscle gain': 'muscle_gain',
  manutencao: 'maintenance', maintenance: 'maintenance',
  saude: 'health_improvement', 'melhora da saude': 'health_improvement', 'qualidade de vida': 'health_improvement', 'health improvement': 'health_improvement',
  'performance esportiva': 'sports_performance', performance: 'sports_performance', esportivo: 'sports_performance', 'sports performance': 'sports_performance',
};
const ACTIVITY: Record<string, string> = {
  sedentario: 'sedentary', sedentary: 'sedentary',
  leve: 'lightly_active', 'levemente ativo': 'lightly_active', 'lightly active': 'lightly_active',
  moderado: 'moderately_active', 'moderadamente ativo': 'moderately_active', 'moderately active': 'moderately_active',
  intenso: 'very_active', 'muito ativo': 'very_active', 'very active': 'very_active',
  extremo: 'extremely_active', 'extremamente ativo': 'extremely_active', 'extremely active': 'extremely_active',
};

const splitList = (v: string): string[] =>
  v.split(/[;,|\n]/).map(x => x.trim()).filter(Boolean);

export const digitsOnly = (s: string) => s.replace(/\D/g, '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- mapeamento de colunas ----------

export type ColumnMap = Partial<Record<ImportField, number>>;

export function detectColumns(headers: string[]): { map: ColumnMap; unrecognized: string[] } {
  const map: ColumnMap = {};
  const used = new Set<number>();
  const norm = headers.map(normalizeText);
  // 1ª passada: igualdade exata com rótulo/alias; 2ª: alias contido no cabeçalho
  for (const pass of [0, 1]) {
    for (const f of FIELDS) {
      if (map[f.key] !== undefined) continue;
      const cands = [normalizeText(f.label), ...f.aliases.map(normalizeText)];
      const idx = norm.findIndex((h, i) => !used.has(i) && h !== '' &&
        (pass === 0 ? cands.includes(h) : cands.some(c => c.length > 3 && h.includes(c))));
      if (idx >= 0) { map[f.key] = idx; used.add(idx); }
    }
  }
  const unrecognized = headers.filter((h, i) => !used.has(i) && h.trim() !== '');
  return { map, unrecognized };
}

// ---------- linhas normalizadas ----------

export interface ParsedRow {
  line: number; // linha na planilha (1 = cabeçalho)
  raw: Record<string, string>;
  errors: string[];
  warnings: string[];
  duplicate?: string; // motivo, se for duplicado
  patient: {
    full_name: string;
    email: string | null;
    phone: string | null;
    birth_date: string | null;
    gender: string | null;
    goal: string | null;
    activity_level: string | null;
    allergies: string[];
    dietary_restrictions: string[];
    medical_conditions: string | null;
    notes: string | null;
    initial_weight: number | null;
    height: number | null;
  };
  measurement: null | {
    measured_at: string;
    weight_kg: number | null;
    height_cm: number | null;
    waist_cm: number | null;
    hip_cm: number | null;
    body_fat_percentage: number | null;
  };
}

export interface ExistingKeys { emails: Set<string>; phones: Set<string>; }

export function parseRows(table: string[][], existing: ExistingKeys) {
  if (table.length === 0) throw new Error('A planilha está vazia.');
  const headers = table[0].map(h => String(h ?? '').trim());
  const { map, unrecognized } = detectColumns(headers);
  if (map.full_name === undefined) {
    throw new Error('Não encontrei a coluna "Nome". Baixe o modelo e use os mesmos títulos de coluna.');
  }
  const dataRows = table.slice(1);
  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();
  const today = new Date().toISOString().slice(0, 10);
  const rows: ParsedRow[] = [];

  dataRows.forEach((cells, i) => {
    const get = (k: ImportField) => (map[k] === undefined ? '' : String(cells[map[k]!] ?? '').trim());
    const errors: string[] = [];
    const warnings: string[] = [];
    const raw: Record<string, string> = {};
    FIELDS.forEach(f => { raw[f.key] = get(f.key); });

    const name = raw.full_name.replace(/\s+/g, ' ');
    if (!name) errors.push('Nome vazio');

    let email: string | null = raw.email ? raw.email.toLowerCase() : null;
    if (email && !EMAIL_RE.test(email)) { warnings.push(`Email inválido ("${raw.email}") foi ignorado`); email = null; }

    let phone: string | null = raw.phone || null;
    if (phone) {
      const d = digitsOnly(phone);
      if (d.length < 8 || d.length > 15) { warnings.push(`Celular inválido ("${raw.phone}") foi ignorado`); phone = null; }
    }

    let birth: string | null = null;
    if (raw.birth_date) {
      birth = parseDate(raw.birth_date);
      if (!birth) warnings.push(`Data de nascimento inválida ("${raw.birth_date}")`);
      else if (birth > today) { warnings.push('Data de nascimento no futuro foi ignorada'); birth = null; }
    }

    const mapVal = (field: ImportField, dict: Record<string, string>, label: string) => {
      if (!raw[field]) return null;
      const v = dict[normalizeText(raw[field])];
      if (!v) warnings.push(`${label} não reconhecido ("${raw[field]}")`);
      return v ?? null;
    };
    const gender = mapVal('gender', GENDER, 'Sexo');
    const goal = mapVal('goal', GOAL, 'Objetivo');
    const activity = mapVal('activity_level', ACTIVITY, 'Nível de atividade');

    const num = (field: ImportField, label: string, min: number, max: number) => {
      if (!raw[field]) return null;
      const n = parseNumber(raw[field]);
      if (n === null || n < min || n > max) {
        warnings.push(`${label} inválido ("${raw[field]}")`);
        return null;
      }
      return n;
    };
    const weight = num('weight', 'Peso', 10, 400);
    let height = num('height', 'Altura', 0.5, 260);
    if (height !== null && height < 3) height = Math.round(height * 100); // 1,65 → 165 cm
    if (height !== null && (height < 50 || height > 260)) { warnings.push(`Altura inválida ("${raw.height}")`); height = null; }
    const waist = num('waist', 'Cintura', 20, 300);
    const hip = num('hip', 'Quadril', 20, 300);
    const bodyFat = num('body_fat', 'Gordura corporal', 1, 80);

    let measuredAt = today;
    if (raw.measured_at) {
      const d = parseDate(raw.measured_at);
      if (d && d <= today) measuredAt = d;
      else warnings.push(`Data da medição inválida ("${raw.measured_at}"), usei hoje`);
    }
    const hasMeasure = [weight, height, waist, hip, bodyFat].some(v => v !== null);

    // duplicados: contra pacientes já cadastrados e dentro do próprio arquivo
    let duplicate: string | undefined;
    const phoneKey = phone ? digitsOnly(phone) : '';
    if (email && existing.emails.has(email)) duplicate = 'Email já cadastrado';
    else if (phoneKey && existing.phones.has(phoneKey)) duplicate = 'Celular já cadastrado';
    else if (email && seenEmails.has(email)) duplicate = 'Email repetido na planilha';
    else if (phoneKey && seenPhones.has(phoneKey)) duplicate = 'Celular repetido na planilha';
    if (email) seenEmails.add(email);
    if (phoneKey) seenPhones.add(phoneKey);

    rows.push({
      line: i + 2,
      raw,
      errors,
      warnings,
      duplicate,
      patient: {
        full_name: name,
        email,
        phone,
        birth_date: birth,
        gender,
        goal,
        activity_level: activity,
        allergies: splitList(raw.allergies),
        dietary_restrictions: splitList(raw.restrictions),
        medical_conditions: raw.medical_conditions || null,
        notes: raw.notes || null,
        initial_weight: weight,
        height,
      },
      measurement: hasMeasure
        ? { measured_at: measuredAt, weight_kg: weight, height_cm: height, waist_cm: waist, hip_cm: hip, body_fat_percentage: bodyFat }
        : null,
    });
  });

  if (rows.length === 0) throw new Error('Não há linhas de pacientes abaixo do cabeçalho.');
  return { rows, map, unrecognized, total: rows.length };
}

// ---------- modelo para download ----------

export async function downloadTemplate(): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'inutri.life';

  const ws = wb.addWorksheet('Pacientes', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = FIELDS.map(f => ({ header: f.required ? `${f.label} *` : f.label, key: f.key, width: Math.max(18, f.label.length + 6) }));
  const head = ws.getRow(1);
  head.height = 24;
  head.eachCell((cell, col) => {
    const req = FIELDS[col - 1].required;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: req ? 'FFC4764A' : 'FF2D5A37' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });
  ws.addRow(Object.fromEntries(FIELDS.map(f => [f.key, f.example])));
  ws.getRow(2).font = { italic: true, color: { argb: 'FF888888' } };
  // colunas de texto para não perder zeros/formatos
  FIELDS.forEach((f, i) => { if (['phone', 'birth_date', 'measured_at'].includes(f.key)) ws.getColumn(i + 1).numFmt = '@'; });

  const list = (key: ImportField, items: string[]) => {
    const col = FIELDS.findIndex(f => f.key === key) + 1;
    for (let r = 2; r <= 501; r++) {
      ws.getCell(r, col).dataValidation = {
        type: 'list', allowBlank: true, formulae: [`"${items.join(',')}"`],
        showErrorMessage: true, errorTitle: 'Valor inválido', error: `Escolha: ${items.join(', ')}`,
      };
    }
  };
  list('gender', ['Feminino', 'Masculino', 'Outro']);
  list('goal', ['Emagrecimento', 'Hipertrofia', 'Manutenção', 'Saúde', 'Performance Esportiva']);
  list('activity_level', ['Sedentário', 'Leve', 'Moderado', 'Intenso', 'Extremo']);

  const guide = wb.addWorksheet('Instruções');
  guide.columns = [{ width: 28 }, { width: 18 }, { width: 70 }];
  guide.addRow(['Como importar seus pacientes']).font = { bold: true, size: 14 };
  guide.addRow([]);
  [
    '1. Preencha a aba "Pacientes" a partir da linha 2 (a linha de exemplo pode ser apagada).',
    '2. Apenas o Nome é obrigatório. Deixe em branco o que não tiver.',
    `3. Máximo de ${MAX_IMPORT_ROWS} pacientes por arquivo.`,
    '4. Não mude os títulos das colunas. Pode apagar colunas que não for usar.',
    '5. Pacientes com email ou celular já cadastrado são ignorados (sem duplicar).',
    '6. Peso, altura, cintura, quadril e gordura viram a primeira avaliação do paciente e entram no gráfico de evolução.',
    '7. Alergias, restrições e anamnese vão direto para a ficha do paciente.',
    '8. Nenhum email é enviado ao paciente na importação.',
  ].forEach(t => guide.addRow([t]));
  guide.addRow([]);
  const h = guide.addRow(['Coluna', 'Obrigatória', 'Como preencher']);
  h.font = { bold: true };
  FIELDS.forEach(f => guide.addRow([f.label, f.required ? 'Sim' : 'Não', `${f.hint}. Ex.: ${f.example}`]));

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'modelo-importacao-pacientes.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
