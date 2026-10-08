#!/bin/bash

echo "🔧 Corrigindo colunas restantes..."

# water_logs: date → logged_at
echo "📝 water_logs: date → logged_at"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -exec grep -l "water_logs" {} \; \
  -exec sed -i 's/\bdate\b/logged_at/g' {} \;

# appointments: date_time → scheduled_at
echo "📝 appointments: date_time → scheduled_at"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -exec grep -l "appointments" {} \; \
  -exec sed -i 's/date_time/scheduled_at/g' {} \;

# support_tickets: message → description
echo "📝 support_tickets: message → description"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -exec grep -l "support_tickets" {} \; \
  -exec sed -i 's/\bmessage:/description:/g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -exec grep -l "support_tickets" {} \; \
  -exec sed -i 's/\.message\b/.description/g' {} \;

# meal_plans: patient_id → nutritionist_id (assumindo que é o correto)
echo "📝 meal_plans: ajustando referências"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -exec grep -l "meal_plans" {} \; \
  -exec sed -i 's/patient_id:/user_id:/g' {} \;

echo "✅ Correções aplicadas!"
echo ""
echo "⚠️  COLUNAS QUE NÃO EXISTEM (remova manualmente):"
echo "   - water_logs.goal_ml"
echo "   - support_tickets.ticket_number"
echo "   - support_tickets.attachment_url"
echo "   - meal_plans.plan_data"
echo "   - meal_plans.is_active"
echo "   - profiles.trial_start_date"
echo "   - profiles.trial_ended"
