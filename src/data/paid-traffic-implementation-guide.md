# 🎯 Guia de Implementação - Tráfego Pago NutriFlow

## 📋 Resumo Executivo

**Objetivo:** Capturar nutricionistas que usam concorrentes (Nutri+, DietPro, Dietbox, etc)  
**Budget Inicial:** R$ 70-100/dia (R$ 2.100-3.000/mês)  
**Meta:** 50-80 signups/mês (CPL < R$ 45)  
**Período de Teste:** 30 dias

---

## 🎨 Criativos Desenvolvidos

### 12 Variações Persuasivas

#### **Categoria 1: DOR (4 criativos)**
- ✅ `dor-planilhas-01` - Perda de tempo com Excel
- ✅ `dor-insatisfacao-01` - Cancelamento de outros SaaS
- ✅ `dor-suporte-01` - Bugs e suporte ruim

**Quando usar:** Remarketing, audiências lookalike de insatisfeitos

#### **Categoria 2: VELOCIDADE (3 criativos)**
- ✅ `velocidade-ia-01` - IA que gera em 3 minutos
- ✅ `velocidade-portal-01` - Portal do paciente vs PDF

**Quando usar:** Topo de funil, cold traffic

#### **Categoria 3: ECONOMIA (2 criativos)**
- ✅ `economia-preco-01` - R$ 47 vs R$ 150+
- ✅ `economia-roi-01` - ROI de 12x

**Quando usar:** Comparação direta, search ads

#### **Categoria 4: TECNOLOGIA (2 criativos)**
- ✅ `tech-ia-moderna-01` - IA vs software antigo
- ✅ `tech-mobile-01` - Mobile first

**Quando usar:** Early adopters, audiências tech

#### **Categoria 5: AUTORIDADE (2 criativos)**
- ✅ `autoridade-social-proof-01` - 847 nutris migraram
- ✅ `autoridade-nutris-01` - Feito POR nutricionistas

**Quando usar:** Meio de funil, nurturing

#### **Categoria 6: EXCLUSIVIDADE (1 criativo)**
- ✅ `exclusividade-vagas-01` - Vagas limitadas

**Quando usar:** Final de campanhas, escassez

---

## 📊 Estratégia de Teste A/B (3 Fases)

### **Fase 1: Descoberta (Dias 1-7)**
- **Budget:** R$ 70/dia (R$ 490 total)
- **Criativos:** 3 melhores de categorias diferentes
  - `dor-planilhas-01` (Dor)
  - `velocidade-ia-01` (Velocidade)
  - `economia-preco-01` (Economia)
- **Objetivo:** Identificar qual ângulo tem melhor CTR
- **Métricas:** CTR > 2.5%, CPC < R$ 3.50

### **Fase 2: Otimização (Dias 8-21)**
- **Budget:** R$ 100/dia (R$ 1.400 total)
- **Criativos:** Top 2 da Fase 1 + 2 variações
- **Objetivo:** Otimizar para conversões
- **Métricas:** Conversion Rate > 8%, CPL < R$ 45

### **Fase 3: Escala (Dias 22-30)**
- **Budget:** R$ 150/dia (R$ 1.350 total)
- **Criativos:** Winner + retargeting
- **Objetivo:** Maximizar volume de signups
- **Métricas:** ROAS > 5x, CAC < R$ 120

**Total investido:** R$ 3.240 em 30 dias

---

## 🎯 Segmentações Específicas

### **Facebook/Instagram Ads**

#### **Audiência 1: Concorrentes Diretos**
```json
{
  "name": "Nutris usando concorrentes",
  "interests": ["Nutrição", "Saúde", "Fitness"],
  "job_titles": ["Nutricionista", "Nutri"],
  "exclude": ["Estudante de Nutrição"],
  "age": "25-50",
  "locations": ["SP", "RJ", "MG", "PR", "DF"],
  "behavior": "Small business owners"
}
```

#### **Audiência 2: Lookalike de Insatisfeitos**
```json
{
  "name": "Lookalike nutris insatisfeitos",
  "source": "Engajou com posts sobre 'trocar de software'",
  "percentage": "1-3%",
  "countries": ["BR"]
}
```

