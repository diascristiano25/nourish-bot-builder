# NutriFlow - Modern Layout Production Migration

**Date:** 2026-01-11  
**Status:** Approved  
**Strategy:** Big Bang Replacement  
**Target:** Complete migration to ModernLayout with Motion animations

---

## Executive Summary

Migrate the entire NutriFlow application (nutritionist area + patient portal) from the current AppLayout to the new ModernLayout with comprehensive Motion animations. This is a complete UI/UX overhaul affecting all modules, implemented as a big bang deployment since there are no active customers yet.

**Key Decisions:**
- ✅ Big bang migration (replace all at once)
- ✅ Patient portal migrated in same phase
- ✅ All modules connected to Supabase (production data)
- ✅ E2E tests with Playwright before deployment
- ✅ New modules (Plans, Financial, Config, Support) built from scratch with ModernLayout

---

## Goals

### Primary Goals
1. Replace all instances of `AppLayout` with `ModernLayout` across the application
2. Add Motion animations (50+ animation types) to every interactive element
3. Migrate patient portal to matching modern design
4. Connect all demo components to real Supabase backend
5. Implement E2E tests for critical user flows
6. Deploy to production with confidence (zero bugs tolerance)

### Success Criteria
- ✅ All pages use ModernLayout (nutritionist + patient)
- ✅ Every interaction has smooth Motion animations
- ✅ All data fetched from Supabase (no mock data)
- ✅ E2E tests passing at 100%
- ✅ No console errors in production
- ✅ Lighthouse score > 90 for performance

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    NutriFlow Application                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┐      ┌────────────────────┐   │
│  │ Nutritionist Area  │      │  Patient Portal    │   │
│  │                    │      │                    │   │
│  │ - ModernLayout     │      │ - PatientLayout    │   │
│  │ - ModernSidebar    │      │ - PatientSidebar   │   │
│  │ - 7 modules        │      │ - 5 modules        │   │
│  └────────────────────┘      └────────────────────┘   │
│            │                           │                │
│            └───────────┬───────────────┘                │
│                        │                                │
│                        ▼                                │
│              ┌──────────────────┐                      │
│              │  Shared Layer    │                      │
│              │                  │                      │
│              │ - Motion hooks   │                      │
│              │ - Supabase hooks │                      │
│              │ - Shared comps   │                      │
│              └──────────────────┘                      │
│                        │                                │
│                        ▼                                │
│              ┌──────────────────┐                      │
│              │   Supabase DB    │                      │
│              └──────────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### Folder Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── ModernLayout.tsx          # ✅ Existing - Nutritionist wrapper
│   │   ├── ModernSidebar.tsx         # ✅ Existing - Green sidebar
│   │   ├── PatientLayout.tsx         # 🆕 Patient wrapper
│   │   └── PatientSidebar.tsx        # 🆕 Patient navigation
│   │
│   ├── nutritionist/                  # 🆕 Nutritionist-specific components
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── AppointmentsPanel.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── WeeklyChart.tsx
│   │   │
│   │   ├── agenda/
│   │   │   ├── Calendar.tsx
│   │   │   ├── AppointmentList.tsx
│   │   │   └── AppointmentCard.tsx
│   │   │
│   │   ├── patients/
│   │   │   ├── PatientTable.tsx
│   │   │   ├── PatientRow.tsx
│   │   │   ├── PatientFilters.tsx
│   │   │   └── PatientStats.tsx
│   │   │
│   │   ├── plans/
│   │   │   ├── PlanLibrary.tsx
│   │   │   ├── PlanCard.tsx
│   │   │   ├── PlanEditor.tsx
│   │   │   └── MealBuilder.tsx
│   │   │
│   │   ├── financial/
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── ExpenseChart.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   └── FinancialStats.tsx
│   │   │
│   │   └── profile/
│   │       ├── ProfileForm.tsx
│   │       ├── NotificationSettings.tsx
│   │       └── SecuritySettings.tsx
│   │
│   ├── patient/                       # 🆕 Patient-specific components
│   │   ├── dashboard/
│   │   │   ├── TodayOverview.tsx
│   │   │   ├── NextAppointment.tsx
│   │   │   └── WeeklyProgress.tsx
│   │   │
│   │   ├── meal-plan/
│   │   │   ├── DailyView.tsx
│   │   │   ├── MealCard.tsx
│   │   │   └── NutritionSummary.tsx
│   │   │
│   │   ├── progress/
│   │   │   ├── WeightChart.tsx
│   │   │   ├── MeasurementsTable.tsx
│   │   │   └── PhotoTimeline.tsx
│   │   │
│   │   └── profile/
│   │       ├── PersonalInfo.tsx
│   │       └── Goals.tsx
│   │
│   └── shared/                        # ♻️ Reusable across both areas
│       ├── AnimatedCard.tsx
│       ├── AnimatedButton.tsx
│       ├── StatCard.tsx
│       ├── LoadingState.tsx
│       ├── ErrorBoundary.tsx
│       └── EmptyState.tsx
│
├── hooks/
│   ├── useNutritionistData.ts        # 🆕 Nutritionist queries
│   ├── usePatientData.ts             # 🆕 Patient queries
│   ├── useAnimations.ts              # 🆕 Motion animation hooks
│   ├── useMealPlans.ts               # 🆕 Meal plan operations
│   └── useAppointments.ts            # 🆕 Appointment operations
│
├── lib/
│   ├── motion-variants.ts            # 🆕 Centralized Motion variants
│   ├── supabase-queries.ts           # 🆕 Query helpers
│   └── animation-utils.ts            # 🆕 Animation utilities
│
├── pages/
│   # Nutritionist Pages
│   ├── Dashboard.tsx                 # 🔄 Migrate to ModernLayout
│   ├── Agenda.tsx                    # 🔄 Migrate to ModernLayout
│   ├── Patients.tsx                  # 🔄 Migrate to ModernLayout
│   ├── PatientDetail.tsx             # 🔄 Migrate to ModernLayout
│   ├── Biblioteca.tsx                # 🆕 Create from scratch
│   ├── Financeiro.tsx                # 🆕 Create from scratch
│   ├── Profile.tsx                   # 🔄 Migrate to ModernLayout
│   │
│   # Patient Pages
│   ├── PatientPortal.tsx             # 🔄 Migrate to PatientLayout
│   ├── PatientMealPlan.tsx           # 🔄 Migrate to PatientLayout
│   ├── PatientProgress.tsx           # 🆕 Create from scratch
│   └── PatientProfile.tsx            # 🆕 Create from scratch
│
└── tests/
    └── e2e/
        ├── nutritionist/
        │   ├── dashboard.spec.ts
        │   ├── patients.spec.ts
        │   ├── agenda.spec.ts
        │   └── meal-plans.spec.ts
        │
        └── patient/
            ├── portal.spec.ts
            ├── meal-plan.spec.ts
            └── progress.spec.ts
