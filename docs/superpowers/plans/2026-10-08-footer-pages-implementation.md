# Footer Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 9 hybrid footer pages (public/authenticated versions) with shared components, content files, and database integration.

**Architecture:** HybridPage pattern - single URL per page that renders public marketing content for guests and functional tools/data for authenticated users. Shared components (HybridPage, PublicLayout, LockedFeature) enable code reuse across all pages.

**Tech Stack:** React, TypeScript, React Router, Tailwind CSS, shadcn/ui, Supabase, JSON content files

**Spec:** `docs/superpowers/specs/2026-10-08-footer-pages-design.md`

## Global Constraints

- React 18+ with TypeScript strict mode
- All pages must be mobile-responsive (320px min width)
- Page load time < 2s (LCP < 1.5s)
- Follow existing NutriFlow color palette: Sage Green (#518C5B), Terracotta (#C4764A), Off-white (#FAF8F5)
- Use existing shadcn/ui components (Button, Card, Badge, etc.)
- Authentication via existing `useAuth()` hook from `src/hooks/useAuth.tsx`
- All new routes must be lazy-loaded in App.tsx
- Commit after each completed task

## Review Focus

1. **Unauthenticated users accessing auth-only features** - Public versions must never expose authenticated data; HybridPage must reliably detect null user and render public content.
2. **Auth state changes mid-session** - When user logs in/out, HybridPage must re-render correct version without manual refresh.
3. **Missing or malformed content files** - Pages must handle missing JSON files gracefully with fallback UI, not crash.
4. **Mobile layout breaks** - All cards, grids, and forms must stack properly on mobile (<640px) without horizontal scroll.
5. **Footer links pointing to old routes** - Footer component must update all href attributes to new `/recursos/*`, `/empresa/*`, `/suporte/*`, `/legal/*` routes.

---

## Task 1: Shared Hybrid Components

**Files:**
- Create: `src/components/hybrid/HybridPage.tsx`
- Create: `src/components/hybrid/PublicLayout.tsx`
- Create: `src/components/hybrid/LockedFeature.tsx`
- Create: `src/components/hybrid/index.ts`

**Interfaces:**
- Consumes: `useAuth()` from `src/hooks/useAuth.tsx` (returns `{ user: User | null }`)
- Produces:
  - `HybridPage(props: { publicContent: ReactNode, authContent: ReactNode, title: string, description?: string })`
  - `PublicLayout(props: { children: ReactNode })`
  - `LockedFeature(props: { title: string, description: string, icon?: ReactNode })`

- [ ] **Step 1: Write test for HybridPage auth detection**

```typescript
// src/components/hybrid/__tests__/HybridPage.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HybridPage } from '../HybridPage';
import { AuthProvider } from '@/hooks/useAuth';

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => <div>{children}</div>
}));

test('renders public content when user is null', () => {
  require('@/hooks/useAuth').useAuth.mockReturnValue({ user: null });
  
  render(
    <BrowserRouter>
      <HybridPage
        publicContent={<div>Public Version</div>}
        authContent={<div>Auth Version</div>}
        title="Test Page"
      />
    </BrowserRouter>
  );
  
  expect(screen.getByText('Public Version')).toBeInTheDocument();
  expect(screen.queryByText('Auth Version')).not.toBeInTheDocument();
});

test('renders auth content when user exists', () => {
  require('@/hooks/useAuth').useAuth.mockReturnValue({ 
    user: { id: '123', email: 'test@example.com' } 
  });
  
  render(
    <BrowserRouter>
      <HybridPage
        publicContent={<div>Public Version</div>}
        authContent={<div>Auth Version</div>}
        title="Test Page"
      />
    </BrowserRouter>
  );
  
  expect(screen.getByText('Auth Version')).toBeInTheDocument();
  expect(screen.queryByText('Public Version')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/hybrid/__tests__/HybridPage.test.tsx`  
Expected: FAIL with "Cannot find module '../HybridPage'"

- [ ] **Step 3: Implement HybridPage component**

Create `src/components/hybrid/HybridPage.tsx` with:
- Interface: `HybridPageProps { publicContent: ReactNode, authContent: ReactNode, title: string, description?: string }`
- Use `useAuth()` to get `user`
- Use `useEffect` to set `document.title = ${title} | NutriFlow`
- Return `PublicLayout` wrapping `publicContent` if `user === null`
- Return bare `authContent` wrapped in `<div className="min-h-screen bg-background">` if `user` exists

- [ ] **Step 4: Implement PublicLayout component**

Create `src/components/hybrid/PublicLayout.tsx` with:
- Import: `logoImg` from `@/assets/logo.png`, `Button` from `@/components/ui/button`, `Link` from `react-router-dom`, `Footer` from existing footer component
- Render: Sticky header (logo + "Login"/"Começar Grátis" buttons), main content area, Footer component
- Header classes: `sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b`
- Buttons link to `/auth`

- [ ] **Step 5: Implement LockedFeature component**

Create `src/components/hybrid/LockedFeature.tsx` with:
- Interface: `LockedFeatureProps { title: string, description: string, icon?: ReactNode }`
- Render: Card with gradient background, icon, title, description, "Desbloquear Agora" button linking to `/auth`
- Use `Lock` icon from `lucide-react` in top-right if no icon provided

- [ ] **Step 6: Create barrel export**

Create `src/components/hybrid/index.ts`:
```typescript
export { HybridPage } from './HybridPage';
export { PublicLayout } from './PublicLayout';
export { LockedFeature } from './LockedFeature';
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test src/components/hybrid/`  
Expected: All tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/components/hybrid/
git commit -m "feat: add hybrid page components for public/auth routing

- HybridPage: detects auth state and renders appropriate version
- PublicLayout: marketing header + footer wrapper
- LockedFeature: teaser card with CTA for premium features

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 2: Content Files and Data Setup

**Files:**
- Create: `src/content/blog/posts.json`
- Create: `src/content/faq/public.json`
- Create: `src/content/faq/auth.json`
- Create: `src/content/trainings.json`
- Create: `src/content/status.json`
- Create: `supabase/migrations/20261008_footer_pages_tables.sql`

**Interfaces:**
- Produces:
  - Blog posts array with structure: `{ slug, title, excerpt, content, author, date, category, featuredImage, premium, readTime }`
  - FAQ structure: `{ categories: [{ id, title, icon, questions: [{ q, a }] }] }`
  - Trainings: `{ courses: [{ id, title, description, instructor, thumbnail, duration, level, premium, modules: [{ id, title, videos: [{ id, title, duration, youtube_id, free_preview }] }] }] }`
  - Status: `{ uptime, services: [{ name, status, latency }], incidents: [{ date, title, status, duration }] }`

- [ ] **Step 1: Create blog posts JSON**

Create `src/content/blog/posts.json` with 5 sample posts following spec structure (Section 4.4 Appendix A example). First post free (premium: false), rest premium (premium: true).

- [ ] **Step 2: Create public FAQ JSON**

Create `src/content/faq/public.json` with 5 categories (Primeiros Passos, Cardápios, Pacientes, Planos e Pagamento, Segurança), 3-5 questions each. Use spec example structure.

- [ ] **Step 3: Create authenticated FAQ JSON**

Create `src/content/faq/auth.json` with 8 categories (add: Integrações, Relatórios, API), 5-7 questions each (40 total). Reuse public questions + add advanced ones.

- [ ] **Step 4: Create trainings JSON**

Create `src/content/trainings.json` with 3 courses following spec structure (Section 4.7 Appendix A). Course 1: "Fundamentos da Nutrição Clínica" (free first video), Course 2: "Prescrição Dietética Avançada" (all premium), Course 3: "Gestão de Consultório" (all premium).

- [ ] **Step 5: Create status JSON**

Create `src/content/status.json` with mockup data: uptime 99.94%, 4 services (API, Dashboard, Database, Auth) all operational, 2-3 past incidents (all resolved).

- [ ] **Step 6: Create database migration**

Create `supabase/migrations/20261008_footer_pages_tables.sql`:
```sql
-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Training progress table
CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id, video_id)
);

-- Add consent preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_preferences JSONB DEFAULT '{"product_updates": true, "surveys": true, "partner_promos": false}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_user_id ON training_progress(user_id);
```

- [ ] **Step 7: Apply migration locally**

Run: `npx supabase db reset` (if local dev) or `npx supabase migration up`  
Expected: Tables created successfully

- [ ] **Step 8: Commit**

```bash
git add src/content/ supabase/migrations/
git commit -m "feat: add content files and database schema for footer pages

- Blog posts (5 samples)
- FAQ (public: 5 categories, auth: 8 categories)
- Trainings (3 courses with modules)
- Status page data (mockup)
- DB: support_tickets, training_progress tables

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 3: Recursos Pages (Atendimento, Prescrição, Gestão)

**Files:**
- Create: `src/pages/recursos/Atendimento.tsx`
- Create: `src/pages/recursos/Prescricao.tsx`
- Create: `src/pages/recursos/Gestao.tsx`

**Interfaces:**
- Consumes: `HybridPage`, `LockedFeature` from `src/components/hybrid`
- Produces: Page components for `/recursos/atendimento`, `/recursos/prescricao`, `/recursos/gestao`

- [ ] **Step 1: Implement Atendimento page**

Create `src/pages/recursos/Atendimento.tsx`:
- Public version: Hero ("Sistema de Agendamento Inteligente"), 3 feature cards (Calendário, Lembretes, Histórico), pricing table reused from landing, CTA button
- Auth version: Redirect to `/agenda` with `<Navigate to="/agenda" replace />`
- Wrap both in `<HybridPage publicContent={...} authContent={...} title="Atendimento" />`

- [ ] **Step 2: Implement Prescrição page**

Create `src/pages/recursos/Prescricao.tsx`:
- Public version: Hero ("Cardápios Personalizados com IA"), demo meal plan (static JSONB example), feature list (5 items), template gallery (4 locked cards)
- Auth version: Redirect to `/gerar-cardapio` or `/biblioteca` (check which exists first)
- Wrap in HybridPage

- [ ] **Step 3: Implement Gestão page**

Create `src/pages/recursos/Gestao.tsx`:
- Public version: Hero ("Gestão Completa"), 4 feature cards (Dashboard, Pacientes, Relatórios, Financeiro), comparison table, screenshots section
- Auth version: Redirect to `/dashboard`
- Wrap in HybridPage

- [ ] **Step 4: Test pages render correctly**

Manually test (or write integration test):
- Visit `/recursos/atendimento` logged out → sees public version
- Visit `/recursos/atendimento` logged in → redirects to `/agenda`
- Repeat for Prescrição and Gestão

- [ ] **Step 5: Commit**

```bash
git add src/pages/recursos/
git commit -m "feat: add Recursos pages (Atendimento, Prescrição, Gestão)

Public versions: marketing content with CTAs
Auth versions: redirect to existing tools

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 4: Blog Components and Pages

**Files:**
- Create: `src/components/blog/BlogCard.tsx`
- Create: `src/components/blog/BlogList.tsx`
- Create: `src/components/blog/BlogContent.tsx`
- Create: `src/pages/empresa/Blog.tsx`
- Create: `src/pages/empresa/BlogPost.tsx`

**Interfaces:**
- Consumes: `posts.json` from `src/content/blog/posts.json`
- Produces:
  - `BlogCard(props: { post: BlogPostType, showPreview?: boolean })`
  - `BlogList(props: { posts: BlogPostType[], currentPage: number, onPageChange: (page: number) => void })`
  - `BlogContent(props: { content: string, isPremium: boolean, isAuthenticated: boolean })`

- [ ] **Step 1: Create BlogPost type**

Create `src/types/blog.ts`:
```typescript
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorBio?: string;
  authorImage?: string;
  date: string;
  category: string;
  tags?: string[];
  featuredImage: string;
  premium: boolean;
  readTime: string;
}
```

- [ ] **Step 2: Implement BlogCard component**

Create `src/components/blog/BlogCard.tsx`:
- Props: `{ post: BlogPost, showPreview: boolean }`
- Render: Card with featured image, title, excerpt (150 chars), author + date, category badge, "Ler Mais" button
- Add "Premium" badge if `post.premium === true`
- Link to `/empresa/blog/${post.slug}`

- [ ] **Step 3: Implement BlogList component**

Create `src/components/blog/BlogList.tsx`:
- Props: `{ posts: BlogPost[], currentPage: number, onPageChange: (page) => void }`
- Render: Grid (3 cols desktop, 2 tablet, 1 mobile), pagination buttons
- Display 6 posts per page
- Pagination: "← Anterior" and "Próxima →" buttons

- [ ] **Step 4: Implement BlogContent component**

Create `src/components/blog/BlogContent.tsx`:
- Props: `{ content: string, isPremium: boolean, isAuthenticated: boolean }`
- If `!isPremium || isAuthenticated`: render full content (markdown to HTML with `dangerouslySetInnerHTML` or markdown library)
- If `isPremium && !isAuthenticated`: show first 2 paragraphs + blur overlay + CTA "Continue lendo. Cadastre-se grátis"
- Use `prose` class from Tailwind Typography plugin

- [ ] **Step 5: Implement Blog list page**

Create `src/pages/empresa/Blog.tsx`:
- Load posts from `import postsData from '@/content/blog/posts.json'`
- Public/Auth versions: identical layout (BlogList), auth users see "Premium" badges on locked posts
- Use HybridPage wrapper
- State: `currentPage` for pagination

- [ ] **Step 6: Implement BlogPost detail page**

Create `src/pages/empresa/BlogPost.tsx`:
- Use `useParams<{ slug: string }>()` to get slug
- Load post from posts.json: `posts.find(p => p.slug === slug)`
- Render: Header (title, author, date, category), featured image, BlogContent component
- Related posts section at bottom (3 posts from same category)
- 404 if post not found

- [ ] **Step 7: Test blog functionality**

- Load `/empresa/blog` → sees 6 posts, pagination works
- Click post → loads detail page
- Premium post shows paywall when logged out, full content when logged in

- [ ] **Step 8: Commit**

```bash
git add src/components/blog/ src/pages/empresa/Blog.tsx src/pages/empresa/BlogPost.tsx src/types/blog.ts
git commit -m "feat: add Blog with public/premium content

- BlogCard, BlogList, BlogContent components
- Blog list and detail pages
- Premium paywall for authenticated users

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 5: Contato Page with Support Tickets

**Files:**
- Create: `src/components/support/TicketForm.tsx`
- Create: `src/components/support/TicketHistory.tsx`
- Create: `src/pages/empresa/Contato.tsx`

**Interfaces:**
- Consumes: `supabase` client, `useAuth()`, `support_tickets` table
- Produces:
  - `TicketForm(props: { user: User | null, onSuccess: () => void })`
  - `TicketHistory(props: { userId: string })`

- [ ] **Step 1: Write test for TicketForm submission**

```typescript
// src/components/support/__tests__/TicketForm.test.tsx
test('submits ticket and calls onSuccess', async () => {
  const onSuccess = jest.fn();
  const user = { id: '123', email: 'test@example.com' };
  
  render(<TicketForm user={user} onSuccess={onSuccess} />);
  
  fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: 'Bug report' } });
  fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Test message' } });
  fireEvent.click(screen.getByText('Enviar Mensagem'));
  
  await waitFor(() => expect(onSuccess).toHaveBeenCalled());
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test TicketForm.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement TicketForm component**

