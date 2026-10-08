#!/usr/bin/env tsx
/**
 * Script to apply the missing tables migration directly to Supabase
 * Task 3: Apply schema migration
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('📦 Applying migration: add_missing_tables.sql');
  console.log('');

  // Read the migration SQL file
  const migrationPath = join(process.cwd(), '..', 'supabase', 'migrations', '20261008083701_add_missing_tables.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  // Split into statements (rough split by semicolon, good enough for this migration)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Skip comments
    if (statement.startsWith('--')) continue;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Statement ${i + 1} executed`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Statement ${i + 1} error:`, err.message);
      errorCount++;
    }
  }

  console.log('');
  console.log('📊 Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);

  if (errorCount === 0) {
    console.log('');
    console.log('🎉 Migration applied successfully!');
    console.log('');
    console.log('Next step: Run npx supabase gen types to regenerate types.ts');
  } else {
    console.log('');
    console.log('⚠️  Some statements failed. Check errors above.');
    process.exit(1);
  }
}

applyMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
