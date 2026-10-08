#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║     NUTRIFLOW - STATUS FINAL DO BANCO DE DADOS SUPABASE          ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

// Critical tables that must exist
const criticalTables = [
  'profiles',
  'patients',
  'appointments',
  'custom_foods',
  'custom_recipes',
  'messages',
  'meal_plans',
  'anthropometrics',
  'weight_logs',
  'water_logs',
  'financial_records'
];

const results = {
  allTables: { ok: [], missing: [], errors: [] },
  criticalIssues: []
};

console.log('📊 VERIFICANDO TABELAS ESSENCIAIS:\n');

for (const tableName of criticalTables) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('not found')) {
        results.allTables.missing.push(tableName);
        results.criticalIssues.push(`Tabela ${tableName} NÃO EXISTE`);
        console.log(`❌ ${tableName.padEnd(20)} - TABELA NÃO EXISTE`);
      } else {
        results.allTables.errors.push({ table: tableName, error: error.message });
        console.log(`⚠️  ${tableName.padEnd(20)} - ERRO: ${error.message}`);
      }
    } else {
      results.allTables.ok.push(tableName);
      console.log(`✅ ${tableName.padEnd(20)} - OK`);
    }
  } catch (err) {
    results.allTables.errors.push({ table: tableName, error: err.message });
    console.log(`⚠️  ${tableName.padEnd(20)} - ERRO: ${err.message}`);
  }
}

// Check for activity_level column in patients table
console.log('\n🔍 VERIFICANDO COLUNA ACTIVITY_LEVEL NA TABELA PATIENTS:\n');

try {
  const { data, error } = await supabase
    .from('patients')
    .select('activity_level')
    .limit(1);

  if (error) {
    if (error.message.includes('activity_level') || error.message.includes('column')) {
      results.criticalIssues.push('Coluna activity_level FALTANDO na tabela patients');
      console.log('❌ COLUNA activity_level NÃO EXISTE');
      console.log('   ⚠️  Esta coluna é OBRIGATÓRIA para o funcionamento do cadastro de pacientes\n');
    } else {
      console.log(`⚠️  Erro ao verificar: ${error.message}\n`);
    }
  } else {
    console.log('✅ COLUNA activity_level EXISTE e está acessível\n');
  }
} catch (err) {
  console.log(`⚠️  Erro ao verificar coluna: ${err.message}\n`);
}

// Test basic data access
console.log('🔐 TESTANDO ACESSO AOS DADOS:\n');

try {
  const { count: profilesCount, error: profilesError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (!profilesError) {
    console.log(`✅ Profiles: ${profilesCount || 0} registros acessíveis`);
  }
} catch (err) {
  console.log(`⚠️  Profiles: ${err.message}`);
}

try {
  const { count: patientsCount, error: patientsError } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  if (!patientsError) {
    console.log(`✅ Patients: ${patientsCount || 0} registros acessíveis`);
  }
} catch (err) {
  console.log(`⚠️  Patients: ${err.message}`);
}

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║                      RESUMO DO DIAGNÓSTICO                       ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

console.log(`📊 Status das Tabelas:`);
console.log(`   ✅ Funcionando: ${results.allTables.ok.length}/${criticalTables.length}`);
console.log(`   ❌ Faltando: ${results.allTables.missing.length}`);
console.log(`   ⚠️  Erros: ${results.allTables.errors.length}\n`);

if (results.criticalIssues.length > 0) {
  console.log('🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS:\n');
  results.criticalIssues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  console.log('');
}

if (results.allTables.missing.length > 0) {
  console.log('❌ TABELAS FALTANTES:\n');
  results.allTables.missing.forEach(t => console.log(`   • ${t}`));
  console.log('\n   👉 Execute: FIX-ALL-DATABASE-ISSUES.sql\n');
}

console.log('═══════════════════════════════════════════════════════════════════\n');

// Final recommendation
if (results.criticalIssues.length === 0 &&
    results.allTables.missing.length === 0 &&
    results.allTables.ok.length === criticalTables.length) {
  console.log('🎉 BANCO DE DADOS 100% OPERACIONAL!\n');
  console.log('✅ Todas as tabelas estão presentes e acessíveis');
  console.log('✅ Todas as colunas necessárias existem');
  console.log('✅ Sistema pronto para uso\n');
} else if (results.criticalIssues.includes('Coluna activity_level FALTANDO na tabela patients')) {
  console.log('🔧 AÇÃO NECESSÁRIA:\n');
  console.log('   1. Abra o Supabase SQL Editor:');
  console.log('      https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/sql/new\n');
  console.log('   2. Execute o arquivo: ADD-ACTIVITY-LEVEL-COLUMN.sql\n');
  console.log('   3. Valide novamente: node FINAL-DATABASE-STATUS.mjs\n');
} else {
  console.log('⚠️  MÚLTIPLOS PROBLEMAS DETECTADOS:\n');
  console.log('   1. Execute o arquivo completo: FIX-ALL-DATABASE-ISSUES.sql');
  console.log('   2. Recarregue o schema cache do Supabase');
  console.log('   3. Valide novamente: node FINAL-DATABASE-STATUS.mjs\n');
}

console.log('═══════════════════════════════════════════════════════════════════\n');

// Return exit code
process.exit(results.criticalIssues.length > 0 ? 1 : 0);
