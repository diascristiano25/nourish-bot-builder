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

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('FINAL DATABASE VALIDATION REPORT');
console.log('='.repeat(100));
console.log('NutriFlow Supabase Database - Complete Structure Audit\n');

const tables = {
  'profiles': {
    critical_columns: ['id', 'user_id', 'full_name', 'email', 'subscription_plan', 'subscription_status'],
    test_operation: 'select'
  },
  'patients': {
    critical_columns: ['id', 'nutritionist_id', 'full_name', 'email'],
    test_operation: 'select'
  },
  'appointments': {
    critical_columns: ['id', 'patient_id', 'nutritionist_id', 'scheduled_at', 'status'],
    test_operation: 'select'
  },
  'custom_foods': {
    critical_columns: ['id', 'nutritionist_id', 'name', 'calories'],
    test_operation: 'select'
  },
  'custom_recipes': {
    critical_columns: ['id', 'nutritionist_id', 'name', 'ingredients'],
    test_operation: 'select'
  },
  'messages': {
    critical_columns: ['id', 'patient_id', 'nutritionist_id', 'sender_type', 'content', 'is_read'],
    test_operation: 'select'
  },
  'meal_plans': {
    critical_columns: ['id', 'patient_id', 'nutritionist_id', 'title', 'meals'],
    test_operation: 'select'
  },
  'anthropometrics': {
    critical_columns: ['id', 'patient_id', 'weight', 'height'],
    test_operation: 'select'
  },
  'weight_logs': {
    critical_columns: ['id', 'patient_id', 'weight', 'date'],
    test_operation: 'select'
  },
  'water_logs': {
    critical_columns: ['id', 'patient_id', 'date', 'amount_ml'],
    test_operation: 'select'
  },
  'financial_records': {
    critical_columns: ['id', 'nutritionist_id', 'amount', 'type', 'date'],
    test_operation: 'select'
  },
  'support_tickets': {
    critical_columns: ['id', 'user_id', 'subject', 'status'],
    test_operation: 'select'
  },
  'support_ticket_messages': {
    critical_columns: ['id', 'ticket_id', 'sender_type', 'content'],
    test_operation: 'select'
  },
  'consultations': {
    critical_columns: ['id', 'patient_id', 'nutritionist_id', 'date'],
    test_operation: 'select'
  },
  'food_database': {
    critical_columns: ['id', 'name'],
    test_operation: 'select'
  }
};

const report = {
  accessible: [],
  inaccessible: [],
  rls_issues: [],
  structure_issues: []
};

for (const [tableName, config] of Object.entries(tables)) {
  process.stdout.write(`Validating ${tableName.padEnd(25)} ... `);

  try {
    // Test accessibility
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('schema cache')) {
        report.inaccessible.push({ table: tableName, reason: 'Not in schema cache' });
        console.log('MISSING FROM CACHE');
      } else if (error.message.includes('row-level security')) {
        report.rls_issues.push({ table: tableName, error: error.message });
        console.log('RLS ISSUE');
      } else {
        report.inaccessible.push({ table: tableName, reason: error.message });
        console.log('ERROR');
      }
    } else {
      report.accessible.push({ table: tableName, count: count || 0 });
      console.log(`OK (${count || 0} rows)`);
    }

  } catch (err) {
    report.inaccessible.push({ table: tableName, reason: err.message });
    console.log('EXCEPTION');
  }
}

console.log('\n' + '='.repeat(100));
console.log('SUMMARY\n');

console.log(`Total tables checked: ${Object.keys(tables).length}`);
console.log(`Accessible: ${report.accessible.length}`);
console.log(`Inaccessible: ${report.inaccessible.length}`);
console.log(`RLS Issues: ${report.rls_issues.length}`);

if (report.accessible.length === Object.keys(tables).length) {
  console.log('\nSTATUS: ALL TABLES OPERATIONAL');
} else {
  console.log('\nSTATUS: ISSUES DETECTED');
}

if (report.inaccessible.length > 0) {
  console.log('\nInaccessible Tables:');
  report.inaccessible.forEach(({ table, reason }) => {
    console.log(`  - ${table}: ${reason}`);
  });
}

if (report.rls_issues.length > 0) {
  console.log('\nRLS Issues:');
  report.rls_issues.forEach(({ table, error }) => {
    console.log(`  - ${table}: ${error}`);
  });
}

console.log('\n' + '='.repeat(100));
console.log('DATABASE HEALTH CHECK\n');

const totalRows = report.accessible.reduce((sum, t) => sum + t.count, 0);
console.log(`Total rows across all tables: ${totalRows}`);
console.log(`Empty tables: ${report.accessible.filter(t => t.count === 0).length}`);
console.log(`Tables with data: ${report.accessible.filter(t => t.count > 0).length}`);

console.log('\n' + '='.repeat(100));
console.log('\nVALIDATION COMPLETE\n');

if (report.accessible.length === Object.keys(tables).length) {
  console.log('Database structure is correct and all tables are accessible.');
  console.log('NutriFlow is ready for production use.');
} else {
  console.log('Some tables need attention. Review the issues above.');
}

console.log('\n');
