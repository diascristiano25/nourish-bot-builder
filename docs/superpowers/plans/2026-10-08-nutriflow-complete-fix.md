# NutriFlow SaaS Complete Audit and Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit and fix all database schema inconsistencies, cache issues, and application errors to achieve a fully functional NutriFlow SaaS with zero manual SQL intervention required.

**Architecture:** Systematic approach in 4 phases: (1) Code audit to map all database dependencies, (2) Automated database schema correction via migrations, (3) Type regeneration and code fixes, (4) Comprehensive functional testing of all features.

**Tech Stack:** React 18, TypeScript 5.8, Supabase (PostgreSQL + PostgREST), Vite 5.4, TanStack Query, Gemini 2.5 Flash AI

**Spec:** This plan implements the audit and correction requirements from the brainstorming session. No separate spec file exists as this is a corrective maintenance task.

## Global Constraints

- NEVER delete existing data from production tables
- Maintain all existing migrations (add corrections, don't modify history)
- All database changes must go through migration files
- Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for safety
- Always include `NOTIFY pgrst, 'reload schema';` after schema changes
- Regenerate TypeScript types after any database change
- Test each page in the browser after code changes
- Commit after each completed task

## Review Focus

1. **Schema cache staleness** - PostgREST must reflect all table/column changes immediately after migration; test by querying the table via Supabase client after running migration
2. **Type mismatch between code and database** - TypeScript types must match actual database columns; verify by comparing `types.ts` with `information_schema.columns` query results
3. **Missing RLS policies** - Every table must have appropriate Row Level Security policies; verify authenticated users can access their own data
4. **Foreign key integrity** - All referenced tables/columns must exist; test by attempting to insert related records
5. **Nullable column handling** - Code must handle NULL values gracefully; test by creating records with optional fields omitted

---

## File Structure

### Database Layer
- **Modify:** `supabase/migrations/20260408000000_fix_schema_inconsistencies.sql` (new migration)
- **Regenerate:** `src/integrations/supabase/types.ts` (after migration)

### Audit Scripts
- **Create:** `scripts/audit-database-schema.ts` (scan code for table/column usage)
- **Create:** `scripts/verify-schema-sync.ts` (compare code vs database)

### Application Code (if needed)
- **Modify:** Pages with database queries (only if column names changed)
- **Modify:** Components with database queries (only if column names changed)

### Documentation
- **Create:** `docs/database-audit-report.md` (findings from audit)
- **Create:** `docs/schema-fix-summary.md` (what was corrected)

---

## Task 1: Database Schema Audit

**Files:**
- Create: `scripts/audit-database-schema.ts`
- Create: `docs/database-audit-report.md`

**Interfaces:**
- Consumes: None (reads codebase and types.ts)
- Produces: 
  - `DatabaseAuditReport` type with `{ tables: string[], columnsUsed: Map<string, string[]>, issuesFound: SchemaIssue[] }`
  - `docs/database-audit-report.md` with human-readable findings

- [ ] **Step 1: Create audit script that scans all TypeScript files**

Create `scripts/audit-database-schema.ts` that:
- Uses `glob` to find all `.tsx` and `.ts` files in `src/`
- Parses each file to extract Supabase queries (`.from()`, `.select()`, `.insert()`, `.update()`)
- Maps table names to columns referenced in code
- Compares against `src/integrations/supabase/types.ts` to find mismatches

- [ ] **Step 2: Run audit script**

```bash
npx tsx scripts/audit-database-schema.ts > docs/database-audit-report.md
```

Expected: Report showing all tables/columns used, highlighting any mismatches

- [ ] **Step 3: Review audit report manually**

Read `docs/database-audit-report.md` and note:
- Tables used in code but not in types.ts
- Columns queried in code but not in types.ts
- Type mismatches (e.g., string vs number)

- [ ] **Step 4: Create prioritized fix list**

In `docs/database-audit-report.md`, add section "Critical Issues" with:
- `meal_plans.total_calories` column missing (blocks PatientDetail page)
- Any other schema cache mismatches preventing page loads
- Missing RLS policies causing 400 errors

- [ ] **Step 5: Commit audit artifacts**

```bash
git add scripts/audit-database-schema.ts docs/database-audit-report.md
git commit -m "feat: add database schema audit tooling and initial report"
```

---

## Task 2: Create Comprehensive Schema Fix Migration

**Files:**
- Create: `supabase/migrations/20260408000000_fix_schema_inconsistencies.sql`

**Interfaces:**
- Consumes: `docs/database-audit-report.md` (list of issues to fix)
- Produces: SQL migration that:
  - Adds missing columns with `IF NOT EXISTS`
  - Creates missing tables with `IF NOT EXISTS`
  - Updates RLS policies
  - Forces schema cache reload

- [ ] **Step 1: Create migration file header**

```sql
-- ============================================
-- MIGRATION: Fix Schema Inconsistencies
-- Date: 2026-10-08
-- Purpose: Add missing columns, tables, and RLS policies identified in audit
-- ============================================
```

- [ ] **Step 2: Add meal_plans.total_calories column fix**

```sql
-- Fix: meal_plans.total_calories missing
ALTER TABLE public.meal_plans
ADD COLUMN IF NOT EXISTS total_calories INTEGER;

COMMENT ON COLUMN public.meal_plans.total_calories IS 'Total daily calories for this meal plan';
```

- [ ] **Step 3: Add anthropometrics table verification**

```sql
-- Verify: anthropometrics table exists with all columns
CREATE TABLE IF NOT EXISTS public.anthropometrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    hip_cm DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,1),
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure RLS is enabled
ALTER TABLE public.anthropometrics ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 4: Add missing RLS policies**

```sql
-- RLS: Nutritionists can view their patients' anthropometrics
CREATE POLICY IF NOT EXISTS "nutritionists_view_patient_anthropometrics"
ON public.anthropometrics FOR SELECT
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p
    INNER JOIN public.profiles pr ON p.nutritionist_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

-- Similar policies for INSERT, UPDATE, DELETE...
```

- [ ] **Step 5: Add schema cache reload command**

```sql
-- CRITICAL: Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verification query
SELECT 'Migration completed successfully' as status,
       NOW() as executed_at;
```

- [ ] **Step 6: Test migration locally (dry run)**

```bash
# Read migration and check for syntax errors
cat supabase/migrations/20260408000000_fix_schema_inconsistencies.sql
```

Expected: No SQL syntax errors, all IF NOT EXISTS clauses present

- [ ] **Step 7: Commit migration**

```bash
git add supabase/migrations/20260408000000_fix_schema_inconsistencies.sql
git commit -m "fix: add comprehensive schema correction migration

- Add meal_plans.total_calories column
- Verify anthropometrics table structure
- Add missing RLS policies
- Force schema cache reload"
```

---

## Task 3: Execute Migration and Regenerate Types

**Files:**
- Modify: `supabase/migrations/20260408000000_fix_schema_inconsistencies.sql` (executed)
- Regenerate: `src/integrations/supabase/types.ts`

**Interfaces:**
- Consumes: Migration file from Task 2
- Produces: Updated `types.ts` matching corrected database schema

- [ ] **Step 1: Apply migration to Supabase**

**MANUAL STEP - USER EXECUTES:**
Go to Supabase SQL Editor and run contents of:
`supabase/migrations/20260408000000_fix_schema_inconsistencies.sql`

- [ ] **Step 2: Wait for schema cache reload**

```bash
sleep 15
```

Expected: PostgREST has reloaded schema (15 seconds is safe buffer)

- [ ] **Step 3: Regenerate TypeScript types**

```bash
npx supabase gen types typescript --project-id rwenbxqmfpvysxpplbqop > src/integrations/supabase/types.ts
```

Expected: New types.ts with total_calories and all corrected columns

- [ ] **Step 4: Verify types.ts has total_calories**

```bash
grep -n "total_calories" src/integrations/supabase/types.ts
```

Expected: Should show total_calories in meal_plans Row, Insert, and Update types

- [ ] **Step 5: Check for TypeScript errors**

```bash
npm run type-check || tsc --noEmit
```

Expected: Zero TypeScript errors (if errors exist, they're in application code, fix in next task)

- [ ] **Step 6: Commit regenerated types**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: regenerate Supabase types after schema fix"
```

---

## Task 4: Verification Script and Schema Sync Test

**Files:**
- Create: `scripts/verify-schema-sync.ts`
- Create: `docs/schema-fix-summary.md`

**Interfaces:**
- Consumes: `src/integrations/supabase/types.ts` (regenerated types)
- Produces: Verification report confirming code matches database

- [ ] **Step 1: Create verification script**

Create `scripts/verify-schema-sync.ts` that:
- Connects to Supabase
- Queries `information_schema.columns` for each table in types.ts
- Compares database columns with TypeScript type definitions
- Reports any remaining mismatches

- [ ] **Step 2: Run verification script**

```bash
npx tsx scripts/verify-schema-sync.ts > docs/schema-fix-summary.md
```

Expected: Report showing "All tables synchronized" or listing remaining issues

- [ ] **Step 3: Test database access in Node**

Create quick test script:
```typescript
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await client.from('meal_plans').select('total_calories').limit(1);
  console.log('Query result:', { data, error });
}

test();
```

Expected: No error about column not existing

- [ ] **Step 4: Document fix summary**

In `docs/schema-fix-summary.md`, document:
- What columns were added
- What RLS policies were created
- Verification test results
- Any remaining manual steps

- [ ] **Step 5: Commit verification artifacts**

```bash
git add scripts/verify-schema-sync.ts docs/schema-fix-summary.md
git commit -m "test: add schema synchronization verification"
```

---

## Task 5: Browser Testing - Dashboard and Patient Pages

**Files:**
- None (testing phase)

**Interfaces:**
- Consumes: Fixed database schema, regenerated types
- Produces: List of any remaining frontend bugs

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: Server starts on port 8088 (or next available)

- [ ] **Step 2: Test Dashboard page**

Navigate to `http://localhost:8088/dashboard`
Check browser console (F12) for:
- No 400 errors on /appointments, /patients, /profiles
- Dashboard loads with patient count and metrics
- No "table not found" or "column not found" errors

- [ ] **Step 3: Test Patients list page**

Navigate to `http://localhost:8088/pacientes`
Verify:
- Patient list loads
- Search works
- No console errors

- [ ] **Step 4: Test Patient Detail page**

Click on a patient card
Check:
- Patient detail page loads
- Anthropometrics section displays (no meal_plans.total_calories error)
- Meal plans section loads
- No 400 errors in console

- [ ] **Step 5: Test New Patient creation**

Click "Novo Paciente" button
Fill form and submit
Verify:
- Patient is created successfully
- Redirect to patient detail works
- Initial anthropometric data is saved

- [ ] **Step 6: Document any remaining errors**

Create `docs/remaining-issues.md` if any errors found
For each error:
- Page/URL where it occurs
- Console error message
- Stack trace
- Suspected cause

- [ ] **Step 7: Take screenshots of working pages**

Save screenshots to `docs/screenshots/`:
- `dashboard-working.png`
- `patient-detail-working.png`
- `patient-list-working.png`

---

## Task 6: Portal do Paciente Testing

**Files:**
- None (testing phase)

**Interfaces:**
- Consumes: Working patient authentication system
- Produces: Verified patient portal functionality

- [ ] **Step 1: Test patient mobile app URL**

Navigate to `http://localhost:8088/meu-app`
Verify:
- Patient login page loads
- No console errors

- [ ] **Step 2: Test patient authentication**

If test patient exists, log in
Check:
- Login succeeds
- Dashboard loads with meal plan
- Water tracker visible
- Progress charts load

- [ ] **Step 3: Test patient portal features**

Navigate through tabs:
- Plano (meal plan view)
- Registro (food logging)
- Evolução (progress charts)
- Perfil (profile settings)

Verify each tab loads without errors

- [ ] **Step 4: Test patient-nutritionist relationship**

Verify:
- Patient can only see their own data
- RLS policies prevent access to other patients' data

- [ ] **Step 5: Document patient portal status**

Add to `docs/schema-fix-summary.md`:
- Patient portal test results
- Any RLS issues found
- Authentication flow status

---

## Task 7: Additional Feature Testing

**Files:**
- None (testing phase)

**Interfaces:**
- Consumes: All previously fixed features
- Produces: Comprehensive test report

- [ ] **Step 1: Test Meal Plan Generation**

Navigate to patient detail → "Gerar Cardápio"
Verify:
- AI generation works (Gemini API call)
- Meal plan saves to database
- total_calories column populated correctly

- [ ] **Step 2: Test Consulta (Consultation) page**

Navigate to `/consulta/:patientId`
Verify:
- Page loads without errors
- Can select patient
- Meal plan editor works
- Custom recipes load

- [ ] **Step 3: Test Agenda (Appointments)**

Navigate to `/agenda`
Verify:
- Calendar loads
- Can create new appointment
- Appointments link to patients correctly

- [ ] **Step 4: Test Biblioteca (Library)**

Navigate to `/biblioteca`
Verify:
- Custom foods load
- Custom recipes load
- Can create new custom food/recipe

- [ ] **Step 5: Test Financeiro (Financial)**

Navigate to `/financeiro`
Verify:
- Financial records load
- Can add income/expense
- Charts display correctly

- [ ] **Step 6: Create final test report**

Create `docs/final-test-report.md` with:
- All pages tested (checklist)
- All features verified working
- Performance notes (any slow pages)
- Recommendations for future improvements

---

## Task 8: Cleanup and Documentation

**Files:**
- Create: `docs/maintenance-guide.md`
- Update: `README.md`

**Interfaces:**
- Consumes: All completed fixes and tests
- Produces: Comprehensive documentation for future maintenance

- [ ] **Step 1: Create maintenance guide**

Document in `docs/maintenance-guide.md`:
- How to add new migrations safely
- How to regenerate types after schema changes
- How to run audit scripts
- How to test schema synchronization

- [ ] **Step 2: Update README with database setup**

Add section to `README.md`:
```markdown
## Database Schema

The database schema is managed through Supabase migrations in `supabase/migrations/`.

### Running Migrations
1. Open Supabase SQL Editor
2. Copy contents of new migration file
3. Execute in SQL Editor
4. Wait 15 seconds for cache reload
5. Run `npm run generate:types` to update TypeScript types

### Verifying Schema
Run `npx tsx scripts/verify-schema-sync.ts` to check code matches database.
```

- [ ] **Step 3: Document known limitations**

Create `docs/known-limitations.md`:
- Manual SQL execution still required (no auto-migration from code)
- Schema cache requires 10-15 second wait after changes
- Type regeneration is manual step

- [ ] **Step 4: Create troubleshooting guide**

Add to `docs/maintenance-guide.md`:
```markdown
## Troubleshooting

**Error: "Could not find table X in schema cache"**
1. Check migration was executed in Supabase
2. Wait 15 seconds
3. Hard refresh browser (Ctrl+Shift+R)
4. Regenerate types if still failing

**Error: "Column Y does not exist"**
1. Run verify-schema-sync script
2. Check types.ts has the column
3. If not, regenerate types
4. If types has it but DB doesn't, create migration
```

- [ ] **Step 5: Archive temporary SQL fix files**

```bash
mkdir -p docs/archive/manual-fixes
mv fix-*.sql docs/archive/manual-fixes/
git add docs/archive/manual-fixes/
```

- [ ] **Step 6: Final commit**

```bash
git add docs/ README.md
git commit -m "docs: add comprehensive maintenance and troubleshooting guides

- Create maintenance guide for future schema changes
- Update README with database setup instructions
- Document known limitations
- Add troubleshooting section
- Archive manual SQL fix files"
```

---

## Task 9: Performance Optimization Check

**Files:**
- Create: `docs/performance-audit.md`

**Interfaces:**
- Consumes: Fully working application
- Produces: Performance recommendations

- [ ] **Step 1: Check for N+1 query problems**

Review code for patterns like:
```typescript
patients.forEach(async (patient) => {
  const { data } = await supabase.from('anthropometrics').select('*').eq('patient_id', patient.id);
});
```

Document any found in `docs/performance-audit.md`

- [ ] **Step 2: Check for missing database indexes**

Query Supabase for indexes:
```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Verify indexes exist on:
- Foreign keys (patient_id, nutritionist_id)
- Frequently queried columns (created_at, is_active)

- [ ] **Step 3: Test page load times**

Use browser DevTools Network tab to measure:
- Dashboard initial load
- Patient detail page load
- Meal plan generation time

Document if any page takes >2 seconds

- [ ] **Step 4: Check for redundant queries**

Use React DevTools Profiler to find:
- Components re-fetching same data
- Missing React Query caching
- Unnecessary re-renders

- [ ] **Step 5: Create performance improvement plan**

If issues found, create separate plan file:
`docs/superpowers/plans/2026-10-08-performance-improvements.md`

Otherwise, document "No performance issues found" in `docs/performance-audit.md`

- [ ] **Step 6: Commit performance audit**

```bash
git add docs/performance-audit.md
git commit -m "docs: add performance audit results"
```

---

## Task 10: Final Validation and Handoff

**Files:**
- Create: `docs/completion-report.md`

**Interfaces:**
- Consumes: All completed tasks
- Produces: Final delivery report

- [ ] **Step 1: Run all verification scripts**

```bash
npx tsx scripts/audit-database-schema.ts
npx tsx scripts/verify-schema-sync.ts
npm run type-check
npm run build
```

Expected: All pass with zero errors

- [ ] **Step 2: Create completion checklist**

In `docs/completion-report.md`:
- [ ] All database schema issues resolved
- [ ] Types.ts synchronized with database
- [ ] Zero console errors on any page
- [ ] Patient creation works
- [ ] Meal plan generation works
- [ ] Patient portal functional
- [ ] RLS policies tested
- [ ] Documentation complete

- [ ] **Step 3: Record test coverage**

Document in `docs/completion-report.md`:
```markdown
## Pages Tested
- [x] Dashboard
- [x] Patients List
- [x] Patient Detail
- [x] New Patient
- [x] Edit Patient
- [x] Meal Plan Generation
- [x] Consultation
- [x] Agenda
- [x] Biblioteca
- [x] Financeiro
- [x] Patient Mobile App
- [x] Patient Portal
```

- [ ] **Step 4: Create video walkthrough (optional)**

Record screen showing:
- Login flow
- Creating a patient
- Generating a meal plan
- Viewing patient portal
- No errors in console

Save as `docs/demo/working-app-walkthrough.mp4`

- [ ] **Step 5: Push all changes**

```bash
git push origin main
```

- [ ] **Step 6: Create GitHub release (if applicable)**

Tag as `v1.0.0-fixed` with release notes:
- Fixed schema cache issues
- Added missing database columns
- Verified all features working
- Complete documentation

- [ ] **Step 7: Final commit**

```bash
git add docs/completion-report.md
git commit -m "docs: add completion report for schema fix project

All database schema issues resolved.
All application features tested and working.
Zero manual SQL intervention required going forward.
"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-08-nutriflow-complete-fix.md`. Please review the plan.

Which execution approach would you prefer?

- **Subagent-driven** - A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native** - I implement every task myself in this session, the way this harness runs work, then one fresh reviewer on the most capable model checks the whole branch. Cheapest and fastest; no independent review until the end.

**For this plan I recommend Native**, because the tasks are sequential (each depends on previous outputs like audit reports and migration files), there are 10 tasks which would be expensive to spawn fresh contexts for, and schema fixes are low-risk changes (additive only, with IF NOT EXISTS guards). The main risk is missing edge cases in testing, which the comprehensive test tasks (5-7) address.

Does the plan capture what you want, and which approach should we use?
