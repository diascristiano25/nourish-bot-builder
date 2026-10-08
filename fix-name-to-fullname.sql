-- CORREÇÃO FINAL: Renomear coluna 'name' para 'full_name' na tabela patients
-- Execute no Supabase SQL Editor

-- Verificar se a coluna 'name' existe e renomeá-la para 'full_name'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'patients'
        AND column_name = 'name'
    ) THEN
        -- Renomear coluna name para full_name
        ALTER TABLE public.patients RENAME COLUMN name TO full_name;
        RAISE NOTICE 'Coluna name renomeada para full_name';
    ELSE
        -- Se name não existe, garantir que full_name existe
        ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT 'Sem nome';
        RAISE NOTICE 'Coluna full_name adicionada';
    END IF;
END $$;

-- Remover o default depois de criar
ALTER TABLE public.patients ALTER COLUMN full_name DROP DEFAULT;

-- Verificação
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patients'
AND column_name IN ('name', 'full_name')
ORDER BY column_name;
