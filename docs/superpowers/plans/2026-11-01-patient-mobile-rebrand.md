# Patient Mobile Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a hybrid sage/teal visual identity across all 13 patient-mobile components, updating CSS tokens, typography, and per-component styling to match the approved design spec.

**Architecture:** Token-first approach: update CSS custom properties in `index.css` and global typography rules, then propagate changes through each component file. No new dependencies; all changes are CSS/class-level edits against existing Tailwind tokens and inline HSL values.

**Tech Stack:** React, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, canvas-confetti

**Spec:** `docs/superpowers/specs/2026-11-01-patient-mobile-rebrand-design.md`

## Global Constraints

- Paleta híbrida: sage como base neutra, teal (`hsl(168 76% 36%)`) como accent principal
- Playfair Display apenas no hero greeting do Dashboard; todo o resto usa Outfit
- Cards mantêm `border border-border/60 rounded-2xl`, sem sombra pesada
- Dark mode deve funcionar com os novos tokens em `.dark`
- Nenhum valor hardcoded `hsl(168, 100%, 39%)` pode permanecer após a tarefa correspondente
- Build deve passar limpo após cada tarefa
- Confetti e charts devem usar cores da nova paleta

## Review Focus

- Tokens CSS light/dark inconsistentes entre si → verificar tabela §1.1 do spec contra valores escritos
- Playfair vazando para headings fora do hero → inspecionar render de h1-h6 em telas que não são Dashboard
- Cores hardcoded antigas (`hsl(168, 100%, 39%)`) sobrevivendo em componentes → grep pós-tarefa
- Dark mode com contraste insuficiente nos novos tokens → testar toggle de tema
- Chart/Recharts usando cor antiga → verificar gradiente e stroke em PatientEvolucao

---

### Task 1: Update CSS Design Tokens

**Files:**
- Modify: `src/index.css:8-51` (light mode tokens)
- Modify: `src/index.css:53-94` (dark mode tokens)
- Modify: `src/index.css:105-108` (global heading font-family rule)

**Interfaces:**
- Consumes: spec §1.1 token table (light + dark), spec §1.2 typography rule
- Produces: updated CSS custom properties consumed by all downstream components via `hsl(var(--*))`; new `.font-display` utility class for Playfair usage in hero

- [ ] **Step 1: Update light mode tokens in `src/index.css`**

Replace values in `:root, .light` block (lines 8-51) with spec §1.1 light mode values:
- `--primary`: `168 76% 36%`
- `--secondary`: `155 40% 45%`
- `--accent`: `28 90% 52%`
- `--background`: `150 15% 97%`
- `--foreground`: `200 15% 15%`
- `--muted`: `150 10% 94%`
- `--muted-foreground`: `200 8% 50%`
- `--border`: `150 10% 88%`
- `--info`: `205 85% 55%`
- `--success`: `155 70% 42%`
- `--nf-accent-teal`: `168 76% 36%`
- `--nf-accent-purple`: `280 55% 58%`
- `--nf-accent-orange`: `28 90% 52%`
- Keep `--card`, `--popover`, `--destructive`, `--ring`, `--radius`, sidebar tokens, glass tokens unchanged unless listed above

- [ ] **Step 2: Update dark mode tokens in `src/index.css`**

Replace values in `.dark` block (lines 53-94) with spec §1.1 dark mode values:
- `--primary`: `168 76% 45%`
- `--secondary`: `155 40% 50%`
- `--accent`: `28 90% 58%`
- `--background`: `200 12% 8%`
- `--foreground`: `150 10% 95%`
- `--card`: `200 10% 12%`
- `--muted`: `200 8% 18%`
- `--muted-foreground`: `200 8% 55%`
- `--border`: `200 8% 20%`
- Update `--nf-*` dark aliases to match their light counterparts' hue/saturation with adjusted lightness per spec
- Keep `--info`, `--success` dark values consistent with light mode hues at appropriate dark-mode lightness

- [ ] **Step 3: Update global heading font rule and add `.font-display` utility**

In `src/index.css` lines 105-108, change:
```css
h1, h2, h3, h4, h5, h6 {
  font-family: 'Outfit', sans-serif;
}
```
Add after the heading rule:
```css
.font-display {
  font-family: 'Playfair Display', serif;
}
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: clean build, no errors

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "style: update CSS design tokens to hybrid sage/teal palette"
```

---

### Task 2: Update PatientDashboard Hero and Stats

