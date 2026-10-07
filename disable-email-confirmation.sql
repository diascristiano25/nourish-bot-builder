-- Script para desabilitar confirmação de email obrigatória no Supabase
-- IMPORTANTE: Execute este script no SQL Editor do Supabase

-- 1. Confirmar todos os usuários existentes automaticamente
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Verificar resultado
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ Não confirmado'
  END as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- 3. Se você quiser permitir que usuários façam login sem confirmar email,
-- vá para: Authentication > Settings no Supabase Dashboard
-- E desabilite a opção "Enable email confirmations"