Create `src/components/support/TicketForm.tsx`:
- Props: `{ user: User | null, onSuccess: () => void }`
- Form fields: Nome (pre-filled if user), Email (pre-filled if user), Assunto (dropdown: "Dúvida Técnica", "Problema com Pagamento", "Solicitação de Feature", "Outro"), Mensagem (textarea)
- If `user`: add optional field "Número do Paciente"
- On submit: insert into `support_tickets` table via Supabase, call `onSuccess()`, show toast

- [ ] **Step 4: Implement TicketHistory component**

Create `src/components/support/TicketHistory.tsx`:
- Props: `{ userId: string }`
- Query `support_tickets` table: `SELECT * FROM support_tickets WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 10`
- Render: Table with columns (Data, Assunto, Status, Ações)
- Status badge: green for "resolved", yellow for "in_progress", gray for "open"
- "Ver Detalhes" button opens modal with full message

- [ ] **Step 5: Implement Contato page**

Create `src/pages/empresa/Contato.tsx`:
- Public version: Hero, TicketForm (user=null), 3 contact info cards (email, phone, address)
- Auth version: Same + TicketHistory component below form + "Suporte Prioritário" badge if user has Pro plan
- Wrap in HybridPage

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test TicketForm.test.tsx`  
Expected: PASS

- [ ] **Step 7: Test page manually**

- Submit ticket logged out → creates record with null user_id
- Submit ticket logged in → creates record with user_id, shows in history

- [ ] **Step 8: Commit**

```bash
git add src/components/support/Ticket*.tsx src/pages/empresa/Contato.tsx
git commit -m "feat: add Contato page with support ticket system

