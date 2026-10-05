#!/bin/bash

# Vercel Cache Purge via API
# Precisa do VERCEL_TOKEN

echo "Para limpar o cache do Vercel, você precisa:"
echo ""
echo "1. Gerar VERCEL_TOKEN em:"
echo "   https://vercel.com/account/tokens"
echo ""
echo "2. Rodar:"
echo "   export VERCEL_TOKEN=seu_token_aqui"
echo "   curl -X POST https://api.vercel.com/v12/purge \\"
echo "     -H 'Authorization: Bearer $VERCEL_TOKEN' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"domain\": \"nutriflow.inf.br\"}'"
echo ""
echo "3. Depois acessa: https://nutriflow.inf.br (Ctrl+Shift+R)"
