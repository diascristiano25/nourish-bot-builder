-- SCRIPT COMPLETO PARA CORRIGIR SUPABASE SCHEMA
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Remover tabela profiles antiga se existir
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. Criar tabela profiles corretamente
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de segurança
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 6. Criar função para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Remover trigger antigo se existir e criar novo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_plan, subscription_status);

-- 9. Criar usuário de teste
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Verificar se usuário já existe
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'teste@nutriflow.com';

  IF new_user_id IS NULL THEN
    -- Criar novo usuário
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'teste@nutriflow.com',
      crypt('Teste123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Usuário Teste"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO new_user_id;

    RAISE NOTICE 'Novo usuário criado com ID: %', new_user_id;
  ELSE
    -- Resetar senha do usuário existente
    UPDATE auth.users
    SET
      encrypted_password = crypt('Teste123!', gen_salt('bf')),
      email_confirmed_at = NOW(),
      updated_at = NOW()
    WHERE id = new_user_id;

    RAISE NOTICE 'Senha resetada para usuário existente: %', new_user_id;
  END IF;

  -- Criar ou atualizar profile
  INSERT INTO public.profiles (id, email, full_name, subscription_plan, subscription_status)
  VALUES (
    new_user_id,
    'teste@nutriflow.com',
    'Usuário Teste',
    'free',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = 'Usuário Teste',
    subscription_plan = 'free',
    subscription_status = 'active',
    updated_at = NOW();

  RAISE NOTICE 'Profile criado/atualizado com sucesso!';
END $$;

-- 10. Verificar resultados
SELECT 'Usuários criados:' as info, COUNT(*) as count FROM auth.users;
SELECT 'Profiles criados:' as info, COUNT(*) as count FROM public.profiles;
SELECT 'Usuário teste:' as info, id, email, email_confirmed_at FROM auth.users WHERE email = 'teste@nutriflow.com';
