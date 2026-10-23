# NutriFlow Launch Critical Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 12 critical bugs (P0) and 3 high-priority bugs (P1) blocking NutriFlow production launch for paid traffic campaigns.

**Architecture:** Schema alignment (database.types.ts regeneration), query corrections across 5+ files, auth flow guards, RLS policy realignment, CRUD completion for financeiro module.

**Tech Stack:** React, TypeScript, Supabase, Vite

**Spec:** `.superpowers/sdd/2026-10-23-nutriflow-launch-readiness/CONSOLIDATED-AUDIT.md`

## Global Constraints

- All database queries must match actual Supabase schema (not stale types)
- Enum values must be EN (not PT) to match DB constraints
- RLS policies must align with actual column names used in code
- All currency formatting must use 2 decimal places consistently
- WhatsApp number must be `5513996205253` everywhere (already done)
- Type safety must be preserved (no `any` types)

## Review Focus

1. **meal_plans queries return empty results** - After regenerating types, verify all 5 files query `patient_id` (not `client_id`) and `is_active` (not `status`)
2. **Auth infinite loop on role redirect** - Verify guard prevents redirect when already on target route
3. **NewPatient constraint violations** - Verify enum values match DB: `sedentary` not `"Sedentário"`, `weight_loss` not `"Emagrecimento"`
4. **AdminFinanceiro shows zero KPIs** - Verify queries use `transaction_type`, `created_at`, `user_id` (not phantom fields)
5. **Financeiro INSERT fails with RLS error** - Verify policy allows `user_id = auth.uid()` or code passes `nutritionist_id`

---

## Task 1: Regenerate database.types.ts from Live Schema

**Files:**
- Modify: `src/lib/database.types.ts` (full regeneration)

**Interfaces:**
- Produces: `Database.public.Tables.meal_plans` with `patient_id: string` and `is_active: boolean`
- Produces: `Database.public.Tables.financial_records` with `transaction_type`, `created_at`, `user_id`

- [ ] **Step 1: Verify Supabase CLI is linked to project**

```bash
supabase status --linked
```
Expected: Shows project ID and connection status

- [ ] **Step 2: Regenerate TypeScript types from live schema**

```bash
supabase gen types typescript --linked > src/lib/database.types.ts
```

- [ ] **Step 3: Verify critical type changes**

Read `src/lib/database.types.ts` and confirm:
- `meal_plans.patient_id` exists (not `client_id`)
- `meal_plans.is_active: boolean` exists (not `status: string`)
- `financial_records.transaction_type` exists (not `record_type`)
- `financial_records.user_id` exists (not `nutritionist_id`)

- [ ] **Step 4: Run TypeScript compiler to catch breaking changes**

```bash
npm run type-check
```
Expected: Compilation errors in 5+ files (meal_plans queries) - these will be fixed in Task 2

- [ ] **Step 5: Commit**

```bash
git add src/lib/database.types.ts
git commit -m "fix(types): regenerate database types from live Supabase schema

- meal_plans now has patient_id (not client_id) and is_active (not status)
- financial_records now has transaction_type/created_at/user_id
- Unblocks meal plan queries in 5 files"
```

---

## Task 2: Fix meal_plans Queries (5 Files)

**Files:**
- Modify: `src/pages/PatientDetail.tsx:252`
- Modify: `src/pages/PatientMobileApp.tsx:131-132`
- Modify: `src/pages/GroceryList.tsx:93`
- Modify: `src/pages/GenerateMealPlan.tsx:217`
- Modify: `src/pages/MealPlanView.tsx` (verify only)

**Interfaces:**
- Consumes: `Database.public.Tables.meal_plans` from Task 1

- [ ] **Step 1: Fix PatientDetail.tsx line 252**

Change:
```typescript
.eq('client_id', id)
```
To:
```typescript
.eq('patient_id', id)
```

- [ ] **Step 2: Fix PatientMobileApp.tsx lines 131-132**

