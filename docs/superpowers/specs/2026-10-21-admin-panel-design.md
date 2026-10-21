# Painel Admin NutriFlow — Design Spec

**Data:** 2026-10-21  
**Autor:** Cristiano Dias (admin único)  
**Status:** Draft para revisão  

---

## 1. Visão Geral

Painel administrativo exclusivo para o superadmin (`diascristianoconsultor@gmail.com`) gerenciar toda a plataforma NutriFlow. Acesso protegido por verificação de email + campo `is_admin` na tabela `profiles`. Layout consistente com o app existente (AppSidebar adaptada + AppLayout).

### Princípios
- **Admin único:** Sem sistema de roles complexo. Verificação hardcoded por email + flag DB.
- **100% funcional:** Tudo integrado ao Supabase, sem dados mock.
- **Mesmo padrão visual:** Reutilizar PageHeader, RichCard, StatCard, componentes shadcn/ui, paleta verde NutriFlow.
- **Segurança first:** Middleware de rota + verificação no servidor (Supabase RLS).

---

## 2. Arquitetura

### 2.1 Proteção de Acesso

```
Route: /admin/*
Guard: AdminGuard component
  ├── Verifica session do Supabase Auth
  ├── Busca profiles.is_admin WHERE user_id = session.user.id
  ├── Verifica email === 'diascristianoconsultor@gmail.com'
  └── Redirect para /acesso-negado se falhar
```

**RLS no Supabase:** Políticas `SELECT/UPDATE/DELETE` nas tabelas relevantes só permitem acesso quando `auth.jwt()->>'email' = 'diascristianoconsultor@gmail.com'`.

### 2.2 Estrutura de Rotas

```
/admin                    → AdminDashboard (overview)
/admin/nutris             → NutritionistList (lista + filtros + ações)
/admin/nutris/:id         → NutritionistDetail (perfil completo + ações)
/admin/suporte            → SupportChatList (conversas de suporte)
/admin/suporte/:threadId  → SupportChatView (chat com nutri específico)
/admin/financeiro         → AdminFinanceiro (receitas, planos, cobranças)
/admin/configuracoes      → AdminSettings (configurações globais da plataforma)
```

### 2.3 Sidebar Admin

Extensão da AppSidebar existente. Quando o usuário é admin e está em `/admin/*`, a sidebar mostra:
- **Visão Geral** (dashboard)
- **Nutricionistas** (gerenciamento)
- **Suporte** (chats)
- **Financeiro** (plataforma)
- **Configurações** (globais)
- Separador
- Link "Voltar ao App" → `/dashboard`

---

## 3. Módulos Funcionais

### 3.1 Dashboard Admin (`/admin`)

**KPIs em tempo real:**
| Card | Métrica | Fonte |
|------|---------|-------|
| Nutris Ativos | COUNT(profiles) WHERE account_status = 'active' | profiles |
| Nutris em Trial | COUNT(profiles) WHERE trial_ends_at > NOW() AND account_status = 'trial' | profiles |
| Receita Mensal | SUM(valor) FROM financial_records WHERE tipo = 'receita' AND mês atual | financial_records |
| Chats Pendentes | COUNT(support_threads) WHERE status = 'open' | support_threads |
| Novos Hoje | COUNT(profiles) WHERE created_at = TODAY | profiles |
| Taxa de Conversão Trial→Pago | (ativos / (ativos + expirados)) × 100 | profiles |

**Gráficos:**
- Evolução de nutris ativos (últimos 12 meses) — Recharts LineChart
- Receita mensal (últimos 6 meses) — Recharts BarChart
- Distribuição por plano (pie chart)

**Alertas:**
- Trials expirando nos próximos 3 dias
- Nutris inativos há >30 dias
- Tickets de suporte abertos há >48h

### 3.2 Gerenciamento de Nutricionistas (`/admin/nutris`)

**Lista com filtros:**
- Status: Todos / Ativos / Trial / Inativos / Suspensos
- Busca por nome, email ou CRN
- Ordenação: Data cadastro, último acesso, nome

**Ações por nutri (inline na tabela + detail page):**
| Ação | Descrição | Implementação |
|------|-----------|---------------|
| Ativar/Desativar | Toggle account_status | UPDATE profiles SET account_status |
| Estender Trial | Adicionar dias ao trial_ends_at | UPDATE profiles SET trial_ends_at |
| Alterar Plano | Mudar subscription_plan | UPDATE nutritionists SET subscription_plan |
| Reset Senha | Trigger password reset email | Supabase Auth admin API |
| Ver Detalhes | Navegar para /admin/nutris/:id | Router link |
| Enviar Mensagem | Abrir chat de suporte | Cria/abre support_thread |
| Logs de Acesso | Ver últimos logins | Query auth.audit_log_entries |

**Detail Page (`/admin/nutris/:id`):**
- Header: Nome, email, CRN, status badge, data cadastro
- Tabs:
  - **Perfil:** Dados completos, foto, cores personalizadas
  - **Pacientes:** Lista de pacientes do nutri (COUNT + link)
  - **Agenda:** Próximas consultas
  - **Financeiro:** Histórico de pagamentos/transações
  - **Suporte:** Histórico de conversas
  - **Logs:** Auditoria de ações

### 3.3 Chat de Suporte (`/admin/suporte`)

**Modelo de dados novo:** Tabela `support_threads`

