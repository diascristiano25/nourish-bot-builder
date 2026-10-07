-- ========================================
-- SOLUÇÃO DEFINITIVA - RECRIAR PROFILES
-- ========================================
-- Este script vai:
-- 1. Dropar e recriar a tabela profiles com TODAS as colunas
-- 2. Criar perfis para todos os usuários existentes
-- 3. Configurar segurança e permissões
-- ========================================

-- PASSO 1: Dropar tabela antiga (se existir)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- PASSO 2: Criar tabela profiles COMPLETA
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    crn TEXT,
    phone TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#10B981',
    secondary_color TEXT DEFAULT '#059669',
    email_signature TEXT,
    has_seen_onboarding BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    account_status TEXT DEFAULT 'active',
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 3: Criar índices para performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- PASSO 4: Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Criar políticas de segurança
CREATE POLICY "Usuários podem ver próprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir próprio perfil"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- PASSO 6: Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- PASSO 7: Criar perfis para TODOS os usuários existentes
INSERT INTO public.profiles (user_id, full_name, crn, is_admin)
SELECT
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        SPLIT_PART(u.email, '@', 1)
    ) as full_name,
    NULL as crn,
    false as is_admin
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;

-- PASSO 8: Verificar resultado
SELECT
    p.id,
    p.user_id,
    p.full_name,
    p.crn,
    p.phone,
    p.is_active,
    p.trial_ends_at,
    p.created_at,
    u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
ORDER BY p.created_at DESC;
