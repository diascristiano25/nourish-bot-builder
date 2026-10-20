# NutriFlow Launch LP Redesign — Design Spec

**Date:** 2026-10-20
**Status:** Draft for Review
**Approach:** A — Scroll-Driven Narrative (CSS Native Motion)

## 1. Objetivo

Rebranding completo da Landing Page do NutriFlow como uma **LP de lançamento de sistema inovador**, removendo qualquer prova social de "produto estabelecido" (depoimentos, contagem de nutricionistas atendidos). A nova LP deve comunicar inovação, tecnologia de ponta e exclusividade de lançamento.

## 2. Direção Visual

### 2.1 Paleta de Cores
| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-primary` | `#FAFAF9` | Fundo principal (warm white) |
| `--bg-secondary` | `#F5F4F1` | Fundo alternado de seções |
| `--text-primary` | `#1A1F2E` | Títulos e corpo principal |
| `--text-secondary` | `#6B7280` | Subtítulos e descrições |
| `--accent-primary` | `#1CBFA5` | Teal NutriFlow — ícones, badges, highlights |
| `--accent-cta` | `#EF7B66` | Coral — CTAs primários |
| `--border` | `#E8E6E1` | Bordas sutis de cards e divisores |

### 2.2 Tipografia
- **Headlines:** Serif moderna (ex: Playfair Display ou equivalente no projeto) — peso bold, tracking leve
- **Corpo:** Sans-serif geométrica (ex: Inter ou equivalente) — peso regular/medium
- **Escala:** Hero h1: 56-64px desktop / 36-40px mobile; h2 seções: 40-48px; corpo: 18px com line-height 1.7

### 2.3 Tom
Premium, minimalista, warm. Espaçamento generoso (padding vertical 120-160px entre seções). Sem clutter visual. Cada seção respira.

## 3. Estrutura de Seções (Launch LP)

### 3.1 Header (Sticky)
- Logo NutriFlow + wordmark
- Nav minimalista: "Recursos", "Como Funciona", "Planos"
- CTA secundário: "Entrar" (outline)
- Background blur sutil (`backdrop-blur-md`) com borda inferior quase invisível
- **Motion:** fade-in no load, border aparece após 50px de scroll via `scroll-timeline`

### 3.2 Hero — "O Futuro da Nutrição Chegou"
- Badge animado: "🚀 Lançamento Exclusivo" com pulse suave
- Headline: "Cardápios inteligentes que se adaptam a cada paciente"
- Subheadline: "IA generativa + gestão clínica em uma plataforma unificada. Disponível agora."
- Dois CTAs: "Começar Grátis" (coral, sólido) + "Ver Demo" (teal, outline)
- Mockup do dashboard interativo (imagem/SVG com parallax sutil)
- **Motion:** headline com `animation-timeline: view()` fade-up staggered; mockup com parallax vinculado ao scroll progress

### 3.3 Value Props (3 Cards)
- Grid 3 colunas (1 coluna mobile)
- Cards: ícone teal + título + descrição curta
  - "IA Generativa Avançada" — Gemini 2.5 gera cardápios personalizados em segundos
  - "Gestão Clínica Unificada" — Pacientes, agendamento e evolução em um só lugar
  - "Resultados Mensuráveis" — Analytics em tempo real do progresso dos pacientes
- **Motion:** cards entram com stagger fade-up + scale ao entrar na viewport (`view-timeline`)

### 3.4 Como Funciona (Timeline/Stages)
- Layout vertical com linha conectora à esquerda (teal)
- 3 stages numerados:
  1. "Cadastre o perfil do paciente" — anamnese inteligente
  2. "IA gera o cardápio personalizado" — baseado em objetivos e restrições
  3. "Acompanhe resultados em tempo real" — dashboard de evolução
- Cada stage tem ilustração/mockup lateral
- **Motion:** linha conectora desenha-se ao scroll (`scroll-timeline`); cada stage revela-se sequencialmente com slide-in lateral

### 3.5 Feature Showcase (Alternating Sections)
- 2-3 blocos alternados (imagem esquerda/direita)
- Foco em features-chave do lançamento:
  - Gerador de cardápios com IA
  - App mobile do paciente
  - Relatórios automatizados
- **Motion:** imagem com parallax; texto com fade-slide; elementos decorativos com floating animation CSS

### 3.6 Pricing (Launch Edition)
- 3 planos: Starter / Pro (destaque) / Enterprise
- Badge "Mais Popular" no Pro
- Sem comparação excessiva — foco no valor de cada tier
- CTA coral em todos os planos
- **Motion:** cards com hover lift + glow sutil; highlighted card com border gradient animado

