# Email Automation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement automated email marketing system that sends welcome emails on signup, trial follow-ups on days 3/7/14/21/28, expiration alerts on day 33, and patient education emails on days 7/14.

**Architecture:** Create `email_logs` table for tracking, new `send-trial-followup-email` edge function with all templates, new `process-daily-trial-emails` cron edge function, and wire existing welcome email functions into frontend auth flows. All edge functions follow the existing Deno/Resend pattern with CORS headers and `Deno.env.get("RESEND_API_KEY")`.

**Tech Stack:** Supabase Edge Functions (Deno), Resend API, PostgreSQL, React/TypeScript frontend

**Spec:** `docs/superpowers/specs/2026-11-05-email-automation-design.md`

## Global Constraints

- RESEND_API_KEY must be read via `Deno.env.get("RESEND_API_KEY")`, never hardcoded
- All edge functions use `serve` from `https://deno.land/std@0.190.0/http/server.ts`
- All edge functions include standard CORS headers for OPTIONS preflight
- Email sender is always `"NutriFlow <noreply@nutriflow.inf.br>"`
- Frontend calls use `supabase.functions.invoke()` from `@/integrations/supabase/client`
- Trial duration is 33 days (configured in admin settings)
- Follow-up days for nutritionists: 3, 7, 14, 21, 28, 33
- Follow-up days for patients: 7, 14

## Review Focus

