# Painel Admin NutriFlow — Design Spec (Revisado)

**Data:** 2026-10-21  
**Autor:** Cristiano Dias (admin único)  
**Status:** Aprovado para implementação  

---

## 1. Visão Geral

Evolução do painel admin existente (`src/pages/Admin.tsx`, ~820 linhas) para um sistema completo de gerenciamento da plataforma. O painel atual já tem tabs básicas para Nutricionistas, Suporte (tickets), Analytics e Financeiro (placeholder). Esta spec define as melhorias necessárias para torná-lo 100% funcional e integrado.

### Estado Atual vs. Objetivo

| Módulo | Estado Atual | Objetivo |
|--------|-------------|----------|
| **Auth/Guard** | RPC `is_current_user_master_admin` + redirect | Manter (já funciona). Adicionar AdminGuard reutilizável |
| **Layout** | Header próprio inline, sem sidebar | AdminSidebar dedicada + AdminLayout usando AppLayout pattern |
| **Dashboard** | Stats inline na tab Nutricionistas | Dashboard dedicado com KPIs reais + gráficos Recharts |
| **Nutricionistas** | Lista + toggle ativo/inativo + busca | Adicionar: detail page, estender trial, alterar plano, notas admin |
| **Suporte** | Tickets list + dialog com mensagens | Chat em tempo real via Supabase Realtime, status workflow completo |
| **Financeiro** | Placeholder "Em desenvolvimento" | Receitas consolidadas, status por nutri, breakdown por plano |
| **Configurações** | Não existe | Trial duration, feature flags, modo manutenção |
| **Audit Log** | Não existe | Toda ação admin logada |

