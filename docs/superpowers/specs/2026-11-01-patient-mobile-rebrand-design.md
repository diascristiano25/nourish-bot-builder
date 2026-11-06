# Patient Mobile App Rebrand — Design Spec

**Data:** 2026-11-01
**Escopo:** Rebrand completo do app mobile do paciente (13 componentes)
**Status:** Aprovado para implementação

---

## 1. Decisões de Design

### 1.1 Paleta de Cores — Híbrida Sage/Teal

A paleta combina a base neutra sage (identidade NutriFlow existente) com teal/verde como accent principal, inspirada nas referências visuais fornecidas.

#### Tokens CSS Light Mode

| Token | Valor HSL | Uso |
|-------|-----------|-----|
| `--primary` | `168 76% 36%` | Teal principal — botões primários, links, ícones ativos, barras de progresso |
| `--primary-foreground` | `0 0% 100%` | Texto sobre primary |
| `--secondary` | `155 40% 45%` | Verde sage escuro — badges, tags secundárias, botão chat |
| `--secondary-foreground` | `0 0% 100%` | Texto sobre secondary |
| `--accent` | `28 90% 52%` | Laranja quente — FAB, streak tracker, destaque calorias |
| `--accent-foreground` | `0 0% 100%` | Texto sobre accent |
| `--background` | `150 15% 97%` | Fundo sage muito claro (levemente verde em vez de azul puro) |
| `--foreground` | `200 15% 15%` | Texto principal |
| `--card` | `0 0% 100%` | Fundo dos cards |
| `--muted` | `150 10% 94%` | Fundos sutis, backgrounds de ícones |
| `--muted-foreground` | `200 8% 50%` | Texto secundário |
| `--border` | `150 10% 88%` | Bordas dos cards e divisores |
| `--info` | `205 85% 55%` | Azul água — water tracker |
| `--success` | `155 70% 42%` | Verde sucesso — meta atingida |
| `--nf-accent-teal` | `168 76% 36%` | Alias para primary (compatibilidade) |
| `--nf-accent-purple` | `280 55% 58%` | Roxo suave — lanche da tarde, diferenciação visual |
| `--nf-accent-orange` | `28 90% 52%` | Alias para accent (compatibilidade) |

#### Tokens CSS Dark Mode

| Token | Valor HSL | Uso |
|-------|-----------|-----|
| `--primary` | `168 76% 45%` | Teal mais claro para contraste em dark |
| `--secondary` | `155 40% 50%` | Sage ajustado para dark |
| `--accent` | `28 90% 58%` | Laranja ajustado para dark |
| `--background` | `200 12% 8%` | Fundo escuro com leve tom frio |
| `--foreground` | `150 10% 95%` | Texto claro |
| `--card` | `200 10% 12%` | Card escuro |
| `--muted` | `200 8% 18%` | Muted escuro |
| `--muted-foreground` | `200 8% 55%` | Texto secundário dark |
| `--border` | `200 8% 20%` | Bordas dark |

### 1.2 Tipografia — Híbrida Playfair + Outfit

| Contexto | Família | Peso | Tamanho |
|----------|---------|------|---------|
| Hero greeting (Dashboard) | Playfair Display | 600 (semibold) | `text-xl` (20px) |
| Títulos de página (h1 fora hero) | Outfit | 600 (semibold) | `text-xl` (20px) |
| Subtítulos / headers de card | Outfit | 600 (semibold) | `text-sm` (14px) |
| Corpo de texto | Outfit | 400 (regular) | `text-sm` (14px) |
| Labels / captions | Outfit | 500 (medium) | `text-xs` (12px) |
| Números grandes (stats) | Outfit | 600 (semibold) | `text-2xl` (24px) |
| Tabular nums (dados) | Outfit | variável | classe `tabular-nums` |

**Regra:** Playfair Display aparece APENAS no hero greeting card do Dashboard (`{greeting}, {firstName}`). Todo o resto usa Outfit exclusivamente. Os headings globais (`h1-h6`) no CSS base devem mudar para Outfit; o hero aplica `font-serif` explicitamente.

### 1.3 Cards e Espaçamento

