# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evoluir o painel admin existente em um sistema completo de gerenciamento da plataforma NutriFlow com dashboard, gestão de nutris, suporte em tempo real, financeiro e configurações.

**Architecture:** Refatorar o monólito `Admin.tsx` (~820 linhas) em módulos separados por rota, criar AdminLayout/AdminSidebar dedicados, adicionar tabelas `admin_settings` e `admin_audit_log`, e integrar tudo via Supabase queries + Realtime. Manter RPC `is_current_user_master_admin` como gate de acesso.

**Tech Stack:** React 18, TypeScript, react-router-dom v6, Supabase JS v2, Recharts, shadcn/ui, Framer Motion, date-fns, Sonner toast

**Spec:** `docs/superpowers/specs/2026-10-21-admin-panel-design.md`

## Global Constraints

- Admin único: `diascristianoconsultor@gmail.com` — verificação por RPC `is_current_user_master_admin`
- Paleta verde NutriFlow: `#518C5B` como cor primária em todos os componentes admin
- Componentes UI: usar shadcn/ui + GlassCard + NeonText + PageHeader + StatCard existentes
- Zero dados mock: todas as queries devem bater no Supabase
- Rotas lazy-loaded via `React.lazy()` no App.tsx
- Commits frequentes com mensagem descritiva + co-author line
- Tabelas existentes: `profiles`, `support_tickets`, `support_ticket_messages`, `patients`, `meal_plans`, `appointments`, `financial_records`
- Novas tabelas: `admin_settings`, `admin_audit_log`

## Review Focus

1. **Non-admin tentando acessar /admin** → deve ser redirecionado para /acesso-negado sem flash de conteúdo admin (AdminGuard deve mostrar loading até verificar)
2. **Toggle ativo/inativo falhando silenciosamente** → toast de erro obrigatório + rollback otimista no estado local se UPDATE falhar
3. **Chat de suporte perdendo mensagens** → Supabase Realtime subscription deve reconectar automaticamente; mensagens enviadas enquanto offline devem ser reenviadas
4. **Dashboard mostrando dados incorretos após ação admin** → invalidar TanStack Query cache após mutations (toggle, estender trial, etc.)
5. **Configurações globais não persistindo** → UPSERT em admin_settings com tratamento de erro; ler settings ao montar layout para aplicar feature flags

---

### Task 1: Criar tabelas admin_settings e admin_audit_log + alterar profiles

**Files:**
- Create: `supabase/migrations/20261021_admin_tables.sql`

**Interfaces:**
- Produces: tabelas `admin_settings` (key TEXT PK, value JSONB, updated_at), `admin_audit_log` (id UUID PK, action TEXT, target_type TEXT, target_id UUID, details JSONB, created_at), coluna `admin_notes TEXT` em profiles

- [ ] **Step 1: Escrever migration SQL**
Criar arquivo `supabase/migrations/20261021_admin_tables.sql` com:
```sql
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- RLS policies
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only access settings" ON admin_settings FOR ALL USING (auth.jwt()->>'email' = 'diascristianoconsultor@gmail.com');
CREATE POLICY "Admin only access audit log" ON admin_audit_log FOR ALL USING (auth.jwt()->>'email' = 'diascristianoconsultor@gmail.com') WITH CHECK (auth.jwt()->>'email' = 'diascristianoconsultor@gmail.com');
```

- [ ] **Step 2: Aplicar migration no Supabase**
Run: `npx supabase db push` ou aplicar via Supabase Dashboard SQL Editor
Expected: tabelas criadas sem erro

- [ ] **Step 3: Regenerar tipos Supabase**
Run: `npx supabase gen types typescript --project-id <PROJECT_ID> > src/integrations/supabase/types.ts`
Expected: tipos atualizados incluem admin_settings, admin_audit_log, admin_notes

- [ ] **Step 4: Commit**
```bash
git add supabase/migrations/20261021_admin_tables.sql src/integrations/supabase/types.ts
git commit -m "feat(admin): add admin_settings, admin_audit_log tables and profiles columns"
```

---

### Task 2: Criar AdminGuard component

