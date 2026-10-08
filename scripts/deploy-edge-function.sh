#!/bin/bash

# Script para fazer deploy da Edge Function generate-meal-plan
# Este script usa o Supabase CLI para fazer deploy da função

echo "🚀 Iniciando deploy da Edge Function 'generate-meal-plan'..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

# Fazer login no Supabase (se necessário)
echo "🔐 Verificando autenticação..."
supabase login

# Fazer deploy da função
echo "📦 Fazendo deploy da função..."
supabase functions deploy generate-meal-plan

echo "✅ Deploy concluído!"
echo ""
echo "📝 Próximos passos:"
echo "1. Verifique se a função está rodando no Dashboard do Supabase"
echo "2. Configure as variáveis de ambiente no Supabase Dashboard:"
echo "   - LOVABLE_API_KEY (sua chave da API AI Gateway)"
echo "3. Teste a geração de cardápio novamente"