**Files:**
- Modify: `src/components/patient-mobile/PatientDashboard.tsx:138-157` (hero card)
- Modify: `src/components/patient-mobile/PatientDashboard.tsx:166-178` (calories stat card icon wrap)
- Modify: `src/components/patient-mobile/PatientDashboard.tsx:209` (water badge)

**Interfaces:**
- Consumes: `.font-display` utility from Task 1, updated `--primary`, `--accent`, `--info` tokens
- Produces: visually updated Dashboard hero with Playfair greeting, teal→sage gradient, corrected icon wraps and badge colors

- [ ] **Step 1: Update hero card gradient and typography**

In `PatientDashboard.tsx` line 142, change gradient from `from-primary to-secondary` to `from-primary to-[hsl(155,40%,45%)]`.
On line 150, add `font-display` class to the `<h1>` element so the greeting renders in Playfair Display.
Lines 146-148 (date) and 153-155 (subtitle) remain Outfit (no serif class).

- [ ] **Step 2: Update calories stat card icon wrap**

In `PatientDashboard.tsx` line 168, change `bg-accent/10` to remain as-is (accent = orange for calories differentiation per spec §2.1). Verify `text-accent` on line 169 matches.

- [ ] **Step 3: Update water tracker badge color**

In `PatientDashboard.tsx` line 209, change `bg-blue-50 text-blue-600` to `bg-info/10 text-info` to use the semantic info token instead of hardcoded blue.

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: clean build, no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/patient-mobile/PatientDashboard.tsx
git commit -m "style: update Dashboard hero gradient, typography, and badge colors"
```

---

### Task 3: Update PatientBottomNav Colors

**Files:**
- Modify: `src/components/patient-mobile/PatientBottomNav.tsx:44-48` (center FAB button)

**Interfaces:**
- Consumes: updated `--primary` token from Task 1
- Produces: bottom nav center button using teal primary instead of accent orange

- [ ] **Step 1: Update center FAB button color**

In `PatientBottomNav.tsx` line 46, change `bg-accent text-accent-foreground` to `bg-primary text-primary-foreground`.
Line 47 active state `scale-105 shadow-accent/30` changes to `shadow-primary/30`.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: clean build, no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/patient-mobile/PatientBottomNav.tsx
git commit -m "style: update BottomNav center FAB to primary teal"
```

---

### Task 4: Update CircularWaterTracker Confetti Colors

**Files:**
- Modify: `src/components/patient-mobile/CircularWaterTracker.tsx:29-34` (confetti colors array)

**Interfaces:**
- Consumes: spec §2.3 confetti color palette
- Produces: confetti animation using teal tones instead of old green palette

- [ ] **Step 1: Update confetti colors array**

In `CircularWaterTracker.tsx` lines 30-33, replace the `colors` array:
```typescript
colors: ['#0D9488', '#14B8A6', '#5EEAD4', '#2DD4BF'],
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: clean build, no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/patient-mobile/CircularWaterTracker.tsx
git commit -m "style: update water tracker confetti to teal palette"
```

---

### Task 5: Update QuickActions FAB Color

**Files:**
- Modify: `src/components/patient-mobile/QuickActions.tsx:100-101` (main FAB button classes)

**Interfaces:**
- Consumes: updated `--primary` token from Task 1
- Produces: main FAB using teal primary instead of accent orange

- [ ] **Step 1: Update main FAB button color**

