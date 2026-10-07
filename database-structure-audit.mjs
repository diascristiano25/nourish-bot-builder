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

console.log('COMPREHENSIVE DATABASE STRUCTURE AUDIT\n');
console.log('='.repeat(100));

// Expected structures based on codebase analysis
const EXPECTED_STRUCTURES = {
  profiles: {
    required: ['id', 'user_id', 'full_name', 'email', 'created_at', 'updated_at'],
    optional: ['subscription_plan', 'subscription_status', 'trial_ends_at', 'stripe_customer_id', 'crn', 'cpf', 'phone']
  },
  patients: {
    required: ['id', 'nutritionist_id', 'full_name', 'email', 'created_at', 'updated_at'],
    optional: ['phone', 'birth_date', 'gender', 'goal', 'notes', 'user_id', 'cpf', 'access_code']
  },
  appointments: {
    required: ['id', 'patient_id', 'nutritionist_id', 'scheduled_at', 'status', 'created_at', 'updated_at'],
    optional: ['date_time', 'duration_minutes', 'type', 'notes', 'reminder_sent']
  },
  custom_foods: {
    required: ['id', 'nutritionist_id', 'name', 'created_at', 'updated_at'],
    optional: ['category', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'serving_size', 'unit', 'is_active']
  },
  custom_recipes: {
    required: ['id', 'nutritionist_id', 'name', 'created_at', 'updated_at'],
    optional: ['description', 'ingredients', 'instructions', 'servings', 'prep_time', 'cook_time']
  },
  messages: {
    required: ['id', 'patient_id', 'nutritionist_id', 'sender_type', 'content', 'is_read', 'created_at'],
    optional: ['read_at', 'updated_at']
  },
  meal_plans: {
    required: ['id', 'patient_id', 'nutritionist_id', 'title', 'meals', 'created_at', 'updated_at'],
    optional: ['description', 'start_date', 'end_date', 'calories_target', 'protein_target', 'carbs_target', 'fat_target', 'status']
  },
  anthropometrics: {
    required: ['id', 'patient_id', 'created_at'],
    optional: ['weight', 'height', 'bmi', 'body_fat_percentage', 'muscle_mass', 'waist', 'hip', 'chest', 'measured_at']
  },
  weight_logs: {
    required: ['id', 'patient_id', 'weight', 'date', 'created_at'],
    optional: ['notes', 'updated_at']
  },
  water_logs: {
    required: ['id', 'patient_id', 'date', 'created_at'],
    optional: ['amount_ml', 'glasses', 'notes']
  },
  financial_records: {
    required: ['id', 'nutritionist_id', 'amount', 'type', 'date', 'created_at'],
    optional: ['patient_id', 'status', 'description', 'payment_method', 'updated_at']
  },
  food_database: {
    required: ['id', 'name'],
    optional: ['category', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'serving_size', 'unit', 'brand']
  },
  support_tickets: {
    required: ['id', 'user_id', 'subject', 'status', 'created_at', 'updated_at'],
    optional: ['priority', 'category', 'resolved_at']
  },
  support_ticket_messages: {
    required: ['id', 'ticket_id', 'sender_type', 'content', 'created_at'],
    optional: ['user_id', 'attachments']
  },
  consultations: {
    required: ['id', 'patient_id', 'nutritionist_id', 'created_at'],
    optional: ['date', 'notes', 'diagnosis', 'recommendations', 'updated_at']
  }
};

async function inspectTable(tableName) {
  console.log(`\n${tableName}`);
  console.log('-'.repeat(100));

  try {
    // Try to select all columns with a limit of 1
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`  ERROR: ${error.message}`);
      return { table: tableName, accessible: false, error: error.message };
    }

    let columns = [];
    if (data && data.length > 0) {
      columns = Object.keys(data[0]);
      console.log(`  Columns (${columns.length}): ${columns.join(', ')}`);
    } else {
      // Empty table - try to infer from metadata or use a test insert/select
      console.log('  Table is empty - attempting to detect columns...');

      // Use count with select * to see what columns are available
      const { error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        console.log('  Table accessible but empty (cannot detect exact columns)');
      }
    }

    // Validate structure if expected
    const expected = EXPECTED_STRUCTURES[tableName];
    if (expected) {
      const missing = expected.required.filter(col => !columns.includes(col));

      if (columns.length === 0) {
        console.log('  VALIDATION: Cannot validate (empty table)');
      } else if (missing.length > 0) {
        console.log(`  MISSING REQUIRED: ${missing.join(', ')}`);
      } else {
        console.log('  VALIDATION: All required columns present');
      }
    }

    return {
      table: tableName,
      accessible: true,
      columns,
      hasData: data && data.length > 0
    };

  } catch (err) {
    console.log(`  EXCEPTION: ${err.message}`);
    return { table: tableName, accessible: false, error: err.message };
  }
}

// Inspect all tables
const tables = Object.keys(EXPECTED_STRUCTURES);
const results = [];

for (const table of tables) {
  const result = await inspectTable(table);
  results.push(result);
}

// Summary
console.log('\n');
console.log('='.repeat(100));
console.log('VALIDATION SUMMARY\n');

const accessible = results.filter(r => r.accessible);
const inaccessible = results.filter(r => !r.accessible);
const withData = results.filter(r => r.hasData);
const empty = results.filter(r => r.accessible && !r.hasData);

console.log(`Accessible tables: ${accessible.length}/${results.length}`);
console.log(`Tables with data: ${withData.length}`);
console.log(`Empty tables: ${empty.length}`);
console.log(`Inaccessible tables: ${inaccessible.length}`);

if (inaccessible.length > 0) {
  console.log(`\nInaccessible: ${inaccessible.map(r => r.table).join(', ')}`);
}

console.log('\n');
