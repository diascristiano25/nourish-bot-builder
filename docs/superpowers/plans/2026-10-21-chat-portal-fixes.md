# Chat & Portal System Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Patient-Nutritionist chat to be real-time and persistent, ensure the Patient Portal access generation is robust, and integrate chat into the Patient Mobile App.
**Architecture:** 
1.  **Chat:** Rewrite `ChatWidget.tsx` to use Supabase Realtime (matching `NutritionistChat.tsx` logic) so patients can send/receive messages that persist and sync with the nutritionist's view.
2.  **Portal Access:** Harden `handleGenerateAccess` in `PatientDetail.tsx` to gracefully handle missing Edge Functions by falling back to direct DB updates + clipboard copy if email sending fails.
3.  **Patient App:** Add a "Messages" tab to `PatientMobileApp.tsx` that renders the fixed `ChatWidget`.
**Tech Stack:** React, TypeScript, Supabase (Realtime, Auth), Tailwind CSS, Shadcn UI.
**Spec:** `docs/superpowers/specs/2026-10-21-chat-portal-fixes-design.md` (Implicit from brainstorming)

## Global Constraints
-   **Supabase Client:** Use existing `@/integrations/supabase/client`.
-   **UI Style:** Maintain Tailwind/Shadcn UI consistency (emerald/teal palette for patient side, primary/accent for nutritionist side).
-   **Autonomous Execution:** Approved by user. No pauses for confirmation.
-   **Routes:** Ensure `/auth`, `/patient-auth`, `/meu-app`, `/dashboard/mensagens` work correctly.

## Review Focus
1.  **Realtime Sync:** Messages sent by patient must appear instantly in nutritionist's `Mensagens.tsx` and vice-versa.
2.  **Persistence:** Messages must survive page refresh (stored in `messages` table).
3.  **Portal Fallback:** If `send-patient-magic-link` fails, the system must still allow access via clipboard link or direct DB update.
4.  **Mobile Integration:** Chat tab in Patient App must be functional and styled correctly.
5.  **Auth State:** Chat must only work when user is authenticated and linked to a patient/nutritionist profile.

---

### Task 1: Rewrite ChatWidget for Supabase Realtime
**Files:**
-   Modify: `src/components/patient/dashboard/ChatWidget.tsx`

**Interfaces:**
-   Consumes: `supabase` client, `useAuth` hook.
-   Produces: Real-time chat interface connected to `messages` table.

-   [ ] **Step 1: Rewrite ChatWidget.tsx**
    Replace local state logic with Supabase queries and realtime subscriptions.
    -   Fetch messages on mount: `supabase.from('messages').select('*').eq('patient_id', patientId).eq('nutritionist_id', nutritionistId).order('created_at')`.
    -   Subscribe to inserts: `supabase.channel('chat-widget').on('postgres_changes', ...).subscribe()`.
    -   Send message: `supabase.from('messages').insert({ patient_id, nutritionist_id, content, is_staff_reply: 'patient' })`.
    -   Mark as read: Update `is_read` true when patient views messages from nutritionist.
    -   UI: Keep existing Tailwind styles but ensure scroll-to-bottom on new messages.

-   [ ] **Step 2: Verify ChatWidget builds**
    Run: `npx tsc --noEmit`
    Expected: No errors related to ChatWidget.

-   [ ] **Step 3: Commit**
    ```bash
    git add src/components/patient/dashboard/ChatWidget.tsx
    git commit -m "feat(chat): rewrite ChatWidget with Supabase realtime"
    ```

### Task 2: Integrate Chat into Patient Mobile App
**Files:**
-   Modify: `src/pages/PatientMobileApp.tsx`
-   Modify: `src/components/patient-mobile/PatientBottomNav.tsx`

**Interfaces:**
-   Consumes: `ChatWidget` (from Task 1), `PatientData` (for IDs).
-   Produces: New "Messages" tab in patient app.

-   [ ] **Step 1: Add 'mensagens' to TabType**
    In `PatientMobileApp.tsx`, update `TabType` to include `'mensagens'`.

-   [ ] **Step 2: Add Chat Tab Render**
    In `PatientMobileApp.tsx`, add condition:
    ```tsx
    {activeTab === 'mensagens' && patient && (
      <div className="p-4 h-[calc(100vh-80px)]">
        <ChatWidget patientId={patient.id} nutritionistId={patient.nutritionist_id} />
      </div>
    )}
    ```
    *Note: Need to pass `nutritionist_id` from `PatientData`.*

-   [ ] **Step 3: Update Bottom Nav**
    In `PatientBottomNav.tsx`, add a new nav item for "Mensagens" (MessageCircle icon). Adjust layout if 5 items become 6 (or replace one if needed, but adding is better).

-   [ ] **Step 4: Verify Build**
    Run: `npx tsc --noEmit`
    Expected: No errors.

-   [ ] **Step 5: Commit**
    ```bash
    git add src/pages/PatientMobileApp.tsx src/components/patient-mobile/PatientBottomNav.tsx
    git commit -m "feat(patient-app): add Messages tab with ChatWidget"
    ```

### Task 3: Harden Portal Access Generation
**Files:**
-   Modify: `src/pages/PatientDetail.tsx`

**Interfaces:**
-   Consumes: `supabase` client.
-   Produces: Robust `handleGenerateAccess` function.

-   [ ] **Step 1: Update handleGenerateAccess**
    In `PatientDetail.tsx`, wrap the `supabase.functions.invoke` call in a try-catch that specifically handles network/function errors.
    -   If invoke fails, fallback to:
        1.  Generate a magic link manually using `supabase.auth.admin.generateLink` (if service role available, otherwise skip).
        2.  OR simply construct the portal URL `${origin}/paciente/${patient.id}`.
        3.  Copy to clipboard.
        4.  Show toast: "Email indisponível. Link copiado para área de transferência."
    -   Ensure `user_id` is updated in `patients` table if signup happens via fallback (though fallback is mostly for link sharing).

-   [ ] **Step 2: Verify Build**
    Run: `npx tsc --noEmit`
    Expected: No errors.

-   [ ] **Step 3: Commit**
    ```bash
    git add src/pages/PatientDetail.tsx
    git commit -m "fix(portal): harden generate access with clipboard fallback"
    ```

### Task 4: Final Verification & Deploy
**Files:**
-   None (Verification only)

-   [ ] **Step 1: Full Build**
    Run: `npm run build`
    Expected: Success.

-   [ ] **Step 2: Deploy to Netlify**
    Run: `npx netlify-cli deploy --prod --dir=dist`
    Expected: Deploy successful.

-   [ ] **Step 3: Commit any final changes**
    ```bash
    git add -A
    git commit -m "chore: final verification and deploy"
    ```