- TicketForm: submission to Supabase
- TicketHistory: displays past tickets for auth users
- Contact info cards and form

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 6: Central de Ajuda Page

**Files:**
- Create: `src/components/support/FAQAccordion.tsx`
- Create: `src/pages/suporte/CentralAjuda.tsx`

**Interfaces:**
- Consumes: `public.json`, `auth.json` from `src/content/faq/`
- Produces:
  - `FAQAccordion(props: { categories: FAQCategory[] })`

- [ ] **Step 1: Create FAQ types**

Create `src/types/faq.ts`:
```typescript
export interface FAQQuestion {
  id?: string;
  q: string;
  a: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  questions: FAQQuestion[];
}
```

- [ ] **Step 2: Implement FAQAccordion component**

Create `src/components/support/FAQAccordion.tsx`:
- Props: `{ categories: FAQCategory[] }`
- Render: Each category as collapsible section with icon (use `lucide-react` icons mapped from string)
- Within category: Accordion from shadcn/ui with questions
- Search bar at top: filters questions by keyword (case-insensitive)

- [ ] **Step 3: Implement Central de Ajuda page**

Create `src/pages/suporte/CentralAjuda.tsx`:
- Public version: Load `publicFAQ` from `src/content/faq/public.json`, render FAQAccordion, CTA "Precisa de mais ajuda? Cadastre-se"
- Auth version: Load `authFAQ` from `src/content/faq/auth.json`, render FAQAccordion, "Chat com suporte" button (placeholder)
- Wrap in HybridPage