```

---

## Components Design

### 1. Layout Components

#### ModernLayout (Existing - Enhanced)
**Purpose:** Main wrapper for nutritionist area  
**Features:**
- Green fixed sidebar with navigation
- Header with search, notifications, avatar
- Main content area with animations
- Error boundary wrapper

**Props:**
```typescript
interface ModernLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}
```

#### PatientLayout (New)
**Purpose:** Main wrapper for patient portal  
**Features:**
- Blue/teal color scheme (softer than nutritionist)
- Simplified sidebar (fewer options)
- Mobile-first responsive design
- Quick access to daily meal plan

**Props:**
```typescript
interface PatientLayoutProps {
  children: ReactNode;
  patientId: string;
  showSidebar?: boolean;
}
```

### 2. Shared Components

#### AnimatedCard
**Purpose:** Reusable card with Motion animations  
**Animations:**
- Entry: fade + slide up + scale (spring)
- Hover: lift + scale + shadow glow
- Tap: scale down feedback

**Props:**
```typescript
interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  whileHover?: MotionProps['whileHover'];
  onClick?: () => void;
  className?: string;
}
```

#### StatCard
**Purpose:** Statistics display with icon and value  
**Animations:**
- Icon: shake rotation on hover
- Value: scale bounce on entry
- Badge: pulse effect

**Props:**
```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'emerald' | 'blue' | 'purple' | 'amber';
}
```

#### LoadingState
**Purpose:** Skeleton loading with animations  
**Features:**
- Shimmer effect
- Pulse animation
- Matches layout structure

**Props:**
```typescript
interface LoadingStateProps {
  type: 'card' | 'table' | 'chart' | 'list';
  count?: number;
}
```

### 3. Motion Variants Library

Centralized in `lib/motion-variants.ts`:

```typescript
// Entry animations
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

