# Footer Pages Implementation - Design Specification

**Date:** 2026-10-08  
**Status:** Approved for Implementation  
**Author:** Claude (Superpowers Brainstorming)

---

## 1. Executive Summary

Implement 8 missing footer pages + enhance 1 existing (LGPD) with hybrid public/authenticated versions. All pages use a single URL that adapts content based on authentication state, providing marketing content to visitors and full functionality to logged-in users.

**Scope:**
- 3 Recursos pages (Atendimento, Prescrição, Gestão)
- 2 Empresa pages (Blog, Contato)
- 3 Suporte pages (Central de Ajuda, Treinamentos, Status)
- 1 Legal page (LGPD)

**Success Criteria:**
- All footer links functional and deployed to production
- Public versions drive signups with clear CTAs
- Authenticated versions provide real tools/data
- Seamless UX (no jarring redirects, smooth transitions)
- Mobile-responsive, fast loading (<2s)

---

## 2. Architecture Overview

### 2.1 Hybrid Page Pattern

**Core Concept:** One URL, two experiences based on `useAuth()` state.

```typescript
// Pattern used across all pages
<HybridPage
  publicContent={<MarketingVersion />}
  authContent={<FunctionalVersion />}
/>
```

**Flow:**
```
User visits /recursos/atendimento
  ↓
HybridPage checks useAuth()
  ↓
  ├─ user = null → PublicLayout + Marketing content + CTA
  └─ user = object → AuthLayout + Full tool/data
```

### 2.2 File Structure

```
src/
├── pages/
│   ├── recursos/
│   │   ├── Atendimento.tsx
│   │   ├── Prescricao.tsx
│   │   └── Gestao.tsx
│   ├── empresa/
│   │   ├── Blog.tsx
│   │   ├── BlogPost.tsx
│   │   └── Contato.tsx
│   ├── suporte/
│   │   ├── CentralAjuda.tsx
│   │   ├── Treinamentos.tsx
│   │   └── Status.tsx
│   └── legal/
│       └── LGPD.tsx
├── components/
│   ├── hybrid/
│   │   ├── HybridPage.tsx
│   │   ├── PublicLayout.tsx
│   │   └── LockedFeature.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── BlogList.tsx
│   │   └── BlogContent.tsx
│   ├── training/
│   │   ├── VideoPlayer.tsx
│   │   ├── CourseCard.tsx
│   │   ├── CourseProgress.tsx
│   │   └── VideoList.tsx
│   └── support/
│       ├── FAQAccordion.tsx
│       ├── StatusCard.tsx
│       ├── TicketForm.tsx
│       └── TicketHistory.tsx
├── content/
│   ├── blog/
│   │   └── posts.json
│   ├── faq/
│   │   ├── public.json
│   │   └── auth.json
│   ├── trainings.json
│   └── status.json
└── lib/
    └── mdx.ts (if using MDX for blog)
```

### 2.3 Routes (App.tsx additions)

```typescript
// Recursos
<Route path="/recursos/atendimento" element={<Atendimento />} />
<Route path="/recursos/prescricao" element={<Prescricao />} />
<Route path="/recursos/gestao" element={<Gestao />} />

// Empresa
<Route path="/empresa/blog" element={<Blog />} />
<Route path="/empresa/blog/:slug" element={<BlogPost />} />
<Route path="/empresa/contato" element={<Contato />} />

// Suporte
<Route path="/suporte/ajuda" element={<CentralAjuda />} />
<Route path="/suporte/treinamentos" element={<Treinamentos />} />
<Route path="/suporte/treinamentos/:courseId" element={<TrainingCourse />} />
<Route path="/suporte/status" element={<Status />} />

// Legal
<Route path="/legal/lgpd" element={<LGPD />} />
```

---

## 3. Component Specifications

### 3.1 HybridPage Component

**Purpose:** Core wrapper that detects auth and renders appropriate version.