- [ ] **Step 4: Test FAQ functionality**

- Public: sees 5 categories
- Auth: sees 8 categories with more questions
- Search filters questions correctly

- [ ] **Step 5: Commit**

```bash
git add src/components/support/FAQAccordion.tsx src/pages/suporte/CentralAjuda.tsx src/types/faq.ts
git commit -m "feat: add Central de Ajuda with searchable FAQ

- FAQAccordion: collapsible categories with search
- Public: 5 categories, Auth: 8 categories
- Icon mapping from JSON strings

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 7: Treinamentos Page with Video Player

**Files:**
- Create: `src/components/training/VideoPlayer.tsx`
- Create: `src/components/training/CourseCard.tsx`
- Create: `src/components/training/CourseProgress.tsx`
- Create: `src/components/training/VideoList.tsx`
- Create: `src/pages/suporte/Treinamentos.tsx`
- Create: `src/pages/suporte/TrainingCourse.tsx`

**Interfaces:**
- Consumes: `trainings.json`, `training_progress` table, `useAuth()`
- Produces:
  - `VideoPlayer(props: { youtubeId: string, onComplete?: () => void })`
  - `CourseCard(props: { course: Course, userProgress?: number })`
  - `CourseProgress(props: { courseId: string, userId: string })`
  - `VideoList(props: { modules: Module[], currentVideoId: string, onVideoSelect: (videoId: string) => void, userProgress: VideoProgress[] })`

- [ ] **Step 1: Create training types**

Create `src/types/training.ts`:
```typescript
export interface Video {
  id: string;
  title: string;
  duration: string;
  youtube_id: string;
  free_preview: boolean;
  description?: string;
}