| Propriedade | Valor | Notas |
|-------------|-------|-------|
| Border radius | `rounded-2xl` (16px) | Todos os cards |
| Borda | `border border-border/60` | Fina, sutil |
| Sombra | Nenhuma por padrão | Clean look das referências |
| Padding interno | `p-4` ou `p-5` | Dependendo da densidade |
| Gap entre cards | `space-y-3` ou `space-y-4` | Ritmo vertical |
| Header padding | `px-4 pt-4 pb-4` | Consistente em todas as telas |
| Safe area bottom | `safe-area-inset-bottom` | Bottom nav e inputs |

### 1.4 Ícones e Elementos Visuais

- **Ícones:** Lucide React (mantido), strokeWidth 2 por padrão, 2.25-2.5 quando ativo
- **Icon wraps:** `w-8 h-8 rounded-lg` ou `w-9 h-9 rounded-xl` com fundo `{color}/10`
- **Badges/pills:** `rounded-full px-2.5 py-0.5 text-xs font-medium`
- **Botões primários:** `rounded-xl h-12 font-semibold`
- **Botões outline:** `rounded-xl border-border/70`
- **Inputs:** `rounded-xl h-10` ou `rounded-full h-11` (chat)
- **Sliders:** Thumb arredondado, track `h-2 rounded-full`

---

## 2. Mudanças por Componente

### 2.1 PatientDashboard.tsx
- **Hero card:** Gradiente muda de `from-primary to-secondary` → `from-primary to-[hsl(155,40%,45%)]` (teal→sage). Greeting usa `font-serif` (Playfair). Data e subtítulo permanecem Outfit.
- **Stats row:** Icon wrap de calorias muda para `bg-accent/10 text-accent`. Água mantém `bg-blue-500/10 text-blue-500` (info).
- **Water tracker card:** Badge de porcentagem muda de `bg-blue-50 text-blue-600` → `bg-info/10 text-info`.
- **Macro summary:** Sem mudanças estruturais — cores já usam tokens que serão atualizados.
- **Next meal card:** Sem mudanças estruturais.
- **Streak tracker:** Icon wrap muda para `bg-accent/10 text-accent`.
- **Quick actions FAB:** Cor do FAB muda de `bg-accent` → `bg-primary` (teal é a ação principal).

### 2.2 PatientBottomNav.tsx
- Botão central (registro): muda de `bg-accent` → `bg-primary` (teal)
- Indicador ativo: muda de `bg-primary` → mantém (já será teal)
- Texto ativo: muda de `text-primary` → mantém
- Background: mantém `bg-card/95 backdrop-blur-lg`

### 2.3 CircularWaterTracker.tsx
- Progress circle stroke: mantém `hsl(var(--info))` para não-meta, `hsl(var(--success))` para meta
- Confetti colors: atualizar para nova paleta `['#0D9488', '#14B8A6', '#5EEAD4', '#2DD4BF']` (tons de teal)
- Quick add buttons: mudam de `border-info/30 text-info` → mantêm (info = azul água, correto semanticamente)

### 2.4 MacroSummary.tsx
- Calorias: muda de `bg-accent` → `bg-accent` (laranja, mantido para diferenciação)
- Proteína: muda de `bg-primary` → `bg-primary` (teal, correto)
- Carboidratos: mantém `bg-amber-500`
- Gordura: mantém `bg-sky-500`
- Sem mudanças estruturais necessárias — tokens se atualizam sozinhos

### 2.5 NextMealCard.tsx
- Icon wrap: muda de `bg-primary/10 text-primary` → mantém (teal)
- Horário: muda de `text-primary` → mantém
- Sem mudanças estruturais

### 2.6 StreakTracker.tsx
- Icon wrap: muda de `bg-accent/10 text-accent` → mantém (laranja para streak/fogo faz sentido semântico)
- Sem mudanças estruturais

### 2.7 QuickActions.tsx
- FAB principal: muda de `bg-accent` → `bg-primary` (teal como cor primária de ação)
- Botão água: mantém `bg-blue-500` (semântico)
- Botão registro: muda de `bg-primary` → mantém (teal)
- Botão agenda: muda de `bg-secondary` → mantém (sage)

### 2.8 PatientPlano.tsx
- Meta diária card: muda de `bg-primary/[0.06]` → mantém
- Accordion items: mantêm borda e estilo
- Meal accents: atualizar mapa `mealAccent` para usar novos tokens
  - Café/Lanche manhã: `text-accent bg-accent/10` (laranja)
  - Almoço: `text-primary bg-primary/10` (teal)
  - Lanche tarde: `text-[hsl(280,55%,58%)] bg-[hsl(280,55%,58%)]/10` (roxo)
  - Jantar: `text-secondary bg-secondary/10` (sage)
  - Ceia: `text-muted-foreground bg-muted`