### Princípios
- **Admin único:** `diascristianoconsultor@gmail.com` — verificação por email + `is_admin` flag
- **100% funcional:** Tudo integrado ao Supabase, zero dados mock
- **Mesmo padrão visual:** PageHeader, GlassCard, NeonText, Recharts, paleta verde NutriFlow (#518C5B)
- **Evoluir, não reescrever:** Refatorar Admin.tsx em módulos separados, preservar lógica existente

---

## 2. Arquitetura

### 2.1 Proteção de Acesso

Manter RPC existente `is_current_user_master_admin`. Criar `AdminGuard` component reutilizável que encapsula essa verificação.

```
Route: /admin/*
Guard: AdminGuard component
 ├── Verifica session do Supabase Auth
 ├── Chama RPC is_current_user_master_admin
 └── Redirect para /acesso-negado se falhar
```

### 2.2 Estrutura de Rotas (evolução)

```
/admin                    → AdminDashboard (NOVO - overview com KPIs)
/admin/nutris             → NutritionistList (refatorado de Admin.tsx tab)
/admin/nutris/:id         → NutritionistDetail (NOVO)
/admin/suporte            → SupportThreadList (refatorado de Admin.tsx tab)
/admin/suporte/:ticketId  → SupportChatView (NOVO - fullscreen, realtime)
/admin/financeiro         → AdminFinanceiro (NOVO - substitui placeholder)
/admin/configuracoes      → AdminSettings (NOVO)
```

### 2.3 AdminSidebar

Nova sidebar dedicada seguindo o padrão da AppSidebar. Itens:
- Visão Geral, Nutricionistas, Suporte, Financeiro, Configurações
- Separador
- "Voltar ao App" → `/dashboard`

### 2.4 Tabelas Existentes (confirmadas no DB)

- `profiles` — nutritionists (id, full_name, user_id, crn, phone, is_active, is_admin, account_status, created_at, has_seen_onboarding, trial_ends_at)
- `support_tickets` — tickets (id, ticket_number, subject, message/description, status, priority, created_at, attachment_url, nutritionist FK)
- `support_ticket_messages` — mensagens (id, ticket_id, is_staff_reply, description, created_at)
- `patients`, `meal_plans`, `appointments` — dados dos nutris
- `financial_records` — transações financeiras (record_type, record_date, amount/value)

### 2.5 Novas Tabelas Necessárias

```sql
-- Configurações globais key-value
CREATE TABLE admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log de ações admin
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.6 Alterações em Tabelas Existentes

- `profiles`: Adicionar `admin_notes TEXT` (notas internas do admin sobre o nutri)
- `profiles`: Garantir `trial_ends_at TIMESTAMPTZ` existe
- `profiles`: Adicionar `last_login_at TIMESTAMPTZ`

---

## 3. Módulos Funcionais

### 3.1 AdminDashboard (`/admin`) — NOVO

KPIs em tempo real usando queries Supabase:
- Nutris Ativos (profiles WHERE is_active = true)
- Nutris em Trial (profiles WHERE trial_ends_at > NOW() AND account_status = 'trial')
- Receita Mensal (SUM financial_records)
- Tickets Pendentes (support_tickets WHERE status = 'open')
- Novos Hoje (profiles WHERE created_at = TODAY)
- Taxa Conversão Trial→Pago

Gráficos Recharts: evolução de nutris (12 meses), receita mensal (6 meses), distribuição por plano.

Alertas: trials expirando em 3 dias, tickets abertos >48h.

### 3.2 Gerenciamento de Nutricionistas — EVOLUÇÃO

Refatorar tab "nutritionists" do Admin.tsx em página dedicada `/admin/nutris`.

Manter: lista, busca, toggle ativo/inativo.

Adicionar:
- Filtros por status (Ativos/Trial/Inativos/Suspensos)
- Detail page `/admin/nutris/:id` com tabs: Perfil, Pacientes, Agenda, Financeiro, Suporte, Logs
- Ações: Estender Trial (UPDATE trial_ends_at), Alterar Plano, Reset Senha (Supabase Auth admin API), Notas Admin
- Link direto para chat de suporte com o nutri

### 3.3 Chat de Suporte — EVOLUÇÃO

Refatorar tab "support" em páginas dedicadas. Usar tabelas existentes `support_tickets` + `support_ticket_messages`.

Lista (`/admin/suporte`): filtros por status/prioridade, badge de pendentes, ordenação.

Chat View (`/admin/suporte/:ticketId`): interface fullscreen estilo Mensagens, mensagens em tempo real via Supabase Realtime (`postgres_changes` on support_ticket_messages), workflow de status (open → answered → resolved/closed).

### 3.4 Financeiro da Plataforma — NOVO

Substituir placeholder. Queries em `financial_records` + `profiles`:
- Receitas totais vs despesas
- Breakdown por plano de assinatura
- Status de cobrança por nutri
- Lista de transações recentes

### 3.5 Configurações Globais — NOVO

Formulários para:
- Trial Duration (dias)
- Feature Flags (AI meal plans, chat, etc.)
- Modo Manutenção (banner global)
- Salvar em `admin_settings` table

---

## 4. Componentes a Criar/Refatorar

| Componente | Ação | Localização |
|------------|------|-------------|
| `AdminGuard` | Criar | src/components/admin/AdminGuard.tsx |
| `AdminSidebar` | Criar | src/components/admin/AdminSidebar.tsx |
| `AdminLayout` | Criar | src/components/admin/AdminLayout.tsx |
| `AdminDashboard` | Criar | src/pages/admin/AdminDashboard.tsx |
| `NutritionistList` | Extrair de Admin.tsx | src/pages/admin/NutritionistList.tsx |
| `NutritionistDetail` | Criar | src/pages/admin/NutritionistDetail.tsx |
| `SupportThreadList` | Extrair de Admin.tsx | src/pages/admin/SupportThreadList.tsx |
| `SupportChatView` | Criar | src/pages/admin/SupportChatView.tsx |
| `AdminFinanceiro` | Criar | src/pages/admin/AdminFinanceiro.tsx |
| `AdminSettings` | Criar | src/pages/admin/AdminSettings.tsx |
| `Admin.tsx` | Refatorar como router/shell | src/pages/Admin.tsx |

---

## 5. Segurança

1. Dupla verificação: RPC `is_current_user_master_admin` + RLS no Supabase
2. Audit Log: toda ação admin registrada em `admin_audit_log`
3. RLS Restritivo: tabelas admin só acessíveis por admin
4. AdminGuard em todas as rotas `/admin/*`

---

## 6. Fora do Escopo (Fase 1)

- Multi-admin com roles
- Billing automático / checkout Stripe
- API pública
- Relatórios exportáveis (PDF/CSV)
- White-label

---

## 7. Critérios de Aceite

- [ ] Admin acessa /admin e vê dashboard com KPIs reais
- [ ] Admin lista, filtra e busca nutricionistas
- [ ] Admin ativa/desativa nutri e vê mudança imediata
- [ ] Admin estende trial e nutri recebe acesso renovado
- [ ] Admin abre chat de suporte e troca mensagens em tempo real
- [ ] Admin vê financeiro consolidado da plataforma
- [ ] Admin altera configurações globais
- [ ] Não-admin tentando acessar /admin é redirecionado
- [ ] Todas as ações admin são logadas
- [ ] Layout consistente com o resto do app