export interface Module {
  id: string;
  title: string;
  videos: Video[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    bio: string;
    image: string;
  };
  thumbnail: string;
  duration: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  premium: boolean;
  modules: Module[];
  certificate?: {
    enabled: boolean;
    issuer: string;
    hours: number;
  };
}

export interface VideoProgress {
  video_id: string;
  completed: boolean;
}
```

- [ ] **Step 2: Implement VideoPlayer component**

Create `src/components/training/VideoPlayer.tsx`:
- Props: `{ youtubeId: string, onComplete?: () => void }`
- Render: YouTube iframe embed with aspect-video wrapper
- "Marcar como Completo" button below video → calls `onComplete()`

- [ ] **Step 3: Implement CourseCard component**

Create `src/components/training/CourseCard.tsx`:
- Props: `{ course: Course, userProgress?: number }`
- Render: Card with thumbnail, title, duration, level badge, "Gratuito"/"Premium" badge
- Show progress bar if `userProgress` provided
- Link to `/suporte/treinamentos/${course.id}`

- [ ] **Step 4: Implement CourseProgress component**

Create `src/components/training/CourseProgress.tsx`:
- Props: `{ courseId: string, userId: string }`
- Query `training_progress` table: count completed videos for this course
- Calculate percentage: `completed / totalVideos * 100`
- Render: Progress bar + "X% completo (Y/Z vídeos)"
- If 100%: show "Parabéns! Você completou o curso" + "Baixar Certificado" button (placeholder)

- [ ] **Step 5: Implement VideoList component**

Create `src/components/training/VideoList.tsx`:
- Props: `{ modules: Module[], currentVideoId: string, onVideoSelect: (id) => void, userProgress: VideoProgress[] }`
- Render: Sidebar with collapsible modules, videos as list items
- Current video highlighted, completed videos show checkmark
- Click video → calls `onVideoSelect(id)`

- [ ] **Step 6: Implement Treinamentos list page**

Create `src/pages/suporte/Treinamentos.tsx`:
- Load courses from `trainings.json`
- Public version: Grid of CourseCards, free courses clickable, premium show LockedFeature
- Auth version: All courses unlocked, show userProgress on cards
- Wrap in HybridPage

- [ ] **Step 7: Implement TrainingCourse detail page**

Create `src/pages/suporte/TrainingCourse.tsx`:
- Use `useParams<{ courseId: string }>()`
- Load course from trainings.json
- Public: Show first video if `free_preview`, rest locked
- Auth: VideoPlayer + VideoList sidebar + CourseProgress at top
- Track progress: on video complete, insert/update `training_progress` table

- [ ] **Step 8: Test training functionality**

- Public: sees course list, first video preview only
- Auth: all videos accessible, progress tracks, checkmarks appear

- [ ] **Step 9: Commit**

```bash
git add src/components/training/ src/pages/suporte/Treinamentos.tsx src/pages/suporte/TrainingCourse.tsx src/types/training.ts
git commit -m "feat: add Treinamentos with video player and progress tracking