```typescript
interface HybridPageProps {
  publicContent: React.ReactNode;
  authContent: React.ReactNode;
  title: string;
  description?: string;
}

export function HybridPage({
  publicContent,
  authContent,
  title,
  description
}: HybridPageProps) {
  const { user } = useAuth();
  
  useEffect(() => {
    document.title = `${title} | NutriFlow`;
  }, [title]);
  
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        {authContent}
      </div>
    );
  }
  
  return <PublicLayout>{publicContent}</PublicLayout>;
}
```

### 3.2 PublicLayout Component

**Purpose:** Marketing header + footer for unauthenticated users.

```typescript
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="NutriFlow" className="w-10 h-10" />
            <span className="font-bold text-xl">NutriFlow</span>
          </Link>
          <div className="flex gap-3">
            <Button asChild variant="ghost">
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main>{children}</main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
```

### 3.3 LockedFeature Component

**Purpose:** Teaser for premium features with CTA.

```typescript
interface LockedFeatureProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function LockedFeature({ title, description, icon }: LockedFeatureProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-lg">{title}</h3>
          <Lock className="w-4 h-4 text-muted-foreground ml-auto" />
        </div>
        <p className="text-muted-foreground">{description}</p>
        <Button asChild className="w-full">
          <Link to="/auth">Desbloquear Agora</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 4. Page-by-Page Specifications

### 4.1 Recursos/Atendimento

**URL:** `/recursos/atendimento`

#### Public Version:
- **Hero Section**
  - Title: "Sistema de Agendamento Inteligente"
  - Subtitle: "Gerencie consultas, envie lembretes automáticos e mantenha histórico completo"
  - CTA Button: "Começar Teste Grátis" → `/auth`
  - Hero Image: Calendar screenshot/illustration

- **Features Grid (3 cards)**
  1. Calendário Sincronizado - "Visualize todos os agendamentos em um só lugar"
  2. Lembretes Automáticos - "WhatsApp e email para pacientes"
  3. Histórico Completo - "Acesse consultas passadas e anotações"

- **Pricing Table**
  - Reuse existing pricing cards from landing page
  - Highlight "Atendimento" feature in each plan

- **Final CTA**
  - "Pronto para transformar seu atendimento?"
  - Button: "Iniciar Agora"

#### Authenticated Version:
**Option A (Reuse):** Redirect to `/agenda` if page exists  
**Option B (New):** Full calendar interface:
- Month/Week/Day view toggle
- List of upcoming appointments (next 7 days)
- Button: "Nova Consulta" → opens modal/form
- Filters: Próximas | Passadas | Canceladas
- Integration with `appointments` table

**Implementation:** Use Option A initially (redirect), implement Option B in Phase 2 if `/agenda` doesn't exist.

---

### 4.2 Recursos/Prescrição

**URL:** `/recursos/prescricao`

#### Public Version:
- **Hero Section**
  - Title: "Cardápios Personalizados com IA em Segundos"
  - Subtitle: "Base TACO completa, receitas customizadas, ajustes automáticos"
  - CTA: "Gerar Meu Primeiro Cardápio"
  - Hero: Screenshot of meal plan builder

- **Interactive Demo**
  - Static meal plan example (7 dias × 4 refeições)
  - Hover effects showing nutritional info
  - "Esta é apenas uma prévia. Cadastre-se para personalizar"

- **Features List**
  - IA generativa para cardápios
  - Biblioteca TACO (3000+ alimentos)
  - Receitas customizadas
  - Ajustes automáticos (calorias, macros)
  - Exportação PDF profissional

- **Template Gallery**
  - 4 cards: Emagrecimento, Hipertrofia, Vegetariano, Low Carb
  - Each card is locked: "Ver Template Completo" → `/auth`

#### Authenticated Version:
**Option A:** Redirect to `/gerar-cardapio` or `/cardapios`  
**Option B:** Full meal plan builder interface with library

**Implementation:** Use Option A (redirect to existing flow).

---

### 4.3 Recursos/Gestão

**URL:** `/recursos/gestao`

#### Public Version:
- **Hero Section**
  - Title: "Gestão Completa de Pacientes e Consultório"
  - Subtitle: "Dashboard em tempo real, relatórios automáticos, controle financeiro"
  - CTA: "Ver Dashboard Demo"
  - Hero: Dashboard screenshot with blur on sensitive data

- **Feature Cards (4)**
  1. Dashboard KPIs - "Pacientes ativos, consultas, receita"
  2. Gestão de Pacientes - "Ficha completa, evolução, anexos"
  3. Relatórios - "Exportação automática, análise de resultados"
  4. Financeiro - "Controle de pagamentos e receita"

- **Comparison Table**
  - Free vs Pro vs Enterprise
  - Highlight gestão features availability

- **Screenshots Section**
  - 3 images: Dashboard, Patient detail, Reports

#### Authenticated Version:
- **Simple redirect** to `/dashboard`
- No custom UI needed (already exists)

---

### 4.4 Empresa/Blog

**URL:** `/empresa/blog` (list) | `/empresa/blog/:slug` (post)

#### Blog List Page:

**Public Version:**
- Grid layout (3 columns desktop, 1 mobile)
- Each post card shows:
  - Featured image
  - Title
  - Excerpt (150 chars)
  - Author + Date
  - Category badge
  - "Ler Mais" button
- Pagination (6 posts per page)
- Sidebar: Categories filter, Recent posts

**Authenticated Version:**
- Same layout
- Badge "Premium" on exclusive posts
- Posts open in full (no preview limit)

#### Blog Post Page:

**Public Version:**
- Header: Title, author, date, category
- Featured image
- Content: First 2-3 paragraphs visible
- Paywall: "Continue lendo. Cadastre-se grátis" → `/auth`
- Related posts section

**Authenticated Version:**
- Full post content
- No paywall
- Author bio at bottom
- Comments section (future)

**Data Structure (JSON):**
```json
{
  "posts": [
    {
      "slug": "cardapios-balanceados",
      "title": "Como Criar Cardápios Balanceados",
      "excerpt": "Aprenda técnicas profissionais...",
      "content": "Full markdown content here...",
      "author": "Dra. Maria Silva",
      "authorImage": "/images/authors/maria.jpg",
      "date": "2026-10-08",
      "category": "Nutrição Clínica",
      "featuredImage": "/images/blog/cardapios.jpg",
      "premium": false,
      "readTime": "5 min"
    }
  ],
  "categories": ["Nutrição Clínica", "Gestão", "Tecnologia", "Receitas"]
}
```

**Implementation:** Use JSON file initially. Can migrate to Supabase table `blog_posts` in Phase 2.

---

### 4.5 Empresa/Contato

**URL:** `/empresa/contato`

#### Public Version:
- **Hero**
  - Title: "Entre em Contato"
  - Subtitle: "Estamos aqui para ajudar"

- **Contact Form**
  - Fields: Nome, Email, Assunto (dropdown), Mensagem
  - Submit button: "Enviar Mensagem"
  - Success message: "Mensagem enviada! Responderemos em até 24h"

- **Contact Info Cards (3)**
  1. Email: contato@nutriflow.com
  2. Telefone: (11) 9999-9999
  3. Endereço: São Paulo, SP

- **Map**
  - Static image or simple embed (low priority)

#### Authenticated Version:
- **Same form** with additions:
  - Pre-filled: Nome, Email (from profile)
  - Extra field: "Número do Paciente" (optional, to reference)
  - Badge: "Suporte Prioritário" if user.subscription === 'pro'

- **Ticket History Section**
  - Table of past tickets from `support_tickets`
  - Columns: Data, Assunto, Status, Ações
  - Click to view ticket thread (simple modal)

**Data Model:**
```typescript
// Supabase table: support_tickets
{
  id: uuid,
  user_id: uuid,
  subject: string,
  message: text,
  status: 'open' | 'in_progress' | 'resolved' | 'closed',
  priority: 'normal' | 'high',
  created_at: timestamp,
  updated_at: timestamp
}
```

**Integration:** Form submits to Supabase `support_tickets` table. Email notification via Supabase Edge Function (future).

---

### 4.6 Suporte/Central de Ajuda

**URL:** `/suporte/ajuda`

#### Public Version:
- **Search Bar**
  - Large centered search: "Como podemos ajudar?"
  - Placeholder: "Pesquisar artigos, tutoriais..."
  - Simple filter: shows matching questions on type

- **FAQ Categories (5)**
  1. Primeiros Passos
  2. Cardápios
  3. Pacientes
  4. Planos e Pagamento
  5. Segurança

- **Accordion Component**
  - Each category expands to show 3-5 questions
  - Questions are collapsible with answers

- **CTA Footer**
  - "Não encontrou o que procurava?"
  - Button: "Cadastre-se para acessar mais conteúdo"

#### Authenticated Version:
- **Same structure** with enhancements:
  - 8 categories (3 more: Integrações, Relatórios, API)
  - 2-3x more questions per category
  - Search works across all content (full-text)
  - Each article has: Title, Body, Tags, Related articles
  - Widget: "Ainda precisa de ajuda? Chat com suporte"

**Data Structure:**
```json
// content/faq/public.json
{
  "categories": [
    {
      "id": "getting-started",
      "title": "Primeiros Passos",
      "icon": "Rocket",
      "questions": [
        {
          "q": "Como criar minha conta?",
          "a": "Para criar sua conta, clique em..."
        }
      ]
    }
  ]
}

