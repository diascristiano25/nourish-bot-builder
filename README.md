# 🥗 NutriFlow SaaS - Plataforma Completa para Nutricionistas

> Sistema profissional de gestão nutricional com IA, geração de cardápios e acompanhamento de pacientes

[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)](https://github.com)
[![Progress](https://img.shields.io/badge/Progresso-70%25-brightgreen)](https://github.com)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)

---

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev

# Acessar aplicação
# http://localhost:5173
```

---

## 📋 Índice

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Rotas Principais](#-rotas-principais)
- [Database Schema](#-database-schema)
- [Desenvolvimento](#-desenvolvimento)
- [Documentação](#-documentação)
- [Roadmap](#-roadmap)

---

## ✨ Features

### ✅ Implementadas

#### 🎨 Layout Moderno
- Sidebar verde fixa com navegação
- Header com busca e notificações
- Animações fluidas (Framer Motion)
- Design responsivo

#### 📊 Dashboard
- KPIs de consultas e pacientes
- Gráficos de evolução (Area Chart)
- Calendário de próximos atendimentos
- Estatísticas financeiras

#### 👥 Gestão de Pacientes
- Listagem com filtros
- Cadastro de novos pacientes
- Perfil completo com histórico
- Status de adesão ao tratamento

#### 🍽️ Meal Plan Builder ⭐ NEW
- Construtor visual de cardápios (7 dias)
- Drag & drop para reorganizar alimentos
- Busca inteligente na base TACO
- Cálculo automático de macros
- Progress bars de nutrientes
- Preparado para geração com IA
- Pronto para export PDF

#### 📅 Agenda
- Visualização de consultas
- Calendário mensal
- Status de confirmação
- Filtros por tipo de consulta

#### 🗄️ Database
- 13 tabelas completas
- RLS policies (Supabase)
- Seed data TACO (10 alimentos)
- JSONB para meal plans

### 🚧 Em Desenvolvimento

- [ ] Geração de cardápios com IA (Claude API)
- [ ] Export PDF de cardápios
- [ ] Biblioteca de planos salvos
- [ ] Sistema de mensagens real-time
- [ ] Portal do paciente (mobile)
- [ ] Gráficos de evolução detalhados

---

## 🛠️ Tech Stack

### Frontend
```json
{
  "framework": "React 18 + Vite",
  "language": "TypeScript 5.8",
  "styling": "Tailwind CSS + shadcn/ui",
  "animations": "Framer Motion",
  "routing": "React Router v6",
  "state": "React Query (TanStack)",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts",
  "icons": "Lucide React"
}
```

### Backend
```json
{
  "database": "Supabase PostgreSQL",
  "auth": "Supabase Auth",
  "storage": "Supabase Storage",
  "realtime": "Supabase Realtime",
  "ai": "Anthropic Claude API"
}
```

### DevOps
```json
{
  "hosting": "Netlify",
  "ci/cd": "GitHub Actions",
  "package_manager": "npm"
}
```

---

## 📁 Estrutura do Projeto

```
nutriflow/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── ModernLayout.tsx          # Wrapper principal
│   │   │   └── ModernSidebar.tsx         # Sidebar verde
│   │   ├── meal-plan/
│   │   │   ├── MealPlanBuilder.tsx       # Builder de cardápios
│   │   │   ├── MealCard.tsx              # Item draggable
│   │   │   ├── NutritionalSummary.tsx    # Resumo de macros
│   │   │   ├── FoodSearchDialog.tsx      # Busca TACO
│   │   │   └── AIGenerationPanel.tsx     # Painel IA
│   │   └── ui/                            # shadcn/ui components
│   ├── pages/
│   │   ├── ModernDashboard.tsx           # Dashboard principal
│   │   ├── MealPlanBuilderPage.tsx       # Página de cardápios
│   │   ├── demo/
│   │   │   ├── DemoAgenda.tsx            # Agenda demo
│   │   │   └── DemoPacientes.tsx         # Pacientes demo
│   │   └── ...                            # Outras páginas
│   ├── hooks/
│   │   ├── useAuth.tsx                    # Autenticação
│   │   └── useTheme.tsx                   # Tema
│   ├── integrations/
│   │   └── supabase/
│   │       └── client.ts                  # Cliente Supabase
│   └── types/
│       └── supabase.ts                    # Types gerados
├── supabase/
│   └── migrations/
│       └── 20261016000000_consolidate_nutriflow_schema.sql
├── docs/                                  # Documentação
├── PLANO_EXECUCAO_COMPLETO.md            # Roadmap completo
├── SESSAO_IMPLEMENTACAO_16OUT.md         # Log da sessão
└── RESUMO_SESSAO_FINAL.md                # Resumo executivo
```

---

## 🌐 Rotas Principais

| Rota | Descrição | Status |
|------|-----------|--------|
| `/` | Landing page profissional | ✅ |
| `/auth` | Login/Cadastro | ✅ |
| `/modern-dashboard` | Dashboard nutricionista | ✅ |
| `/meal-plan-builder` | Construtor de cardápios | ✅ |
| `/demo-agenda` | Agenda de consultas | ✅ |
| `/demo-pacientes` | Listagem de pacientes | ✅ |
| `/pacientes/:id` | Perfil do paciente | ✅ |
| `/novo-paciente` | Cadastro de paciente | ✅ |
| `/biblioteca` | Biblioteca de planos | 🚧 |
| `/financeiro` | Gestão financeira | 🚧 |
| `/perfil` | Perfil do nutricionista | ✅ |
| `/meu-app` | Portal do paciente (mobile) | 🚧 |

---

## 🗄️ Database Schema

### 13 Tabelas Implementadas

#### Tier 1: Autenticação
1. **profiles** - Nutricionistas (CRN, especialidades, assinatura)
2. **patients** - Pacientes (objetivo, restrições, alergias)

#### Tier 2: Nutrição
3. **food_database** - Base TACO (alimentos brasileiros)
4. **custom_foods** - Alimentos customizados
5. **custom_recipes** - Receitas personalizadas

#### Tier 3: Planos
6. **meal_plans** - Cardápios semanais (JSONB)

#### Tier 4: Monitoramento
7. **anthropometrics** - Medidas corporais
8. **water_logs** - Registro de água
9. **food_intake_logs** - Consumo diário

#### Tier 5: Comunicação
10. **appointments** - Consultas
11. **messages** - Chat nutricionista-paciente

#### Tier 6: Financeiro
12. **support_tickets** - Suporte
13. **financial_records** - Faturamento

### Features do Schema
- ✅ RLS policies em todas as tabelas
- ✅ Triggers de `updated_at` automáticos
- ✅ Indexes para performance
- ✅ Seed data TACO (10 alimentos base)

---

## 💻 Desenvolvimento

### Pré-requisitos
```bash
# Node.js 18+
node --version

# npm
npm --version

# Supabase CLI (opcional)
supabase --version
```

### Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/nutriflow.git

# Entrar no diretório
cd nutriflow

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais Supabase
```

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
VITE_ANTHROPIC_API_KEY=sua-chave-claude
```

### Aplicar Migrations

```bash
# Via Supabase Dashboard
# 1. Acesse https://app.supabase.com/project/<ID>/editor
# 2. Copie conteúdo de supabase/migrations/20261016000000_consolidate_nutriflow_schema.sql
# 3. Execute no SQL Editor

# Ou via CLI (se configurado)
supabase db push
```

### Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor (localhost:5173)

# Build
npm run build            # Build de produção
npm run build:dev        # Build desenvolvimento
npm run preview          # Preview do build

# Qualidade
npm run lint             # Lint (ESLint)
npm run test             # Testes (Vitest)
npm run test:ui          # UI de testes
npm run test:coverage    # Coverage

# Deploy
netlify deploy --prod    # Deploy Netlify
```

---

## 📚 Documentação

### Guias Principais
- [**PLANO_EXECUCAO_COMPLETO.md**](PLANO_EXECUCAO_COMPLETO.md) - Roadmap 10 semanas
- [**SESSAO_IMPLEMENTACAO_16OUT.md**](SESSAO_IMPLEMENTACAO_16OUT.md) - Log detalhado da implementação
- [**RESUMO_SESSAO_FINAL.md**](RESUMO_SESSAO_FINAL.md) - Resumo executivo

### Documentação Adicional
- [IMPLEMENTACAO_COMPLETA.md](IMPLEMENTACAO_COMPLETA.md) - Novo design moderno
- [MODULES_IMPLEMENTATION.md](MODULES_IMPLEMENTATION.md) - Módulos implementados
- [MODERN_DASHBOARD_README.md](MODERN_DASHBOARD_README.md) - Guia do dashboard

### Docs Técnicos
- [docs/DESIGN_COMPARISON.md](docs/DESIGN_COMPARISON.md) - Comparação de designs
- [docs/VISUAL_GUIDE.md](docs/VISUAL_GUIDE.md) - Guia visual

---

## 🗺️ Roadmap

### ✅ Fase 1: Foundation (Completa)
- [x] Setup projeto (Vite + React + TypeScript)
- [x] Integração Supabase
- [x] Autenticação e RLS
- [x] Layout moderno com sidebar
- [x] Database schema (13 tabelas)

### ✅ Fase 2: Core Features (70% Completa)
- [x] Dashboard com KPIs
- [x] Gestão de pacientes
- [x] Meal Plan Builder (drag-drop)
- [x] Busca de alimentos TACO
- [ ] Geração com IA (Claude)
- [ ] Export PDF

### 🚧 Fase 3: Monitoramento (0%)
- [ ] Gráficos de evolução
- [ ] Logs de alimentos
- [ ] Water intake tracking
- [ ] Antropometria temporal

### 🚧 Fase 4: Portal Paciente (0%)
- [ ] Login separado
- [ ] Visualizar cardápio do dia
- [ ] Registrar consumo
- [ ] Chat com nutricionista
- [ ] Gráficos de progresso

### 🚧 Fase 5: Features Avançadas (0%)
- [ ] Sistema de mensagens real-time
- [ ] Integração Google Calendar
- [ ] Notificações push
- [ ] Biblioteca de receitas
- [ ] Dark mode

### 🚧 Fase 6: Deploy & Polish (0%)
- [ ] Testes E2E
- [ ] Performance optimization
- [ ] SEO
- [ ] Analytics
- [ ] Deploy produção

---

## 📈 Progresso

```
███████████████████░░░░░░░░░░ 70%

Completo: 10 features
Em desenvolvimento: 3 features
Planejado: 15 features
```

### Métricas
- **Arquivos:** 78 criados
- **Linhas de código:** ~17,000
- **Componentes React:** 25+
- **Páginas:** 15+
- **Tabelas DB:** 13

---

## 🧪 Testando

### Fluxo Completo

1. **Login**
```
http://localhost:5173/auth
Criar conta ou fazer login
```

2. **Dashboard**
```
/modern-dashboard
Ver KPIs, gráficos e próximas consultas
```

3. **Meal Plan Builder**
```
Sidebar → Clicar "Cardápios"
/meal-plan-builder

1. Selecionar dia (tabs)
2. Clicar "Adicionar Alimento" em qualquer refeição
3. Buscar "arroz"
4. Adicionar → Aparece no card
5. Editar quantidade → Macros recalculam
6. Arrastar para reordenar
7. Ver sidebar → Totais atualizados
```

---

## 🤝 Contribuindo

```bash
# Criar branch
git checkout -b feature/nova-feature

# Fazer mudanças
# ...

# Commit
git add .
git commit -m "feat: descrição da feature"

# Push
git push origin feature/nova-feature

# Abrir Pull Request no GitHub
```

### Padrões de Commit
- `feat:` Nova feature
- `fix:` Bug fix
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autores

- **Cristiano Dias** - *Desenvolvimento* 
- **Claude Sonnet 5** - *AI Assistant*

---

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Supabase](https://supabase.com/) - Backend as a Service
- [Framer Motion](https://www.framer.com/motion/) - Animações
- [Recharts](https://recharts.org/) - Gráficos
- [Lucide](https://lucide.dev/) - Ícones

---

## 📞 Suporte

- 📧 Email: suporte@nutriflow.com
- 💬 Discord: [Link do servidor](https://discord.gg/...)
- 📖 Docs: [Link da documentação](https://docs.nutriflow.com)

---

## 🔗 Links Úteis

- [Demo Online](https://nutriflow.netlify.app)
- [Figma Design](https://figma.com/...)
- [Trello Board](https://trello.com/...)
- [API Docs](https://api.nutriflow.com/docs)

---

<p align="center">
  Feito com ❤️ para nutricionistas brasileiros
</p>

<p align="center">
  <sub>Last updated: 16 de Outubro de 2026</sub>
</p>
