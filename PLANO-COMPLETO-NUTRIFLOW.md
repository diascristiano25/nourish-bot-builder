# PLANO COMPLETO: NUTRIFLOW 100% FUNCIONAL

## OBJETIVO
Corrigir todos os erros do NutriFlow e deixar 100% funcional:
- ✅ Todas as páginas funcionando
- ✅ Todas as features implementadas
- ✅ Acesso do paciente funcionando
- ✅ Validado e testado no navegador

---

## FASE 1: AUDITORIA COMPLETA DO SISTEMA

### 1.1 Mapear Todas as Páginas e Features
- [ ] Listar todas as rotas definidas em App.tsx
- [ ] Verificar quais componentes cada rota usa
- [ ] Identificar features principais de cada página
- [ ] Mapear dependências de dados (tabelas Supabase)

### 1.2 Verificar Tabelas do Banco de Dados
- [x] profiles ✓
- [x] patients ✓
- [x] appointments ✓
- [x] custom_foods ✓
- [x] messages ✓
- [x] meal_plans ✓
- [x] consultations ✓
- [ ] Verificar RLS policies
- [ ] Verificar foreign keys
- [ ] Verificar triggers

### 1.3 Testar Cada Página no Navegador
- [ ] Landing page (/)
- [ ] Auth (/auth)
- [ ] Dashboard (/dashboard)
- [ ] Pacientes (/pacientes)
- [ ] Perfil (/perfil)
- [ ] Biblioteca (/biblioteca)
- [ ] Financeiro (/financeiro)
- [ ] Agenda (/agenda)
- [ ] Configurações (/settings)

---

## FASE 2: CORREÇÃO DE ERROS CRÍTICOS

### 2.1 Erros 404 nas APIs do Supabase
**Status:** ⚠️ Múltiplos erros 404 detectados
**Causa:** Consultas a tabelas ou endpoints inexistentes

**Ações:**
- [ ] Grep todos os erros 404 no console
- [ ] Identificar tabelas/endpoints faltantes
- [ ] Criar tabelas necessárias
- [ ] Atualizar queries do frontend

### 2.2 Perfil do Usuário
**Status:** ⚠️ Página /profile retorna 404
**Causa:** Rota incorreta ou componente faltando

**Ações:**
- [ ] Verificar rota em App.tsx
- [ ] Verificar se componente Profile.tsx existe
- [ ] Criar componente se necessário
- [ ] Testar no navegador

### 2.3 Biblioteca de Alimentos
**Status:** ⚠️ Erro ao carregar biblioteca
**Causa:** Tabela custom_foods existe mas pode ter RLS problem

**Ações:**
- [ ] Verificar RLS policies em custom_foods
- [ ] Testar query no Supabase
- [ ] Corrigir policies se necessário
- [ ] Adicionar dados de teste

---

## FASE 3: IMPLEMENTAÇÃO DE FEATURES COMPLETAS

### 3.1 Sistema de Autenticação
- [ ] Login funcionando
- [ ] Cadastro funcionando
- [ ] Recuperação de senha
- [ ] Email de confirmação
- [ ] Perfil do usuário editável

### 3.2 Gestão de Pacientes
- [ ] Listar pacientes
- [ ] Adicionar novo paciente
- [ ] Editar paciente
- [ ] Deletar paciente
- [ ] Visualizar detalhes do paciente
- [ ] Histórico de consultas

### 3.3 Sistema de Consultas
- [ ] Agendar consulta
- [ ] Visualizar agenda
- [ ] Registrar consulta
- [ ] Anexar documentos
- [ ] Histórico de consultas

### 3.4 Gerador de Cardápios (IA)
- [ ] Integração com Gemini API
- [ ] Formulário de preferências
- [ ] Geração de cardápio
- [ ] Edição de cardápio
- [ ] Salvar cardápio
- [ ] Exportar PDF

### 3.5 Biblioteca de Alimentos
- [ ] Listar alimentos
- [ ] Buscar alimentos
- [ ] Adicionar alimento personalizado
- [ ] Editar alimento
- [ ] Deletar alimento
- [ ] Categorias de alimentos

### 3.6 Sistema Financeiro
- [ ] Integração Stripe
- [ ] Planos de assinatura
- [ ] Pagamentos
- [ ] Faturas
- [ ] Trial de 14 dias

### 3.7 Acesso do Paciente
- [ ] Login do paciente (/patient-auth)
- [ ] Dashboard do paciente
- [ ] Visualizar cardápios
- [ ] Chat com nutricionista
- [ ] Acompanhamento de metas

---

## FASE 4: VALIDAÇÃO E TESTES

### 4.1 Testes Manuais no Navegador
- [ ] Criar usuário teste
- [ ] Testar fluxo completo de onboarding
- [ ] Testar cada página
- [ ] Testar cada feature
- [ ] Verificar responsividade
- [ ] Verificar dark mode

### 4.2 Testes de Integração
- [ ] Supabase Auth
- [ ] Supabase Database
- [ ] Stripe API
- [ ] Gemini API
- [ ] Upload de arquivos

### 4.3 Performance
- [ ] Lighthouse audit
- [ ] Otimizar imagens
- [ ] Lazy loading
- [ ] Bundle size

---

## FASE 5: DOCUMENTAÇÃO E DEPLOY

### 5.1 Documentação
- [ ] README atualizado
- [ ] Guia de setup
- [ ] Variáveis de ambiente
- [ ] Guia de uso

### 5.2 Deploy Final
- [ ] Build production
- [ ] Deploy Netlify
- [ ] Verificar environment variables
- [ ] Teste em produção

---

## ESTRUTURA DE EXECUÇÃO

### Agentes Paralelos
1. **Agent 1: Database & Backend**
   - Auditoria completa do Supabase
   - Criação de tabelas faltantes
   - Configuração de RLS policies
   - Criação de triggers e functions

2. **Agent 2: Frontend Pages**
   - Correção de rotas
   - Implementação de páginas faltantes
   - Correção de bugs UI
   - Validação no navegador

3. **Agent 3: Features & Integrations**
   - Sistema de pacientes
   - Gerador de cardápios
   - Biblioteca de alimentos
   - Sistema financeiro

4. **Agent 4: Testing & QA**
   - Testes manuais
   - Screenshots
   - Relatório de bugs
   - Validação final

---

## PRIORIDADES

### P0 - Crítico (Bloqueia uso)
1. Corrigir erros 404 nas APIs
2. Login/Auth funcionando
3. Dashboard funcionando
4. Gestão básica de pacientes

### P1 - Alta (Features principais)
1. Sistema de consultas
2. Gerador de cardápios
3. Biblioteca de alimentos
4. Perfil do usuário

### P2 - Média (Melhorias)
1. Sistema financeiro
2. Acesso do paciente
3. Chat
4. Notificações

### P3 - Baixa (Nice to have)
1. Analytics
2. Relatórios
3. Exportações
4. Integrações extras

---

## MÉTRICAS DE SUCESSO

- [ ] 0 erros 404 no console
- [ ] 0 erros no Supabase
- [ ] 100% das rotas funcionando
- [ ] 100% das features principais implementadas
- [ ] Lighthouse score > 90
- [ ] Testado em produção
- [ ] Documentação completa