// Hover animations
export const liftHover = {
  scale: 1.05,
  y: -5,
  transition: { duration: 0.2 }
};

export const glowHover = {
  boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.1)'
};

// Stagger animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Spring configs
export const springBounce = {
  type: 'spring',
  stiffness: 260,
  damping: 20
};
```

---

## Data Layer

### Supabase Hooks

#### useNutritionistData
```typescript
export function useNutritionistData() {
  const { user } = useAuth();
  
  const { data: profile } = useQuery({
    queryKey: ['nutritionist-profile', user?.id],
    queryFn: () => fetchNutritionistProfile(user!.id)
  });
  
  const { data: patients } = useQuery({
    queryKey: ['patients', profile?.id],
    queryFn: () => fetchPatients(profile!.id)
  });
  
  const { data: appointments } = useQuery({
    queryKey: ['appointments', profile?.id],
    queryFn: () => fetchAppointments(profile!.id)
  });
  
  return { profile, patients, appointments };
}
```

#### usePatientData
```typescript
export function usePatientData(patientId: string) {
  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => fetchPatient(patientId)
  });
  
  const { data: mealPlan } = useQuery({
    queryKey: ['meal-plan', patientId],
    queryFn: () => fetchCurrentMealPlan(patientId)
  });
  
  const { data: progress } = useQuery({
    queryKey: ['progress', patientId],
    queryFn: () => fetchProgressData(patientId)
  });
  
  return { patient, mealPlan, progress };
}
```

### Query Helpers

Centralized in `lib/supabase-queries.ts`:

```typescript
// Nutritionist queries
export async function fetchNutritionistProfile(userId: string)
export async function fetchPatients(nutritionistId: string)
export async function fetchAppointments(nutritionistId: string)
export async function fetchFinancialRecords(nutritionistId: string)

// Patient queries
export async function fetchPatient(patientId: string)
export async function fetchCurrentMealPlan(patientId: string)
export async function fetchProgressData(patientId: string)
export async function fetchWaterLogs(patientId: string)

