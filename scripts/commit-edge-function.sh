#!/bin/bash

# Script para criar um commit com as mudanças da Edge Function

echo "📦 Preparando commit da Edge Function..."

# Adicionar apenas os arquivos relacionados à Edge Function
git add supabase/functions/generate-meal-plan/index.ts
git add .env.example
git add DEPLOY-CONCLUIDO.md
git add GUIA-CONFIGURACAO-OPENAI.md
git add PROXIMOS-PASSOS.md

# Criar commit
git commit -m "feat: Migrar Edge Function para OpenAI

- Substituir Lovable AI Gateway por OpenAI (GPT-4o-mini)
- Adicionar documentação de configuração da OPENAI_API_KEY
- Atualizar .env.example com instruções detalhadas
- Adicionar guias de próximos passos e configuração

Após este commit:
1. Configure OPENAI_API_KEY no Supabase Dashboard
2. Teste a geração de cardápios
3. Veja GUIA-CONFIGURACAO-OPENAI.md para detalhes"

echo "✅ Commit criado com sucesso!"
echo ""
echo "Para fazer push:"
echo "  git push origin main"
