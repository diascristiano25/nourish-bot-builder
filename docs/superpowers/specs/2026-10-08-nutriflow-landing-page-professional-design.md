# NutriFlow Landing Page - Professional Design
**Date:** 2026-10-08  
**Type:** New Feature - Landing Page Redesign  
**Status:** Draft

## Executive Summary

Complete redesign of NutriFlow landing page to compete professionally with Dietbox and WebDiet. The current landing page appears AI-generated with generic patterns (floating cards, marquee animations, bento grids). This spec delivers a professional B2B SaaS landing page based on competitive analysis of market leaders.

## Problem Statement

Current landing page (LandingPageNew.tsx) fails to compete with Brazilian market leaders due to:
- Generic AI-generated aesthetic (floating stat cards, decorative marquees)
- No real product screenshots
- Marketing-slop copy ("Menos planilhas. Mais pacientes")
- Hidden pricing
- No verifiable social proof
- Bento grid decoration instead of functional feature presentation

## Success Criteria

1. Professional appearance matching Dietbox/WebDiet quality standards
2. Clear product screenshots demonstrating actual functionality
3. Objective copy with concrete benefits and numbers
4. Transparent pricing immediately visible after demonstrating value
5. Verifiable testimonials with photos and social handles
6. Robust FAQ addressing real objections
7. Zero "AI tells" (no decorative animations, no marketing fluff)

## Competitive Analysis Summary

**Dietbox (Brazilian market leader):**
- Tab-based feature showcase (5 categories)
- Corporate benefits highlighted (Wellhub/TotalPass integration)
- Dual audience split (professional vs patient value)
- Pricing with temporal discounts, upfront values
- Verified testimonials (photos + Instagram handles)
- Extensive FAQ
- Professional badges (ASBRAN, Sindnuce associations)

**WebDiet (Brazilian competitor):**
- Dark slate base with teal accent
- Real product screenshots in hero
- Grid of ambassador profiles (20+ with photos/Instagram)
- Transparent disclaimer ("no payment to ambassadors")
- Technical specificity (TBCA/TACO databases, integrations)
- "Feito por nutricionistas para nutricionistas" positioning

**Key Takeaways:**
- Show the actual product (screenshots beat stock photos)
- Organize features in tabs/categories for scannability
- Price transparency builds trust
- Social proof must be verifiable
- Professional design is clean, not decorative

## Design Principles

1. **Show, Don't Decorate:** Product screenshots over abstract illustrations
2. **Clarity Over Cleverness:** Direct benefits over marketing wordplay
3. **Professional Over Trendy:** Clean layouts over design-agency aesthetics
4. **Trust Through Transparency:** Visible pricing, real testimonials, robust FAQ
5. **Scannable Information:** Tabs, clear hierarchy, organized features

## Architecture

### Page Structure

```
1. Navigation (Sticky Header)
   - Logo
   - Navigation: Recursos | Preços | Casos | FAQ
   - CTA: "Testar Grátis" + "Login"

2. Hero Section
   - Screenshot do produto (destaque visual principal)
   - Headline direta: "Software de Nutrição Profissional"
   - Subheadline com benefício: "Crie cardápios personalizados em minutos"
   - Formulário inline de teste grátis (nome + email + CTA)
   - Trust badges: logos de integrações reais

3. Social Proof Band
   - Números de impacto: "500+ nutricionistas", "10.000+ cardápios criados"
   - Logos de parceiros/integrações

4. Features Tabs Component
   - Tabs: "Atendimento | Prescrição | Gestão | Anamnese"
   - Cada tab: screenshot + lista de bullets específicos
   - Permite exploração sem scroll excessivo

5. Dual Benefits Section
   - Split visual: "Para o Nutricionista" | "Para o Paciente"
   - Benefícios específicos para cada público
   - Screenshots/ilustrações por lado

6. Pricing Section
   - 3 tiers: Básico | Pro | Elite
   - Valores visíveis
   - Feature comparison
   - CTAs claros por plano
   - Nota: "Teste grátis 14 dias, sem cartão"

7. Testimonials Grid
   - 6-9 nutricionistas
   - Foto profissional + Nome + Cidade + Instagram handle
   - Quote curto e específico (não genérico)
   - Layout: grid 3 colunas desktop, 1 coluna mobile

8. FAQ Accordion
   - 8-12 perguntas reais
   - Categorias: Funcionalidade, Preços, Suporte, Técnico
   - Antecipa objeções reais

9. Final CTA Section
   - Headline de conversão
   - Formulário ou botão de teste grátis
   - Reforço de valor (grátis 14 dias)

10. Footer
    - Links: Recursos, Preços, Suporte, Legal
    - Social media
    - Copyright
```

### Component Breakdown

**New Components to Create:**

1. **HeroWithScreenshot**
   - Props: headline, subheadline, screenshotUrl, onSignup
   - Inline signup form with validation
   - Trust badge strip
   - Responsive: screenshot below form on mobile