// Meal plan queries
export async function fetchMealPlanById(planId: string)
export async function createMealPlan(data: MealPlanData)
export async function updateMealPlan(planId: string, data: Partial<MealPlanData>)
export async function deleteMealPlan(planId: string)
```

---

## Module Specifications

### 1. Dashboard (Nutritionist)

**Current State:** Demo version exists with mock data  
**Migration Task:** Connect to Supabase, replace AppLayout

**Components:**
- 4 stat cards (animated entry, hover effects)
- Revenue chart (area chart with gradient)
- Weekly appointments chart (bar chart)
- Upcoming appointments panel (green gradient, animated list)

**Data Requirements:**
- Total patients count
- Monthly appointments count
- Monthly revenue sum
- Active patients count
- Next 5 appointments
- 6 months appointment data
- 7 days weekly data

**Animations:**
- Cards: stagger entry (0.1s delay each)
- Charts: fade + slide with 0.6s delay
- Appointments: slide from right with stagger
- Icons: shake rotation on hover
- Numbers: scale bounce on entry

### 2. Agenda

**Current State:** Demo version exists with calendar  
**Migration Task:** Connect to Supabase, add CRUD operations

**Components:**
- Full month calendar (31 days with animations)
- Today's appointments list
- Appointment status indicators
- New appointment modal

**Data Requirements:**
- All appointments for selected month
- Appointment statuses (confirmed, pending, completed)
- Patient names and contact info

**Animations:**
- Calendar days: cascade entry (0.01s each)
- Selected day: scale + background pulse
- Appointments: slide from left staggered
- Status dots: scale pulse loop
- Modal: fade + scale spring

### 3. Pacientes (Patients)

**Current State:** Demo version exists with table  
**Migration Task:** Connect to Supabase, add filters

**Components:**
- Stats cards (total, active, new, retention)
- Search bar with filters
- Patient table with sorting
- Patient detail modal

**Data Requirements:**
- All patients with pagination
- Patient goals, progress, status
- Contact information
- Last appointment date

**Animations:**
- Table rows: slide from left staggered
- Row hover: lift + tint + slide right
- Avatars: rotate 360° on hover
- Badges: pulse on hover
- Search bar: scale on focus

### 4. Biblioteca (Plans Library) - NEW

**Features:**
- Grid of meal plan templates
- Preview cards with nutrition summary
- Filter by goal/restrictions
- Create new plan modal
- Duplicate/Edit/Delete actions

**Components:**
- `PlanLibrary`: Main grid container
- `PlanCard`: Individual plan preview
- `PlanEditor`: Full-screen editor
- `MealBuilder`: Drag & drop meal creator
- `NutritionCalculator`: Auto-calculate macros

**Data Requirements:**
- All meal plans for nutritionist
- Food database (TACO)
- Custom foods/recipes
- Plan templates

**Animations:**
- Grid: stagger entry
- Cards: lift + shadow on hover
- Editor: slide from right
- Drag & drop: smooth transitions
- Save: success animation

### 5. Financeiro (Financial) - NEW

**Features:**
- Revenue vs expenses chart
- Transaction timeline
- Monthly/yearly comparison
- Export reports (PDF)
- Add income/expense modal

**Components:**
- `FinancialDashboard`: Overview
- `RevenueChart`: Line chart
- `ExpenseChart`: Pie chart
- `TransactionList`: Filterable list
- `AddTransactionModal`: Form

**Data Requirements:**
- Financial records (income, expenses)
- Categories and tags
- Date ranges for filtering

**Animations:**
- Charts: animate on data change
- Timeline: scroll-triggered animations
- Add button: pulse + rotate
- Success toast: slide from top

### 6. Perfil (Profile) - NEW

**Features:**
- Personal information form
- CRN validation
- Profile photo upload
- Notification preferences
- Security settings (password change)

**Components:**
- `ProfileForm`: Personal data
- `NotificationSettings`: Toggles
- `SecuritySettings`: Password form
- `PhotoUpload`: Drag & drop

**Data Requirements:**
- Nutritionist profile data
- Preferences (notifications, email)

**Animations:**
- Form fields: fade in stagger
- Save button: loading spinner
- Success: confetti + toast
- Upload: progress bar animation

### 7. Suporte (Support) - NEW

**Features:**
- FAQ accordion
- Contact form
- Live chat (future)
- Knowledge base links
- System status

**Components:**
- `FAQAccordion`: Animated expand/collapse
- `ContactForm`: With validation
- `StatusIndicator`: Real-time status

**Data Requirements:**
- FAQ content (static or from CMS)
- Support tickets

**Animations:**
- Accordion: smooth height transition
- Form submit: loading state
- Success: checkmark animation

---

## Patient Portal Design

### PatientLayout Specifications

**Color Scheme:**
- Primary: Blue #3b82f6 (friendlier than green)
- Secondary: Teal #0d9488
- Background: Light gray #f8fafc
- Accent: Purple #a855f7 (for progress)

**Sidebar:**
- Simplified navigation (5 items vs 7)
- Larger touch targets (mobile-first)
- Icons with labels
- Patient name/photo at top

**Navigation:**
```
- 🏠 Início (Dashboard)
- 🍽️ Cardápio
- 📝 Registro
- 📊 Progresso
- 👤 Perfil
```

### Patient Modules

#### 1. Patient Dashboard

**Features:**
- Today's summary (calories, water, steps)
- Next meal preview
- Upcoming appointment
- Weekly progress chart

**Components:**
- `TodayOverview`: Cards with stats
- `NextMeal`: Card with meal details
- `AppointmentCard`: Next consultation info
- `WeeklyChart`: Mini line chart

**Animations:**
- Cards: stagger entry
- Progress bar: animate width
- Meal card: hover lift

#### 2. Patient Meal Plan

**Features:**
- Daily view (breakfast, lunch, dinner, snacks)
- Nutrition totals (calories, protein, carbs, fat)
- Shopping list generator
- Meal swap suggestions

**Components:**
- `DailyView`: Meal cards by time
- `MealCard`: Recipe details, ingredients
- `NutritionSummary`: Circular progress
- `ShoppingList`: Checkbox list

**Animations:**
- Meals: fade in stagger by time
- Expand meal: height transition
- Check item: scale + strikethrough
- Progress rings: animated stroke

#### 3. Patient Log (Registro)

**Features:**
- Quick log meals consumed
- Water intake tracker
- Photo upload (optional)
- Notes field

**Components:**
- `QuickLog`: Simple form
- `WaterTracker`: Animated glasses
- `PhotoUpload`: Drag & drop
- `NotesField`: Textarea

**Animations:**
- Water glasses: fill animation
- Photo upload: fade in
- Save: success ripple

#### 4. Patient Progress

**Features:**
- Weight chart over time
- Body measurements table
- Photo timeline
- Goal progress indicators

**Components:**
- `WeightChart`: Line chart
- `MeasurementsTable`: Editable table
- `PhotoTimeline`: Grid with dates
- `GoalProgress`: Progress bars

**Animations:**
- Chart: animate line draw
- Photos: masonry grid load
- Progress bars: width animation
- Milestones: celebrate animations

#### 5. Patient Profile

**Features:**
- Personal information
- Goal and restrictions
- Contact preferences
- Logout

**Components:**
- `PersonalInfo`: Read-only (mostly)
- `Goals`: Display current goal
- `ContactPrefs`: Email/SMS toggles

**Animations:**
- Simple fades
- Logout: slide out

---

## Testing Strategy

### E2E Tests (Playwright)

#### Test Structure
```
tests/e2e/
├── nutritionist/
│   ├── auth.spec.ts              # Login, logout
│   ├── dashboard.spec.ts         # Stats, charts load
│   ├── patients.spec.ts          # CRUD patients
│   ├── agenda.spec.ts            # CRUD appointments
│   ├── meal-plans.spec.ts        # Create/edit plans
│   └── financial.spec.ts         # Add transactions
│
├── patient/
│   ├── auth.spec.ts              # Patient login
│   ├── portal.spec.ts            # Dashboard loads
│   ├── meal-plan.spec.ts         # View meals
│   ├── log.spec.ts               # Log consumption
│   └── progress.spec.ts          # Charts load
│
└── shared/
    ├── navigation.spec.ts        # Sidebar navigation
    ├── animations.spec.ts        # Motion animations work
    └── responsive.spec.ts        # Mobile/desktop views
