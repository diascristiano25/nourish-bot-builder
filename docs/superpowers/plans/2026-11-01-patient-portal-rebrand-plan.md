# Plano de Implementação: Rebrand Portal do Paciente NutriFlow

**Spec:** `docs/superpowers/specs/2026-11-01-patient-portal-rebrand-design.md`
**Data:** 2026-11-01
**Status:** Aprovado para Execução Autônoma

---

## Visão Geral

Este plano detalha a execução autônoma do rebrand completo do portal do paciente, dividido em 3 fases com tarefas paralelizáveis. Cada tarefa é independente e pode ser executada por subagentes especializados.

**Estratégia de Execução:**
- Fase 1: Fundação (tokens + nav + dashboard) → 3 subagentes paralelos
- Fase 2: Componentes Core (plano + registro + evolução + agenda + chat) → 5 subagentes paralelos
- Fase 3: Polish (animações + skeletons + testes + deploy) → 4 subagentes paralelos

**Validação Final:** agent-browser vercel para teste em produção

---

## Fase 1: Fundação (Prioridade Alta)

### Tarefa 1.1: Atualizar Tokens CSS e Tailwind Config
**Arquivos:**
- `src/index.css`
- `tailwind.config.ts`

**Ações:**
1. Substituir paleta atual (#518C5B verde clínico) por nova paleta:
   - Primary: #00C9A7 (verde-água vibrante)
   - Secondary: #845EF7 (roxo premium)
   - Accent: #F77F00 (laranja energia)
   - Background light: #F8F9FA
   - Background dark: #1A1A1A
   - Card light: #FFFFFF
   - Card dark: #2A2A2A

2. Atualizar tipografia:
   - Headings: Inter Bold
   - Body: Inter Regular
   - Numbers: JetBrains Mono (já existe, manter)

3. Adicionar tokens para glassmorphism:
   - `--glass-bg: rgba(255, 255, 255, 0.1)`
   - `--glass-border: rgba(255, 255, 255, 0.2)`
   - `--glass-blur: 12px`

4. Garantir dark mode nativo funcionando automaticamente

**Critérios de Aceite:**
- [ ] Cores aplicadas consistentemente em todo o app
- [ ] Dark mode funciona sem toggle manual
- [ ] Tipografia renderizada corretamente
- [ ] Zero erros de build

**Dependências:** Nenhuma (pode começar imediatamente)

---

### Tarefa 1.2: Refactor PatientBottomNav
**Arquivo:** `src/components/patient-mobile/PatientBottomNav.tsx`

**Ações:**
1. Substituir cor hardcoded #518C5B por token CSS `var(--primary)`
2. Adicionar micro-interações:
   - Scale animation ao tocar (já existe, manter)
   - Glow effect no botão ativo (novo)
   - Transição suave entre tabs (novo)
3. Melhorar acessibilidade:
   - aria-label em todos os botões
   - Focus visible states
4. Ajustar espaçamento para nova tipografia

**Critérios de Aceite:**
- [ ] Navegação funcional em todas as 7 tabs
- [ ] Animações suaves (60fps)
- [ ] Acessível via teclado
- [ ] Responsivo (320px+)

**Dependências:** Tarefa 1.1 (tokens CSS)

---

### Tarefa 1.3: Refactor PatientDashboard + Novos Componentes
**Arquivos:**
- `src/components/patient-mobile/PatientDashboard.tsx`
- `src/components/patient-mobile/StreakTracker.tsx` (novo)
- `src/components/patient-mobile/QuickActions.tsx` (novo)

**Ações:**

**PatientDashboard:**
1. Hero card com gradient animado (verde-água → roxo)
2. Stats cards com glassmorphism (calorias, água separados)
3. Water tracker circular com animação de preenchimento suave
4. Macro bars com gradient e labels claros
5. Próxima refeição em card expansível
6. Integrar StreakTracker e QuickActions

**StreakTracker (novo):**
1. Contador de dias consecutivos registrando refeições
2. Ícone de fogo 🔥 com animação pulse
3. Badge "X dias seguidos!"
4. Query Supabase: contar dias únicos com food_intake_logs nos últimos 30 dias

**QuickActions (novo):**
1. Botões flutuantes (FAB menu)
2. Ações rápidas:
   - Registrar água (+250ml)
   - Registrar refeição (abre tab Registro)
   - Ver próxima consulta
3. Animação de entrada/saída suave

**Critérios de Aceite:**
- [ ] Dashboard carrega em < 1s
- [ ] StreakTracker mostra dados reais do Supabase
- [ ] QuickActions funcionais e responsivos
- [ ] Animações não bloqueiam interação
- [ ] Glassmorphism funciona em light/dark mode

**Dependências:** Tarefa 1.1 (tokens CSS)

---

## Fase 2: Componentes Core (Prioridade Média)

### Tarefa 2.1: Refactor PatientPlano
**Arquivo:** `src/components/patient-mobile/PatientPlano.tsx`

**Ações:**
1. Substituir accordion por cards visuais por refeição
2. Timeline vertical do dia (linha conectando refeições)
3. Ícones coloridos por tipo de refeição (usar nova paleta)
4. Badge "✓ Completo" quando paciente marcar refeição como feita
5. Drawer de substituições melhorado:
   - Cards com fotos placeholder
   - Macros visíveis
   - Botão "Usar substituição"
6. **Novo:** Modo "Lista de Compras"
   - Extrair ingredientes de todas as refeições
   - Agrupar por categoria (proteínas, carboidratos, etc)
   - Checkbox para marcar comprado
   - Salvar estado local (localStorage)

**Critérios de Aceite:**
- [ ] Cards renderizam corretamente todos os tipos de refeição
- [ ] Timeline visual clara e responsiva
- [ ] Lista de compras funcional e persistente
- [ ] Substituições carregam rápido (< 500ms)
- [ ] Zero regressão na extração de meal groups

**Dependências:** Tarefa 1.1 (tokens CSS)

---

### Tarefa 2.2: Refactor PatientRegistro
**Arquivo:** `src/components/patient-mobile/PatientRegistro.tsx`

**Ações:**
1. Stepper visual no topo:
   - Passo 1: Tipo de refeição
   - Passo 2: Foto
   - Passo 3: Alimentos
   - Passo 4: Sentimentos (fome/saciedade)
   - Passo 5: Confirmar
2. Preview da foto com overlay de macros totais
3. Animação de confetti ao completar registro (usar canvas-confetti ou similar)
4. **Novo:** Sugestões inteligentes
   - Baseado nas últimas 5 refeições do mesmo tipo
   - Mostrar "Você costuma comer X nesta refeição"
   - Botão "Usar sugestão" preenche alimentos automaticamente
5. **Novo:** Modo rápido
   - Toggle "Modo Rápido" no topo
   - Só pede: tipo + foto (opcional)
   - Detalhes podem ser editados depois

**Critérios de Aceite:**
- [ ] Stepper navega corretamente entre passos
- [ ] Confetti anima sem travar (requestAnimationFrame)
- [ ] Sugestões carregam do Supabase (food_intake_logs)
- [ ] Modo rápido salva registro em < 2 cliques
- [ ] Foto upload funciona (compressão automática se > 2MB)
- [ ] Zero perda de dados no submit

**Dependências:** Tarefa 1.1 (tokens CSS)

---

### Tarefa 2.3: Refactor PatientEvolucao
**Arquivo:** `src/components/patient-mobile/PatientEvolucao.tsx`

**Ações:**
1. Dashboard de métricas no topo:
   - Peso atual (destaque grande)
   - IMC calculado
   - % Gordura (se disponível)
   - Medidas (cintura, quadril, etc — se disponível)
2. Gráfico interativo com Recharts:
   - Linha de peso ao longo do tempo
   - Linha de meta (pontilhada)
   - Tooltip customizado com data + valor
   - Zoom/pan se muitos dados
3. **Novo:** Fotos de Progresso
   - Upload semanal de foto
   - Galeria horizontal scrollável
   - Comparador antes/depois (lado a lado)
   - Storage Supabase: bucket `progress-photos`
4. **Novo:** Metas Visuais
   - Barra de progresso para meta de peso
   - "Faltam X kg para sua meta!"
   - Celebração ao atingir meta (confetti)

**Critérios de Aceite:**
- [ ] Gráfico renderiza em < 500ms mesmo com 100+ pontos
- [ ] Fotos fazem upload correto (compressão + resize)
- [ ] Comparador before/after funcional
- [ ] Metas calculadas corretamente
- [ ] Responsivo (gráfico adapta à largura)
- [ ] Zero memory leak no Recharts

**Dependências:** Tarefa 1.1 (tokens CSS)

---

### Tarefa 2.4: Refactor PatientAgenda
**Arquivo:** `src/components/patient-mobile/PatientAgenda.tsx`

**Ações:**
1. Calendário visual mensal no topo
   - Dias com consultas marcados com bolinha colorida
   - Clique no dia filtra consultas
2. Cards de consulta melhorados:
   - Status badge (agendada, concluída, cancelada)
   - Data/hora destacada
   - Nome do nutricionista
   - Botão Jitsi (se agendada e dentro de 1h)
3. **Novo:** Lembretes Automáticos
   - Notificação push 1h antes da consulta
   - Toast no app 30min antes
   - Query: próximas consultas nas próximas 2h
4. **Novo:** Checklist de Preparação
   - "O que levar para a consulta:"
   - Itens: diário alimentar, exames recentes, lista de dúvidas
   - Checkbox interativo (salva estado local)

**Critérios de Aceite:**
- [ ] Calendário renderiza mês correto
- [ ] Consultas filtram ao clicar no dia
- [ ] Jitsi abre em nova aba/window
- [ ] Lembretes disparam no horário certo
- [ ] Checklist persiste entre sessões
- [ ] Zero erro de timezone

**Dependências:** Tarefa 1.1 (tokens CSS)

---

### Tarefa 2.5: Refactor ChatWidget
**Arquivo:** `src/components/patient/dashboard/ChatWidget.tsx`

**Ações:**
1. Interface moderna de chat:
   - Bolhas de mensagem estilizadas
   - Avatar do nutricionista
   - Timestamp em cada mensagem
   - Indicador "digitando..."
2. **Novo:** Envio de Attachments
   - Botão 📎 para anexar foto/documento
   - Preview da imagem antes de enviar
   - Upload para Supabase Storage
   - Link clicável na mensagem
3. **Novo:** Quick Replies
   - Botões pré-definidos acima do input:
     - "Tenho uma dúvida sobre o plano"
     - "Posso substituir X por Y?"
     - "Marcar nova consulta"
   - Clique insere texto no input
4. Melhorias UX:
   - Auto-scroll para última mensagem
   - Enter envia, Shift+Enter nova linha
   - Indicador de não-lidas

**Critérios de Aceite:**
- [ ] Mensagens enviam/recebem em tempo real (Supabase realtime)
- [ ] Attachments fazem upload correto
- [ ] Quick replies inserem texto
- [ ] Indicador de digitação funciona
- [ ] Scroll automático suave
- [ ] Zero message loss

**Dependências:** Tarefa 1.1 (tokens CSS)

---

## Fase 3: Polish (Prioridade Baixa)

### Tarefa 3.1: Animações de Transição entre Tabs
**Arquivo:** `src/pages/PatientMobileApp.tsx`

**Ações:**
1. AnimatePresence do framer-motion envolvendo tabs
2. Transição de slide lateral (esquerda/direita baseado na ordem das tabs)
3. Fade + scale sutil durante transição
4. Respeitar prefers-reduced-motion

**Critérios de Aceite:**
- [ ] Transições suaves (300ms)
- [ ] Não bloqueia interação durante animação
- [ ] Reduced motion desativa animações
- [ ] Zero layout shift

**Dependências:** Todas as tarefas da Fase 2

---

### Tarefa 3.2: Skeleton Screens
**Arquivos:** Todos os componentes da Fase 1 e 2

**Ações:**
1. Criar componente `<Skeleton />` reutilizável
2. Adicionar skeletons em:
   - PatientDashboard (hero, stats, water, macros)
   - PatientPlano (cards de refeição)
   - PatientRegistro (stepper, foto preview)
   - PatientEvolucao (gráfico, métricas)
   - PatientAgenda (calendário, cards)
   - ChatWidget (mensagens)
3. Skeletons devem ter shimmer animation

**Critérios de Aceite:**
- [ ] Skeletons aparecem instantaneamente durante loading
- [ ] Shimmer animation suave
- [ ] Layout do skeleton matcheia layout final
- [ ] Zero flash de conteúdo vazio

**Dependências:** Todas as tarefas da Fase 2

---

### Tarefa 3.3: Micro-interações e Polish Visual
**Arquivos:** Todos os componentes

**Ações:**
1. Hover effects em cards (lift + shadow)
2. Button press animation (scale down sutil)
3. Input focus ring com nova cor primária
4. Toast notifications estilizadas com nova paleta
5. Loading spinners com nova cor
6. Empty states ilustrados (SVG inline)

**Critérios de Aceite:**
- [ ] Micro-interações consistentes em todo o app
- [ ] Animações performáticas (GPU accelerated)
- [ ] Empty states informativos e amigáveis
- [ ] Zero jank/lag

**Dependências:** Todas as tarefas da Fase 2

---

### Tarefa 3.4: Testes e Deploy
**Ações:**
1. Build de produção (`npm run build`)
2. Verificar zero erros TypeScript
3. Verificar zero warnings críticos
4. Lighthouse audit (performance, accessibility, best practices)
5. Deploy no Vercel via CLI
6. Teste manual com agent-browser vercel:
   - Navegar por todas as 7 tabs
   - Testar fluxo completo de registro de refeição
   - Testar upload de foto
   - Testar chat em tempo real
   - Testar dark mode
   - Testar responsividade (mobile/desktop)
7. Corrigir quaisquer issues encontradas

**Critérios de Aceite:**
- [ ] Build bem-sucedido
- [ ] Lighthouse score ≥ 90 em todas as categorias
- [ ] Deploy no Vercel bem-sucedido
- [ ] Agent-browser valida todos os fluxos principais
- [ ] Zero bugs críticos reportados
- [ ] Performance mantida ou melhorada

**Dependências:** Todas as tarefas anteriores

---

## Estratégia de Paralelização

### Fase 1 (3 subagentes simultâneos):
```
Subagente A → Tarefa 1.1 (tokens CSS)
Subagente B → Tarefa 1.2 (bottom nav) [espera A]
Subagente C → Tarefa 1.3 (dashboard + novos componentes) [espera A]
```

**Nota:** B e C dependem de A, então A executa primeiro, depois B e C em paralelo.

### Fase 2 (5 subagentes simultâneos):
```
Subagente D → Tarefa 2.1 (plano)
Subagente E → Tarefa 2.2 (registro)
Subagente F → Tarefa 2.3 (evolução)
Subagente G → Tarefa 2.4 (agenda)
Subagente H → Tarefa 2.5 (chat)
```

**Todos independentes após Fase 1 completa.**

### Fase 3 (4 subagentes simultâneos):
```
Subagente I → Tarefa 3.1 (transições)
Subagente J → Tarefa 3.2 (skeletons)
Subagente K → Tarefa 3.3 (micro-interações)
Subagente L → Tarefa 3.4 (testes + deploy) [espera I, J, K]
```

**L depende de I, J, K completarem.**

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Regressão em funcionalidades existentes | Média | Alto | Testes manuais com agent-browser após cada fase |
| Performance degradation | Baixa | Médio | Lighthouse audit após cada fase; otimizar se score < 90 |
| Conflitos de merge entre subagentes | Baixa | Médio | Cada subagente trabalha em arquivos isolados; merge sequencial |
| Supabase queries lentas | Baixa | Médio | Adicionar índices se necessário; caching local |
| Animações causando jank | Média | Médio | Usar transform/opacity apenas; requestAnimationFrame; reduced motion |

---

## Critérios de Sucesso Final

1. ✅ Todas as features atuais funcionando sem regressão
2. ✅ Nova identidade visual aplicada consistentemente
3. ✅ Dark mode nativo funcionando
4. ✅ Novos componentes (StreakTracker, QuickActions, ShoppingList, ProgressPhotos) integrados
5. ✅ Performance mantida ou melhorada (Lighthouse ≥ 90)
6. ✅ Acessibilidade WCAG AA compliant
7. ✅ Responsivo em telas 320px+
8. ✅ Build limpo (zero erros, zero warnings críticos)
9. ✅ Deploy no Vercel bem-sucedido
10. ✅ Validação final com agent-browser vercel

---

## Próximos Passos

1. ✅ Spec escrito e aprovado
2. ✅ Plano de implementação criado (este documento)
3. ⏳ **Executar Fase 1** com subagentes paralelos
4. ⏳ Executar Fase 2 com subagentes paralelos
5. ⏳ Executar Fase 3 com subagentes paralelos
6. ⏳ Deploy e validação final
7. ⏳ Entregar ao usuário: pronto, validado e testado

---

**Status:** Plano aprovado para execução autônoma imediata.