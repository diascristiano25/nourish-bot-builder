import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Credenciais do Supabase nao encontradas no .env.local');
  process.exit(1);
}

const res = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});

if (!res.ok) {
  console.error('Falha ao buscar schema:', res.status);
  console.error((await res.text()).slice(0, 500));
  process.exit(1);
}

const spec = await res.json();
const defs = spec.definitions || spec.components?.schemas || {};
const tables = Object.keys(defs).sort();

console.log(`\n=== TABELAS NO BANCO (${tables.length}) ===\n`);
for (const t of tables) {
  const props = Object.keys(defs[t].properties || {});
  console.log(`${t} (${props.length}): ${props.join(', ')}`);
}

// O que o frontend espera
const REQUIRED = {
  patients: [
    'id', 'nutritionist_id', 'full_name', 'email', 'phone', 'birth_date',
    'gender', 'goal', 'activity_level', 'allergies', 'dietary_restrictions',
    'medical_conditions', 'critical_tags', 'user_id', 'created_at', 'updated_at',
  ],
  profiles: [
    'id', 'user_id', 'full_name', 'crn', 'phone', 'logo_url', 'primary_color',
    'secondary_color', 'email_signature', 'has_seen_onboarding', 'is_active',
    'is_admin', 'account_status', 'trial_ends_at', 'created_at', 'updated_at',
  ],
  custom_recipes: ['id', 'nutritionist_id', 'name', 'notes', 'estimated_macros', 'ingredients'],
  custom_foods: ['id', 'nutritionist_id', 'name', 'unit_type', 'kcal', 'protein', 'carb', 'fat'],
  appointments: ['id', 'patient_id', 'nutritionist_id', 'date_time', 'status', 'notes'],
  financial_records: ['id', 'nutritionist_id', 'record_type', 'amount', 'description', 'record_date', 'status'],
  meal_plans: ['id', 'patient_id', 'nutritionist_id', 'title', 'plan_data', 'is_active'],
  messages: ['id', 'patient_id', 'nutritionist_id', 'sender_type', 'message', 'is_read', 'sent_at'],
  anthropometrics: ['id', 'patient_id', 'weight_kg', 'height_cm', 'body_fat_percentage', 'measured_at', 'notes'],
  weight_logs: ['id', 'patient_id', 'weight', 'recorded_at'],
};

console.log('\n=== PROBLEMAS ENCONTRADOS ===\n');
let problems = 0;

for (const [table, cols] of Object.entries(REQUIRED)) {
  if (!defs[table]) {
    console.log(`TABELA AUSENTE: ${table}`);
    problems++;
    continue;
  }
  const existing = Object.keys(defs[table].properties || {});
  const missing = cols.filter(c => !existing.includes(c));
  if (missing.length) {
    console.log(`COLUNAS AUSENTES em ${table}: ${missing.join(', ')}`);
    problems++;
  }
}

if (problems === 0) {
  console.log('Nenhum problema de schema detectado.');
} else {
  console.log(`\nTotal de problemas: ${problems}`);
}