2. **FeatureTabsSection**
   - Props: tabs array (id, label, screenshot, features)
   - State: activeTab
   - Tab navigation with smooth transitions
   - Screenshot + feature bullets per tab

3. **DualBenefitsSection**
   - Props: nutritionistBenefits, patientBenefits
   - Split layout 50/50 desktop, stacked mobile
   - Icons for each benefit point

4. **PricingCards**
   - Props: plans array (name, price, features, highlighted)
   - 3 cards with feature comparison
   - Highlight recommended plan
   - CTA per card

5. **TestimonialGrid**
   - Props: testimonials array (name, photo, city, instagram, quote)
   - Grid layout responsive
   - Avatar + quote card format
   - Instagram handle clickable

6. **FAQAccordion**
   - Props: faqs array (question, answer, category)
   - shadcn/ui Accordion component
   - Optional category filtering

7. **StickyNav**
   - Logo + navigation links
   - Smooth scroll to sections
   - Mobile hamburger menu
   - CTA button always visible

**Reusable Components (from existing codebase):**
- Button (shadcn/ui)
- Card (shadcn/ui)
- Tabs (shadcn/ui)
- Accordion (shadcn/ui)
- Input (shadcn/ui)
- Badge (shadcn/ui)

### Data Structure

```typescript
// Pricing Plans
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'month' | 'year';
  description: string;
  features: string[];
  highlighted: boolean;
  ctaText: string;
  ctaLink: string;
}

// Feature Tabs
interface FeatureTab {
  id: string;
  label: string;
  screenshot: string;
  features: Array<{
    icon: React.ComponentType;
    title: string;
    description: string;
  }>;
}

// Testimonials
interface Testimonial {
  id: string;
  name: string;
  photo: string;
  city: string;
  state: string;
  instagram: string;
  quote: string;
}

// FAQ Items
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'funcionalidade' | 'precos' | 'suporte' | 'tecnico';
}
```

## Design System

### Colors (Professional Clean Palette)

**Primary:**
- Green: `#10B981` (emerald-500) - Primary actions, success states
- Dark: `#0F172A` (slate-900) - Text, headers
- Light: `#F8FAFC` (slate-50) - Backgrounds

**Neutrals:**
- Slate scale for borders, secondary text, cards

**Accents:**
- Orange: `#F97316` (orange-500) - CTAs, highlights (sparingly)

**No AI-purple, no neon gradients, no decorative mesh backgrounds**

### Typography