Change:
```typescript
.eq('client_id', patientData.id)
.eq('status', 'active')
```
To:
```typescript
.eq('patient_id', patientData.id)
.eq('is_active', true)
```

- [ ] **Step 3: Fix GroceryList.tsx line 93**

Change:
```typescript
.select('meals, title, client_id')
```
To:
```typescript
.select('meals, title, patient_id')
```

- [ ] **Step 4: Fix GenerateMealPlan.tsx line 217**

Change:
```typescript
user_id: patient.id,
```
To:
```typescript
patient_id: patient.id,
```

- [ ] **Step 5: Verify MealPlanView.tsx uses patient_id**

Read lines 140, 335 and confirm already using `patient_id` (no change needed)

- [ ] **Step 6: Run TypeScript compiler**

```bash
npm run type-check
```
Expected: PASS (all meal_plans type errors resolved)

- [ ] **Step 7: Test meal plan query in browser**

1. Start dev server: `npm run dev`
2. Navigate to `/pacientes/:id` (any patient)
3. Check "Cardápios" tab shows meal plans
4. Navigate to `/meu-app` as patient
5. Check "Plano" tab shows active meal plan

Expected: Both views show meal plans (not empty)

- [ ] **Step 8: Commit**

```bash
git add src/pages/PatientDetail.tsx src/pages/PatientMobileApp.tsx src/pages/GroceryList.tsx src/pages/GenerateMealPlan.tsx
git commit -m "fix(meal-plans): use patient_id and is_active from correct schema

- PatientDetail: client_id → patient_id
- PatientMobileApp: client_id → patient_id, status → is_active
- GroceryList: client_id → patient_id in select
- GenerateMealPlan: user_id → patient_id in insert

Fixes cardápios not appearing for patients"
```

---

## Task 3: Fix Auth.tsx Recursion Guard

**Files:**
- Modify: `src/pages/Auth.tsx:68-72`

**Interfaces:**
- Consumes: `useLocation()` from `react-router-dom`

- [ ] **Step 1: Add location import**

Add to imports:
```typescript
import { useLocation } from "react-router-dom";
```

- [ ] **Step 2: Get location in component**

Add after existing hooks:
```typescript
const location = useLocation();
```

- [ ] **Step 3: Add pathname guard to useEffect**

Change:
```typescript
useEffect(() => {
  if (user) {
    redirectByRole(navigate);
  }
}, [user, navigate]);
```
To:
```typescript
useEffect(() => {
  if (user && location.pathname === '/auth') {
    redirectByRole(navigate);
  }
}, [user, navigate, location.pathname]);
```

- [ ] **Step 4: Test auth redirect**

1. Start dev: `npm run dev`
2. Navigate to `/auth`
3. Sign in with test account
4. Observe redirect happens once (no loop)
5. Check browser console for no infinite re-renders

Expected: Single redirect, no console warnings

- [ ] **Step 5: Commit**

```bash
git add src/pages/Auth.tsx
git commit -m "fix(auth): prevent infinite redirect loop in Auth.tsx

Add location.pathname === '/auth' guard to redirectByRole useEffect.
Prevents re-triggering redirect when already on target route.

Fixes potential browser freeze on auth flow"
```

---

## Task 4: Fix NewPatient.tsx Select Values (PT→EN)

**Files:**
- Modify: `src/pages/NewPatient.tsx:101,114-115`

**Interfaces:**
- Produces: Form values matching DB enums: `activity_level`, `patient_goal`, `gender`

- [ ] **Step 1: Fix gender select (line 101)**

Change:
```typescript
<SelectItem value="Feminino">Feminino</SelectItem>
<SelectItem value="Masculino">Masculino</SelectItem>
<SelectItem value="Outro">Outro</SelectItem>
```
To:
```typescript
<SelectItem value="female">Feminino</SelectItem>
<SelectItem value="male">Masculino</SelectItem>
<SelectItem value="other">Outro</SelectItem>
```