### 3.7 CTA Final
- Fundo gradiente sutil teal→coral (opacity baixa)
- Headline: "Pronto para transformar sua prática?"
- Subheadline: "Junte-se aos primeiros nutricionistas a usar o NutriFlow."
- CTA grande: "Começar Gratuitamente"
- **Motion:** background gradient com slow animation; texto fade-up

### 3.8 Footer
- Minimalista: logo, copyright, links essenciais
- Sem redes sociais ou conteúdo desnecessário

## 4. Motion Design System (Abordagem A)

### 4.1 Tecnologias
- **CSS `scroll-timeline` e `view-timeline`** — zero JS runtime para animações de scroll
- **CSS `@keyframes`** — micro-interações e loops decorativos
- **View Transitions API** — transições entre estados (opcional, progressive enhancement)
- **`prefers-reduced-motion`** — fallback obrigatório: todas as animações desativadas ou reduzidas a opacity simples

### 4.2 Catálogo de Animações
| Elemento | Trigger | Efeito | Duration | Easing |
|----------|---------|--------|----------|--------|
| Hero headline | View enter | Fade-up + slight scale | 800ms | ease-out |
| Hero mockup | Scroll progress | Parallax Y translate | Continuous | linear |
| Value prop cards | View enter | Stagger fade-up + scale | 600ms each | ease-out |
| Timeline line | Scroll progress | Height grow from 0% to 100% | Continuous | linear |
| Timeline stages | View enter | Slide-in from left/right | 700ms | ease-out |
| Feature blocks | View enter | Fade-slide + image parallax | 800ms | ease-out |
| Pricing cards | Hover | Lift Y + shadow expand | 300ms | ease |
| CTA badge | Load | Pulse loop | 2s infinite | ease-in-out |
| Section backgrounds | Scroll progress | Opacity crossfade | Continuous | linear |

### 4.3 Performance Targets
- Lighthouse Performance: ≥ 95
- CLS: 0 (reservar espaço para elementos animados)
- Zero layout thrashing — apenas `transform` e `opacity` animados
- Bundle adicional por motion: < 5KB (CSS-only)

## 5. Restrições e Não-Funcionais

### 5.1 Conteúdo Proibido
- ❌ Contagem de nutricionistas/pacientes atendidos
- ❌ Depoimentos/testimonials
- ❌ Logos de empresas parceiras
- ❌ Qualquer linguagem de "produto consolidado"

### 5.2 Linguagem de Lançamento
- ✅ "Lançamento exclusivo"
- ✅ "Disponível agora"
- ✅ "Seja um dos primeiros"
- ✅ "Nova geração"
- ✅ "Inovação em nutrição"

### 5.3 Responsividade
- Mobile-first breakpoints: 640px / 768px / 1024px / 1280px
- Touch targets ≥ 44px
- Font sizes responsivos (clamp())
- Motion reduzido em mobile (menos parallax, mais fade simples)

### 5.4 Acessibilidade
- Contraste WCAG AA em todas as combinações de cor
- `prefers-reduced-motion` respeitado globalmente
- Semantic HTML5 (landmarks, headings hierarchy)
- Alt text descritivo em todas as imagens
- Focus visible em todos os elementos interativos

## 6. Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `src/pages/LandingPage.tsx` | Reescrita completa |
| `src/index.css` | Adicionar tokens CSS + keyframes + scroll-timeline rules |
| `tailwind.config.ts` | Estender paleta com tokens NutriFlow launch |
| `src/components/ui/*` | Possíveis novos componentes (Timeline, AnimatedCard) |
| `src/assets/` | Novos assets de mockup/ilustrações |

## 7. Critérios de Aceite

- [ ] LP renderiza corretamente em Chrome, Firefox, Safari, Edge (latest)
- [ ] Lighthouse Performance ≥ 95, Accessibility ≥ 95
- [ ] Zero prova social (sem depoimentos, sem contagens)
- [ ] Motion funciona em browsers com suporte a scroll-timeline
- [ ] Fallback graceful em browsers sem suporte (conteúdo visível, sem animação)
- [ ] `prefers-reduced-motion` desativa todas as animações
- [ ] Responsivo em 375px, 768px, 1024px, 1440px
- [ ] Paleta NutriFlow aplicada consistentemente
- [ ] Linguagem de lançamento em todo o copy