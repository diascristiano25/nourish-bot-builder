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
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('DEEP DATABASE STRUCTURE AUDIT\n');
console.log('='.repeat(100));

const CRITICAL_TABLES = [
  'profiles',
  'patients',
  'appointments',
  'custom_foods',
  'messages',
  'meal_plans',
  'anthropometrics',
  'weight_logs',
  'financial_records'
];

async function checkTableStructure(tableName) {
  console.log(`\nTable: ${tableName}`);
  console.log('-'.repeat(100));

  // Query information_schema for columns
  const { data: columns, error: colError } = await supabase.rpc('get_table_info', {
    p_table_name: tableName
  }).catch(() => ({ data: null, error: null }));

  // If RPC doesn't exist, query directly via SQL
  const { data: columnsData, error: columnsError } = await supabase
    .from('_columns')
    .select('*')
    .eq('table_name', tableName)
    .catch(() => ({ data: null, error: null }));

  // Check RLS policies
  const { data: policies, error: policyError } = await supabase
    .from('_policies')
    .select('*')
    .eq('tablename', tableName)
    .catch(() => ({ data: null, error: null }));

  console.log(`  Status: Exists and accessible`);

  // Try a sample query to understand the actual structure
  const { data: sampleData, error: sampleError } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (sampleData && sampleData.length > 0) {
    const cols = Object.keys(sampleData[0]);
    console.log(`  Columns (${cols.length}): ${cols.join(', ')}`);
  } else {
    console.log(`  No sample data to infer columns (table is empty)`);
  }

  // Check RLS is enabled
  const { data: rlsCheck } = await supabase.rpc('check_rls_enabled', {
    p_table_name: tableName
  }).catch(() => ({ data: null }));

  if (rlsCheck !== null) {
    console.log(`  RLS Enabled: ${rlsCheck ? 'YES' : 'NO'}`);
  }

  return {
    table: tableName,
    accessible: !sampleError,
    columns: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [],
    hasData: sampleData && sampleData.length > 0
  };
}

const results = [];

for (const table of CRITICAL_TABLES) {
  try {
    const result = await checkTableStructure(table);
    results.push(result);
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
    results.push({
      table,
      accessible: false,
      error: err.message
    });
  }
}

console.log('\n');
console.log('='.repeat(100));
console.log('STRUCTURE VALIDATION\n');

// Define expected columns for critical tables
const EXPECTED_STRUCTURES = {
  profiles: ['id', 'user_id', 'full_name', 'email', 'subscription_plan', 'subscription_status', 'created_at', 'updated_at'],
  patients: ['id', 'nutritionist_id', 'full_name', 'email', 'phone', 'birth_date', 'gender', 'goal', 'created_at', 'updated_at'],
  appointments: ['id', 'patient_id', 'nutritionist_id', 'scheduled_at', 'duration_minutes', 'status', 'type', 'created_at', 'updated_at'],
  custom_foods: ['id', 'nutritionist_id', 'name', 'category', 'calories', 'protein', 'carbs', 'fat', 'created_at', 'updated_at'],
  messages: ['id', 'patient_id', 'nutritionist_id', 'sender_type', 'content', 'is_read', 'created_at'],
  meal_plans: ['id', 'patient_id', 'nutritionist_id', 'title', 'start_date', 'end_date', 'meals', 'created_at', 'updated_at'],
  anthropometrics: ['id', 'patient_id', 'weight', 'height', 'bmi', 'body_fat_percentage', 'measured_at', 'created_at'],
  weight_logs: ['id', 'patient_id', 'weight', 'date', 'notes', 'created_at'],
  financial_records: ['id', 'nutritionist_id', 'patient_id', 'amount', 'type', 'status', 'date', 'created_at']
};

for (const result of results) {
  if (result.accessible && result.columns.length > 0) {
    const expected = EXPECTED_STRUCTURES[result.table] || [];
    const missing = expected.filter(col => !result.columns.includes(col));
    const extra = result.columns.filter(col => !expected.includes(col) && !['created_at', 'updated_at', 'id'].includes(col));

    console.log(`\n${result.table}:`);
    console.log(`  Columns present: ${result.columns.length}`);
    if (missing.length > 0) {
      console.log(`  MISSING columns: ${missing.join(', ')}`);
    } else {
      console.log(`  All expected columns present`);
    }
    if (extra.length > 0 && expected.length > 0) {
      console.log(`  Extra columns: ${extra.join(', ')}`);
    }
  } else if (!result.accessible) {
    console.log(`\n${result.table}: NOT ACCESSIBLE - ${result.error || 'Unknown error'}`);
  } else {
    console.log(`\n${result.table}: No data to validate structure`);
  }
}

console.log('\n');