#### **Audiência 3: Retargeting Quente**
```json
{
  "name": "Visitou site mas não converteu",
  "pixel_events": ["ViewContent", "AddToCart"],
  "exclude": ["CompleteRegistration"],
  "time_window": "30 dias"
}
```

### **Google Ads (Search)**

#### **Campanha 1: Marca Concorrentes**
```
Keywords:
- "alternativa [Concorrente A]"
- "melhor que [Concorrente B]"
- "[Concorrente C] vs NutriFlow"
- "migrar do [Concorrente D]"

Match Type: Phrase match
CPC Max: R$ 8.00
```

#### **Campanha 2: Intenção de Compra**
```
Keywords:
- "software para nutricionista"
- "sistema consultório nutrição"
- "app nutricionista com IA"
- "software cardápio automatico"

Match Type: Broad match modifier
CPC Max: R$ 6.00
```

---

## 💡 Gatilhos Psicológicos Usados

### **Principais (presentes em todos)**
1. ✅ **Contraste** - Antes/Depois, Velho/Novo
2. ✅ **Prova Social** - "847 nutricionistas migraram"
3. ✅ **Escassez** - "200 vagas/mês", "53 restantes"
4. ✅ **Autoridade** - "Feito por nutricionistas"

### **Secundários (por criativo)**
- **FOMO** - Medo de ficar pra trás
- **Urgência** - "Janeiro acabando"
- **Reciprocidade** - "Migração grátis"
- **Ancoragem** - "R$ 47 vs R$ 197"

---

## 🚀 Implementação Técnica

### **Passo 1: Configurar Pixel do Meta**
```html
<!-- Adicionar no <head> do site -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'SEU_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

### **Passo 2: Eventos de Conversão**
```typescript
// Signup completo
fbq('track', 'CompleteRegistration', {
  content_name: 'NutriFlow Signup',
  value: 47.00,
  currency: 'BRL'
});

// Trial iniciado
fbq('track', 'StartTrial', {
  predicted_ltv: 564.00, // 12 meses * R$47
  currency: 'BRL'
});

// Primeiro pagamento
fbq('track', 'Purchase', {
  value: 47.00,
  currency: 'BRL'
});
```

### **Passo 3: Criar Campanhas no Meta Ads**

#### **Estrutura da Campanha**
```
📁 Campanha: NutriFlow - Aquisição Nutris 2026
  📂 Ad Set 1: Cold Traffic - Dor
    📄 Ad 1: dor-planilhas-01
    📄 Ad 2: dor-insatisfacao-01
  
  📂 Ad Set 2: Cold Traffic - Velocidade
    📄 Ad 1: velocidade-ia-01
    📄 Ad 2: velocidade-portal-01
  
  📂 Ad Set 3: Warm Traffic - Economia
    📄 Ad 1: economia-preco-01
    📄 Ad 2: economia-roi-01
  
  📂 Ad Set 4: Retargeting
    📄 Ad 1: exclusividade-vagas-01
    📄 Ad 2: autoridade-social-proof-01
```

---

## 📈 Métricas de Sucesso

### **Benchmarks do Setor SaaS B2B Brasil**
| Métrica | Target NutriFlow | Média Setor | Excelente |
|---------|------------------|-------------|-----------|
| **CTR** | > 2.5% | 1.8% | > 3.5% |
| **CPC** | < R$ 3.50 | R$ 4.20 | < R$ 2.50 |
| **CPL** | < R$ 45 | R$ 65 | < R$ 30 |
| **CR** | > 8% | 4-6% | > 12% |
| **CAC** | < R$ 120 | R$ 180 | < R$ 90 |
| **ROAS** | > 5x | 3-4x | > 8x |

### **Dashboard de Acompanhamento**
```
Diário:
- Impressões, Cliques, CTR, CPC
- Budget gasto vs budget planejado
- Signups, CPL

Semanal:
- Conversão trial → pago
- CAC vs LTV
- ROAS
- Análise por criativo