- [ ] **Step 2: Fix patient_goal select (line 114)**

Change:
```typescript
<SelectItem value="Emagrecimento">Emagrecimento</SelectItem>
<SelectItem value="Hipertrofia">Hipertrofia</SelectItem>
<SelectItem value="Manutenção">Manutenção</SelectItem>
<SelectItem value="Saúde">Saúde</SelectItem>
```
To:
```typescript
<SelectItem value="weight_loss">Emagrecimento</SelectItem>
<SelectItem value="hypertrophy">Hipertrofia</SelectItem>
<SelectItem value="maintenance">Manutenção</SelectItem>
<SelectItem value="health">Saúde Geral</SelectItem>
<SelectItem value="performance">Performance Esportiva</SelectItem>
```

- [ ] **Step 3: Fix activity_level select (line 115)**

Change:
```typescript
<SelectItem value="Sedentário">Sedentário</SelectItem>
<SelectItem value="Leve">Leve</SelectItem>
<SelectItem value="Moderado">Moderado</SelectItem>
<SelectItem value="Intenso">Intenso</SelectItem>
```
To:
```typescript
<SelectItem value="sedentary">Sedentário</SelectItem>
<SelectItem value="light">Leve (1-2x/semana)</SelectItem>
<SelectItem value="moderate">Moderado (3-4x/semana)</SelectItem>
<SelectItem value="active">Ativo (5-6x/semana)</SelectItem>
<SelectItem value="very_active">Muito Ativo (atleta)</SelectItem>
```

- [ ] **Step 4: Test patient creation**

1. Navigate to `/novo-paciente`
2. Fill form with all fields
3. Select each dropdown option
4. Submit form

Expected: Patient created successfully (no constraint violation error)

- [ ] **Step 5: Verify patient detail shows correct labels**

1. Navigate to created patient's detail page
2. Check gender shows "Feminino" (not "female")
3. Check goal shows "Emagrecimento" (not "weight_loss")

Expected: Labels display in PT, values stored in EN

- [ ] **Step 6: Commit**

```bash
git add src/pages/NewPatient.tsx
git commit -m "fix(patients): use EN enum values in NewPatient selects

- gender: Feminino → female, Masculino → male, Outro → other
- patient_goal: PT labels → EN values (weight_loss, hypertrophy, etc)
- activity_level: PT labels → EN values (sedentary, light, moderate, etc)

Fixes constraint violations on patient creation.
Matches EditPatient.tsx enum values."
```

---

## Task 5: Fix AdminFinanceiro and NutritionistDetail Schema Fields

**Files:**
- Modify: `src/pages/admin/AdminFinanceiro.tsx:16-21,52,58-59,70-75`
- Modify: `src/pages/admin/NutritionistDetail.tsx:43,92`

**Interfaces:**
- Consumes: `Database.public.Tables.financial_records` from Task 1

- [ ] **Step 1: Fix AdminFinanceiro interface (lines 16-21)**

Change:
```typescript
interface FinancialRecord {
  id: string;
  record_type: string;
  amount: number;
  record_date: string;
  description: string | null;
  nutritionist_id: string | null;
}
```
To:
```typescript
interface FinancialRecord {
  id: string;
  transaction_type: string;
  amount: number;
  created_at: string;
  description: string | null;
  user_id: string | null;
}
```

- [ ] **Step 2: Fix AdminFinanceiro query (line 52)**

Change:
```typescript
.select('id, record_type, amount, record_date, description, nutritionist_id')
```
To:
```typescript
.select('id, transaction_type, amount, created_at, description, user_id')
```

- [ ] **Step 3: Fix AdminFinanceiro income filter (line 58)**

Change:
```typescript
const incomeRecords = records.filter(r => r.record_type === 'income');
```
To:
```typescript
const incomeRecords = records.filter(r => 
  (r.transaction_type === 'payment' || r.transaction_type === 'subscription') 
  && r.status !== 'cancelled'
);
```

