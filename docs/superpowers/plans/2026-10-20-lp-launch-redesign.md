# NutriFlow Launch LP Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the NutriFlow landing page as a launch-focused LP with scroll-driven CSS motion, NutriFlow palette, and zero social proof.

**Architecture:** Single-page React component (`LandingPage.tsx`) rewritten from scratch using existing shadcn/ui primitives and Tailwind CSS tokens. All motion is CSS-only via `scroll-timeline`, `view-timeline`, and `@keyframes` — no JS animation libraries. New CSS utility classes in `index.css` provide the motion system. The existing design token system (HSL variables) is extended with NutriFlow launch-specific colors.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, tailwindcss-animate, CSS Scroll-Driven Animations, Vite, React Router

**Spec:** `docs/superpowers/specs/2026-10-20-lp-launch-redesign-design.md`

## Global Constraints

- Paleta NutriFlow: bg `#FAFAF9`, text `#1A1F2E`, teal `#1CBFA5`, coral `#EF7B66`, border `#E8E6E1`
- Zero prova social: sem depoimentos, sem contagens, sem logos parceiros
- Linguagem de lançamento apenas: "Lançamento exclusivo", "Disponível agora", "Seja um dos primeiros"
- Motion CSS-only: zero JS runtime para animações; apenas `transform` e `opacity` animados
- `prefers-reduced-motion` deve desativar todas as animações globalmente
- Mobile-first breakpoints: 640 / 768 / 1024 / 1280px
- Touch targets ≥ 44px em todos os elementos interativos
- Font: Headlines = Playfair Display (serif), Corpo = Outfit (sans) — já configurado no projeto
- Lighthouse Performance ≥ 95, Accessibility ≥ 95, CLS = 0

## Review Focus

1. Browsers sem suporte a `scroll-timeline` (Firefox < 130, Safari < 18) devem renderizar conteúdo visível sem animação — testar fallback
2. `prefers-reduced-motion: reduce` deve desativar TODAS as animações, não apenas algumas — testar globalmente
3. Contraste WCAG AA entre `#1CBFA5` (teal) e `#FAFAF9` (bg) é 2.8:1 — insuficiente para texto normal; usar teal apenas em ícones/badges grandes ou sobre fundo escuro
4. CLS = 0: elementos animados devem ter dimensões reservadas para evitar layout shift durante animação
5. Copy proibida: verificar ausência de "nutricionistas atendidos", "depoimentos", "parceiros" em todo o texto

---

### Task 1: Design Tokens & Motion System Foundation

**Files:**
- Modify: `src/index.css` (add NutriFlow launch tokens + scroll-timeline utilities + reduced-motion override)
- Modify: `tailwind.config.ts` (extend colors with nutriflow tokens)

**Interfaces:**
- Produces: CSS custom properties `--nf-bg-primary`, `--nf-bg-secondary`, `--nf-text-primary`, `--nf-text-secondary`, `--nf-accent-teal`, `--nf-accent-coral`, `--nf-border`
- Produces: Tailwind color tokens `nf-bg`, `nf-text`, `nf-teal`, `nf-coral`, `nf-border`
- Produces: CSS utility classes `.scroll-fade-up`, `.scroll-slide-left`, `.scroll-slide-right`, `.scroll-scale-in`, `.scroll-parallax-y`, `.animate-pulse-badge`
- Produces: `@media (prefers-reduced-motion: reduce)` override that sets `animation: none !important` on all `.scroll-*` and `.animate-*` classes

- [ ] **Step 1: Add NutriFlow launch CSS tokens to `src/index.css`**

Add inside `:root, .light` block, after existing tokens:

```css
/* NutriFlow Launch LP Tokens */
--nf-bg-primary: 40 20% 98%;       /* #FAFAF9 */
--nf-bg-secondary: 38 18% 96%;     /* #F5F4F1 */
--nf-text-primary: 222 25% 14%;    /* #1A1F2E */
--nf-text-secondary: 220 9% 46%;   /* #6B7280 */
--nf-accent-teal: 168 65% 43%;     /* #1CBFA5 */
--nf-accent-coral: 12 80% 67%;     /* #EF7B66 */
--nf-border: 35 15% 90%;           /* #E8E6E1 */
```

- [ ] **Step 2: Add scroll-driven animation utilities to `src/index.css`**

Add new `@layer utilities` block at end of file:

```css
/* ========================================
   SCROLL-DRIVEN MOTION SYSTEM (Approach A)
   ======================================== */

@supports (animation-timeline: view()) {
  .scroll-fade-up {
    animation: nfFadeUp linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }

  .scroll-slide-left {
    animation: nfSlideLeft linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 50%;
  }

  .scroll-slide-right {
    animation: nfSlideRight linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 50%;
  }

  .scroll-scale-in {
    animation: nfScaleIn linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }

  .scroll-parallax-y {
    animation: nfParallaxY linear both;
    animation-timeline: scroll();
    animation-range: 0% 100%;
  }

  .scroll-line-grow {
    animation: nfLineGrow linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 50%;
  }
}

/* Fallback for browsers without scroll-timeline support */
@supports not (animation-timeline: view()) {
  .scroll-fade-up,
  .scroll-slide-left,
  .scroll-slide-right,
  .scroll-scale-in {
    opacity: 1;
    transform: none;
  }
  .scroll-parallax-y {
    transform: none;
  }
  .scroll-line-grow {
    height: 100%;
  }
}

@keyframes nfFadeUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes nfSlideLeft {
  from { opacity: 0; transform: translateX(-60px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes nfSlideRight {
  from { opacity: 0; transform: translateX(60px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes nfScaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes nfParallaxY {
  from { transform: translateY(-30px); }
  to { transform: translateY(30px); }
}

@keyframes nfLineGrow {
  from { height: 0%; }
  to { height: 100%; }
}

@keyframes nfPulseBadge {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 hsl(var(--nf-accent-teal) / 0.4); }
  50% { opacity: 0.9; box-shadow: 0 0 0 8px hsl(var(--nf-accent-teal) / 0); }
}

.animate-pulse-badge {
  animation: nfPulseBadge 2s ease-in-out infinite;
}

/* Stagger delays for sequential reveals */
.scroll-stagger-1 { animation-delay: 0ms; }
.scroll-stagger-2 { animation-delay: 150ms; }
.scroll-stagger-3 { animation-delay: 300ms; }

/* Reduced motion: disable ALL animations */
@media (prefers-reduced-motion: reduce) {
  .scroll-fade-up,
  .scroll-slide-left,
  .scroll-slide-right,
  .scroll-scale-in,
  .scroll-parallax-y,
  .scroll-line-grow,
  .animate-pulse-badge,
  .animate-float,
  .animate-shimmer {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

- [ ] **Step 3: Extend `tailwind.config.ts` with NutriFlow color tokens**

Add inside `theme.extend.colors`:

```ts
nf: {
  bg: "hsl(var(--nf-bg-primary))",
  "bg-alt": "hsl(var(--nf-bg-secondary))",
  text: "hsl(var(--nf-text-primary))",
  "text-muted": "hsl(var(--nf-text-secondary))",
  teal: "hsl(var(--nf-accent-teal))",
  coral: "hsl(var(--nf-accent-coral))",
  border: "hsl(var(--nf-border))",
},
```

- [ ] **Step 4: Verify build succeeds**

Run: `npx tsc --noEmit && npm run build`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/index.css tailwind.config.ts
git commit -m "feat(lp): add NutriFlow launch design tokens and CSS scroll-driven motion system"
```

---

### Task 2: Header Component

**Files:**
- Create: `src/components/landing/LandingHeader.tsx`

**Interfaces:**
- Consumes: `Link` from react-router-dom, `Button` from @/components/ui/button, logo from @/assets/logo.png
- Consumes: CSS class `.scroll-fade-up` from Task 1
- Produces: `<LandingHeader />` — sticky header with blur, nav links, CTA

- [ ] **Step 1: Create `LandingHeader.tsx`**

