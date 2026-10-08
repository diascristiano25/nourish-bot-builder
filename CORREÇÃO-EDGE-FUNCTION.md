# Correção: Edge Function generate-meal-plan

## Problema Identificado

A função `generate-meal-plan` está retornando erro CORS e 400 porque:
- ❌ A Edge Function não está rodando (nem local nem em produção)
- ❌ A variável de ambiente `LOVABLE_API_KEY` não está configurada
- ❌ Tentativas de fetch estão falhando com CORS

## Solução: 2 Opções

### Opção 1: Deploy em Produção (Recomendado)

```bash
# 1. Login no Supabase CLI
npx supabase login

# 2. Link com seu projeto (se ainda não estiver linkado)
npx supabase link --project-ref SEU_PROJECT_REF

# 3. Deploy da função
npx supabase functions deploy generate-meal-plan

# 4. Configurar variável de ambiente no Supabase Dashboard
# Vá para: Project Settings > Edge Functions > Secrets
# Adicione: LOVABLE_API_KEY = sua_chave_aqui
```

**Depois do deploy:**
```bash
# Testar a função
npx supabase functions invoke generate-meal-plan \
  --body '{"patientId":"test","preferences":{},"restrictions":[]}'
```

### Opção 2: Desenvolvimento Local

```bash
# 1. Iniciar Supabase local
npx supabase start

# 2. Em outro terminal, servir a função localmente
npx supabase functions serve generate-meal-plan --env-file .env.local

# 3. Adicionar ao .env.local:
# LOVABLE_API_KEY=sua_chave_aqui
```

## Verificação

Após configurar, teste no navegador:
1. Abra as Configurações do Cardápio
2. Clique em "Gerar Cardápio"
3. Verifique se não há mais erros CORS

## Notas Importantes

- **LOVABLE_API_KEY**: Esta é a chave da Lovable AI Gateway
- Se você não tem essa chave, precisará:
  - Usar outra API de IA (OpenAI, Anthropic, etc.)
  - Modificar a função para usar outra API

## Alternativa: Mudar para OpenAI

Se preferir usar OpenAI em vez da Lovable Gateway:

1. Modifique `supabase/functions/generate-meal-plan/index.ts`:
```typescript
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  // ... resto do código
});
```

2. Configure `OPENAI_API_KEY` em vez de `LOVABLE_API_KEY`
