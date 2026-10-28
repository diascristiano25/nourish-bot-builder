# NutriFlow Dietsystem Parity Design Spec

**Date:** 2026-10-28
**Status:** Draft
**Author:** Claude (Brainstorming Skill)

## 1. Executive Summary

This spec defines the implementation plan to achieve feature parity with Dietsystem/FitLab in NutriFlow. Based on competitive analysis and codebase exploration, six critical gaps were identified. This document details the architectural approach for each, leveraging existing NutriFlow infrastructure (Supabase, React, shadcn/ui) to ensure seamless integration.

## 2. Gap Analysis & Implementation Strategy

### 2.1 Video Call Integration
*   **Current State:** No video call functionality exists. Only UI placeholders found.
*   **Target State:** Native video consultation within appointment flow.
*   **Approach:** Integrate **Jitsi Meet SDK** (open-source, no API key required for basic use, GDPR compliant).
*   **Architecture:**
    *   Create `src/components/appointments/VideoCallModal.tsx` wrapping Jitsi iframe API.
    *   Extend `appointments` table with `video_room_id` (UUID) and `is_video_enabled` (boolean).
    *   Generate unique room IDs per appointment on creation.
    *   Embed modal trigger in `AppointmentCard.tsx` and `PatientDetail.tsx`.
*   **Dependencies:** `@jitsi/react-sdk` or direct iframe embedding.

### 2.2 Automated Appointment Reminders
*   **Current State:** Manual notifications only via `useNotifications` hook. No automated scheduling.
*   **Target State:** Automated Email/WhatsApp reminders 24h and 1h before appointments.
*   **Approach:** Supabase Edge Functions + pg_cron extension.
*   **Architecture:**
    *   Create Edge Function `send-appointment-reminders` triggered by pg_cron every hour.
    *   Query appointments where `start_time` is within next 24h AND reminder not yet sent.
    *   Integrate with existing notification service (email/WhatsApp provider TBD - likely Twilio/SendGrid via env vars).
    *   Add `reminder_sent_at` timestamp to `appointments` table.
*   **Data Model:** `ALTER TABLE appointments ADD COLUMN reminder_sent_at TIMESTAMPTZ;`

### 2.3 Food Diary with Automatic Macro Calculation
*   **Current State:** `PatientRegistro.tsx` exists but lacks auto-calc from TACO database. `food_intake_logs` table exists in schema.
*   **Target State:** Patient logs food → system auto-calculates calories/macros using TACO/custom DB.
*   **Approach:** Client-side calculation with server validation.
*   **Architecture:**
    *   Enhance `PatientRegistro.tsx` to query `food_database` and `custom_foods` on search.
    *   Implement `calculateMealMacros()` utility function summing selected items.
    *   Display real-time macro totals in diary entry form.
    *   Validate totals server-side on save to prevent tampering.
*   **Key Files:** `src/components/patient-mobile/PatientRegistro.tsx`, `src/lib/nutrition-calculator.ts` (new).

### 2.4 Real-Time Sync (Weight/Diary/Chat)
*   **Current State:** Supabase Realtime channels defined in types but not actively subscribed in patient app views.
*   **Target State:** Nutritionist sees patient diary entries/weight updates instantly without refresh.
*   **Approach:** Supabase Realtime Broadcast + Presence.
*   **Architecture:**
    *   Enable Realtime on `food_intake_logs`, `anthropometrics`, `messages` tables.
    *   Subscribe in `PatientDetail.tsx` (nutritionist view) to patient-specific channel.
    *   Subscribe in `PatientMobileApp.tsx` to own data channel for multi-device sync.
    *   Use `useSupabaseRealtime` custom hook (new) encapsulating subscription logic.
*   **Performance:** Filter subscriptions by `patient_id` to avoid global broadcast overhead.

### 2.5 PDF Customization with Logo
*   **Current State:** `jspdf` installed. `PatientReportDocument.tsx` exists but uses hardcoded branding.
*   **Target State:** Nutritionist uploads logo → appears on all generated PDFs (meal plans, reports).
*   **Approach:** Dynamic asset loading from Supabase Storage.
*   **Architecture:**
    *   Add `logo_url` column to `profiles` table.
    *   Create logo upload component in `ProfileForm.tsx` storing to `nutritionist-logos` bucket.
    *   Modify `PatientReportDocument.tsx` and `MealPlanDocument.tsx` to fetch and embed logo image asynchronously before PDF generation.
    *   Fallback to default NutriFlow logo if none uploaded.
*   **Storage:** Supabase Storage bucket `nutritionist-logos` with RLS restricting access to owner.

### 2.6 Physical Activity Analysis
*   **Current State:** Water tracking exists (`WaterTracker.tsx`). No activity logging.
*   **Target State:** Patient logs exercises → system estimates calorie burn → integrates with daily energy balance.
*   **Approach:** New `exercise_logs` table + MET-based calculator.
*   **Architecture:**
    *   Create migration: `exercise_logs` (id, patient_id, date, type, duration_min, intensity, calories_burned).
    *   Build `ExerciseTracker.tsx` component mirroring `WaterTracker` UX.
    *   Implement MET (Metabolic Equivalent of Task) calculator using standard compendium values.
    *   Integrate into `PatientProgress.tsx` showing net energy balance (intake - exercise).
*   **Data Source:** Static MET reference JSON embedded in app (no external API needed for MVP).

## 3. Data Model Changes Summary

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| appointments | video_room_id | UUID | Jitsi room identifier |
| appointments | is_video_enabled | BOOLEAN | Toggle video option |
| appointments | reminder_sent_at | TIMESTAMPTZ | Track reminder delivery |
| profiles | logo_url | TEXT | Supabase Storage path |
| exercise_logs | (new table) | - | Activity tracking |

## 4. Technical Constraints & Risks

*   **Jitsi:** Self-hosted vs cloud? Recommendation: Start with meet.jit.si free tier for MVP, migrate to self-hosted if volume demands.
*   **Reminders:** WhatsApp Business API requires Meta approval. Fallback: Email-first, WhatsApp as premium add-on.
*   **Realtime:** Supabase free tier limits concurrent connections. Monitor usage; upgrade plan if >50 simultaneous users.
*   **PDF:** Large logos may bloat PDF size. Enforce max 2MB upload, auto-compress client-side.

## 5. Success Criteria

1.  Nutritionist can start video call directly from appointment card.
2.  Patient receives automated reminder 24h before consultation.
3.  Food diary shows macro totals within 500ms of item selection.
4.  Weight update on patient app reflects on nutritionist dashboard <2s later.
5.  Generated PDF displays nutritionist's custom logo correctly.
6.  Exercise log contributes to daily energy deficit/surplus calculation.

## 6. Out of Scope (Phase 2)

*   Website/blog builder for nutritionists (existing blog is platform-wide only).
*   Advanced AI meal suggestions (current Gemini integration sufficient).
*   Payment gateway integration for consultations.
*   Multi-language support beyond PT-BR.