- User signs up but email invoke fails silently — welcome email call must be fire-and-forget (non-blocking) so signup UX is never degraded
- Cron runs twice in same day — idempotency via `email_logs` check prevents duplicate sends
- Patient has no `user_id` yet (hasn't done first access) — cron query must filter `WHERE user_id IS NOT NULL`
- `trial_start_date` is null for free-tier users — cron query must filter `WHERE trial_start_date IS NOT NULL`
- Edge function invoked with wrong payload shape — frontend must pass `{ email, name }` matching existing function interfaces, not `{ user_id }`

---

### Task 1: Create email_logs Migration

**Files:**
- Create: `supabase/migrations/20261105000000_create_email_logs.sql`

**Interfaces:**
- Produces: `email_logs` table consumed by Tasks 2 and 3

- [ ] **Step 1: Write migration SQL**

Create file `supabase/migrations/20261105000000_create_email_logs.sql` with:
- Table `email_logs` with columns: `id` UUID PK default `gen_random_uuid()`, `user_id` UUID references `auth.users(id)` ON DELETE CASCADE, `email_type` TEXT NOT NULL, `sent_at` TIMESTAMPTZ DEFAULT NOW(), `metadata` JSONB DEFAULT `'{}'::jsonb`
- Indexes: `idx_email_logs_user_type` on `(user_id, email_type)`, `idx_email_logs_sent_at` on `(sent_at)`
- Enable RLS with policy allowing service_role full access and authenticated users to select their own rows

- [ ] **Step 2: Verify migration syntax**

Run: `npx supabase db diff --use-migra --file supabase/migrations/20261105000000_create_email_logs.sql` or review SQL manually for correctness.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20261105000000_create_email_logs.sql
git commit -m "feat(email): add email_logs table for tracking automated emails"
```

---

### Task 2: Create send-trial-followup-email Edge Function

**Files:**
- Create: `supabase/functions/send-trial-followup-email/index.ts`

**Interfaces:**
- Consumes: `email_logs` table from Task 1
- Produces: HTTP endpoint accepting `{ user_id: string, email_type: string }` that sends email via Resend and logs to `email_logs`

- [ ] **Step 1: Create edge function scaffold**

Create `supabase/functions/send-trial-followup-email/index.ts` following the exact pattern from `send-welcome-email/index.ts`:
- Import `serve` from `https://deno.land/std@0.190.0/http/server.ts`
- Read `RESEND_API_KEY` via `Deno.env.get("RESEND_API_KEY")`
- Define standard `corsHeaders` object
- Handle OPTIONS preflight
- Create Supabase client using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from env

- [ ] **Step 2: Implement request validation and user lookup**

Parse request body as `{ user_id: string, email_type: string }`. Validate both fields present. Determine if user is nutritionist or patient by checking `email_type` prefix (`trial-*` = nutritionist, `patient-*` = patient). Query `profiles` or `patients` table to get `email`, `full_name`. Return 400 if user not found.

- [ ] **Step 3: Implement idempotency check**

Query `email_logs` for existing row with matching `user_id` and `email_type`. If found, return 200 with `{ success: true, already_sent: true }` without sending again.

- [ ] **Step 4: Implement HTML templates for all email types**

Create a `getTemplate(emailType: string, firstName: string): { subject: string, html: string }` function returning subject and HTML for each type:
- `trial-day-3`: Subject "Seu primeiro paciente no NutriFlow 🚀", content about registering first patient
- `trial-day-7`: Subject "Features essenciais para sua rotina 📋", content about meal plans and prescriptions
- `trial-day-14`: Subject "Retenção de pacientes: como o NutriFlow ajuda 📊", content about reports and tracking
- `trial-day-21`: Subject "Cases de sucesso e benefícios premium ⭐", content about success stories
- `trial-day-28`: Subject "⏰ Seu trial expira em 5 dias!", content about upgrade benefits
- `trial-expired`: Subject "Seu trial do NutriFlow expirou", content about continuing with paid plan
- `patient-day-7`: Subject "Dicas para aproveitar seu acompanhamento 🍎", content about meal logging
- `patient-day-14`: Subject "Explore tudo que o NutriFlow oferece 💪", content about app features

All templates use the same visual style as existing welcome emails (emerald gradient header, white card body, green CTA buttons, footer with copyright).

- [ ] **Step 5: Implement Resend send and log insert**

Call Resend API at `https://api.resend.com/emails` with from/to/subject/html. On success, insert row into `email_logs` with `user_id`, `email_type`, `metadata: { email_id: resendResponse.id }`. Return 200 with `{ success: true }`. On failure, log error and return 500.

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/send-trial-followup-email/index.ts
git commit -m "feat(email): add send-trial-followup-email edge function with all templates"
```

---

### Task 3: Create process-daily-trial-emails Cron Edge Function

**Files:**
- Create: `supabase/functions/process-daily-trial-emails/index.ts`

**Interfaces:**
- Consumes: `email_logs` table from Task 1, invokes `send-trial-followup-email` from Task 2
- Produces: HTTP endpoint (called by Supabase Cron) that processes all pending trial emails

- [ ] **Step 1: Create cron edge function scaffold**

Create `supabase/functions/process-daily-trial-emails/index.ts`:
- Same imports and CORS pattern as other functions
- Create Supabase client with service role key
- Validate cron secret header (`Authorization: Bearer <CRON_SECRET>`) for security

- [ ] **Step 2: Implement nutritionist trial processing**

Query profiles where `subscription_status = 'trial'` AND `trial_start_date IS NOT NULL` AND `trial_ended = false`. For each row, calculate `days_in_trial = floor(extract(epoch from now() - trial_start_date) / 86400)`. If days matches one of [3, 7, 14, 21, 28, 33], set `emailType` to `trial-day-${days}` or `trial-expired` for day 33. Check `email_logs` for existing send. If not sent, invoke `send-trial-followup-email` via `supabase.functions.invoke('send-trial-followup-email', { body: { user_id, email_type } })`.

- [ ] **Step 3: Implement patient education processing**

Query patients where `user_id IS NOT NULL`. For each row, calculate `days_registered = floor(extract(epoch from now() - created_at) / 86400)`. If days matches [7, 14], set `emailType` to `patient-day-${days}`. Check `email_logs` for existing send. If not sent, invoke `send-trial-followup-email`.

- [ ] **Step 4: Implement summary response**

Return 200 with `{ success: true, nutritionists_processed: number, patients_processed: number, emails_sent: number }`.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/process-daily-trial-emails/index.ts
git commit -m "feat(email): add daily cron job for trial follow-up emails"
```

---

### Task 4: Wire Welcome Email into Nutritionist Signup

**Files:**
- Modify: `src/hooks/useAuth.tsx:79-113` (the `signUp` function)

**Interfaces:**
- Consumes: existing `send-welcome-email` edge function (accepts `{ email: string, name: string }`)

- [ ] **Step 1: Add fire-and-forget welcome email call after successful signup**

In `useAuth.tsx`, inside the `signUp` function, after the block that sets session/user (line ~108), add a non-blocking call:

```typescript
// Fire-and-forget welcome email
if (data.user && !error) {
  supabase.functions.invoke('send-welcome-email', {
    body: { email, name: fullName },
  }).catch((err) => console.error('Welcome email failed:', err));
}
```

This must NOT be awaited — signup UX must not depend on email delivery.

- [ ] **Step 2: Verify no regression in signup flow**

Manually test that signup still works even if edge function is unreachable (the `.catch` ensures no thrown error).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAuth.tsx
git commit -m "feat(email): trigger welcome email on nutritionist signup"
```

---

### Task 5: Wire Welcome Email into Patient First Access

**Files:**
- Modify: `src/pages/PatientAuth.tsx:228-242` (after successful patient signUp)

**Interfaces:**
- Consumes: existing `send-patient-welcome-email` edge function (accepts `{ email: string, name: string, phone?: string, nutritionistName?: string }`)

- [ ] **Step 1: Add fire-and-forget patient welcome email call**

In `PatientAuth.tsx`, inside `handleFirstAccess`, after the block that updates `patients.user_id` (line ~232), add:

```typescript
// Fire-and-forget patient welcome email
if (signUpData.user) {
  supabase.functions.invoke('send-patient-welcome-email', {
    body: {
      email,
      name: patient.full_name,
    },
  }).catch((err) => console.error('Patient welcome email failed:', err));
}
```

This must NOT be awaited.

- [ ] **Step 2: Verify no regression in patient first access flow**

Ensure the redirect to `/meu-app` still happens immediately regardless of email result.

- [ ] **Step 3: Commit**

```bash
git add src/pages/PatientAuth.tsx
git commit -m "feat(email): trigger welcome email on patient first access"
```

---

### Task 6: Fix Hardcoded RESEND_API_KEY in send-nudge-email

**Files:**
- Modify: `supabase/functions/send-nudge-email/index.ts`

**Interfaces:**
- None (standalone fix)

- [ ] **Step 1: Replace hardcoded key with env var**

In `send-nudge-email/index.ts`, find the hardcoded `re_FjkR93Le_...` string and replace with `Deno.env.get("RESEND_API_KEY") || ""` to match the pattern used by all other email functions.

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/send-nudge-email/index.ts
git commit -m "fix(email): remove hardcoded RESEND_API_KEY from send-nudge-email"
```

---

### Task 7: Deploy Edge Functions and Configure Cron

**Files:**
- None (deployment commands only)

**Interfaces:**
- Consumes: all edge functions from Tasks 2, 3, 6

- [ ] **Step 1: Deploy new edge functions**

Run:
```bash
npx supabase functions deploy send-trial-followup-email
npx supabase functions deploy process-daily-trial-emails
npx supabase functions deploy send-nudge-email
```

- [ ] **Step 2: Configure cron job in Supabase Dashboard**

Document the cron configuration (to be done manually in Supabase Dashboard → Database → Extensions → pg_cron or via Supabase Dashboard → Edge Functions → Cron):
- Schedule: `0 8 * * *` (daily at 8 AM)
- Target: `process-daily-trial-emails` edge function
- Pass CRON_SECRET as authorization header

- [ ] **Step 3: Apply migration**

Run: `npx supabase db push` to apply the `email_logs` migration.

- [ ] **Step 4: Commit deployment notes**

```bash
git add docs/superpowers/plans/2026-11-05-email-automation.md
git commit -m "docs(email): add deployment instructions for email automation"
```