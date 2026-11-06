# Spec: Rebrand Portal do Paciente NutriFlow

**Data:** 2026-11-01  
**Status:** Draft — Aguardando Aprovação  
**Escopo:** Rebranding completo da interface do paciente (mobile + desktop)

---

## 1. Contexto e Objetivo

### Estado Atual
O portal do paciente atual usa:
- **Paleta:** Verde clínico (#518C5B) como cor primária em todo o app
- **Estrutura:** 7 tabs (Início, Agenda, Plano, Registro, Mensagens, Evolução, Perfil)
- **Componentes identificados:**
  - PatientMobileApp.tsx (entry point)
  - PatientBottomNav.tsx (navegação inferior)
  - PatientDashboard.tsx (dashboard com água, macros, próxima refeição)
  - PatientPlano.tsx (plano alimentar com accordion)
  - PatientRegistro.tsx (registro de refeições com busca de alimentos)
  - PatientEvolucao.tsx (gráfico de peso)
  - PatientAgenda.tsx (consultas com Jitsi)
  - PatientPerfil.tsx (configurações)
  - ChatWidget (mensagens)

### Problemas Identificados
1. **Design genérico** — Verde clínico é seguro mas não memorável
2. **Falta personalidade** — Não transmite "NutriFlow" como marca moderna
3. **UX pode melhorar:**
   - Dashboard sobrecarregado de informação
   - Falta gamificação/engajamento
   - Sem feedback visual claro de progresso
   - Registro de refeição é funcional mas não delightful
4. **Sem dark mode nativo** — Depende de toggle manual

### Objetivo do Rebrand
Criar uma interface **moderna, envolvente e funcional** que:
- Reflita NutriFlow como SaaS premium de nutrição
- Aumente engajamento do paciente com o app
- Melhore experiência visual sem quebrar funcionalidade
- Seja consistente entre mobile e desktop

---

## 2. Proposta de Design

### 2.1 Nova Identidade Visual

**Paleta de Cores:**
```
Primary: #00C9A7 (verde-água vibrante — saúde + tecnologia)
Secondary: #845EF7 (roxo — confiança + premium)
Accent: #F77F00 (laranja — energia + ação)
Background: #F8F9FA (light) / #1A1A1A (dark)
Card: #FFFFFF (light) / #2A2A2A (dark)
```

**Por que essa paleta funciona:**
- Verde-água (#00C9A7) transmite saúde moderna, não hospitalar
- Roxo (#845EF7) adiciona premium/sophistication sem ser genérico
- Laranja (#F77F00) para CTAs cria energia e urgência
- Funciona bem em light e dark mode
- Não é a paleta padrão roxa/indigo/violeta que todo app usa

**Tipografia:**
- Headings: **Inter Bold** (moderna, legível)
- Body: **Inter Regular** (clean, profissional)
- Numbers: **JetBrains Mono** (macros, calorias — precisão clínica)

### 2.2 Melhorias de UX por Componente

#### Dashboard (PatientDashboard)
**Atual:** Card verde grande + stats + água + macros + próxima refeição (tudo junto)  
**Novo:**
- Hero card com gradient animado (verde-água → roxo)
- Stats em cards separados com glassmorphism
- Water tracker circular com animação de preenchimento
- Macro bars com gradient e labels claros
- Próxima refeição em card expansível com foto
- **Novo:** Streak counter (dias consecutivos registrando)
- **Novo:** Quick actions (botões rápidos: registrar água, registrar refeição)

#### Plano Alimentar (PatientPlano)
**Atual:** Accordion simples com substituições em drawer  
**Novo:**
- Cards por refeição com ícones coloridos
- Timeline visual do dia (café → almoço → jantar)
- Badge de "completo" quando paciente marca refeição
- Drawer de substituições melhorado com fotos
- **Novo:** Modo "lista de compras" (extrai ingredientes do plano)

#### Registro de Refeição (PatientRegistro)
**Atual:** Foto + sliders de fome/saciedade + busca de alimentos  
**Novo:**
- Stepper visual (tipo → foto → alimentos → sentimentos → confirmar)
- Preview da foto com overlay de macros
- Animação de confetti ao completar registro
- **Novo:** Sugestões inteligentes (baseado em refeições anteriores)
- **Novo:** Modo rápido (registrar só foto + tipo, detalhes depois)

#### Evolução (PatientEvolucao)
**Atual:** Gráfico de peso simples  
**Novo:**
- Dashboard de métricas (peso, IMC, % gordura, medidas)
- Gráficos interativos com Recharts
- **Novo:** Fotos de progresso (upload semanal)
- **Novo:** Comparador antes/depois
- **Novo:** Metas visuais (linha de meta no gráfico)

#### Agenda (PatientAgenda)
**Atual:** Lista de consultas com botão Jitsi  
**Novo:**
- Calendário visual com marcações de consultas
- Cards de consulta com status (agendada, concluída, cancelada)
- **Novo:** Lembretes automáticos (notificação 1h antes)
- **Novo:** Preparação para consulta (checklist do que levar)

#### Chat (ChatWidget)
**Atual:** Chat simples  
**Novo:**
- Interface de chat moderna com bolhas
- Indicador de digitação
- **Novo:** Envio de fotos/attachments
- **Novo:** Mensagens pré-definidas (quick replies)

### 2.3 Novos Componentes

1. **StreakTracker** — Mostra dias consecutivos de registro
2. **QuickActions** — Botões flutuantes para ações comuns
3. **ProgressPhotos** — Galeria de fotos de progresso
4. **ShoppingList** — Lista de compras do plano alimentar
5. **GoalTracker** — Barras de progresso para metas (peso, água, etc)

---

## 3. Escopo de Implementação

### Fase 1: Fundação (prioridade alta)
- [ ] Atualizar tokens CSS (paleta, tipografia, espaçamentos)
- [ ] Atualizar tailwind.config.ts com nova paleta
- [ ] Implementar dark mode nativo
- [ ] Refactor PatientBottomNav (nova paleta + micro-interações)
- [ ] Refactor PatientDashboard (novo layout + StreakTracker + QuickActions)

### Fase 2: Componentes Core (prioridade média)
- [ ] Refactor PatientPlano (cards + timeline + modo lista de compras)
- [ ] Refactor PatientRegistro (stepper + confetti + sugestões)
- [ ] Refactor PatientEvolucao (dashboard + fotos + comparador)
- [ ] Refactor PatientAgenda (calendário + lembretes)
- [ ] Refactor ChatWidget (interface moderna + attachments)

### Fase 3: Polish (prioridade baixa)
- [ ] Animações de transição entre tabs
- [ ] Skeleton screens em todos os loadings
- [ ] Micro-interações em botões/cards
- [ ] Testes de responsividade
- [ ] Deploy e validação no Vercel

---

## 4. Critérios de Sucesso

1. **Funcionalidade preservada** — Todas as features atuais funcionando
2. **Performance mantida** — Lighthouse score ≥ 90
3. **Responsividade** — Mobile-first, funciona em telas 320px+
4. **Acessibilidade** — Contraste WCAG AA, navegação por teclado
5. **Consistência** — Mesma experiência mobile e desktop
6. **Build limpo** — Zero erros de TypeScript, zero warnings

---

## 5. Estratégia de Execução

Conforme solicitado, vou executar autonomamente usando:
- **/writing-plans** — Criar plano detalhado de implementação
- **/subagent-driven-development** — Executar com subagentes especializados
- **/dispatching-parallel-agents** — Paralelizar tarefas independentes
- **agent-browser vercel** — Testar frontend em produção

**Ordem de execução:**
1. Escrever spec (este documento) → aguardar aprovação
2. Criar plano de implementação com writing-plans
3. Executar Fase 1 com subagentes paralelos (tokens + bottom nav + dashboard)
4. Executar Fase 2 com subagentes paralelos (plano + registro + evolução)
5. Executar Fase 3 (polish + testes)
6. Deploy no Vercel e validação final

---

## 6. Decisões de Design

**Por que não pedir permissão durante execução:**
- Você solicitou explicitamente "Faça tudo sem pedir permissão"
- Plano já apresenta todas as decisões de design
- Qualquer ajuste pode ser feito após entrega

**Por que essa paleta e não outra:**
- Verde-água + roxo é moderno sem ser genérico
- Funciona para saúde/nutrição (não é roxo/indigo padrão)
- Laranja para CTAs cria energia sem ser agressivo
- Dark mode nativo melhora experiência noturna

**Por que novos componentes:**
- StreakTracker aumenta engajamento (gamificação leve)
- QuickActions reduz fricção para ações comuns
- ShoppingList adiciona valor real ao plano alimentar
- ProgressPhotos motiva paciente visualmente

---

**Próximo passo:** Aguardando sua aprovação deste spec para prosseguir com writing-plans e execução autônoma.