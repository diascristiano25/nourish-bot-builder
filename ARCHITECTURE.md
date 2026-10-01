# NutriFlow - Documentação de Arquitetura

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/                 # Componentes Shadcn/UI reutilizáveis
│   ├── admin/              # Dashboard admin
│   ├── monitoring/         # Monitoramento de pacientes
│   ├── patient-mobile/     # App mobile do paciente
│   └── *.tsx               # Componentes específicos
├── pages/                  # Rotas/páginas (27 rotas)
├── hooks/
│   ├── useAuth.tsx         # Autenticação
│   ├── useTheme.tsx        # Tema
│   ├── useGenerateMealPlan.tsx # Gerador de cardápios (NOVO)
│   └── *.tsx               # Outros hooks
├── services/
│   ├── supabase/           # Cliente Supabase
│   └── gemini.ts           # Integração Gemini 2.5 Flash (NOVO)
├── integrations/
│   └── supabase/           # Tipos auto-gerados
├── lib/                    # Utilitários
├── test/                   # Setup de testes
└── App.tsx                 # Roteador principal
```

## 🔄 Fluxo de Geração de Cardápio

```
1. Nutricionista preenche dados do paciente (anamnese)
2. Clica em "Gerar Cardápio"
3. Hook `useGenerateMealPlan` é chamado
4. Envia dados para `src/services/gemini.ts`
5. Gemini 2.5 Flash gera plano alimentar
6. Valida se está correto (calorias, nutrientes)
7. Exibe na tela para edição manual
8. Nutricionista pode editar/salvar
9. Exporta como PDF para paciente
```

## 🔐 Variáveis de Ambiente

```env
# Supabase (Obrigatório)
VITE_SUPABASE_URL
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY

# Gemini (Obrigatório para gerar cardápios)
VITE_GEMINI_API_KEY

# Monitoring (Opcional)
VITE_SENTRY_DSN
VITE_POSTHOG_KEY
```

## 📦 Stack Tecnológico

- **Frontend**: React 18 + Vite + TypeScript
- **Estilo**: Tailwind CSS + Shadcn/UI
- **Estado**: React Query (TanStack Query) + Context API
- **Forms**: React Hook Form + Zod
- **Database**: Supabase (PostgreSQL)
- **IA**: Google Generative AI (Gemini 2.5 Flash)
- **Testes**: Vitest + @testing-library/react
- **CI/CD**: GitHub Actions
- **Deploy**: Vercel

## 🧪 Testes

```bash
# Rodar testes
bun run test

# Com UI interativa
bun run test:ui

# Com coverage
bun run test:coverage
```

## 📚 Padrões de Código

### Componentes
- Functional components com hooks
- TypeScript estrito (`noImplicitAny: true`)
- Props tipadas com interfaces
- Use `@` para imports (alias configurado)

### Services
- Lógica de negócio isolada em services
- Tratamento de erros centralizado
- Tipagem completa com TypeScript

### Hooks
- Reutilizáveis e testáveis
- Usar React Query para data fetching
- Gerenciar loading/error/success states

## 🚀 Deploy

Veja `DEPLOYMENT.md` para instruções completas.

## 🔍 Debugging

- **Vite DevTools**: Browser DevTools
- **React Query DevTools**: Disponível em dev
- **ESLint**: `bun run lint`
- **TypeScript**: `bun run build` (sem emitir)

## 📋 TODO

- [ ] Corrigir 25 arquivos com `any` type
- [ ] Adicionar testes para componentes críticos (min 70% coverage)
- [ ] Implementar Sentry para error tracking
- [ ] Adicionar analytics (PostHog/Mixpanel)
- [ ] Testes E2E com Playwright
- [ ] Dark mode completo
- [ ] Otimizar bundle size
- [ ] Lighthouse score > 90