Mensal:
- MRR gerado pela campanha
- Churn dos novos clientes
- Payback period
- ROI final
```

---

## 🎬 Próximos Passos

### **Semana 1**
- [ ] Configurar Pixel do Meta
- [ ] Criar audiências no Business Manager
- [ ] Gerar imagens dos criativos (Midjourney/DALL-E)
- [ ] Subir 3 primeiros anúncios (Fase 1)

### **Semana 2**
- [ ] Analisar resultados da Fase 1
- [ ] Pausar criativos com CTR < 1.5%
- [ ] Aumentar budget nos winners
- [ ] Iniciar Fase 2

### **Semana 3-4**
- [ ] Configurar retargeting
- [ ] Testar variações de copy
- [ ] Otimizar landing page
- [ ] Escalar budget (Fase 3)

---

## 🛠️ Ferramentas Necessárias

### **Essenciais**
- ✅ Meta Business Manager (Facebook Ads)
- ✅ Meta Pixel instalado
- ✅ Google Analytics 4
- ✅ Hotjar ou Clarity (heatmaps)

### **Recomendadas**
- 📊 **Supermetrics** - Consolidar dados
- 🎨 **Canva Pro** - Criar variações de imagens
- 📈 **Hyros** - Attribution tracking avançado
- 💬 **Typeform** - Pesquisa com nutris

### **Nice to Have**
- 🤖 **Smartly.io** - Automação de ads
- 📧 **Klaviyo** - Email nurturing
- 🔔 **Intercom** - Chat no site
- 📱 **Manychat** - WhatsApp automation

---

## 💰 Projeção Financeira (30 dias)

### **Cenário Conservador**
```
Budget: R$ 3.000
CTR: 2.0%
CPC: R$ 4.00
Clicks: 750
CR: 6%
Signups: 45
CPL: R$ 67
Trial→Paid: 40%
Novos Clientes: 18
MRR Gerado: R$ 846
CAC: R$ 167
Payback: 3.5 meses
```

### **Cenário Realista**
```
Budget: R$ 3.000
CTR: 2.5%
CPC: R$ 3.50
Clicks: 857
CR: 8%
Signups: 69
CPL: R$ 43
Trial→Paid: 50%
Novos Clientes: 35
MRR Gerado: R$ 1.645
CAC: R$ 86
Payback: 1.8 meses
```

### **Cenário Otimista**
```
Budget: R$ 3.000
CTR: 3.5%
CPC: R$ 2.50
Clicks: 1.200
CR: 12%
Signups: 144
CPL: R$ 21
Trial→Paid: 60%
Novos Clientes: 86
MRR Gerado: R$ 4.042
CAC: R$ 35
Payback: 0.7 meses
```

---

## ⚠️ Red Flags (Quando Pausar)

### **Pausar anúncio se:**
- CTR < 1.0% após 1.000 impressões
- CPC > R$ 6.00 consistentemente
- CPL > R$ 80
- Bounce rate no site > 70%
- Tempo na página < 30 segundos

### **Pausar campanha se:**
- Budget 50% gasto sem nenhum signup
- ROAS < 1x após R$ 500 gastos
- Qualidade dos leads muito baixa
- Site fora do ar / bugs críticos

---

## 📞 Suporte e Recursos

### **Arquivos Criados**
- ✅ `/src/data/paid-traffic-creatives.ts` - 12 criativos completos
- ✅ `/src/components/PaidTrafficCreativePreview.tsx` - Visualização
- ✅ `/src/services/paid-traffic-agent.ts` - Agente IA
- ✅ Este arquivo - Guia de implementação

### **Próximos Arquivos a Criar**
- [ ] `/src/data/ad-images-prompts.md` - Prompts para Midjourney
- [ ] `/src/data/landing-page-copy.md` - Copy da LP
- [ ] `/src/data/email-sequences.md` - Emails de nurturing

---

**Criado em:** Outubro 2026  
**Status:** ✅ Pronto para implementação  
**Responsável:** Time de Marketing NutriFlow
