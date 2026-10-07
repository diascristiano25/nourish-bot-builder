#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 NutriFlow Database Audit\n');
console.log('=' .repeat(80));

// Expected tables based on codebase analysis
const EXPECTED_TABLES = [
  'profiles',
  'patients',
  'appointments',
  'custom_foods',
  'custom_recipes',
  'messages',
  'meal_plans',
  'consultations',
  'anthropometrics',
  'weight_logs',
  'water_logs',
  'financial_records',
  'food_database',
  'support_tickets',
  'support_ticket_messages',
  'payment_events',
  'purchase_events',
  'leads_nutriflow'
];

const auditResults = {
  existing: [],
  missing: [],
  accessible: [],
  inaccessible: [],
  errors: []
};

// Check each table
for (const tableName of EXPECTED_TABLES) {
  console.log(`\n📋 Checking table: ${tableName}`);
  console.log('-'.repeat(80));

  try {
    // Try to query the table (with limit 0 to just check structure)
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log(`   ❌ Table does NOT exist`);
        auditResults.missing.push(tableName);
      } else if (error.code === 'PGRST116' || error.message.includes('row-level security')) {
        console.log(`   ⚠️  Table exists but has RLS issues: ${error.message}`);
        auditResults.existing.push(tableName);
        auditResults.errors.push({ table: tableName, error: error.message });
      } else {
        console.log(`   ⚠️  Error accessing table: ${error.message}`);
        auditResults.existing.push(tableName);
        auditResults.errors.push({ table: tableName, error: error.message });
      }
    } else {
      console.log(`   ✅ Table exists and is accessible (${count ?? 0} rows)`);
      auditResults.existing.push(tableName);
      auditResults.accessible.push(tableName);
    }

    // Try to get table structure via RPC if available
    try {
      const { data: columns } = await supabase.rpc('get_table_columns', { table_name: tableName });
      if (columns) {
        console.log(`   📊 Columns: ${columns.length}`);
      }
    } catch (e) {
      // RPC might not exist, that's OK
    }

  } catch (err) {
    console.log(`   ❌ Unexpected error: ${err.message}`);
    auditResults.errors.push({ table: tableName, error: err.message });
  }
}

// Summary
console.log('\n');
console.log('=' .repeat(80));
console.log('📊 AUDIT SUMMARY');
console.log('=' .repeat(80));
console.log(`\n✅ Existing tables: ${auditResults.existing.length}/${EXPECTED_TABLES.length}`);
console.log(`   ${auditResults.existing.join(', ')}`);

console.log(`\n❌ Missing tables: ${auditResults.missing.length}`);
if (auditResults.missing.length > 0) {
  console.log(`   ${auditResults.missing.join(', ')}`);
}

console.log(`\n✅ Accessible tables: ${auditResults.accessible.length}`);
console.log(`   ${auditResults.accessible.join(', ')}`);

console.log(`\n⚠️  Tables with errors: ${auditResults.errors.length}`);
if (auditResults.errors.length > 0) {
  auditResults.errors.forEach(({ table, error }) => {
    console.log(`   - ${table}: ${error}`);
  });
}

console.log('\n');