**Font Stack:**
- Primary: System sans (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- Fallback consideration: Inter or Geist if needed

**Hierarchy:**
- H1 (Hero): text-5xl md:text-6xl font-bold tracking-tight
- H2 (Sections): text-3xl md:text-4xl font-bold
- H3 (Subsections): text-2xl font-semibold
- Body: text-base leading-relaxed
- Small: text-sm text-slate-600

### Spacing & Layout

**Container:** max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  
**Section Spacing:** py-16 md:py-24  
**Component Gap:** gap-8 to gap-12  

**Grid Systems:**
- Features: grid-cols-1 md:grid-cols-3
- Testimonials: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Pricing: grid-cols-1 md:grid-cols-3

### Imagery

**Screenshots:**
- Use real product screenshots (create placeholders initially)
- Format: PNG with subtle border/shadow
- Dimensions: Maintain aspect ratio, responsive sizing

**Testimonial Photos:**
- Square format, professional headshots
- Fallback: Use realistic placeholder service with seed

**Icons:**
- Phosphor Icons (already in project dependencies)
- Consistent stroke-width across page

## Content Strategy

### Copy Tone

**Eliminate marketing-slop patterns:**
- ❌ "Menos planilhas. Mais pacientes"
- ✅ "Gerencie consultas e prescrições em uma plataforma"

- ❌ "Revolucione sua prática"
- ✅ "Economize 2 horas por dia em tarefas administrativas"

- ❌ "A plataforma mais avançada"
- ✅ "Software de nutrição com integração Google Calendar e WhatsApp"

**Principles:**
- Specific benefits with numbers
- Action-oriented headlines
- Objective feature descriptions
- Brazilian Portuguese, professional register

### Placeholder Content (to be replaced with real data)

**Hero:**
- Headline: "Software de Nutrição Profissional"
- Subheadline: "Crie cardápios personalizados, gerencie consultas e acompanhe a evolução dos pacientes em uma única plataforma"

**Feature Tabs:**
1. Atendimento: agenda, prontuários, anamnese
2. Prescrição: cardápios, listas de compras, substituições
3. Gestão: financeiro, relatórios, métricas
4. Anamnese: histórico, avaliações, fotos

**Pricing Plans:**
1. Básico (R$ 97/mês): 30 pacientes, features essenciais
2. Pro (R$ 197/mês): 100 pacientes, features avançadas, whitelabel
3. Elite (R$ 397/mês): pacientes ilimitados, API, prioridade

**Testimonials:** 6 mock profiles with realistic names, Brazilian cities, placeholder photos

**FAQ:** 10 questions covering signup, cancellation, data security, offline access, integrations, training

## Technical Implementation

### Tech Stack (Existing)
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- shadcn/ui components
- Framer Motion (for subtle transitions only)
- Phosphor Icons

### File Structure

```
src/
├── pages/
│   └── LandingPageProfessional.tsx (new main page)
├── components/
│   └── landing/
│       ├── HeroWithScreenshot.tsx
│       ├── FeatureTabsSection.tsx
│       ├── DualBenefitsSection.tsx
│       ├── PricingCards.tsx
│       ├── TestimonialGrid.tsx
│       ├── FAQAccordion.tsx
│       └── StickyNav.tsx
├── data/
│   └── landingContent.ts (mock content)
└── assets/
    └── landing/
        ├── screenshots/ (placeholder images)
        └── testimonials/ (placeholder photos)
```

### Route Setup

Update `src/App.tsx`:
```tsx
<Route path="/landing-pro" element={<LandingPageProfessional />} />
```

### Performance Considerations

- Lazy load testimonial images
- Code split landing components (React.lazy if page grows large)
- Optimize screenshot images (WebP format, responsive sizes)
- Minimal framer-motion usage (only for tab transitions, accordion)

### Accessibility

- Semantic HTML (header, nav, section, article)
- ARIA labels for interactive elements
- Keyboard navigation for tabs and accordion
- Focus visible states
- Alt text for all images
- Color contrast WCAG AA minimum

### Responsive Behavior

**Breakpoints:**
- Mobile: < 768px (single column, stacked)
- Tablet: 768px - 1024px (2 column where appropriate)
- Desktop: > 1024px (full multi-column layouts)

**Key Adaptations:**
- Hero: screenshot below form on mobile
- Feature tabs: horizontal scroll on mobile (or stack)
- Pricing: stack cards on mobile
- Testimonials: 1 column mobile, 2 tablet, 3 desktop
- Navigation: hamburger menu mobile

## Testing Strategy

### Manual Testing Checklist

1. **Visual Regression:**
   - Compare side-by-side with Dietbox/WebDiet
   - Check for AI tells (decorative elements, generic patterns)
   - Verify professional appearance

2. **Content Accuracy:**
   - All copy is objective and specific
   - No marketing-slop phrases
   - Numbers and features are realistic

3. **Functionality:**
   - Tab switching smooth
   - Form validation works
   - Accordion expands/collapses
   - Smooth scroll navigation
   - CTA buttons route correctly

4. **Responsive:**
   - Test on mobile (375px)
   - Test on tablet (768px)
   - Test on desktop (1440px)

5. **Performance:**
   - Lighthouse score > 90
   - Images load progressively
   - No layout shift

### Browser Testing

Preview with Vercel agent-browser:
- Chrome (primary)
- Safari (test webkit differences)
- Mobile viewport (responsive)

## Implementation Plan Preview

**Phase 1: Core Structure**
- Create component files
- Set up route
- Build StickyNav

**Phase 2: Hero & Social Proof**
- HeroWithScreenshot component
- Social proof band with numbers

**Phase 3: Features**
- FeatureTabsSection with mock data
- DualBenefitsSection

**Phase 4: Conversion**
- PricingCards with 3 tiers
- Final CTA section

**Phase 5: Trust & Support**
- TestimonialGrid
- FAQAccordion

**Phase 6: Polish**
- Smooth scroll
- Transitions
- Responsive refinement
- Performance optimization

## Non-Goals (Explicit Exclusions)

- ❌ Complex animations (no GSAP, no scroll-hijacking)
- ❌ Decorative elements (no floating cards, no particle effects)
- ❌ Bento grids for decoration
- ❌ Marquee animations
- ❌ Generic stock photos without product context
- ❌ Marketing-slop copy
- ❌ Hidden pricing
- ❌ Fake testimonials without verification details

## Migration Plan

Once validated:
1. Test new landing page at `/landing-pro`
2. Compare metrics (if tracking available)
3. Replace main route `/` with new landing
4. Archive old LandingPage.tsx and LandingPageNew.tsx

## Appendix: Content Templates

### Feature Tab Example

**Tab: Atendimento**
- 📅 Agenda integrada com Google Calendar
- 📋 Prontuários digitais completos
- 💬 Chat direto com pacientes via WhatsApp
- 🔔 Lembretes automáticos de consulta
- 📊 Histórico completo de atendimentos

### Testimonial Example

```
Nome: Dra. Ana Silva
Cidade: São Paulo, SP
Instagram: @dra.anasilva.nutri
Quote: "Economizo 2 horas por dia com o NutriFlow. A prescrição de cardápios que levava 30 minutos agora leva 5."
```

### FAQ Example

**Q: Posso cancelar a qualquer momento?**
A: Sim, você pode cancelar sua assinatura a qualquer momento. Não há multa ou período de fidelidade. Após o cancelamento, você mantém acesso até o fim do período já pago.

**Q: Os dados dos meus pacientes ficam seguros?**
A: Sim. Utilizamos criptografia de ponta a ponta e servidores em conformidade com a LGPD. Seus dados nunca são compartilhados com terceiros.

---

**End of Specification**