In `QuickActions.tsx` line 101, change `bg-accent text-accent-foreground` to `bg-primary text-primary-foreground`.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: clean build, no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/patient-mobile/QuickActions.tsx
git commit -m "style: update QuickActions FAB to primary teal"
```

---

### Task 6: Update PatientPlano Meal Accent Map

**Files:**
- Modify: `src/components/patient-mobile/PatientPlano.tsx:72-87` (mealAccent record)

**Interfaces:**
- Consumes: spec §2.8 meal accent color mapping, updated tokens from Task 1
- Produces: meal type icons using correct palette colors per meal category

- [ ] **Step 1: Update mealAccent record**

In `PatientPlano.tsx` lines 72-87, replace the `mealAccent` record values:
```typescript
const mealAccent: Record<string, string> = {
  'Café da Manhã': 'text-accent bg-accent/10',
  'Lanche da Manhã': 'text-nf-orange bg-nf-orange/10',
  'Almoço': 'text-primary bg-primary/10',
  'Lanche da Tarde': 'text-[hsl(280,55%,58%)] bg-[hsl(280,55%,58%)]/10',
  'Jantar': 'text-secondary bg-secondary/10',
  'Ceia': 'text-muted-foreground bg-muted',
  cafe_da_manha: 'text-accent bg-accent/10',
  breakfast: 'text-accent bg-accent/10',
  almoco: 'text-primary bg-primary/10',
  lunch: 'text-primary bg-primary/10',
  lanche: 'text-[hsl(280,55%,58%)] bg-[hsl(280,55%,58%)]/10',
  snack: 'text-[hsl(280,55%,58%)] bg-[hsl(280,55%,58%)]/10',
  jantar: 'text-secondary bg-secondary/10',
  dinner: 'text-secondary bg-secondary/10',
};
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: clean build, no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/patient-mobile/PatientPlano.tsx
git commit -m "style: update PatientPlano meal accent colors to new palette"
```

---

### Task 7: Update PatientRegistro Typography Weight

**Files:**
- Modify: `src/components/patient-mobile/PatientRegistro.tsx:246` (header h1 class)

**Interfaces:**
- Consumes: spec §2.9 typography weight change
- Produces: page header using `font-semibold` (Outfit 600) instead of `font-bold`

- [ ] **Step 1: Update header font weight**

In `PatientRegistro.tsx` line 246, change `text-2xl font-bold text-foreground` to `text-xl font-semibold text-foreground`.

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: clean build, no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/patient-mobile/PatientRegistro.tsx
git commit -m "style: update PatientRegistro header to semibold Outfit"
```

---

### Task 8: Update PatientEvolucao Chart Colors

**Files:**
- Modify: `src/components/patient-mobile/PatientEvolucao.tsx:156-159` (chart gradient stops)
- Modify: `src/components/patient-mobile/PatientEvolucao.tsx:177-181` (Area stroke and dot colors)

**Interfaces:**
- Consumes: spec §2.10 chart color values, new teal `hsl(168, 76%, 36%)`
- Produces: weight chart using updated teal instead of old hardcoded value

- [ ] **Step 1: Update chart gradient stop colors**

In `PatientEvolucao.tsx` lines 157-158, replace both `stopColor` values:
```tsx
<stop offset="5%" stopColor="hsl(168, 76%, 36%)" stopOpacity={0.25} />
<stop offset="95%" stopColor="hsl(168, 76%, 36%)" stopOpacity={0} />
```

- [ ] **Step 2: Update Area stroke and dot colors**

In `PatientEvolucao.tsx` lines 177-181, replace all three `hsl(168, 100%, 39%)` occurrences with `hsl(168, 76%, 36%)`:
- Line 177: `stroke="hsl(168, 76%, 36%)"`
- Line 180: `fill: 'hsl(168, 76%, 36%)'`
- Line 181: `fill: 'hsl(168, 76%, 36%)'`

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: clean build, no errors

- [ ] **Step 4: Grep for remaining old hardcoded color**

Run: `grep -rn "hsl(168, 100%, 39%)" src/`
Expected: no matches (all instances replaced)

- [ ] **Step 5: Commit**

```bash
git add src/components/patient-mobile/PatientEvolucao.tsx
git commit -m "style: update Evolucao chart colors to new teal palette"
```

---

### Task 9: Final Verification and Cleanup

**Files:**
- Read-only verification across all 13 component files

**Interfaces:**
- Consumes: all prior tasks' outputs
- Produces: confirmed spec compliance, clean build, no leftover old values

- [ ] **Step 1: Grep for any remaining old primary color**

Run: `grep -rn "hsl(168, 100%, 39%)" src/`
Expected: zero matches

- [ ] **Step 2: Grep for any remaining hardcoded blue-50/blue-600 in Dashboard**

Run: `grep -n "blue-50\|blue-600" src/components/patient-mobile/PatientDashboard.tsx`
Expected: zero matches (replaced with info token in Task 2)

- [ ] **Step 3: Verify Playfair is only in Dashboard hero**

Run: `grep -rn "font-display\|font-serif\|Playfair" src/components/patient-mobile/`
Expected: only `PatientDashboard.tsx` should contain `font-display` or `font-serif`

- [ ] **Step 4: Full build verification**

Run: `npm run build`
Expected: clean build under 30 seconds, no warnings related to changed files

- [ ] **Step 5: Commit any remaining fixes**

If steps 1-3 found issues that were fixed inline, commit:
```bash
git add -A
git commit -m "fix: cleanup remaining old color values from rebrand"
```
If no fixes needed, skip this step.