// content/faq/auth.json (3x more content)
```

---

### 4.7 Suporte/Treinamentos

**URL:** `/suporte/treinamentos` (list) | `/suporte/treinamentos/:courseId` (course page)

#### Trainings List Page:

**Public Version:**
- **Hero**
  - Title: "Capacitação Profissional para Nutricionistas"
  - Subtitle: "Cursos online, certificados reconhecidos"
  - CTA: "Ver Cursos Gratuitos"

- **Course Grid**
  - Cards showing:
    - Thumbnail image
    - Course title
    - Duration (ex: "2h 30min")
    - Level badge (Iniciante/Intermediário/Avançado)
    - Badge: "Gratuito" or "Premium"
    - Button: "Ver Curso"

- **Free courses** (2-3): Open preview page
- **Premium courses**: Locked with CTA

#### Authenticated Version:
- Same grid, all courses unlocked
- Shows progress badge: "40% completo" if started

#### Course Page:

**Public Version:**
- Course header: Title, description, instructor
- Module list (locked except first video)
- First video: 30-second preview or thumbnail
- CTA: "Desbloquear Curso Completo"

**Authenticated Version:**
- **Full video player** (YouTube/Vimeo embed)
- **Sidebar:**
  - Module list (collapsible)
  - Each video: title, duration, checkmark if completed
  - Click to switch video
- **Progress bar** at top: "Progresso: 60% (6/10 vídeos)"
- **Certificate section** (appears at 100%):
  - "Parabéns! Você completou o curso"
  - Button: "Baixar Certificado" → generates PDF

**Data Structure:**
```json
// content/trainings.json
{
  "courses": [
    {
      "id": "nutri-101",
      "title": "Fundamentos da Nutrição Clínica",
      "description": "Aprenda os conceitos essenciais...",
      "instructor": "Dra. Ana Costa",
      "thumbnail": "/images/courses/nutri-101.jpg",
      "duration": "2h 30min",
      "level": "Iniciante",
      "premium": true,
      "modules": [
        {
          "id": "m1",
          "title": "Introdução à Nutrição",
          "videos": [
            {
              "id": "v1",
              "title": "Bem-vindo ao Curso",
              "duration": "5:23",
              "youtube_id": "abc123xyz",
              "free_preview": true
            },
            {
              "id": "v2",
              "title": "O que é Nutrição Clínica?",
              "duration": "12:45",
              "youtube_id": "def456uvw",
              "free_preview": false
            }
          ]
        }
      ]
    }
  ]
}
```

**Supabase Table:**
```sql
-- training_progress
CREATE TABLE training_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id, video_id)
);
```

**VideoPlayer Component:**
```typescript
<div className="aspect-video bg-black rounded-lg overflow-hidden">
  <iframe
    src={`https://www.youtube.com/embed/${video.youtube_id}`}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="w-full h-full"
  />
