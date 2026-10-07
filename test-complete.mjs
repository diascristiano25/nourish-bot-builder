#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwenbxqmfpyspxpibgwp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZW5ieHFtZnB5c3B4cGliZ3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjA0MjgsImV4cCI6MjEwNjUzNjQyOH0.W6LxzVqjiE9edLvNryO2QOudjxqQOHroCIu31e2UDf4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 TESTE COMPLETO E AUTOMÁTICO DO NUTRIFLOW\n');
console.log('='.repeat(60));

async function testAllTables() {
  console.log('\n📊 TESTANDO TODAS AS TABELAS...\n');

  const tables = [
    'profiles',
    'patients',
    'appointments',
    'custom_foods',
    'messages',
    'meal_plans',
    'consultations'
  ];

  const results = {
    working: [],
    missing: [],
    errors: []
  };

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.message.includes('does not exist') ||
            error.message.includes('relation') ||
            error.code === '42P01') {
          console.log(`❌ ${table.padEnd(20)} - TABELA NÃO EXISTE`);
          results.missing.push(table);
        } else {
          console.log(`⚠️  ${table.padEnd(20)} - ERRO: ${error.message.substring(0, 50)}`);
          results.errors.push({ table, error: error.message });
        }
      } else {
        console.log(`✅ ${table.padEnd(20)} - ${count || 0} registros`);
        results.working.push(table);
      }
    } catch (err) {
      console.log(`💥 ${table.padEnd(20)} - EXCEÇÃO: ${err.message.substring(0, 50)}`);
      results.errors.push({ table, error: err.message });
    }
  }

  return results;
}

async function testAuth() {
  console.log('\n🔐 TESTANDO AUTENTICAÇÃO...\n');

  // Testar se conseguimos fazer login com um usuário teste
  const testEmail = 'teste@nutriflow.com.br';
  const testPassword = 'Teste@123456';

  try {
    // Tentar login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      console.log(`❌ Login falhou: ${error.message}`);
      return false;
    } else {
      console.log(`✅ Login funcionando!`);
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);

      // Verificar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profileError) {
        console.log(`⚠️  Perfil não encontrado para o usuário`);
      } else {
        console.log(`✅ Perfil encontrado: ${profile.full_name || 'sem nome'}`);
      }

      // Fazer logout
      await supabase.auth.signOut();
      return true;
    }
  } catch (err) {
    console.log(`💥 Erro no teste de autenticação: ${err.message}`);
    return false;
  }
}

async function generateReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 RELATÓRIO FINAL\n');

  console.log(`✅ Tabelas funcionando: ${results.working.length}`);
  if (results.working.length > 0) {
    results.working.forEach(t => console.log(`   - ${t}`));
  }

  console.log(`\n❌ Tabelas faltando: ${results.missing.length}`);
  if (results.missing.length > 0) {
    results.missing.forEach(t => console.log(`   - ${t}`));
  }

  console.log(`\n⚠️  Erros encontrados: ${results.errors.length}`);
  if (results.errors.length > 0) {
    results.errors.forEach(e => console.log(`   - ${e.table}: ${e.error.substring(0, 60)}`));
  }

  console.log('\n' + '='.repeat(60));

  if (results.missing.length > 0) {
    console.log('\n🔧 AÇÃO NECESSÁRIA:\n');
    console.log('As seguintes tabelas precisam ser criadas no Supabase:');
    results.missing.forEach(t => console.log(`   - ${t}`));
    console.log('\nExecute o arquivo SQL apropriado para criar essas tabelas.');
  } else if (results.errors.length === 0) {
    console.log('\n🎉 TUDO FUNCIONANDO PERFEITAMENTE!\n');
  }
}

async function main() {
  try {
    const results = await testAllTables();
    await testAuth();
    await generateReport(results);
  } catch (error) {
    console.error('\n💥 ERRO FATAL:', error.message);
    process.exit(1);
  }
}

main();