- [ ] **Step 4: Fix AdminFinanceiro expense filter (line 59)**

Change:
```typescript
const expenseRecords = records.filter(r => r.record_type === 'expense');
```
To:
```typescript
const expenseRecords = records.filter(r => 
  r.transaction_type === 'refund' && r.status !== 'cancelled'
);
```

- [ ] **Step 5: Fix NutritionistDetail interface (line 43)**

Change interface to match AdminFinanceiro (same as Step 1)

- [ ] **Step 6: Fix NutritionistDetail query (line 92)**

Change:
```typescript
.from('financial_records')
.select('id, record_type, amount, record_date, description')
.eq('nutritionist_id', profileId)
```
To:
```typescript
.from('financial_records')
.select('id, transaction_type, amount, created_at, description')
.eq('user_id', profile.user_id)
```

- [ ] **Step 7: Test admin dashboard**

1. Navigate to `/admin/dashboard` as admin user
2. Check "Receita do Mês" shows non-zero value
3. Check "Total Despesas" shows value
4. Navigate to `/admin/nutris/:id`
5. Check "Financeiro" tab shows transactions

Expected: KPIs populated, transactions list shows data

- [ ] **Step 8: Commit**

```bash
git add src/pages/admin/AdminFinanceiro.tsx src/pages/admin/NutritionistDetail.tsx
git commit -m "fix(admin): use correct financial_records schema fields

- Replace record_type → transaction_type
- Replace record_date → created_at  
- Replace nutritionist_id → user_id
- Update income/expense filters for transaction_type enum

Fixes admin dashboard showing zero KPIs and empty transactions"
```

---

## Task 6: Fix SupportChatView is_staff_reply Type

**Files:**
- Modify: `src/pages/admin/SupportChatView.tsx:19,114,229,230,236`

**Interfaces:**
- Consumes: `support_ticket_messages.is_staff_reply: boolean` from schema

- [ ] **Step 1: Fix Message interface (line 19)**

Change:
```typescript
is_staff_reply: string;
```
To:
```typescript
is_staff_reply: boolean;
```

- [ ] **Step 2: Fix message insert (line 114)**

Change:
```typescript
is_staff_reply: 'admin',
```
To:
```typescript
is_staff_reply: true,
```

- [ ] **Step 3: Fix message display condition (line 229)**

Change:
```typescript
msg.is_staff_reply === 'admin'
```
To:
```typescript
msg.is_staff_reply === true
```

- [ ] **Step 4: Fix avatar condition (line 230)**

Change:
```typescript
{msg.is_staff_reply === 'admin' ? (
```
To:
```typescript
{msg.is_staff_reply ? (
```

- [ ] **Step 5: Fix message alignment (line 236)**

Change:
```typescript
msg.is_staff_reply === 'admin' ? 'flex-end' : 'flex-start'
```
To:
```typescript
msg.is_staff_reply ? 'flex-end' : 'flex-start'
```

- [ ] **Step 6: Test support chat**

1. Navigate to `/admin/suporte` as admin
2. Open any ticket thread
3. Type and send a reply
4. Check message appears on right side (admin)
5. Check no console errors

Expected: Admin replies save and display correctly

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/SupportChatView.tsx
git commit -m "fix(admin): correct is_staff_reply type to boolean

Schema has is_staff_reply BOOLEAN, not string.
- Interface: string → boolean
- Insert: 'admin' → true
- Conditionals: === 'admin' → === true or truthy check