Component structure:
- Sticky top-0 z-50 with `backdrop-blur-md bg-nf-bg/90 border-b border-nf-border/50`
- Logo (img + wordmark "NutriFlow" in serif font)
- Nav: "Recursos", "Como Funciona", "Planos" as anchor links (#recursos, #como-funciona, #planos)
- CTA: Button variant="outline" → "Entrar" linking to /auth
- Mobile: hamburger menu (simple toggle state)
- Motion: wrapper has `scroll-fade-up` class for initial load fade-in
- Border appears after scroll via CSS: use `@supports (animation-timeline: scroll())` with a separate class `.header-border-reveal` that transitions border-opacity from 0 to 1 based on scroll progress

- [ ] **Step 2: Verify header renders without console errors**

Run: `npm run dev` and navigate to `/`
Expected: Header visible, sticky, blur effect, nav links functional

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingHeader.tsx
git commit -m "feat(lp): add LandingHeader with sticky blur and scroll-driven border reveal"
```

---

### Task 3: Hero Section

**Files:**
- Create: `src/components/landing/HeroSection.tsx`

**Interfaces:**
- Consumes: `Button` from @/components/ui/button, `Link` from react-router-dom
- Consumes: CSS classes `.scroll-fade-up`, `.scroll-parallax-y`, `.animate-pulse-badge` from Task 1
- Produces: `<HeroSection />` — headline, subheadline, badge, dual CTAs, mockup

- [ ] **Step 1: Create `HeroSection.tsx`**

Component structure:
- Section with `bg-nf-bg py-32 md:py-40 overflow-hidden`
- Badge: `<span className="animate-pulse-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nf-teal/10 text-nf-teal text-sm font-semibold border border-nf-teal/30">🚀 Lançamento Exclusivo</span>`
- H1: "Cardápios inteligentes que se adaptam a cada paciente" — `font-serif text-4xl md:text-6xl font-bold text-nf-text leading-tight`
- Subheadline: "IA generativa + gestão clínica em uma plataforma unificada. Disponível agora." — `text-lg md:text-xl text-nf-text-muted max-w-2xl`
- CTAs: "Começar Grátis" (bg-nf-coral text-white) + "Ver Demo" (border-nf-teal text-nf-teal)
- Mockup: placeholder div with gradient background representing dashboard, wrapped in `.scroll-parallax-y` for parallax effect
- Text elements have `.scroll-fade-up` with stagger delays
- Reserve explicit height for mockup container to prevent CLS

- [ ] **Step 2: Verify hero renders with animations**

Run: `npm run dev` and navigate to `/`
Expected: Badge pulses, headline fades up on scroll, mockup has parallax, CTAs styled correctly

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/HeroSection.tsx
git commit -m "feat(lp): add HeroSection with scroll-driven fade-up and parallax mockup"
```

---

### Task 4: Value Props Section

**Files:**
- Create: `src/components/landing/ValuePropsSection.tsx`

**Interfaces:**
- Consumes: Lucide icons (Brain, Users, TrendingUp or similar)
- Consumes: CSS classes `.scroll-scale-in`, `.scroll-stagger-1/2/3` from Task 1
- Produces: `<ValuePropsSection />` — 3-card grid

- [ ] **Step 1: Create `ValuePropsSection.tsx`**

Component structure:
- Section with `id="recursos" bg-nf-bg-alt py-24 md:py-32`
- Grid: `grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6`
- 3 cards, each with:
  - Icon container: `w-12 h-12 rounded-xl bg-nf-teal/10 flex items-center justify-center text-nf-teal`
  - Title: `text-xl font-serif font-bold text-nf-text mt-4`
  - Description: `text-nf-text-muted mt-2 leading-relaxed`
- Card content:
  1. Brain icon — "IA Generativa Avançada" — "Gemini 2.5 gera cardápios personalizados em segundos, adaptados a objetivos e restrições alimentares."
  2. Users icon — "Gestão Clínica Unificada" — "Pacientes, agendamento e evolução em um só lugar. Sem planilhas, sem caos."
  3. TrendingUp icon — "Resultados Mensuráveis" — "Analytics em tempo real do progresso dos pacientes. Dados que impressionam."
- Each card wrapper has `.scroll-scale-in` + `.scroll-stagger-N`
- Cards have `organic-card p-8` styling (reuses existing utility)

- [ ] **Step 2: Verify cards render with staggered animation**

Run: `npm run dev`, scroll to section
Expected: Cards appear sequentially with scale-in effect, icons teal, copy correct

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/ValuePropsSection.tsx
git commit -m "feat(lp): add ValuePropsSection with 3 staggered scroll-scale-in cards"
```

---

### Task 5: How It Works (Timeline) Section

**Files:**
- Create: `src/components/landing/HowItWorksSection.tsx`

**Interfaces:**
- Consumes: CSS classes `.scroll-line-grow`, `.scroll-slide-left`, `.scroll-slide-right` from Task 1
- Produces: `<HowItWorksSection />` — vertical timeline with 3 stages

- [ ] **Step 1: Create `HowItWorksSection.tsx`**

Component structure:
- Section with `id="como-funciona" bg-nf-bg py-24 md:py-32`
- H2: "Como funciona" — centered, serif, `text-3xl md:text-5xl font-bold text-nf-text mb-16`
- Timeline container: relative, max-w-4xl mx-auto
- Vertical line: absolute left-6 (mobile) / left-1/2 (desktop), width 2px, bg-nf-teal, height 100%, with `.scroll-line-grow` class
- 3 stages, each with:
  - Number circle: `w-12 h-12 rounded-full bg-nf-teal text-white flex items-center justify-center font-bold text-lg z-10 relative`
  - Content card: `ml-20 (mobile) / alternating left-right (desktop)` with `.scroll-slide-left` or `.scroll-slide-right`
  - Title + description
- Stage content:
  1. "Cadastre o perfil do paciente" — "Anamnese inteligente que coleta dados essenciais em minutos."
  2. "IA gera o cardápio personalizado" — "Baseado em objetivos, restrições e preferências alimentares."
  3. "Acompanhe resultados em tempo real" — "Dashboard de evolução com métricas que importam."
- Desktop: alternating layout (odd stages left, even right) using CSS grid or flexbox
- Mobile: single column, all content right of line

- [ ] **Step 2: Verify timeline renders with line grow and stage slide-in**

Run: `npm run dev`, scroll to section
Expected: Line grows from top to bottom, stages slide in alternately from left/right

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/HowItWorksSection.tsx
git commit -m "feat(lp): add HowItWorksSection with scroll-driven timeline line-grow and slide-in stages"
```

---

### Task 6: Feature Showcase Section

**Files:**
- Create: `src/components/landing/FeatureShowcaseSection.tsx`

**Interfaces:**
- Consumes: CSS classes `.scroll-fade-up`, `.scroll-parallax-y` from Task 1
- Produces: `<FeatureShowcaseSection />` — 2-3 alternating image/text blocks

- [ ] **Step 1: Create `FeatureShowcaseSection.tsx`**

Component structure:
- Section with `bg-nf-bg-alt py-24 md:py-32`
- Array of feature objects: `{ title, description, imageAlt, reversed: boolean }`
  1. "Gerador de cardápios com IA" — "Crie planos alimentares completos em segundos. A IA analisa o perfil do paciente e gera cardápios equilibrados automaticamente." — reversed: false
  2. "App mobile do paciente" — "Seus pacientes recebem cardápios, lembretes e acompanhamento direto no celular. Engajamento sem esforço." — reversed: true
  3. "Relatórios automatizados" — "Relatórios profissionais de evolução gerados automaticamente. Impressione pacientes com dados visuais." — reversed: false
- Each block: flex row (desktop) / column (mobile), `max-w-6xl mx-auto px-6 gap-12 items-center`
- Text side: H3 serif + paragraph, `.scroll-fade-up`
- Image side: placeholder div with gradient/pattern, `.scroll-parallax-y`, reserved dimensions for CLS=0
- Alternating order via `flex-row-reverse` when `reversed: true`

- [ ] **Step 2: Verify feature blocks render with alternating layout and parallax**

Run: `npm run dev`, scroll through section
Expected: Blocks alternate image/text sides, images have subtle parallax, text fades up

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/FeatureShowcaseSection.tsx
git commit -m "feat(lp): add FeatureShowcaseSection with alternating layout and parallax images"
```

---

### Task 7: Pricing Section

**Files:**
- Create: `src/components/landing/PricingSection.tsx`

**Interfaces:**
- Consumes: `Button` from @/components/ui/button, `Link` from react-router-dom, `Check` from lucide-react
- Consumes: CSS class `.scroll-scale-in`, `.scroll-stagger-N` from Task 1
- Produces: `<PricingSection />` — 3 pricing cards

- [ ] **Step 1: Create `PricingSection.tsx`**

Component structure:
- Section with `id="planos" bg-nf-bg py-24 md:py-32`
- H2: "Planos de lançamento" — centered, serif
- Grid: `grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6`
- 3 plans (reuse data structure from existing LandingPage.tsx but update copy to launch language):
  - Starter: R$ 99/mês — "Para começar a inovar"
  - Pro (highlighted): R$ 299/mês — "Para crescer com IA" — badge "Mais Popular"
  - Enterprise: Customizado — "Solução completa para clínicas"
- Highlighted card: `border-nf-teal ring-2 ring-nf-teal/20 scale-105` (desktop only)
- Each card: `organic-card p-8` with `.scroll-scale-in` + `.scroll-stagger-N`
- Hover: `hover:-translate-y-1 hover:shadow-warm-lg transition-all duration-300`
- CTA button in each card: coral bg for all
- Features list with Check icons in teal
- NO comparison table, NO "X nutricionistas já usam"

- [ ] **Step 2: Verify pricing renders with highlighted card and hover effects**

Run: `npm run dev`, scroll to section
Expected: 3 cards, Pro highlighted with ring, hover lifts cards, no social proof anywhere

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/PricingSection.tsx
git commit -m "feat(lp): add PricingSection with launch-edition copy and scroll-scale-in cards"
```

---

### Task 8: Final CTA & Footer

**Files:**
- Create: `src/components/landing/FinalCTASection.tsx`
- Create: `src/components/landing/LandingFooter.tsx`

**Interfaces:**
- Consumes: `Button` from @/components/ui/button, `Link` from react-router-dom, logo from @/assets/logo.png
- Consumes: CSS class `.scroll-fade-up` from Task 1
- Produces: `<FinalCTASection />`, `<LandingFooter />`

- [ ] **Step 1: Create `FinalCTASection.tsx`**

Component structure:
- Section with `bg-gradient-to-br from-nf-teal/5 to-nf-coral/5 py-24 md:py-32`
- Container: `max-w-3xl mx-auto px-6 text-center`
- H2: "Pronto para transformar sua prática?" — serif, `text-3xl md:text-5xl font-bold text-nf-text`
- Subheadline: "Junte-se aos primeiros nutricionistas a usar o NutriFlow." — `text-lg text-nf-text-muted mt-4`
- CTA: Large Button bg-nf-coral text-white px-10 py-4 text-lg, "Começar Gratuitamente", linking to /auth
- Wrapper has `.scroll-fade-up`

- [ ] **Step 2: Create `LandingFooter.tsx`**

Component structure:
- Footer with `border-t border-nf-border py-12 bg-nf-bg`
- Container: `max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4`
- Left: Logo + "© 2026 NutriFlow. Inovação em nutrição."
- Right: Links "Termos", "Privacidade", "Contato" — `text-nf-text-muted hover:text-nf-text transition-colors`
- Minimalist: no social icons, no newsletter signup

- [ ] **Step 3: Verify final CTA and footer render correctly**

Run: `npm run dev`, scroll to bottom
Expected: Gradient background on CTA, footer minimal, no social proof

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/FinalCTASection.tsx src/components/landing/LandingFooter.tsx
git commit -m "feat(lp): add FinalCTASection and LandingFooter with launch messaging"
```

---

### Task 9: Assemble LandingPage & Integration Test

**Files:**
- Modify: `src/pages/LandingPage.tsx` (complete rewrite)

**Interfaces:**
- Consumes: All section components from Tasks 2-8
- Produces: Complete LP route at `/`

- [ ] **Step 1: Rewrite `LandingPage.tsx`**

Replace entire file content with:

```tsx
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import ValuePropsSection from '@/components/landing/ValuePropsSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeatureShowcaseSection from '@/components/landing/FeatureShowcaseSection';
import PricingSection from '@/components/landing/PricingSection';
import FinalCTASection from '@/components/landing/FinalCTASection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-nf-bg text-nf-text">
      <LandingHeader />
      <main>
        <HeroSection />
        <ValuePropsSection />
        <HowItWorksSection />
        <FeatureShowcaseSection />
        <PricingSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
```

- [ ] **Step 2: Run full build and verify no errors**

Run: `npm run build`
Expected: Clean build, no TypeScript errors, no missing imports

- [ ] **Step 3: Visual verification via browser**

Run: `npm run dev` and open in browser
Checklist:
- [ ] Header sticky with blur
- [ ] Hero badge pulses, headline fades up
- [ ] Value props cards stagger in
- [ ] Timeline line grows, stages slide in
- [ ] Feature blocks alternate layout
- [ ] Pricing cards scale in, Pro highlighted
- [ ] Final CTA gradient visible
- [ ] Footer minimal
- [ ] NO social proof anywhere
- [ ] Responsive at 375px, 768px, 1024px, 1440px

- [ ] **Step 4: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat(lp): assemble complete NutriFlow launch LP with all sections"
```

---

### Task 10: Accessibility & Performance Audit

**Files:**
- No new files — verification only

**Interfaces:**
- Consumes: Built app from Task 9

- [ ] **Step 1: Run Lighthouse audit**

Open Chrome DevTools → Lighthouse → select Performance + Accessibility → Generate report
Expected: Performance ≥ 95, Accessibility ≥ 95

- [ ] **Step 2: Test prefers-reduced-motion**

In Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`
Reload page
Expected: All animations disabled, content fully visible, no layout shifts

- [ ] **Step 3: Test keyboard navigation**

Tab through entire page
Expected: All interactive elements (nav links, buttons) receive visible focus ring, logical tab order

- [ ] **Step 4: Verify contrast ratios**

Use browser accessibility inspector or axe-core extension
Expected: All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
Note: Teal `#1CBFA5` on white `#FAFAF9` is ~2.8:1 — must NOT be used for body text; only for icons, badges with sufficient size, or on dark backgrounds

- [ ] **Step 5: Fix any issues found and commit**

```bash
git add -A
git commit -m "fix(lp): address accessibility and performance findings from audit"
```