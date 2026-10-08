# 🔑 Guia de Configuração da OpenAI API

## Status Atual
✅ Edge Function deployada com sucesso
❌ Chave OpenAI não configurada (causa dos erros 500)

## Passos para Configurar

### 1. Obter Chave da OpenAI
1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave (começa com `sk-`)

### 2. Configurar no Supabase (Produção)
```bash
# No terminal, execute:
npx supabase secrets set OPENAI_API_KEY=sua-chave-aqui --project-ref nwenbxqmfpyspxpibgwp
```

### 3. Configurar Localmente (Desenvolvimento)
```bash
# Crie o arquivo .env na pasta da função:
cd supabase/functions/generate-meal-plan
echo "OPENAI_API_KEY=sua-chave-aqui" > .env
```

### 4. Testar a Função
Após configurar, teste novamente no formulário de geração de cardápio.

## Custos Estimados
- Modelo usado: **gpt-4o-mini**
- Custo por cardápio: ~$0.01 - $0.02 USD
- 100 cardápios: ~$1.00 - $2.00 USD

## Troubleshooting

### Erro "Missing OpenAI API key"
→ Configure a chave seguindo o passo 2 acima

### Erro "401 Unauthorized"
→ Verifique se a chave está correta e válida

### Erro "429 Rate Limit"
→ Você excedeu o limite de requisições. Aguarde alguns minutos.

## Verificar Configuração
```bash
# Ver secrets configurados:
npx supabase secrets list --project-ref nwenbxqmfpyspxpibgwp
```

## Próximos Passos
Depois de configurar a chave OpenAI:
1. ✅ Testar geração de cardápio
2. ✅ Validar formato da resposta
3. ✅ Ajustar prompts se necessário
