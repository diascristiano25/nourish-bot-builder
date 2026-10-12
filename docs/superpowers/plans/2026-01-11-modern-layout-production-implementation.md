# NutriFlow Modern Layout Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate entire NutriFlow application from AppLayout to ModernLayout with Motion animations, connecting all modules to Supabase production data, and deploy with comprehensive E2E tests.

**Architecture:** 
- Big bang replacement strategy (all at once)
- Parallel implementation using 8 specialized agents
- Nutritionist area (7 modules) + Patient portal (5 modules) in same phase
- All data connected to Supabase (zero mock data)
- 50+ Motion animations across every interactive element

**Tech Stack:** 
React 18, TypeScript, Framer Motion, Supabase, React Query, Playwright, Tailwind CSS, Recharts, Lucide Icons

**Spec:** `docs/superpowers/specs/2026-01-11-modern-layout-production-migration.md`

---

## Global Constraints

- React 18+ with TypeScript strict mode
- Framer Motion 12.23.26+ for all animations
- Supabase with real-time subscriptions
- Tailwind CSS only (no CSS modules)
- 60fps animations (GPU-accelerated properties only)
- Lighthouse performance score > 90
- E2E tests must pass 100% before merge
- Zero console errors in production
- Mobile-first responsive design
- Accessibility: WCAG AA compliant

---

## Review Focus

1. **Supabase Query Performance** - Slow queries causing loading spinners that exceed 2 seconds should be indexed or paginated; test with network throttling
2. **Animation Memory Leaks** - Motion components must clean up on unmount; verify no memory growth over 10 minute sessions
3. **Mobile Responsiveness on iOS Safari** - Fixed positioning and viewport issues on iPhone; test on real device, not just emulation
4. **Error Boundary Failures** - Missing error boundaries can crash entire module; each page must have error boundary wrapper
5. **Animation 60fps Consistency** - Janky animations on low-end devices break UX; profile on Chrome DevTools, use `will-change` CSS sparingly

---

## Task 1: Setup Infrastructure & Motion Library

**Files:**
- Create: `lib/motion-variants.ts`
- Create: `lib/animation-utils.ts`
- Create: `lib/supabase-queries.ts`
- Create: `components/shared/AnimatedCard.tsx`
- Create: `components/shared/StatCard.tsx`
- Create: `components/shared/LoadingState.tsx`
- Create: `components/shared/ErrorBoundary.tsx`
- Create: `hooks/useNutritionistData.ts`
- Create: `hooks/usePatientData.ts`
- Create: `hooks/useAnimations.ts`
- Modify: `src/App.tsx` - add new routes
- Create: `playwright.config.ts`

**Interfaces:**
- Produces: Motion variants library with 15+ reusable animation configs
- Produces: Shared components (AnimatedCard, StatCard, LoadingState)
- Produces: Supabase query helpers for both nutritionist and patient data
- Produces: Custom React hooks for data fetching

**Steps:**

- [ ] **Step 1: Create Motion Variants Library**

Create `lib/motion-variants.ts` with all animation configurations:

```typescript
// Entry animations
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, type: 'spring', stiffness: 260, damping: 20 } }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

// Hover animations
export const liftHover = {
  scale: 1.05,
  y: -5,
  transition: { duration: 0.2 }
};

export const glowHover = {
  boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.1)',
  transition: { duration: 0.2 }
};

export const rotateHover = {
  rotate: 360,
  transition: { duration: 0.5 }
};

// Stagger animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Spring configs
export const springBounce = {
  type: 'spring',
  stiffness: 260,
  damping: 20
};

export const springSmooth = {
  type: 'spring',
  stiffness: 100,
  damping: 15
};

// Pulse animations
export const pulse = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1]
  },
  transition: { duration: 2, repeat: Infinity }
};
```

- [ ] **Step 2: Run test to verify motion-variants.ts exports correctly**

Run: `npm run build` (TypeScript compilation check)
Expected: No TypeScript errors

- [ ] **Step 3: Create AnimatedCard shared component**

Create `components/shared/AnimatedCard.tsx`:

```typescript
import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { fadeInUp, liftHover, springBounce } from '@/lib/motion-variants';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  onClick?: () => void;
  className?: string;
  whileHover?: MotionProps['whileHover'];
}

export function AnimatedCard({
  children,
  delay = 0,
  onClick,
  className = '',
  whileHover = liftHover
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={fadeInUp.hidden}
      animate={fadeInUp.visible}
      transition={{ ...fadeInUp.visible.transition, delay }}
      whileHover={whileHover}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Create StatCard shared component**

Create `components/shared/StatCard.tsx` with icon, value, label, and animations

- [ ] **Step 5: Create LoadingState skeleton component**

Create `components/shared/LoadingState.tsx` with shimmer animation

- [ ] **Step 6: Create ErrorBoundary component**

Create `components/shared/ErrorBoundary.tsx` with error recovery UI

- [ ] **Step 7: Create Supabase query helpers**

Create `lib/supabase-queries.ts` with functions:
- `fetchNutritionistProfile(userId: string)`
- `fetchPatients(nutritionistId: string)`
- `fetchAppointments(nutritionistId: string)`
- `fetchFinancialRecords(nutritionistId: string)`
- `fetchPatient(patientId: string)`
- `fetchCurrentMealPlan(patientId: string)`
- `fetchProgressData(patientId: string)`

- [ ] **Step 8: Create custom hooks for data fetching**

Create `hooks/useNutritionistData.ts` and `hooks/usePatientData.ts` using React Query

- [ ] **Step 9: Add new routes to App.tsx**

Add routes:
- `/biblioteca` → Biblioteca component
- `/financeiro` → Financeiro component
- `/patient-progress` → PatientProgress component
- `/patient-profile` → PatientProfile component

- [ ] **Step 10: Setup Playwright configuration**

Create `playwright.config.ts` with baseURL, projects (chromium, firefox, mobile), and screenshot settings

- [ ] **Step 11: Run build to verify all infrastructure**

Run: `npm run build`
Expected: No errors, all TypeScript types resolved

- [ ] **Step 12: Commit infrastructure setup**

```bash
git add lib/ components/shared/ hooks/ playwright.config.ts src/App.tsx
git commit -m "feat: add Motion library, shared components, and Supabase hooks