```sql
CREATE TABLE support_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES profiles(id),
  admin_email TEXT NOT NULL DEFAULT 'diascristianoconsultor@gmail.com',
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES support_threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('nutritionist', 'admin')),
  sender_id UUID,  -- nullable for admin (identified by email)
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Interface:**
- Lista de threads com filtros (status, prioridade, nutri)
- Badge de não-lidas
- Chat view estilo Mensagens existente (reutilizar padrões de UI)
- Admin responde como "Admin" (identificado por email)
- Notificações em tempo real via Supabase Realtime
- Marcar como resolvido/fechado

### 3.4 Financeiro da Plataforma (`/admin/financeiro`)

**Visão consolidada:**
- Receitas totais vs despesas (se houver custos operacionais registrados)
- Breakdown por plano de assinatura
- Lista de transações recentes (financial_records com nutritionist_id)
- Status de cobrança por nutri (ativo, inadimplente, cancelado)

**Integração Stripe (via nutritionists table):**
- Listar nutris com subscription_status != 'active'
- Link direto para Stripe Dashboard do customer
- Histórico de pagamentos via Stripe API (server-side)

### 3.5 Configurações Globais (`/admin/configuracoes`)

- **Trial Duration:** Duração padrão do trial (dias)
- **Planos e Preços:** Editar nomes e descrições dos planos
- **Email Templates:** Templates de email do sistema (boas-vindas, trial expirando, etc.)
- **Feature Flags:** Ativar/desativar features globalmente (ex: AI meal plans, chat)
- **Manutenção:** Modo manutenção (banner no app)
- **Logs do Sistema:** Últimas ações administrativas

---

## 4. Schema Changes

### Novas Tabelas
1. `support_threads` — Threads de suporte admin↔nutri
2. `support_messages` — Mensagens dentro das threads
3. `admin_settings` — Key-value store para configurações globais
4. `admin_audit_log` — Log de ações do admin

### Alterações em Tabelas Existentes
- `profiles`: Garantir que `is_admin` existe e tem default `false`
- `profiles`: Adicionar `last_login_at TIMESTAMPTZ` (se não existir)
- `profiles`: Adicionar `notes TEXT` (campo interno do admin sobre o nutri)

### RLS Policies
Todas as novas tabelas com políticas restritivas ao email admin.

---

## 5. Componentes a Criar

| Componente | Localização | Reutiliza |
|------------|-------------|-----------|
| `AdminGuard` | src/components/admin/AdminGuard.tsx | useAuth + supabase query |
| `AdminSidebar` | src/components/admin/AdminSidebar.tsx | AppSidebar pattern |
| `AdminLayout` | src/components/admin/AdminLayout.tsx | AppLayout pattern |
| `AdminDashboard` | src/pages/admin/AdminDashboard.tsx | StatCard, Recharts |
| `NutritionistList` | src/pages/admin/NutritionistList.tsx | Table, Badge, Dialog |
| `NutritionistDetail` | src/pages/admin/NutritionistDetail.tsx | Tabs, RichCard |
| `SupportThreadList` | src/pages/admin/SupportThreadList.tsx | Mensagens pattern |
| `SupportChatView` | src/pages/admin/SupportChatView.tsx | NutritionistChat pattern |
| `AdminFinanceiro` | src/pages/admin/AdminFinanceiro.tsx | Financeiro pattern |
| `AdminSettings` | src/pages/admin/AdminSettings.tsx | Form components |
| `AdminStatCard` | src/components/admin/AdminStatCard.tsx | StatCard base |
| `NutriActionMenu` | src/components/admin/NutriActionMenu.tsx | DropdownMenu |

---

## 6. Integrações

### Supabase
- Queries diretas via supabase-js (mesmo padrão do app)
- Realtime para support_messages e support_threads
- Auth admin API para reset de senha

### Stripe (opcional, fase 2)
- Server-side via Edge Function para listar subscriptions
- Links para Stripe Dashboard

### Email
- Supabase Edge Function para envio de emails transacionais
- Templates editáveis em admin_settings

---

## 7. Segurança

1. **Dupla verificação:** Email hardcoded NO FRONTEND + is_admin NO BANCO + RLS NO SUPABASE
2. **Audit Log:** Toda ação admin registrada em admin_audit_log
3. **RLS Restritivo:** Nenhuma tabela admin acessível por não-admins
4. **Rate Limiting:** Edge Functions com limite de requisições
5. **Session Timeout:** Sessão admin expira após 8h de inatividade

---

## 8. Fora do Escopo (Fase 1)

- Multi-admin com roles
- Billing automático / checkout
- API pública para integrações
- Relatórios exportáveis (PDF/CSV) — adicionar na fase 2
- White-label / customização por nutri via admin
- Moderação de conteúdo de pacientes

---

## 9. Critérios de Aceite

- [ ] Admin acessa /admin e vê dashboard com dados reais
- [ ] Admin lista, filtra e busca nutricionistas
- [ ] Admin ativa/desativa nutri e vê mudança imediata
- [ ] Admin estende trial e nutri recebe acesso renovado
- [ ] Admin abre chat de suporte e troca mensagens em tempo real
- [ ] Admin vê financeiro consolidado da plataforma
- [ ] Admin altera configurações globais e mudanças refletem no app
- [ ] Não-admin tentando acessar /admin é redirecionado para /acesso-negado
- [ ] Todas as ações admin são logadas
- [ ] Layout consistente com o resto do app (mesma paleta, tipografia, componentes)