# 🎯 Quick Start - Agent de Tráfego Pago

## ⚡ Setup Rápido (5 minutos)

### 1. Adicione a API Key do Gemini

```bash
# .env.local
VITE_GEMINI_API_KEY=AIzaSy...
```

### 2. Acesse o Dashboard

```
http://localhost:5173/trafego-pago
```

### 3. Preencha o Contexto

- Nome do negócio: NutriFlow
- Setor: Saúde e Nutrição
- Público: Nutricionistas brasileiras
- Serviço: SaaS de gestão com IA
- Diferencial: Cardápios automáticos

### 4. Clique em "Gerar Estratégia"

**Pronto!** Em 15 segundos você terá:
- ✅ Estratégia completa de campanha
- ✅ 3 anúncios prontos para usar
- ✅ Análise de mercado
- ✅ Resultados esperados

---

## 🚀 Modo Avançado (Criação Automática)

### Obter Credenciais Meta Ads

1. Acesse: https://business.facebook.com/settings/ad-accounts
2. Copie o **Ad Account ID** (ex: `act_123456789`)
3. Vá em: https://developers.facebook.com/tools/explorer/
4. Permissões: `ads_management`, `ads_read`
5. Gere o **Access Token**

### Configure

```bash
# .env.local
VITE_META_ACCESS_TOKEN=EAAG...
VITE_META_AD_ACCOUNT_ID=act_123456789
```

### Use

Agora o agent vai **criar a campanha automaticamente** no Meta Ads! 🎉

---

## 💰 Quanto Custa?

### Gemini API
- Grátis até 1.500 requests/dia
- Custo: ~$0.001 por estratégia

### Meta Ads
- Você controla o budget
- Recomendado: R$ 50-100/dia para começar

---

## 📊 Exemplo de Resultado

```
Campaign: NutriFlow - Nutricionistas SP
Budget: R$ 75/dia (30 dias)
Targeting: Mulheres 28-42, SP/RJ
Objective: Leads

Expected Results:
- 60.000 impressões
- 1.800 cliques
- 45 leads qualificados
- CPL: ~R$ 50
```

---

## ❓ FAQ

**Q: Preciso ter conta Meta Ads?**
A: Não! Você pode gerar estratégias sem Meta Ads. A integração é opcional.

**Q: As campanhas são ativadas automaticamente?**
A: Não. Elas são criadas PAUSADAS para você revisar primeiro.

**Q: Funciona para outros negócios além do NutriFlow?**
A: Sim! É genérico. Só mudar o contexto do negócio.

**Q: Posso usar para Google Ads?**
A: Ainda não. Roadmap futuro.

---

## 🐛 Problemas Comuns

### "VITE_GEMINI_API_KEY não configurada"
→ Adicione a chave no `.env.local`

### "MetaAdsService not initialized"
→ Normal se você não configurou Meta Ads. A estratégia ainda é gerada.

### "Invalid OAuth Access Token"
→ Token expirado. Gere um novo no Graph API Explorer.

---

**Dica Final**: Comece SEM Meta Ads. Gere estratégias, valide os criativos, depois integre a criação automática! 🚀