**Files:**
- Create: `src/components/admin/AdminGuard.tsx`

**Interfaces:**
- Consumes: `useAuth` hook, `supabase` client, RPC `is_current_user_master_admin`
- Produces: `AdminGuard` component que renderiza children apenas se admin, senão redirect para /acesso-negado

- [ ] **Step 1: Implementar AdminGuard**
Em `src/components/admin/AdminGuard.tsx`:
- Receber `children: ReactNode` como prop
- Usar `useAuth()` para obter user e loading
- Se loading, mostrar spinner (mesmo padrão PageLoader do App.tsx)
- Se !user, navigate('/auth')
- Se user, chamar `supabase.rpc('is_current_user_master_admin')`
- Se RPC retorna false, navigate('/acesso-negado')
- Se true, renderizar children
- Export default

- [ ] **Step 2: Commit**
```bash
git add src/components/admin/AdminGuard.tsx
git commit -m "feat(admin): add AdminGuard component with RPC verification"
```

---

### Task 3: Criar AdminSidebar component

**Files:**
- Create: `src/components/admin/AdminSidebar.tsx`

**Interfaces:**
- Consumes: `useLocation`, `useNavigate`, `useAuth`, `useTheme`, lucide icons, logoImg
- Produces: `AdminSidebar` component seguindo padrão da AppSidebar existente mas com nav items admin

- [ ] **Step 1: Implementar AdminSidebar**
Em `src/components/admin/AdminSidebar.tsx`:
- Copiar estrutura da AppSidebar (collapsible, mobile support via props)
- Nav items: Visão Geral (/admin), Nutricionistas (/admin/nutris), Suporte (/admin/suporte), Financeiro (/admin/financeiro), Configurações (/admin/configuracoes)
- Separador
- Link "Voltar ao App" → /dashboard
- Badge de tickets pendentes no item Suporte (query COUNT support_tickets WHERE status = 'open')
- Mesmos padrões visuais: glass, cores primárias, collapsed state
- Props: `isMobile?: boolean`, `onNavigate?: () => void`

- [ ] **Step 2: Commit**
```bash
git add src/components/admin/AdminSidebar.tsx
git commit -m "feat(admin): add AdminSidebar with navigation and pending tickets badge"
```

---

### Task 4: Criar AdminLayout component

**Files:**
- Create: `src/components/admin/AdminLayout.tsx`

**Interfaces:**
- Consumes: `AdminSidebar`, `CommandBar`, Sheet components (mesmo pattern AppLayout)
- Produces: `AdminLayout` component que wrapa páginas admin com sidebar + mobile header

- [ ] **Step 1: Implementar AdminLayout**
Em `src/components/admin/AdminLayout.tsx`:
- Copiar estrutura do AppLayout.tsx
- Substituir `<AppSidebar>` por `<AdminSidebar>`
- Remover FloatingSupportButton (não faz sentido no admin)
- Manter CommandBar, mobile Sheet, md:ml-56 offset
- Props: `children: ReactNode`

- [ ] **Step 2: Commit**
```bash
git add src/components/admin/AdminLayout.tsx
git commit -m "feat(admin): add AdminLayout wrapping pages with AdminSidebar"
```

---

### Task 5: Criar AdminDashboard page

**Files:**
- Create: `src/pages/admin/AdminDashboard.tsx`

**Interfaces:**
- Consumes: `AdminLayout`, `PageHeader`, `StatCard`, `GlassCard`, `NeonText`, Recharts, supabase, date-fns
- Produces: Dashboard com KPIs reais e gráficos

- [ ] **Step 1: Implementar AdminDashboard**
Em `src/pages/admin/AdminDashboard.tsx`:
- Wrapar com `<AdminLayout>`
- `<PageHeader title="Visão Geral" subtitle="Painel administrativo NutriFlow" icon={<Shield>} />`
- Grid de StatCards: Nutris Ativos, Em Trial, Receita Mensal, Tickets Pendentes, Novos Hoje, Taxa Conversão
- Cada stat: query Supabase real (COUNT/SUM)
- Gráficos Recharts: LineChart evolução nutris (12 meses), BarChart receita (6 meses), PieChart distribuição planos
- Seção Alertas: trials expirando 3 dias, tickets abertos >48h
- Usar useMemo para dados dos gráficos, useEffect para fetch inicial
- Loading state com skeleton

