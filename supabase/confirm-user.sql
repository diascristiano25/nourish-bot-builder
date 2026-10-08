-- Script para confirmar usuários existentes sem precisar de service_role key
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Confirmar o usuário teste@teste.com
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'alguem@teste.com';

-- Verificar se funcionou
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'alguem@teste.com';
