# PLANO DE REFORMULAÇÃO COMPLETA DO NUTRIFLOW

## SITUAÇÃO ATUAL (Análise Técnica)

### Problemas Críticos Identificados
1. **Deploy em Produção QUEBRADO** - Erro ISO-8859-1 persistente há 24h+
2. **Arquitetura Desorganizada** - 137 arquivos TSX, sem estrutura clara
3. **Supabase Client Bugado** - Headers UTF-8 causam falha no navegador
4. **Sem Testes Automatizados** - Nenhum teste de integração rodando
5. **Performance Ruim** - Build de 3.6MB, chunks > 500KB

### Stack Atual
- React 18 + TypeScript + Vite
- Supabase (Auth + Database)
- shadcn/ui + TailwindCSS
- 137 componentes TSX
- Deploy: Vercel (FALHANDO)

## PLANO DE REFORMULAÇÃO (3 FASES)

### FASE 1: ESTABILIZAÇÃO (URGENTE - 2h)
**Objetivo:** Fazer o site voltar a funcionar em produção

#### 1.1 Resolver Erro ISO-8859-1
- [ ] Implementar proxy Vercel Serverless Functions (já feito, mas não deployou)
- [ ] Verificar se deploy automático do Vercel está funcionando
- [ ] Testar signup/login em produção
- [ ] Fallback: Migrar para Netlify se Vercel continuar falhando

#### 1.2 Configurar CI/CD Correto
- [ ] Deletar GitHub Actions quebrado
- [ ] Configurar Vercel Git Integration
- [ ] Adicionar environment variables no Vercel
- [ ] Testar deploy automático em push

#### 1.3 Hotfixes Críticos
- [ ] Corrigir package-lock.json conflicts
- [ ] Remover dependências não usadas
- [ ] Atualizar Vite para versão estável

**Critério de Sucesso Fase 1:** Site https://nutriflow.inf.br/auth funcionando

---

### FASE 2: ARQUITETURA (1 semana)
**Objetivo:** Reorganizar código seguindo plano arquitetural

#### 2.1 Estrutura de Pastas (Baseada no Memory)
```
src/
├── features/           # Feature-based architecture
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── patients/
│   ├── meal-plans/
│   ├── monitoring/
│   └── scheduling/
├── shared/            # Código compartilhado
│   ├── components/ui/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── lib/              # External integrations
    ├── supabase/
    └── ai/
```

#### 2.2 Refatoração por Feature
- [ ] Migrar Auth (useAuth, Auth.tsx, client.ts)
- [ ] Migrar Patients (components + pages)
- [ ] Migrar Meal Plans (GenerateMealPlan, MealPlanEditor)
- [ ] Migrar Monitoring (anthropometrics, water_logs)
- [ ] Migrar Scheduling (appointments, agenda)

#### 2.3 Database Schema Cleanup
- [ ] Auditar tabelas atuais vs plano (13 tabelas)
- [ ] Criar migrations para tabelas faltantes:
  - `food_database` (TACO)
  - `custom_foods`
  - `custom_recipes`
  - `consultations`
  - `chat_messages`
- [ ] Adicionar indexes de performance
- [ ] Setup RLS policies

#### 2.4 Componentes Core
- [ ] Criar AppLayout padronizado (Sidebar + Content)
- [ ] Criar NavigationSidebar com 2 níveis
- [ ] Criar PatientCard component
- [ ] Criar MealPlanBuilder (drag-drop)
- [ ] Criar MonitoringCharts (recharts)

**Critério de Sucesso Fase 2:** 
- Código organizado por feature
- 13 tabelas Supabase funcionando
- 5 componentes core reutilizáveis

---

### FASE 3: FEATURES & POLISH (2 semanas)
**Objetivo:** Implementar features ausentes do plano arquitetural

#### 3.1 Gerador de Cardápio Inteligente
- [ ] Integração TACO database (5000+ alimentos)
- [ ] Drag-and-drop meal builder
- [ ] Cálculo automático de macros
- [ ] Substituição inteligente de alimentos
- [ ] Export PDF profissional

#### 3.2 Portal do Paciente Mobile
- [ ] Redesign mobile-first
- [ ] Visualização de cardápio
- [ ] Registro de consumo
- [ ] Gráficos de progresso
- [ ] Chat com nutricionista

#### 3.3 Monitoramento Avançado
- [ ] Histórico antropométrico com gráficos
- [ ] Water intake tracker
- [ ] Progress photos upload
- [ ] Alertas automáticos (meta não atingida)

