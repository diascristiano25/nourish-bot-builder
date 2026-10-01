# 🥗 NutriFlow - SaaS para Nutricionistas

Plataforma completa para nutricionistas criarem e gerenciarem cardápios alimentares personalizados com IA (Gemini 2.5 Flash).

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Tests](https://img.shields.io/badge/tests-vitest-green)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-orange)

## ⚡ Início Rápido

```bash
# 1. Clone o repositório
git clone https://github.com/diascristiano25/nourish-bot-builder.git
cd nourish-bot-builder

# 2. Instale dependências com Bun
bun install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Inicie o servidor de desenvolvimento
bun run dev
# Acesse http://localhost:8080

# 5. Rode testes
bun run test

# 6. Build para produção
bun run build
```

## 📋 Variáveis de Ambiente Necessárias

```env
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PROJECT_ID=seu_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica

# Google Gemini (para gerar cardápios)
VITE_GEMINI_API_KEY=sua_chave_api_gemini
```

## 🎯 Funcionalidades Principais

### Para Nutricionistas
- ✅ **Dashboard** - Visualizar todos os pacientes
- ✅ **Gestão de Pacientes** - CRUD completo com anamnese
- ✅ **Gerador de Cardápios com IA** - Integrado com Gemini 2.5 Flash
- ✅ **Editor de Cardápios** - Editar manualmente itens/macros
- ✅ **Documentos** - Exportar cardápios em PDF/Link
- ✅ **Monitoramento** - Acompanhar evolução (peso, medidas)
- ✅ **Agenda** - Agendamento de consultas
- ✅ **Financeiro** - Gestão de pagamentos

### Para Pacientes
- ✅ **Portal Privado** - Acessar cardápios
- ✅ **App Mobile** - Visualizar refeições do dia
- ✅ **Histórico** - Acompanhar evolução
- ✅ **Registro de Evolução** - Enviar fotos/pesos

## 🏗️ Stack Tecnológico

| Categoria | Tecnologia |
|-----------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Estilo | Tailwind CSS + Shadcn/UI |
| Estado | React Query + Context API |
| Database | Supabase (PostgreSQL) |
| IA | Google Generative AI (Gemini 2.5 Flash) |
| Testes | Vitest + @testing-library/react |
| CI/CD | GitHub Actions |
| Deploy | Vercel |

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
bun run dev          # Inicia dev server (http://localhost:8080)
bun run build        # Build para produção
bun run preview      # Preview da build

# Qualidade
bun run lint         # ESLint (TypeScript strict)
bun run test         # Vitest (testes unitários)
bun run test:ui      # Vitest com UI
bun run test:coverage # Coverage report
```

## 🧪 Testes

O projeto inclui:
- ✅ Setup Vitest completo
- ✅ Testing Library configurada
- ✅ Happy DOM como ambiente
- ✅ Teste exemplo para Button component
- ✅ Coverage reports

```bash
bun run test         # Rodar testes
bun run test:ui      # Interface visual
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod
```

Ou através do GitHub Actions (automático ao fazer push em `main`).

**Variáveis de Ambiente no Vercel:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_GEMINI_API_KEY`

Veja [`DEPLOYMENT.md`](./DEPLOYMENT.md) para mais detalhes.

## 📐 Arquitetura

```
Rotas Principais:
- /                    → Landing page
- /auth                → Login nutricionista
- /dashboard           → Dashboard nutricionista
- /patients            → Gestão de pacientes
- /patients/:id/meal-plan/generate → Gerar cardápio com IA
- /meu-app             → App mobile do paciente
- /admin               → Painel administrativo
```

Veja [`ARCHITECTURE.md`](./ARCHITECTURE.md) para documentação completa.

## 🔒 Segurança

- ✅ TypeScript strict mode (`noImplicitAny: true`)
- ✅ Autenticação via Supabase
- ✅ Multi-tenancy (isolamento de dados)
- ✅ Environment variables para secrets
- ✅ CORS configurado
- ✅ Input validation com Zod

## 📊 Atual Estado do Projeto

| Aspecto | Status |
|---------|--------|
| Frontend | ✅ Completo |
| Backend (Supabase) | ✅ Configurado |
| IA (Gemini) | ✅ Integrado |
| Testes | ✅ Setup + Exemplos |
| CI/CD | ✅ GitHub Actions |
| Deploy | ✅ Vercel Ready |
| TypeScript | ✅ Strict Mode |
| Documentação | ✅ Completa |

## 📝 Documentação

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Estrutura e padrões
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Deploy e configuração
- [`.env.example`](./.env.example) - Variáveis de ambiente

## 🤝 Contribuindo

1. Create uma feature branch: `git checkout -b feature/minha-feature`
2. Commit suas mudanças: `git commit -m 'Add minha-feature'`
3. Push: `git push origin feature/minha-feature`
4. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: seu-email@nutriflow.com
- 💬 Discord: [Link do servidor]
- 📖 Wiki: [Link wiki]

## 📄 Licença

Este projeto é privado. Todos os direitos reservados.

---

**Feito com ❤️ para nutricionistas que usam tecnologia**

Última atualização: **Outubro 2026** | Status: **Production Ready** ✅
