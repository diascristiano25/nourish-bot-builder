-- SOLUÇÃO FINAL: Criar estrutura COMPLETA da tabela profiles

-- 1. Dropar a tabela se existir (CUIDADO: vai apagar dados!)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Criar tabela profiles com TODAS as colunas necessárias
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Criar índices para performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 6. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Inserir perfis para os usuários existentes
INSERT INTO public.profiles (user_id, full_name, crn)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', email),
    NULL
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- 8. Verificar resultado
SELECT
    p.id,
    p.user_id,
    p.full_name,
    p.crn,
    p.created_at,
    u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
ORDER BY p.created_at DESC;
