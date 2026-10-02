#!/bin/bash

# 🎯 Script de Teste - Agent de Tráfego Pago

echo "================================================"
echo "🤖 TESTANDO AGENT DE TRÁFEGO PAGO"
echo "================================================"
echo ""

# Verificar se o .env.local existe
if [ ! -f .env.local ]; then
    echo "❌ Arquivo .env.local não encontrado!"
    echo "📝 Crie o arquivo .env.local com:"
    echo ""
    echo "VITE_GEMINI_API_KEY=sua_chave_aqui"
    echo ""
    exit 1
fi

# Verificar se a chave do Gemini está configurada
if ! grep -q "VITE_GEMINI_API_KEY" .env.local; then
    echo "⚠️  VITE_GEMINI_API_KEY não encontrada no .env.local"
    echo "📝 Adicione a linha:"
    echo ""
    echo "VITE_GEMINI_API_KEY=sua_chave_aqui"
    echo ""
    exit 1
fi

echo "✅ Configurações OK!"
echo ""
echo "🚀 Iniciando servidor de desenvolvimento..."
echo ""
echo "📍 Acesse: http://localhost:5173/trafego-pago"
echo ""
echo "📝 Passos para testar:"
echo "  1. Preencha o contexto do negócio (já vem pré-preenchido)"
echo "  2. Clique em 'Gerar Estratégia de Campanha'"
echo "  3. Aguarde ~15 segundos"
echo "  4. Veja a estratégia na aba 'Estratégia'"
echo "  5. Veja a análise na aba 'Análise'"
echo ""
echo "================================================"
echo ""

bun run dev
