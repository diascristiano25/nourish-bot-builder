#!/bin/bash

# Script para verificar e corrigir problemas de autenticação do NutriFlow

echo "🔍 Verificando configuração do Supabase..."
echo ""

# Verificar se as variáveis de ambiente estão configuradas
if [ -f ".env.local" ]; then
    echo "✅ Arquivo .env.local encontrado"

    # Extrair a URL do Supabase
    SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d '=' -f2)
    SUPABASE_PROJECT=$(echo $SUPABASE_URL | sed 's/https:\/\///' | cut -d '.' -f1)

    echo "📋 Projeto Supabase: $SUPABASE_PROJECT"
    echo ""
else
    echo "❌ Arquivo .env.local não encontrado!"
    exit 1
fi

echo "📝 AÇÕES NECESSÁRIAS:"
echo ""
echo "1️⃣ Acesse o Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/$SUPABASE_PROJECT"
echo ""
echo "2️⃣ Vá para: Authentication > Settings"
echo ""
echo "3️⃣ Na seção 'Email Auth', DESABILITE:"
echo "   [ ] Enable email confirmations"
echo ""
echo "4️⃣ Execute este SQL no SQL Editor:"
echo "   UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;"
echo ""
echo "5️⃣ Salve as configurações"
echo ""
echo "🧪 Depois de fazer isso, teste o login em:"
echo "   Local: http://localhost:8080/auth"
echo "   Produção: https://nutriflow2026.netlify.app/auth"
echo ""
echo "✅ Após testar, você deve conseguir:"
echo "   - Criar novas contas sem confirmar email"
echo "   - Fazer login com contas existentes"
echo "   - Acessar o dashboard automaticamente"
echo ""
