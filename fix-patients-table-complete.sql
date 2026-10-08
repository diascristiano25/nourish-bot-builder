-- ===============================================
-- CORREÇÃO COMPLETA DA TABELA PATIENTS
-- Execute no Supabase SQL Editor
-- ===============================================

-- 1. Verificar se a tabela patients existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'patients') THEN
        -- Criar tabela completa se não existir
        CREATE TABLE public.patients (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            birth_date DATE,
            gender TEXT,
            goal TEXT,
            activity_level TEXT DEFAULT 'moderado',
            allergies TEXT[] DEFAULT '{}',
            dietary_restrictions TEXT[] DEFAULT '{}',
            medical_conditions TEXT,
            critical_tags TEXT[] DEFAULT '{}',
            notes TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- 2. Adicionar colunas que possam estar faltando (uma por vez)
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderado';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT '{}';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[] DEFAULT '{}';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS critical_tags TEXT[] DEFAULT '{}';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_patients_nutritionist_id ON public.patients(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_is_active ON public.patients(is_active);

-- 4. Configurar RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas
DROP POLICY IF EXISTS "Nutricionistas podem ver próprios pacientes" ON public.patients;
DROP POLICY IF EXISTS "Nutricionistas podem inserir pacientes" ON public.patients;
DROP POLICY IF EXISTS "Nutricionistas podem atualizar pacientes" ON public.patients;
DROP POLICY IF EXISTS "Nutricionistas podem deletar pacientes" ON public.patients;

-- Criar policies novas
CREATE POLICY "Nutricionistas podem ver próprios pacientes"
    ON public.patients FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

CREATE POLICY "Nutricionistas podem inserir pacientes"
    ON public.patients FOR INSERT
    WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

CREATE POLICY "Nutricionistas podem atualizar pacientes"
    ON public.patients FOR UPDATE
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

CREATE POLICY "Nutricionistas podem deletar pacientes"
    ON public.patients FOR DELETE
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

-- 5. Trigger para updated_at
DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Verificação final
SELECT
    COUNT(*) as total_patients,
    COUNT(full_name) as with_full_name,
    COUNT(activity_level) as with_activity_level,
    COUNT(email) as with_email
FROM public.patients;

SELECT 'Tabela patients corrigida com sucesso!' as status;