- [ ] **Step 2: Commit**
```bash
git add src/pages/admin/AdminDashboard.tsx
git commit -m "feat(admin): add AdminDashboard with real KPIs and charts"
```

---

### Task 6: Extrair NutritionistList do Admin.tsx

**Files:**
- Create: `src/pages/admin/NutritionistList.tsx`
- Modify: `src/pages/Admin.tsx` (remover tab nutritionists inline)

**Interfaces:**
- Consumes: lógica existente de fetchNutritionists, toggleActive, filteredNutritionists do Admin.tsx
- Produces: página standalone `/admin/nutris` com lista + filtros + ações

- [ ] **Step 1: Extrair componente NutritionistList**
Mover para `src/pages/admin/NutritionistList.tsx`:
- Toda a lógica de nutritionists do Admin.tsx (fetchNutritionists, toggleActive, searchTerm, filteredNutritionists, getLicenseStatus)
- Stats cards (Total, Ativos, Em Teste, Inativos)
- Tabela com busca
- Adicionar filtros por status (Select: Todos/Ativos/Trial/Inativos)
- Adicionar link em cada linha para `/admin/nutris/:id`
- Wrapar com `<AdminLayout>` + `<PageHeader>`
- Adicionar botão "Estender Trial" e "Notas" como ações na tabela (DropdownMenu)

- [ ] **Step 2: Atualizar Admin.tsx**
Remover a tab "nutritionists" inteira e substituir por redirect para /admin/nutris

- [ ] **Step 3: Commit**
```bash
git add src/pages/admin/NutritionistList.tsx src/pages/Admin.tsx
git commit -m "refactor(admin): extract NutritionistList into dedicated page"
```

---

### Task 7: Criar NutritionistDetail page

**Files:**
- Create: `src/pages/admin/NutritionistDetail.tsx`

**Interfaces:**
- Consumes: `AdminLayout`, `PageHeader`, `GlassCard`, `Tabs`, supabase, useParams
- Produces: Detail page com tabs Perfil/Pacientes/Agenda/Financeiro/Suporte/Logs

- [ ] **Step 1: Implementar NutritionistDetail**
Em `src/pages/admin/NutritionistDetail.tsx`:
- `useParams()` para pegar :id
- Fetch profile by id + stats agregados (COUNT patients, appointments, meal_plans)
- Header: nome, email, CRN, status badge, data cadastro
- Tabs:
  - **Perfil:** dados completos, foto, cores, admin_notes (Textarea editável com save)
  - **Pacientes:** lista simples com COUNT
  - **Agenda:** próximas consultas (query appointments WHERE nutritionist_id = :id ORDER BY scheduled_at LIMIT 10)
  - **Financeiro:** transações do nutri (query financial_records)
  - **Suporte:** histórico de tickets (query support_tickets WHERE nutritionist FK)
  - **Logs:** audit log filtrado por target_id
- Ações no header: Toggle Ativo/Inativo, Estender Trial (Dialog com input de dias), Reset Senha, Enviar Mensagem (link para /admin/suporte?new=:id)

- [ ] **Step 2: Commit**
```bash
git add src/pages/admin/NutritionistDetail.tsx
git commit -m "feat(admin): add NutritionistDetail page with tabs and actions"
```

---

### Task 8: Extrair SupportThreadList e criar SupportChatView

**Files:**
- Create: `src/pages/admin/SupportThreadList.tsx`
- Create: `src/pages/admin/SupportChatView.tsx`
- Modify: `src/pages/Admin.tsx` (remover tab support inline)

**Interfaces:**
- Consumes: lógica existente de fetchTickets, fetchMessages, handleSendMessage do Admin.tsx
- Produces: lista de tickets standalone + chat view fullscreen com realtime