```

#### Critical Test Cases

**Nutritionist:**
1. Login → Dashboard loads with stats
2. Navigate to Patients → Table renders
3. Create new patient → Form validation
4. Schedule appointment → Calendar updates
5. Generate meal plan → Plan saves
6. Add financial record → Chart updates
7. Logout → Redirects to login

**Patient:**
1. Login → Portal dashboard loads
2. View meal plan → All meals visible
3. Log meal → Updates progress
4. Check progress → Charts render
5. Upload photo → Photo appears
6. Logout → Redirects to login

**Animation Tests:**
1. Cards animate on entry
2. Hover effects work
3. No janky animations (60fps)
4. Mobile touch gestures work

#### Test Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:8083',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
  ],
});
```

### Visual Regression Tests

Use Playwright's screenshot comparison:
- Capture baseline screenshots
- Compare on each test run
- Flag visual differences > 5%

---

## Migration Plan

### Phase 1: Setup & Infrastructure (Agent 1)
**Duration:** 1 hour  
**Tasks:**
1. Create folder structure
2. Setup motion-variants.ts
3. Create shared components (AnimatedCard, StatCard, LoadingState)
4. Setup Supabase hooks (useNutritionistData, usePatientData)
5. Configure Playwright

### Phase 2: Nutritionist Modules (Agents 2-5, Parallel)
**Duration:** 2 hours  
**Agent 2: Dashboard + Agenda**
- Migrate Dashboard.tsx
- Migrate Agenda.tsx
- Connect to Supabase
- Add animations

**Agent 3: Pacientes + Biblioteca**
- Migrate Patients.tsx
- Create Biblioteca.tsx from scratch
- Add filters, search
- Animations

**Agent 4: Financeiro + Perfil**
- Create Financeiro.tsx from scratch
- Migrate Profile.tsx
- Charts, forms
- Animations

**Agent 5: Suporte**
- Create Suporte.tsx from scratch
- FAQ accordion
- Contact form
- Animations

### Phase 3: Patient Portal (Agent 6, Parallel with Phase 2)
**Duration:** 2 hours  
**Tasks:**
1. Create PatientLayout + PatientSidebar
2. Migrate PatientPortal.tsx
3. Migrate PatientMealPlan.tsx
4. Create PatientProgress.tsx
5. Create PatientProfile.tsx
6. All animations

### Phase 4: Testing (Agent 7)
**Duration:** 1 hour  
**Tasks:**
1. Write E2E tests
2. Run tests in CI
3. Fix failing tests
4. Visual regression tests
5. Performance audit

