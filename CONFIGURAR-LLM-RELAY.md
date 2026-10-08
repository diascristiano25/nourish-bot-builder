# 🔑 Configurar LLM_RELAY_API_KEY no Supabase

## Passo a Passo:

1. **Acesse Edge Functions > Secrets**
   - URL: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/functions

2. **Adicione o Secret:**
   - Nome: `LLM_RELAY_API_KEY`
   - Valor: Sua API key do LLM Relay
   
3. **Clique em "Add Secret"**

---

## 📋 Depois de Configurar:

Teste novamente:
```bash
npx tsx test-edge-function.ts
```

---

## ℹ️ Informações:

- ✅ Edge Function atualizada para usar LLM Relay
- ✅ Modelo: `anthropic/claude-3-5-sonnet-20241022`
- ✅ Endpoint: `https://llmrelay.com/v1/chat/completions`
- ⏳ Falta: Configurar a LLM_RELAY_API_KEY no Supabase

**Você tem a API key do LLM Relay?**