- [ ] **Step 1: Extrair SupportThreadList**
Mover para `src/pages/admin/SupportThreadList.tsx`:
- fetchTickets, priorityConfig, statusConfig
- Lista de tickets com filtros (status, prioridade)
- Badge de pendentes
- Chart de volume (14 dias)
- Cada ticket clicável → navigate(`/admin/suporte/${ticket.id}`)
- Wrapar com `<AdminLayout>` + `<PageHeader>`

- [ ] **Step 2: Criar SupportChatView**
Em `src/pages/admin/SupportChatView.tsx`:
- `useParams()` para pegar :ticketId
- Fetch ticket details + messages
- Supabase Realtime: `supabase.channel('support-chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_ticket_messages', filter: 'ticket_id=eq.${ticketId}' }, callback)`
- Interface fullscreen: header com ticket info + status badge, scroll de mensagens, textarea + send button
- Botões: Marcar Resolvido, Fechar Ticket
- Auto-scroll para última mensagem
- Cleanup do channel no unmount

- [ ] **Step 3: Atualizar Admin.tsx**
Remover tab "support" inteira

- [ ] **Step 4: Commit**
```bash
git add src/pages/admin/SupportThreadList.tsx src/pages/admin/SupportChatView.tsx src/pages/Admin.tsx
git commit -m "feat(admin): extract support module with realtime chat view"
```

---

### Task 9: Criar AdminFinanceiro page

**Files:**
- Create: `src/pages/admin/AdminFinanceiro.tsx`
- Modify: `src/pages/Admin.tsx` (remover tab financeiro placeholder)

**Interfaces:**
- Consumes: `AdminLayout`, `PageHeader`, `GlassCard`, `StatCard`, Recharts, supabase
- Produces: Financeiro consolidado da plataforma

- [ ] **Step 1: Implementar AdminFinanceiro**
Em `src/pages/admin/AdminFinanceiro.tsx`:
- Queries: SUM financial_records por tipo (receita/despesa), COUNT por plano, lista transações recentes (LIMIT 50)
- StatCards: Receita Total, Despesas, Lucro Líquido, Nutris Pagantes
- Gráfico BarChart: receita vs despesas últimos 6 meses
- Tabela: transações recentes com data, descrição, valor, nutri associado
- Breakdown por plano (PieChart)
- Wrapar com `<AdminLayout>` + `<PageHeader>`

- [ ] **Step 2: Atualizar Admin.tsx**
Remover tab "financeiro" placeholder

- [ ] **Step 3: Commit**
```bash
git add src/pages/admin/AdminFinanceiro.tsx src/pages/Admin.tsx
git commit -m "feat(admin): add AdminFinanceiro with consolidated platform financials"
```

---

### Task 10: Criar AdminSettings page

**Files:**
- Create: `src/pages/admin/AdminSettings.tsx`

**Interfaces:**
- Consumes: `AdminLayout`, `PageHeader`, `GlassCard`, Form components, supabase, admin_settings table
- Produces: Formulário de configurações globais com persistência

- [ ] **Step 1: Implementar AdminSettings**
Em `src/pages/admin/AdminSettings.tsx`:
- Fetch all admin_settings on mount
- Sections:
  - **Trial:** duração padrão (Input number, dias)
  - **Feature Flags:** toggles para AI meal plans, chat, etc. (Switch components)
  - **Manutenção:** toggle modo manutenção + mensagem customizada (Textarea)
- Save button: UPSERT em admin_settings (key = section name, value = JSONB)
- Toast success/error on save
- Log action em admin_audit_log
- Wrapar com `<AdminLayout>` + `<PageHeader>`

- [ ] **Step 2: Commit**
```bash
git add src/pages/admin/AdminSettings.tsx
git commit -m "feat(admin): add AdminSettings with global config persistence"
```

---

### Task 11: Refatorar Admin.tsx como router shell + registrar rotas