- Substituições drawer: cards mantêm estilo

### 2.9 PatientRegistro.tsx
- Header: muda de `font-bold` → `font-semibold` (Outfit semibold, não bold)
- Meal selection buttons: active state muda de `border-primary bg-primary/10` → mantém
- Photo upload area: icon wrap muda de `bg-primary/10 text-primary` → mantém
- Food search results hover: muda de `hover:bg-primary/5` → mantém
- Macro summary bar: muda de `border-primary/30 bg-primary/5` → mantém
- Submit button: mantém `bg-primary` (teal)

### 2.10 PatientEvolucao.tsx
- Stat cards: icon wraps usam `bg-primary/10 text-primary` → mantém
- Chart gradient: atualizar cores de `hsl(168, 100%, 39%)` → `hsl(168, 76%, 36%)` (novo teal)
- Chart stroke/dot: mesma atualização de cor
- Variação card: losing usa `text-primary`, gaining usa `text-accent` → mantém semântica

### 2.11 PatientPerfil.tsx
- User card gradient: muda de `from-primary/10 to-primary/5` → mantém
- Avatar wrap: muda de `bg-primary/20 text-primary` → mantém
- Goal badge: muda de `bg-secondary/20 text-secondary` → mantém
- Menu icons: mantêm `bg-muted/50 text-muted-foreground`
- Logout button: mantém destructive styling

### 2.12 PatientAgenda.tsx
- Section headers: ícone usa `text-primary` → mantém
- Video button: mantém `bg-primary`
- Status badges: mantêm variantes default/secondary/destructive
- Past appointments opacity: mantém `opacity-70`

### 2.13 PatientChat.tsx
- Trigger button: muda de `bg-secondary` → `bg-secondary` (sage para chat, diferenciado do primary)
- Nutritionist avatar: muda de `bg-secondary/20 text-secondary` → mantém
- Patient message bubble: muda de `bg-primary` → mantém (teal)
- Input: mantém `rounded-full bg-muted/50`
- Send button: mantém primary

---

## 3. Mudanças Globais (CSS/Tokens)

### 3.1 index.css — Token Updates
- Atualizar todos os valores HSL na seção `:root` e `.dark` conforme tabela §1.1
- Headings globais (`h1-h6`): mudar de `font-family: 'Playfair Display'` → `font-family: 'Outfit'`
- Adicionar utility class `.font-display { font-family: 'Playfair Display', serif; }` para uso pontual no hero

### 3.2 tailwind.config.ts
- Sem mudanças estruturais necessárias — os tokens CSS já são referenciados via `hsl(var(--*))` 
- Opcional: adicionar alias `nf-teal`, `nf-sage` se necessário para clareza

### 3.3 PatientMobileApp.tsx (wrapper)
- Verificar se há estilos inline ou overrides que precisam de atualização
- Garantir que o container global use `bg-background` atualizado

---

## 4. Ordem de Implementação

1. **Tokens CSS** (index.css) — base para tudo
2. **Tailwind config** — se houver ajustes
3. **PatientDashboard** — tela mais visível, valida a direção
4. **PatientBottomNav** — navegação sempre presente
5. **CircularWaterTracker + MacroSummary + NextMealCard + StreakTracker** — sub-componentes do dashboard
6. **QuickActions** — FAB
7. **PatientPlano** — segunda tela mais usada
8. **PatientRegistro** — formulário crítico
9. **PatientEvolucao** — chart + stats
10. **PatientPerfil** — settings
11. **PatientAgenda** — consultas
12. **PatientChat** — chat sheet

---

## 5. Critérios de Aceite

- [ ] Todos os 13 componentes renderizam sem erros de build
- [ ] Paleta híbrida sage/teal aplicada consistentemente
- [ ] Playfair Display aparece apenas no hero greeting
- [ ] Cards mantêm borda fina + sem sombra pesada
- [ ] Dark mode funciona corretamente com novos tokens
- [ ] Animações/confetti usam cores da nova paleta
- [ ] Charts do Recharts usam novo teal
- [ ] Nenhum componente usa hardcoded `hsl(168, 100%, 39%)` antigo
- [ ] Build passa clean (< 30s)