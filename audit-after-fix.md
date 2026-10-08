📋 Starting database schema audit...
📁 Source directory: C:\Claudin\Nutriflow\src
📄 Types file: C:\Claudin\Nutriflow\src\integrations\supabase\types.ts

✅ Parsed schema: 12 tables found
📂 Found 157 TypeScript files

✅ Audit complete!
   - Tables referenced: 16
   - Queries found: 150
   - Issues found: 48

# Database Schema Audit Report

**Generated:** 2026-10-08T11:53:16.875Z
**Files Scanned:** 157
**Queries Found:** 150

## Summary

- **Tables Referenced:** 16
- **Issues Found:** 48

### Issue Breakdown

- 🔴 **Critical:** 48
- 🟡 **Warnings:** 0

## Tables Referenced in Code

### `anthropometrics`

**Columns used:**

- `body_fat_percentage`
- `height_cm`
- `id`
- `measured_at`
- `weight_kg`

### `appointments`

**Columns used:**

- `created_at`
- `date_time`
- `id`
- `notes`
- `status`

### `custom_foods`

_No specific columns found (may use wildcard or relations)_

### `custom_recipes`

_No specific columns found (may use wildcard or relations)_

### `financial_records`

_No specific columns found (may use wildcard or relations)_

### `food_database`

**Columns used:**

- `brand`

### `meal_plans`

**Columns used:**

- `created_at`
- `description`
- `id`
- `is_active`
- `patient_id`
- `plan_data`
- `title`
- `total_calories`

### `messages`

_No specific columns found (may use wildcard or relations)_

### `patients`

**Columns used:**

- `created_at`
- `email`
- `full_name`
- `goal`
- `id`
- `nutritionist_id`
- `phone`
- `user_id`

### `payment_events`

_No specific columns found (may use wildcard or relations)_

### `profiles`

**Columns used:**

- `account_status`
- `created_at`
- `crn`
- `full_name`
- `has_seen_onboarding`
- `id`
- `is_active`
- `is_admin`
- `logo_url`
- `phone`
- `primary_color`
- `secondary_color`
- `trial_ended`
- `trial_start_date`
- `user_id`

### `purchase_events`

_No specific columns found (may use wildcard or relations)_

### `support_ticket_messages`

_No specific columns found (may use wildcard or relations)_

### `support_tickets`

_No specific columns found (may use wildcard or relations)_

### `water_logs`

_No specific columns found (may use wildcard or relations)_

### `weight_logs`

_No specific columns found (may use wildcard or relations)_

## Critical Issues

These issues are blocking or will cause runtime errors:

### 🔴 MISSING TABLE

