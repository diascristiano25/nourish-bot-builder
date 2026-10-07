import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateTables() {
  console.log('🔍 Verificando tabelas faltantes...\n');

  // Ler o SQL
  const sql = readFileSync('./FIX-MISSING-TABLES.sql', 'utf-8');

  console.log('📝 Executando SQL para criar tabelas faltantes...');

  // Dividir em statements individuais para executar um por um
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.includes('CREATE TABLE') ||
        statement.includes('CREATE INDEX') ||
        statement.includes('ALTER TABLE') ||
        statement.includes('CREATE POLICY') ||
        statement.includes('CREATE TRIGGER')) {

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        if (error && !error.message.includes('already exists')) {
          console.log('⚠️  Erro (ignorado se tabela já existe):', error.message.substring(0, 100));
        }
      } catch (err) {
        // Ignorar erros de "já existe"
        if (!err.message?.includes('already exists')) {
          console.log('⚠️  Erro:', err.message?.substring(0, 100));
        }
      }
    }
  }

  console.log('\n✅ Processo concluído!');
  console.log('\n📊 Verificando tabelas criadas...');

  // Verificar cada tabela
  const tables = ['appointments', 'custom_foods', 'messages', 'patients', 'profiles'];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${count || 0} registros`);
    }
  }
}

checkAndCreateTables().catch(console.error);
