#!/bin/bash

# Script para corrigir nomes de colunas no código para bater com o database.types.ts

echo "🔧 Corrigindo nomes de colunas..."

# 1. weight_logs: recorded_at → measured_at
echo "📝 Corrigindo recorded_at → measured_at"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/recorded_at/measured_at/g' {} \;

# 2. water_logs: quantity_ml → amount_ml
echo "📝 Corrigindo quantity_ml → amount_ml"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/quantity_ml/amount_ml/g' {} \;

# 3. support_ticket_messages: sender_type → is_staff_reply
echo "📝 Corrigindo sender_type → is_staff_reply"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/sender_type/is_staff_reply/g' {} \;

echo "✅ Correções aplicadas!"
echo ""
echo "⚠️  ATENÇÃO: Alguns campos foram removidos do banco:"
echo "   - water_logs.goal_ml (não existe)"
echo "   - support_tickets.ticket_number (não existe)"
echo "   - support_tickets.attachment_url (não existe)"
echo "   - support_tickets.message → description"
echo ""
echo "Você precisará revisar manualmente esses casos."