Fixes admin unable to reply to support tickets"
```

---

## Task 7: Fix Financeiro RLS Policy Mismatch

**Files:**
- Create: `supabase/migrations/20261024120000_fix_financial_records_rls.sql`
- Modify: `src/components/nutritionist/financial/NewTransactionDialog.tsx:82` (if needed)

**Interfaces:**
- Produces: RLS policies allowing `user_id = auth.uid()` for financial_records

- [ ] **Step 1: Create migration to replace RLS policies**

Create file with:
```sql
-- Drop old policies that check nutritionist_id
DROP POLICY IF EXISTS "Nutritionists can create their own financial records" ON public.financial_records;
DROP POLICY IF EXISTS "Nutritionists can view their own records" ON public.financial_records;
DROP POLICY IF EXISTS "Nutritionists can update their own records" ON public.financial_records;
DROP POLICY IF EXISTS "Nutritionists can delete their own records" ON public.financial_records;

-- Create new policies using user_id (matches code)
CREATE POLICY "fr_insert_own" ON public.financial_records
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "fr_select_own" ON public.financial_records
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "fr_update_own" ON public.financial_records
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "fr_delete_own" ON public.financial_records
FOR DELETE USING (user_id = auth.uid());

COMMENT ON POLICY "fr_insert_own" ON public.financial_records IS 
'Allow users to insert their own financial records via user_id';
```

- [ ] **Step 2: Verify NewTransactionDialog.tsx already uses user_id**

Read line 82 and confirm:
```typescript
const { error } = await supabase.from('financial_records').insert({
  user_id: authUser.id,  // ✓ Correct
  amount: amountCents,
  ...
});
```

No change needed (already correct after commit ba00827)

- [ ] **Step 3: Push migration to Supabase**

```bash
supabase db push --linked
```

Expected: Migration applied successfully

- [ ] **Step 4: Test transaction creation**

1. Navigate to `/financeiro`
2. Click "Nova Transação"
3. Fill form and submit

Expected: Transaction created successfully (no RLS error)

- [ ] **Step 5: Test transaction listing**

1. Check transactions list populates
2. Verify only own transactions appear

Expected: List shows user's transactions

- [ ] **Step 6: Commit migration**

```bash
git add supabase/migrations/20261024120000_fix_financial_records_rls.sql
git commit -m "fix(rls): align financial_records policies with user_id

Replace nutritionist_id-based policies with user_id-based.
Matches actual code in NewTransactionDialog which inserts user_id.

