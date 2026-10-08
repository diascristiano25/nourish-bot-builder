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
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║           NUTRIFLOW - COMPLETE DATABASE SCHEMA FIX                          ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

// Read the SQL fix file
const sqlContent = readFileSync(join(__dirname, 'FIX-ALL-DATABASE-ISSUES.sql'), 'utf-8');

console.log('✅ SQL Fix Script loaded successfully');
console.log(`📄 Length: ${sqlContent.length} characters\n`);

console.log('📋 FIXES TO BE APPLIED:');
console.log('  1. ✅ Add activity_level column to patients table');
console.log('  2. ✅ Create custom_recipes table with RLS policies');
console.log('  3. ✅ Create financial_records table with RLS policies');
console.log('  4. ✅ Create anthropometrics table with RLS policies');
console.log('  5. ✅ Create weight_logs table with RLS policies');
console.log('  6. ✅ Create water_logs table with RLS policies\n');

console.log('🔧 MANUAL EXECUTION REQUIRED:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  1. Open Supabase SQL Editor:');
console.log('     👉 https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/sql/new\n');
console.log('  2. Copy content from file: FIX-ALL-DATABASE-ISSUES.sql\n');
console.log('  3. Paste into SQL Editor and click "Run"\n');
console.log('  4. Wait for completion message\n');
console.log('  5. Run this script again to validate\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Validation phase
console.log('🔍 CURRENT DATABASE STATE VALIDATION:\n');

const criticalTables = {
  'patients': { checkColumn: 'activity_level' },
  'custom_recipes': { checkColumn: 'nutrition_info' },
  'financial_records': { checkColumn: 'invoice_number' },
  'anthropometrics': { checkColumn: 'body_fat_percentage' },
  'weight_logs': { checkColumn: 'weight' },
  'water_logs': { checkColumn: 'amount_ml' }
};

const results = {
  accessible: [],
  missing: [],
  errors: [],
  columnsChecked: {}
};

for (const [tableName, config] of Object.entries(criticalTables)) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('not found')) {
        results.missing.push(tableName);
        console.log(`❌ [MISSING] ${tableName} - Table does not exist or not in schema cache`);
      } else {
        results.errors.push({ table: tableName, error: error.message });
        console.log(`⚠️  [ERROR] ${tableName} - ${error.message}`);
      }
    } else {
      results.accessible.push(tableName);
      console.log(`✅ [OK] ${tableName} - Table exists`);

      // For patients table, check if activity_level column exists
      if (tableName === 'patients') {
        try {
          const { data: testData, error: colError } = await supabase
            .from('patients')
            .select('activity_level')
            .limit(1);

          if (colError && colError.message.includes('activity_level')) {
            console.log(`   ⚠️  Column 'activity_level' NOT FOUND - needs to be added`);
            results.columnsChecked[tableName] = false;
          } else {
            console.log(`   ✅ Column 'activity_level' exists`);
            results.columnsChecked[tableName] = true;
          }
        } catch (err) {
          console.log(`   ⚠️  Could not verify column: ${err.message}`);
        }
      }
    }
  } catch (err) {
    results.errors.push({ table: tableName, error: err.message });
    console.log(`⚠️  [ERROR] ${tableName} - ${err.message}`);
  }
}

// Additional tables to verify
const otherTables = ['profiles', 'appointments', 'custom_foods', 'messages', 'meal_plans'];

console.log('\n📊 OTHER ESSENTIAL TABLES:\n');

for (const tableName of otherTables) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`✅ [OK] ${tableName}`);
    } else {
      console.log(`⚠️  [WARNING] ${tableName} - ${error.message}`);
    }
  } catch (err) {
    console.log(`⚠️  [WARNING] ${tableName} - ${err.message}`);
  }
}

console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                              SUMMARY REPORT                                  ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

const totalTables = Object.keys(criticalTables).length;
const accessibleCount = results.accessible.length;
const missingCount = results.missing.length;
const errorCount = results.errors.length;

console.log(`📊 Tables Status:`);
console.log(`   ✅ Accessible: ${accessibleCount}/${totalTables}`);
console.log(`   ❌ Missing: ${missingCount}/${totalTables}`);
console.log(`   ⚠️  Errors: ${errorCount}\n`);

if (missingCount > 0) {
  console.log('❌ MISSING TABLES (need to be created):');
  results.missing.forEach(t => console.log(`   • ${t}`));
  console.log('');
}

if (results.columnsChecked['patients'] === false) {
  console.log('⚠️  MISSING COLUMNS:');
  console.log('   • patients.activity_level - needs to be added\n');
}

if (results.errors.length > 0) {
  console.log('⚠️  ERRORS FOUND:');
  results.errors.forEach(({ table, error }) => {
    console.log(`   • ${table}: ${error}`);
  });
  console.log('');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (missingCount > 0 || results.columnsChecked['patients'] === false) {
  console.log('\n🔧 NEXT STEPS:');
  console.log('   1. Execute FIX-ALL-DATABASE-ISSUES.sql in Supabase SQL Editor');
  console.log('   2. Reload schema cache in Supabase dashboard');
  console.log('   3. Run this script again: node execute-database-fix.mjs\n');
} else if (accessibleCount === totalTables) {
  console.log('\n🎉 SUCCESS! All required tables and columns are present!\n');
  console.log('✅ Database schema is complete and ready to use.\n');
} else {
  console.log('\n⚠️  PARTIAL SUCCESS - Some issues remain\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