**File:** `src\components\monitoring\PatientMonitoringTab.tsx:69`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\monitoring\PatientMonitoringTab.tsx:82`
**Table:** `water_logs`
**Message:** Table "water_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\monitoring\PatientMonitoringTab.tsx:126`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\monitoring\PatientProgressTab.tsx:56`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\monitoring\PatientProgressTab.tsx:71`
**Table:** `water_logs`
**Message:** Table "water_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\monitoring\PatientProgressTab.tsx:106`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\monitoring\PatientProgressTab.tsx:144`
**Table:** `water_logs`
**Message:** Table "water_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\patient-mobile\PatientEvolucao.tsx:56`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\PatientPreviewModal.tsx:65`
**Table:** `water_logs`
**Message:** Table "water_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\PatientPreviewModal.tsx:75`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\SupportDialog.tsx:126`
**Table:** `support_tickets`
**Message:** Table "support_tickets" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\SupportDialog.tsx:144`
**Table:** `support_ticket_messages`
**Message:** Table "support_ticket_messages" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\SupportDialog.tsx:212`
**Table:** `support_tickets`
**Message:** Table "support_tickets" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\SupportDialog.tsx:226`
**Table:** `support_ticket_messages`
**Message:** Table "support_ticket_messages" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\SupportDialog.tsx:257`
**Table:** `support_ticket_messages`
**Message:** Table "support_ticket_messages" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\components\SupportDialog.tsx:268`
**Table:** `support_tickets`
**Message:** Table "support_tickets" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Admin.tsx:264`
**Table:** `support_tickets`
**Message:** Table "support_tickets" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Admin.tsx:295`
**Table:** `support_ticket_messages`
**Message:** Table "support_ticket_messages" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Admin.tsx:356`
**Table:** `support_ticket_messages`
**Message:** Table "support_ticket_messages" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Admin.tsx:366`
**Table:** `support_tickets`
**Message:** Table "support_tickets" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Admin.tsx:388`
**Table:** `support_tickets`
**Message:** Table "support_tickets" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Consultation.tsx:191`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Consultation.tsx:199`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Consultation.tsx:204`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Consultation.tsx:258`
**Table:** `financial_records`
**Message:** Table "financial_records" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Dashboard.tsx:129`
**Table:** `financial_records`
**Message:** Table "financial_records" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\EditPatient.tsx:205`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\EditPatient.tsx:213`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\EditPatient.tsx:218`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Financeiro.tsx:80`
**Table:** `financial_records`
**Message:** Table "financial_records" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Financeiro.tsx:100`
**Table:** `financial_records`
**Message:** Table "financial_records" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\Financeiro.tsx:129`
**Table:** `financial_records`
**Message:** Table "financial_records" not found in types.ts

### 🔴 MISSING COLUMN

**File:** `src\pages\GroceryList.tsx:92`
**Table:** `meal_plans`
**Column:** `plan_data`
**Message:** Column "meal_plans.plan_data" not found in types.ts

### 🔴 MISSING COLUMN

**File:** `src\pages\GroceryList.tsx:92`
**Table:** `meal_plans`
**Column:** `patient_id`
**Message:** Column "meal_plans.patient_id" not found in types.ts

### 🔴 MISSING COLUMN

**File:** `src\pages\GroceryList.tsx:150`
**Table:** `meal_plans`
**Column:** `plan_data`
**Message:** Column "meal_plans.plan_data" not found in types.ts

### 🔴 MISSING COLUMN

**File:** `src\pages\PatientDetail.tsx:249`
**Table:** `meal_plans`
**Column:** `is_active`
**Message:** Column "meal_plans.is_active" not found in types.ts

### 🔴 MISSING COLUMN

**File:** `src\pages\PatientDetail.tsx:249`
**Table:** `meal_plans`
**Column:** `plan_data`
**Message:** Column "meal_plans.plan_data" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\PatientDetail.tsx:261`
**Table:** `weight_logs`
**Message:** Table "weight_logs" not found in types.ts

### 🔴 MISSING COLUMN

**File:** `src\pages\PatientDetail.tsx:288`
**Table:** `appointments`
**Column:** `date_time`
**Message:** Column "appointments.date_time" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\PatientMobileApp.tsx:146`
**Table:** `water_logs`
**Message:** Table "water_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\PatientMobileApp.tsx:175`
**Table:** `water_logs`
**Message:** Table "water_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\PatientMobileApp.tsx:183`
**Table:** `water_logs`
**Message:** Table "water_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\pages\PatientMobileApp.tsx:188`
**Table:** `water_logs`
**Message:** Table "water_logs" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\server\stripe-webhooks.ts:36`
**Table:** `purchase_events`
**Message:** Table "purchase_events" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\server\stripe-webhooks.ts:83`
**Table:** `payment_events`
**Message:** Table "payment_events" not found in types.ts

### 🔴 MISSING TABLE

**File:** `src\server\stripe-webhooks.ts:100`
**Table:** `payment_events`
**Message:** Table "payment_events" not found in types.ts

### 🔴 MISSING COLUMN

**File:** `src\services\trial.ts:19`
**Table:** `profiles`
**Column:** `trial_start_date`
**Message:** Column "profiles.trial_start_date" not found in types.ts

### 🔴 MISSING COLUMN

**File:** `src\services\trial.ts:19`
**Table:** `profiles`
**Column:** `trial_ended`
**Message:** Column "profiles.trial_ended" not found in types.ts

---

_This report was automatically generated by `scripts/audit-database-schema.ts`_

