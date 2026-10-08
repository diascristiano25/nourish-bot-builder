# ✅ Edge Function Deployada com Sucesso!

## Status Atual

✅ **Edge Function `generate-meal-plan` foi deployada para produção**
- Projeto: FlowNutri (nwenbxqmfpyspxpibgwp)
- Dashboard: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/functions

## ⚠️ Próximo Passo CRÍTICO: Configurar LOVABLE_API_KEY

A função foi deployada, mas ainda precisa da variável de ambiente `LOVABLE_API_KEY` para funcionar.

### Como Configurar:

1. **Acesse o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/settings/functions
   ```

2. **Vá para Edge Functions > Secrets**

3. **Adicione um novo Secret:**
   - Nome: `LOVABLE_API_KEY`
   - Valor: Sua chave da API Lovable AI Gateway

4. **Salve as alterações**

### Alternativa: Usar OpenAI

Se você não tem uma chave da Lovable AI Gateway, pode modificar a função para usar OpenAI:

```bash
# 1. Editar a função localmente
# Abra: supabase/functions/generate-meal-plan/index.ts

# 2. Substituir:
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
// por:
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

# 3. Mudar a URL:
'https://ai.gateway.lovable.dev/v1/chat/completions'
// para:
'https://api.openai.com/v1/chat/completions'

# 4. Fazer deploy novamente:
npx supabase functions deploy generate-meal-plan --project-ref nwenbxqmfpyspxpibgwp

# 5. Adicionar OPENAI_API_KEY no Dashboard do Supabase
```

### Como Testar Após Configurar

1. **Recarregue a aplicação** (para pegar a função atualizada)
2. **Vá para Configurações do Cardápio**
3. **Clique em "Gerar Cardápio"**
4. **Verifique se o erro CORS desapareceu**

### Verificação Rápida

Você pode testar a função via CLI:

```bash
npx supabase functions invoke generate-meal-plan \
  --project-ref nwenbxqmfpyspxpibgwp \
  --body '{
    "patientId": "test-patient",
    "preferences": {
      "dietType": "balanced",
      "allergies": [],
      "cuisinePreferences": ["brasileira"]
    },
    "restrictions": [],
    "calorieTarget": 2000
  }'
```

## Resumo da Solução

✅ Edge Function deployada
⏳ Aguardando configuração da API key
📝 Após configurar, a geração de cardápios funcionará

**Precisa de ajuda para configurar a API key ou migrar para OpenAI?**