</div>
```

**Progress Tracking:**
- Mark video as completed when user watches >90% (track via YouTube API or manual button)
- Update `training_progress` table
- Recalculate course completion percentage
- Show certificate option when 100% reached

---

### 4.8 Suporte/Status

**URL:** `/suporte/status`

**Both versions identical (with minor additions for authenticated):**

- **Uptime Hero**
  - Large number: "99.94% Uptime"
  - Subtitle: "Últimos 30 dias"
  - Visual: Uptime bar chart (green dots for each day)

- **Service Status Cards (4)**
  - Each card:
    - Service name: "API", "Dashboard", "Banco de Dados", "Autenticação"
    - Status indicator: Green dot + "Operacional"
    - Latency: "45ms"
  - Status colors:
    - Green: Operacional
    - Yellow: Degraded
    - Red: Indisponível

- **Incident Timeline**
  - Title: "Histórico de Incidentes"
  - List last 5 incidents:
    - Date, title, status badge, duration
    - Example: "2026-10-05 - Lentidão no Dashboard - Resolvido - 23min"
  - If no incidents: "Nenhum incidente nos últimos 30 dias 🎉"

- **Authenticated Addition:**
  - Toggle switch: "Notificar-me sobre incidentes"
  - Saves preference to user profile
  - (Email notifications future feature)

**Data Structure:**
```json
// content/status.json (mockado)
{
  "uptime": 99.94,
  "services": [
    {
      "name": "API",
      "status": "operational",
      "latency": "45ms"
    },
    {
      "name": "Dashboard",
      "status": "operational",
      "latency": "120ms"
    },
    {
      "name": "Banco de Dados",
      "status": "operational",
      "latency": "12ms"
    },
    {
      "name": "Autenticação",
      "status": "operational",
      "latency": "89ms"
    }
  ],
  "incidents": [
    {
      "date": "2026-10-05",
      "title": "Lentidão no Dashboard",
      "status": "resolved",
      "duration": "23min",
      "description": "Identificado gargalo em queries. Corrigido via otimização de índices."
    }
  ],
  "uptime_history": [
    { "date": "2026-10-07", "uptime": 100 },
    { "date": "2026-10-06", "uptime": 100 },
    { "date": "2026-10-05", "uptime": 98.4 }
    // ... 30 days
  ]
}
```

**Implementation:** Static JSON for now. Can integrate with real monitoring service (Vercel Analytics, Uptime Robot) in Phase 2.

---

### 4.9 Legal/LGPD

**URL:** `/legal/lgpd`

#### Public Version:
- **Hero**
  - Title: "Lei Geral de Proteção de Dados (LGPD)"
  - Subtitle: "Transparência e controle sobre seus dados pessoais"

- **Content Sections:**
  1. **Nossa Conformidade LGPD**
     - Explicação de como o NutriFlow coleta, processa e protege dados
     - Certificações/auditorias (se houver)

  2. **Dados que Coletamos**
     - Lista: Nome, email, CRN, telefone, endereço
     - Dados de pacientes (anônimos em relatórios)
     - Dados de uso (analytics)

  3. **Como Usamos Seus Dados**
     - Prestação do serviço
     - Comunicação (emails transacionais)
     - Melhorias no produto

  4. **Compartilhamento**
     - Não vendemos dados a terceiros
     - Compartilhamos apenas com processadores (Supabase, Vercel)
     - Listagem de subprocessadores

  5. **Seus Direitos como Titular**
     - Acessar seus dados
     - Retificar dados incorretos
     - Solicitar exclusão (direito ao esquecimento)
     - Portabilidade de dados
     - Revogar consentimento

- **CTA**
  - "Para exercer seus direitos, faça login ou cadastre-se"
  - Button: "Gerenciar Meus Dados"

#### Authenticated Version:
- **Same content sections** +

- **Meus Dados Pessoais Section**
  - Card showing user data from `profiles` table:
    ```
    Nome: João Silva
    Email: joao@email.com
    CRN: 12345/SP
    Telefone: (11) 98765-4321
    Criado em: 15/08/2026
    ```

- **Action Buttons:**
  1. **Exportar Meus Dados**
     - Generates JSON file with all user data
     - Includes: profile, patients (anonymized), meal_plans, appointments
     - Downloads as `nutriflow-dados-joao-silva-2026-10-08.json`

  2. **Solicitar Exclusão da Conta**
     - Opens confirmation modal:
       - "Esta ação é irreversível. Todos os seus dados serão excluídos."
       - Checkbox: "Entendo que perderei acesso a todos os dados"
       - Button: "Confirmar Exclusão"
     - On confirm: Soft delete (sets `deleted_at` timestamp)
     - Sends confirmation email
     - Redirects to goodbye page

  3. **Atualizar Consentimentos**
     - Checkboxes:
       - ✅ Emails sobre atualizações do produto
       - ✅ Pesquisas de satisfação
       - ❌ Emails promocionais de parceiros
     - Saves to `profiles.consent_preferences` (JSONB field)

**Data Export Function:**
```typescript
async function exportUserData(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  const { data: patients } = await supabase
    .from('patients')
    .select('id, goal, created_at')
    .eq('nutritionist_id', userId);
    
  // ... fetch other user-related data
  
  const exportData = {
    profile,
    patients: patients.map(p => ({ ...p, name: '[ANONIMIZADO]' })),
    generated_at: new Date().toISOString()
  };
  
  return JSON.stringify(exportData, null, 2);
}
```

**Account Deletion Function:**
```typescript
async function deleteAccount(userId: string) {
  // Soft delete (preserves data for legal retention)
  await supabase
    .from('profiles')
    .update({ 
      deleted_at: new Date().toISOString(),
      email: `deleted_${userId}@nutriflow.com` // anonymize
    })
    .eq('id', userId);
    
  // Anonymize related data
  await supabase
    .from('patients')
    .update({ 
      name: '[PACIENTE EXCLUÍDO]',
      email: null,
      phone: null
    })
    .eq('nutritionist_id', userId);
    
  // Sign out
  await supabase.auth.signOut();
}
```

---

## 5. Design System & Styling

### 5.1 Color Palette

Following existing NutriFlow design (from architecture plan):

```css
--primary: #518C5B; /* Sage Green */
--secondary: #C4764A; /* Terracotta */
--background: #FAF8F5; /* Warm Off-white */
--card: #FFFFFF;
--muted: #E8E6E3;
```

### 5.2 Typography

- **Headings:** Outfit (existing)
- **Body:** Outfit (sans-serif)
- **Serif accent:** Playfair Display (for blog post titles)

### 5.3 Component Patterns

**Hero Section:**
```tsx
<section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-transparent">
  <div className="container mx-auto px-4">
    <div className="max-w-3xl mx-auto text-center space-y-6">
      <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>
      <p className="text-xl text-muted-foreground">{subtitle}</p>
      <Button size="lg">{cta}</Button>
    </div>
  </div>
