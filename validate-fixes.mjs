#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwenbxqmfpyspxpibgwp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZW5ieHFtZnB5c3B4cGliZ3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjA0MjgsImV4cCI6MjEwNjUzNjQyOH0.W6LxzVqjiE9edLvNryO2QOudjxqQOHroCIu31e2UDf4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 VALIDANDO CORREÇÕES DO BANCO DE DADOS\n');
console.log('=' .repeat(60));

async function validateFixes() {
  const errors = [];
  const successes = [];

  // 1. Testar tabela patients com activity_level
  console.log('\n1️⃣ Testando tabela patients...');
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, activity_level')
      .limit(1);

    if (error) {
      if (error.message.includes('activity_level')) {
        errors.push('❌ Coluna activity_level ainda não existe em patients');
      } else {
        errors.push(`❌ Erro em patients: ${error.message}`);
      }
    } else {
      successes.push('✅ Tabela patients com activity_level funcionando');
    }
  } catch (err) {
    errors.push(`❌ Exceção em patients: ${err.message}`);
  }

  // 2. Testar tabela custom_recipes
  console.log('2️⃣ Testando tabela custom_recipes...');
  try {
    const { data, error } = await supabase
      .from('custom_recipes')
      .select('id, name')
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        errors.push('❌ Tabela custom_recipes ainda não existe');
      } else {
        errors.push(`❌ Erro em custom_recipes: ${error.message}`);
      }
    } else {
      successes.push('✅ Tabela custom_recipes criada e funcionando');
    }
  } catch (err) {
    errors.push(`❌ Exceção em custom_recipes: ${err.message}`);
  }

  // 3. Testar outras tabelas críticas
  const tables = ['profiles', 'appointments', 'meal_plans', 'messages', 'custom_foods'];

  for (const table of tables) {
    console.log(`${tables.indexOf(table) + 3}️⃣ Testando tabela ${table}...`);
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        errors.push(`❌ Erro em ${table}: ${error.message}`);
      } else {
        successes.push(`✅ Tabela ${table} funcionando`);
      }
    } catch (err) {
      errors.push(`❌ Exceção em ${table}: ${err.message}`);
    }
  }

  // Resultado final
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESULTADO DA VALIDAÇÃO:\n');

  if (successes.length > 0) {
    console.log('✅ SUCESSOS:\n');
    successes.forEach(s => console.log(`   ${s}`));
  }

  if (errors.length > 0) {
    console.log('\n❌ ERROS ENCONTRADOS:\n');
    errors.forEach(e => console.log(`   ${e}`));
    console.log('\n⚠️  ATENÇÃO: Execute o script fix-schema-final.sql no Supabase SQL Editor');
  } else {
    console.log('\n🎉 TODAS AS CORREÇÕES APLICADAS COM SUCESSO!');
  }

  console.log('\n' + '='.repeat(60));

  return errors.length === 0;
}

validateFixes().then(success => {
  process.exit(success ? 0 : 1);
});