- VideoPlayer: YouTube embed with completion tracking
- CourseCard, CourseProgress, VideoList components
- Training list and course detail pages
- Progress stored in training_progress table

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 8: Status Page

**Files:**
- Create: `src/components/support/StatusCard.tsx`
- Create: `src/pages/suporte/Status.tsx`

**Interfaces:**
- Consumes: `status.json`, `useAuth()`
- Produces:
  - `StatusCard(props: { service: Service })`

- [ ] **Step 1: Create status types**

Create `src/types/status.ts`:
```typescript
export interface Service {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  latency: string;
}

export interface Incident {
  date: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  duration: string;
  description?: string;
}

export interface StatusData {
  uptime: number;
  services: Service[];
  incidents: Incident[];
  uptime_history?: Array<{ date: string; uptime: number }>;
}
```

- [ ] **Step 2: Implement StatusCard component**

Create `src/components/support/StatusCard.tsx`:
- Props: `{ service: Service }`
- Render: Card with service name, status indicator (colored dot), latency
- Colors: green (#10b981) for operational, yellow (#f59e0b) for degraded, red (#ef4444) for outage

- [ ] **Step 3: Implement Status page**

Create `src/pages/suporte/Status.tsx`:
- Load data from `status.json`
- Both versions identical, except auth users get: Toggle "Notificar-me sobre incidentes" (saves to local state, future: DB)
- Sections: Uptime hero (99.X%), Services grid (4 StatusCards), Incident timeline (list)
- Wrap in HybridPage

- [ ] **Step 4: Test status page**

- Displays all services with correct status
- Incidents list shows properly
- Auth toggle appears only when logged in

- [ ] **Step 5: Commit**

```bash
git add src/components/support/StatusCard.tsx src/pages/suporte/Status.tsx src/types/status.ts
git commit -m "feat: add Status page with service monitoring

- StatusCard: displays service health with colored indicators
- Uptime stats and incident timeline
- Notification toggle for authenticated users

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 9: LGPD Page with Data Management

**Files:**
- Create: `src/lib/lgpd.ts`
- Modify: `src/pages/legal/LGPD.tsx` (if exists) or Create new

**Interfaces:**
- Consumes: `supabase`, `profiles` table, `useAuth()`
- Produces:
  - `exportUserData(userId: string): Promise<string>` - returns JSON string
  - `deleteUserAccount(userId: string): Promise<void>` - soft deletes account
  - `updateConsents(userId: string, consents: ConsentPreferences): Promise<void>`

- [ ] **Step 1: Write test for data export**

```typescript
// src/lib/__tests__/lgpd.test.ts
import { exportUserData } from '../lgpd';

test('exports user data as JSON', async () => {
  const mockUserId = '123';
  const result = await exportUserData(mockUserId);
  const data = JSON.parse(result);
  
  expect(data).toHaveProperty('profile');
  expect(data).toHaveProperty('generated_at');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test lgpd.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement lgpd utility functions**

Create `src/lib/lgpd.ts`:
- `exportUserData(userId)`: Query profile, patients (anonymized), meal_plans (metadata only), return JSON string
- `deleteUserAccount(userId)`: Update `profiles.deleted_at = NOW()`, anonymize email as `deleted_${userId}@nutriflow.com`, anonymize related patient data, sign out user
- `updateConsents(userId, consents)`: Update `profiles.consent_preferences` JSONB field

- [ ] **Step 4: Implement LGPD page**

Create/modify `src/pages/legal/LGPD.tsx`:
- Public version: Sections explaining LGPD compliance (spec Section 4.9), list of data collected, user rights, CTA "Gerenciar Meus Dados"
- Auth version: Same content + "Meus Dados Pessoais" card showing profile data + 3 action buttons:
  - "Exportar Meus Dados" → calls `exportUserData()`, downloads JSON
  - "Solicitar Exclusão" → opens confirmation modal, calls `deleteUserAccount()` on confirm
  - "Atualizar Consentimentos" → form with checkboxes, calls `updateConsents()`
- Wrap in HybridPage

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test lgpd.test.ts`  
Expected: PASS

- [ ] **Step 6: Test LGPD functionality**

- Export data → downloads valid JSON
- Update consents → saves to profiles table
- Delete account → soft deletes, logs out, redirects

- [ ] **Step 7: Commit**

```bash
git add src/lib/lgpd.ts src/pages/legal/LGPD.tsx
git commit -m "feat: add LGPD page with data management tools

- Export user data as JSON
- Soft delete account with anonymization
- Consent preferences management
- Public LGPD compliance info

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 10: Routes and Footer Integration

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Footer.tsx` (or wherever footer links are)

**Interfaces:**
- Consumes: All page components from Tasks 3-9
- Produces: Updated routing table and footer links

- [ ] **Step 1: Add routes to App.tsx**

Modify `src/App.tsx`:
- Import all new pages with `lazy()`:
```typescript
const Atendimento = lazy(() => import("./pages/recursos/Atendimento"));
const Prescricao = lazy(() => import("./pages/recursos/Prescricao"));
const Gestao = lazy(() => import("./pages/recursos/Gestao"));
const Blog = lazy(() => import("./pages/empresa/Blog"));
const BlogPost = lazy(() => import("./pages/empresa/BlogPost"));
const Contato = lazy(() => import("./pages/empresa/Contato"));
const CentralAjuda = lazy(() => import("./pages/suporte/CentralAjuda"));
const Treinamentos = lazy(() => import("./pages/suporte/Treinamentos"));
const TrainingCourse = lazy(() => import("./pages/suporte/TrainingCourse"));
const Status = lazy(() => import("./pages/suporte/Status"));
const LGPD = lazy(() => import("./pages/legal/LGPD"));
```
- Add routes in `<Routes>`:
```typescript
<Route path="/recursos/atendimento" element={<Atendimento />} />
<Route path="/recursos/prescricao" element={<Prescricao />} />
<Route path="/recursos/gestao" element={<Gestao />} />
<Route path="/empresa/blog" element={<Blog />} />
<Route path="/empresa/blog/:slug" element={<BlogPost />} />
<Route path="/empresa/contato" element={<Contato />} />
<Route path="/suporte/ajuda" element={<CentralAjuda />} />
<Route path="/suporte/treinamentos" element={<Treinamentos />} />
<Route path="/suporte/treinamentos/:courseId" element={<TrainingCourse />} />
<Route path="/suporte/status" element={<Status />} />
<Route path="/legal/lgpd" element={<LGPD />} />
```

- [ ] **Step 2: Update Footer component links**

Find Footer component (likely `src/components/Footer.tsx` or in LandingPageProfessional), update all `href` or `to` attributes:
- Recursos: Atendimento → `/recursos/atendimento`, Prescrição → `/recursos/prescricao`, Gestão → `/recursos/gestao`
- Empresa: Blog → `/empresa/blog`, Contato → `/empresa/contato`
- Suporte: Central de Ajuda → `/suporte/ajuda`, Treinamentos → `/suporte/treinamentos`, Status → `/suporte/status`
- Legal: Privacidade → `/privacidade`, Termos → `/termos`, LGPD → `/legal/lgpd`

- [ ] **Step 3: Test all routes**

Visit each URL manually or with integration test:
- `/recursos/atendimento` → loads Atendimento page
- `/recursos/prescricao` → loads Prescricao page
- `/recursos/gestao` → loads Gestao page
- `/empresa/blog` → loads Blog page
- `/empresa/blog/cardapios-balanceados` → loads BlogPost page
- `/empresa/contato` → loads Contato page
- `/suporte/ajuda` → loads CentralAjuda page
- `/suporte/treinamentos` → loads Treinamentos page
- `/suporte/treinamentos/nutri-101` → loads TrainingCourse page
- `/suporte/status` → loads Status page
- `/legal/lgpd` → loads LGPD page

- [ ] **Step 4: Test footer links**

Click each footer link from landing page → navigates to correct page

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/Footer.tsx
git commit -m "feat: integrate footer pages into routing and navigation

- Add 11 new routes to App.tsx (lazy-loaded)
- Update Footer component links to new routes
- All footer pages now accessible

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 11: Testing and Validation

**Files:**
- Create: `cypress/e2e/footer-pages.cy.ts` (if using Cypress) or equivalent test file

**Interfaces:**
- Consumes: All pages from previous tasks
- Produces: E2E test suite covering critical flows

- [ ] **Step 1: Write E2E test for public→auth flow**

```typescript
// cypress/e2e/footer-pages.cy.ts (or similar)
describe('Footer Pages - Public to Auth Flow', () => {
  it('shows public version when logged out', () => {
    cy.visit('/recursos/atendimento');
    cy.contains('Sistema de Agendamento Inteligente');
    cy.contains('Começar Grátis');
  });

  it('redirects to auth version when logged in', () => {
    cy.login('test@example.com', 'password'); // helper function
    cy.visit('/recursos/atendimento');
    cy.url().should('include', '/agenda');
  });

  it('blog paywall works correctly', () => {
    cy.visit('/empresa/blog/cardapios-balanceados');
    cy.contains('Continue lendo. Cadastre-se grátis');
    
    cy.login('test@example.com', 'password');
    cy.visit('/empresa/blog/cardapios-balanceados');
    cy.contains('Continue lendo').should('not.exist');
  });
});
```

- [ ] **Step 2: Run E2E tests**

Run: `npm run test:e2e` or equivalent  
Expected: All tests PASS

- [ ] **Step 3: Manual mobile responsiveness check**

Open DevTools, test each page at:
- 320px (mobile)
- 768px (tablet)
- 1024px (desktop)
Verify no horizontal scroll, all cards/grids stack properly

- [ ] **Step 4: Performance check with Lighthouse**

Run Lighthouse on key pages:
- `/recursos/atendimento`
- `/empresa/blog`
- `/suporte/treinamentos`
Target: LCP < 1.5s, FCP < 1.0s, Score > 90

- [ ] **Step 5: Accessibility check**

Run axe DevTools or Lighthouse accessibility audit on all pages. Fix critical issues (missing alt text, color contrast, ARIA labels).

- [ ] **Step 6: Cross-browser test**

Test in Chrome, Firefox, Safari (if available). Verify video embeds work, all links navigate correctly.

- [ ] **Step 7: Commit**

```bash
git add cypress/e2e/ (or test files)
git commit -m "test: add E2E tests for footer pages

- Public/auth flow validation
- Blog paywall test
- Mobile responsiveness verified
- Performance and accessibility checks passed

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 12: Deployment and Final Verification

**Files:**
- Modify: `netlify.toml` (if needed for new routes)

**Interfaces:**
- Consumes: All completed tasks
- Produces: Deployed production build on Netlify

- [ ] **Step 1: Build locally**

Run: `npm run build`  
Expected: Build succeeds with no errors

- [ ] **Step 2: Test production build locally**

Run: `npm run preview`  
Visit all pages, verify production bundle works

- [ ] **Step 3: Push to main branch**

```bash
git push origin main
```

- [ ] **Step 4: Monitor Netlify deploy**

Watch Netlify dashboard, ensure deploy succeeds (~2-3 minutes)

- [ ] **Step 5: Verify production site**

Visit `https://nutriflow2026.netlify.app/` (or actual domain), test:
- All footer links work
- Public/auth switching works
- No console errors
- Mobile responsive
- All images load

- [ ] **Step 6: Test database operations in production**

- Submit support ticket → check Supabase dashboard
- Mark training video complete → verify progress saves
- Export LGPD data → downloads correctly

- [ ] **Step 7: Final commit (if any fixes needed)**

If issues found in production:
```bash
git add .
git commit -m "fix: production deployment issues

[describe fixes]

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push origin main
```

---

## Post-Implementation

After all tasks complete:

1. **Update documentation:** Add new pages to README.md or project docs
2. **Analytics setup:** Add tracking events for CTAs, page views (Google Analytics, PostHog, etc.)
3. **SEO optimization:** Add meta tags, Open Graph images for each page
4. **Monitor logs:** Check Sentry/Vercel/Netlify logs for errors in first 24 hours
5. **User feedback:** Survey users on new pages, iterate based on feedback

---

**Plan complete. Ready for execution via superpowers:subagent-driven-development or superpowers:executing-plans.**

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
