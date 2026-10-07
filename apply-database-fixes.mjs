#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('APPLYING DATABASE FIXES TO SUPABASE\n');
console.log('='.repeat(100));

// Read the SQL fix file
const sqlContent = readFileSync(join(__dirname, 'COMPLETE-DATABASE-FIX.sql'), 'utf-8');

console.log('\nSQL Fix Script loaded successfully');
console.log('Length:', sqlContent.length, 'characters');
console.log('\nNOTE: Execute this SQL in Supabase SQL Editor:');
console.log('  1. Go to: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/sql/new');
console.log('  2. Paste the content from COMPLETE-DATABASE-FIX.sql');
console.log('  3. Run the query');
console.log('\n' + '='.repeat(100));

// Now validate the current state
console.log('\nCURRENT DATABASE STATE:\n');

const tables = [
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
  'financial_records',
  'support_tickets',
  'support_ticket_messages',
  'consultations'
];

const results = {
  accessible: [],
  notInCache: [],
  errors: []
};

for (const tableName of tables) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('schema cache')) {
        results.notInCache.push(tableName);
        console.log(`[MISSING] ${tableName} - Not in schema cache`);
      } else {
        results.errors.push({ table: tableName, error: error.message });
        console.log(`[ERROR] ${tableName} - ${error.message}`);
      }
    } else {
      results.accessible.push(tableName);
      console.log(`[OK] ${tableName}`);
    }
  } catch (err) {
    results.errors.push({ table: tableName, error: err.message });
    console.log(`[ERROR] ${tableName} - ${err.message}`);
  }
}

console.log('\n' + '='.repeat(100));
console.log('SUMMARY:\n');
console.log(`Accessible tables: ${results.accessible.length}/${tables.length}`);
console.log(`Missing from cache: ${results.notInCache.length}`);
console.log(`Errors: ${results.errors.length}`);

if (results.notInCache.length > 0) {
  console.log('\nTables to be created:');
  results.notInCache.forEach(t => console.log(`  - ${t}`));
}

if (results.errors.length > 0) {
  console.log('\nErrors found:');
  results.errors.forEach(({ table, error }) => {
    console.log(`  - ${table}: ${error}`);
  });
}

console.log('\n' + '='.repeat(100));
console.log('\nNEXT STEPS:');
console.log('1. Execute COMPLETE-DATABASE-FIX.sql in Supabase SQL Editor');
console.log('2. After execution, reload the Supabase schema cache');
console.log('3. Run this script again to verify all tables are accessible');
console.log('\n');
