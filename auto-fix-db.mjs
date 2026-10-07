#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://nwenbxqmfpyspxpibgwp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZW5ieHFtZnB5c3B4cGliZ3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjA0MjgsImV4cCI6MjEwNjUzNjQyOH0.W6LxzVqjiE9edLvNryO2QOudjxqQOHroCIu31e2UDf4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Iniciando correção automática do banco de dados...\n');

// Verificar quais tabelas existem
async function checkTables() {
  console.log('📊 Verificando tabelas existentes...');

  const tables = ['profiles', 'patients', 'appointments', 'custom_foods', 'messages'];
  const missing = [];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id', { count: 'exact', head: true });
    if (error) {
      if (error.message.includes('does not exist') || error.message.includes('relation')) {
        console.log(`❌ ${table} - NÃO EXISTE`);
        missing.push(table);
      } else {
        console.log(`⚠️  ${table} - ${error.message}`);
      }
    } else {
      console.log(`✅ ${table} - existe`);
    }
  }

  return missing;
}

// Criar tabela patients se não existir
async function ensurePatientsTable() {
  console.log('\n📝 Verificando tabela patients...');

  const { error } = await supabase.from('patients').select('id', { head: true });

  if (error && error.message.includes('does not exist')) {
    console.log('❌ Tabela patients não existe. Você precisa executar o SQL manualmente no Supabase.');
    console.log('📄 Arquivo: FIX-MISSING-TABLES.sql');
    return false;
  }

  return true;
}

async function main() {
  try {
    const missing = await checkTables();

    if (missing.length === 0) {
      console.log('\n✅ Todas as tabelas necessárias já existem!');
      return;
    }

    console.log(`\n⚠️  ${missing.length} tabela(s) faltando: ${missing.join(', ')}`);
    console.log('\n📋 AÇÃO NECESSÁRIA:');
    console.log('1. Abra https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp');
    console.log('2. Vá em SQL Editor');
    console.log('3. Cole o conteúdo de FIX-MISSING-TABLES.sql');
    console.log('4. Execute o script');

    // Verificar se podemos acessar as tabelas existentes
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(1);

    if (profileData && profileData.length > 0) {
      console.log('\n✅ Acesso ao banco confirmado');
      console.log(`📊 Perfil encontrado: ${profileData[0].full_name || 'sem nome'}`);
    }

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

main();
