# Dietsystem Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 6 missing features to achieve parity with Dietsystem/FitLab: Video Calls, Automated Reminders, Food Diary Auto-Calc, Real-Time Sync, PDF Logo Customization, Physical Activity Tracking.

**Architecture:** Feature modules built on existing Supabase + React + shadcn/ui stack. Each feature is independent and can be implemented in parallel. Database migrations extend existing tables or add new ones. Frontend components follow established patterns in `src/components/`.

**Tech Stack:** React 18, TypeScript, Supabase (Realtime, Edge Functions, Storage), Jitsi Meet SDK, jspdf, Tailwind CSS, shadcn/ui, Vitest

**Spec:** `docs/superpowers/specs/2026-10-28-diet-system-parity-design.md`

## Global Constraints

- All new components must use existing shadcn/ui primitives from `src/components/ui/`
- Database changes require Supabase migration files in `supabase/migrations/`
- Tests use Vitest + @testing-library/react for components, vitest for utilities
- Follow existing code style: functional components, hooks pattern, TypeScript strict mode
- Color palette: Sage Green (#518C5B), Terracotta (#C4764A), Background (#FAF8F5)
- All user-facing text in PT-BR

## Review Focus

1. **Jitsi room ID collision:** Two appointments at the same time must never share a room ID → Task 1 generates UUID per appointment
2. **Reminder double-send:** A reminder must not be sent twice for the same appointment → Task 2 uses `reminder_sent_at` guard
3. **Macro calculation accuracy:** Food diary totals must match TACO database values exactly → Task 3 tests against known TACO entries
4. **Realtime memory leak:** Unmounting a component must unsubscribe from Supabase channels → Task 4 hook cleanup tested
5. **PDF logo overflow:** Oversized logos must not break PDF layout → Task 5 enforces max dimensions and compression

---

### Task 1: Video Call Integration (Jitsi)

**Files:**
- Create: `src/components/appointments/VideoCallModal.tsx`
- Create: `src/lib/jitsi.ts`
- Modify: `src/components/nutritionist/agenda/AppointmentCard.tsx`
- Modify: `src/pages/PatientDetail.tsx`
- Create: `supabase/migrations/20261028_add_video_columns.sql`
- Test: `src/components/appointments/__tests__/VideoCallModal.test.tsx`
- Test: `src/lib/__tests__/jitsi.test.ts`

**Interfaces:**
- Consumes: `Appointment` type from `src/integrations/supabase/types.ts`
- Produces: `generateRoomId(appointmentId: string): string`, `VideoCallModalProps { appointmentId: string; isOpen: boolean; onClose: () => void }`

- [ ] **Step 1: Write migration for video columns**
```sql
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS video_room_id UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_video_enabled BOOLEAN DEFAULT false;
```

- [ ] **Step 2: Write failing test for room ID generation**
```typescript
// src/lib/__tests__/jitsi.test.ts
import { generateRoomId } from '../jitsi';

describe('generateRoomId', () => {
  it('returns unique UUID-based room ID for each appointment', () => {
    const id1 = generateRoomId('appt-1');
    const id2 = generateRoomId('appt-2');
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^[0-9a-f-]{36}$/);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**
Run: `npx vitest run src/lib/__tests__/jitsi.test.ts`
Expected: FAIL - module not found

- [ ] **Step 4: Implement `generateRoomId` in `src/lib/jitsi.ts`**
Use `crypto.randomUUID()` prefixed with appointment ID for traceability.

- [ ] **Step 5: Run test to verify it passes**
Run: `npx vitest run src/lib/__tests__/jitsi.test.ts`
Expected: PASS

- [ ] **Step 6: Write failing test for VideoCallModal rendering**
```typescript
// src/components/appointments/__tests__/VideoCallModal.test.tsx
import { render, screen } from '@testing-library/react';
import { VideoCallModal } from '../VideoCallModal';

describe('VideoCallModal', () => {
  it('renders Jitsi iframe when open', () => {
    render(<VideoCallModal appointmentId="test-123" isOpen={true} onClose={() => {}} />);
    expect(screen.getByTitle('Video consultation')).toBeInTheDocument();
  });

  it('does not render iframe when closed', () => {
    render(<VideoCallModal appointmentId="test-123" isOpen={false} onClose={() => {}} />);
    expect(screen.queryByTitle('Video consultation')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run test to verify it fails**
Run: `npx vitest run src/components/appointments/__tests__/VideoCallModal.test.tsx`
Expected: FAIL - component not found

- [ ] **Step 8: Implement VideoCallModal component**
Wrap Jitsi iframe API. Props: `appointmentId`, `isOpen`, `onClose`. Use Dialog from shadcn/ui. Iframe src: `https://meet.jit.si/${roomId}`.

- [ ] **Step 9: Run test to verify it passes**
Run: `npx vitest run src/components/appointments/__tests__/VideoCallModal.test.tsx`
Expected: PASS

- [ ] **Step 10: Add video call button to AppointmentCard**
Add "Vídeo" button that opens VideoCallModal. Only show when `appointment.is_video_enabled` is true.

- [ ] **Step 11: Commit**
```bash
git add src/components/appointments/ src/lib/jitsi.ts supabase/migrations/20261028_add_video_columns.sql
git commit -m "feat(appointments): add Jitsi video call integration"
```

---

### Task 2: Automated Appointment Reminders

**Files:**
- Create: `supabase/functions/send-appointment-reminders/index.ts`
- Create: `supabase/migrations/20261028_add_reminder_column.sql`
- Test: `supabase/functions/send-appointment-reminders/__tests__/index.test.ts`

**Interfaces:**
- Consumes: `appointments` table, `profiles` table (for email)
- Produces: Edge Function that sends reminders and updates `reminder_sent_at`

- [ ] **Step 1: Write migration for reminder column**
```sql
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
CREATE INDEX idx_appointments_reminder ON appointments(start_time, reminder_sent_at) WHERE reminder_sent_at IS NULL;
```

- [ ] **Step 2: Write failing test for reminder query logic**
```typescript
// supabase/functions/send-appointment-reminders/__tests__/index.test.ts
describe('getAppointmentsNeedingReminders', () => {
  it('returns appointments within 24h that have no reminder sent', () => {
    // Mock Supabase client
    // Assert query filters: start_time BETWEEN now() AND now()+24h AND reminder_sent_at IS NULL
  });
});
```

- [ ] **Step 3: Run test to verify it fails**
Run: `npx vitest run supabase/functions/send-appointment-reminders/__tests__/index.test.ts`
Expected: FAIL

- [ ] **Step 4: Implement Edge Function handler**
Query appointments needing reminders. For each, send email via Resend/SendGrid (env var). Update `reminder_sent_at` after successful send.

- [ ] **Step 5: Run test to verify it passes**
Run: `npx vitest run supabase/functions/send-appointment-reminders/__tests__/index.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add supabase/functions/send-appointment-reminders/ supabase/migrations/20261028_add_reminder_column.sql
git commit -m "feat(reminders): add automated appointment reminder edge function"
```

---

### Task 3: Food Diary with Automatic Macro Calculation

**Files:**
- Create: `src/lib/nutrition-calculator.ts`
- Modify: `src/components/patient-mobile/PatientRegistro.tsx`
- Test: `src/lib/__tests__/nutrition-calculator.test.ts`

**Interfaces:**
- Consumes: `food_database` table, `custom_foods` table
- Produces: `calculateMealMacros(items: FoodItem[]): MacroTotals`, where `MacroTotals = { calories: number; protein: number; carbs: number; fat: number }`

- [ ] **Step 1: Write failing test for macro calculation**
```typescript
// src/lib/__tests__/nutrition-calculator.test.ts
import { calculateMealMacros } from '../nutrition-calculator';

describe('calculateMealMacros', () => {
  it('sums macros correctly for multiple items', () => {
    const items = [
      { food_id: '1', quantity_g: 100, calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2 },
      { food_id: '2', quantity_g: 200, calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6 },
    ];
    const result = calculateMealMacros(items);
    expect(result.calories).toBe(382); // 52 + 330
    expect(result.protein).toBe(62.3); // 0.3 + 62
  });

  it('returns zeros for empty array', () => {
    expect(calculateMealMacros([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/lib/__tests__/nutrition-calculator.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: Implement `calculateMealMacros` in `src/lib/nutrition-calculator.ts`**
Pure function. Multiply each nutrient by `quantity_g / 100`, sum across items, round to 1 decimal.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/lib/__tests__/nutrition-calculator.test.ts`
Expected: PASS

- [ ] **Step 5: Integrate calculator into PatientRegistro**
On food item selection, call `calculateMealMacros` and display running totals in a summary bar above the save button.

- [ ] **Step 6: Commit**
```bash
git add src/lib/nutrition-calculator.ts src/components/patient-mobile/PatientRegistro.tsx
git commit -m "feat(diary): add automatic macro calculation to food diary"
```

---

### Task 4: Real-Time Sync Hook

**Files:**
- Create: `src/hooks/useSupabaseRealtime.ts`
- Modify: `src/pages/PatientDetail.tsx`
- Modify: `src/pages/PatientMobileApp.tsx`
- Test: `src/hooks/__tests__/useSupabaseRealtime.test.ts`

**Interfaces:**
- Consumes: Supabase client from `src/integrations/supabase/client.ts`
- Produces: `useSupabaseRealtime<T>(table: string, filter: { column: string; value: string }) => { data: T[]; isLoading: boolean }`

- [ ] **Step 1: Write failing test for hook subscription and cleanup**
```typescript
// src/hooks/__tests__/useSupabaseRealtime.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSupabaseRealtime } from '../useSupabaseRealtime';

describe('useSupabaseRealtime', () => {
  it('subscribes on mount and unsubscribes on unmount', () => {
    const mockUnsubscribe = vi.fn();
    const mockSubscribe = vi.fn().mockReturnValue({ unsubscribe: mockUnsubscribe });
    // Mock supabase.channel().on().subscribe()
    
    const { unmount } = renderHook(() => 
      useSupabaseRealtime('anthropometrics', { column: 'patient_id', value: 'p1' })
    );
    
    expect(mockSubscribe).toHaveBeenCalled();
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/hooks/__tests__/useSupabaseRealtime.test.ts`
Expected: FAIL - hook not found

- [ ] **Step 3: Implement `useSupabaseRealtime` hook**
Create Supabase channel filtered by `patient_id`. Handle INSERT/UPDATE/DELETE events. Return reactive data array. Cleanup channel on unmount via useEffect return.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/hooks/__tests__/useSupabaseRealtime.test.ts`
Expected: PASS

- [ ] **Step 5: Integrate hook into PatientDetail (nutritionist view)**
Subscribe to `anthropometrics`, `food_intake_logs`, `messages` for the current patient. Refetch queries on new data.

- [ ] **Step 6: Integrate hook into PatientMobileApp (patient view)**
Subscribe to own data channels for multi-device sync.

- [ ] **Step 7: Commit**
```bash
git add src/hooks/useSupabaseRealtime.ts src/pages/PatientDetail.tsx src/pages/PatientMobileApp.tsx
git commit -m "feat(realtime): add real-time sync for patient data"
```

---

### Task 5: PDF Logo Customization

**Files:**
- Create: `src/components/profile/LogoUploader.tsx`
- Modify: `src/components/nutritionist/profile/ProfileForm.tsx`
- Modify: `src/components/PatientReportDocument.tsx`
- Modify: `src/components/MealPlanDocument.tsx`
- Create: `supabase/migrations/20261028_add_logo_url.sql`
- Test: `src/components/profile/__tests__/LogoUploader.test.tsx`

**Interfaces:**
- Consumes: Supabase Storage bucket `nutritionist-logos`, `profiles` table
- Produces: `LogoUploaderProps { currentLogoUrl?: string; onUploadComplete: (url: string) => void }`

- [ ] **Step 1: Write migration for logo_url column**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;
```

- [ ] **Step 2: Write failing test for logo upload validation**
```typescript
// src/components/profile/__tests__/LogoUploader.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoUploader } from '../LogoUploader';

describe('LogoUploader', () => {
  it('rejects files larger than 2MB', async () => {
    const onUploadComplete = vi.fn();
    render(<LogoUploader onUploadComplete={onUploadComplete} />);
    
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 }); // 3MB
    
    const input = screen.getByLabelText(/logo/i);
    await fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText(/arquivo muito grande/i)).toBeInTheDocument();
    expect(onUploadComplete).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**
Run: `npx vitest run src/components/profile/__tests__/LogoUploader.test.tsx`
Expected: FAIL - component not found

- [ ] **Step 4: Implement LogoUploader component**
File input with preview. Validate size ≤ 2MB and type ∈ {png, jpg, svg}. Upload to Supabase Storage `nutritionist-logos/{userId}/{filename}`. Call `onUploadComplete` with public URL.

- [ ] **Step 5: Run test to verify it passes**
Run: `npx vitest run src/components/profile/__tests__/LogoUploader.test.tsx`
Expected: PASS

- [ ] **Step 6: Add LogoUploader to ProfileForm**
Insert below profile fields. On upload complete, update `profiles.logo_url` via Supabase mutation.

- [ ] **Step 7: Modify PatientReportDocument to use dynamic logo**
Fetch `profiles.logo_url` before PDF generation. If present, embed image. If absent, use default NutriFlow logo. Constrain logo to max 40mm width, 20mm height.

- [ ] **Step 8: Modify MealPlanDocument to use dynamic logo**
Same pattern as PatientReportDocument.

- [ ] **Step 9: Commit**
```bash
git add src/components/profile/ src/components/nutritionist/profile/ProfileForm.tsx src/components/PatientReportDocument.tsx src/components/MealPlanDocument.tsx supabase/migrations/20261028_add_logo_url.sql
git commit -m "feat(pdf): add nutritionist logo customization for PDFs"
```

---

### Task 6: Physical Activity Tracking

**Files:**
- Create: `src/components/monitoring/ExerciseTracker.tsx`
- Create: `src/lib/exercise-calculator.ts`
- Create: `src/data/met-values.json`
- Create: `supabase/migrations/20261028_create_exercise_logs.sql`
- Modify: `src/pages/PatientProgress.tsx`
- Test: `src/lib/__tests__/exercise-calculator.test.ts`
- Test: `src/components/monitoring/__tests__/ExerciseTracker.test.tsx`

**Interfaces:**
- Consumes: `patients` table (for weight), MET reference data
- Produces: `calculateCaloriesBurned(metValue: number, weightKg: number, durationMin: number): number`, `ExerciseLog { id: string; patient_id: string; date: string; type: string; duration_min: number; intensity: string; calories_burned: number }`

- [ ] **Step 1: Write migration for exercise_logs table**
```sql
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  duration_min INTEGER NOT NULL CHECK (duration_min > 0),
  intensity TEXT CHECK (intensity IN ('light', 'moderate', 'vigorous')),
  calories_burned NUMERIC(8,2),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can manage own exercises" ON exercise_logs FOR ALL USING (auth.uid() = patient_id);
```

- [ ] **Step 2: Write failing test for calorie burn calculation**
```typescript
// src/lib/__tests__/exercise-calculator.test.ts
import { calculateCaloriesBurned } from '../exercise-calculator';

describe('calculateCaloriesBurned', () => {
  it('calculates correctly using MET formula', () => {
    // Running at 8 METs, 70kg person, 30 minutes
    // Formula: MET × weight_kg × duration_hours
    const result = calculateCaloriesBurned(8, 70, 30);
    expect(result).toBe(280); // 8 × 70 × 0.5
  });

  it('returns 0 for zero duration', () => {
    expect(calculateCaloriesBurned(5, 70, 0)).toBe(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**
Run: `npx vitest run src/lib/__tests__/exercise-calculator.test.ts`
Expected: FAIL - module not found

- [ ] **Step 4: Implement `calculateCaloriesBurned` in `src/lib/exercise-calculator.ts`**
Formula: `MET × weightKg × (durationMin / 60)`. Round to nearest integer.

- [ ] **Step 5: Run test to verify it passes**
Run: `npx vitest run src/lib/__tests__/exercise-calculator.test.ts`
Expected: PASS

- [ ] **Step 6: Create MET values reference data**
`src/data/met-values.json`: Array of `{ type: string; met: number; label: string }` covering common exercises (walking, running, cycling, swimming, yoga, strength training).

- [ ] **Step 7: Write failing test for ExerciseTracker component**
```typescript
// src/components/monitoring/__tests__/ExerciseTracker.test.tsx
import { render, screen } from '@testing-library/react';
import { ExerciseTracker } from '../ExerciseTracker';

describe('ExerciseTracker', () => {
  it('displays exercise type selector and duration input', () => {
    render(<ExerciseTracker patientId="p1" weightKg={70} />);
    expect(screen.getByLabelText(/tipo de exercício/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duração/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Run test to verify it fails**
Run: `npx vitest run src/components/monitoring/__tests__/ExerciseTracker.test.tsx`
Expected: FAIL - component not found

- [ ] **Step 9: Implement ExerciseTracker component**
Mirror WaterTracker UX. Select exercise type → enter duration → see estimated calories burned → save to `exercise_logs`. Show today's total.

- [ ] **Step 10: Run test to verify it passes**
Run: `npx vitest run src/components/monitoring/__tests__/ExerciseTracker.test.tsx`
Expected: PASS

- [ ] **Step 11: Integrate ExerciseTracker into PatientProgress**
Add tab or section showing exercise history and net energy balance (intake from diary minus exercise burn).

- [ ] **Step 12: Commit**
```bash
git add src/components/monitoring/ExerciseTracker.tsx src/lib/exercise-calculator.ts src/data/met-values.json supabase/migrations/20261028_create_exercise_logs.sql src/pages/PatientProgress.tsx
git commit -m "feat(exercise): add physical activity tracking with calorie estimation"
```

---

### Task 7: Integration Verification

**Files:**
- Test: `src/__tests__/integration/diet-system-parity.test.tsx`

**Interfaces:**
- Consumes: All features from Tasks 1-6

- [ ] **Step 1: Write integration smoke test**
Verify all 6 features are importable and their primary exports exist. This is a build-time check, not a runtime E2E test.

- [ ] **Step 2: Run full test suite**
Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 3: Run build**
Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Final commit**
```bash
git add -A
git commit -m "chore: verify diet-system parity features integration"
```