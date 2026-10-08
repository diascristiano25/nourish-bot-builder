-- ============================================
-- ALTERNATIVA: Regenerar TypeScript Types do Supabase
-- Execute DEPOIS de rodar os SQLs anteriores
-- ============================================

-- Este comando vai regenerar src/integrations/supabase/types.ts
-- Execute no TERMINAL (não no SQL Editor):

npx supabase gen types typescript --project-id rwenbxqmfpvysxpplbqop > src/integrations/supabase/types.ts

-- Depois, reinicie o dev server:
# Ctrl+C para parar
# npm run dev para reiniciar
