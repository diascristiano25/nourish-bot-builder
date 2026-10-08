# Nova Landing Page - NutriFlow

## 🎯 Como testar

Acesse: **http://localhost:5173/new**

A landing page original continua em: **http://localhost:5173/**

---

## ✨ O que foi resolvido

### A. Paleta genérica (AI-purple)
**ANTES:** Verde neon #1CBFA5 + Laranja #EF7B66 + gradientes com blur
**AGORA:** 
- Base: Deep slate (#0F172A, #1E293B)
- Accent cool: Electric teal (#14B8A6) - mais refinado
- Accent warm: Burnt sienna (#D97706) - apenas no CTA final
- Texto: Off-white (#F8FAFC) + slate-400 para body

### B. Layout previsível
**ANTES:** Hero centralizado → 3 cards iguais → 3 pricing cards iguais → CTA box
**AGORA:**
- **Hero Asymmetric Split (60/40)** - Conteúdo à esquerda, imagem grande à direita
- **Bento Grid** - 4 features em grid não-uniforme (2 large, 2 medium)
- **Marquee horizontal** - Social proof com cidades em loop infinito
- **Pricing staggered** - Card do meio levantado, alturas diferentes
- **CTA integrado** - Não é um box isolado, é uma seção completa

### C. Copy marketeira
**ANTES:**
- "plataforma mais avançada do mercado"
- "Impressione pacientes"
- "revolucionize", "seamless", "next-gen"

**AGORA:**
- "Menos planilhas. Mais pacientes."
- "3 minutos por cardápio" (específico, mensurável)
- "Crie cardápios personalizados em minutos, não horas"
- Benefícios diretos com números reais

### D. Identidade visual única
**ANTES:** Divs coloridos, sem assets reais
**AGORA:**
- **Fotografia real** via Picsum (placeholder com seed consistente)
- **Floating stat card** - "3 min" sobreposto na imagem
- **Micro-interações com Framer Motion:**
  - Hero fade/slide in
  - Scroll-based opacity/y transform no hero
  - Cards com stagger reveal
  - Marquee infinito
  - Bounce no scroll indicator
- **Tipografia Geist-style** - tracking-tighter, leading-none nos headlines

---

## 🎨 Design System

### Diais
- **DESIGN_VARIANCE: 8** (asymmetric, não-previsível)
- **MOTION_INTENSITY: 7** (framer-motion sophisticated)
- **VISUAL_DENSITY: 3** (clean, breathing space)

### Tipografia
- Headlines: `text-5xl lg:text-7xl font-bold tracking-tighter leading-none`
- Body: `text-lg lg:text-xl text-slate-400 leading-relaxed`
- Sem serif (100% sans-serif moderno)

### Componentes Únicos
1. **Asymmetric Split Hero** - 60/40 com floating stat card
2. **Bento Feature Grid** - Células de tamanhos diferentes
3. **Infinite Marquee** - Social proof em loop
4. **Staggered Pricing** - Card central elevado
5. **Gradient CTA Section** - Teal com pattern overlay

### Motion (Framer Motion)
- `useScroll` + `useTransform` para parallax no hero
- `initial/animate/transition` para entrada suave
- `whileInView` para reveal on scroll
- `viewport={{ once: true }}` para performance
- Animate loop infinito no marquee

---

## 📦 Dependências

Tudo já está instalado:
- ✅ `framer-motion` (já no package.json como v12.23.26)
- ✅ `lucide-react` (ícones)
- ✅ `tailwindcss` (estilização)
- ✅ React Router (navegação)

---

## 🚀 Próximos passos (se aprovar)

1. **Substituir imagens placeholder** - Usar fotos reais de nutricionistas ou do produto
2. **Adicionar seção de Cases/Testimonials** - Depoimentos reais com foto
3. **Integrar com 21st.dev** - Para componentes interativos ainda mais sofisticados
4. **Adicionar mais micro-interações** - Hover states nos cards, button physics
5. **Dark mode toggle** - Já está dark por padrão, adicionar versão light

---

## 🎯 Diferenças-chave vs. Landing Original

| Aspecto | Original | Nova |
|---------|----------|------|
| **Layout Hero** | Centralizado, simétrico | Asymmetric split 60/40 |
| **Paleta** | Verde neon + laranja | Slate + teal refinado |
| **Tipografia** | Serif + sans misturado | 100% sans, tight tracking |
| **Features** | 3 cards iguais horizontal | Bento grid 2x2 assimétrico |
| **Social Proof** | Texto estático | Marquee infinito com motion |
| **Pricing** | 3 cards nivelados | Staggered, centro elevado |
| **Motion** | Zero animação | Framer Motion por toda parte |
| **Imagens** | Div gradiente placeholder | Picsum real + floating stats |
| **Copy** | Marketeira genérica | Direta, com números específicos |

---

## 🔍 Anti-AI Tells Eliminados

✅ Sem gradiente texto nos headlines
✅ Sem "3 cards iguais" pattern
✅ Sem blur blob gigante no hero
✅ Sem Inter font (usando system + tailwind default)
✅ Sem copy marketeira ("revolucione", "seamless")
✅ Sem layout 100% centralizado
✅ Sem paleta AI-purple (verde neon + roxo)
✅ Com motion real (não apenas hover)
✅ Com layout asymmetric único
✅ Com fotografia real (não divs coloridos)

---

**Teste agora em http://localhost:5173/new e me diga o que ajustar! 🎨**
