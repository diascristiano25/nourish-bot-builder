# 🎉 Edge Function Atualizada e Deployada!

## ✅ O que foi feito

1. ✅ Edge Function `generate-meal-plan` modificada para usar **OpenAI** (GPT-4o-mini)
2. ✅ Deploy realizado com sucesso no Supabase
3. ⏳ **Falta apenas**: Configurar a chave da API OpenAI

## 🔑 Como Configurar a API Key da OpenAI

### Passo 1: Obter uma chave da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave (ela começa com `sk-`)

**Importante:** A chave só é mostrada uma vez. Guarde-a em local seguro.

### Passo 2: Adicionar a chave no Supabase

1. **Acesse o Dashboard do Supabase:**
   ```
   https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/settings/functions
   ```

2. **No menu lateral, vá em:**
   - Settings → Edge Functions → Secrets
   - Ou acesse diretamente: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/settings/functions

3. **Adicione um novo Secret:**
   - Clique em "Add new secret" ou "New secret"
   - **Nome:** `OPENAI_API_KEY`
   - **Valor:** Cole sua chave da OpenAI (sk-...)
   - Clique em "Save" ou "Add secret"

### Passo 3: Testar a Função

Após configurar a chave:

1. **Recarregue sua aplicação** no navegador
2. **Vá para "Configurações do Cardápio"** (ícone de raio ⚡)
3. **Preencha os dados do paciente**
4. **Clique em "Gerar Cardápio"**
5. **Aguarde a geração** (pode levar 10-30 segundos)

### 💰 Custos da OpenAI

- **GPT-4o-mini** é o modelo mais barato da OpenAI
- Custo aproximado: **$0.15 por 1 milhão de tokens de entrada**
- Para cada cardápio: aproximadamente $0.001 - $0.005 (menos de 1 centavo)
- OpenAI oferece **$5 de créditos grátis** para novos usuários

### 🧪 Testar via CLI (Opcional)

Você pode testar a função diretamente pelo terminal:

```bash
npx supabase functions invoke generate-meal-plan \
  --project-ref nwenbxqmfpyspxpibgwp \
  --body '{
    "patientId": "test-123",
    "name": "João Silva",
    "age": 30,
    "weight": 75,
    "height": 175,
    "goal": "Perda de peso",
    "targetCalories": 1800,
    "allergies": ["Lactose"],
    "dietaryRestrictions": []
  }'
```

### ❌ Solução de Problemas

**Se ainda der erro após configurar:**

1. **Verifique se a chave está correta:**
   - Acesse o Dashboard do Supabase
   - Vá em Settings → Edge Functions → Secrets
   - Confirme que `OPENAI_API_KEY` está lá

2. **Aguarde 1-2 minutos** após salvar a secret (pode levar um tempo para propagar)

3. **Limpe o cache do navegador** e recarregue a página

4. **Verifique os logs da função:**
   - Dashboard: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/functions/generate-meal-plan
   - Clique na função e veja os "Logs"

### 📝 Resumo Final

✅ Função deployada com OpenAI  
⏳ Configure `OPENAI_API_KEY` no Supabase Dashboard  
🎯 Teste a geração de cardápios  

**Link direto para configurar:** https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/settings/functions

---

**Precisa de ajuda para obter a chave da OpenAI ou configurar no Supabase? Me avise!**