### Phase 5: Cleanup & Deploy (Agent 8)
**Duration:** 30 minutes  
**Tasks:**
1. Remove `/demo-*` routes
2. Remove old AppLayout files (backup first)
3. Update routing
4. Git commit with descriptive message
5. Create PR with screenshots
6. Deploy to production

---

## Deployment Strategy

### Pre-Deployment Checklist
- [ ] All E2E tests passing
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] All animations smooth (60fps)
- [ ] Mobile responsive works
- [ ] Supabase queries optimized
- [ ] Error boundaries in place

### Deployment Steps
1. Merge to `main` branch
2. Vercel auto-deploys (or manual trigger)
3. Monitor Sentry for errors
4. Test production URL manually
5. Announce to team

### Rollback Plan
If critical issues found:
1. Git revert merge commit
2. Deploy previous version
3. Fix issues in separate branch
4. Re-test and re-deploy

**Rollback Time:** < 5 minutes

---

## Risk Mitigation

### Identified Risks

**Risk 1: Animation Performance Issues**
- **Mitigation:** Use GPU-accelerated properties only (transform, opacity)
- **Fallback:** Disable animations on low-end devices
- **Test:** Profile with Chrome DevTools

**Risk 2: Supabase Query Slowness**
- **Mitigation:** Add loading states, optimize queries, use indexes
- **Fallback:** Cache results with React Query
- **Test:** Network throttling in tests

**Risk 3: Breaking Changes**
- **Mitigation:** Comprehensive E2E tests before deploy
- **Fallback:** Git rollback plan
- **Test:** Test every critical user flow

**Risk 4: Mobile Responsiveness Issues**
- **Mitigation:** Mobile-first CSS, test on real devices
- **Fallback:** Show desktop message on small screens (temporary)
- **Test:** Playwright mobile emulation

---

## Success Metrics

### Performance Metrics
- **Lighthouse Performance:** > 90
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Animation FPS:** 60 (no drops)

### User Experience Metrics
- **Bounce Rate:** < 10%
- **Session Duration:** > 5 minutes
- **Pages per Session:** > 3
- **Error Rate:** < 0.1%

### Code Quality Metrics
- **Test Coverage:** > 80%
- **E2E Tests Passing:** 100%
- **Console Errors:** 0
- **TypeScript Errors:** 0

---

## Timeline

**Total Estimated Time:** 6-7 hours with parallel agents

| Phase | Duration | Agents | Status |
|-------|----------|--------|--------|
| Setup & Infrastructure | 1h | 1 | ⏳ Pending |
| Nutritionist Modules | 2h | 4 (parallel) | ⏳ Pending |
| Patient Portal | 2h | 1 (parallel) | ⏳ Pending |
| Testing | 1h | 1 | ⏳ Pending |
| Cleanup & Deploy | 0.5h | 1 | ⏳ Pending |

**Target Completion:** Same day (today)

---

## Appendix

### Animation Types Reference

| Type | Use Case | Properties | Duration |
|------|----------|------------|----------|
| fadeInUp | Card entry | opacity, y | 0.3s |
| fadeInScale | Modal entry | opacity, scale | 0.2s |
| slideInLeft | List items | opacity, x | 0.3s |
| liftHover | Card hover | y, scale | 0.2s |
| shakeRotate | Icon hover | rotate | 0.5s |
| pulse | Indicators | scale, opacity | 2s loop |
| spring | Buttons | scale | 0.3s |
| stagger | Lists | delay | 0.1s each |

### Color Palette

**Nutritionist:**
- Primary: #518C5B (Sage Green)
- Secondary: #C4764A (Terracotta)
- Accent: #10b981 (Emerald)
- Background: #FAF8F5 (Warm Off-white)

**Patient:**
- Primary: #3b82f6 (Blue)
- Secondary: #0d9488 (Teal)
- Accent: #a855f7 (Purple)
- Background: #f8fafc (Light Gray)

### Dependencies

**Existing:**
- framer-motion: ^12.23.26
- @supabase/supabase-js: 2.39.0
- @tanstack/react-query: ^5.83.0
- recharts: ^2.15.4
- lucide-react: ^0.462.0

**New:**
- @playwright/test: ^1.40.0
- @testing-library/react: ^16.3.3

---

**End of Specification**

This spec is approved and ready for implementation planning.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