- Add 15+ centralized Motion animation variants
- Create AnimatedCard, StatCard, LoadingState, ErrorBoundary components
- Setup Supabase query helpers for nutritionist and patient data
- Add custom hooks for data fetching with React Query
- Configure Playwright for E2E testing
- Add new routes for missing modules"
```

---

## Task 2: Migrate Dashboard (Nutritionist)

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Create: `components/nutritionist/dashboard/StatsCards.tsx`
- Create: `components/nutritionist/dashboard/AppointmentsPanel.tsx`
- Create: `components/nutritionist/dashboard/RevenueChart.tsx`
- Create: `components/nutritionist/dashboard/WeeklyChart.tsx`

**Interfaces:**
- Consumes: ModernLayout, AnimatedCard, StatCard, useNutritionistData
- Produces: Fully animated Dashboard with Supabase data

**Steps:**

- [ ] **Step 1: Write test for Dashboard data loading**

Create `tests/e2e/nutritionist/dashboard.spec.ts`:

```typescript
test('Dashboard loads with stats cards and charts', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Wait for stats to load
  await expect(page.locator('text=Total Pacientes')).toBeVisible();
  await expect(page.locator('text=Consultas do Mês')).toBeVisible();
  await expect(page.locator('text=Faturamento')).toBeVisible();
  
  // Verify charts render
  await expect(page.locator('canvas')).toHaveCount(2); // Area + Bar charts
  
  // Verify animations are working (elements should be visible)
  const statCards = page.locator('[role="region"]').filter({ has: page.locator('svg') });
  await expect(statCards).toHaveCount(4);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/nutritionist/dashboard.spec.ts`
Expected: FAIL - Dashboard not implemented

- [ ] **Step 3: Implement Dashboard.tsx with ModernLayout**

Replace entire Dashboard.tsx with:
- Wrap with ModernLayout
- Use useNutritionistData hook to fetch data
- Replace mock data with Supabase queries
- Add LoadingState while fetching
- Use StatsCards component for 4 stat cards
- Add RevenueChart and WeeklyChart
- Add AppointmentsPanel with green gradient

- [ ] **Step 4: Create StatsCards component**

Create `components/nutritionist/dashboard/StatsCards.tsx`:
- Accept array of stat data
- Map each to AnimatedCard with StatCard inside
- Stagger animation with 0.1s delays

- [ ] **Step 5: Create AppointmentsPanel component**

Create `components/nutritionist/dashboard/AppointmentsPanel.tsx`:
- Green gradient background
- List of next 5 appointments
- Slide-in animations for each appointment
- "Schedule Appointment" button

- [ ] **Step 6: Create chart components**

Create RevenueChart.tsx and WeeklyChart.tsx using Recharts with animations

- [ ] **Step 7: Run test to verify it passes**

Run: `npx playwright test tests/e2e/nutritionist/dashboard.spec.ts`
Expected: PASS

- [ ] **Step 8: Commit Dashboard migration**

```bash
git add src/pages/Dashboard.tsx components/nutritionist/dashboard/ tests/e2e/nutritionist/dashboard.spec.ts
git commit -m "feat: migrate Dashboard to ModernLayout with Supabase integration

- Replace AppLayout with ModernLayout
- Connect to Supabase for real data
- Add Motion animations to all components
- Add E2E tests for Dashboard loading"
```

---

## Task 3: Migrate Agenda

**Files:**
- Modify: `src/pages/Agenda.tsx`
- Create: `components/nutritionist/agenda/Calendar.tsx`
- Create: `components/nutritionist/agenda/AppointmentList.tsx`
- Create: `components/nutritionist/agenda/AppointmentCard.tsx`

**Interfaces:**
- Consumes: ModernLayout, AnimatedCard, useNutritionistData
- Produces: Fully animated Agenda with calendar and appointments

**Steps:**

- [ ] **Step 1: Write test for Agenda calendar**

Create `tests/e2e/nutritionist/agenda.spec.ts`:

```typescript
test('Agenda displays calendar with appointments', async ({ page }) => {
  await page.goto('/agenda');
  
  // Wait for calendar to load
  await expect(page.locator('text=Janeiro')).toBeVisible();
  
  // Click a date with appointment
  await page.click('button:has-text("10")');
  
  // Verify appointments list updates
  await expect(page.locator('text=Andrea Silva')).toBeVisible();
});
```

- [ ] **Step 2: Implement Agenda.tsx with ModernLayout and calendar**

Replace entire Agenda.tsx with:
- Wrap with ModernLayout
- Calendar component showing 31 days
- Appointments list for selected day
- Modal for creating new appointment

- [ ] **Step 3: Create Calendar component**

Create `components/nutritionist/agenda/Calendar.tsx`:
- Display 31 days in grid
- Animate days with cascade effect (0.01s each)
- Highlight current day
- Show dots for days with appointments
- Pulsing animation on dots

- [ ] **Step 4: Create AppointmentList component**

List today's appointments with status indicators

- [ ] **Step 5: Run test to verify**

Run: `npx playwright test tests/e2e/nutritionist/agenda.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit Agenda migration**

```bash
git add src/pages/Agenda.tsx components/nutritionist/agenda/ tests/e2e/nutritionist/agenda.spec.ts
git commit -m "feat: migrate Agenda to ModernLayout with calendar animation

- Replace AppLayout with ModernLayout
- Add animated calendar with cascade effect
- Connect appointments to Supabase
- Add E2E tests"
```

---

## Task 4: Migrate Patients

**Files:**
- Modify: `src/pages/Patients.tsx`
- Create: `components/nutritionist/patients/PatientTable.tsx`
- Create: `components/nutritionist/patients/PatientFilters.tsx`
- Create: `components/nutritionist/patients/PatientStats.tsx`

**Interfaces:**
- Consumes: ModernLayout, useNutritionistData
- Produces: Patient list page with table and filters

**Steps:**

- [ ] **Step 1: Write test for Patients table**

Test loads table with patient data

- [ ] **Step 2: Implement Patients.tsx**

- [ ] **Step 3: Create PatientTable component**

Table with columns: Name, Email, Goal, Progress, Status, Actions

- [ ] **Step 4: Create PatientFilters component**

Search bar and filter buttons

- [ ] **Step 5: Create PatientStats component**

4 stat cards (Total, Active, New, Retention)

- [ ] **Step 6: Run test to verify**

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/pages/Patients.tsx components/nutritionist/patients/ tests/e2e/nutritionist/patients.spec.ts
git commit -m "feat: migrate Patients to ModernLayout with data table"
```

---

## Task 5: Create Biblioteca (Meal Plans Library)

**Files:**
- Create: `src/pages/Biblioteca.tsx`
- Create: `components/nutritionist/plans/PlanLibrary.tsx`
- Create: `components/nutritionist/plans/PlanCard.tsx`
- Create: `components/nutritionist/plans/PlanEditor.tsx`

**Interfaces:**
- Consumes: ModernLayout, useNutritionistData
- Produces: Meal plans library page from scratch

**Steps:**

- [ ] **Step 1: Write test for Biblioteca**

Test loads meal plans grid

- [ ] **Step 2: Create Biblioteca.tsx page**

Wrap with ModernLayout, display PlanLibrary component

- [ ] **Step 3: Create PlanLibrary component**

Grid of meal plan cards with filters

- [ ] **Step 4: Create PlanCard component**

Card with nutrition summary, click to edit

- [ ] **Step 5: Create PlanEditor component**

Full-screen editor for meal plans

- [ ] **Step 6: Run test to verify**

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/pages/Biblioteca.tsx components/nutritionist/plans/ tests/e2e/nutritionist/meal-plans.spec.ts
git commit -m "feat: create Biblioteca (Meal Plans Library) from scratch"
```

---

## Task 6: Create Financeiro (Financial Dashboard)

**Files:**
- Create: `src/pages/Financeiro.tsx`
- Create: `components/nutritionist/financial/FinancialDashboard.tsx`
- Create: `components/nutritionist/financial/RevenueChart.tsx`
- Create: `components/nutritionist/financial/TransactionList.tsx`

**Interfaces:**
- Consumes: ModernLayout, useNutritionistData
- Produces: Financial dashboard from scratch

**Steps:**

- [ ] **Step 1-7: Similar to Biblioteca**

Create from scratch with charts and transaction list

- [ ] **Step 8: Commit**

```bash
git add src/pages/Financeiro.tsx components/nutritionist/financial/ tests/e2e/nutritionist/financial.spec.ts
git commit -m "feat: create Financeiro (Financial Dashboard) from scratch"
```

---

## Task 7: Migrate Profile & Create Support

**Files:**
- Modify: `src/pages/Profile.tsx`
- Create: `src/pages/Suporte.tsx`
- Create: `components/nutritionist/profile/ProfileForm.tsx`
- Create: `components/nutritionist/suporte/FAQAccordion.tsx`

**Steps:**

- [ ] **Step 1-8: Migrate Profile and create Suporte**

Similar pattern to previous tasks

- [ ] **Step 9: Commit both**

```bash
git add src/pages/Profile.tsx src/pages/Suporte.tsx components/nutritionist/
git commit -m "feat: migrate Profile and create Suporte module"
```

---

## Task 8: Create Patient Portal Layout

**Files:**
- Create: `components/layout/PatientLayout.tsx`
- Create: `components/layout/PatientSidebar.tsx`

**Interfaces:**
- Produces: Patient layout with blue/teal color scheme

**Steps:**

- [ ] **Step 1: Create PatientLayout component**

Similar to ModernLayout but with blue colors and simplified sidebar

- [ ] **Step 2: Create PatientSidebar component**

5 navigation items with patient-friendly labels

- [ ] **Step 3: Run build to verify**

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/layout/PatientLayout.tsx components/layout/PatientSidebar.tsx
git commit -m "feat: create PatientLayout and PatientSidebar components"
```

---

## Task 9: Create Patient Portal Pages

**Files:**
- Create: `src/pages/PatientPortal.tsx` (new patient dashboard)
- Modify: `src/pages/PatientMealPlan.tsx`
- Create: `src/pages/PatientProgress.tsx`
- Create: `src/pages/PatientProfile.tsx`

**Interfaces:**
- Consumes: PatientLayout, usePatientData
- Produces: 4 patient-facing pages with animations

**Steps:**

- [ ] **Step 1-8: Create all patient pages**

Similar pattern to nutritionist modules

- [ ] **Step 9: Commit**

```bash
git add src/pages/PatientPortal.tsx src/pages/PatientMealPlan.tsx src/pages/PatientProgress.tsx src/pages/PatientProfile.tsx components/patient/
git commit -m "feat: create patient portal pages with animations"
```

---

## Task 10: Write & Run E2E Tests

**Files:**
- Create: `tests/e2e/nutritionist/auth.spec.ts`
- Create: `tests/e2e/nutritionist/full-flow.spec.ts`
- Create: `tests/e2e/patient/auth.spec.ts`
- Create: `tests/e2e/patient/full-flow.spec.ts`
- Create: `tests/e2e/shared/animations.spec.ts`
- Create: `tests/e2e/shared/responsive.spec.ts`

**Steps:**

- [ ] **Step 1: Write nutritionist auth test**

Login flow, verify dashboard loads

- [ ] **Step 2: Write nutritionist full flow test**

Create patient → Schedule appointment → Generate meal plan

- [ ] **Step 3: Write patient auth test**

Patient login, verify portal loads

- [ ] **Step 4: Write patient full flow test**

View meal plan → Log meal → Check progress

- [ ] **Step 5: Write animation tests**

Verify cards animate, no janky animations

- [ ] **Step 6: Write responsive tests**

Test on mobile, tablet, desktop

- [ ] **Step 7: Run all E2E tests**

Run: `npx playwright test`
Expected: 100% PASS

- [ ] **Step 8: Commit tests**

```bash
git add tests/e2e/
git commit -m "test: add comprehensive E2E tests for all modules"
```

---

## Task 11: Cleanup & Final Validation

**Files:**
- Delete: All `/demo-*` route files
- Delete: Old `AppLayout.tsx` (backup to old-backup branch first)
- Modify: `src/App.tsx` - remove demo routes

**Steps:**

- [ ] **Step 1: Create backup branch**

```bash
git checkout -b backup/old-layout
git push origin backup/old-layout
```

- [ ] **Step 2: Remove demo routes**

Delete `pages/demo/` and `pages/DemoModernDashboard.tsx` and `pages/DemoAgenda.tsx` and `pages/DemoPacientes.tsx`

- [ ] **Step 3: Update App.tsx routes**

Remove all demo route imports and Route elements

- [ ] **Step 4: Run full test suite**

```bash
npm run build
npm run test
npx playwright test
```

Expected: All pass, no console errors

- [ ] **Step 5: Run Lighthouse audit**

Expected: Performance > 90, Accessibility > 90

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: cleanup demo files and finalize production migration

- Remove all /demo-* routes
- Remove old AppLayout backup
- Final validation: all tests passing, Lighthouse > 90
- Zero console errors in production"
```

---

## Task 12: Deploy to Production

**Files:**
- None (deployment only)

**Steps:**

- [ ] **Step 1: Create PR with screenshots**

```bash
git push origin feature/modern-layout-production
```

Create PR with:
- Title: "feat: complete Modern Layout migration to production"
- Description: Summary of all changes, test results
- Screenshots of all modules

- [ ] **Step 2: Final QA check**

Test on:
- Chrome desktop
- Firefox desktop
- Safari desktop
- iPhone 12
- iPad

Expected: All working smoothly, 60fps animations

- [ ] **Step 3: Merge to main**

```bash
git checkout main
git pull origin main
git merge feature/modern-layout-production
git push origin main
```

- [ ] **Step 4: Deploy to Vercel**

Vercel auto-deploys on push to main

- [ ] **Step 5: Verify production**

Test production URL:
- Dashboard loads
- All animations smooth
- No console errors
- Network tab shows Supabase queries

- [ ] **Step 6: Monitor for errors**

Watch Sentry dashboard for 24 hours

- [ ] **Step 7: Success commit**

```bash
git tag -a v2.0.0 -m "Release: Modern Layout Production Migration Complete"
git push origin v2.0.0
```

---

## Summary

**Total Steps:** 52 independent, testable steps  
**Agents Needed:** 8 (parallel execution)  
**Estimated Time:** 6-7 hours  
**Success Criteria:** All tests pass, Lighthouse > 90, zero console errors  

Each task is self-contained and can be executed in parallel. Each commit represents a working, testable piece of functionality.

---

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