</section>
```

**Feature Card:**
```tsx
<Card className="hover:shadow-lg transition-shadow">
  <CardContent className="p-6 space-y-4">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="font-semibold text-lg">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </CardContent>
</Card>
```

**Status Indicator:**
```tsx
<div className="flex items-center gap-2">
  <div className={`w-3 h-3 rounded-full ${
    status === 'operational' ? 'bg-green-500' :
    status === 'degraded' ? 'bg-yellow-500' :
    'bg-red-500'
  }`} />
  <span className="font-medium">{label}</span>
</div>
```

### 5.4 Responsive Breakpoints

```css
sm: 640px  /* Mobile landscape */
md: 768px  /* Tablet */
lg: 1024px /* Desktop */
xl: 1280px /* Large desktop */
```

**Grid layouts:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

---

## 6. Data Models & Integration

### 6.1 New Supabase Tables

```sql
-- Support tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Training progress
CREATE TABLE training_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id, video_id)
);

-- Add to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_preferences JSONB DEFAULT '{"product_updates": true, "surveys": true, "partner_promos": false}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
```

### 6.2 Content Files (Static JSON)

**Initial content to create:**
1. `content/blog/posts.json` - 5 sample blog posts
2. `content/faq/public.json` - 5 categories, 15 questions
3. `content/faq/auth.json` - 8 categories, 40 questions
4. `content/trainings.json` - 3 courses with modules/videos
5. `content/status.json` - Service status data

### 6.3 Existing Integrations (Reuse)

- `appointments` table → Atendimento auth version
- `meal_plans` table → Prescrição auth version
- `patients`, `financial_records` → Gestão auth version (redirect to /dashboard)
- `profiles` table → LGPD data export

---

## 7. Testing & Validation

### 7.1 Functional Tests

**For each page, test:**
1. Public version renders correctly (logged out)
2. Auth version renders correctly (logged in)
3. HybridPage switches seamlessly on auth state change
4. All CTAs link to correct destinations
5. Forms submit and validate properly
6. Responsive layout works on mobile/tablet/desktop

**Specific tests:**
- Blog: Pagination works, post content displays
- Contato: Form submission creates ticket in DB
- Treinamentos: Video player loads, progress tracks
- LGPD: Data export generates valid JSON, account deletion soft-deletes

### 7.2 Browser Testing (Vercel Agent)

Use `preview_start` to launch dev server, then:
1. `preview_snapshot` to verify layout
2. `preview_click` to test CTAs
3. `preview_console_logs` to catch errors
4. `preview_screenshot` for visual proof

Test matrix:
- Chrome (desktop)
- Safari (mobile)
- Firefox

### 7.3 Performance

**Targets:**
- First Contentful Paint < 1.5s
- Time to Interactive < 2.5s
- Lighthouse score > 90

**Optimizations:**
- Lazy load images (blog, trainings)
- Code-split routes (React.lazy)
- Compress JSON files (gzip)

---

## 8. Deployment Strategy

### 8.1 Phase 1: Core Pages (Week 1)
- HybridPage component + layouts
- Recursos pages (3)
- Deploy to staging, test

### 8.2 Phase 2: Content Pages (Week 1)
- Blog + Contato
- Central de Ajuda
- Deploy to staging

### 8.3 Phase 3: Advanced Features (Week 2)
- Treinamentos with video player
- Status page
- LGPD with data export/deletion
- Full testing suite

### 8.4 Production Deployment
- Run `/simplify` to review code quality
- Run tests locally
- Deploy to Netlify (auto via git push)
- Update footer links to new routes
- Monitor logs for errors

---

## 9. Future Enhancements (Post-MVP)

**Phase 2 features (not in initial implementation):**
1. Blog with real CMS (Supabase `blog_posts` table + admin UI)
2. Comments on blog posts
3. Live chat widget in Central de Ajuda
4. Email notifications for support tickets
5. Real status page integration (Vercel Analytics, Sentry)
6. Video upload for trainings (instead of YouTube embed)
7. Certificate PDF generation with custom branding
8. LGPD compliance dashboard (admin view of data requests)

---

## 10. Success Metrics

**After deployment, track:**
1. **Engagement:** Page views on each footer page
2. **Conversion:** CTA clicks → signups from public versions
3. **Usage:** Time spent on auth versions (blog, trainings)
4. **Support:** Ticket volume via Contato form
5. **Completion:** Training course completion rate

**KPIs (90 days post-launch):**
- 30% of visitors click footer links
- 10% conversion rate from footer pages to signup
- 50% of authenticated users access at least one footer page
- <24h avg response time on support tickets
- 40% completion rate on training courses

---

## 11. Implementation Plan Summary

**Total: 9 pages, ~25 components, 2 new tables, 5 content files**

**Estimated effort:**
- Development: 12-16 hours
- Testing: 4-6 hours
- Content creation: 2-3 hours
- Deployment: 1 hour

**Total:** ~20-25 hours of work

**Parallel execution strategy:**
1. **Agent 1:** Recursos pages (Atendimento, Prescrição, Gestão)
2. **Agent 2:** Empresa pages (Blog, Contato)
3. **Agent 3:** Suporte pages (Central Ajuda, Treinamentos, Status)
4. **Agent 4:** Legal page (LGPD) + Database migrations
5. **Agent 5:** Shared components (HybridPage, layouts)
6. **Agent 6:** Content creation (JSON files)
7. **Agent 7:** Testing & validation

Agents 1-4 depend on Agent 5 (shared components). Agent 6 can run independently. Agent 7 runs after all others complete.

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| HybridPage logic becomes complex | Keep detection simple (just check `user`), extract to custom hook |
| Blog content management is tedious | Start with JSON, document migration path to CMS |
| Video hosting costs (if self-hosted) | Use YouTube embed (free), track progress client-side |
| LGPD compliance gaps | Consult legal before launch, document all data flows |
| Performance issues with large content | Implement pagination, lazy loading, code-splitting |
| Mobile UX suffers | Mobile-first design, test early on real devices |

---

## 13. Open Questions

None remaining. All clarifications obtained during brainstorming.

---

## Appendices

### A. Example Content

**Blog Post Example (content/blog/posts.json):**
```json
{
  "slug": "cardapios-balanceados",
  "title": "Como Criar Cardápios Balanceados em 5 Passos",
  "excerpt": "Aprenda técnicas profissionais para montar planos alimentares que seus pacientes vão adorar seguir.",
  "content": "# Como Criar Cardápios Balanceados\n\n## Passo 1: Avalie o Paciente\n\nAntes de...",
  "author": "Dra. Maria Silva",
  "authorBio": "Nutricionista clínica com 10 anos de experiência",
  "authorImage": "/images/authors/maria.jpg",
  "date": "2026-10-08",
  "category": "Nutrição Clínica",
  "tags": ["cardápios", "planejamento", "macros"],
  "featuredImage": "/images/blog/cardapios-balanceados.jpg",
  "premium": false,
  "readTime": "5 min"
}
```

**FAQ Example (content/faq/public.json):**
```json
{
  "categories": [
    {
      "id": "getting-started",
      "title": "Primeiros Passos",
      "icon": "Rocket",
      "questions": [
        {
          "id": "q1",
          "question": "Como criar minha conta?",
          "answer": "Para criar sua conta no NutriFlow, clique no botão 'Começar Grátis' no topo da página. Preencha seus dados (nome, email, CRN) e confirme seu email. Pronto! Você terá 14 dias de teste grátis."
        }
      ]
    }
  ]
}
```

**Training Example (content/trainings.json):**
```json
{
  "id": "nutri-101",
  "title": "Fundamentos da Nutrição Clínica",
  "description": "Curso completo para nutricionistas iniciantes. Aprenda desde conceitos básicos até técnicas avançadas de prescrição dietética.",
  "instructor": {
    "name": "Dra. Ana Costa",
    "bio": "PhD em Nutrição, 15 anos de experiência",
    "image": "/images/instructors/ana-costa.jpg"
  },
  "thumbnail": "/images/courses/nutri-101.jpg",
  "duration": "2h 30min",
  "level": "Iniciante",
  "premium": true,
  "modules": [
    {
      "id": "m1",
      "title": "Introdução à Nutrição Clínica",
      "videos": [
        {
          "id": "v1",
          "title": "Bem-vindo ao Curso",
          "duration": "5:23",
          "youtube_id": "dQw4w9WgXcQ",
          "free_preview": true,
          "description": "Visão geral do curso e objetivos de aprendizagem"
        }
      ]
    }
  ],
  "certificate": {
    "enabled": true,
    "issuer": "NutriFlow Academy",
    "hours": 2.5
  }
}
```

---

**END OF SPECIFICATION**

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