#### 3.4 Sistema de Agendamento
- [ ] Calendar view (fullcalendar)
- [ ] Confirmação de consulta via WhatsApp
- [ ] Reminders automáticos
- [ ] Integração Google Calendar

#### 3.5 Qualidade & Performance
- [ ] Setup Vitest + Testing Library
- [ ] Testes E2E críticos (signup, create patient, generate meal plan)
- [ ] Lighthouse score > 90
- [ ] Code splitting (< 200KB initial bundle)
- [ ] Error boundary components
- [ ] Sentry integration

**Critério de Sucesso Fase 3:**
- Todas as 5 features principais funcionando
- 80%+ test coverage
- Lighthouse > 90
- Zero erros em produção por 48h

---

## DECISÕES TÉCNICAS

### O Que Manter
✅ React + TypeScript (stack sólida)
✅ Supabase (backend excelente)
✅ shadcn/ui (componentes de qualidade)
✅ TailwindCSS (produtividade CSS)

### O Que Mudar
🔄 **Auth**: Migrar de Supabase JS Client para REST API + Proxy (resolver ISO-8859-1)
🔄 **Estrutura**: De flat pages/ para feature-based modules
🔄 **State**: Adicionar Zustand para estado global (user, patients)
🔄 **Forms**: Padronizar react-hook-form + zod em todos os forms
🔄 **Deploy**: Avaliar migrar Vercel → Netlify se problemas persistirem

### O Que Remover
❌ Componentes duplicados (MealPlanDocument vs MealPlanDocumentElite)
❌ Pages não utilizadas (PaidTrafficAgent, CheckoutPage em dev)
❌ Dependências obsoletas (@google/generative-ai não está sendo usado)
❌ Código comentado e TODOs antigos

---

## ROADMAP EXECUTIVO

| Fase | Duração | Prioridade | Blocker |
|------|---------|------------|---------|
| 1. Estabilização | 2h | 🔴 CRÍTICA | Deploy quebrado |
| 2. Arquitetura | 1 semana | 🟠 ALTA | Fase 1 OK |
| 3. Features | 2 semanas | 🟡 MÉDIA | Fase 2 OK |

**Total:** 3 semanas para reformulação completa

---

## PRÓXIMOS PASSOS IMEDIATOS

### Agora (próxima 1h)
1. ✅ Verificar status do último deploy Vercel
2. ✅ Testar proxy serverless em produção
3. ⬜ Se falhar: migrar para Netlify imediatamente
4. ⬜ Confirmar signup/login funcionando

### Hoje (próximas 4h)
1. ⬜ Criar estrutura de pastas `src/features/`
2. ⬜ Migrar módulo `auth/` completo
3. ⬜ Migrar módulo `patients/` completo
4. ⬜ Atualizar imports quebrados
5. ⬜ Testar build local

### Esta Semana
1. ⬜ Completar Fase 2 (arquitetura)
2. ⬜ Criar 5 componentes core
3. ⬜ Setup database schema completo
4. ⬜ Deploy estável em produção

---

## RISCOS & MITIGAÇÃO

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Deploy continua falhando | 🟡 Média | 🔴 Alto | Migrar para Netlify |
| Refactor quebra features | 🟢 Baixa | 🟠 Médio | Testes E2E antes de merge |
| Supabase rate limit | 🟢 Baixa | 🟡 Baixo | Implementar cache local |
| User churn durante reforma | 🟡 Média | 🔴 Alto | Comunicar updates, manter uptime |

---

## CRITÉRIOS DE ACEITAÇÃO FINAL

### Técnicos
- [x] Site em produção sem erros 48h+
- [ ] Lighthouse score > 90
- [ ] Build size < 2MB
- [ ] Test coverage > 80%
- [ ] Zero warnings no console

### Funcionais
- [ ] Nutricionista consegue cadastrar paciente em < 2min
- [ ] Gerador de cardápio funciona em < 30s
- [ ] Paciente acessa portal mobile sem travar
- [ ] Todas as 13 tabelas persistindo dados
- [ ] Chat tempo real funcionando

### Negócio
- [ ] NPS > 8
- [ ] 0 bugs críticos reportados
- [ ] Time to first value < 5min
- [ ] Retenção week 1 > 60%

---

## OBSERVAÇÕES FINAIS

Este plano foi criado baseado em:
1. ✅ Análise do código atual (137 componentes)
2. ✅ Memory `architecture_plan.md` (plano original de 10 semanas)
3. ✅ Problemas críticos em produção (ISO-8859-1)
4. ✅ Best practices React + Supabase 2024

**Recomendação:** Começar pela Fase 1 IMEDIATAMENTE. O site em produção está quebrado e cada hora sem funcionar = perda de usuários.
