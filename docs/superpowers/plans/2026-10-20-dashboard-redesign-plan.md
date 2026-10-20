# Dashboard Redesign Implementation Plan

## Goal
Redesign the NutriFlow dashboard to match the "Med care" layout structure while retaining the NutriFlow brand identity (Sage Green/Terracotta palette), ensuring full responsiveness, and adding rich motion design.

## Design Specifications

### 1. Color Palette (Existing)
- **Primary:** Sage Green (`#518C5B`, `hsl(143 25% 42%)`)
- **Secondary:** Terracotta (`#C4764A`, `hsl(16 55% 58%)`)
- **Background:** Warm Off-White (`#FAF8F5`, `hsl(40 33% 97%)`)
- **Surface:** White (`#FFFFFF`)
- **Text:** Warm Dark Brown (`#342E28`)

### 2. Layout Structure (CSS Grid)
- **Desktop:**
  - Sidebar: Fixed left, slim (80px) or compact (240px). Based on image, slim icon rail is preferred.
  - Main Content:
    - Top Row: Search/Notifications (Full width or aligned right).
    - Grid: 3 Columns.
      - Col 1-2 (Left): Hero Banner, Stats Row (3 cards), Bottom Row (Scheduled Events + Plans Done).
      - Col 3 (Right): Profile Card, Calendar Widget.
- **Mobile:** Single column stack. Sidebar becomes bottom nav or hamburger.

### 3. Components to Build/Refactor

#### A. Layout & Navigation
- [ ] `src/components/layout/ModernLayout.tsx`: Update grid structure.
- [ ] `src/components/layout/ModernSidebar.tsx`: Redesign to slim icon rail with Sage Green gradient. Active state indicators.

#### B. Dashboard Widgets (New Components in `src/components/nutritionist/dashboard/`)
- [ ] `DashboardHero.tsx`: Greeting, Date, Abstract medical/nutrition illustration (SVG/CSS).
- [ ] `ProfileCard.tsx`: Avatar, Name, Role, Quick Stats (CRN, Specialty).
- [ ] `MiniCalendar.tsx`: Weekly strip calendar with active day highlight.
- [ ] `StatCardRow.tsx`: Container for 3 mini stats (Presential, Online, Plans).
- [ ] `BusynessChart.tsx`: Circular progress chart (Recharts PieChart or custom SVG).
- [ ] `PlansProgress.tsx`: List of linear progress bars (Consultations, Analysis, Meetings).
- [ ] `AgendaList.tsx`: Vertical list of upcoming appointments with time dots.

#### C. Page Integration
- [ ] `src/pages/ModernDashboard.tsx`: Assemble all widgets into the new grid layout. Fetch data.

### 4. Motion Design (Framer Motion)
- **Entrance:** Staggered fade-in + slide-up for all widgets.
- **Hover:** Scale up slightly (1.02) + shadow increase for cards.
- **Sidebar:** Spring animation for active indicator.
- **Charts:** Animated path drawing for lines/bars.

### 5. Execution Strategy (Parallel Agents)
1.  **Agent 1 (Layout & Sidebar):** Refactor `ModernLayout` and `ModernSidebar`.
2.  **Agent 2 (Hero & Profile):** Build `DashboardHero` and `ProfileCard`.
3.  **Agent 3 (Stats & Calendar):** Build `StatCardRow`, `MiniCalendar`.
4.  **Agent 4 (Charts & Lists):** Build `BusynessChart`, `PlansProgress`, `AgendaList`.
5.  **Agent 5 (Integration):** Assemble `ModernDashboard.tsx` and wire data.

## Validation
- Run `npm run build`.
- Use `agent-browser` to verify visual fidelity against the reference image (structure-wise) and palette correctness.
- Check responsiveness at 375px, 768px, 1440px.