Fixes INSERT failures with 'new row violates RLS policy' error"
```

---

## Task 8: Create RPC for PatientAuth Email Lookup

**Files:**
- Create: `supabase/migrations/20261024120100_add_patient_email_auth_rpc.sql`
- Modify: `src/pages/PatientAuth.tsx:184-188`

**Interfaces:**
- Produces: `patients_select_by_email_for_auth(patient_email TEXT)` RPC

- [ ] **Step 1: Create migration with RPC function**

Create file with:
```sql
CREATE OR REPLACE FUNCTION public.patients_select_by_email_for_auth(patient_email TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  nutritionist_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.nutritionist_id
  FROM patients p
  WHERE p.email = patient_email;
END;
$$;

COMMENT ON FUNCTION public.patients_select_by_email_for_auth(TEXT) IS
'Allows email verification during patient first-access signup flow (bypasses RLS)';
```

- [ ] **Step 2: Push migration**

```bash
supabase db push --linked
```

- [ ] **Step 3: Replace direct query with RPC call in PatientAuth.tsx**

Change lines 184-188:
```typescript
const { data: patient, error: patientError } = await supabase
  .from('patients')
  .select('id, full_name, nutritionist_id')
  .eq('email', email)
  .maybeSingle();
```
To:
```typescript
const { data: patient, error: patientError } = await supabase
  .rpc('patients_select_by_email_for_auth', { patient_email: email })
  .maybeSingle();
```

- [ ] **Step 4: Test patient first-access flow**

1. Navigate to `/patient-auth`
2. Enter email of existing patient (not yet linked to auth)
3. Enter access code
4. Submit

Expected: Patient found, account linking proceeds (no RLS error)

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261024120100_add_patient_email_auth_rpc.sql src/pages/PatientAuth.tsx
git commit -m "fix(auth): add RPC to bypass RLS for patient email lookup

Create SECURITY DEFINER function patients_select_by_email_for_auth
to allow unauthenticated users to verify email during first-access flow.

Direct .from('patients').eq('email') blocked by RLS for anon users.

Fixes patient first-access signup failures"
```

---

## Task 9: Implement UPDATE/DELETE for Financeiro

**Files:**
- Create: `src/components/nutritionist/financial/EditTransactionDialog.tsx`
- Modify: `src/components/nutritionist/financial/TransactionList.tsx` (add edit/delete buttons)
- Modify: `src/pages/Financeiro.tsx` (add edit dialog state)

**Interfaces:**
- Consumes: `formatBRL()` from Task 10 (deferred if not yet ready)
- Produces: `EditTransactionDialog` component with props `{transaction, open, onClose, onUpdate}`

- [ ] **Step 1: Create EditTransactionDialog component**

File: `src/components/nutritionist/financial/EditTransactionDialog.tsx`

Structure similar to `NewTransactionDialog.tsx`:
- Dialog with form
- Fields: type, category, amount (pre-filled with transaction data)
- Amount input accepts comma/dot (Brazilian format)
- Submit calls `.update()` on `financial_records` table
- Validates amount > 0

- [ ] **Step 2: Add edit/delete buttons to TransactionList**

In `TransactionList.tsx`:
- Add Edit icon button to each transaction row
- Add Delete icon button with confirmation dialog
- Pass `onEdit` and `onDelete` handlers as props
- Delete calls `.delete()` on `financial_records`

- [ ] **Step 3: Wire edit dialog in Financeiro.tsx**

Add state:
```typescript
const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
```

Add handler:
```typescript
const handleUpdateTransaction = async (updatedData) => {
  // Refresh data after update
  fetchData();
};
```

Add to JSX:
```typescript
<EditTransactionDialog
  transaction={editingTransaction}
  open={!!editingTransaction}
  onClose={() => setEditingTransaction(null)}
  onUpdate={handleUpdateTransaction}
/>
```

- [ ] **Step 4: Test edit flow**

1. Navigate to `/financeiro`
2. Click edit button on a transaction
3. Modify amount and category
4. Save
5. Verify list refreshes with new values

Expected: Transaction updated successfully

- [ ] **Step 5: Test delete flow**

1. Click delete button on a transaction
2. Confirm deletion
3. Verify transaction removed from list

Expected: Transaction deleted successfully

- [ ] **Step 6: Commit**

```bash
git add src/components/nutritionist/financial/EditTransactionDialog.tsx src/components/nutritionist/financial/TransactionList.tsx src/pages/Financeiro.tsx
git commit -m "feat(financeiro): implement UPDATE and DELETE for transactions

- Create EditTransactionDialog component
- Add edit/delete buttons to TransactionList  
- Wire handlers in Financeiro page
- Support Brazilian decimal format in edit form

Completes CRUD operations for financial records"
```

---

## Task 10: Standardize BRL Formatting

**Files:**
- Create: `src/utils/format.ts`
- Modify: `src/pages/Financeiro.tsx:212,230,247`
- Modify: `src/components/nutritionist/financial/FinancialDashboard.tsx:45,51`
- Modify: `src/components/nutritionist/financial/TransactionList.tsx:165-168`
- Modify: `src/components/nutritionist/financial/RevenueChart.tsx:77`

**Interfaces:**
- Produces: `formatBRL(cents: number, compact?: boolean): string`

- [ ] **Step 1: Create format utility**

File: `src/utils/format.ts`
```typescript
/**
 * Format currency in Brazilian Real with consistent 2 decimal places
 * @param cents - Amount in cents (integer)
 * @param compact - Use "k" notation for values >= 1000
 */
export const formatBRL = (cents: number, compact = false): string => {
  const reais = cents / 100;
  
  if (compact && reais >= 1000) {
    return `R$ ${(reais / 1000).toFixed(1)}k`;
  }
  
  return reais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
```

- [ ] **Step 2: Replace Financeiro.tsx formatting (lines 212, 230, 247)**

Change:
```typescript
R$ {data.totalRevenue.toLocaleString('pt-BR')}
```
To:
```typescript
{formatBRL(data.totalRevenue * 100)}
```

Apply to all 3 KPI cards

- [ ] **Step 3: Replace FinancialDashboard.tsx (lines 45, 51)**

Change:
```typescript
value: `R$ ${(totalRevenue / 1000).toFixed(1)}k`
```
To:
```typescript
value: formatBRL(totalRevenue * 100, true)
```

- [ ] **Step 4: Verify TransactionList.tsx already correct (lines 165-168)**

Check if already using:
```typescript
R$ {transaction.amount.toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}
```

If yes, replace with:
```typescript
{formatBRL(transaction.amount)}
```

- [ ] **Step 5: Replace RevenueChart.tsx Y-axis formatter (line 77)**

Change:
```typescript
tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
```
To:
```typescript
tickFormatter={(value) => formatBRL(value * 100, true)}
```

- [ ] **Step 6: Test all financial displays**

1. Navigate to `/financeiro`
2. Check all KPI cards show "R$ X.XXX,XX" format
3. Check transaction list shows 2 decimals
4. Check revenue chart Y-axis labels

Expected: Consistent BRL formatting across all components

- [ ] **Step 7: Commit**

```bash
git add src/utils/format.ts src/pages/Financeiro.tsx src/components/nutritionist/financial/FinancialDashboard.tsx src/components/nutritionist/financial/TransactionList.tsx src/components/nutritionist/financial/RevenueChart.tsx
git commit -m "refactor(financeiro): standardize BRL currency formatting

- Create formatBRL utility with consistent 2 decimal places
- Replace 3 different formatting patterns with single utility
- Support compact notation (k) for values >= 1000
- Fix FinancialDashboard forcing 'k' for small values

Ensures all currency displays match Brazilian standard"
```

---

## Self-Review Checklist

**Spec Coverage:**
- ✓ Task 1: Regenerate types (P0 #1)
- ✓ Task 2: Fix meal_plans queries (P0 #1)
- ✓ Task 3: Fix auth recursion (P0 #2)
- ✓ Task 4: Fix NewPatient selects (P0 #3)
- ✓ Task 5: Fix AdminFinanceiro fields (P0 #4)
- ✓ Task 6: Fix SupportChatView type (P0 #5)
- ✓ Task 7: Fix Financeiro RLS (P0 #6)
- ✓ Task 8: Create PatientAuth RPC (P1 #7)
- ✓ Task 9: Implement UPDATE/DELETE (P1 #8)
- ✓ Task 10: Standardize BRL formatting (P1 #9)

**Not Covered (P2 - out of scope for launch):**
- Messages `read_at` field (P2 #10) - non-blocking
- E2E test routes (P2 #11) - not blocking prod

**Type Consistency:**
- Task 1 produces `meal_plans.patient_id`, Task 2 consumes it ✓
- Task 1 produces `financial_records.transaction_type`, Task 5 consumes it ✓
- Task 10 produces `formatBRL()`, Task 9 can consume it (deferred if not ready) ✓

**Step Granularity:**
- Each step is one checkable action (Read, Grep, Edit, Commit) ✓
- Test steps specify exact command and expected output ✓
- No "handle edge cases" or "add validation" without specifics ✓

**Parallelization Opportunities:**
- Task 3 (Auth.tsx) + Task 4 (NewPatient.tsx) are independent ✓
- Task 6 (SupportChatView) independent of Tasks 3-5 ✓
- Task 8 (RPC migration) independent of Tasks 3-6 ✓
- Task 9 depends on Task 10 (optional formatting), but can proceed without ✓