**Files:**
- Modify: `src/pages/Admin.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: AdminGuard, todas as páginas admin criadas
- Produces: Admin.tsx como shell mínimo que renderiza rotas filhas; App.tsx com rotas /admin/* lazy-loaded

- [ ] **Step 1: Refatorar Admin.tsx**
Transformar Admin.tsx em shell/router:
- Wrapar com `<AdminGuard>`
- Renderizar `<Outlet />` do react-router-dom (ou Routes aninhadas)
- Remover todo o código de tabs, states, fetches (já extraídos)
- Se acesso direto a /admin, renderizar AdminDashboard

- [ ] **Step 2: Registrar rotas no App.tsx**
Adicionar lazy imports e rotas:
```tsx
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const NutritionistList = lazy(() => import("./pages/admin/NutritionistList"));
const NutritionistDetail = lazy(() => import("./pages/admin/NutritionistDetail"));
const SupportThreadList = lazy(() => import("./pages/admin/SupportThreadList"));
const SupportChatView = lazy(() => import("./pages/admin/SupportChatView"));
const AdminFinanceiro = lazy(() => import("./pages/admin/AdminFinanceiro"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

// Dentro do Routes, após a rota /admin existente:
<Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>}>
  <Route index element={<AdminDashboard />} />
  <Route path="nutris" element={<NutritionistList />} />
  <Route path="nutris/:id" element={<NutritionistDetail />} />
  <Route path="suporte" element={<SupportThreadList />} />
  <Route path="suporte/:ticketId" element={<SupportChatView />} />
  <Route path="financeiro" element={<AdminFinanceiro />} />
  <Route path="configuracoes" element={<AdminSettings />} />
</Route>
```
Remover a rota `/admin` antiga que usava AccountStatusGuard

- [ ] **Step 3: Commit**
```bash
git add src/pages/Admin.tsx src/App.tsx
git commit -m "refactor(admin): convert Admin.tsx to router shell, register nested routes"
```

---

### Task 12: Adicionar audit log helper e integração nas actions

**Files:**
- Create: `src/lib/admin-audit.ts`
- Modify: `src/pages/admin/NutritionistList.tsx` (toggle action)
- Modify: `src/pages/admin/NutritionistDetail.tsx` (trial extend, notes save)
- Modify: `src/pages/admin/AdminSettings.tsx` (settings save)

**Interfaces:**
- Consumes: supabase client
- Produces: `logAdminAction(action, targetType?, targetId?, details?)` function

- [ ] **Step 1: Criar helper de audit log**
Em `src/lib/admin-audit.ts`:
```typescript
export async function logAdminAction(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>
) {
  await supabase.from('admin_audit_log').insert({
    action,
    target_type: targetType,
    target_id: targetId,
    details: details || null,
  });
}
```

- [ ] **Step 2: Integrar nas actions existentes**
- NutritionistList: chamar logAdminAction após toggleActive sucesso
- NutritionistDetail: chamar após estender trial, salvar notas
- AdminSettings: chamar após salvar configurações
- SupportChatView: chamar após responder ticket, fechar ticket

- [ ] **Step 3: Commit**
```bash
git add src/lib/admin-audit.ts src/pages/admin/NutritionistList.tsx src/pages/admin/NutritionistDetail.tsx src/pages/admin/AdminSettings.tsx src/pages/admin/SupportChatView.tsx
git commit -m "feat(admin): add audit logging to all admin actions"
```

---

### Task 13: Verificação final e cleanup

**Files:**
- Verify: todas as rotas /admin/* funcionam
- Verify: non-admin é redirecionado
- Verify: realtime funciona no chat
- Cleanup: remover código morto do Admin.tsx original

- [ ] **Step 1: Testar fluxo completo manualmente**
- Acessar /admin como admin → vê dashboard
- Navegar para /admin/nutris → lista funciona
- Clicar em nutri → detail page abre
- Ir para /admin/suporte → lista de tickets
- Abrir ticket → chat funciona
- Ir para /admin/financeiro → dados aparecem
- Ir para /admin/configuracoes → form carrega e salva
- Sair e tentar acessar /admin como non-admin → redirect

- [ ] **Step 2: Limpar Admin.tsx**
Remover qualquer código residual das tabs extraídas (interfaces, configs, funções não usadas)

- [ ] **Step 3: Commit final**
```bash
git add -A
git commit -m "chore(admin): cleanup and verify complete admin panel"
```